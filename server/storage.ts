import { transactions, users, userSettings, analyticsData, 
  type User, type InsertUser, type UpdateUser,
  type Transaction, type InsertTransaction, 
  type UserSettings, type InsertUserSettings, type UpdateUserSettings,
  type AnalyticsData, type InsertAnalyticsData } from "@shared/schema";
import { nanoid } from "nanoid";
import { db, pool } from "./db";
import { eq, desc, and, sql, count, avg } from "drizzle-orm";
import session from "express-session";
import memoryStoreModule from "memorystore";

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
    // Initialize in-memory session store
    const MemoryStore = memoryStoreModule(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize the database with sample data
    this.initializeDatabase();
  }
  
  private async initializeDatabase() {
    try {
      // Seed admin user first
      await this.seedAdminUser();
      // Then seed transaction data
      await this.seedTransactionData();
    } catch (error) {
      console.error("Error initializing database:", error);
    }
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
  
  private async seedTransactionData() {
    // Check if we already have transactions
    const existingTransactions = await this.getTransactions(1);
    if (existingTransactions.length > 0) {
      return; // Don't seed if we already have transactions
    }
    
    console.log("Seeding transaction data...");
    
    // Create sample transactions with different risk levels and fraud status
    const merchantCategories = [
      "Retail", "Restaurant", "Travel", "Online Shopping", "Entertainment", 
      "Grocery", "Electronics", "Automotive", "Healthcare", "Financial Services"
    ];
    
    const cardEntryMethods = [
      "Chip", "Swipe", "Manual Entry", "Online", "Contactless", "Mobile Wallet"
    ];
    
    const locations = [
      "New York, USA", "London, UK", "Tokyo, Japan", "Paris, France", 
      "Sydney, Australia", "Toronto, Canada", "Berlin, Germany", "Mumbai, India"
    ];
    
    // Generate 50 transactions
    const totalTransactions = 50;
    const fraudCount = 8; // ~16% fraud rate
    const suspiciousCount = 12; // ~24% suspicious rate
    
    for (let i = 0; i < totalTransactions; i++) {
      const isFraud = i < fraudCount;
      const isSuspicious = !isFraud && i < (fraudCount + suspiciousCount);
      
      const merchantCategory = merchantCategories[Math.floor(Math.random() * merchantCategories.length)];
      const cardEntryMethod = cardEntryMethods[Math.floor(Math.random() * cardEntryMethods.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      // Generate amount (higher amounts more likely to be fraudulent)
      let amount;
      if (isFraud) {
        amount = Math.random() * 5000 + 1000; // $1000-$6000
      } else if (isSuspicious) {
        amount = Math.random() * 2000 + 500; // $500-$2500
      } else {
        amount = Math.random() * 500 + 20; // $20-$520
      }
      
      // Create transaction with appropriate risk level and fraud status
      const transactionId = `TX-${nanoid(8)}`;
      const confidence = isFraud ? Math.random() * 0.3 + 0.7 : (isSuspicious ? Math.random() * 0.3 + 0.4 : Math.random() * 0.4);
      const riskLevel = isFraud ? "high" : (isSuspicious ? "medium" : "low");
      const status = isFraud ? "fraudulent" : (isSuspicious ? "suspicious" : "safe");
      
      // Create timestamp within the last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - daysAgo);
      timestamp.setHours(timestamp.getHours() - hoursAgo);
      
      // Insert directly to avoid validation issues with our InsertTransaction schema
      await db.insert(transactions).values({
        transactionId,
        amount,
        merchantName: `${merchantCategory} Store ${Math.floor(Math.random() * 100) + 1}`,
        merchantCategory,
        location,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        cardEntryMethod,
        timestamp,
        isFraud,
        confidence,
        riskLevel: riskLevel as any,
        status: status as any,
        userId: 1, // Assign to admin user
        notes: isFraud ? "Potential fraudulent transaction" : (isSuspicious ? "Requires manual review" : "")
      });
    }
    
    console.log(`Seeded ${totalTransactions} transactions successfully`);
    
    // Also create analytics data summary
    await this.createAnalyticsData({
      date: new Date(),
      totalTransactions,
      fraudulentTransactions: fraudCount,
      suspiciousTransactions: suspiciousCount,
      detectionAccuracy: 0.942, // 94.2% accuracy
      averageTransactionAmount: 450.75
    });
    
    console.log("Seeded analytics data successfully");
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
