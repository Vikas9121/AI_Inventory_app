import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import Inventory from './components/Inventory/Inventory';
import Predictions from './components/Predictions/Predictions';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Inventory Management System</h1>
          <nav className="main-nav">
            <ul>
              <li><a href="/">Dashboard</a></li>
              <li><a href="/inventory">Inventory</a></li>
              <li><a href="/predictions">Predictions</a></li>
            </ul>
          </nav>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/predictions" element={<Predictions />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 