#!/bin/bash

# Start the Node.js application and Flask/Streamlit model service in parallel

# Start the model service in a separate process
echo "Starting model service..."
python model_service/run.py &
MODEL_SERVICE_PID=$!

# Give the model service a moment to start
sleep 2

# Start the main application
echo "Starting main application..."
npm run dev

# If the main application exits, kill the model service
kill $MODEL_SERVICE_PID