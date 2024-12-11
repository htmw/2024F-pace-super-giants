import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from datetime import datetime, timedelta
import joblib

class DynamicPricingML:
    def __init__(self):
        self.model = None
        self.price_multiplier_bounds = (0.8, 1.3)  # Min and max price multipliers
        self.feature_columns = [
            'hour', 'day_of_week', 'is_weekend', 'is_holiday',
            'current_demand', 'competitor_price_ratio',
            'weather_condition', 'event_type', 'historical_sales',
            'inventory_level', 'category', 'preparation_time'
        ]

    def prepare_sample_data(self):
        """Generate sample historical data for training"""
        np.random.seed(42)
        n_samples = 10000

        data = {
            'base_price': np.random.uniform(5, 50, n_samples),
            'hour': np.random.randint(0, 24, n_samples),
            'day_of_week': np.random.randint(0, 7, n_samples),
            'is_weekend': np.random.randint(0, 2, n_samples),
            'is_holiday': np.random.randint(0, 2, n_samples),
            'current_demand': np.random.randint(0, 100, n_samples),
            'competitor_price_ratio': np.random.uniform(0.8, 1.2, n_samples),
            'weather_condition': np.random.choice(['sunny', 'rainy', 'cloudy'], n_samples),
            'event_type': np.random.choice(['none', 'sports', 'concert', 'festival'], n_samples),
            'historical_sales': np.random.randint(0, 1000, n_samples),
            'inventory_level': np.random.randint(0, 100, n_samples),
            'category': np.random.choice(['appetizer', 'main', 'dessert', 'beverage'], n_samples),
            'preparation_time': np.random.randint(5, 60, n_samples)
        }

        # Generate target price multipliers with some business logic
        multipliers = []
        for i in range(n_samples):
            base_multiplier = 1.0

            # Peak hours adjustment (lunch and dinner times)
            if 11 <= data['hour'][i] <= 13 or 18 <= data['hour'][i] <= 20:
                base_multiplier *= 1.1

            # Weekend adjustment
            if data['is_weekend'][i]:
                base_multiplier *= 1.05

            # Holiday adjustment
            if data['is_holiday'][i]:
                base_multiplier *= 1.15

            # Demand adjustment
            demand_factor = data['current_demand'][i] / 100
            base_multiplier *= (1 + 0.2 * demand_factor)

            # Weather adjustment
            if data['weather_condition'][i] == 'rainy':
                base_multiplier *= 0.95

            # Event adjustment
            if data['event_type'][i] != 'none':
                base_multiplier *= 1.1

            # Inventory adjustment
            if data['inventory_level'][i] < 20:
                base_multiplier *= 1.1
            elif data['inventory_level'][i] > 80:
                base_multiplier *= 0.9

            # Add some random noise
            noise = np.random.normal(0, 0.05)
            multiplier = base_multiplier + noise

            # Clip to bounds
            multiplier = np.clip(multiplier, self.price_multiplier_bounds[0], self.price_multiplier_bounds[1])
            multipliers.append(multiplier)

        data['price_multiplier'] = multipliers
        return pd.DataFrame(data)

    def train_model(self, data=None):
        """Train the pricing model"""
        if data is None:
            data = self.prepare_sample_data()

        # Create preprocessing pipeline
        numeric_features = [
            'hour', 'day_of_week', 'is_weekend', 'is_holiday',
            'current_demand', 'competitor_price_ratio',
            'historical_sales', 'inventory_level', 'preparation_time'
        ]
        categorical_features = ['weather_condition', 'event_type', 'category']

        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numeric_features),
                ('cat', OneHotEncoder(drop='first', sparse=False), categorical_features)
            ])

        # Create and train the model pipeline
        self.model = Pipeline([
            ('preprocessor', preprocessor),
            ('regressor', RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42
            ))
        ])

        X = data[self.feature_columns]
        y = data['price_multiplier']

        self.model.fit(X, y)
        return self

    def predict_price_multiplier(self, features_dict):
        """Predict price multiplier for given features"""
        if self.model is None:
            raise ValueError("Model not trained. Call train_model() first.")

        # Create a DataFrame with the input features
        features_df = pd.DataFrame([features_dict])

        # Make prediction
        predicted_multiplier = self.model.predict(features_df)[0]

        # Clip to bounds
        predicted_multiplier = np.clip(
            predicted_multiplier,
            self.price_multiplier_bounds[0],
            self.price_multiplier_bounds[1]
        )

        return predicted_multiplier

    def calculate_dynamic_price(self, base_price, features_dict):
        """Calculate final dynamic price"""
        multiplier = self.predict_price_multiplier(features_dict)
        return round(base_price * multiplier, 2)

    def save_model(self, filepath):
        """Save the trained model"""
        if self.model is None:
            raise ValueError("No model to save. Train the model first.")
        joblib.dump(self.model, filepath)

    def load_model(self, filepath):
        """Load a trained model"""
        self.model = joblib.load(filepath)
        return self

def get_current_features(menu_item, restaurant_data, weather_api, events_api):
    """Get current features for price prediction"""
    now = datetime.now()

    return {
        'hour': now.hour,
        'day_of_week': now.weekday(),
        'is_weekend': 1 if now.weekday() >= 5 else 0,
        'is_holiday': check_if_holiday(now),  # Implement holiday checking logic
        'current_demand': get_current_demand(restaurant_data),  # Implement demand calculation
        'competitor_price_ratio': get_competitor_prices(menu_item),  # Implement competitor price checking
        'weather_condition': get_weather(weather_api),  # Implement weather API integration
        'event_type': get_nearby_events(events_api),  # Implement events API integration
        'historical_sales': get_historical_sales(menu_item),  # Implement sales data retrieval
        'inventory_level': get_inventory_level(menu_item),  # Implement inventory checking
        'category': menu_item['category'],
        'preparation_time': menu_item['preparation_time']
    }

# Usage example:
if __name__ == "__main__":
    # Initialize and train the model
    pricing_model = DynamicPricingML()
    pricing_model.train_model()

    # Example menu item
    sample_features = {
        'hour': 18,  # 6 PM
        'day_of_week': 5,  # Saturday
        'is_weekend': 1,
        'is_holiday': 0,
        'current_demand': 75,
        'competitor_price_ratio': 1.1,
        'weather_condition': 'sunny',
        'event_type': 'concert',
        'historical_sales': 500,
        'inventory_level': 30,
        'category': 'main',
        'preparation_time': 25
    }

    # Calculate dynamic price for an item
    base_price = 19.99
    dynamic_price = pricing_model.calculate_dynamic_price(base_price, sample_features)
    print(f"Base price: ${base_price}")
    print(f"Dynamic price: ${dynamic_price}")
