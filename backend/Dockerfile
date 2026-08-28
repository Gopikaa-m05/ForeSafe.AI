FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for reportlab / numpy / compilers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Generate NASA JM1 dataset and train baseline models
RUN python data/generate_jm1.py && python app/ml/train.py

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
