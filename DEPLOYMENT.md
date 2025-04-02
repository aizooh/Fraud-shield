# Fraud Shield Deployment Guide

This guide provides detailed instructions for deploying the Fraud Shield application in various environments: development, production, and using Docker.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
  - [Development Deployment](#development-deployment)
  - [Production Deployment](#production-deployment)
  - [Docker Deployment](#docker-deployment)
- [Database Setup](#database-setup)
- [Model Service Deployment](#model-service-deployment)
- [Security Considerations](#security-considerations)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying Fraud Shield, ensure you have the following:

- **Node.js**: Version 18.x or higher
- **Python**: Version 3.10 or higher
- **PostgreSQL**: Version 14.x or higher
- **Docker** (optional): For containerized deployment
- **Git**: For source code management
- **npm**: For Node.js package management
- **pip**: For Python package management

## Environment Configuration

The application requires specific environment variables to operate correctly. Create a `.env` file in the project root with the following variables:

```
# Database connection
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# Session management
SESSION_SECRET=your_secure_random_string

# Service endpoints
MODEL_SERVICE_URL=http://localhost:8001
STREAMLIT_URL=http://localhost:8501

# Authentication (required for OAuth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional settings
NODE_ENV=production  # For production environments
PORT=3000            # Web application port
```

## Deployment Options

### Development Deployment

For development environments, use the following steps:

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

3. **Set up the database**
   ```bash
   # Initialize the database schema
   npm run db:push
   ```

4. **Start development servers**
   ```bash
   # Start all services in development mode
   npm run dev
   ```

This will start:
- The frontend development server
- The backend API server
- The Flask ML service
- The Streamlit dashboard (optional)

### Production Deployment

For production environments, follow these steps:

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   # Start the server with Node.js
   npm run start
   
   # Or use PM2 for process management
   pm2 start prod-start.sh --name fraud-shield
   ```

3. **Start the model service**
   ```bash
   # Navigate to the model service directory
   cd model_service
   
   # Start the Flask API
   python flask_api.py
   
   # Optionally start the Streamlit dashboard
   python -m streamlit run streamlit_app.py
   ```

4. **Set up a reverse proxy (recommended)**

   Configure Nginx or Apache to serve the application with SSL:

   **Nginx example configuration:**
   ```nginx
   server {
       listen 80;
       server_name yourdomainname.com;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl;
       server_name yourdomainname.com;

       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;

       # Frontend and backend API
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Model service API
       location /model/ {
           proxy_pass http://localhost:8001/;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Streamlit dashboard (optional)
       location /dashboard/ {
           proxy_pass http://localhost:8501/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Docker Deployment

For containerized deployments using Docker:

1. **Build and start the containers**
   ```bash
   # Build and start all services
   docker-compose up -d
   ```

2. **For manual builds (optional)**
   ```bash
   # Build the application container
   docker build -t fraud-shield-app .
   
   # Build the model service container
   docker build -t fraud-shield-model -f model_service/Dockerfile ./model_service
   
   # Run the containers
   docker run -d -p 3000:3000 --env-file .env fraud-shield-app
   docker run -d -p 8001:8001 fraud-shield-model
   ```

The `docker-compose.yml` file configures the following services:
- **app**: The main application (frontend and backend API)
- **db**: PostgreSQL database
- **model**: Machine learning service
- **dashboard** (optional): Streamlit visualization dashboard

## Database Setup

### Initial Setup

1. **Create a PostgreSQL database**
   ```bash
   createdb fraud_shield
   ```

2. **Run the database migrations**
   ```bash
   npm run db:push
   ```

### Migration and Backup

For ongoing database maintenance:

1. **To update the database schema after changes**
   ```bash
   npm run db:push
   ```

2. **To backup the database**
   ```bash
   pg_dump -U username -d fraud_shield > backup_$(date +%Y%m%d).sql
   ```

3. **To restore from backup**
   ```bash
   psql -U username -d fraud_shield < backup_file.sql
   ```

## Model Service Deployment

The fraud detection model service can be deployed in several ways:

### Standalone Service

1. **Start the Flask API server**
   ```bash
   cd model_service
   python flask_api.py
   ```

### Using Docker

1. **Build and run the container**
   ```bash
   docker build -t fraud-shield-model -f model_service/Dockerfile ./model_service
   docker run -d -p 8001:8001 fraud-shield-model
   ```

### Using Cloud Services

The model service can be deployed to:

- **AWS Lambda** with API Gateway
- **Google Cloud Run** for serverless deployment
- **Azure Functions** with HTTP triggers

Example for Google Cloud Run:

```bash
# Build the container
gcloud builds submit --tag gcr.io/your-project/fraud-model-api ./model_service

# Deploy to Cloud Run
gcloud run deploy fraud-model-api \
  --image gcr.io/your-project/fraud-model-api \
  --platform managed \
  --allow-unauthenticated
```

## Security Considerations

To ensure a secure deployment:

1. **Use strong, unique passwords** for:
   - Database access
   - Session secret
   - API keys

2. **Enable HTTPS** for all services using Let's Encrypt or similar services

3. **Set up proper firewalls** to restrict access:
   - Only the main application should be accessible from the internet
   - The model service should only accept connections from the main application
   - The database should only accept connections from the application server

4. **Regularly update dependencies** to patch security vulnerabilities:
   ```bash
   npm audit fix
   ```

5. **Implement rate limiting** to prevent abuse

## Monitoring and Maintenance

For effective monitoring and maintenance:

1. **Set up health checks** to monitor service availability
   - The application provides `/api/health` endpoints
   - The model service provides `/health` endpoint

2. **Configure logging** for both the application and model service
   - Standard logs are written to stdout/stderr
   - Consider using a logging service like Logstash, Datadog, or CloudWatch

3. **Schedule backups** for the database and model files

4. **Set up alerts** for critical failures or anomalies

## Troubleshooting

### Common Issues and Solutions

1. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check that the PostgreSQL service is running
   - Ensure network connectivity between the app and database

2. **Model Service Not Responding**
   - Verify the model service is running on the configured port
   - Check the MODEL_SERVICE_URL in the environment variables
   - Look for errors in the model service logs

3. **Authentication Problems**
   - Ensure SESSION_SECRET is properly set
   - Verify Google OAuth credentials if using Google authentication

4. **Model Accuracy Issues**
   - The model can be retrained with updated data
   - See MODEL_DOCUMENTATION.md for details on retraining

For additional help, check the logs or file an issue on the project repository.