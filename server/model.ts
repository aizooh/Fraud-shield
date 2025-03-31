import { TransactionResult } from "@shared/schema";

// This service would normally communicate with a Python FastAPI service
// that loads and serves the .pkl model. For this implementation, we'll create
// a simulation of the model's behavior.

export async function predictFraud(transaction: {
  amount: string;
  merchantCategory: string;
  location: string;
  ipAddress: string;
  cardEntryMethod: string;
  transactionTime: Date;
}): Promise<TransactionResult> {
  // In a real implementation, this function would make an HTTP request to the Python service
  // For now, we'll simulate the model's predictions

  // Parse amount as a number
  const amount = parseFloat(transaction.amount);

  // Simulated fraud detection logic
  let fraudScore = 0;
  
  // High value transactions are more suspicious
  if (amount > 1000) {
    fraudScore += 0.3;
  } else if (amount > 500) {
    fraudScore += 0.1;
  }
  
  // Merchant categories with higher fraud rates
  if (transaction.merchantCategory === "ecommerce") {
    fraudScore += 0.2;
  }
  
  // Card entry methods with higher fraud rates
  if (transaction.cardEntryMethod === "manual" || transaction.cardEntryMethod === "online") {
    fraudScore += 0.3;
  }
  
  // Add some randomness
  fraudScore += Math.random() * 0.2;
  
  // Cap the score at 0.95 for simulation purposes
  fraudScore = Math.min(fraudScore, 0.95);
  
  // Determine risk level
  let riskLevel: "low" | "medium" | "high";
  if (fraudScore > 0.7) {
    riskLevel = "high";
  } else if (fraudScore > 0.4) {
    riskLevel = "medium";
  } else {
    riskLevel = "low";
  }
  
  // Determine if it's fraud based on the score
  const isFraud = fraudScore > 0.7;
  
  return {
    is_fraud: isFraud,
    confidence: parseFloat(fraudScore.toFixed(2)),
    risk_level: riskLevel
  };
}
