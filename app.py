from datetime import datetime
import sqlite3
from typing import Dict
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class InventoryManagementSystem:
    def __init__(self):
        self.conn = sqlite3.connect('inventory.db')
        self.cursor = self.conn.cursor()
        self.setup_database()
        
        # Configure notification settings
        self.threshold = 10  # Minimum stock threshold for notifications
        self.email_sender = "your-email@example.com"
        self.email_password = "your-app-password"  # Use app-specific password for security
        
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
        
        # Check if stock is low and send notification
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
        msg['To'] = self.email_sender  # Send to yourself or specific staff email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(self.email_sender, self.email_password)
            server.send_message(msg)
            server.quit()
            print(f"Low stock notification sent for {product['name']}")
        except Exception as e:
            print(f"Failed to send notification: {str(e)}")

# Example usage
if __name__ == "__main__":
    # Initialize the system
    ims = InventoryManagementSystem()
    
    # Add some sample products
    ims.add_product("Laptop", 20, 999.99)
    ims.add_product("Mouse", 50, 29.99)
    
    # Update stock (this will trigger notification if quantity <= threshold)
    ims.update_stock(1, 8)  # This should trigger a low stock notification for Laptop
