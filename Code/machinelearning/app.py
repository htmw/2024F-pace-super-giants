import os
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from firebase_admin import credentials, firestore, initialize_app
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import joblib
from functools import wraps
import logging
import jwt
from typing import Dict, List, Optional, Tuple
import redis
import pickle

# Initialize Flask app with CORS
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Firebase
cred = credentials.Certificate("firebase_credentials.json")
initialize_app(cred)
db = firestore.client()

# Initialize Redis for caching
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    db=0,
    decode_responses=True
)

# Constants
CACHE_EXPIRATION = 3600  # 1 hour
MAX_RECOMMENDATIONS = 10
MIN_SIMILARITY_SCORE = 0.1

class RecommendationEngine:
    def __init__(self):
        self.tfidf = TfidfVectorizer(
            stop_words='english',
            max_features=5000,
            ngram_range=(1, 2)
        )
        self.rf_classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.scaler = StandardScaler()

    def preprocess_text_features(self, menu_items: List[Dict], user_preferences: Dict) -> Tuple[List[Dict], str]:
        """Process text features for menu items and user preferences"""
        try:
            for item in menu_items:
                dietary_tags = []
                if item.get('is_vegetarian'):
                    dietary_tags.append('vegetarian')
                if item.get('is_vegan'):
                    dietary_tags.append('vegan')
                if item.get('is_gluten_free'):
                    dietary_tags.append('gluten_free')

                item['features'] = (
                    f"{item['name']} {item.get('description', '')} "
                    f"{item.get('category', '')} {' '.join(dietary_tags)} "
                    f"{'spicy' if item.get('is_spicy') else 'mild'}"
                ).lower()

            dietary_prefs = user_preferences.get('dietary_restrictions', [])
            cuisine_prefs = user_preferences.get('favorite_cuisines', [])
            spice_pref = user_preferences.get('spice_preference', 'medium')

            user_feature = (
                f"{' '.join(cuisine_prefs)} {' '.join(dietary_prefs)} "
                f"{spice_pref}"
            ).lower()

            return menu_items, user_feature
        except Exception as e:
            logger.error(f"Error in preprocess_text_features: {str(e)}")
            raise

    def calculate_additional_features(self, menu_items: List[Dict], user_preferences: Dict) -> np.ndarray:
        """Calculate additional numerical features for recommendations"""
        try:
            features = []
            price_preference = user_preferences.get('price_range', 'medium')
            price_weights = {'low': 0, 'medium': 1, 'high': 2}

            for item in menu_items:
                price_match = abs(
                    price_weights[price_preference] -
                    price_weights.get(item.get('price_category', 'medium'))
                )

                rating_score = item.get('average_rating', 3.0)
                order_frequency = item.get('order_frequency', 0)

                features.append([
                    price_match,
                    rating_score,
                    order_frequency,
                    item.get('preparation_time', 30),
                    int(item.get('is_special', False))
                ])

            return self.scaler.fit_transform(np.array(features))
        except Exception as e:
            logger.error(f"Error in calculate_additional_features: {str(e)}")
            raise

    def get_recommendations(
        self,
        menu_items: List[Dict],
        user_feature: str,
        user_preferences: Dict,
        user_history: Optional[List[str]] = None
    ) -> List[Dict]:
        """Generate personalized recommendations using multiple algorithms"""
        try:
            # Text-based similarity
            item_features = [item['features'] for item in menu_items]
            item_features.append(user_feature)

            tfidf_matrix = self.tfidf.fit_transform(item_features)
            text_similarities = cosine_similarity(tfidf_matrix[-1:], tfidf_matrix[:-1])[0]

            # Additional features
            additional_features = self.calculate_additional_features(menu_items, user_preferences)

            # Combine similarities
            final_scores = []
            for idx, (text_sim, item) in enumerate(zip(text_similarities, menu_items)):
                # Base score from text similarity
                score = text_sim * 0.6

                # Additional feature contributions
                add_features = additional_features[idx]
                score += (add_features[1] / 5.0) * 0.2  # Rating contribution
                score += min(add_features[2] / 100, 1.0) * 0.1  # Order frequency contribution

                # Time-based adjustments
                current_hour = datetime.now().hour
                if item.get('peak_hours', []) and current_hour in item['peak_hours']:
                    score *= 1.2

                # Special item boost
                if item.get('is_special', False):
                    score *= 1.1

                # Seasonal adjustment
                if item.get('is_seasonal', False):
                    score *= 1.15

                final_scores.append((idx, score))

            # Sort by final score
            final_scores.sort(key=lambda x: x[1], reverse=True)

            # Filter recommendations
            recommendations = []
            for idx, score in final_scores:
                if score < MIN_SIMILARITY_SCORE:
                    continue

                item = menu_items[idx].copy()
                item['similarity_score'] = round(score, 3)
                recommendations.append(item)

                if len(recommendations) >= MAX_RECOMMENDATIONS:
                    break

            return recommendations
        except Exception as e:
            logger.error(f"Error in get_recommendations: {str(e)}")
            raise

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            token = token.split(' ')[1]
            data = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=['HS256'])
            current_user = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def cache_result(key_prefix, expiration=CACHE_EXPIRATION):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            cache_key = f"{key_prefix}:{request.json.get('user_id')}"

            # Try to get from cache
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return jsonify(pickle.loads(cached_result))

            # Get fresh result
            result = f(*args, **kwargs)

            # Cache the result
            redis_client.setex(
                cache_key,
                expiration,
                pickle.dumps(result.get_json())
            )

            return result
        return decorated
    return decorator

