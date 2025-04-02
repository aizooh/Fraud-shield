import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  FileInput,
  Info,
  Loader2,
  Upload,
  X,
} from "lucide-react";
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
  Cell,
} from "recharts";
import { apiRequest } from "@/lib/queryClient";

type AnalysisResult = {
  totalTransactions: number;
  fraudulentTransactions: number;
  suspiciousTransactions: number;
  safeTransactions: number;
  fraudByMerchantCategory: { name: string; value: number }[];
  fraudByCardEntryMethod: { name: string; value: number }[];
  amountDistribution: { name: string; fraudulent: number; legitimate: number }[];
  errorCount: number;
  sampleResults: any[];
};

const EXAMPLE_CSV_CONTENT = `amount,merchantName,merchantCategory,location,ipAddress,cardEntryMethod
125.99,Coffee Shop,food_beverage,New York,192.168.1.1,chip
1299.99,Electronics Store,electronics,Online,192.168.1.2,online
45.50,Gas Station,fuel,Chicago,192.168.1.3,swipe
789.00,Department Store,retail,Los Angeles,192.168.1.4,contactless
5000.00,Jewelry Store,luxury,Miami,192.168.1.5,manual
`;

const RISK_COLORS = {
  low: "#10b981", // green
  medium: "#f59e0b", // amber
  high: "#ef4444", // red
};

const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444"];
const BAR_COLORS = {
  fraudulent: "#ef4444",
  legitimate: "#10b981",
  merchant: "#3b82f6",
  method: "#8b5cf6",
};

