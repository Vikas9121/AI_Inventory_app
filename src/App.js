import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import Inventory from './components/Inventory/Inventory';
import Predictions from './components/Predictions/Predictions';
import './App.css';

function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/predictions" element={<Predictions />} />
        </Routes>
      </main>
    </div>
  );
}

export default App; 