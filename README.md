# FraudShield - Credit Card Fraud Detection System

FraudShield is a sophisticated full-stack application for real-time credit card fraud detection that leverages machine learning to provide accurate risk assessment and transaction analysis.

## Features

- **Real-time Fraud Detection**: Process transaction data to detect potential fraud with high accuracy
- **Risk Assessment**: Evaluate transactions with detailed confidence scores and risk levels
- **User Authentication**: Secure login/registration system with Google OAuth integration
- **Transaction Management**: Import and analyze bulk transaction data via CSV
- **Interactive Dashboard**: Visualize fraud patterns and monitor system performance
- **Responsive Design**: Optimized for mobile, tablet, and desktop experiences

## Technical Architecture

### Frontend
- React.js with TypeScript
- Context API and Redux for state management
- TanStack Query for data fetching
- Recharts and Chart.js for visualizations
- ShadCN UI components with Tailwind CSS

### Backend
- Node.js with Express
- PostgreSQL database with Drizzle ORM
- Authentication with Passport.js
- Server-side validation with Zod

### Machine Learning
- Flask API for model serving
- Logistic Regression model (99.76% accuracy)
- Streamlit dashboard for model performance monitoring
- Real credit card transaction data for training

## API Endpoints

### Fraud Detection

#### 1. Predict Fraud Risk (no storage)
```
POST /api/fraud/predict
```

Request body:
```json
{
  "amount": 2500,
  "merchantCategory": "ecommerce",
  "location": "abnormal",
  "ipAddress": "192.168.1.1",
  "cardEntryMethod": "online",
  "timestamp": "2025-04-01T03:30:00Z"
}
```

Response:
```json
{
  "prediction": {
    "is_fraud": true,
    "confidence": 1,
    "risk_level": "high"
  },
  "transaction": {
    "amount": 2500,
    "merchantCategory": "ecommerce",
    "location": "abnormal",
    "ipAddress": "192.168.1.1",
    "cardEntryMethod": "online",
    "timestamp": "2025-04-01T03:30:00Z"
  }
}
```

#### 2. Process and Store Transaction
```
POST /api/detect-fraud
```

Request body: Same as `/api/fraud/predict`

Response:
```json
{
  "fraudResult": {
    "is_fraud": true,
    "confidence": 1,
    "risk_level": "high"
  },
  "transaction": {
    "transactionId": "tx_abc123",
    "amount": 2500,
    "merchantCategory": "ecommerce",
    "location": "abnormal",
    "ipAddress": "192.168.1.1",
    "cardEntryMethod": "online",
    "timestamp": "2025-04-01T03:30:00Z",
    "isFraud": true,
    "status": "fraudulent"
  }
}
```

#### 3. CSV Bulk Analysis
```
POST /api/analyze-csv
```
- Upload a CSV file containing multiple transactions
- Returns detailed analysis including patterns and statistics

### Authentication

- `POST /api/register` - Create new user account
- `POST /api/login` - Authenticate existing user
- `POST /api/logout` - End current session
- `GET /api/user` - Get current user information

### Transactions

- `GET /api/transactions` - List all transactions
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions` - Create new transaction

### Analytics

- `GET /api/stats` - Get system statistics
- `GET /api/analytics` - Get fraud analysis data

## Machine Learning Model

The system uses a Logistic Regression model trained on real credit card transaction data:

- **Selected Features**: V1, V2, V3, V4, V10, V11, V14, Amount
- **Preprocessing**: StandardScaler for normalization
- **Performance**: 99.76% accuracy, high precision and recall
- **Fallback Mechanism**: Rule-based prediction when model service is unavailable

## Running the Project

### Prerequisites
- Node.js v16+
- Python 3.8+ for ML components (optional)
- PostgreSQL database

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the application:
   ```
   npm run dev
   ```
4. For the ML component (optional):
   ```
   cd model_service
   python run.py
   ```

## Testing

Run the test script to verify fraud detection:
```
node test-fraud-api.js
```

## License

MIT