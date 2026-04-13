#!/bin/bash
# Move to the project directory
cd "$(dirname "$0")"

echo "------------------------------------------------"
echo "Starting VerifyAI (Fake News Detector)..."
echo "------------------------------------------------"

# Activate the virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Warning: venv not found. Trying to run with system python..."
fi

# Open the browser automatically after the server starts
(sleep 3 && open "http://127.0.0.1:3000") &

# Run the app
python3 app.py
