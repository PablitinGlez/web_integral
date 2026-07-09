import sys
from app.database import SessionLocal
from app.models.product import Product
from app.models.product_variants import Inventory

def populate():
    db = SessionLocal()
    try:
        products = db.query(Product).all()
        sizes = [7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0]
        
        for prod in products:
            print(f"Checking product: {prod.name}")
            # Get existing inventory sizes for this product
            existing_sizes = {float(inv.size) for inv in prod.inventory}
            
            for size in sizes:
                if size not in existing_sizes:
                    new_inv = Inventory(
                        product_id=prod.id,
                        size=size,
                        stock_quantity=50
                    )
                    db.add(new_inv)
                    print(f"  Added size {size} to product {prod.name}")
        db.commit()
        print("Success! Inventory populated.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    populate()
