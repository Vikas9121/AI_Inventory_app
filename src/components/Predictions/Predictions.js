import React, { useState } from 'react';
import './Predictions.css';

function Predictions() {
  const [timeframe, setTimeframe] = useState('week');
  const [predictions, setPredictions] = useState([]);

  return (
    <div className="predictions">
      <div className="page-header">
        <h1>Stock Predictions</h1>
        <select 
          value={timeframe} 
          onChange={(e) => setTimeframe(e.target.value)}
          className="timeframe-select"
        >
          <option value="week">Next 7 Days</option>
          <option value="month">Next 30 Days</option>
          <option value="quarter">Next Quarter</option>
        </select>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Stock Level Predictions</h2>
        </div>
        {predictions.length === 0 ? (
          <p className="empty-state">No predictions available</p>
        ) : (
          <div className="predictions-grid">
            {predictions.map(prediction => (
              <div key={prediction.id} className="prediction-card">
                <h3>{prediction.productName}</h3>
                <div className="prediction-details">
                  <div className="prediction-stat">
                    <label>Current Stock</label>
                    <span>{prediction.currentStock}</span>
                  </div>
                  <div className="prediction-stat">
                    <label>Predicted Stock</label>
                    <span>{prediction.predictedStock}</span>
                  </div>
                  <div className="prediction-stat">
                    <label>Restock Needed</label>
                    <span className={prediction.needsRestock ? 'warning' : ''}>
                      {prediction.needsRestock ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Predictions;