import FraudDetectionForm from "@/components/transaction/fraud-detection-form";

export default function FraudDetection() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Fraud Detection</h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Check Transaction for Fraud</h2>
              <p className="text-gray-600">
                Use the form below to evaluate a transaction for potential fraud. Our ML model will analyze the 
                transaction details and provide a risk assessment based on pattern recognition and anomaly detection.
              </p>
            </div>
            
            <FraudDetectionForm />
            
            <div className="mt-10 bg-white p-6 shadow sm:rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">How it works</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex-shrink-0 bg-primary bg-opacity-10 rounded-full p-4 mb-4">
                    <span className="material-icons text-primary text-2xl">input</span>
                  </div>
                  <h4 className="text-md font-medium mb-2">1. Enter Transaction Data</h4>
                  <p className="text-sm text-gray-600">Provide details about the transaction including amount, merchant, and location</p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="flex-shrink-0 bg-primary bg-opacity-10 rounded-full p-4 mb-4">
                    <span className="material-icons text-primary text-2xl">analytics</span>
                  </div>
                  <h4 className="text-md font-medium mb-2">2. ML Model Analysis</h4>
                  <p className="text-sm text-gray-600">Our advanced machine learning model analyzes patterns and indicators</p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="flex-shrink-0 bg-primary bg-opacity-10 rounded-full p-4 mb-4">
                    <span className="material-icons text-primary text-2xl">assessment</span>
                  </div>
                  <h4 className="text-md font-medium mb-2">3. Get Instant Results</h4>
                  <p className="text-sm text-gray-600">Receive fraud risk assessment with confidence score and recommendations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
