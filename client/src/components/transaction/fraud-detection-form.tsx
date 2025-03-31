import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fraudDetectionRequestSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useDispatch } from "react-redux";
import { addTransaction } from "@/store/transaction-slice";
import { TransactionWithFraudResult } from "@/types";

// Extend schema with additional fields and validations
const formSchema = fraudDetectionRequestSchema.extend({
  merchantName: z.string().min(1, "Merchant name is required"),
  timestamp: z.string().optional(),
});

export default function FraudDetectionForm() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const [result, setResult] = useState<TransactionWithFraudResult | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      merchantName: "",
      merchantCategory: "",
      location: "",
      ipAddress: "",
      cardEntryMethod: "",
      timestamp: new Date().toISOString().slice(0, 16),
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/detect-fraud", values);
      const data = await res.json();
      return data as TransactionWithFraudResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setResult(data);
      dispatch(addTransaction(data.transaction));
      
      // Toast notification based on result
      const statusMessage = data.fraudResult.is_fraud 
        ? "Fraudulent transaction detected!" 
        : data.fraudResult.confidence > 0.5 
          ? "Suspicious transaction detected" 
          : "Transaction appears safe";
          
      const toastVariant = data.fraudResult.is_fraud 
        ? "destructive" 
        : data.fraudResult.confidence > 0.5 
          ? "default" 
          : "default";
      
      toast({
        title: "Fraud Detection Complete",
        description: statusMessage,
        variant: toastVariant,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process fraud detection. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  function handleReset() {
    form.reset();
    setResult(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fraud Detection Test</CardTitle>
        <CardDescription>
          Enter transaction details to check for potential fraud
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Transaction Amount ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="merchantCategory"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Merchant Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="travel">Travel & Entertainment</SelectItem>
                      <SelectItem value="grocery">Grocery</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="merchantName"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Merchant Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Merchant name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Transaction Location</FormLabel>
                  <FormControl>
                    <Input placeholder="City, Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ipAddress"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>IP Address</FormLabel>
                  <FormControl>
                    <Input placeholder="xxx.xxx.xxx.xxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cardEntryMethod"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Card Entry Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="chip">Chip</SelectItem>
                      <SelectItem value="swipe">Magnetic Swipe</SelectItem>
                      <SelectItem value="manual">Manually Entered</SelectItem>
                      <SelectItem value="contactless">Contactless</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timestamp"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Transaction Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="sm:col-span-6 flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleReset} 
                className="mr-3"
              >
                Reset
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <span className="material-icons animate-spin mr-2 text-sm">refresh</span> 
                    Processing...
                  </>
                ) : "Check for Fraud"}
              </Button>
            </div>
          </form>
        </Form>
        
        {result && (
          <div className="mt-6 p-4 border rounded-md">
            <h3 className="font-medium text-lg mb-2">Fraud Detection Result</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span className={
                  result.fraudResult.is_fraud 
                    ? "text-red-600 font-medium" 
                    : result.fraudResult.confidence > 0.5 
                      ? "text-yellow-600 font-medium" 
                      : "text-green-600 font-medium"
                }>
                  {result.fraudResult.is_fraud 
                    ? "Fraudulent" 
                    : result.fraudResult.confidence > 0.5 
                      ? "Suspicious" 
                      : "Safe"}
                </span>
              </p>
              <p>
                <span className="font-medium">Confidence:</span>{" "}
                {(result.fraudResult.confidence * 100).toFixed(2)}%
              </p>
              <p>
                <span className="font-medium">Risk Level:</span>{" "}
                <span className={
                  result.fraudResult.risk_level === "high" 
                    ? "text-red-600 font-medium" 
                    : result.fraudResult.risk_level === "medium" 
                      ? "text-yellow-600 font-medium" 
                      : "text-green-600 font-medium"
                }>
                  {result.fraudResult.risk_level.charAt(0).toUpperCase() + result.fraudResult.risk_level.slice(1)}
                </span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
