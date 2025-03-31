import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/stats/stat-card";
import ChartCard from "@/components/charts/chart-card";
import FraudDetectionForm from "@/components/transaction/fraud-detection-form";
import TransactionTable from "@/components/transaction/transaction-table";
import { generateFraudDataFromTransactions } from "@/lib/chart-utils";
import { DashboardStats } from "@/types";
import { Transaction } from "@shared/schema";

export default function Dashboard() {
  // Fetch dashboard statistics
  const { data: stats, isLoading: isStatsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });
  
  // Fetch recent transactions
  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery<{ transactions: Transaction[] }>({
    queryKey: ["/api/transactions"],
  });
  
  const transactions = transactionsData?.transactions || [];
  
  // Generate chart data from transactions
  const chartData = generateFraudDataFromTransactions(transactions);
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Transactions"
              value={isStatsLoading ? "Loading..." : stats?.totalTransactions.toString() || "0"}
              percentChange={5.4}
              icon="credit_card"
              iconBgColor="bg-primary"
              iconColor="text-primary"
            />
            
            <StatCard
              title="Fraud Detected"
              value={isStatsLoading ? "Loading..." : stats?.fraudDetected.toString() || "0"}
              percentChange={2.1}
              icon="gpp_bad"
              iconBgColor="bg-danger"
              iconColor="text-danger"
            />
            
            <StatCard
              title="Suspicious Transactions"
              value={isStatsLoading ? "Loading..." : stats?.suspiciousTransactions.toString() || "0"}
              percentChange={-1.8}
              icon="security"
              iconBgColor="bg-warning"
              iconColor="text-warning"
            />
            
            <StatCard
              title="Detection Accuracy"
              value={isStatsLoading ? "Loading..." : `${stats?.detectionAccuracy.toFixed(1)}%` || "0%"}
              percentChange={0.5}
              icon="verified"
              iconBgColor="bg-success"
              iconColor="text-success"
            />
          </div>
          
          {/* Charts Grid */}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ChartCard
              title="Fraud Detection Trends"
              description="Monthly fraud detection statistics over time"
              chartType="bar"
              chartData={chartData.fraudTrends}
            />
            
            <ChartCard
              title="Fraud Categories"
              description="Distribution of detected fraud by category"
              chartType="pie"
              chartData={chartData.fraudCategories}
            />
          </div>
          
          {/* Fraud Detection Form */}
          <div className="mt-8">
            <FraudDetectionForm />
          </div>
          
          {/* Recent Transactions Table */}
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Transactions
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Latest transactions with fraud detection results
                </p>
              </div>
              <div>
                <button 
                  type="button" 
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <span className="material-icons mr-2 text-sm">file_download</span>
                  Export CSV
                </button>
              </div>
            </div>
            
            <TransactionTable
              transactions={transactions}
              isLoading={isTransactionsLoading}
              total={transactions.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
