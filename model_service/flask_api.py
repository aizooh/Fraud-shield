from flask import Flask, request, jsonify
import joblib
import numpy as np
import os
from enum import Enum
from typing import Dict, Any, Optional
import pandas as pd
from datetime import datetime

# Model components will be loaded here
model_data = None
model = None
scaler = None
selected_features = None

# Define the risk levels
class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

app = Flask(__name__)

# Load the model on startup
def load_model():
    global model_data, model, scaler, selected_features
    try:
        # Try to load the model if it exists
        model_path = os.getenv("MODEL_PATH", "credit_card_model.pkl")
        if os.path.exists(model_path):
            model_data = joblib.load(model_path)
            model = model_data.get('model')
            scaler = model_data.get('scaler')
            selected_features = model_data.get('selected_features', ['V1', 'V2', 'V3', 'V4', 'V10', 'V11', 'V14', 'Amount'])
            print(f"Model loaded successfully from {model_path}")
            print(f"Selected features: {selected_features}")
        else:
            print(f"Model file not found at {model_path}. Using fallback logic.")
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Using fallback logic instead")

# Load model at startup
load_model()

def map_transaction_to_features(request_data):
    """
    Maps the transaction data from the API request to a feature vector compatible with our model.
    Since we're using real credit card data with PCA features (V1-V28), we need to generate these
    features based on transaction properties.
    
    This is a simplified approximation that maps transaction properties to the PCA space.
    In a real system, you would need:
    1. The original feature engineering pipeline
    2. The original PCA transformation matrix
    
    For our demo, we'll approximate V1-V28 based on transaction properties.
    """
    # Extract basic transaction properties
    amount = float(request_data.get("amount", 0))
    
    # Generate a feature dictionary with default values
    features = {
        # Default values for V1-V28 based on transaction properties
        'V1': 0.0,  # Time-related pattern
        'V2': 0.0,  # Amount-related pattern
        'V3': 0.0,  # Merchant category pattern
        'V4': 0.0,  # Location pattern
        'V10': 0.0, # Card entry method pattern
        'V11': 0.0, # Time of day pattern
        'V14': 0.0, # Weekend pattern
        'Amount': amount
    }
    
    # Modify features based on transaction properties
    
    # Amount (higher amounts might be more suspicious)
    if amount > 1000:
        features['V2'] = -0.5  # Negative values in V2 often correlate with fraud
    
    # Card entry method
    if request_data.get("cardEntryMethod") == "manual":
        features['V4'] = -0.8  # Manual entry is riskier
        features['V10'] = -0.6
    elif request_data.get("cardEntryMethod") == "online":
        features['V3'] = -0.7  # Online transactions have certain patterns
        features['V11'] = -0.4
    
    # Merchant category
    if request_data.get("merchantCategory") == "ecommerce":
        features['V1'] = -0.9  # E-commerce has specific patterns
        features['V3'] -= 0.3
    
    # Location (abnormal location is a strong fraud indicator)
    if request_data.get("location") == "abnormal":
        features['V1'] -= 1.0
        features['V4'] -= 0.9
        features['V14'] -= 0.8
    
    # Time-based features
    if "timestamp" in request_data and request_data["timestamp"]:
        try:
            dt = datetime.fromisoformat(request_data["timestamp"].replace('Z', '+00:00'))
            # Late night transactions might be riskier
            if dt.hour >= 22 or dt.hour <= 5:
                features['V11'] -= 0.5
                features['V14'] -= 0.3
            # Weekend transactions
            if dt.weekday() >= 5:  # 5=Saturday, 6=Sunday
                features['V1'] -= 0.2
                features['V14'] -= 0.4
        except:
            pass
    
    return features

def preprocess_input(request_data):
    """
    Preprocess the input data for the model.
    """
    # Map transaction data to features
    features = map_transaction_to_features(request_data)
    
    # Create a feature vector keeping only the selected features in the correct order
    feature_vector = np.array([[features[feature] for feature in selected_features]])
    
    # Scale the features if a scaler is available
    if scaler is not None:
        feature_vector = scaler.transform(feature_vector)
    
    return feature_vector

def get_risk_level(confidence: float) -> RiskLevel:
    """
    Convert the confidence score to a risk level.
    """
    if confidence >= 0.7:
        return RiskLevel.high
    elif confidence >= 0.4:
        return RiskLevel.medium
    else:
        return RiskLevel.low

@app.route('/')
def root():
    return jsonify({"message": "Credit Card Fraud Detection API", "status": "active"})

@app.route('/health')
def health():
    """Health check endpoint for monitoring"""
    health_status = {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "model_loaded": model is not None
    }
    
    # Check if the model can make a basic prediction
    if model is not None:
        try:
            # Create a test feature vector with the correct number of features
            if selected_features:
                test_features = np.zeros((1, len(selected_features)))
                model.predict_proba(test_features)
                health_status["model_status"] = "ok"
            else:
                health_status["model_status"] = "error"
                health_status["error"] = "Selected features not available"
                health_status["status"] = "degraded"
        except Exception as e:
            health_status["model_status"] = "error"
            health_status["error"] = str(e)
            health_status["status"] = "degraded"
    else:
        health_status["model_status"] = "not_loaded"
        health_status["status"] = "degraded"
    
    status_code = 200 if health_status["status"] == "ok" else 500
    return jsonify(health_status), status_code

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get request data
        request_data = request.get_json()
        
        # Validate required fields
        if not request_data or 'amount' not in request_data:
            return jsonify({"error": "Invalid request data"}), 400
        
        # Use the model if it's loaded, otherwise use fallback logic
        if model is not None and scaler is not None:
            # Preprocess the input and get feature vector
            feature_vector = preprocess_input(request_data)
            
            # Get prediction from model
            prediction = model.predict_proba(feature_vector)[0][1]  # Probability of class 1 (fraud)
            is_fraud = prediction > 0.5
        else:
            # Fallback logic when model isn't available
            features = map_transaction_to_features(request_data)
            
            # Simple rule-based fallback based on transaction properties
            prediction = 0.1  # Default low probability
            
            # Rule 1: High amounts are suspicious
            amount = features["Amount"]
            if amount > 2000:
                prediction += 0.5
            elif amount > 1000:
                prediction += 0.3
            
            # Rule 2: Negative values in important V features often indicate fraud
            fraud_signals = 0
            for v_feature in ['V1', 'V2', 'V3', 'V4', 'V10', 'V11', 'V14']:
                if v_feature in features and features[v_feature] < -0.5:
                    fraud_signals += 1
            
            # Add risk based on number of fraud signals
            prediction += 0.1 * fraud_signals
            
            # Cap at 1.0
            prediction = min(prediction, 1.0)
                
            is_fraud = prediction > 0.5
        
        # Determine risk level
        risk_level = get_risk_level(prediction)
        
        return jsonify({
            "is_fraud": is_fraud,
            "confidence": float(prediction),  # Convert numpy types to Python float if needed
            "risk_level": risk_level.value  # Need to extract string value from enum
        })
    except Exception as e:
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    app.run(host="0.0.0.0", port=port, debug=True)