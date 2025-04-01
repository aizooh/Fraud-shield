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

// Fallback prediction if the model service is not available
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
  
  // Enhanced fraud detection logic using more features
  
  // Feature 1: Amount - High value transactions are more suspicious
  if (amount > 2000) {
    fraudScore += 0.4;
  } else if (amount > 1000) {
    fraudScore += 0.2;
  } else if (amount > 500) {
    fraudScore += 0.1;
  }
  
  // Feature 2: Merchant categories with higher fraud rates
  if (transaction.merchantCategory === "ecommerce") {
    fraudScore += 0.15;
  } else if (transaction.merchantCategory === "travel") {
    fraudScore += 0.1;
  } else if (transaction.merchantCategory === "electronics") {
    fraudScore += 0.1;
  }
  
  // Feature 3: Card entry methods with higher fraud rates
  if (transaction.cardEntryMethod === "manual") {
    fraudScore += 0.2;
  } else if (transaction.cardEntryMethod === "online") {
    fraudScore += 0.15;
  }
  
  // Feature 4: Location risk factor
  if (transaction.location === "abnormal" || transaction.location === "foreign") {
    fraudScore += 0.3;
  }
  
  // Feature 5: Time-based risk factors
  // Weekend transactions
  const dayOfWeek = transaction.transactionTime.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
  if (isWeekend) {
    fraudScore += 0.05;
  }
  
  // Late night/early morning transactions
  const hourOfDay = transaction.transactionTime.getHours();
  if (hourOfDay < 6 || hourOfDay > 22) {
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
