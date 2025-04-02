# Fraud Shield - Credit Card Fraud Detection System

Fraud Shield is a comprehensive credit card fraud detection system that leverages machine learning to provide real-time transaction risk analysis and user-friendly security insights.

![Fraud Shield Logo](/generated-icon.png)

## Overview

Fraud Shield is a sophisticated fraud detection platform designed to protect businesses from fraudulent credit card transactions. It combines a robust machine learning model with a user-friendly interface to detect, analyze, and report potential fraud in real-time.

The platform provides:
- Real-time fraud detection for individual transactions
- Batch analysis of transaction data via CSV import
- Comprehensive dashboard with fraud trends and patterns
- User management with role-based access control
- Detailed transaction history and analytics

## System Architecture

Fraud Shield consists of three main components:

1. **Frontend** (React.js with TypeScript)
   - Modern UI with responsive design
   - Interactive dashboards and visualizations
   - Forms for fraud detection and CSV import
   - User management and authentication

2. **Backend** (Node.js with Express)
   - RESTful API for transaction processing
   - Authentication and authorization
   - Data persistence with PostgreSQL
   - CSV file handling and analysis

3. **Model Service** (Python with Flask)
   - Machine learning model for fraud detection
   - Real-time prediction API
   - Data preprocessing
   - Model training and evaluation
   - Streamlit dashboard for model insights

## Features

### Authentication & Authorization
- User registration and login
- Google OAuth integration
- Role-based access control (admin/user)
- Secure session management
- User profile management

### Fraud Detection
- Real-time transaction analysis
- Risk level assessment (low, medium, high)
- Confidence scoring
- Fallback mechanism for model unavailability

### Data Management
- Transaction recording and history
- CSV batch processing
- Data visualization and trends
- Analytics and reporting

### Dashboard
- Overview of fraud statistics
- Transaction volume monitoring
- Merchant category analysis
- Card entry method analysis
- Amount distribution visualization

## Technical Stack

### Frontend
- React.js with TypeScript
- TanStack Query for data fetching
- Redux for state management
- Chart.js and Recharts for visualizations
- Tailwind CSS and shadcn/ui for styling
- Wouter for routing

### Backend
- Node.js with Express
- TypeScript for type safety
- Drizzle ORM for database operations
- Zod for data validation
- Passport.js for authentication
- Multer for file uploads
- CSV parse for data processing

### Model Service
- Python Flask API
- Scikit-learn for model training
- Streamlit for model dashboard
- Pandas for data manipulation
- Joblib for model serialization

### Database
- PostgreSQL for data storage
- Drizzle ORM for schema definition
- Connection pooling for performance

## Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- PostgreSQL

### Environment Setup
Copy the example environment file and update it with your settings:
```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `MODEL_SERVICE_URL`: URL of the Flask model service
- `STREAMLIT_URL`: URL of the Streamlit dashboard
- `NODE_ENV`: Environment (development/production)

### Installation

#### Backend and Frontend
```bash
# Install Node.js dependencies
npm install

# Start the application
npm run dev
```

#### Model Service
```bash
# Navigate to model service directory
cd model_service

# Install Python dependencies
pip install -r requirements.txt

# Start the Flask API
python run.py
```

## Usage

### Authentication
1. Navigate to `/auth` to register or log in
2. Use your credentials or Google sign-in option
3. Update your profile information as needed

### Fraud Detection
1. Navigate to `/fraud-detection`
2. For single transactions:
   - Fill in the transaction details form
   - Submit for real-time analysis
3. For batch processing:
   - Prepare a CSV file with transaction data
   - Upload through the CSV import form
   - View the analysis results and charts

### Dashboard
1. Navigate to the main dashboard at `/dashboard`
2. Review fraud statistics and trends
3. Explore different visualization tabs
4. Filter data as needed

### Transaction History
1. Navigate to `/transactions`
2. Browse through the list of processed transactions
3. View details of individual transactions
4. Search and filter by various criteria

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Log in a user
- `POST /api/logout` - Log out a user
- `GET /api/user` - Get current user details

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create a new transaction

### Fraud Detection
- `POST /api/detect-fraud` - Process and detect fraud for a transaction
- `POST /api/fraud/predict` - Get prediction without storing transaction
- `POST /api/analyze-csv` - Analyze a CSV file of transactions

### Analytics
- `GET /api/stats` - Get transaction statistics
- `GET /api/analytics` - Get detailed analytics data

## Security Considerations

Fraud Shield implements several security measures:
- Password hashing with scrypt
- HTTPS for all connections
- Session-based authentication
- CSRF protection
- Input validation with Zod
- Role-based access control
- Secure HTTP headers
- Database connection pooling
- Rate limiting on sensitive endpoints

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or support, please contact the development team.

---

© 2025 Fraud Shield. All rights reserved.