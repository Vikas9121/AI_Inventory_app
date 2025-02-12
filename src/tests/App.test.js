import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import Inventory from '../components/Inventory';
import { inventoryApi } from '../services/api';

// Mock the API calls
jest.mock('../services/api');

describe('App Component', () => {
  test('renders main navigation elements', () => {
    render(<App />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Inventory/i)).toBeInTheDocument();
    expect(screen.getByText(/Predictions/i)).toBeInTheDocument();
  });
});

describe('Inventory Component', () => {
  beforeEach(() => {
    // Mock API responses
    inventoryApi.getProducts.mockResolvedValue({
      data: [
        { id: 1, name: 'Test Product', quantity: 50, price: 19.99 }
      ]
    });
  });

  test('renders product list', async () => {
    render(<Inventory />);
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });

  test('adds new product', async () => {
    inventoryApi.addProduct.mockResolvedValue({
      data: { id: 2, name: 'New Product', quantity: 100, price: 29.99 }
    });

    render(<Inventory />);
    
    fireEvent.click(screen.getByText('Add New Product'));
    
    const nameInput = screen.getByLabelText('Product Name');
    const quantityInput = screen.getByLabelText('Quantity');
    const priceInput = screen.getByLabelText('Price');
    
    fireEvent.change(nameInput, { target: { value: 'New Product' } });
    fireEvent.change(quantityInput, { target: { value: '100' } });
    fireEvent.change(priceInput, { target: { value: '29.99' } });
    
    fireEvent.click(screen.getByText('Submit'));
    
    await waitFor(() => {
      expect(screen.getByText('New Product')).toBeInTheDocument();
    });
  });
}); 