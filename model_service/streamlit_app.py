import streamlit as st
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.metrics import confusion_matrix, classification_report
import altair as alt

# Page Configuration
st.set_page_config(
    page_title="Fraud Detection Model Dashboard",
    page_icon="🔍",
    layout="wide"
)

# Title and description
st.title("Fraud Detection Model Dashboard")
st.markdown("""
This dashboard provides insights into the fraud detection model's performance and allows
for testing predictions with custom inputs.
""")

# Sidebar
st.sidebar.title("Navigation")
page = st.sidebar.radio("Select a page", ["Model Overview", "Test Prediction", "Model Performance"])

# Load model
@st.cache_resource
def load_model():
    model_path = os.getenv("MODEL_PATH", "fraud_model.pkl")
    if os.path.exists(model_path):
        try:
            model = joblib.load(model_path)
            return model, True
        except Exception as e:
            st.error(f"Error loading model: {e}")
            return None, False
    else:
        st.warning(f"Model file not found at {model_path}. Using demo mode.")
        return None, False

model, model_loaded = load_model()

# Generate sample data for demonstration
@st.cache_data
def generate_sample_data(n_samples=1000):
    np.random.seed(42)
    data = {
        'amount': np.random.exponential(500, n_samples),
        'is_online': np.random.choice([0, 1], size=n_samples, p=[0.3, 0.7]),
        'is_manual': np.random.choice([0, 1], size=n_samples, p=[0.8, 0.2]),
        'is_ecommerce': np.random.choice([0, 1], size=n_samples, p=[0.5, 0.5]),
    }
    
    # Generate labels with some relationship to features
    labels = np.zeros(n_samples)
    for i in range(n_samples):
        prob = 0.05  # Base fraud probability
        if data['amount'][i] > 1000:
            prob += 0.2
        if data['is_manual'][i] == 1:
            prob += 0.1
        labels[i] = np.random.choice([0, 1], p=[1-prob, prob])
    
    data['is_fraud'] = labels
    return pd.DataFrame(data)

sample_data = generate_sample_data()

# Function to get risk level
def get_risk_level(confidence):
    if confidence >= 0.7:
        return "high"
    elif confidence >= 0.4:
        return "medium"
    else:
        return "low"

# Model Overview Page
if page == "Model Overview":
    st.header("Model Overview")
    
    # Display model information
    st.subheader("Model Information")
    if model_loaded:
        st.success("Model loaded successfully!")
        st.write(f"Model Type: {type(model).__name__}")
        # Display feature importances if available
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            feature_names = ['amount', 'is_online', 'is_manual', 'is_ecommerce']
            importance_df = pd.DataFrame({
                'Feature': feature_names,
                'Importance': importances
            }).sort_values('Importance', ascending=False)
            
            st.subheader("Feature Importance")
            chart = alt.Chart(importance_df).mark_bar().encode(
                x=alt.X('Importance:Q'),
                y=alt.Y('Feature:N', sort='-x'),
                color=alt.Color('Feature:N', legend=None)
            ).properties(height=300)
            st.altair_chart(chart, use_container_width=True)
    else:
        st.warning("Using demo mode. Model not loaded.")
    
    # Display sample data distribution
    st.subheader("Data Distribution")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.write("Transaction Amount Distribution")
        chart = alt.Chart(sample_data).mark_bar().encode(
            alt.X('amount:Q', bin=True),
            y='count()'
        ).properties(height=300)
        st.altair_chart(chart, use_container_width=True)
    
    with col2:
        st.write("Fraud Distribution")
        fraud_counts = sample_data['is_fraud'].value_counts().reset_index()
        fraud_counts.columns = ['Fraud', 'Count']
        fraud_counts['Fraud'] = fraud_counts['Fraud'].map({0: 'Legitimate', 1: 'Fraud'})
        
        chart = alt.Chart(fraud_counts).mark_bar().encode(
            x='Fraud:N',
            y='Count:Q',
            color='Fraud:N'
        ).properties(height=300)
        st.altair_chart(chart, use_container_width=True)

