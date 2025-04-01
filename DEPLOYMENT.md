# Fraud Detection System Deployment Guide

This document provides instructions for deploying the Fraud Detection System in various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Deployment Options](#deployment-options)
   - [Replit Deployment](#replit-deployment)
   - [Docker Deployment](#docker-deployment)
   - [Manual Deployment](#manual-deployment)
4. [Database Setup](#database-setup)
5. [Model Service Deployment](#model-service-deployment)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 20.x or later
- Python 3.11 or later
- PostgreSQL 15.x or later
- Docker and Docker Compose (for containerized deployment)
- Git

## Environment Configuration

The application requires several environment variables to be set. Copy `.env.example` to `.env` and update the values:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/fraud_detection
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=fraud_detection

# Session
SESSION_SECRET=your-secure-session-secret

# Model Service
MODEL_SERVICE_URL=http://localhost:8001

# Authentication (Google OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CALLBACK_URL=http://localhost:3000/auth/google/callback
```

## Deployment Options

### Replit Deployment

1. **Setup on Replit**:
   - Fork the repository on Replit
   - Configure the environment secrets in the Replit UI
   - Click the "Deploy" button in your Replit project

2. **Post-Deployment**:
   - Access your application at the provided `.replit.app` domain
   - Run the database initialization script if needed

### Docker Deployment

1. **Build and Deploy with Docker Compose**:

   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/fraud-detection-system.git
   cd fraud-detection-system

   # Configure environment variables
   cp .env.example .env
   # Edit .env with your settings

   # Start the services
   docker-compose up -d
   ```

2. **Access Services**:
   - Main application: http://localhost:3000
   - Flask API: http://localhost:8001
   - Streamlit dashboard: http://localhost:8501

3. **Scaling with Docker Swarm or Kubernetes**:
   
   For production environments, consider using Docker Swarm or Kubernetes:

   ```bash
   # Initialize a Docker Swarm
   docker swarm init

   # Deploy the stack
   docker stack deploy -c docker-compose.yml fraud-detection
   ```

### Manual Deployment

1. **Backend and Frontend Build**:

   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/fraud-detection-system.git
   cd fraud-detection-system

   # Install dependencies
   npm install

   # Build the application
   npm run build

   # Start the application
   ./prod-start.sh
   ```

2. **Model Service Deployment**:

   ```bash
   cd model_service
   
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Start the Flask API
   python run.py --api
   
   # Start the Streamlit dashboard (optional)
   python run.py --streamlit
   ```

3. **Running with Process Manager**:

   For production environments, use a process manager like PM2:

   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start the main application with PM2
   pm2 start ./prod-start.sh --name fraud-detection
   
   # Start the model service
   pm2 start --name model-api -- python model_service/run.py --api
   
   # Setup startup configuration
   pm2 startup
   pm2 save
   ```

## Database Setup

1. **PostgreSQL Setup**:

   ```bash
   # Run the database setup script
   ./db-setup.sh
   ```

   Or manually:

   ```bash
   # Create the database
   createdb fraud_detection
   
   # Run the migrations
   npm run db:push
   ```

2. **Database Migrations**:

   When updating the application:

   ```bash
   npm run db:push
   ```

## Model Service Deployment

The model service can be deployed in two ways:

1. **As Part of Docker Compose**:
   - The docker-compose.yml file includes configurations for the Flask API and Streamlit dashboard

2. **Standalone Deployment**:
   - Deploy the Flask API:
     ```bash
     cd model_service
     python run.py --api
     ```
   - Deploy the Streamlit dashboard:
     ```bash
     cd model_service
     python run.py --streamlit
     ```

## Monitoring and Maintenance

1. **Health Checks**:
   - The application provides a health check endpoint at `/api/health`
   - Use this endpoint in your monitoring system

2. **Logs**:
   - Application logs are available in the standard output or pm2 logs
   - Monitor logs for errors and performance issues

3. **Backup Procedures**:
   - Regularly backup the PostgreSQL database:
     ```bash
     pg_dump -U postgres -d fraud_detection > backup_$(date +%Y%m%d).sql
     ```

## Troubleshooting

1. **Database Connection Issues**:
   - Verify the PostgreSQL connection parameters
   - Check if the PostgreSQL service is running

2. **Model Service Issues**:
   - Verify that the Flask API is running and accessible
   - Check the MODEL_SERVICE_URL environment variable

3. **Authentication Problems**:
   - Verify the Google OAuth credentials
   - Ensure the callback URL is correctly configured

4. **Application Not Starting**:
   - Check the application logs
   - Verify all environment variables are set correctly
   - Ensure all dependencies are installed

For additional support, please open an issue in the repository or contact the development team.