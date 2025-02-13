from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import sqlite3
from typing import Dict
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import os

# Initialize Flask application
application = Flask(__name__)
CORS(application)

class InventoryManagementSystem:
    def __init__(self):
        try:
            # Use absolute path for database in EB environment
            db_path = os.path.join(os.path.dirname(__file__), 'inventory.db')
            self.conn = sqlite3.connect(db_path)
            self.cursor = self.conn.cursor()
            self.setup_database()
        except sqlite3.Error as e:
            print(f"Database connection error: {e}")
            raise
        
        # Configure notification settings
        self.threshold = 10
        self.email_sender = "your-email@example.com"
        self.email_password = "your-app-password"
        
        # Add validation for email configuration
        if not all([self.email_sender, self.email_password]):
            raise ValueError("Email configuration is incomplete")
        
        # Add logging initialization
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            filename='inventory.log'
        )
        self.logger = logging.getLogger(__name__)
        
    def setup_database(self):
        """Create necessary tables if they don't exist"""
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS inventory (
                product_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                last_updated TIMESTAMP
            )
        ''')
        self.conn.commit()
    
    def add_product(self, name: str, quantity: int, price: float) -> None:
        """Add a new product to inventory"""
        current_time = datetime.now()
        self.cursor.execute('''
            INSERT INTO inventory (name, quantity, price, last_updated)
            VALUES (?, ?, ?, ?)
        ''', (name, quantity, price, current_time))
        self.conn.commit()
        
    def update_stock(self, product_id: int, quantity: int) -> None:
        """Update stock quantity for a product"""
        current_time = datetime.now()
        self.cursor.execute('''
            UPDATE inventory 
            SET quantity = ?, last_updated = ?
            WHERE product_id = ?
        ''', (quantity, current_time, product_id))
        self.conn.commit()
        
        if quantity <= self.threshold:
            self.send_low_stock_notification(product_id, quantity)
    
    def get_product_info(self, product_id: int) -> Dict:
        """Get product information"""
        self.cursor.execute('''
            SELECT * FROM inventory WHERE product_id = ?
        ''', (product_id,))
        result = self.cursor.fetchone()
        if result:
            return {
                'product_id': result[0],
                'name': result[1],
                'quantity': result[2],
                'price': result[3],
                'last_updated': result[4]
            }
        return None
    
    def get_all_products(self):
        """Get all products from inventory"""
        self.cursor.execute('SELECT * FROM inventory')
        results = self.cursor.fetchall()
        products = []
        for result in results:
            products.append({
                'product_id': result[0],
                'name': result[1],
                'quantity': result[2],
                'price': result[3],
                'last_updated': result[4]
            })
        return products
    
    def predict_stock_level(self, product_id: int):
        """Predict stock levels (placeholder for ML implementation)"""
        product = self.get_product_info(product_id)
        if not product:
            return None
        # Add your ML prediction logic here
        return {"predicted_stock": product['quantity'] - 5}  # Simple placeholder
    
    def send_low_stock_notification(self, product_id: int, quantity: int) -> None:
        """Send email notification for low stock"""
        product = self.get_product_info(product_id)
        if not product:
            return
        
        subject = f"Low Stock Alert: {product['name']}"
        body = f"""
        Low stock alert for {product['name']}!
        Current quantity: {quantity}
        Please reorder soon.
        """
        
        msg = MIMEMultipart()
        msg['From'] = self.email_sender
        msg['To'] = self.email_sender
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(self.email_sender, self.email_password)
            server.send_message(msg)
            server.quit()
            self.logger.info(f"Low stock notification sent for {product['name']}")
        except Exception as e:
            self.logger.error(f"Failed to send notification: {str(e)}")

# Initialize the IMS
ims = InventoryManagementSystem()

# Routes
@application.route('/health')
def health_check():
    """Health check endpoint for AWS"""
    return {'status': 'healthy'}, 200

@application.route('/api/products', methods=['GET'])
def get_products():
    """Get all products endpoint"""
    products = ims.get_all_products()
    return jsonify(products)

@application.route('/api/products', methods=['POST'])
def add_product():
    """Add new product endpoint"""
    data = request.json
    ims.add_product(data['name'], data['quantity'], data['price'])
    return jsonify({"message": "Product added successfully"})

@application.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get specific product endpoint"""
    product = ims.get_product_info(product_id)
    if product:
        return jsonify(product)
    return {'error': 'Product not found'}, 404

@application.route('/api/products/<int:product_id>/stock', methods=['PUT'])
def update_stock(product_id):
    """Update stock endpoint"""
    data = request.json
    ims.update_stock(product_id, data['quantity'])
    return jsonify({"message": "Stock updated successfully"})

@application.route('/api/predictions/<int:product_id>', methods=['GET'])
def get_predictions(product_id):
    """Get stock predictions endpoint"""
    predictions = ims.predict_stock_level(product_id)
    return jsonify(predictions)

# Run the application
if __name__ == '__main__':
    application.run(host='0.0.0.0', port=5000) 