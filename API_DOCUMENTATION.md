# Fraud Shield API Documentation

## Overview

This document provides API specifications for the fraud detection service used in Fraud Shield. The API provides real-time fraud risk assessment for credit card transactions.

## Base URL

```
http://localhost:8001
```

## Authentication

The API does not currently require authentication, but it is designed to be used only by the Fraud Shield backend service, not directly by clients.

## Endpoints

### 1. Health Check

**Endpoint:** `GET /health`

**Purpose:** Verify the API service is operational and the model is loaded correctly.

**Response Example (Success - 200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2025-04-02T12:34:56.789Z",
  "version": "1.0.0",
  "model_loaded": true,
  "model_status": "ok"
}
```

**Response Example (Degraded - 500 Internal Server Error):**
```json
{
  "status": "degraded",
  "timestamp": "2025-04-02T12:34:56.789Z",
  "version": "1.0.0",
  "model_loaded": true,
  "model_status": "error",
  "error": "Failed to make test prediction"
}
```

### 2. Fraud Prediction

**Endpoint:** `POST /predict`

**Purpose:** Analyze a transaction and predict the likelihood of fraud.

**Request Body:**
```json
{
  "amount": 1299.99,
  "merchantCategory": "electronics",
  "location": "abnormal",
  "ipAddress": "203.0.113.1",
  "cardEntryMethod": "online",
  "timestamp": "2025-04-02T03:25:00Z"
}
```

**Required Fields:**
- `amount` (number): Transaction amount
- `merchantCategory` (string): Category of the merchant
- `cardEntryMethod` (string): Method used to process the card

**Optional Fields:**
- `location` (string): Transaction location
- `ipAddress` (string): IP address used for the transaction
- `timestamp` (string): ISO-8601 formatted date-time

**Response Example (Success - 200 OK):**
```json
{
  "is_fraud": true,
  "confidence": 0.85,
  "risk_level": "high"
}
```

**Response Example (Error - 400 Bad Request):**
```json
{
  "error": "Invalid request data"
}
```

**Response Example (Error - 500 Internal Server Error):**
```json
{
  "error": "Prediction error: Model failed to process request"
}
```

## Data Types

### Risk Levels

The API categorizes risk into three levels based on the confidence score:

- `low`: Confidence score < 0.4
- `medium`: Confidence score between 0.4 and 0.7
- `high`: Confidence score > 0.7

### Card Entry Methods

The API recognizes the following card entry methods, which influence fraud risk assessment:

- `chip`: EMV chip transactions (typically lower risk)
- `contactless`: NFC/contactless transactions (typically medium risk)
- `swipe`: Magnetic stripe swipe (typically medium-high risk)
- `manual`: Manual key entry (typically high risk)
- `online`: E-commerce/online transactions (typically higher risk)

### Merchant Categories

The following merchant categories are recognized and used for risk assessment:

- `electronics`: Electronics retailers
- `food_beverage`: Restaurants, cafes, food delivery
- `entertainment`: Movies, events, gaming
- `travel`: Airlines, hotels, travel agencies
- `ecommerce`: Online-only merchants
- `retail`: General retail stores
- `fuel`: Gas stations
- `luxury`: High-end retailers

## Error Handling

The API uses standard HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid input parameters
- `500 Internal Server Error`: Server-side error

All error responses include an `error` field with a description of the problem.

## Fallback Mechanism

If the ML model fails to load or process a request, the API uses a rules-based fallback system that:

1. Evaluates transaction amount (higher amounts increase risk)
2. Considers card entry method (manual and online methods have higher risk)
3. Checks merchant category (certain categories have higher fraud rates)
4. Analyzes location information (abnormal locations increase risk)
5. Evaluates time patterns (late night/early morning transactions increase risk)

This ensures the API always returns a response even in degraded operation mode.

## Rate Limiting

The API employs rate limiting to prevent abuse:

- 100 requests per minute per IP address
- 5,000 requests per day per IP address

Exceeding these limits results in `429 Too Many Requests` responses.

## Performance Characteristics

- **Average response time:** < 100ms
- **99th percentile response time:** < 250ms
- **Maximum concurrent requests:** 100
- **Availability target:** 99.9%

## Integration Example

### Python Example
```python
import requests
import json

url = "http://localhost:8001/predict"
transaction = {
    "amount": 1299.99,
    "merchantCategory": "electronics",
    "cardEntryMethod": "online",
    "location": "abnormal",
    "timestamp": "2025-04-02T03:25:00Z"
}

response = requests.post(url, json=transaction)
result = response.json()

print(f"Fraud Detection Result: {json.dumps(result, indent=2)}")
```

### JavaScript/Node.js Example
```javascript
const axios = require('axios');

const transaction = {
  amount: 1299.99,
  merchantCategory: "electronics",
  cardEntryMethod: "online",
  location: "abnormal",
  timestamp: "2025-04-02T03:25:00Z"
};

axios.post('http://localhost:8001/predict', transaction)
  .then(response => {
    console.log('Fraud Detection Result:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });
```

## Deployment

The API service is containerized using Docker and can be deployed using:

```bash
docker run -p 8001:8001 -e MODEL_PATH=/app/models/credit_card_model.pkl fraud-detection-api
```

The Fraud Shield platform uses Docker Compose to orchestrate the backend, frontend, and model service deployments.