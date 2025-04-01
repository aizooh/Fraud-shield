/**
 * Test script for the Fraud Detection API
 * 
 * This script sends test transactions to the fraud detection API
 * and displays the results.
 */

import axios from 'axios';

// Set of test transactions
const testTransactions = [
  {
    // Legitimate transaction
    amount: 45.99,
    merchantCategory: "grocery",
    location: "normal",
    ipAddress: "192.168.1.1",
    cardEntryMethod: "chip",
    timestamp: new Date().toISOString(),
    description: "Low amount grocery purchase with chip - should be safe"
  },
  {
    // Suspicious transaction
    amount: 999.99,
    merchantCategory: "electronics",
    location: "normal",
    ipAddress: "192.168.10.45",
    cardEntryMethod: "online",
    timestamp: new Date().toISOString(),
    description: "Higher amount online purchase - might be suspicious"
  },
  {
    // Fraudulent transaction
    amount: 3500,
    merchantCategory: "ecommerce",
    location: "abnormal",
    ipAddress: "85.125.34.12",
    cardEntryMethod: "manual",
    timestamp: new Date(new Date().setHours(3)).toISOString(), // 3 AM transaction
    description: "High amount, abnormal location, manual entry at 3 AM - likely fraud"
  }
];

// Function to test the fraud detection API
async function testFraudDetection() {
  console.log("\n===== Fraud Detection API Test =====\n");
  
  for (const tx of testTransactions) {
    const { description, ...transactionData } = tx;
    
    console.log(`Testing transaction: ${description}`);
    console.log("Transaction data:", JSON.stringify(transactionData, null, 2));
    
    try {
      // Call the API endpoint
      const response = await axios.post('http://localhost:5000/api/fraud/predict', transactionData);
      
      // Get the prediction results
      const { prediction, transaction } = response.data;
      
      // Format the output
      console.log(`\nPrediction Results:`);
      console.log(`- Fraud detected: ${prediction.is_fraud ? "YES" : "NO"}`);
      console.log(`- Confidence: ${(prediction.confidence * 100).toFixed(2)}%`);
      console.log(`- Risk level: ${prediction.risk_level.toUpperCase()}`);
      
      // Add a visual indicator of the risk level
      let riskIndicator = "";
      if (prediction.risk_level === "low") {
        riskIndicator = "🟢 LOW RISK";
      } else if (prediction.risk_level === "medium") {
        riskIndicator = "🟠 MEDIUM RISK";
      } else {
        riskIndicator = "🔴 HIGH RISK";
      }
      
      console.log(`\n${riskIndicator}\n`);
      console.log("----------------------------------\n");
    } catch (error) {
      console.error(`Error testing transaction: ${error.message}`);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
      console.log("----------------------------------\n");
    }
  }
  
  console.log("===== Test Complete =====");
}

// Run the test
testFraudDetection();