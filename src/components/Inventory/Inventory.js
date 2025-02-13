import React, { useState, useEffect } from 'react';
import { fetchProducts, addProduct, updateStock } from '../../services/api';
import BarcodeScanner from '../BarcodeScanner/BarcodeScanner';
import './Inventory.css';

function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: '',
    price: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      console.log('Starting to fetch products...'); // Debug log
      const data = await fetchProducts();
      console.log('Fetched products:', data); // Debug log
      setProducts(data);
    } catch (error) {
      console.error('Load products error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await addProduct({
        name: newProduct.name,
        quantity: parseInt(newProduct.quantity),
        price: parseFloat(newProduct.price)
      });
      setNewProduct({ name: '', quantity: '', price: '' });
      loadProducts(); // Refresh the list
    } catch (error) {
      setError('Error adding product: ' + error.message);
    }
  };

  const handleUpdateStock = async (productId, newQuantity) => {
    try {
      await updateStock(productId, parseInt(newQuantity));
      loadProducts(); // Refresh the list
    } catch (error) {
      setError('Error updating stock: ' + error.message);
    }
  };

  const handleBarcodeScan = (barcodeData) => {
    console.log('Scanned barcode:', barcodeData);
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return (
    <div className="error">
      <h3>Error Loading Products</h3>
      <p>{error}</p>
      <button className="button" onClick={loadProducts}>Retry</button>
    </div>
  );

  return (
    <div className="inventory">
      <div className="page-header">
        <h1>Inventory</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Add New Product</h2>
        </div>
        <form onSubmit={handleAddProduct} className="product-form">
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              placeholder="Enter product name"
            />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
              placeholder="Enter quantity"
            />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              step="0.01"
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              placeholder="Enter price"
            />
          </div>
          <button type="submit" className="button">Add Product</button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Scan Product</h2>
        </div>
        <BarcodeScanner onScan={handleBarcodeScan} />
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Product List</h2>
        </div>
        <div className="products-grid">
          {products.length === 0 ? (
            <p className="empty-state">No products found</p>
          ) : (
            products.map(product => (
              <div key={product.product_id} className="product-card">
                <h3>{product.name}</h3>
                <div className="product-details">
                  <span>Quantity: {product.quantity}</span>
                  <span>Price: ${product.price}</span>
                </div>
                <div className="stock-control">
                  <input
                    type="number"
                    placeholder="New Quantity"
                    onChange={(e) => handleUpdateStock(product.product_id, e.target.value)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Inventory; 