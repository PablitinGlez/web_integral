from decimal import Decimal

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.brand import Brand
from app.models.category import Category
from app.models.product import Product
from app.models.product_variants import Inventory
from app.api.coupons import calculate_discounted_total
from app.api.metrics import get_metrics_summary_data


def test_calculate_discounted_total_applies_percentage_discount():
    subtotal = Decimal("100.00")
    discount = {"discount_type": "percentage", "value": Decimal("10")}

    result = calculate_discounted_total(subtotal, discount)

    assert result["discount_amount"] == Decimal("10.00")
    assert result["final_total"] == Decimal("90.00")


def test_metrics_summary_data_includes_counts():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        db.add(Category(name="Deportivas", is_active=True))
        db.add(Category(name="Formales", is_active=False))
        db.add(Brand(name="Nike", is_active=True))
        db.add(Brand(name="Adidas", is_active=False))

        product_one = Product(name="Tennis", price=Decimal("100"), base_price=Decimal("120"), category_id=None, brand_id=None, is_active=True)
        product_two = Product(name="Zapato", price=Decimal("50"), base_price=Decimal("50"), category_id=None, brand_id=None, is_active=False)
        db.add(product_one)
        db.add(product_two)
        db.flush()

        db.add(Inventory(product_id=product_one.id, size=Decimal("39"), stock_quantity=5))
        db.add(Inventory(product_id=product_one.id, size=Decimal("40"), stock_quantity=0))
        db.add(Inventory(product_id=product_two.id, size=Decimal("41"), stock_quantity=2))
        db.commit()

        summary = get_metrics_summary_data(db)
    finally:
        db.close()

    assert summary["total_products"] == 2
    assert summary["total_categories"] == 1
    assert summary["total_brands"] == 1
    assert summary["available_products"] == 1
    assert summary["active_products"] == 1
