from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
import yfinance as yf
from datetime import datetime, timedelta
from keras.losses import MeanSquaredError

app = Flask(__name__)

CORS(app)  # Enable CORS for frontend connection

# ✅ Load trained model
custom_objects = {"mse": MeanSquaredError()}
model = tf.keras.models.load_model("nifty500model.h5", custom_objects=custom_objects)

# ✅ Function to fetch stock data
def fetch_stock_data(symbol, start="2023-01-01"):
    today = datetime.today().strftime('%Y-%m-%d')
    df = yf.download(symbol, start=start, end=today)
    return df

# ✅ Function to add only 11 technical indicators
def add_technical_indicators(df):
    if 'Close' not in df.columns:
        raise ValueError("❌ Stock data is incomplete! Missing 'Close' column.")

    df['SMA'] = df['Close'].rolling(window=50).mean()
    df['EMA'] = df['Close'].ewm(span=50, adjust=False).mean()
    df['MACD'] = df['Close'].ewm(span=12, adjust=False).mean() - df['Close'].ewm(span=26, adjust=False).mean()
    df['RSI'] = 100 - (100 / (1 + df['Close'].pct_change().rolling(14).mean()))
    df['ADX'] = (df['High'] - df['Low']).rolling(window=14).mean()
    df['WMA'] = df['Close'].rolling(window=20).apply(lambda x: np.average(x, weights=np.arange(1, 21)))
    df['STOCH'] = 100 * (df['Close'] - df['Low'].rolling(14).min()) / (df['High'].rolling(14).max() - df['Low'].rolling(14).min())

    df.dropna(inplace=True)  # Remove NaN values
    return df

# ✅ Function to prepare data for model input
def prepare_data(df):
    scaler = MinMaxScaler()
    feature_cols = ['Open', 'High', 'Low', 'Close', 'SMA', 'EMA', 'MACD', 'RSI', 'ADX', 'WMA', 'STOCH']
    scaled_data = scaler.fit_transform(df[feature_cols])

    X = []
    for i in range(30, len(scaled_data) - 1):
        X.append(scaled_data[i-30:i])

    return np.array(X), scaler

# ✅ Prediction API Endpoint
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        stock_symbol = data.get("stock_symbol", "SBIN.NS")  # Default to TCS
        user_date = data.get("date", (datetime.today() + timedelta(days=1)).strftime('%Y-%m-%d'))

        # Fetch and process stock data
        df = fetch_stock_data(stock_symbol)
        if df.empty or len(df) < 30:
            return jsonify({"error": f"Not enough data for {stock_symbol}"}), 400

        df = add_technical_indicators(df)  # Add technical indicators
        X, scaler = prepare_data(df)  # Prepare data
        X_last_30_days = X[-1].reshape(1, 30, 11)  # Ensure correct shape

        # Make prediction
        prediction = model.predict(X_last_30_days)
        prediction = scaler.inverse_transform(np.concatenate([prediction, np.zeros((1, 7))], axis=1))[:, :4]

        result = {
            "stock_symbol": stock_symbol,
            "predicted_date": user_date,
            "Open": round(prediction[0][0], 2),
            "High": round(prediction[0][1], 2),
            "Low": round(prediction[0][2], 2),
            "Close": round(prediction[0][3], 2),
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Run Flask server
if __name__ == "__main__":

    app.run(debug=True)

#app.py
