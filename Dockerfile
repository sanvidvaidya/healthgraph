# HealthGraph Production Container
FROM python:3.12-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends     curl     && rm -rf /var/lib/apt/lists/*

# Copy python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application and entrypoint
COPY healthgraph/ healthgraph/
COPY app.py .

# Copy pre-compiled frontend assets
COPY frontend/dist/ frontend/dist/

# Expose port
EXPOSE 8000

ENV HOST=0.0.0.0
ENV PORT=8000

# Start Starlette application
CMD ["python", "-m", "uvicorn", "healthgraph.app:app", "--host", "0.0.0.0", "--port", "8000"]
