import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';

// Enable React Router v7 features
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

Amplify.configure({
  API: {
    endpoints: [
      {
        name: 'inventory',
        endpoint: process.env.REACT_APP_API_URL
      }
    ]
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter {...router}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);