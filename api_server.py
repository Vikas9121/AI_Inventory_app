from flask import Flask, jsonify, request
from flask_cors import CORS
from app import InventoryManagementSystem

app = Flask(__name__)
CORS(app)

ims = InventoryManagementSystem()

@app.route('/api/products', methods=['GET'])
def get_products():
    products = []
    # Implement getting all products
    return jsonify(products)

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.json
    ims.add_product(data['name'], data['quantity'], data['price'])
    return jsonify({"message": "Product added successfully"})

@app.route('/api/products/<int:product_id>/stock', methods=['PUT'])
def update_stock(product_id):
    data = request.json
    ims.update_stock(product_id, data['quantity'])
    return jsonify({"message": "Stock updated successfully"})

@app.route('/api/predictions/<int:product_id>', methods=['GET'])
def get_predictions(product_id):
    predictions = ims.predict_stock_level(product_id)
    return jsonify(predictions)

if __name__ == '__main__':
    app.run(debug=True) 