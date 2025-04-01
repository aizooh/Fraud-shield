import numpy as np
import joblib
from sklearn.base import BaseEstimator, ClassifierMixin

# Define the same custom classifier class that was used to create the model
class FraudClassifier(BaseEstimator, ClassifierMixin):
    def __init__(self):
        self.feature_importances_ = np.array([0.3, 0.15, 0.2, 0.15, 0.05, 0.05, 0.1])
        self.classes_ = np.array([0, 1])  # Binary classification: no fraud (0) or fraud (1)
    
    def fit(self, X, y):
        # No actual training needed for this demo model
        return self
        
    def predict_proba(self, X):
        # For demonstration, create a simple rule-based system
        # High amounts, manual entry, ecommerce, and location mismatch increase fraud probability
        probs = np.zeros((X.shape[0], 2))
        
        # Base probability of no fraud (class 0) is high
        probs[:, 0] = 0.95  # 95% chance of no fraud
        
        # Base probability of fraud (class 1) is low
        probs[:, 1] = 0.05  # 5% chance of fraud
        
        # Adjust for high amounts (feature 0)
        high_amount_mask = X[:, 0] > 1000
        probs[high_amount_mask, 1] += 0.2
        
        # Adjust for manual entry (feature 2)
        manual_entry_mask = X[:, 2] > 0.5
        probs[manual_entry_mask, 1] += 0.15
        
        # Adjust for ecommerce (feature 3)
        ecommerce_mask = X[:, 3] > 0.5
        probs[ecommerce_mask, 1] += 0.1
        
        # Adjust for location mismatch (feature 6)
        location_mismatch_mask = X[:, 6] > 0.5
        probs[location_mismatch_mask, 1] += 0.25
        
        # Normalize to ensure probabilities sum to 1
        row_sums = probs.sum(axis=1)
        probs = probs / row_sums[:, np.newaxis]
        
        return probs
    
    def predict(self, X):
        probs = self.predict_proba(X)
        return np.argmax(probs, axis=1)

# Instead of loading the model, let's create a new instance for testing
print("Creating fraud detection model for testing...")
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# Create the pipeline
model = Pipeline([
    ('scaler', StandardScaler()),
    ('classifier', FraudClassifier())
])

# Fit the model with dummy data to initialize the scaler
dummy_X = np.array([
    [100, 0, 0, 0, 12, 0, 0],
    [2000, 1, 1, 1, 14, 1, 1]
])
dummy_y = np.array([0, 1])
model.fit(dummy_X, dummy_y)

# Create some test transactions
test_transactions = [
    # Format: [amount, is_online, is_manual, is_ecommerce, hour_of_day, is_weekend, location_mismatch]
    # Safe transaction: small amount, chip transaction, retail, normal hours
    [100, 0, 0, 0, 14, 0, 0],
    
    # Risky transaction: large amount, manual entry, ecommerce, unusual location
    [2000, 0, 1, 1, 2, 0, 1],
    
    # Online transaction with moderate amount
    [500, 1, 0, 1, 15, 0, 0],
    
    # High value chip transaction
    [5000, 0, 0, 0, 12, 0, 0]
]

# Convert to numpy array
X_test = np.array(test_transactions)

# Make predictions
print("\nPrediction results:")
predictions = model.predict(X_test)
probabilities = model.predict_proba(X_test)

# Define risk levels based on fraud probability
def get_risk_level(prob):
    if prob < 0.4:
        return "Low"
    elif prob < 0.7:
        return "Medium"
    else:
        return "High"

# Display results
transaction_types = [
    "Small retail purchase (chip)",
    "Large manual ecommerce with location mismatch",
    "Medium online ecommerce purchase",
    "Large retail purchase (chip)"
]

print("\n{:<40} {:<10} {:<15} {:<10}".format("Transaction Type", "Fraud?", "Confidence", "Risk Level"))
print("-" * 80)

for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
    fraud_prob = prob[1]  # Probability of class 1 (fraud)
    risk_level = get_risk_level(fraud_prob)
    is_fraud = "Yes" if pred == 1 else "No"
    
    print("{:<40} {:<10} {:<15.2%} {:<10}".format(
        transaction_types[i], 
        is_fraud,
        fraud_prob,
        risk_level
    ))

print("\nModel test complete!")