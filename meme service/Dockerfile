# Use the official Python image.
FROM python:3.10-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY requirements.txt ./

# Install dependencies.
RUN pip install --no-cache-dir -r requirements.txt

# Copy local code to the container image.
COPY . .

# Expose the port the app runs on.
EXPOSE 9000

# Run the web service on container startup using uvicorn.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9000", "--reload"]