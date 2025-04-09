import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CategoryData {
  category: string;
  count: number;
  amount: number;
}

interface TrendData {
  date: string;
  count: number;
  amount: number;
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const [category, setCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("trends");
  
  // Mock data, in a real app this would be fetched from API
  const { data: fraudCategoriesData } = useQuery({
    queryKey: ['/api/analytics/categories'],
    queryFn: async () => {
      // In a real app, this would be an API call
      const mockData: CategoryData[] = [
        { category: "Online Shopping", count: 12, amount: 4350 },
        { category: "Travel", count: 8, amount: 9700 },
        { category: "Entertainment", count: 5, amount: 2100 },
        { category: "Restaurant", count: 3, amount: 750 },
        { category: "Retail", count: 10, amount: 3500 },
        { category: "Financial Services", count: 7, amount: 8200 },
        { category: "Electronics", count: 9, amount: 12400 },
      ];
      return mockData;
    }
  });

  const { data: fraudTrendsData } = useQuery({
    queryKey: ['/api/analytics/trends'],
    queryFn: async () => {
      // In a real app, this would be an API call
      const mockData: TrendData[] = [
        { date: "2023-01", count: 5, amount: 2300 },
        { date: "2023-02", count: 8, amount: 4100 },
        { date: "2023-03", count: 12, amount: 5800 },
        { date: "2023-04", count: 9, amount: 4200 },
        { date: "2023-05", count: 11, amount: 6300 },
        { date: "2023-06", count: 18, amount: 9200 },
      ];
      return mockData;
    }
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FCAF17'];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold mb-4">Analytics Dashboard</h1>
          <p className="text-muted-foreground mb-6">
            Comprehensive analytics dashboard for fraud detection patterns and insights.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{
                        from: dateRange.from,
                        to: dateRange.to,
                      }}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          setDateRange({ from: range.from, to: range.to });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Merchant Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="food">Food & Beverages</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:flex items-end">
              <Button className="w-full md:w-auto">Generate Report</Button>
            </div>
          </div>

          {/* Main content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trends">Fraud Trends</TabsTrigger>
              <TabsTrigger value="categories">Fraud by Category</TabsTrigger>
            </TabsList>

            {/* Fraud Trends Tab */}
            <TabsContent value="trends" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fraud Trends Over Time</CardTitle>
                  <CardDescription>
                    Monthly fraud trends analysis showing count and monetary impact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={fraudTrendsData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="count" name="Fraud Count" fill="#8884d8" />
                        <Bar yAxisId="right" dataKey="amount" name="Amount ($)" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">+28%</div>
                        <p className="text-muted-foreground">Fraud increase year-over-year</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">$24,350</div>
                        <p className="text-muted-foreground">Total fraud amount</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">63</div>
                        <p className="text-muted-foreground">Fraud transactions detected</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fraud by Category Tab */}
            <TabsContent value="categories" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fraud by Merchant Category</CardTitle>
                  <CardDescription>
                    Analysis of fraud distribution across different merchant categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="h-[400px] flex justify-center items-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={fraudCategoriesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="category"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {fraudCategoriesData?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Category Breakdown</h3>
                      <div className="space-y-4">
                        {fraudCategoriesData?.map((category, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              ></div>
                              <span>{category.category}</span>
                            </div>
                            <div className="flex space-x-4">
                              <span className="text-sm font-medium">{category.count} cases</span>
                              <span className="text-sm font-medium">${category.amount.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-700 mb-2">Insights</h4>
                        <p className="text-sm text-blue-700">
                          The highest fraud rates are seen in Online Shopping and Electronics categories,
                          with Travel showing the highest monetary impact due to larger transaction amounts.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Additional Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographical Hotspots</CardTitle>
                <CardDescription>
                  Fraud activity by geographical location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 flex flex-col items-center justify-center h-[200px] bg-gray-100 rounded-md">
                  <p className="text-center text-muted-foreground">Interactive map visualization will appear here</p>
                  <Button className="mt-4" variant="outline">Explore Full Map</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Behavior Patterns</CardTitle>
                <CardDescription>
                  Analysis of user behavior leading to fraudulent transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Unusual time of transaction</span>
                    <span className="text-primary font-medium">72%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Location mismatch</span>
                    <span className="text-primary font-medium">64%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Multiple failed attempts</span>
                    <span className="text-primary font-medium">48%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '48%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Unusual transaction size</span>
                    <span className="text-primary font-medium">41%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '41%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}