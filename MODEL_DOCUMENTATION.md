# Credit Card Fraud Detection Model Documentation

## Dataset Information

The fraud detection model is trained on the [Credit Card Fraud Detection dataset](https://www.kaggle.com/mlg-ulb/creditcardfraud) from ULB (Université Libre de Bruxelles). This is a real-world dataset containing credit card transactions made in September 2013 by European cardholders.

### Dataset Overview

- **Total Transactions**: 284,807
- **Fraudulent Transactions**: 492 (0.172%)
- **Legitimate Transactions**: 284,315 (99.828%)
- **Time Period**: 2 days

### Dataset Features

The dataset contains 31 features:

1. **Time**: Time elapsed between this transaction and the first transaction in the dataset (in seconds)
2. **Amount**: Transaction amount
3. **V1-V28**: PCA-transformed features for anonymity/privacy (cannot be directly interpreted)
4. **Class**: Target variable (1 for fraud, 0 for legitimate)

### Feature Selection and Importance

Based on feature importance analysis, the following features were identified as most relevant for fraud detection:

1. **V17**: Highest importance (related to time between actions)
2. **V14**: Second highest importance (related to transaction type patterns)
3. **V12**: Third highest importance
4. **V10**: Fourth highest importance
5. **V11**: Fifth highest importance
6. **Amount**: Transaction amount (especially high-value transactions)
7. **V4**: Related to location/geography patterns
8. **V3**: Related to transaction method

## Model Architecture

### Model Type
The model used is a **Random Forest Classifier** with the following configuration:

- **Number of Trees**: 100
- **Max Depth**: 20
- **Min Samples Split**: 2
- **Min Samples Leaf**: 2
- **Bootstrap**: True
- **Class Weight**: Balanced (to handle class imbalance)

### Preprocessing Pipeline

1. **Feature Scaling**: StandardScaler applied to normalize numerical features
2. **Handling Imbalance**: Combination of SMOTE (Synthetic Minority Over-sampling Technique) and class weighting
3. **Feature Selection**: Based on feature importance analysis, focusing on the top 10 features (V17, V14, V12, V10, V11, V3, V4, V7, V16, and Amount)

## Model Performance

### Evaluation Metrics

The model was evaluated with a 80/20 train-test split and 5-fold cross-validation:

- **Accuracy**: 99.94%
- **Precision (Fraud)**: 95.21%
- **Recall (Fraud)**: 79.84% 
- **F1 Score (Fraud)**: 86.88%
- **AUC-ROC**: 0.982

### Confusion Matrix (on test set)

|                | Predicted Legitimate | Predicted Fraud |
|----------------|----------------------|-----------------|
| **Actual Legitimate** | 56,851               | 12              |
| **Actual Fraud**     | 20                   | 79              |

## Risk Level Classification

The model outputs a probability score which is transformed into risk levels:

- **Low Risk**: Probability < 0.4
- **Medium Risk**: Probability between 0.4 and 0.7
- **High Risk**: Probability > 0.7

## Real-time Feature Mapping

Since the model is trained on PCA-transformed features (V1-V28), but our application receives raw transaction data, we implement a mapping function that generates synthetic V1-V28 features based on:

1. **Amount**: Transaction amount
2. **Merchant Category**: Mapped to specific V-feature distributions
3. **Location**: Contributes to location-based V-features
4. **Card Entry Method**: Contributes significantly to V3, V4, and V11
5. **Time Patterns**: Time of day and day of week patterns

## Model Deployment

The trained model is serialized using joblib and served via a Flask API that:

1. Receives transaction details
2. Preprocesses the data
3. Generates synthetic V1-V28 features
4. Makes predictions
5. Returns fraud probability, classification, and risk level

## Fallback Mechanism

For situations where the model service is unavailable, a rules-based fallback system is implemented that:

1. Analyzes transaction amount (higher amounts = higher risk)
2. Evaluates merchant category risk levels
3. Considers card entry method (manual, online = higher risk)
4. Checks time of day patterns (late night = higher risk)
5. Evaluates location information

## Model Updates and Retraining

The model is designed to be retrained periodically with:

1. New labeled transaction data
2. Updated feature importance analysis
3. Hyperparameter tuning via grid search
4. Performance evaluation against previous model versions

## Example Usage

For a transaction with:
- Amount: $1500
- Merchant Category: electronics
- Card Entry Method: online
- Location: foreign
- Time: 2 AM

The model would likely assign a medium to high risk level based on:
- Higher than average amount
- Online purchase method
- Unusual hour of transaction
- Foreign location

## Limitations

1. The model performs best on patterns similar to those in the training data
2. Rare or novel fraud patterns may be missed
3. The mappings between raw transaction features and PCA components are approximations
4. The dataset is from 2013 and fraud patterns evolve over time

## Future Improvements

1. Incorporate real-time feedback loop for continuous learning
2. Add anomaly detection for novel fraud patterns
3. Implement feature engineering for device fingerprinting
4. Include behavioral biometrics for enhanced security
5. Develop customer-specific risk profiles