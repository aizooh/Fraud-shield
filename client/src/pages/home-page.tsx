import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Lock, BarChart4, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function HomePage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6 py-16">
          <nav className="flex justify-between items-center mb-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 mr-2" />
              <span className="text-2xl font-bold">Fraud Shield</span>
            </div>
            <div>
              {user ? (
                <Button 
                  variant="secondary" 
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </Button>
              ) : (
                <div className="space-x-4">
                  <Button 
                    variant="ghost" 
                    className="text-white hover:text-white hover:bg-white/10"
                    onClick={() => navigate("/auth")}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => navigate("/auth")}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </nav>

          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Advanced Fraud Detection Powered by Machine Learning
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Protect your business with real-time transaction monitoring and fraud analytics. Detect suspicious activities before they become threats.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-700 hover:bg-gray-100" 
                  onClick={() => navigate(user ? "/fraud-detection" : "/auth")}
                >
                  Try Fraud Detection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white/10" 
                  onClick={() => navigate(user ? "/transactions" : "/auth")}
                >
                  View Demo
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative w-full max-w-lg">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
                <div className="relative">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center">
                        <Lock className="h-6 w-6 mr-2 text-blue-300" />
                        <h3 className="text-xl font-semibold">Fraud Analysis</h3>
                      </div>
                      <BarChart4 className="h-6 w-6 text-blue-300" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center p-3 rounded-lg bg-white/5">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium">Transaction Approved</p>
                          <p className="text-xs opacity-70">$123.45 - Coffee Shop</p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 rounded-lg bg-white/5">
                        <AlertTriangle className="h-5 w-5 text-amber-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium">Suspicious Activity</p>
                          <p className="text-xs opacity-70">$899.99 - Online Purchase</p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 rounded-lg bg-red-500/20">
                        <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium">Possible Fraud Detected</p>
                          <p className="text-xs opacity-70">$1,499.00 - Foreign Transfer</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Fraud Detection Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines machine learning with financial expertise to protect your business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-lg mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Protection</h3>
              <p className="text-gray-600">
                Analyze transactions as they happen with our advanced machine learning model trained on real financial data.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-lg mb-4">
                <BarChart4 className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Detailed Analytics</h3>
              <p className="text-gray-600">
                Gain insights into transaction patterns with comprehensive dashboards and visual reports.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-lg mb-4">
                <AlertTriangle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Risk Assessment</h3>
              <p className="text-gray-600">
                Evaluate transactions with our three-level risk classification system: low, medium, and high risk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-700 to-blue-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to secure your transactions?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Start protecting your business today with our advanced fraud detection system
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-700 hover:bg-gray-100"
            onClick={() => navigate("/auth")}
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 mr-2" />
                <span className="text-xl font-bold">Fraud Shield</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Advanced fraud detection powered by machine learning to protect your business transactions.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>Features</li>
                  <li>Pricing</li>
                  <li>Integrations</li>
                  <li>Documentation</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>About</li>
                  <li>Blog</li>
                  <li>Careers</li>
                  <li>Contact</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>Help Center</li>
                  <li>Community</li>
                  <li>Webinars</li>
                  <li>API Status</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-500 text-center">
              © {new Date().getFullYear()} Fraud Shield. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}