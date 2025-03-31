import { ChartData } from '@/types';
import { Transaction } from '@shared/schema';

export const generateFraudTrendsData = (): ChartData => {
  // Generate monthly fraud detection statistics data for the chart
  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Total Transactions',
        data: [250, 320, 280, 400, 450, 380],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: '#3B82F6',
        borderWidth: 1
      },
      {
        label: 'Fraudulent Transactions',
        data: [15, 12, 8, 10, 16, 14],
        backgroundColor: 'rgba(220, 38, 38, 0.5)',
        borderColor: '#DC2626',
        borderWidth: 1
      }
    ]
  };
};

export const generateFraudCategoriesData = (): ChartData => {
  // Generate fraud categories distribution data for the chart
  return {
    labels: ['Card Not Present', 'Lost/Stolen Card', 'Counterfeit Card', 'ID Theft', 'Other'],
    datasets: [
      {
        label: 'Fraud Categories',
        data: [45, 25, 15, 10, 5],
        backgroundColor: [
          '#3B82F6', // blue
          '#EF4444', // red
          '#F59E0B', // amber
          '#10B981', // emerald
          '#8B5CF6'  // violet
        ],
        borderWidth: 1
      }
    ]
  };
};

export const generateFraudDataFromTransactions = (transactions: Transaction[]): {
  fraudTrends: ChartData,
  fraudCategories: ChartData,
} => {
  // Process transactions to generate chart data
  // This would typically group by date, merchant category, etc.
  
  // For this example, we'll use placeholder data if no transactions exist
  if (transactions.length === 0) {
    return {
      fraudTrends: generateFraudTrendsData(),
      fraudCategories: generateFraudCategoriesData()
    };
  }
  
  // Group by merchant category
  const categoryCounts: Record<string, number> = {};
  transactions.forEach(transaction => {
    if (transaction.isFraud) {
      const category = transaction.merchantCategory || 'Unknown';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
  });
  
  // Create chart data
  const categoryLabels = Object.keys(categoryCounts);
  const categoryValues = categoryLabels.map(label => categoryCounts[label]);
  
  // Generate fraud categories chart data
  const fraudCategories: ChartData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['No Data'],
    datasets: [
      {
        label: 'Fraud by Category',
        data: categoryValues.length > 0 ? categoryValues : [0],
        backgroundColor: [
          '#3B82F6', // blue
          '#EF4444', // red
          '#F59E0B', // amber
          '#10B981', // emerald
          '#8B5CF6',  // violet
          '#EC4899', // pink
          '#6366F1', // indigo
          '#D97706'  // yellow
        ],
        borderWidth: 1
      }
    ]
  };
  
  // For trends, we would normally group by date ranges
  // Here we'll use simple placeholder data or actual aggregated data
  const fraudTrends = generateFraudTrendsData();
  
  return {
    fraudTrends,
    fraudCategories
  };
};
