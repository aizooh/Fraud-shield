#!/bin/bash
set -e

# Make sure build.sh is executable
echo "Starting build process for Fraud Detection System..."

# Check if node is installed
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed"
  exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "Error: npm is not installed"
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm ci --production=false

# Build the application
echo "Building application..."
npm run build

# Make production start script executable
chmod +x ./prod-start.sh

# Check if Python is needed for model service
if [ -d "./model_service" ]; then
  echo "Checking model service requirements..."
  
  # Check if Python is installed
  if ! command -v python3 &> /dev/null; then
    echo "Warning: Python 3 is not installed. Model service may not work."
  else
    # Check if pip is installed
    if ! command -v pip3 &> /dev/null; then
      echo "Warning: pip3 is not installed. Model service dependencies cannot be installed."
    else
      # Check if requirements.txt exists
      if [ -f "./model_service/requirements.txt" ]; then
        echo "Installing model service dependencies..."
        pip3 install -r ./model_service/requirements.txt
      else
        echo "Warning: model_service/requirements.txt not found. Cannot install model service dependencies."
      fi
    fi
  fi
fi

echo "Build complete! Run './prod-start.sh' to start the application in production mode."