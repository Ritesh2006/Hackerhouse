#!/bin/bash
# Start the FastAPI application with Uvicorn
# Use the PORT environment variable provided by Render, defaulting to 8000
PORT=${PORT:-8000}
echo "Starting server on port $PORT..."
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
