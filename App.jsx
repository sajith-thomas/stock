import React, { useState } from "react";
import axios from "axios";
import "./styles.css";
import Select from "react-select";
import { motion } from "framer-motion";

const stockOptions = [
  { label: "360 ONE", value: "360ONE.NS" },
  { label: "3M India", value: "3MINDIA.NS" },
  { label: "ECLERX", value: "ECLERX.NS" },
];

function App() {
  const [selectedStock, setSelectedStock] = useState(stockOptions[0]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", {
        stock_symbol: selectedStock.value,
      });
      setPrediction(response.data);
    } catch (error) {
      console.error("Prediction error:", error);
      setPrediction(null);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-sans p-6">
      {!acceptedDisclaimer ? (
        <motion.div
          className="disclaimer-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.p className="marquee-text">
            🚨 This stock prediction tool is for educational purposes only. 🚨
          </motion.p>

          <h1 className="disclaimer-title">⚠️ Risk Disclaimer</h1>
          <p className="text-gray-300">
            This stock prediction tool is for <b>educational purposes only</b>. Trading stocks and derivatives involve financial risks. Past performance does not guarantee future results. You are solely responsible for your own trading decisions.
          </p>

          <div className="disclaimer-box">
            <p className="text-gray-400"><b>Risk disclosure on derivatives:</b></p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>9 out of 10 individual traders in the equity F&O Segment incurred net losses.</li>
              <li>Average loss makers registered net trading losses close to ₹50,000.</li>
              <li>Loss makers expended an additional 28% of net losses as transaction costs.</li>
              <li>Profitable traders incurred 15%-50% of profits as transaction costs.</li>
            </ul>
            <p className="text-gray-400 text-sm mt-4">
              <i>Source: SEBI study dated January 25, 2023, on "Analysis of Profit and Loss of Individual Traders dealing in equity F&O Segment" (FY 2021-22).</i>
            </p>
          </div>

          <motion.button
            onClick={() => setAcceptedDisclaimer(true)}
            className="accept-button"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            I Understand & Accept
          </motion.button>
        </motion.div>
      ) : (
        /* Stock Prediction UI */
        <motion.div
          className="prediction-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="prediction-title">📈 NiftyXpert</h1>
          <h4 className="text-xl font-bold text-gray-400 mb-6">AI-Driven Stock Price Prediction Tool</h4>

          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <label className="text-lg font-semibold text-gray-300">Select Stock:</label>
            <Select
              options={stockOptions}
              value={selectedStock}
              onChange={setSelectedStock}
              className="stock-select"
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "#1F2937",
                  borderColor: "#374151",
                  color: "white",
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "white",
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: "#1F2937",
                  color: "white",
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? "#3B82F6" : "#1F2937",
                  color: state.isSelected ? "white" : "white",
                  "&:hover": {
                    backgroundColor: "#3B82F6",
                  },
                }),
              }}
            />
            <motion.button
              onClick={handlePredict}
              disabled={loading}
              className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {loading ? "⏳ Predicting..." : "📊 Predict"}
            </motion.button>
          </div>

          {prediction && (
            <motion.div
              className="prediction-result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold text-blue-400 mb-4">📊 {prediction.stock_symbol}</h3>
              <p className="text-gray-400 mb-6"><b>Date:</b> {prediction.predicted_date}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p className="prediction-value open">📈 Open: {prediction.Open}</p>
                <p className="prediction-value high">📉 High: {prediction.High}</p>
                <p className="prediction-value low">📊 Low: {prediction.Low}</p>
                <p className="prediction-value close">💰 Close: {prediction.Close}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default App;
