#!/bin/bash
set -e

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | sed 's/\r$//' | xargs)
fi

# Set default port if not provided
PORT=${PORT:-3000}
NODE_ENV=${NODE_ENV:-production}

# Check if node is installed
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed"
  exit 1
fi

# Check if the dist directory exists
if [ ! -d "./dist" ]; then
  echo "Error: Build directory not found. Run 'npm run build' first."
  exit 1
fi

# Check if database environment variables are set
if [ -z "$DATABASE_URL" ]; then
  echo "Warning: DATABASE_URL is not set. Database connectivity may be impaired."
fi

# Check if model service URL is set
if [ -z "$MODEL_SERVICE_URL" ]; then
  echo "Warning: MODEL_SERVICE_URL is not set. Fraud detection may be impaired."
fi

# Start the application
echo "Starting Fraud Detection System in production mode on port $PORT..."
NODE_ENV=$NODE_ENV node ./dist/server/index.js