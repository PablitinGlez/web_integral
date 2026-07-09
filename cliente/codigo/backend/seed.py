import uuid
import random
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.base import Base

# Importar todos los modelos para poder usarlos en el seed
from app.models.category import Category
from app.models.brand import Brand
from app.models.product import Product
from app.models.product_variants import Inventory, ProductImage

# URLs de imágenes reales de tenis/calzado de alta calidad en Unsplash
SHOE_IMAGES = [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80", # Nike Rojo
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80", # Tenis colorido de mujer
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80", # Vans Amarillo
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=80", # Nike Verde
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80", # Puma Blanco
    "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600&auto=format&fit=crop&q=80", # Converse Rojo
    "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80", # New Balance Naranja
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&auto=format&fit=crop&q=80", # Nike Negro Deportivo
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80", # Casual de piel marrón
    "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=600&auto=format&fit=crop&q=80", # Tenis blanco minimalista
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80", # Calzado escolar/casual
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80", # Bota de montaña/Outdoor
    "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&auto=format&fit=crop&q=80", # Zapato elegante formal negro
    "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&auto=format&fit=crop&q=80", # Sandalias de cuero
    "https://images.unsplash.com/photo-1562183241-b937e95585b6?w=600&auto=format&fit=crop&q=80"  # Calzado deportivo azul
]

# Datos para categorías
CATEGORIES_DATA = [
    {"name": "Deportivos", "description": "Tenis para correr, entrenar y hacer ejercicio."},
    {"name": "Casual", "description": "Calzado cómodo para el uso diario."},
    {"name": "Botas", "description": "Botas de trabajo, de vestir y para clima frío."},
    {"name": "Sandalias", "description": "Calzado fresco para la playa o el hogar."},
    {"name": "Formal", "description": "Zapatos de vestir y elegantes para eventos formales."},
    {"name": "Skate", "description": "Tenis con suela plana ideales para patinar."},
    {"name": "Outdoor", "description": "Calzado resistente para senderismo y campo."},
    {"name": "Plataformas", "description": "Zapatos y tenis con suela alta de moda."},
    {"name": "Escolar", "description": "Zapatos y tenis reglamentarios para estudiantes."},
    {"name": "Pantuflas", "description": "Calzado ultra cómodo para descansar en casa."}
]

# Datos para marcas
BRANDS_DATA = [
    {"name": "Nike", "description": "Just do it."},
    {"name": "Adidas", "description": "Impossible is nothing."},
    {"name": "Puma", "description": "Forever faster."},
    {"name": "Reebok", "description": "Be more human."},
    {"name": "Vans", "description": "Off the wall."},
    {"name": "Converse", "description": "Choose your path."},
    {"name": "New Balance", "description": "Fearlessly independent."},
    {"name": "Under Armour", "description": "Protect this house."},
    {"name": "Asics", "description": "Anima Sana In Corpore Sano."},
    {"name": "Skechers", "description": "Comfort Included."},
    {"name": "Jordan", "description": "Jumpman."},
    {"name": "Timberland", "description": "Best for outdoor activities."},
    {"name": "Crocs", "description": "Classic comfort."},
    {"name": "Birkenstock", "description": "Tradition since 1774."},
    {"name": "Dr. Martens", "description": "With bouncing soles."},
    {"name": "Fila", "description": "Power and style."},
    {"name": "Balenciaga", "description": "High fashion luxury."},
    {"name": "Gucci", "description": "Italian luxury fashion."},
    {"name": "Prada", "description": "Sophisticated styling."}
]

GENDERS = ["Hombre", "Mujer", "Niño", "Unisex"]
COLORS = ["Negro", "Blanco", "Rojo", "Azul", "Gris", "Café", "Amarillo", "Multicolor", "Verde", "Rosa"]
SHOE_NAMES = [
    "Air Force Extreme", "Superstar Premium", "Classic Running Pro", "Urban Walk", "Mountain Trail Max",
    "Sport Evolution", "Soft Slide", "Elegance Derby", "Skate Legend", "Platform Cloud",
    "Winter Shield Boot", "Daily Comfort Lite", "Speed Blazer", "Vibe Low", "Retro High",
    "Flex Trainer", "Future Step", "City Canvas", "Leather Oxford", "Aqua Sport"
]

