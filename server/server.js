const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store current inventory state
let inventory = [
  { id: 1, name: 'Laptop', quantity: 50, price: 999.99 },
  { id: 2, name: 'Smartphone', quantity: 100, price: 599.99 },
  { id: 3, name: 'Headphones', quantity: 200, price: 99.99 }
];

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send initial inventory state
  ws.send(JSON.stringify({
    type: 'INITIAL_STATE',
    inventory
  }));

  // Handle incoming messages
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'UPDATE_STOCK') {
      updateStock(data.productId, data.quantity);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Function to broadcast updates to all clients
function broadcastUpdate(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// REST API endpoints
app.get('/api/products', (req, res) => {
  res.json({ items: inventory });
});

app.put('/api/products/:id/stock', (req, res) => {
  const productId = parseInt(req.params.id);
  const { quantity } = req.body;
  
  updateStock(productId, quantity);
  res.json({ message: 'Stock updated successfully' });
});

function updateStock(productId, newQuantity) {
  const product = inventory.find(p => p.id === productId);
  if (product) {
    product.quantity = newQuantity;
    broadcastUpdate({
      type: 'STOCK_UPDATE',
      productId,
      newQuantity
    });
  }
}

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 