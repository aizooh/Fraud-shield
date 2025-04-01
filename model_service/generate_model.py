import numpy as np
import joblib
from sklearn.base import BaseEstimator, ClassifierMixin
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# Create a simple model without training
print("Generating a simple pre-trained fraud detection model...")

# Create a custom classifier
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

# Initialize our custom classifier
classifier = FraudClassifier()

# Initialize with some simple rules
# Feature order: [amount, is_online, is_manual, is_ecommerce, hour_of_day, is_weekend, location_mismatch]
feature_importances = classifier.feature_importances_

# Create the pipeline
model = Pipeline([
    ('scaler', StandardScaler()),
    ('classifier', classifier)
])

# Fit the model with dummy data to initialize the scaler
dummy_X = np.array([
    [100, 0, 0, 0, 12, 0, 0],
    [2000, 1, 1, 1, 14, 1, 1]
])
dummy_y = np.array([0, 1])
model.fit(dummy_X, dummy_y)

# Save the model
model_path = 'model_service/fraud_model.pkl'
print(f"Saving model to {model_path}...")
joblib.dump(model, model_path)

print("Model feature importances:")
for i, importance in enumerate(['amount', 'is_online', 'is_manual', 'is_ecommerce', 'hour_of_day', 'is_weekend', 'location_mismatch']):
    print(f"- {importance}: {feature_importances[i]:.4f}")

print("\nModel generation complete!")
print(f"Model saved to {model_path}")