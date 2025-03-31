import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setStats } from "@/lib/store";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import FraudDetectionForm from "@/components/dashboard/FraudDetectionForm";
import TransactionsTable from "@/components/dashboard/TransactionsTable";
import { ChartData } from "@/types";

export default function Dashboard() {
  const dispatch = useDispatch();
  const stats = useSelector((state: RootState) => state.app.stats);
  
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['/api/stats'],
  });
  
  useEffect(() => {
    if (statsData) {
      dispatch(setStats(statsData));
    }
  }, [statsData, dispatch]);
  
  // Chart data for fraud detection trends
  const fraudTrendsData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Fraud Detected',
        data: [12, 19, 15, 25, 22, stats?.fraudDetected || 0],
        backgroundColor: 'rgba(220, 38, 38, 0.5)',
        borderColor: 'rgba(220, 38, 38, 1)',
        borderWidth: 1,
      },
      {
        label: 'Suspicious Transactions',
        data: [32, 29, 40, 45, 52, stats?.suspiciousTransactions || 0],
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
      }
    ],
  };
  
  // Chart data for fraud categories
  const fraudCategoriesData: ChartData = {
    labels: ['Card Not Present', 'Counterfeit Card', 'Lost/Stolen Card', 'ID Theft', 'Other'],
    datasets: [
      {
        label: 'Fraud by Category',
        data: [42, 21, 15, 12, 10],
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(220, 38, 38, 0.5)',
          'rgba(245, 158, 11, 0.5)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(99, 102, 241, 0.5)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(220, 38, 38, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(99, 102, 241, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
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
              value={stats?.totalTransactions || 0}
              change={{ value: "+5.4%", positive: true }}
              icon="credit_card"
              iconColor="primary"
            />
            <StatCard
              title="Fraud Detected"
              value={stats?.fraudDetected || 0}
              change={{ value: "+2.1%", positive: false }}
              icon="gpp_bad"
              iconColor="red-500"
            />
            <StatCard
              title="Suspicious Transactions"
              value={stats?.suspiciousTransactions || 0}
              change={{ value: "-1.8%", positive: true }}
              icon="security"
              iconColor="yellow-500"
            />
            <StatCard
              title="Detection Accuracy"
              value={`${stats?.detectionAccuracy || 0}%`}
              change={{ value: "+0.5%", positive: true }}
              icon="verified"
              iconColor="green-500"
            />
          </div>
          
          {/* Charts Grid */}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ChartCard
              title="Fraud Detection Trends"
              description="Monthly fraud detection statistics over time"
              chartType="bar"
              data={fraudTrendsData}
            />
            <ChartCard
              title="Fraud Categories"
              description="Distribution of detected fraud by category"
              chartType="pie"
              data={fraudCategoriesData}
            />
          </div>
          
          {/* Fraud Detection Form */}
          <div className="mt-8">
            <FraudDetectionForm />
          </div>
          
          {/* Recent Transactions Table */}
          <div className="mt-8">
            <TransactionsTable limit={5} />
          </div>
        </div>
      </div>
    </div>
  );
}
