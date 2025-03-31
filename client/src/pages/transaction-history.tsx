import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TransactionTable from "@/components/transaction/transaction-table";
import { Transaction } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function TransactionHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  // Fetch transactions
  const { data: transactionsData, isLoading } = useQuery<{ transactions: Transaction[] }>({
    queryKey: ["/api/transactions"],
  });
  
  const transactions = transactionsData?.transactions || [];
  
  // Filter transactions based on search term and status
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === "" || 
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.merchantName.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "" || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Transaction History</h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter Transactions</CardTitle>
              <CardDescription>
                Search and filter the transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by ID or merchant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="safe">Safe</SelectItem>
                      <SelectItem value="suspicious">Suspicious</SelectItem>
                      <SelectItem value="fraudulent">Fraudulent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("");
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Transaction Records</CardTitle>
              <CardDescription>
                Complete history of all transaction verifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionTable
                transactions={filteredTransactions}
                isLoading={isLoading}
                total={filteredTransactions.length}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
