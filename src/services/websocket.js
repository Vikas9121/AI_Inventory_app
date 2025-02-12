class WebSocketService {
  constructor() {
    this.ws = null;
    this.subscribers = new Set();
  }

  connect() {
    this.ws = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.subscribers.forEach(callback => callback(data));
    };

    this.ws.onclose = () => {
      // Reconnect after 1 second
      setTimeout(() => this.connect(), 1000);
    };
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
}

export const wsService = new WebSocketService(); 