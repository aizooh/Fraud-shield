import os
import subprocess
import sys
import time
import threading

def run_flask_api():
    """Run the Flask API server"""
    print("Starting Flask API server...")
    subprocess.run([sys.executable, "model_service/flask_api.py"])

def run_streamlit_app():
    """Run the Streamlit dashboard"""
    print("Starting Streamlit dashboard...")
    subprocess.run([sys.executable, "-m", "streamlit", "run", "model_service/streamlit_app.py", 
                    "--server.port", "8501", "--server.address", "0.0.0.0"])

if __name__ == "__main__":
    # Create threads for both applications
    flask_thread = threading.Thread(target=run_flask_api)
    streamlit_thread = threading.Thread(target=run_streamlit_app)
    
    # Start both threads
    flask_thread.start()
    
    # Give Flask a moment to start
    time.sleep(2)
    
    streamlit_thread.start()
    
    # Wait for threads to complete
    flask_thread.join()
    streamlit_thread.join()