def seed_database():
    db: Session = SessionLocal()
    print("Iniciando semillero de datos...")

    # Limpiar tablas para evitar duplicados y conflictos de llaves foráneas
    print("Limpiando datos existentes...")
    
    # Importar order_item y order para poder borrarlos si existen referencias
    try:
        from app.models.order import OrderItem, Order
        db.query(OrderItem).delete()
        db.query(Order).delete()
    except Exception as e:
        print(f"Nota: No se pudo limpiar la tabla de órdenes (puede que no esté migrada): {e}")

    db.query(Inventory).delete()
    db.query(ProductImage).delete()
    db.query(Product).delete()
    db.query(Brand).delete()
    db.query(Category).delete()
    db.commit()

    print("Tablas limpiadas exitosamente.")

    # 1. Crear Categorías
    created_categories = []
    for cat_info in CATEGORIES_DATA:
        cat = Category(
            id=uuid.uuid4(),
            name=cat_info["name"],
            description=cat_info["description"],
            is_active=True
        )
        db.add(cat)
        created_categories.append(cat)
    print(f"Creadas {len(created_categories)} categorías.")

    # 2. Crear Marcas
    created_brands = []
    for brand_info in BRANDS_DATA:
        brand = Brand(
            id=uuid.uuid4(),
            name=brand_info["name"],
            description=brand_info["description"],
            is_active=True
        )
        db.add(brand)
        created_brands.append(brand)
    print(f"Creadas {len(created_brands)} marcas.")

    db.commit()

    # 3. Crear 50 Productos
    print("Creando 50 productos de prueba...")
    for i in range(1, 51):
        category = random.choice(created_categories)
        brand = random.choice(created_brands)
        gender = random.choice(GENDERS)
        
        # Combinar marca y nombre base para crear un nombre único
        base_name = random.choice(SHOE_NAMES)
        product_name = f"{brand.name} {base_name} V{i}"
        
        # Precios coherentes
        price = round(random.uniform(599.00, 3499.00), 2)
        base_price = round(price * random.uniform(0.6, 0.8), 2)
        
        # Imágenes del calzado
        main_img = random.choice(SHOE_IMAGES)
        # Seleccionar 2 imágenes extras
        extra_imgs = random.sample(SHOE_IMAGES, 2)
        
        sku = f"ZAP-{brand.name[:3].upper()}-{category.name[:3].upper()}-{1000 + i}"
        
        product = Product(
            id=uuid.uuid4(),
            name=product_name,
            brand_id=brand.id,
            description=f"Excelente calzado de tipo {category.name.lower()} ideal para {gender.lower()}. Cuenta con materiales de alta calidad y un diseño sumamente innovador.",
            price=price,
            base_price=base_price,
            category_id=category.id,
            main_image_url=main_img,
            gender=gender,
            colors=", ".join(random.sample(COLORS, random.randint(1, 3))),
            sku=sku,
            is_active=True
        )
        db.add(product)
        db.flush() # Para obtener el ID del producto y poder usarlo en las relaciones

        # Relacionar imágenes extras
        all_imgs = [main_img] + extra_imgs
        for idx, img_url in enumerate(all_imgs):
            img_relation = ProductImage(
                id=uuid.uuid4(),
                product_id=product.id,
                image_url=img_url,
                display_order=idx
            )
            db.add(img_relation)

        # Relacionar inventario/tallas
        # Tallas de calzado comunes (ej: 24, 25, 26, 27, 28)
        sizes_to_create = random.sample([23.0, 24.0, 25.0, 26.0, 27.0, 28.0, 29.0], random.randint(3, 5))
        for size in sizes_to_create:
            inv = Inventory(
                id=uuid.uuid4(),
                product_id=product.id,
                size=size,
                stock_quantity=random.randint(5, 50)
            )
            db.add(inv)

    db.commit()
    print("Base de datos sembrada con exito!")
    print("- 10 Categorias creadas")
    print("- 19 Marcas creadas")
    print("- 50 Productos de prueba creados (con imagenes, tallas y stock)")

if __name__ == "__main__":
    seed_database()
