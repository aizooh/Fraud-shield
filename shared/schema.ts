import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enum for user roles
export const roleEnum = pgEnum('role', ['user', 'admin']);

// Enum for auth providers
export const authProviderEnum = pgEnum('auth_provider', ['local', 'google']);

// Users table with expanded fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: roleEnum("role").default("user").notNull(),
  profilePicture: text("profile_picture"),
  authProvider: authProviderEnum("auth_provider").default("local").notNull(),
  authProviderId: text("auth_provider_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  userSettings: many(userSettings),
}));

// User settings table
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  theme: text("theme").default("light"),
  dashboardLayout: text("dashboard_layout").default("default"),
  language: text("language").default("en"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User settings relations
export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const transactionRiskLevels = ["low", "medium", "high"] as const;
export const transactionStatus = ["safe", "suspicious", "fraudulent"] as const;

// Transactions table with expanded fields
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
  notes: text("notes"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
});

// Transaction relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [transactions.reviewedBy],
    references: [users.id],
  }),
}));

// Analytics data table for storing aggregated metrics
export const analyticsData = pgTable("analytics_data", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  totalTransactions: integer("total_transactions").default(0),
  fraudulentTransactions: integer("fraudulent_transactions").default(0),
  suspiciousTransactions: integer("suspicious_transactions").default(0),
  merchantCategory: text("merchant_category"),
  location: text("location"),
  cardEntryMethod: text("card_entry_method"),
  averageTransactionAmount: doublePrecision("average_transaction_amount"),
  detectionAccuracy: doublePrecision("detection_accuracy"),
});

// Schema definitions for insertions and API
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = createInsertSchema(users).partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  updatedAt: true,
});

export const updateUserSettingsSchema = createInsertSchema(userSettings).partial().omit({
  id: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  userId: true,
  transactionId: true,
  isFraud: true,
  confidence: true,
  riskLevel: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
});

export const insertAnalyticsDataSchema = createInsertSchema(analyticsData).omit({
  id: true,
});

export const fraudDetectionRequestSchema = z.object({
  amount: z.number().positive(),
  merchantCategory: z.string().min(1),
  location: z.string().optional(),
  ipAddress: z.string().optional(),
  cardEntryMethod: z.string().min(1),
  timestamp: z.string().optional(),
  // Adding these fields to match our model
  hour_of_day: z.number().min(0).max(23).optional(),
  is_weekend: z.boolean().optional(),
  is_online: z.boolean().optional(),
  is_manual: z.boolean().optional(),
  is_ecommerce: z.boolean().optional(),
  location_mismatch: z.boolean().optional()
});

export const fraudDetectionResultSchema = z.object({
  is_fraud: z.boolean(),
  confidence: z.number().min(0).max(1),
  risk_level: z.enum(transactionRiskLevels)
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertAnalyticsData = z.infer<typeof insertAnalyticsDataSchema>;
export type AnalyticsData = typeof analyticsData.$inferSelect;

export type FraudDetectionRequest = z.infer<typeof fraudDetectionRequestSchema>;
export type FraudDetectionResult = z.infer<typeof fraudDetectionResultSchema>;

// Define TransactionResult as an alias to FraudDetectionResult
export type TransactionResult = FraudDetectionResult;
