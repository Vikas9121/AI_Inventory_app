from app import InventoryManagementSystem

def main():
    # Initialize the system
    ims = InventoryManagementSystem()
    
    print("1. Adding test products...")
    ims.add_product("Laptop", 20, 999.99)
    ims.add_product("Mouse", 50, 29.99)
    ims.add_product("Keyboard", 30, 49.99)
    
    print("\n2. Testing stock updates...")
    # Update stock to trigger notifications
    ims.update_stock(1, 8)  # Should trigger low stock alert for Laptop
    
    print("\n3. Getting product info...")
    laptop_info = ims.get_product_info(1)
    print(f"Laptop stock info: {laptop_info}")
    
    print("\n4. Generate some historical data...")
    # Generate some historical data for predictions
    for i in range(50):
        quantity = 20 - i//3  # Simulating declining stock
        ims.record_stock_change(1, quantity)
    
    print("\n5. Testing predictions...")
    predictions = ims.predict_stock_level(1)
    print(f"Stock predictions for next 7 days: {predictions}")

if __name__ == "__main__":
    main() 