@app.route('/recommend', methods=['POST'])
@token_required
@cache_result('recommendations')
def recommend_dishes(current_user):
    try:
        # Input validation
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400

        data = request.get_json()
        user_id = data.get('user_id')

        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        # Get user data
        user_preferences = get_user_preferences(user_id)
        menu_items = get_menu_items()

        if not menu_items:
            return jsonify({"error": "No menu items found"}), 404

        # Get user history
        user_history = get_user_history(user_id)

        # Initialize recommendation engine
        engine = RecommendationEngine()

        # Process data and get recommendations
        processed_items, user_feature = engine.preprocess_text_features(menu_items, user_preferences)
        recommendations = engine.get_recommendations(
            processed_items,
            user_feature,
            user_preferences,
            user_history
        )

        # Record recommendation event
        record_recommendation_event(user_id, recommendations)

        return jsonify({
            "recommendations": recommendations,
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"Error in recommend_dishes: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/feedback', methods=['POST'])
@token_required
def record_feedback(current_user):
    try:
        feedback_data = request.get_json()
        required_fields = ('user_id', 'item_id', 'rating', 'interaction_type')

        if not all(k in feedback_data for k in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Validate rating
        if not 1 <= feedback_data['rating'] <= 5:
            return jsonify({"error": "Rating must be between 1 and 5"}), 400

        # Add timestamp and additional metadata
        feedback_data.update({
            'timestamp': datetime.now().isoformat(),
            'platform': request.headers.get('User-Agent'),
            'interaction_context': feedback_data.get('context', 'direct')
        })

        # Store feedback
        feedback_ref = db.collection('feedback').document()
        feedback_ref.set(feedback_data)

        # Update item statistics
        update_item_statistics(feedback_data)

        # Trigger recommendation model update if needed
        check_and_update_model()

        return jsonify({
            "message": "Feedback recorded successfully",
            "feedback_id": feedback_ref.id
        }), 201

    except Exception as e:
        logger.error(f"Error in record_feedback: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

def get_user_history(user_id: str) -> List[str]:
    """Get user's order history"""
    try:
        history_ref = db.collection('orders').where('user_id', '==', user_id).limit(50)
        history = [doc.to_dict() for doc in history_ref.stream()]
        return [item['item_id'] for order in history for item in order.get('items', [])]
    except Exception as e:
        logger.error(f"Error getting user history: {str(e)}")
        return []

def update_item_statistics(feedback_data: Dict):
    """Update item statistics based on feedback"""
    try:
        item_ref = db.collection('menu_items').document(feedback_data['item_id'])
        item = item_ref.get()

        if item.exists:
            stats = item.to_dict().get('statistics', {})
            rating_count = stats.get('rating_count', 0) + 1
            avg_rating = (
                (stats.get('average_rating', 0) * (rating_count - 1) +
                feedback_data['rating']) / rating_count
            )

            item_ref.update({
                'statistics.rating_count': rating_count,
                'statistics.average_rating': avg_rating,
                'statistics.last_updated': datetime.now().isoformat()
            })
    except Exception as e:
        logger.error(f"Error updating item statistics: {str(e)}")

def check_and_update_model():
    """Check if model needs updating and trigger update if necessary"""
    try:
        last_update = redis_client.get('last_model_update')
        if not last_update or (
            datetime.now() - datetime.fromisoformat(last_update)
        ) > timedelta(days=1):
            # Trigger async model update
            update_recommendation_model.delay()
    except Exception as e:
        logger.error(f"Error checking model update: {str(e)}")

if __name__ == '__main__':
    app.run(
        host=os.getenv('FLASK_HOST', '0.0.0.0'),
        port=int(os.getenv('FLASK_PORT', 5000)),
        debug=os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    )
