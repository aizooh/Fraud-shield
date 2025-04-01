import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import FraudDetection from "@/pages/fraud-detection";
import TransactionHistory from "@/pages/transaction-history";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile";
import MainLayout from "@/components/layout/main-layout";
import { Provider } from "react-redux";
import { store } from "./store";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  // If still loading or user is not authenticated, show nothing or loading indicator
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If authenticated, render the component
  return user ? <Component /> : null;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/">
        {() => <PrivateRoute component={Dashboard} />}
      </Route>
      <Route path="/fraud-detection">
        {() => <PrivateRoute component={FraudDetection} />}
      </Route>
      <Route path="/transactions">
        {() => <PrivateRoute component={TransactionHistory} />}
      </Route>
      <Route path="/profile">
        {() => <PrivateRoute component={ProfilePage} />}
      </Route>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const { user } = useAuth();
  const [location] = useLocation();

  // Don't show main layout on auth page
  if (location === "/auth") {
    return <Router />;
  }

  return (
    <MainLayout>
      <Router />
    </MainLayout>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppLayout />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
