# Fraud Detection System

A sophisticated credit card fraud detection system leveraging machine learning to provide real-time transaction risk analysis and user-friendly security insights.

## Features

- Real-time fraud detection using machine learning
- Secure user authentication with role-based access control
- Interactive dashboard with fraud visualization
- Transaction history and management
- User profile management
- Detailed fraud analytics

## Technology Stack

- **Frontend**: React with TypeScript, Chart.js for visualizations
- **Backend**: Express.js with Node.js
- **Database**: PostgreSQL
- **Machine Learning**: Python, scikit-learn, Flask API
- **Visualization**: Streamlit dashboard

## Quick Start

### Prerequisites

- Node.js 20.x or later
- Python 3.11 or later
- PostgreSQL 15.x or later

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fraud-detection-system.git
   cd fraud-detection-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit the .env file with your database credentials and other settings
   ```

4. Set up the database:
   ```bash
   ./db-setup.sh
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Start the model service:
   ```bash
   cd model_service
   python run.py --api
   ```

7. (Optional) Start the Streamlit dashboard:
   ```bash
   cd model_service
   python run.py --streamlit
   ```

## Deployment

For detailed deployment instructions, please refer to the [Deployment Guide](DEPLOYMENT.md).

### Quick Deployment Options

1. **Replit**:
   - Click the "Deploy" button in your Replit project
   - Follow the on-screen instructions

2. **Docker**:
   - Use Docker Compose:
     ```bash
     docker-compose up -d
     ```

3. **Manual Deployment**:
   - Build the application:
     ```bash
     ./build.sh
     ```
   - Deploy the `dist` directory to your server
   - Run `./prod-start.sh` on your server

## Default Admin Access

- Username: `admin`
- Password: `password123`

**IMPORTANT**: For production, please change the admin password immediately after first login.

## Architecture

The system consists of three main components:

1. **Web Application**: A React/TypeScript frontend with Express.js backend
2. **Machine Learning Service**: A Flask API serving the fraud detection model
3. **Database**: PostgreSQL for storing user data, transactions, and analytics

## License

[MIT License](LICENSE)

## Support

For support, please create an issue in the repository.