export default function CSVImportForm() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const resetForm = () => {
    setFile(null);
    setAnalysisResult(null);
  };

  const validateCSVFile = (file: File): boolean => {
    // Check file type
    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return false;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size should be less than 10MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (validateCSVFile(selectedFile)) {
        setFile(selectedFile);
      } else {
        e.target.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch('/api/analyze-csv', {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to analyze CSV file");
      }

      const result = await response.json();
      
      // Ensure we have a valid result with totalTransactions before setting state
      if (result && typeof result.totalTransactions === 'number') {
        setAnalysisResult(result);
        toast({
          title: "Analysis complete",
          description: `Analyzed ${result.totalTransactions} transactions`,
        });
      } else {
        // Handle unexpected result format
        console.error("Unexpected result format:", result);
        toast({
          title: "Processing error",
          description: "Received invalid response from server",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("CSV upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to analyze transactions",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadExampleCSV = () => {
    const blob = new Blob([EXAMPLE_CSV_CONTENT], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "example-transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render upload form if no results yet
  if (!analysisResult) {
    return (
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Upload Transaction Data</h3>
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with transaction data for fraud analysis
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadExampleCSV}
            className="flex items-center gap-2"
          >
            <FileInput className="h-4 w-4" />
            <span>Download Example CSV</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="csv-file" className="text-sm font-medium">
              Transaction Data File (CSV)
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="csv-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">CSV file (max 10MB)</p>
                </div>
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {file && (
              <div className="flex items-center justify-between p-2 mt-2 border rounded">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <FileInput className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={resetForm} disabled={isUploading}>
              Reset
            </Button>
            <Button type="submit" disabled={!file || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>Analyze Transactions</>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-sm text-muted-foreground">
          <p className="flex items-center">
            <Info className="mr-2 h-4 w-4" />
            Your CSV file should include columns for: amount, merchantCategory, and cardEntryMethod
          </p>
        </div>
      </Card>
    );
  }

  // Render analysis results
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Analysis Results</h3>
        <Button variant="outline" onClick={resetForm}>
          Upload New File
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
              <h4 className="text-2xl font-bold mt-1">{analysisResult.totalTransactions || 0}</h4>
            </div>
            <Info className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fraudulent</p>
              <h4 className="text-2xl font-bold mt-1">{analysisResult.fraudulentTransactions || 0}</h4>
            </div>
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div className="h-1 mt-3 w-full bg-secondary overflow-hidden rounded-full">
            <div 
              className="h-full bg-destructive" 
              style={{ 
                width: `${analysisResult.totalTransactions ? (analysisResult.fraudulentTransactions / analysisResult.totalTransactions) * 100 : 0}%` 
              }}
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Suspicious</p>
              <h4 className="text-2xl font-bold mt-1">{analysisResult.suspiciousTransactions || 0}</h4>
            </div>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="h-1 mt-3 w-full bg-secondary overflow-hidden rounded-full">
            <div 
              className="h-full bg-amber-500" 
              style={{ 
                width: `${analysisResult.totalTransactions ? (analysisResult.suspiciousTransactions / analysisResult.totalTransactions) * 100 : 0}%` 
              }}
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Safe</p>
              <h4 className="text-2xl font-bold mt-1">{analysisResult.safeTransactions || 0}</h4>
            </div>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="h-1 mt-3 w-full bg-secondary overflow-hidden rounded-full">
            <div 
              className="h-full bg-emerald-500" 
              style={{ 
                width: `${analysisResult.totalTransactions ? (analysisResult.safeTransactions / analysisResult.totalTransactions) * 100 : 0}%` 
              }}
            />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="merchant">Merchant Analysis</TabsTrigger>
          <TabsTrigger value="method">Entry Method</TabsTrigger>
          <TabsTrigger value="amount">Amount Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Fraud Distribution Overview</h3>
            </div>
            <div className="p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Safe", value: analysisResult.safeTransactions || 0 },
                        { name: "Suspicious", value: analysisResult.suspiciousTransactions || 0 },
                        { name: "Fraudulent", value: analysisResult.fraudulentTransactions || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2].map((index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="merchant">
          <Card>
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Fraud by Merchant Category</h3>
            </div>
            <div className="p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analysisResult.fraudByMerchantCategory || []}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Fraudulent Transactions" fill={BAR_COLORS.merchant} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="method">
          <Card>
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Fraud by Card Entry Method</h3>
            </div>
            <div className="p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analysisResult.fraudByCardEntryMethod || []}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Fraudulent Transactions" fill={BAR_COLORS.method} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="amount">
          <Card>
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Fraud by Transaction Amount</h3>
            </div>
            <div className="p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analysisResult.amountDistribution || []}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="legitimate" 
                      name="Legitimate" 
                      stackId="a" 
                      fill={BAR_COLORS.legitimate}
                    />
                    <Bar 
                      dataKey="fraudulent" 
                      name="Fraudulent" 
                      stackId="a" 
                      fill={BAR_COLORS.fraudulent}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sample Results Table */}
      {analysisResult.sampleResults && analysisResult.sampleResults.length > 0 && (
        <Card>
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Sample Results</h3>
            <p className="text-sm text-muted-foreground">
              Showing up to 100 sample transactions from your analysis
            </p>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Merchant</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Card Method</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Risk Level</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Confidence</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {analysisResult.sampleResults && analysisResult.sampleResults.map((result, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">
                      ${result.transaction?.amount ? result.transaction.amount.toFixed(2) : '0.00'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {result.transaction?.merchantCategory || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {result.transaction?.cardEntryMethod || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          result.riskLevel === "high" 
                            ? "bg-red-100 text-red-800"
                            : result.riskLevel === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {result.riskLevel || 'unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {result.confidence ? (result.confidence * 100).toFixed(1) : '0.0'}%
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          result.status === "fraudulent"
                            ? "bg-red-100 text-red-800"
                            : result.status === "suspicious"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {result.status || 'unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {analysisResult.errorCount !== undefined && analysisResult.errorCount > 0 && (
        <div className="text-sm text-muted-foreground flex items-center">
          <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
          <span>
            {analysisResult.errorCount} transactions could not be processed due to invalid data
          </span>
        </div>
      )}
    </div>
  );
}