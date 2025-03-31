import { transactions, users, type User, type InsertUser, type Transaction, type InsertTransaction } from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTransactions(limit?: number, offset?: number): Promise<Transaction[]>;
  getTransactionById(transactionId: string): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(
    transactionId: string, 
    updates: Partial<Omit<Transaction, "id" | "transactionId" | "timestamp" | "userId">>
  ): Promise<Transaction | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactionsMap: Map<string, Transaction>;
  private userIdCounter: number;
  private transactionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.transactionsMap = new Map();
    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
    
    // Initialize with sample user
    this.createUser({
      username: "admin",
      password: "password123"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTransactions(limit: number = 100, offset: number = 0): Promise<Transaction[]> {
    const transactions = Array.from(this.transactionsMap.values());
    
    // Sort by timestamp in descending order (newest first)
    transactions.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    return transactions.slice(offset, offset + limit);
  }

  async getTransactionById(transactionId: string): Promise<Transaction | undefined> {
    return this.transactionsMap.get(transactionId);
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactionsMap.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const transactionId = `TX-${nanoid(8)}`;
    
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      transactionId,
      isFraud: false,
      confidence: 0,
      riskLevel: "low",
      status: "safe",
      userId: insertTransaction.userId || null
    };
    
    this.transactionsMap.set(transactionId, transaction);
    return transaction;
  }

  async updateTransaction(
    transactionId: string,
    updates: Partial<Omit<Transaction, "id" | "transactionId" | "timestamp" | "userId">>
  ): Promise<Transaction | undefined> {
    const transaction = this.transactionsMap.get(transactionId);
    
    if (!transaction) {
      return undefined;
    }
    
    const updatedTransaction = {
      ...transaction,
      ...updates,
    };
    
    this.transactionsMap.set(transactionId, updatedTransaction);
    return updatedTransaction;
  }
}

export const storage = new MemStorage();
