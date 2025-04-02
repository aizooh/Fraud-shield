import { useState } from "react";
import CSVImportForm from "@/components/transaction/csv-import-form";
import { BarChart3, FileInput, TrendingUp, CreditCard, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const singleTransactionSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Amount must be a positive number"
  ),
  merchantCategory: z.string().min(1, "Merchant category is required"),
  location: z.string().optional(),
  ipAddress: z.string().optional(),
  cardEntryMethod: z.string().min(1, "Card entry method is required"),
});

type SingleTransactionFormValues = z.infer<typeof singleTransactionSchema>;

interface TransactionResult {
  is_fraud: boolean;
  confidence: number;
  risk_level: "low" | "medium" | "high";
}

export default function FraudDetection() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("bulk");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);

  const form = useForm<SingleTransactionFormValues>({
    resolver: zodResolver(singleTransactionSchema),
    defaultValues: {
      amount: "",
      merchantCategory: "",
      location: "",
      ipAddress: "",
      cardEntryMethod: "",
    },
  });

  const onSubmit = async (values: SingleTransactionFormValues) => {
    setIsAnalyzing(true);
    setTransactionResult(null);

    try {
      const response = await fetch("/api/fraud/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(values.amount),
          merchantCategory: values.merchantCategory,
          location: values.location || "",
          ipAddress: values.ipAddress || "",
          cardEntryMethod: values.cardEntryMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to analyze transaction");
      }

      const data = await response.json();
      setTransactionResult(data.prediction);
      
      toast({
        title: "Analysis complete",
        description: `Transaction analyzed successfully`,
      });
    } catch (error) {
      console.error("Transaction analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze transaction",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string | undefined) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Fraud Detection Dashboard</h1>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <div className="max-w-4xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single Transaction</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Analysis (CSV)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="single" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Single Transaction Analysis</CardTitle>
                    <CardDescription>
                      Analyze a single transaction for potential fraud
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Amount ($)</FormLabel>
                                <FormControl>
                                  <Input placeholder="100.00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="merchantCategory"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Merchant Category</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="electronics">Electronics</SelectItem>
                                    <SelectItem value="food_beverage">Food & Beverage</SelectItem>
                                    <SelectItem value="entertainment">Entertainment</SelectItem>
                                    <SelectItem value="travel">Travel</SelectItem>
                                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                                    <SelectItem value="retail">Retail</SelectItem>
                                    <SelectItem value="fuel">Fuel</SelectItem>
                                    <SelectItem value="luxury">Luxury</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cardEntryMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Card Entry Method</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a method" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="chip">Chip</SelectItem>
                                    <SelectItem value="contactless">Contactless</SelectItem>
                                    <SelectItem value="swipe">Magnetic Swipe</SelectItem>
                                    <SelectItem value="manual">Manual Entry</SelectItem>
                                    <SelectItem value="online">Online</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="New York" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="ipAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>IP Address (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="192.168.1.1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button type="submit" disabled={isAnalyzing} className="w-full">
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            "Analyze Transaction"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                {transactionResult && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Analysis Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                        <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm border">
                          <div className="mb-2">
                            {transactionResult.is_fraud ? (
                              <AlertCircle className="h-10 w-10 text-red-500" />
                            ) : (
                              <CheckCircle className="h-10 w-10 text-green-500" />
                            )}
                          </div>
                          <h3 className="text-lg font-medium">Fraud Detection</h3>
                          <p className="text-center mt-2">
                            {transactionResult.is_fraud
                              ? "Potential fraud detected"
                              : "No fraud detected"}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm border">
                          <div className="mb-2">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-800 font-semibold">
                                {(transactionResult.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <h3 className="text-lg font-medium">Confidence</h3>
                          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${transactionResult.confidence * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm border">
                          <div className="mb-2">
                            <div className={`px-3 py-1 rounded-full ${getRiskLevelColor(transactionResult.risk_level)}`}>
                              {transactionResult.risk_level?.toUpperCase()}
                            </div>
                          </div>
                          <h3 className="text-lg font-medium">Risk Level</h3>
                          <p className="text-center mt-2">
                            {transactionResult.risk_level === "low" && "Low risk transaction"}
                            {transactionResult.risk_level === "medium" && "Medium risk transaction"}
                            {transactionResult.risk_level === "high" && "High risk transaction"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="bulk" className="mt-6">
                <div className="mb-8">
                  <h2 className="text-xl font-medium mb-2">Bulk Transaction Fraud Analysis</h2>
                  <p className="text-muted-foreground">
                    Import your transaction data in CSV format to analyze for potential fraud patterns. 
                    Our ML model will scan your transactions and provide detailed analytics on potential 
                    fraud risks across your dataset.
                  </p>
                </div>
                
                <CSVImportForm />
                
                <div className="mt-10 bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-medium mb-4">How it works</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="flex-shrink-0 bg-primary/10 rounded-full p-4 mb-4">
                        <FileInput className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="text-md font-medium mb-2">1. Import CSV Data</h4>
                      <p className="text-sm text-muted-foreground">Upload your transaction CSV file with all necessary transaction details</p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="flex-shrink-0 bg-primary/10 rounded-full p-4 mb-4">
                        <TrendingUp className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="text-md font-medium mb-2">2. Bulk Analysis</h4>
                      <p className="text-sm text-muted-foreground">Our ML model processes all transactions at once, identifying patterns and anomalies</p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="flex-shrink-0 bg-primary/10 rounded-full p-4 mb-4">
                        <BarChart3 className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="text-md font-medium mb-2">3. Visual Reports</h4>
                      <p className="text-sm text-muted-foreground">View comprehensive dashboards with fraud trends, patterns, and specific insights</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
