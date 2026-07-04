# Stage 1: Build the React frontend
FROM node:20-alpine AS build-step
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the Flask backend
FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
# Gunicorn is needed for production server
RUN pip install gunicorn

# Copy backend source
COPY . .

# Copy built frontend assets from the build stage
COPY --from=build-step /app/frontend/dist /app/frontend/dist

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Run gunicorn server
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "3", "app:create_app()"]
