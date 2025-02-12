import unittest
import sys
import os
import sqlite3
from datetime import datetime
import numpy as np

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import InventoryManagementSystem

class TestInventoryManagementSystem(unittest.TestCase):
    def setUp(self):
        """Set up test database"""
        self.ims = InventoryManagementSystem()
        # Use test database
        self.ims.conn = sqlite3.connect(':memory:')
        self.ims.cursor = self.ims.conn.cursor()
        self.ims.setup_database()
        
    def test_add_product(self):
        """Test adding a new product"""
        self.ims.add_product("Test Product", 100, 19.99)
        product = self.ims.get_product_info(1)
        
        self.assertIsNotNone(product)
        self.assertEqual(product['name'], "Test Product")
        self.assertEqual(product['quantity'], 100)
        self.assertEqual(product['price'], 19.99)
        
    def test_update_stock(self):
        """Test updating stock levels"""
        # Add a product first
        self.ims.add_product("Test Product", 100, 19.99)
        
        # Update stock
        self.ims.update_stock(1, 50)
        product = self.ims.get_product_info(1)
        
        self.assertEqual(product['quantity'], 50)
        
    def test_low_stock_threshold(self):
        """Test low stock detection"""
        self.ims.add_product("Test Product", 100, 19.99)
        
        # Update stock to below threshold
        self.ims.update_stock(1, self.ims.threshold - 1)
        product = self.ims.get_product_info(1)
        
        self.assertTrue(product['quantity'] <= self.ims.threshold)
        
    def test_stock_prediction(self):
        """Test stock prediction functionality"""
        # Add a product
        self.ims.add_product("Test Product", 100, 19.99)
        product_id = 1
        
        # Generate synthetic historical data
        for i in range(50):
            quantity = 100 - i
            self.ims.record_stock_change(product_id, quantity)
            
        # Test prediction
        predictions = self.ims.predict_stock_level(product_id)
        
        self.assertIsNotNone(predictions)
        self.assertEqual(len(predictions), 7)  # 7 days prediction
        self.assertTrue(all(isinstance(x, (int, float)) for x in predictions))

    def tearDown(self):
        """Clean up after tests"""
        self.ims.conn.close()

if __name__ == '__main__':
    unittest.main() 