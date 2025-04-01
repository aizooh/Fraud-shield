import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# Set paths
data_path = '../data/creditcard.csv'
model_output_path = 'credit_card_model.pkl'

print(f"Loading data from {data_path}")
# Load the data
credit_card_data = pd.read_csv(data_path)

print("Data shape:", credit_card_data.shape)
print("Class distribution:")
print(credit_card_data['Class'].value_counts())

# For faster training, use a subset of the data
# Take all fraud cases (minority class) but only a fraction of non-fraud cases
fraud_cases = credit_card_data[credit_card_data['Class'] == 1]
non_fraud_cases = credit_card_data[credit_card_data['Class'] == 0].sample(n=10000, random_state=42)
credit_card_data_balanced = pd.concat([fraud_cases, non_fraud_cases]).reset_index(drop=True)

print("Balanced dataset shape:", credit_card_data_balanced.shape)
print("Balanced class distribution:")
print(credit_card_data_balanced['Class'].value_counts())

# Select important features (based on domain knowledge)
# V1, V2, V3, V4, V10, V11, V14, and Amount are often important features in fraud detection
selected_features = ['V1', 'V2', 'V3', 'V4', 'V10', 'V11', 'V14', 'Amount']
X = credit_card_data_balanced[selected_features]
y = credit_card_data_balanced['Class']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Scale the features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print("Training Logistic Regression model...")
# Use logistic regression (faster than Random Forest)
model = LogisticRegression(max_iter=1000, random_state=42)
model.fit(X_train_scaled, y_train)

# Evaluate the model
y_pred = model.predict(X_test_scaled)
print("Model Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Save model and scaler
print(f"Saving model to {model_output_path}")
joblib.dump({
    'model': model, 
    'scaler': scaler,
    'selected_features': selected_features
}, model_output_path)
print("Model saved successfully!")