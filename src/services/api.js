import axios from 'axios';
import * as ScanditSDK from 'scandit-sdk';

const API_BASE_URL = 'http://localhost:5001/api';
const SCANDIT_LICENSE_KEY = process.env.REACT_APP_SCANDIT_LICENSE_KEY;
// const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Zoho Inventory API
export const inventoryApi = {
  getProducts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  updateStock: async (productId, quantity) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/products/${productId}/stock`, {
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }
};

// Scandit Barcode Scanner
export const scanditApi = {
  initializeScanner: () => {
    return ScanditSDK.configure(SCANDIT_LICENSE_KEY, {
      engineLocation: "https://cdn.jsdelivr.net/npm/scandit-sdk@5.x/build/",
    });
  }
};

// Google Maps Integration
export const mapsApi = {
  trackInventory: async (locationId) => {
    // Implement inventory tracking logic
  }
};

// AI Forecasting (using Azure AI)
export const forecastApi = {
  getPredictions: async (productId) => {
    // Implement forecasting logic
  }
}; 