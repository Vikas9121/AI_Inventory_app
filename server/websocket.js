const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send stock updates to all connected clients
  function broadcastStockUpdate(productId, newQuantity) {
    const message = JSON.stringify({
      type: 'STOCK_UPDATE',
      productId,
      newQuantity
    });
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Handle stock changes from database
  // This would be called whenever stock changes in your database
  global.emitStockUpdate = broadcastStockUpdate;
}); 