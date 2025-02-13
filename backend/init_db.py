import sqlite3
import os

def init_database():
    # Get the directory where this script is located
    db_path = os.path.join(os.path.dirname(__file__), 'inventory.db')
    
    # Connect to SQLite database (creates it if it doesn't exist)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create inventory table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventory (
            product_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Commit the changes and close the connection
    conn.commit()
    conn.close()
    
    print(f"Database initialized at {db_path}")

if __name__ == "__main__":
    init_database() 