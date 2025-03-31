import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { modelService } from "./modelService";
import { z } from "zod";
import { fraudDetectionRequestSchema, insertTransactionSchema } from "@shared/schema";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - prefix all with /api
  
  // Get all transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const transactions = await storage.getTransactions(limit, offset);
      res.json({ transactions });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Get transaction by ID
  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const transaction = await storage.getTransactionById(id);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json({ transaction });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  // Fraud detection endpoint
  app.post("/api/detect-fraud", async (req, res) => {
    try {
      // Validate request
      const validatedData = fraudDetectionRequestSchema.parse(req.body);
      
      // Call model service
      const fraudResult = await modelService.detectFraud(validatedData);
      
      // Create transaction record
      const merchantName = req.body.merchantName || "Unknown Merchant";
      
      const newTransaction = await storage.createTransaction({
        amount: validatedData.amount,
        merchantName,
        merchantCategory: validatedData.merchantCategory,
        location: validatedData.location || "",
        ipAddress: validatedData.ipAddress || "",
        cardEntryMethod: validatedData.cardEntryMethod,
        timestamp: new Date(),
      });
      
      // Update transaction with fraud detection results
      const updatedTransaction = await storage.updateTransaction(
        newTransaction.transactionId,
        {
          isFraud: fraudResult.is_fraud,
          confidence: fraudResult.confidence,
          riskLevel: fraudResult.risk_level,
          status: fraudResult.is_fraud ? "fraudulent" : 
                  (fraudResult.confidence > 0.5 ? "suspicious" : "safe")
        }
      );
      
      // Return the fraud detection result and the transaction
      res.json({
        fraudResult,
        transaction: updatedTransaction
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Failed to process fraud detection", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Create new transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      // Validate request
      const validatedData = insertTransactionSchema.parse(req.body);
      
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json({ transaction });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Get statistics for dashboard
  app.get("/api/stats", async (req, res) => {
    try {
      const transactions = await storage.getTransactions(1000);
      
      const totalTransactions = transactions.length;
      const fraudDetected = transactions.filter(t => t.isFraud).length;
      const suspiciousTransactions = transactions.filter(t => t.status === "suspicious").length;
      
      // Calculate detection accuracy (simplified for demo)
      const detectionAccuracy = 98.2; // In a real system, this would be calculated
      
      res.json({
        totalTransactions,
        fraudDetected,
        suspiciousTransactions,
        detectionAccuracy
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