# Test Prediction Page
elif page == "Test Prediction":
    st.header("Test Fraud Prediction")
    st.write("Enter transaction details to get a fraud prediction.")
    
    # Input form
    with st.form("prediction_form"):
        amount = st.number_input("Transaction Amount ($)", min_value=0.01, max_value=10000.0, value=500.0)
        
        col1, col2 = st.columns(2)
        with col1:
            card_entry = st.selectbox(
                "Card Entry Method", 
                options=["chip", "online", "manual", "contactless"],
                index=0
            )
        
        with col2:
            merchant_category = st.selectbox(
                "Merchant Category",
                options=["retail", "ecommerce", "travel", "restaurant", "entertainment"],
                index=0
            )
        
        # Submit button
        submitted = st.form_submit_button("Predict")
    
    if submitted:
        # Prepare features
        features = {
            "amount": amount,
            "is_online": 1 if card_entry == "online" else 0,
            "is_manual": 1 if card_entry == "manual" else 0,
            "is_ecommerce": 1 if merchant_category == "ecommerce" else 0,
        }
        
        # Make prediction
        if model_loaded:
            feature_array = np.array([[
                features["amount"],
                features["is_online"],
                features["is_manual"],
                features["is_ecommerce"]
            ]])
            
            prediction = model.predict_proba(feature_array)[0][1]
        else:
            # Demo mode
            prediction = 0.1  # Default low probability
            
            # Simple rule-based logic
            if amount > 2000:
                prediction = 0.9
            elif amount > 1000:
                prediction = 0.6
            elif card_entry == "manual":
                prediction = 0.4
        
        is_fraud = prediction > 0.5
        risk_level = get_risk_level(prediction)
        
        # Display result
        st.subheader("Prediction Result")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Fraud Probability", f"{prediction:.2%}")
        
        with col2:
            st.metric("Risk Level", risk_level.upper())
        
        with col3:
            if is_fraud:
                st.error("FRAUD DETECTED")
            else:
                st.success("TRANSACTION SAFE")
        
        # Show explanation
        st.subheader("Explanation")
        
        explanation = []
        if amount > 2000:
            explanation.append("• High transaction amount increases fraud risk.")
        if card_entry == "manual":
            explanation.append("• Manual card entry method increases risk.")
        if merchant_category == "ecommerce":
            explanation.append("• E-commerce transactions have elevated risk.")
        
        if not explanation:
            explanation.append("• This transaction has normal risk patterns.")
            
        for line in explanation:
            st.write(line)

# Model Performance Page
elif page == "Model Performance":
    st.header("Model Performance Metrics")
    
    # Generate predictions on sample data
    X = sample_data[['amount', 'is_online', 'is_manual', 'is_ecommerce']]
    y_true = sample_data['is_fraud']
    
    if model_loaded:
        y_pred = model.predict(X)
        y_prob = model.predict_proba(X)[:, 1]
    else:
        # Demo mode - generate predictions with simple rules
        y_prob = np.zeros(len(sample_data))
        for i, row in sample_data.iterrows():
            prob = 0.05  # Base fraud probability
            if row['amount'] > 1000:
                prob += 0.2
            if row['is_manual'] == 1:
                prob += 0.1
            y_prob[i] = prob
        y_pred = (y_prob > 0.5).astype(int)
    
    # Calculate confusion matrix
    conf_matrix = confusion_matrix(y_true, y_pred)
    
    # Display metrics
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Confusion Matrix")
        
        # Create DataFrame for confusion matrix
        conf_df = pd.DataFrame(
            conf_matrix, 
            index=['Actual: Legitimate', 'Actual: Fraud'], 
            columns=['Predicted: Legitimate', 'Predicted: Fraud']
        )
        
        st.dataframe(conf_df)
        
        # Calculate basic metrics
        tn, fp, fn, tp = conf_matrix.ravel()
        accuracy = (tn + tp) / (tn + fp + fn + tp)
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        
        # Display metrics
        st.subheader("Performance Metrics")
        metrics_df = pd.DataFrame({
            'Metric': ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
            'Value': [accuracy, precision, recall, f1]
        })
        
        for i, row in metrics_df.iterrows():
            st.metric(row['Metric'], f"{row['Value']:.4f}")
    
    with col2:
        st.subheader("ROC Curve")
        
        # Calculate and plot ROC curve (simplified)
        thresholds = np.linspace(0, 1, 100)
        tpr = []
        fpr = []
        
        for threshold in thresholds:
            y_pred_thresh = (y_prob >= threshold).astype(int)
            tn, fp, fn, tp = confusion_matrix(y_true, y_pred_thresh).ravel()
            
            tpr.append(tp / (tp + fn) if (tp + fn) > 0 else 0)
            fpr.append(fp / (fp + tn) if (fp + tn) > 0 else 0)
        
        roc_df = pd.DataFrame({
            'False Positive Rate': fpr,
            'True Positive Rate': tpr,
            'Threshold': thresholds
        })
        
        # Plot ROC curve
        roc_chart = alt.Chart(roc_df).mark_line().encode(
            x='False Positive Rate:Q',
            y='True Positive Rate:Q'
        ).properties(
            height=300
        )
        
        # Add diagonal reference line
        diagonal = alt.Chart(pd.DataFrame({'x': [0, 1], 'y': [0, 1]})).mark_line(
            strokeDash=[4, 4],
            color='gray'
        ).encode(
            x='x:Q',
            y='y:Q'
        )
        
        st.altair_chart(roc_chart + diagonal, use_container_width=True)
        
        # Display prediction distribution
        st.subheader("Prediction Distribution")
        pred_df = pd.DataFrame({
            'Fraud Probability': y_prob,
            'Actual': y_true.map({0: 'Legitimate', 1: 'Fraud'})
        })
        
        hist = alt.Chart(pred_df).mark_bar().encode(
            alt.X('Fraud Probability:Q', bin=alt.Bin(maxbins=20)),
            alt.Y('count():Q'),
            alt.Color('Actual:N')
        ).properties(height=300)
        
        st.altair_chart(hist, use_container_width=True)

# Footer
st.markdown("---")
st.caption("Fraud Detection Model Dashboard | Created with Streamlit")