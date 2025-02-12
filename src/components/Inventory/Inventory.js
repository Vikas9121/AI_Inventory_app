import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { inventoryApi, scanditApi } from '../../services/api';
import { wsService } from '../../services/websocket';
import './Inventory.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: '',
    price: ''
  });

  const fetchProducts = React.useCallback(async () => {
    try {
      const data = await inventoryApi.getProducts();
      setProducts(data.items || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchProducts();

    // Subscribe to WebSocket updates
    wsService.connect();
    const unsubscribe = wsService.subscribe((data) => {
      if (data.type === 'STOCK_UPDATE') {
        setProducts(currentProducts => 
          currentProducts.map(product => 
            product.id === data.productId 
              ? { ...product, quantity: data.newQuantity }
              : product
          )
        );
      }
    });

    return () => unsubscribe();
  }, [fetchProducts]);

  const handleScan = React.useCallback(async () => {
    try {
      const scanner = await scanditApi.initializeScanner();
      await scanner.createContextFromHtmlElement('scanner-container');
      
      scanner.on('scan', async (scanResult) => {
        console.log('Scanned:', scanResult.barcodeData);
        await fetchProducts();
        setScannerOpen(false);
      });

      await scanner.show();
    } catch (error) {
      console.error('Scanning error:', error);
    }
  }, [fetchProducts]);

  useEffect(() => {
    if (scannerOpen) {
      handleScan();
    }
  }, [scannerOpen, handleScan]);

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.quantity && newProduct.price) {
      setProducts([
        ...products,
        {
          id: products.length + 1,
          ...newProduct,
          quantity: parseInt(newProduct.quantity),
          price: parseFloat(newProduct.price)
        }
      ]);
      setNewProduct({ name: '', quantity: '', price: '' });
    }
  };

  // Add a visual indicator for stock changes
  const StockCell = ({ value, productId }) => {
    const [highlight, setHighlight] = useState(false);
    
    useEffect(() => {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 2000);
      return () => clearTimeout(timer);
    }, [value]);

    return (
      <TableCell 
        style={{
          backgroundColor: highlight ? '#fff3cd' : 'transparent',
          transition: 'background-color 0.5s'
        }}
      >
        {value}
      </TableCell>
    );
  };

  return (
    <div data-testid="inventory" className="inventory-container">
      <div className="inventory-header">
        <h2>Inventory Management</h2>
        <IconButton onClick={() => setScannerOpen(true)}>
          <QrCodeScannerIcon />
        </IconButton>
      </div>

      {/* Scanner Dialog */}
      <Dialog open={scannerOpen} onClose={() => setScannerOpen(false)}>
        <DialogTitle>Scan Barcode/QR Code</DialogTitle>
        <DialogContent>
          <div id="scanner-container"></div>
        </DialogContent>
      </Dialog>

      <div className="add-product-form">
        <TextField
          label="Product Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
          margin="normal"
        />
        <TextField
          label="Quantity"
          type="number"
          value={newProduct.quantity}
          onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
          margin="normal"
        />
        <TextField
          label="Price"
          type="number"
          value={newProduct.price}
          onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleAddProduct}>
          Add Product
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price ($)</TableCell>
                <TableCell>Total Value ($)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <StockCell value={product.quantity} productId={product.id} />
                  <TableCell>{product.price.toFixed(2)}</TableCell>
                  <TableCell>{(product.quantity * product.price).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default Inventory; 