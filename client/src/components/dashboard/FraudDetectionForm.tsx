import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTransactionSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useDispatch } from "react-redux";
import { setTransactionResult, setLoading } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const formSchema = insertTransactionSchema.extend({
  amount: z.string().min(1, { message: "Amount is required" }),
  merchantName: z.string().min(1, { message: "Merchant name is required" }),
  merchantCategory: z.string().min(1, { message: "Category is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  ipAddress: z.string().min(1, { message: "IP address is required" }).regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, { message: "Invalid IP address format" }),
  cardEntryMethod: z.string().min(1, { message: "Entry method is required" }),
  transactionTime: z.string().min(1, { message: "Transaction time is required" }),
});

export default function FraudDetectionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      merchantName: "",
      merchantCategory: "",
      location: "",
      ipAddress: "",
      cardEntryMethod: "",
      transactionTime: new Date().toISOString().slice(0, 16),
    }
  });
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    dispatch(setLoading(true));
    
    try {
      const response = await apiRequest("POST", "/api/transactions/check", data);
      const result = await response.json();
      
      dispatch(setTransactionResult(result));
      
      toast({
        title: "Fraud detection complete",
        description: `Risk Level: ${result.result.risk_level}, Confidence: ${(result.result.confidence * 100).toFixed(1)}%`,
        variant: result.result.is_fraud ? "destructive" : "default",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };
  
  const handleReset = () => {
    form.reset();
  };
  
  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle>Fraud Detection Test</CardTitle>
        <CardDescription>Enter transaction details to check for potential fraud</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Transaction Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                    <Input placeholder="Merchant Name" {...field} />
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
              name="transactionTime"
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Check for Fraud"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
