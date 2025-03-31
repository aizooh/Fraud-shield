import { Transaction, FraudDetectionResult } from "@shared/schema";

export type TransactionWithDetails = Transaction;

export interface StatCardProps {
  title: string;
  value: string | number;
  percentChange?: number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface FraudDetectionFormData {
  amount: number;
  merchantName: string;
  merchantCategory: string;
  location: string;
  ipAddress: string;
  cardEntryMethod: string;
  transactionTime: string;
}

export interface DashboardStats {
  totalTransactions: number;
  fraudDetected: number;
  suspiciousTransactions: number;
  detectionAccuracy: number;
}

export interface FraudStats {
  totalTransactions: number;
  fraudDetected: number;
  suspiciousTransactions: number;
  detectionAccuracy: number;
}

export interface TransactionWithFraudResult {
  transaction: Transaction;
  fraudResult: FraudDetectionResult;
}
