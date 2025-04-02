# Deployment Guide for Fraud Shield

This document provides instructions for deploying the Fraud Shield application in various environments.

## Table of Contents

1. [Deployment Options](#deployment-options)
2. [Environment Configuration](#environment-configuration)
3. [Docker Deployment](#docker-deployment)
4. [Standalone Deployment](#standalone-deployment)
5. [Database Setup](#database-setup)
6. [Model Service Deployment](#model-service-deployment)
7. [Testing the Deployment](#testing-the-deployment)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

## Deployment Options

Fraud Shield can be deployed in several ways:

1. **Docker Deployment**: Using Docker and Docker Compose for containerized deployment
2. **Standalone Deployment**: Directly on a server or cloud VM
3. **Cloud Platform Deployment**: Using services like AWS, GCP, or Azure

## Environment Configuration

Before deployment, configure the environment variables in `.env` file:

```
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/fraudshield
PGUSER=username
PGPASSWORD=password
PGHOST=localhost
PGPORT=5432
PGDATABASE=fraudshield

# Session Configuration
SESSION_SECRET=your-secure-session-secret

# Model Service URLs
MODEL_SERVICE_URL=http://localhost:8001
STREAMLIT_URL=http://localhost:8501

# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CALLBACK_URL=http://localhost:5000/auth/google/callback

# General
NODE_ENV=production
PORT=5000
```

## Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- Git to clone the repository

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/fraud-shield.git
   cd fraud-shield
   ```

2. Create and configure the `.env` file as described above.

3. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

   This will start three containers:
   - Web application (Express + React)
   - PostgreSQL database
   - Model service (Flask API)

4. Verify the deployment:
   ```bash
   docker-compose ps
   ```

5. Access the application at `http://localhost:5000`

## Standalone Deployment

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- PostgreSQL database
- PM2 or similar process manager

### Backend and Frontend

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/fraud-shield.git
   cd fraud-shield
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create and configure the `.env` file.

4. Build the frontend:
   ```bash
   npm run build
   ```

5. Start the application:
   ```bash
   # Using Node.js directly
   npm run start

   # Using PM2
   pm2 start npm --name "fraud-shield" -- start
   ```

### Model Service

1. Navigate to the model service directory:
   ```bash
   cd model_service
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the Flask API:
   ```bash
   # Using Python directly
   python run.py

   # Using PM2
   pm2 start run.py --name "fraud-shield-model" --interpreter python
   ```

## Database Setup

### PostgreSQL Setup

1. Create a PostgreSQL database:
   ```bash
   createdb fraudshield
   ```

2. The application will automatically create the required tables on first run.

3. For manual setup, run:
   ```bash
   npm run db:push
   ```

## Model Service Deployment

The model service can be deployed in two ways:

1. **As part of Docker Compose** (recommended for development and testing)
2. **As a standalone service** (recommended for production)

### Standalone Model Service

1. Set up a Python environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the Flask API:
   ```bash
   python run.py
   ```

4. Start the Streamlit dashboard (optional):
   ```bash
   cd model_service
   streamlit run streamlit_app.py
   ```

5. Update the `.env` file to point to the model service URL.

## Testing the Deployment

1. **API Health Check**:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Model Service Check**:
   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{"amount": 100, "merchantCategory": "test", "cardEntryMethod": "online"}' http://localhost:8001/predict
   ```

3. **Web Interface**: Navigate to `http://localhost:5000` in your browser.

## Monitoring and Maintenance

### Monitoring

1. **Application Logs**:
   - Docker: `docker-compose logs -f web`
   - Standalone: Check PM2 logs or the application logs

2. **Database Monitoring**:
   - Use pgAdmin or a similar tool to monitor the PostgreSQL database

3. **Health Checks**:
   - Set up periodic health checks against `/api/health` endpoint

### Backup and Restore

1. **Database Backup**:
   ```bash
   pg_dump -U username -d fraudshield > backup.sql
   ```

2. **Database Restore**:
   ```bash
   psql -U username -d fraudshield < backup.sql
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Verify DATABASE_URL is correct
   - Check PostgreSQL is running
   - Ensure the database user has appropriate permissions

2. **Model Service Connection Issues**:
   - Verify MODEL_SERVICE_URL is correct
   - Check the Flask API is running
   - Check network connectivity between services

3. **Web Application Issues**:
   - Check server logs for errors
   - Verify environment variables are properly set
   - Check browser console for frontend errors

### Getting Help

If you encounter issues not covered in this guide, please:
1. Check the error logs
2. Review the README.md for additional information
3. Contact the development team for support

---

© 2025 Fraud Shield. All rights reserved.