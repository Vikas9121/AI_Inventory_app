import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'inventory.db')

def seed_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Sample products
    products = [
        ('Laptop', 10, 999.99),
        ('Mouse', 20, 29.99),
        ('Keyboard', 15, 59.99),
        ('Monitor', 5, 299.99),
    ]
    
    cursor.executemany('''
        INSERT INTO inventory (name, quantity, price, last_updated)
        VALUES (?, ?, ?, ?)
    ''', [(name, qty, price, datetime.now()) for name, qty, price in products])
    
    conn.commit()
    conn.close()
    print("Database seeded with test data!")

if __name__ == "__main__":
    seed_database() 