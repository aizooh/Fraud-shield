import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import joblib
import os

# Set random seed for reproducibility
np.random.seed(42)

# Function to generate synthetic transaction data for training
def generate_training_data(n_samples=2000):
    # Generate random features
    amounts = np.random.exponential(500, n_samples)  # Transaction amounts with exponential distribution
    
    # Card entry methods (0=chip, 1=online, 2=manual, 3=contactless)
    card_entry = np.random.choice([0, 1, 2, 3], n_samples, p=[0.5, 0.3, 0.1, 0.1])
    is_online = (card_entry == 1).astype(int)
    is_manual = (card_entry == 2).astype(int)
    
    # Merchant categories (0=retail, 1=ecommerce, 2=travel, 3=restaurant, 4=entertainment)
    merchant_category = np.random.choice([0, 1, 2, 3, 4], n_samples, p=[0.4, 0.3, 0.1, 0.1, 0.1])
    is_ecommerce = (merchant_category == 1).astype(int)
    
    # Time of day (hour 0-23)
    hour_of_day = np.random.randint(0, 24, n_samples)
    # Weekend flag (0=weekday, 1=weekend)
    is_weekend = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
    
    # Location mismatch (1 if location is unusual for the customer)
    location_mismatch = np.random.choice([0, 1], n_samples, p=[0.95, 0.05])
    
    # Create the feature matrix
    X = np.column_stack([
        amounts,
        is_online,
        is_manual,
        is_ecommerce,
        hour_of_day,
        is_weekend,
        location_mismatch
    ])
    
    # Generate target variable (fraud or not)
    # Base probability of fraud
    fraud_prob = np.ones(n_samples) * 0.02
    
    # Increase fraud probability based on features
    fraud_prob += is_manual * 0.1  # Manual entry increases fraud risk
    fraud_prob += is_online * 0.05  # Online transactions have higher risk
    fraud_prob += is_ecommerce * 0.05  # E-commerce has higher risk
    fraud_prob += (amounts > 1000).astype(int) * 0.1  # High value transactions
    fraud_prob += location_mismatch * 0.2  # Location mismatch is suspicious
    
    # Cap probabilities to be between 0 and 1
    fraud_prob = np.clip(fraud_prob, 0, 0.9)
    
    # Generate actual fraud labels based on probabilities
    y = np.random.binomial(1, fraud_prob)
    
    # Create a DataFrame for better visualization
    df = pd.DataFrame({
        'amount': amounts,
        'is_online': is_online,
        'is_manual': is_manual,
        'is_ecommerce': is_ecommerce,
        'hour_of_day': hour_of_day,
        'is_weekend': is_weekend,
        'location_mismatch': location_mismatch,
        'is_fraud': y
    })
    
    return df

# Generate data
print("Generating synthetic training data...")
data = generate_training_data()

# Print data summary
print(f"Generated {len(data)} transaction records")
print(f"Fraud rate: {data['is_fraud'].mean():.2%}")

# Split features and target
X = data.drop('is_fraud', axis=1)
y = data['is_fraud']

# Create a pipeline with preprocessing and model
print("Training fraud detection model...")
model = Pipeline([
    ('scaler', StandardScaler()),
    ('classifier', RandomForestClassifier(
        n_estimators=20,
        max_depth=5,
        min_samples_split=10,
        class_weight='balanced',
        random_state=42
    ))
])

# Train the model
model.fit(X, y)

# Save the model
model_path = 'model_service/fraud_model.pkl'
print(f"Saving model to {model_path}...")
joblib.dump(model, model_path)

print("Feature importances:")
feature_importances = model.named_steps['classifier'].feature_importances_
for feature, importance in zip(X.columns, feature_importances):
    print(f"- {feature}: {importance:.4f}")

print("\nModel training complete!")
print(f"Model saved to {model_path}")