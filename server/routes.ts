import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { modelService } from "./modelService";
import { z } from "zod";
import { fraudDetectionRequestSchema, insertTransactionSchema } from "@shared/schema";
import { setupAuth } from "./auth";

import multer from 'multer';
import * as csv from 'csv-parse';
import { Readable } from 'stream';

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - prefix all with /api

  // Set up authentication (login, register, session handling)
  setupAuth(app);
  
  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  });
  
  // Health check endpoint for monitoring
  app.get("/api/health", async (req, res) => {
    try {
      // Perform a simple database query to check connection
      const dbCheck = await storage.getUser(1).then(() => true).catch(() => false);
      
      const healthStatus = {
        status: "ok",
        timestamp: new Date().toISOString(),
        services: {
          api: "ok",
          database: dbCheck ? "ok" : "error",
          model: req.query.checkModel === "true" ? 
            await modelService.detectFraud({
              amount: 1,
              merchantCategory: "test",
              cardEntryMethod: "test"
            }).then(() => "ok").catch(() => "error") : 
            "not_checked"
        },
        version: process.env.npm_package_version || "1.0.0"
      };
      
      if (!dbCheck) {
        healthStatus.status = "degraded";
      }
      
      res.json(healthStatus);
    } catch (error) {
      res.status(500).json({
        status: "error",
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
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
      const stats = await storage.getTransactionStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
  
  // Get analytics data
  app.get("/api/analytics", async (req, res) => {
    try {
      const data = await storage.getAnalyticsData();
      res.json({ data });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  // CSV Upload and analysis
  app.post("/api/analyze-csv", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileBuffer = req.file.buffer;
      const fileContent = fileBuffer.toString();
      
      // Parse CSV
      const records: any[] = [];
      const parser = csv.parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });
      
      const stream = Readable.from(fileContent);
      stream.pipe(parser);
      
      for await (const record of parser) {
        records.push(record);
      }
      
      if (records.length === 0) {
        return res.status(400).json({ message: "CSV file has no valid records" });
      }

      // Validate required columns
      const requiredColumns = ['amount', 'merchantCategory', 'cardEntryMethod'];
      const firstRecord = records[0];
      const missingColumns = requiredColumns.filter(col => !(col in firstRecord));
      
      if (missingColumns.length > 0) {
        return res.status(400).json({ 
          message: `CSV file is missing required columns: ${missingColumns.join(', ')}` 
        });
      }

      // Process each transaction
      const fraudResults = await Promise.all(
        records.map(async record => {
          try {
            // Convert amount to number
            const amount = parseFloat(record.amount);
            if (isNaN(amount)) {
              return { error: 'Invalid amount', record };
            }

            const request = {
              amount,
              merchantName: record.merchantName || 'Unknown',
              merchantCategory: record.merchantCategory,
              location: record.location || '',
              ipAddress: record.ipAddress || '',
              cardEntryMethod: record.cardEntryMethod,
              timestamp: record.timestamp ? new Date(record.timestamp) : new Date()
            };

            // Call model service for prediction
            const fraudResult = await modelService.detectFraud({
              amount: request.amount,
              merchantCategory: request.merchantCategory,
              cardEntryMethod: request.cardEntryMethod,
              location: request.location,
              ipAddress: request.ipAddress
            });

            return {
              transaction: request,
              result: fraudResult,
              isFraud: fraudResult.is_fraud,
              confidence: fraudResult.confidence,
              riskLevel: fraudResult.risk_level,
              status: fraudResult.is_fraud ? "fraudulent" : 
                     (fraudResult.confidence > 0.5 ? "suspicious" : "safe")
            };
          } catch (error) {
            return { error: error instanceof Error ? error.message : 'Unknown error', record };
          }
        })
      );

      // Filter out errors
      const validResults = fraudResults.filter(result => !result.error);
      const errorResults = fraudResults.filter(result => result.error);

      // Calculate statistics
      const totalTransactions = validResults.length;
      const fraudulentTransactions = validResults.filter(r => r.isFraud).length;
      const suspiciousTransactions = validResults.filter(r => !r.isFraud && r.confidence !== undefined && r.confidence > 0.5).length;
      const safeTransactions = validResults.filter(r => !r.isFraud && r.confidence !== undefined && r.confidence <= 0.5).length;

      // Group by merchant category
      const fraudByMerchantCategory = Object.entries(
        validResults.reduce((acc: Record<string, number>, result) => {
          if (result.isFraud) {
            const category = result.transaction.merchantCategory || 'Unknown';
            acc[category] = (acc[category] || 0) + 1;
          }
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }));

      // Group by card entry method
      const fraudByCardEntryMethod = Object.entries(
        validResults.reduce((acc: Record<string, number>, result) => {
          if (result.isFraud) {
            const method = result.transaction.cardEntryMethod || 'Unknown';
            acc[method] = (acc[method] || 0) + 1;
          }
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }));

      // Group by amount ranges
      const amountRanges = [
        { min: 0, max: 100, name: '$0-$100' },
        { min: 100, max: 500, name: '$100-$500' },
        { min: 500, max: 1000, name: '$500-$1000' },
        { min: 1000, max: 5000, name: '$1000-$5000' },
        { min: 5000, max: Infinity, name: '$5000+' }
      ];

      const amountDistribution = amountRanges.map(range => {
        const transactionsInRange = validResults.filter(
          r => r.transaction && r.transaction.amount >= range.min && r.transaction.amount < range.max
        );
        
        return {
          name: range.name,
          fraudulent: transactionsInRange.filter(r => r.isFraud).length,
          legitimate: transactionsInRange.filter(r => !r.isFraud).length
        };
      });

      // Send analysis results
      res.json({
        totalTransactions,
        fraudulentTransactions,
        suspiciousTransactions,
        safeTransactions,
        fraudByMerchantCategory,
        fraudByCardEntryMethod,
        amountDistribution,
        errorCount: errorResults.length,
        // Add the first 100 results for detail view if needed
        sampleResults: validResults.slice(0, 100)
      });

    } catch (error) {
      console.error('CSV analysis error:', error);
      res.status(500).json({ 
        message: "Failed to analyze CSV file", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
