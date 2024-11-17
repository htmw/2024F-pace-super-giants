import os
from flask import Flask, request, jsonify
from firebase_admin import credentials, firestore, initialize_app
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pandas as pd

app = Flask(__name__)

cred = credentials.Certificate("firebase_credentials.json")
initialize_app(cred)
db = firestore.client()

tfidf = TfidfVectorizer(stop_words='english')

def get_user_preferences(user_id):
    user_ref = db.collection('users').document(user_id)
    user_data = user_ref.get().to_dict()
    return user_data.get('preferences', {})

def get_menu_items():
    menu_items = []
    docs = db.collection('menu_items').stream()
    for doc in docs:
        item = doc.to_dict()
        item['id'] = doc.id
        menu_items.append(item)
    return menu_items

def preprocess_data(menu_items, user_preferences):
    for item in menu_items:
        item['features'] = (
            f"{item['name']} {item['description']} {item['category']} "
            f"{'vegetarian' if item['is_vegetarian'] else ''} "
            f"{'spicy' if item['is_spicy'] else ''}"
        )
    
    user_feature = (
        f"{user_preferences.get('favorite_cuisine', '')} "
        f"{user_preferences.get('dietary_restrictions', '')} "
        f"{'vegetarian' if user_preferences.get('is_vegetarian') else ''} "
        f"{'spicy' if user_preferences.get('likes_spicy') else ''}"
    )
    
    return menu_items, user_feature

def get_recommendations(menu_items, user_feature):
    item_features = [item['features'] for item in menu_items]
    item_features.append(user_feature)
    
    tfidf_matrix = tfidf.fit_transform(item_features)
    cosine_similarities = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])
    
    sim_scores = list(enumerate(cosine_similarities[0]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    return [menu_items[i[0]] for i in sim_scores]

@app.route('/recommend', methods=['POST'])
def recommend_dishes():
    user_id = request.json.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    user_preferences = get_user_preferences(user_id)
    menu_items = get_menu_items()
    
    if not menu_items:
        return jsonify({"error": "No menu items found"}), 404

    processed_items, user_feature = preprocess_data(menu_items, user_preferences)
    recommendations = get_recommendations(processed_items, user_feature)

    return jsonify({
        "recommendations": recommendations[:5]
    })

@app.route('/feedback', methods=['POST'])
def record_feedback():
    feedback_data = request.json
    if not all(k in feedback_data for k in ('user_id', 'item_id', 'rating')):
        return jsonify({"error": "Missing required fields"}), 400

    feedback_ref = db.collection('feedback').document()
    feedback_ref.set(feedback_data)

    return jsonify({"message": "Feedback recorded successfully"}), 201

if __name__ == '__main__':
    app.run(debug=True)

