# Fraud Shield - Credit Card Fraud Detection System

<div align="center">
  <img src="./generated-icon.png" alt="Fraud Shield Logo" width="120" height="120">
  <h1>Fraud Shield</h1>
  <p>A comprehensive credit card fraud detection system</p>
</div>

## 🚀 Overview

Fraud Shield is a sophisticated, full-stack credit card fraud detection system designed to provide real-time transaction risk analysis and user-friendly security insights. Leveraging machine learning and data visualization, Fraud Shield helps organizations identify, analyze, and prevent fraudulent credit card transactions.

## ✨ Key Features

- **Real-time Fraud Detection**: Analyze transactions instantly with advanced ML algorithms
- **User & Admin Dashboards**: Role-based access with specialized views
- **Transaction Analysis**: Both single transaction testing and bulk CSV imports
- **Visualized Insights**: Interactive charts and metrics on fraud patterns
- **Authentication System**: Secure login with Google OAuth integration
- **Responsive Design**: Mobile-friendly UI that works across devices
- **Comprehensive Reporting**: Detailed analytics on transaction patterns
- **User Management**: Profile editing and notification preferences

## 🏗️ Technical Architecture

The application consists of three main components:

1. **Frontend**: React.js with TypeScript
   - Modern UI with shadcn/ui components and TailwindCSS
   - Interactive visualizations with Recharts
   - Type-safe API interactions
   - Responsive dashboard layout

2. **Backend**: Node.js with Express
   - RESTful API endpoints
   - PostgreSQL database integration
   - Session-based authentication
   - CSV processing capabilities

3. **Model Service**: Flask API
   - Machine learning model serving
   - Real-time prediction endpoints
   - Data preprocessing pipeline

## 📊 Fraud Detection Model

The system uses a machine learning model trained on real credit card transaction data with the following characteristics:

- **Model Type**: Random Forest Classifier
- **Features Used**: Transaction amount, merchant category, card entry method, location patterns, and time-based features
- **Performance**: 99.94% accuracy with 95.21% precision on fraud detection
- **Risk Assessment**: Transactions categorized as low, medium, or high risk

For more details, see [MODEL_DOCUMENTATION.md](./MODEL_DOCUMENTATION.md).

## 🖥️ Screenshots

### Main Dashboard
![Dashboard](attached_assets/image_1743574416003.png)

### Fraud Detection Interface
- Single Transaction Analysis
- Bulk Import Analysis

## 🔧 Technical Requirements

- Node.js 18.x or higher
- Python 3.10 or higher
- PostgreSQL 14.x or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- Python and pip
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/fraud-shield.git
   cd fraud-shield
   ```

2. **Install dependencies**
   ```bash
   # Install Node.js dependencies
   npm install
   
   # Install Python dependencies
   pip install -r model_service/requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file based on `.env.example`
   ```
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/fraud_shield
   
   # Session
   SESSION_SECRET=your_secret_key
   
   # Services
   MODEL_SERVICE_URL=http://localhost:8001
   STREAMLIT_URL=http://localhost:8501
   
   # Authentication (for Google OAuth)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Set up the database**
   ```bash
   # Run database migrations
   npm run db:push
   ```

5. **Start the application**
   ```bash
   # Start all services
   npm run dev
   ```

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📘 API Documentation

The Fraud Shield system exposes several API endpoints for integration:

- `/api/fraud/predict` - Predict fraud for a single transaction
- `/api/analyze-csv` - Analyze multiple transactions via CSV upload
- `/api/transactions` - Manage transaction records
- `/api/stats` - Get fraud statistics and metrics

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## 🧪 Testing

Run the test suite with:

```bash
# Run backend tests
npm test

# Run frontend tests
npm run test:frontend

# Test the fraud detection API
node test-fraud-api.js
```

## 📁 Project Structure

```
fraud-shield/
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Application pages
│   │   ├── store/         # State management
│   │   └── lib/           # Utilities and helpers
├── server/                # Backend Express application
│   ├── auth.ts            # Authentication logic
│   ├── modelService.ts    # Model service integration
│   ├── routes.ts          # API endpoints
│   └── storage.ts         # Database operations
├── model_service/         # Fraud detection ML service
│   ├── flask_api.py       # API server
│   ├── streamlit_app.py   # Data visualization dashboard
│   └── credit_card_model.pkl # Pre-trained ML model
├── shared/                # Shared code between frontend and backend
│   └── schema.ts          # Database schema and type definitions
└── data/                  # Example data and schemas
```

## 🤝 Contributing

Contributions are welcome! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgements

- Credit card dataset from ULB: [Kaggle - Credit Card Fraud Detection](https://www.kaggle.com/mlg-ulb/creditcardfraud)
- Icons from [Lucide React](https://lucide.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com/)