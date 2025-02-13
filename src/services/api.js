import axios from 'axios';
import * as ScanditSDK from 'scandit-sdk';

// Get the environment URL from eb status and use it here
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000'
  : 'http://inventory-system-env.eba-thfmh4zq.us-east-1.elasticbeanstalk.com';
const SCANDIT_LICENSE_KEY = process.env.REACT_APP_SCANDIT_LICENSE_KEY;
// const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

console.log('Current API URL:', API_BASE_URL); // Debug log

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
  withCredentials: false // Important for CORS
});

// Add response interceptor for better error handling
api.interceptors.request.use(request => {
  console.log('Starting Request:', request)
  return request
})

api.interceptors.response.use(
  response => {
    console.log('Response:', response)
    return response
  },
  error => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    throw error
  }
)

// Zoho Inventory API
export const inventoryApi = {
  getProducts: async () => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  updateStock: async (productId, quantity) => {
    try {
      const response = await api.put(`/products/${productId}/stock`, {
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

export const fetchProducts = async () => {
  try {
    console.log('Fetching from:', `${API_BASE_URL}/products`);
    const response = await api.get('/products', {
      headers: {
        'Accept': 'application/json',
      }
    });
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fetch error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(error.response?.data?.error || 'Failed to fetch products');
  }
};

export const addProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to add product');
  }
};

export const updateStock = async (productId, quantity) => {
  try {
    const response = await api.put(`/products/${productId}/stock`, { quantity });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update stock');
  }
}; 