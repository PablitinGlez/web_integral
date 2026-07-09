from sqlalchemy import create_engine, text
from app.core.config import settings

def fix_db():
    print("Connecting to database...")
    engine = create_engine(settings.DATABASE_URL)
    
    queries = [
        # 1. Alter orders
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;",
        
        # 2. Alter order_items
        "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id);",
        "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size NUMERIC(3,1);",
        "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10,2);",
        
        # 3. Make old columns nullable
        "ALTER TABLE order_items ALTER COLUMN inventory_id DROP NOT NULL;",
        "ALTER TABLE order_items ALTER COLUMN price_at_time DROP NOT NULL;"
    ]
    
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            for q in queries:
                print(f"Running query: {q}")
                conn.execute(text(q))
            trans.commit()
            print("Successfully altered database schema to match SQLAlchemy models!")
        except Exception as e:
            trans.rollback()
            print(f"Error during migration: {e}")

if __name__ == "__main__":
    fix_db()
