import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const transactionRiskLevels = ["low", "medium", "high"] as const;
export const transactionStatus = ["safe", "suspicious", "fraudulent"] as const;

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  amount: doublePrecision("amount").notNull(),
  merchantName: text("merchant_name").notNull(),
  merchantCategory: text("merchant_category").notNull(),
  location: text("location"),
  ipAddress: text("ip_address"),
  cardEntryMethod: text("card_entry_method").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isFraud: boolean("is_fraud").notNull().default(false),
  confidence: doublePrecision("confidence").notNull().default(0),
  riskLevel: text("risk_level").$type<typeof transactionRiskLevels[number]>().notNull().default("low"),
  status: text("status").$type<typeof transactionStatus[number]>().notNull().default("safe"),
  userId: integer("user_id").references(() => users.id),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  userId: true,
  transactionId: true,
  isFraud: true,
  confidence: true,
  riskLevel: true,
  status: true
});

export const fraudDetectionRequestSchema = z.object({
  amount: z.number().positive(),
  merchantCategory: z.string().min(1),
  location: z.string().optional(),
  ipAddress: z.string().optional(),
  cardEntryMethod: z.string().min(1),
  timestamp: z.string().optional()
});

export const fraudDetectionResultSchema = z.object({
  is_fraud: z.boolean(),
  confidence: z.number().min(0).max(1),
  risk_level: z.enum(transactionRiskLevels)
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type FraudDetectionRequest = z.infer<typeof fraudDetectionRequestSchema>;
export type FraudDetectionResult = z.infer<typeof fraudDetectionResultSchema>;
