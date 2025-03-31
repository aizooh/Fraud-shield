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
      const response = await axios.post<FraudDetectionResult>(
        `${this.modelServiceUrl}/predict`,
        transaction
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

  private getFallbackResponse(transaction: FraudDetectionRequest): FraudDetectionResult {
    // This is only for development when model service is not available
    // Simulate some basic rules for demonstration
    const amount = transaction.amount;
    let is_fraud = false;
    let confidence = 0.01;
    let risk_level: "low" | "medium" | "high" = "low";
    
    // Simple rule-based fallback logic
    if (amount > 2000) {
      confidence = 0.9;
      is_fraud = true;
      risk_level = "high";
    } else if (amount > 1000) {
      confidence = 0.6;
      is_fraud = false;
      risk_level = "medium";
    } else if (transaction.cardEntryMethod === "manual") {
      confidence = 0.4;
      is_fraud = false;
      risk_level = "medium";
    }
    
    return {
      is_fraud,
      confidence,
      risk_level
    };
  }
}

export const modelService = new ModelServiceImpl();
