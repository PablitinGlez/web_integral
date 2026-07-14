from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from uuid import UUID
from decimal import Decimal, InvalidOperation
import json
from ..database import get_db
from ..models import product as product_model
from ..models import brand as brand_model
from ..models import product_variants as variants_model
from ..schemas import product as product_schema
from ..services.cloudinary_service import CloudinaryService
from ..services.auth_service import AuthService

VALID_GENDERS = {"Hombre", "Mujer", "Niño", "Unisex"}

router = APIRouter(prefix="/products", tags=["products"], redirect_slashes=False)

@router.get("/", response_model=List[product_schema.Product])
def get_products(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    gender: Optional[str] = None,
    brand_id: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(product_model.Product)

    if category_id:
        query = query.filter(product_model.Product.category_id == category_id)
    if min_price is not None:
        query = query.filter(product_model.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(product_model.Product.price <= max_price)
    if gender:
        query = query.filter(product_model.Product.gender == gender)
    if brand_id:
        query = query.filter(product_model.Product.brand_id == brand_id)
    if is_active is not None:
        query = query.filter(product_model.Product.is_active == is_active)
    if search:
        search_filter = f"%{search}%"
        query = query.join(brand_model.Brand, product_model.Product.brand_id == brand_model.Brand.id, isouter=True).filter(
            (product_model.Product.name.ilike(search_filter)) |
            (product_model.Product.description.ilike(search_filter)) |
            (brand_model.Brand.name.ilike(search_filter))
        )

    products = query.offset(skip).limit(limit).all()
    return products

@router.get("/{product_id}", response_model=product_schema.Product)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(product_model.Product).filter(product_model.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product

@router.post("/", response_model=product_schema.Product)
async def create_product(
    name: str = Form(default="Tenis Air Max 90", description="Nombre del producto"),
    brand: str = Form(default="9781f2dc-00bf-4245-baca-a9e3e6f0e889", description="Nombre o UUID de la marca"),
    description: str = Form(default="Tenis deportivos cómodos para uso diario", description="Descripción del producto"),
    price: float = Form(default=999.99, description="Precio de venta"),
    base_price: float = Form(default=750.00, description="Precio base / costo"),
    category_id: Optional[str] = Form(default="4092116e-bb10-41a7-8c63-fd95d281783a", description="UUID de la categoría (opcional)"),
    sizes: Optional[str] = Form(
        default='[{"size": 25, "stock_quantity": 10}, {"size": 26, "stock_quantity": 5}, {"size": 27, "stock_quantity": 8}]',
        description='Tallas en formato JSON: [{"size": 25, "stock_quantity": 10}]'
    ),
    gender: Optional[str] = Form(default="Unisex", description="Género: Hombre, Mujer, Niño, Unisex"),
    colors: Optional[str] = Form(default="Negro, Blanco", description="Colores disponibles"),
    sku: Optional[str] = Form(default=None, description="Código SKU único (Opcional. Si pones uno, debe ser único)"),
    is_active: bool = Form(default=True, description="¿Producto activo?"),
    files: List[UploadFile] = File(..., description="Imágenes del producto (mínimo 1)"),
    db: Session = Depends(get_db),
    token: dict = Depends(AuthService.verify_supabase_token)
):
    if not files:
        raise HTTPException(status_code=400, detail="Se requiere al menos una imagen")

    # Validar género, si se envió
    if gender and gender not in VALID_GENDERS:
        raise HTTPException(status_code=400, detail=f"Género inválido. Usa uno de: {', '.join(VALID_GENDERS)}")

    # Validar y parsear las tallas disponibles (JSON: [{"size": 38, "stock_quantity": 10}, ...])
    parsed_sizes = []
    if sizes:
        try:
            raw_sizes = json.loads(sizes)
        except (TypeError, ValueError):
            raise HTTPException(status_code=400, detail="El formato de las tallas es inválido")

        if not isinstance(raw_sizes, list):
            raise HTTPException(status_code=400, detail="El formato de las tallas es inválido")

        for item in raw_sizes:
            try:
                size_value = Decimal(str(item.get("size")))
                stock_value = int(item.get("stock_quantity", 0))
            except (InvalidOperation, TypeError, ValueError, AttributeError):
                raise HTTPException(status_code=400, detail="Cada talla debe incluir 'size' y 'stock_quantity' válidos")

            if stock_value < 0:
                raise HTTPException(status_code=400, detail="El stock no puede ser negativo")

            parsed_sizes.append({"size": size_value, "stock_quantity": stock_value})

    # 1. Subir todas las imágenes a Cloudinary y recolectar las URLs
    uploaded_urls = []
    for file in files:
        image_url = CloudinaryService.upload_image(file.file)
        if not image_url:
            raise HTTPException(status_code=500, detail=f"Error al subir la imagen {file.filename}")
        uploaded_urls.append(image_url)

    # El main_image_url es la primera imagen
    main_image_url = uploaded_urls[0]

    # Resolver brand_id
    brand_id = None
    if brand and brand != "string":
        # Verificar si brand es un UUID válido
        is_uuid = False
        try:
            UUID(brand)
            is_uuid = True
        except ValueError:
            is_uuid = False

        if is_uuid:
            db_brand = db.query(brand_model.Brand).filter(brand_model.Brand.id == brand).first()
        else:
            db_brand = db.query(brand_model.Brand).filter(brand_model.Brand.name == brand).first()
        
        if db_brand:
            brand_id = db_brand.id

    # Resolver category_id
    valid_category_id = None
    if category_id and category_id != "string":
        try:
            UUID(category_id)
            valid_category_id = category_id
        except ValueError:
            raise HTTPException(status_code=400, detail="El category_id proporcionado no es un UUID válido")

    # 2. Crear producto en DB
    new_product = product_model.Product(
        name=name,
        brand_id=brand_id,
        description=description,
        price=price,
        base_price=base_price,
        category_id=valid_category_id,
        main_image_url=main_image_url,
        gender=gender,
        colors=colors,
        sku=sku if sku and sku != "string" else None,
        is_active=is_active
    )

    db.add(new_product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="El SKU ingresado ya está en uso por otro producto")
    db.refresh(new_product)

    # 3. Registrar el listado completo de imágenes en la tabla product_images
    from ..models.product_variants import ProductImage
    for index, url in enumerate(uploaded_urls):
        db_img = ProductImage(
            product_id=new_product.id,
            image_url=url,
            display_order=index
        )
        db.add(db_img)

    # 4. Registrar las tallas disponibles (inventario) del producto, si se enviaron
    for size_item in parsed_sizes:
        db_inv = variants_model.Inventory(
            product_id=new_product.id,
            size=size_item["size"],
            stock_quantity=size_item["stock_quantity"]
        )
        db.add(db_inv)

    db.commit()
    db.refresh(new_product)
    
    return new_product

@router.delete("/{product_id}")
def delete_product(product_id: str, db: Session = Depends(get_db), token: dict = Depends(AuthService.verify_supabase_token)):
    # Validar que el ID sea un UUID válido
    try:
        UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="El ID del producto no es un UUID válido")

    product = db.query(product_model.Product).filter(product_model.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    try:
        db.delete(product)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar el producto porque está asociado a pedidos, inventario u otros registros."
        )
    return {"message": "Producto eliminado exitosamente"}


@router.patch("/{product_id}", response_model=product_schema.Product)
def patch_product(product_id: str, product_update: product_schema.ProductUpdate, db: Session = Depends(get_db), token: dict = Depends(AuthService.verify_supabase_token)):
    # Validar que el ID sea un UUID válido
    try:
        UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="El ID del producto no es un UUID válido")

    db_product = db.query(product_model.Product).filter(product_model.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    update_data = product_update.model_dump(exclude_unset=True) if hasattr(product_update, "model_dump") else product_update.dict(exclude_unset=True)

    # Validar que el brand_id existe si se actualiza
    if "brand_id" in update_data and update_data["brand_id"] is not None:
        db_brand = db.query(brand_model.Brand).filter(brand_model.Brand.id == update_data["brand_id"]).first()
        if not db_brand:
            raise HTTPException(status_code=400, detail="La marca (brand_id) especificada no existe")

    # Validar que el category_id existe si se actualiza
    if "category_id" in update_data and update_data["category_id"] is not None:
        from ..models.category import Category
        db_category = db.query(Category).filter(Category.id == update_data["category_id"]).first()
        if not db_category:
            raise HTTPException(status_code=400, detail="La categoría (category_id) especificada no existe")

    # Validar género si se actualiza
    if "gender" in update_data and update_data["gender"] not in VALID_GENDERS:
        raise HTTPException(status_code=400, detail=f"Género inválido. Usa uno de: {', '.join(VALID_GENDERS)}")

    for key, value in update_data.items():
        setattr(db_product, key, value)

    try:
        db.commit()
        db.refresh(db_product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="El SKU ingresado ya está en uso por otro producto")

    return db_product