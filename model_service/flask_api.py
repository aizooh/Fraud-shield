from flask import Flask, request, jsonify
import joblib
import numpy as np
import os
from enum import Enum
from typing import Dict, Any, Optional

# Model will be loaded here
model = None

# Define the risk levels
class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

app = Flask(__name__)

# Load the model on startup
def load_model():
    global model
    try:
        # Try to load the model if it exists
        model_path = os.getenv("MODEL_PATH", "model_service/fraud_model.pkl")
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            print(f"Model loaded successfully from {model_path}")
        else:
            print(f"Model file not found at {model_path}. Using fallback logic.")
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Using fallback logic instead")

# Load model at startup
load_model()

def preprocess_input(request_data):
    """
    Preprocess the input data for the model.
    In a real implementation, this would transform the request data
    into the format expected by the ML model.
    """
    # This is a simplified example - in production you would:
    # - Handle categorical variables (one-hot encoding, etc.)
    # - Scale numerical features
    # - Extract time-based features if timestamp is provided
    
    # For this example, we'll just create some basic features
    features = {
        "amount": request_data.get("amount", 0),
        "is_online": 1 if request_data.get("cardEntryMethod") == "online" else 0,
        "is_manual": 1 if request_data.get("cardEntryMethod") == "manual" else 0,
        "is_ecommerce": 1 if request_data.get("merchantCategory") == "ecommerce" else 0,
    }
    
    return features

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
    return jsonify({"message": "Fraud Detection Model API", "status": "active"})

@app.route('/health')
def health():
    """Health check endpoint for monitoring"""
    health_status = {
        "status": "ok",
        "timestamp": __import__("datetime").datetime.now().isoformat(),
        "version": "1.0.0",
        "model_loaded": model is not None
    }
    
    # Check if the model can make a basic prediction
    if model is not None:
        try:
            # Test with minimal data
            test_features = np.array([[100, 0, 0, 0]])
            model.predict_proba(test_features)
            health_status["model_status"] = "ok"
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
            
        # Preprocess the input
        features = preprocess_input(request_data)
        
        # Use the model if it's loaded, otherwise use fallback logic
        if model is not None:
            # In a real implementation, prepare the features into the format
            # expected by your model (likely a numpy array)
            feature_array = np.array([[
                features["amount"],
                features["is_online"],
                features["is_manual"],
                features["is_ecommerce"]
            ]])
            
            # Get prediction from model
            prediction = model.predict_proba(feature_array)[0][1]  # Assuming binary classification
            is_fraud = prediction > 0.5
        else:
            # Fallback logic when model isn't available
            # This is for demonstration purposes
            prediction = 0.1  # Default low probability
            
            # Simple rule-based fallback
            amount = request_data.get('amount', 0)
            if amount > 2000:
                prediction = 0.9
            elif amount > 1000:
                prediction = 0.6
            elif request_data.get('cardEntryMethod') == "manual":
                prediction = 0.4
                
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