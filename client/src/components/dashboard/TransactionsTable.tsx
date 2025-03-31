import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";

interface TransactionsTableProps {
  limit?: number;
}

export default function TransactionsTable({ limit = 10 }: TransactionsTableProps) {
  const [page, setPage] = useState(1);
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/transactions', { limit, offset: (page - 1) * limit }],
    queryFn: ({ queryKey }) => 
      fetch(`${queryKey[0]}?limit=${limit}&offset=${(page - 1) * limit}`, {
        credentials: 'include'
      }).then(res => res.json())
  });
  
  const handleExport = () => {
    // This would normally export the data to CSV
    // For this implementation, we'll show a toast message
    alert('CSV Export functionality would be implemented here');
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };
  
  const formatAmount = (amount: string) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };
  
  const getStatusBadgeClass = (transaction: Transaction) => {
    if (transaction.isFraud) {
      return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800";
    } else if (transaction.riskLevel === "medium") {
      return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800";
    } else {
      return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800";
    }
  };
  
  const getStatusText = (transaction: Transaction) => {
    if (transaction.isFraud) {
      return "Fraudulent";
    } else if (transaction.riskLevel === "medium") {
      return "Suspicious";
    } else {
      return "Safe";
    }
  };
  
  return (
    <Card className="shadow">
      <CardHeader className="flex-row justify-between items-center">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest transactions with fraud detection results</CardDescription>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <span className="material-icons mr-2 text-sm">file_download</span>
          Export CSV
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, index) => (
                  <TableRow key={index}>
                    {Array(7).fill(0).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-red-500">
                    Error loading transactions
                  </TableCell>
                </TableRow>
              ) : data && data.length > 0 ? (
                data.map((transaction: Transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.transactionId}
                    </TableCell>
                    <TableCell>{formatDate(transaction.transactionTime)}</TableCell>
                    <TableCell>{formatAmount(transaction.amount)}</TableCell>
                    <TableCell>{transaction.merchantName}</TableCell>
                    <TableCell>
                      <span className={getStatusBadgeClass(transaction)}>
                        {getStatusText(transaction)}
                      </span>
                    </TableCell>
                    <TableCell>{parseFloat(transaction.confidenceScore).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" size="sm">
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="py-4 px-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(page > 1 ? page - 1 : 1)}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {[...Array(3)].map((_, i) => {
                const pageNumber = i + 1;
                return (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      isActive={page === pageNumber}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(page + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
