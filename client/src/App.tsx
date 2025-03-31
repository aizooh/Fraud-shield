import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import FraudDetection from "@/pages/fraud-detection";
import TransactionHistory from "@/pages/transaction-history";
import MainLayout from "@/components/layout/main-layout";
import { Provider } from "react-redux";
import { store } from "./store";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/fraud-detection" component={FraudDetection} />
      <Route path="/transactions" component={TransactionHistory} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MainLayout>
          <Router />
        </MainLayout>
        <Toaster />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
