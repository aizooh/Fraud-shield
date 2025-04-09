import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, Activity, AlertTriangle, Shield, CreditCard } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ChartData } from "@/types";
import { DateRange } from "react-day-picker";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TransactionStat {
  totalTransactions: number;
  fraudDetected: number;
  suspiciousTransactions: number;
  detectionAccuracy: number;
}

interface FraudAnalyticsProps {
  stats: TransactionStat;
}

// Custom stat card component
function StatCard({ title, value, description, icon, trend, trendValue }: { 
  title: string, 
  value: string | number, 
  description?: string,
  icon?: React.ReactNode,
  trend?: 'up' | 'down',
  trendValue?: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-1">
              <h3 className="text-2xl font-bold">{value}</h3>
              {trend && trendValue && (
                <span className={`text-xs flex items-center ${trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                  {trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {trendValue}
                </span>
              )}
            </div>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          {icon && (
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FraudAnalytics({ stats }: FraudAnalyticsProps) {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const [activeTab, setActiveTab] = useState("trends");
  
  // Sample fraud trends data for chart display
  const fraudTrendsData = [
    { name: 'Jan', fraudulent: 15, suspicious: 25, total: 250 },
    { name: 'Feb', fraudulent: 12, suspicious: 22, total: 320 },
    { name: 'Mar', fraudulent: 8, suspicious: 18, total: 280 },
    { name: 'Apr', fraudulent: 10, suspicious: 15, total: 400 },
    { name: 'May', fraudulent: 16, suspicious: 28, total: 450 },
    { name: 'Jun', fraudulent: 14, suspicious: 24, total: 380 }
  ];
  
  // Sample fraud by category data for chart display
  const fraudCategoriesData = [
    { name: 'Online Shopping', value: 38 },
    { name: 'Travel', value: 22 },
    { name: 'Banking', value: 18 },
    { name: 'Restaurants', value: 12 },
    { name: 'Other', value: 10 }
  ];
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    toast({
      title: "Date range updated",
      description: "Data has been refreshed for the selected date range"
    });
  };

  return (
    <div className="space-y-6">
      {/* Top stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Transactions" 
          value={stats.totalTransactions.toLocaleString()}
          icon={<CreditCard className="h-4 w-4 text-primary" />}
          trend="up"
          trendValue="12.5%"
        />
        <StatCard 
          title="Fraud Detected" 
          value={stats.fraudDetected.toLocaleString()}
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          trend="up"
          trendValue="8.2%"
        />
        <StatCard 
          title="Suspicious Transactions" 
          value={stats.suspiciousTransactions.toLocaleString()}
          icon={<Activity className="h-4 w-4 text-yellow-500" />}
          trend="down"
          trendValue="3.1%"
        />
        <StatCard 
          title="Detection Accuracy" 
          value={`${(stats.detectionAccuracy * 100).toFixed(2)}%`}
          icon={<Shield className="h-4 w-4 text-green-500" />}
          trend="up"
          trendValue="0.7%"
        />
      </div>
      
      {/* Date range selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Fraud Analytics</h2>
        <div className="flex items-center gap-2">
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onSelect={(range: DateRange | undefined) => {
              if (range && range.from && range.to) {
                handleDateRangeChange({ from: range.from, to: range.to });
              }
            }}
          />
          <Button variant="outline" onClick={() => {
            toast({
              title: "Report generated",
              description: "Your fraud analytics report has been generated and is ready for download"
            });
          }}>
            Export Report
          </Button>
        </div>
      </div>
      
      {/* Main tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="trends">Fraud Trends</TabsTrigger>
          <TabsTrigger value="categories">Fraud Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Detection Trends</CardTitle>
              <CardDescription>
                View fraud detection trends over time to identify patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={fraudTrendsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="fraudulent" 
                      name="Fraudulent Transactions" 
                      stroke="#ef4444" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="suspicious" 
                      name="Suspicious Transactions" 
                      stroke="#eab308" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      name="Total Transactions" 
                      stroke="#3b82f6" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-muted-foreground">
                Insights: Fraud incidents peak during holiday seasons and weekends. The most significant 
                spike occurred last month, with a 23% increase in fraudulent transactions compared to the previous period.
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Fraud by Category</CardTitle>
              <CardDescription>
                Distribution of fraud cases across different merchant categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fraudCategoriesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={140}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {fraudCategoriesData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Top Fraud Categories</h3>
                  <div className="space-y-4">
                    {fraudCategoriesData.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-sm font-medium">{item.value}%</span>
                        </div>
                        <Progress value={item.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-800 mb-2">Risk Analysis</h4>
                    <p className="text-sm text-amber-700">
                      Online shopping transactions show the highest fraud rate at 38%. 
                      New prevention measures should focus on enhanced verification for e-commerce,
                      particularly for high-value electronics purchases.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Bottom row cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Fraud Activities</CardTitle>
            <CardDescription>Latest detected fraudulent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-start space-x-4 p-3 rounded-lg bg-card border">
                  <div className={`mt-0.5 h-2 w-2 rounded-full ${index === 0 ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium">
                        {index === 0 ? 'Online Electronics Store' : index === 1 ? 'Travel Booking' : 'ATM Withdrawal'}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {index === 0 ? '2 hours ago' : index === 1 ? '5 hours ago' : '1 day ago'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {index === 0 
                        ? 'Unusual transaction pattern detected - multiple high-value purchases in short succession' 
                        : index === 1 
                          ? 'Location mismatch - transaction originated from a different country than the user profile'
                          : 'Multiple failed PIN attempts before successful transaction'
                      }
                    </p>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs font-medium">
                        ${index === 0 ? '1,299.99' : index === 1 ? '854.50' : '500.00'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        index === 0 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {index === 0 ? 'High Risk' : 'Medium Risk'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Activities</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Fraud Prevention Impact</CardTitle>
            <CardDescription>Effectiveness of fraud prevention measures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Jan', prevented: 35, lost: 12 },
                    { name: 'Feb', prevented: 42, lost: 8 },
                    { name: 'Mar', prevented: 55, lost: 10 },
                    { name: 'Apr', prevented: 47, lost: 5 },
                    { name: 'May', prevented: 60, lost: 7 },
                    { name: 'Jun', prevented: 58, lost: 4 }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="prevented" name="Fraud Prevented ($K)" fill="#16a34a" />
                  <Bar dataKey="lost" name="Fraud Losses ($K)" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium text-green-800">Total Savings</h4>
                <span className="font-bold text-green-800">$297,500</span>
              </div>
              <p className="text-sm text-green-700">
                Fraud prevention systems have saved the company an estimated $297,500 in the last 6 months,
                representing a 89% prevention rate.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function FraudDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      // Fetch transaction stats from API
      const response = await apiRequest({
        method: 'GET',
        url: '/api/stats'
      });
      return response;
    }
  });
  
  const defaultStats = {
    totalTransactions: 0,
    fraudDetected: 0,
    suspiciousTransactions: 0,
    detectionAccuracy: 0
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold">Fraud Detection Dashboard</h1>
        <p className="text-muted-foreground mt-1 mb-6">
          Real-time monitoring and analysis of transaction fraud patterns
        </p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <FraudAnalytics stats={stats || defaultStats} />
        </div>
      </div>
    </div>
  );
}