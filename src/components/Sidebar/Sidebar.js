import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="logo">
        <h1>IMS</h1>
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
          Dashboard
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => isActive ? 'active' : ''}>
          Inventory
        </NavLink>
        <NavLink to="/predictions" className={({ isActive }) => isActive ? 'active' : ''}>
          Predictions
        </NavLink>
      </div>
      <div className="user-section">
        <img src="/avatar-placeholder.png" alt="User" className="avatar" />
        <span>Admin User</span>
      </div>
    </nav>
  );
}

export default Sidebar; 