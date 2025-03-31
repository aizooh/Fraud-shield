from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from enum import Enum
import pickle
import numpy as np
from typing import Optional
import uvicorn
import os
from fastapi.middleware.cors import CORSMiddleware

# Model will be loaded here
model = None

# Define the risk levels as an enum
class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

# Define the request model matching the TypeScript interface
class FraudDetectionRequest(BaseModel):
    amount: float = Field(..., gt=0)
    merchantCategory: str
    location: Optional[str] = None
    ipAddress: Optional[str] = None
    cardEntryMethod: str
    timestamp: Optional[str] = None

# Define the response model matching the TypeScript interface
class FraudDetectionResponse(BaseModel):
    is_fraud: bool
    confidence: float = Field(..., ge=0, le=1)
    risk_level: RiskLevel

app = FastAPI(title="Fraud Detection Model API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    global model
    try:
        # Try to load the model if it exists
        model_path = os.getenv("MODEL_PATH", "fraud_model.pkl")
        if os.path.exists(model_path):
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            print(f"Model loaded successfully from {model_path}")
        else:
            print(f"Model file not found at {model_path}. Using fallback logic.")
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Using fallback logic instead")

def preprocess_input(request: FraudDetectionRequest):
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
        "amount": request.amount,
        "is_online": 1 if request.cardEntryMethod == "online" else 0,
        "is_manual": 1 if request.cardEntryMethod == "manual" else 0,
        "is_ecommerce": 1 if request.merchantCategory == "ecommerce" else 0,
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

@app.get("/")
async def root():
    return {"message": "Fraud Detection Model API", "status": "active"}

@app.post("/predict", response_model=FraudDetectionResponse)
async def predict(request: FraudDetectionRequest):
    try:
        # Preprocess the input
        features = preprocess_input(request)
        
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
            if request.amount > 2000:
                prediction = 0.9
            elif request.amount > 1000:
                prediction = 0.6
            elif request.cardEntryMethod == "manual":
                prediction = 0.4
                
            is_fraud = prediction > 0.5
        
        # Determine risk level
        risk_level = get_risk_level(prediction)
        
        return {
            "is_fraud": is_fraud,
            "confidence": float(prediction),  # Convert numpy types to Python float if needed
            "risk_level": risk_level
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
