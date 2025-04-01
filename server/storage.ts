import { transactions, users, userSettings, analyticsData, 
  type User, type InsertUser, type UpdateUser,
  type Transaction, type InsertTransaction, 
  type UserSettings, type InsertUserSettings, type UpdateUserSettings,
  type AnalyticsData, type InsertAnalyticsData } from "@shared/schema";
import { nanoid } from "nanoid";
import { db, pool } from "./db";
import { eq, desc, and, sql, count, avg } from "drizzle-orm";
import session from "express-session";
import pgSessionConnect from "connect-pg-simple";

const PostgresSessionStore = pgSessionConnect(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByProviderId(provider: string, providerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: UpdateUser): Promise<User | undefined>;
  
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: number, updates: UpdateUserSettings): Promise<UserSettings | undefined>;
  
  getTransactions(limit?: number, offset?: number): Promise<Transaction[]>;
  getTransactionById(transactionId: string): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(
    transactionId: string, 
    updates: Partial<Omit<Transaction, "id" | "transactionId" | "timestamp" | "userId">>
  ): Promise<Transaction | undefined>;
  
  getAnalyticsData(): Promise<AnalyticsData[]>;
  createAnalyticsData(data: InsertAnalyticsData): Promise<AnalyticsData>;
  getTransactionStats(): Promise<{
    totalTransactions: number;
    fraudDetected: number;
    suspiciousTransactions: number;
    detectionAccuracy: number;
  }>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Initialize session store
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    
    // Seed admin user if not exists
    this.seedAdminUser();
  }
  
  private async seedAdminUser() {
    const existingAdmin = await this.getUserByUsername("admin");
    if (!existingAdmin) {
      try {
        await this.createUser({
          username: "admin",
          password: "password123", // This will be hashed in auth.ts
          role: "admin"
        });
        console.log("Admin user created successfully");
      } catch (error) {
        console.error("Error creating admin user:", error);
      }
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getUserByProviderId(provider: string, providerId: string): Promise<User | undefined> {
    // Handle auth provider separately based on the provider string
    let userResult;
    
    if (provider === "local" || provider === "google") {
      const [user] = await db.select().from(users).where(
        and(
          eq(users.authProvider, provider),
          eq(users.authProviderId, providerId)
        )
      );
      userResult = user;
    } else {
      // Default fallback if provider is not recognized
      userResult = undefined;
    }
    
    return userResult;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    
    // Create default user settings
    if (user) {
      await this.createUserSettings({
        userId: user.id,
        emailNotifications: true,
        pushNotifications: true,
        theme: "light",
        dashboardLayout: "default",
        language: "en"
      });
    }
    
    return user;
  }
  
  async updateUser(id: number, updates: UpdateUser): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }
  
  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings;
  }
  
  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const [createdSettings] = await db
      .insert(userSettings)
      .values(settings)
      .returning();
    return createdSettings;
  }
  
  async updateUserSettings(userId: number, updates: UpdateUserSettings): Promise<UserSettings | undefined> {
    try {
      const [updatedSettings] = await db
        .update(userSettings)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(userSettings.userId, userId))
        .returning();
      return updatedSettings;
    } catch (error) {
      console.error("Error updating user settings:", error);
      return undefined;
    }
  }

  async getTransactions(limit: number = 100, offset: number = 0): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.timestamp))
      .limit(limit)
      .offset(offset);
  }

  async getTransactionById(transactionId: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.transactionId, transactionId));
    return transaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.timestamp));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const transactionId = `TX-${nanoid(8)}`;
    
    const [transaction] = await db
      .insert(transactions)
      .values({
        ...insertTransaction,
        transactionId,
        isFraud: false,
        confidence: 0,
        riskLevel: "low",
        status: "safe"
      })
      .returning();
    
    return transaction;
  }

  async updateTransaction(
    transactionId: string,
    updates: Partial<Omit<Transaction, "id" | "transactionId" | "timestamp" | "userId">>
  ): Promise<Transaction | undefined> {
    try {
      const [updatedTransaction] = await db
        .update(transactions)
        .set(updates)
        .where(eq(transactions.transactionId, transactionId))
        .returning();
      return updatedTransaction;
    } catch (error) {
      console.error("Error updating transaction:", error);
      return undefined;
    }
  }
  
  async getAnalyticsData(): Promise<AnalyticsData[]> {
    return db
      .select()
      .from(analyticsData)
      .orderBy(desc(analyticsData.date));
  }
  
  async createAnalyticsData(data: InsertAnalyticsData): Promise<AnalyticsData> {
    const [createdData] = await db
      .insert(analyticsData)
      .values(data)
      .returning();
    return createdData;
  }
  
  async getTransactionStats(): Promise<{
    totalTransactions: number;
    fraudDetected: number;
    suspiciousTransactions: number;
    detectionAccuracy: number;
  }> {
    const [stats] = await db
      .select({
        totalCount: count(transactions.id).as("total"),
        fraudCount: sql<number>`CAST(SUM(CASE WHEN ${transactions.isFraud} = true THEN 1 ELSE 0 END) AS INTEGER)`.as("fraud"),
        suspiciousCount: sql<number>`CAST(SUM(CASE WHEN ${transactions.status} = 'suspicious' THEN 1 ELSE 0 END) AS INTEGER)`.as("suspicious"),
        avgConfidence: avg(transactions.confidence).as("accuracy")
      })
      .from(transactions);
      
    return {
      totalTransactions: stats?.totalCount || 0,
      fraudDetected: stats?.fraudCount || 0,
      suspiciousTransactions: stats?.suspiciousCount || 0,
      detectionAccuracy: Number(stats?.avgConfidence || 0)
    };
  }
}

export const storage = new DatabaseStorage();
