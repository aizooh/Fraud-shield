import CSVImportForm from "@/components/transaction/csv-import-form";
import { BarChart3, FileInput, TrendingUp } from "lucide-react";

export default function FraudDetection() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center">
          <span className="material-icons mr-2 text-primary">home</span>
          <h1 className="text-2xl font-semibold">Fraud Detection Dashboard</h1>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <div className="max-w-4xl mx-auto">
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
          </div>
        </div>
      </div>
    </div>
  );
}
