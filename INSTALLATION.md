# Credit Card Fraud Detection System - Installation Guide

This document provides detailed installation instructions and information about the libraries and technologies used in the Credit Card Fraud Detection System.

## System Architecture

The system consists of three main components:

1. **Frontend**: React.js with TypeScript
2. **Backend**: Node.js with Express
3. **Model Service**: Python Flask API for machine learning

## Prerequisites

- Node.js (v18.x or later)
- Python 3.11 or later
- PostgreSQL database
- npm or yarn package manager

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/credit-card-fraud-detection.git
cd credit-card-fraud-detection
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/fraud_detection
PORT=3000
SESSION_SECRET=your_session_secret
```

### 4. Set Up the Database

```bash
# Create the PostgreSQL database
createdb fraud_detection

# Run database migrations
npm run db:push
```

### 5. Install Python Dependencies

```bash
pip install flask>=3.1.0 joblib>=1.4.2 numpy>=2.2.4 pandas>=2.2.3 scikit-learn>=1.6.1 streamlit>=1.44.0
```

### 6. Start the Application

```bash
# Start the Node.js backend and React frontend
npm run dev

# In a separate terminal, start the Model Service
python model_service/run.py
```

## Project Structure

```
/client            - React frontend
/server            - Express backend
/model_service     - Python Flask API for ML
/shared            - Shared types and utilities
/data              - Sample data for testing
```

## Frontend Dependencies (React)

| Library                  | Version    | Purpose                               |
|--------------------------|------------|---------------------------------------|
| React                    | ^18.3.1    | UI library                            |
| React DOM                | ^18.3.1    | DOM manipulation                      |
| React Hook Form          | ^7.53.1    | Form handling                         |
| React Query              | ^5.60.5    | Data fetching and caching             |
| Redux Toolkit            | ^2.6.1     | State management                      |
| React Redux              | ^9.2.0     | React bindings for Redux              |
| Wouter                   | ^3.3.5     | Routing                               |
| Zod                      | ^3.23.8    | Schema validation                     |
| Chart.js                 | ^4.4.8     | Chart visualization                   |
| Recharts                 | ^2.13.0    | React charting library                |
| Lucide React             | ^0.453.0   | Icon library                          |
| TailwindCSS              | ^3.4.14    | CSS utility framework                 |
| Framer Motion            | ^11.13.1   | Animation library                     |
| Axios                    | ^1.8.4     | HTTP client                           |
| CSV Parse                | ^5.6.0     | CSV parsing                           |
| Date-fns                 | ^3.6.0     | Date utility library                  |

## Backend Dependencies (Node.js/Express)

| Library                  | Version    | Purpose                               |
|--------------------------|------------|---------------------------------------|
| Express                  | ^4.21.2    | Web framework                         |
| Express Session          | ^1.18.1    | Session management                    |
| Passport                 | ^0.7.0     | Authentication                        |
| Passport Local           | ^1.0.0     | Local authentication strategy         |
| Passport Google OAuth2.0 | ^2.0.0     | Google authentication strategy        |
| Drizzle ORM              | ^0.39.1    | ORM for database interaction          |
| Drizzle Zod              | ^0.7.0     | Zod schema integration for Drizzle    |
| PostgreSQL               | ^3.4.5     | PostgreSQL client                     |
| Multer                   | ^1.4.5-lts.2| File upload middleware               |
| Connect PG Simple        | ^10.0.0    | PostgreSQL session store              |
| Memorystore              | ^1.6.7     | In-memory session store               |
| Nanoid                   | ^5.1.5     | ID generation                         |
| WS                       | ^8.18.0    | WebSocket implementation              |

## Model Service Dependencies (Python)

| Library                  | Version    | Purpose                               |
|--------------------------|------------|---------------------------------------|
| Flask                    | >=3.1.0    | Web framework                         |
| Joblib                   | >=1.4.2    | Model serialization                   |
| NumPy                    | >=2.2.4    | Numerical computing                   |
| Pandas                   | >=2.2.3    | Data manipulation                     |
| Scikit-learn             | >=1.6.1    | Machine learning                      |
| Streamlit                | >=1.44.0   | Data visualization dashboard          |

## Development Dependencies

| Library                  | Version    | Purpose                               |
|--------------------------|------------|---------------------------------------|
| TypeScript               | 5.6.3      | Type checking                         |
| Vite                     | ^5.4.14    | Build tool                            |
| ESBuild                  | ^0.25.0    | JavaScript bundler                    |
| Drizzle Kit              | ^0.30.4    | Database migration toolkit            |
| TSX                      | ^4.19.1    | TypeScript execution                  |
| TailwindCSS              | ^3.4.14    | CSS framework                         |
| PostCSS                  | ^8.4.47    | CSS processing                        |

## Recent Changes

1. **Removed Fraud Detection Test Form**
   - Removed the individual transaction test form from the Dashboard page
   - Removed the form component import from Dashboard imports
   - Simplified the interface by focusing on analytics and CSV bulk processing

2. **Enhanced Fraud Detection Page**
   - Simplified to only show CSV upload for bulk analysis
   - Improved instructions and user guidance

3. **Analytics Dashboard Improvements**
   - Consolidated fraud metrics and visualizations
   - Added comprehensive transaction statistics
   - Enhanced the visual representation of fraud data

4. **CSV Upload Feature Restoration**
   - Restored and improved the CSV upload functionality for bulk fraud detection
   - Added proper error handling and feedback

## Usage

1. **Dashboard**: View overall fraud statistics and recent transactions
2. **Fraud Detection**: Upload CSV files for bulk transaction analysis
3. **Analytics**: Explore detailed fraud trends, categories, and metrics
4. **Transactions**: Review individual transaction details and results

## Database Schema

The system uses PostgreSQL with Drizzle ORM and includes the following main tables:
- Users
- Transactions
- Analytics Data
- User Settings

## API Endpoints

- **Authentication**: `/api/auth/*` - Login, logout, registration
- **Transactions**: `/api/transactions/*` - CRUD operations for transactions
- **Fraud Detection**: `/api/detect-fraud` - Analyze transactions for fraud
- **Analytics**: `/api/stats` - Get fraud statistics and metrics