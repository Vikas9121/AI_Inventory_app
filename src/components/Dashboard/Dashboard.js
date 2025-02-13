import React from 'react';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Products</h3>
          <div className="stat-value">0</div>
        </div>
        <div className="stat-card">
          <h3>Total Inventory Value</h3>
          <div className="stat-value">$0.00</div>
        </div>
        <div className="stat-card">
          <h3>Low Stock Items</h3>
          <div className="stat-value">0</div>
        </div>
        <div className="stat-card">
          <h3>Average Price</h3>
          <div className="stat-value">$0.00</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Recent Products</h2>
          <button className="button">View All</button>
        </div>
        <div className="recent-products">
          <p className="empty-state">No products added yet</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;