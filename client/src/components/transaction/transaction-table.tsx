import { Transaction } from "@shared/schema";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  total?: number;
}

export default function TransactionTable({ transactions, isLoading, total = 0 }: TransactionTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);
  
  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Transaction ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Merchant
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Risk Score
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                No transactions found
              </td>
            </tr>
          ) : (
            transactions.map((transaction) => (
              <tr key={transaction.transactionId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {transaction.transactionId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(transaction.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.merchantName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={transaction.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.confidence.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-primary hover:text-indigo-900">Details</a>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {total > pageSize && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={page === totalPages}
              className="ml-3"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(page * pageSize, total)}
                </span>{" "}
                of <span className="font-medium">{total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm"
                  onClick={handlePrevious}
                  disabled={page === 1}
                >
                  <span className="sr-only">Previous</span>
                  <span className="material-icons text-sm">chevron_left</span>
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={i}
                      variant={page === pageNum ? "default" : "outline"}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pageNum 
                          ? "z-10 bg-primary border-primary text-white" 
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm"
                  onClick={handleNext}
                  disabled={page === totalPages}
                >
                  <span className="sr-only">Next</span>
                  <span className="material-icons text-sm">chevron_right</span>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
