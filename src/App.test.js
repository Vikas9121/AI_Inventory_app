import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders app header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Inventory Management System/i);
  expect(headerElement).toBeInTheDocument();
}); 