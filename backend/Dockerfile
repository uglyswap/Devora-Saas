FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port 4521
EXPOSE 4521

# Run with uvicorn on port 4521
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "4521"]
