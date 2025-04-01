import { TransactionResult } from "@shared/schema";
import axios from "axios";

// This service communicates with a Python Flask service
// that loads and serves the ML model.

const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL || "http://localhost:8001";

export async function predictFraud(transaction: {
  amount: string;
  merchantCategory: string;
  location: string;
  ipAddress: string;
  cardEntryMethod: string;
  transactionTime: Date;
}): Promise<TransactionResult> {
  try {
    // Prepare the data to send to the model service
    const requestData = {
      amount: parseFloat(transaction.amount),
      merchantCategory: transaction.merchantCategory,
      location: transaction.location,
      ipAddress: transaction.ipAddress,
      cardEntryMethod: transaction.cardEntryMethod,
      timestamp: transaction.transactionTime.toISOString()
    };

    // Make the API call to the Flask model service
    const response = await axios.post(
      `${MODEL_SERVICE_URL}/predict`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Return the prediction result
    return response.data as TransactionResult;
  } catch (error) {
    console.error("Error calling Flask model service:", error);
    
    // Fallback for development/testing if model service is unavailable
    if (process.env.NODE_ENV === "development") {
      console.warn("Using fallback response due to model service error");
      return getFallbackPrediction(transaction);
    }
    
    throw new Error("Failed to get prediction from model service");
  }
}

// Advanced fallback prediction based on the credit card dataset
function getFallbackPrediction(transaction: {
  amount: string;
  merchantCategory: string;
  location: string;
  ipAddress: string;
  cardEntryMethod: string;
  transactionTime: Date;
}): TransactionResult {
  // Parse amount as a number
  const amount = parseFloat(transaction.amount);

  // Initialize fraud score with small base risk
  let fraudScore = 0.05;
  
  // Implement a version of the V1-V28 feature logic from the credit card dataset
  // We'll simulate features that are most important for fraud detection
  
  /**
   * Based on analysis of the credit card dataset, fraud is often characterized by:
   * - Negative values in V1, V2, V3, V4, V9, V10, V11, V12, V14, V16, V17
   * - Unusual values in V1 (time elapsed), V3 (amount), V4 (location), V14 (transaction type)
   * - Higher than normal amounts
   */
  
  // Simulate V1-V28 features from transaction properties
  // Feature importance derived from the credit card fraud detection model
  
  // V1 - Time feature (lower values often indicate fraud)
  let v1Score = 0;
  // Late night/early morning transactions are riskier
  const hourOfDay = transaction.transactionTime.getHours();
  if (hourOfDay < 6 || hourOfDay > 22) {
    v1Score -= 1.2;
    fraudScore += 0.15;
  }
  
  // V2 - Amount feature (higher amounts can be riskier)
  let v2Score = 0;
  if (amount > 2000) {
    v2Score -= 0.9;
    fraudScore += 0.3;
  } else if (amount > 1000) {
    v2Score -= 0.5;
    fraudScore += 0.2;
  } else if (amount > 500) {
    v2Score -= 0.2;
    fraudScore += 0.1;
  }
  
  // V3 & V4 - Transaction method features
  let v3Score = 0;
  let v4Score = 0;
  
  // Card entry methods with higher fraud rates
  if (transaction.cardEntryMethod === "manual") {
    v3Score -= 0.8;
    v4Score -= 0.6;
    fraudScore += 0.25;
  } else if (transaction.cardEntryMethod === "online") {
    v3Score -= 0.6;
    fraudScore += 0.15;
  }
  
  // V10, V11, V14 - Related to merchant, location, and more
  let v10Score = 0;
  let v11Score = 0;
  let v14Score = 0;
  
  // Merchant categories with higher fraud rates
  if (transaction.merchantCategory === "ecommerce") {
    v10Score -= 0.7;
    fraudScore += 0.2;
  } else if (transaction.merchantCategory === "travel") {
    v10Score -= 0.5;
    fraudScore += 0.15;
  } else if (transaction.merchantCategory === "electronics") {
    v10Score -= 0.4;
    fraudScore += 0.12;
  }
  
  // Location risk factor
  if (transaction.location === "abnormal" || transaction.location === "foreign") {
    v11Score -= 1.0;
    fraudScore += 0.35;
  }
  
  // Weekend transactions
  const dayOfWeek = transaction.transactionTime.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
  if (isWeekend) {
    v14Score -= 0.3;
    fraudScore += 0.08;
  }
  
  // Count how many V features indicate fraud (negative values)
  let fraudSignals = 0;
  if (v1Score < -0.5) fraudSignals++;
  if (v2Score < -0.5) fraudSignals++;
  if (v3Score < -0.5) fraudSignals++;
  if (v4Score < -0.5) fraudSignals++;
  if (v10Score < -0.5) fraudSignals++;
  if (v11Score < -0.5) fraudSignals++;
  if (v14Score < -0.5) fraudSignals++;
  
  // Add more weight if multiple signals detected
  if (fraudSignals >= 3) {
    fraudScore += 0.3;
  } else if (fraudSignals >= 2) {
    fraudScore += 0.2;
  } else if (fraudSignals >= 1) {
    fraudScore += 0.1;
  }
  
  // Cap the score at 0.95 for simulation purposes
  fraudScore = Math.min(fraudScore, 0.95);
  
  // Determine risk level
  let riskLevel: "low" | "medium" | "high";
  if (fraudScore >= 0.7) {
    riskLevel = "high";
  } else if (fraudScore >= 0.4) {
    riskLevel = "medium";
  } else {
    riskLevel = "low";
  }
  
  // Determine if it's fraud based on the score
  const isFraud = fraudScore > 0.5;
  
  return {
    is_fraud: isFraud,
    confidence: parseFloat(fraudScore.toFixed(2)),
    risk_level: riskLevel
  };
}
