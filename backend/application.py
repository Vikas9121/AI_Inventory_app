from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import sqlite3
import os
import logging
import sys

# Ensure log directory exists
log_dir = '/var/log/app'
if not os.path.exists(log_dir):
    os.makedirs(log_dir)
    os.chmod(log_dir, 0o777)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(log_dir, 'application.log')),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

application = Flask(__name__)
CORS(application, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "https://main.d334b39rffilc2.amplifyapp.com",  # Add your Amplify URL
            "https://*.amplifyapp.com"  # Allow all Amplify subdomains
        ],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configure SQLite database with absolute path
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'inventory.db')
logger.info(f"Database path: {DB_PATH}")

def get_db_connection():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        logger.info("Database connection successful")
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        raise

# Initialize database and create table
def init_db():
    # Create data directory if it doesn't exist
    data_dir = os.path.dirname(DB_PATH)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        os.chmod(data_dir, 0o777)  # Give write permissions
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventory (
            product_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

@application.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Inventory Management System API"})

@application.route('/health', methods=['GET'])
def health():
    try:
        # Check if database file exists
        db_exists = os.path.exists(DB_PATH)
        logger.info(f"Database file exists: {db_exists}")
        
        # Test database connection and query
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM inventory')
        count = cursor.fetchone()[0]
        conn.close()
        
        return jsonify({
            "status": "healthy",
            "database": {
                "exists": db_exists,
                "path": DB_PATH,
                "products_count": count
            },
            "environment": os.environ.get('FLASK_ENV', 'not set')
        })
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "database_path": DB_PATH,
            "database_exists": os.path.exists(DB_PATH)
        }), 500

# Log all requests
@application.before_request
def log_request():
    logger.info(f"Request: {request.method} {request.url}")

# Log all responses
@application.after_request
def log_response(response):
    logger.info(f"Response: {response.status}")
    return response

# Error handlers
@application.errorhandler(404)
def not_found_error(error):
    logger.error(f"404 Error: {error}")
    return jsonify({"error": "Resource not found"}), 404

@application.errorhandler(500)
def internal_error(error):
    logger.error(f"500 Error: {error}")
    return jsonify({
        "error": "Internal server error",
        "details": str(error),
        "database_status": {
            "path": DB_PATH,
            "exists": os.path.exists(DB_PATH),
            "writable": os.access(os.path.dirname(DB_PATH), os.W_OK)
        }
    }), 500

@application.route('/products', methods=['GET'])
def get_products():
    print("GET /products endpoint hit")  # Debug log
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM inventory')
        products = cursor.fetchall()
        conn.close()
        
        result = [{
            'product_id': row['product_id'],
            'name': row['name'],
            'quantity': row['quantity'],
            'price': row['price'],
            'last_updated': row['last_updated']
        } for row in products]
        
        print(f"Returning {len(result)} products")  # Debug log
        return jsonify(result)
    except Exception as e:
        print(f"Error in GET /products: {str(e)}")  # Debug log
        return jsonify({'error': str(e)}), 500

@application.route('/products', methods=['POST'])
def add_product():
    data = request.json
    if not all(key in data for key in ['name', 'quantity', 'price']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO inventory (name, quantity, price, last_updated)
        VALUES (?, ?, ?, ?)
    ''', (data['name'], data['quantity'], data['price'], datetime.now()))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Product added successfully'}), 201

@application.route('/products/<int:product_id>/stock', methods=['PUT'])
def update_stock(product_id):
    data = request.json
    if 'quantity' not in data:
        return jsonify({'error': 'Quantity is required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE inventory 
        SET quantity = ?, last_updated = ?
        WHERE product_id = ?
    ''', (data['quantity'], datetime.now(), product_id))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Stock updated successfully'})

@application.route('/ping', methods=['GET'])
def ping():
    try:
        logger.info("Starting health check ping")
        
        # Check directory permissions
        data_dir = os.path.dirname(DB_PATH)
        logger.info(f"Data directory exists: {os.path.exists(data_dir)}")
        logger.info(f"Data directory permissions: {oct(os.stat(data_dir).st_mode)[-3:]}")
        
        # Check database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM inventory')
        count = cursor.fetchone()[0]
        conn.close()
        
        logger.info(f"Database check successful. Products count: {count}")
        return jsonify({
            "status": "healthy",
            "database": {
                "exists": os.path.exists(DB_PATH),
                "path": DB_PATH,
                "products_count": count,
                "permissions": oct(os.stat(DB_PATH).st_mode)[-3:] if os.path.exists(DB_PATH) else None
            }
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "details": {
                "db_exists": os.path.exists(DB_PATH),
                "db_path": DB_PATH,
                "data_dir_exists": os.path.exists(os.path.dirname(DB_PATH)),
                "current_dir": os.getcwd()
            }
        }), 500

if __name__ == '__main__':
    init_db()  # Initialize database on startup
    application.run(port=5000, debug=True)