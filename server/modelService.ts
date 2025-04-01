import axios from "axios";
import type { FraudDetectionRequest, FraudDetectionResult } from "@shared/schema";

// Interface for the model service
interface IModelService {
  detectFraud(transaction: FraudDetectionRequest): Promise<FraudDetectionResult>;
}

// Implementation that communicates with the FastAPI microservice
class ModelServiceImpl implements IModelService {
  private readonly modelServiceUrl: string;

  constructor() {
    // Default to localhost with fallback ports
    this.modelServiceUrl = process.env.MODEL_SERVICE_URL || "http://localhost:8001";
  }

  async detectFraud(transaction: FraudDetectionRequest): Promise<FraudDetectionResult> {
    try {
      // Prepare transaction with extra feature fields that our model needs
      const enrichedTransaction = this.enrichTransactionWithFeatures(transaction);
      
      const response = await axios.post<FraudDetectionResult>(
        `${this.modelServiceUrl}/predict`,
        enrichedTransaction
      );
      return response.data;
    } catch (error) {
      console.error("Error calling model service:", error);
      
      // Fallback for development/testing if model service is unavailable
      if (process.env.NODE_ENV === "development") {
        console.warn("Using fallback mock response for development");
        return this.getFallbackResponse(transaction);
      }
      
      throw new Error("Failed to get prediction from model service");
    }
  }
  
  /**
   * Enriches a transaction with derived features needed by the model
   */
  private enrichTransactionWithFeatures(transaction: FraudDetectionRequest): FraudDetectionRequest {
    const enriched = { ...transaction };
    
    // Derive card entry method features
    enriched.is_online = transaction.cardEntryMethod === "online";
    enriched.is_manual = transaction.cardEntryMethod === "manual";
    
    // Derive merchant category features
    enriched.is_ecommerce = transaction.merchantCategory === "ecommerce";
    
    // Derive time-based features
    const transactionTime = transaction.timestamp 
      ? new Date(transaction.timestamp)
      : new Date();
      
    // Hour of day (0-23)
    enriched.hour_of_day = transactionTime.getHours();
    
    // Is weekend (Saturday = 6, Sunday = 0)
    const dayOfWeek = transactionTime.getDay();
    enriched.is_weekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Location mismatch (abnormal location)
    enriched.location_mismatch = transaction.location === "abnormal";
    
    return enriched;
  }

  private getFallbackResponse(transaction: FraudDetectionRequest): FraudDetectionResult {
    // This is only for development when model service is not available
    // Enrich the transaction first to get our derived features
    const enriched = this.enrichTransactionWithFeatures(transaction);
    
    // Base variables
    let confidence = 0.05; // Default low probability
    let is_fraud = false;
    let risk_level: "low" | "medium" | "high" = "low";
    
    // More sophisticated rule-based logic that uses all features
    
    // Rule 1: High amounts are suspicious
    if (enriched.amount > 2000) {
      confidence += 0.5;
    } else if (enriched.amount > 1000) {
      confidence += 0.3;
    }
    
    // Rule 2: Manual card entry is riskier
    if (enriched.is_manual) {
      confidence += 0.2;
    }
    
    // Rule 3: E-commerce transactions have some risk
    if (enriched.is_ecommerce) {
      confidence += 0.1;
    }
    
    // Rule 4: Abnormal location is very suspicious
    if (enriched.location_mismatch) {
      confidence += 0.4;
    }
    
    // Rule 5: Time-based risk factors
    // Late night/early morning hours
    if (enriched.hour_of_day !== undefined) {
      if (enriched.hour_of_day < 6 || enriched.hour_of_day > 22) {
        confidence += 0.1;
      }
    }
    
    // Rule 6: Weekend transactions slightly higher risk
    if (enriched.is_weekend) {
      confidence += 0.05;
    }
    
    // Cap at 1.0
    confidence = Math.min(confidence, 1.0);
    
    // Determine if it's fraud and the risk level
    is_fraud = confidence > 0.5;
    
    if (confidence >= 0.7) {
      risk_level = "high";
    } else if (confidence >= 0.4) {
      risk_level = "medium";
    } else {
      risk_level = "low";
    }
    
    return {
      is_fraud,
      confidence,
      risk_level
    };
  }
}

export const modelService = new ModelServiceImpl();
