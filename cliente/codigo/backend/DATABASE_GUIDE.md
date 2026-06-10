# Guía de Base de Datos - El Zapatito

Este documento detalla la estructura de la base de datos alojada en Supabase y los cambios realizados durante su diseño.

## Estructura de Tablas

### 1. `categories`
- Almacena las categorías de calzado (Deportivas, Formales, etc.).

### 2. `products`
- Datos generales del zapato.
- `main_image_url`: Imagen principal optimizada para el catálogo (URL de Cloudinary).

### 3. `product_images`
- Imágenes adicionales para la galería de cada producto.

### 4. `inventory`
- Stock dividido por tallas (`size`). Una entrada por cada talla del zapato.

### 5. `discounts` y `product_discounts`
- Sistema de ofertas (por porcentaje o monto fijo) asociadas a productos.

### 6. `orders` y `order_items`
- Seguimiento de ventas y métricas.

### 7. `users`
- Gestión de usuarios y administradores con roles.

## Historial de Cambios

1.  **Esquema Inicial**: Creación de tablas básicas de productos, inventario y ventas.
2.  **Soporte Multi-imagen**: Se añadió la tabla `product_images` y se renombró `image_url` a `main_image_url` en `products`.
3.  **Seguridad y Auth**: Incorporación de la tabla `users` para manejar el acceso al Panel Administrativo.
4.  **Integración con Cloudinary**: Uso de Cloudinary para almacenamiento externo de imágenes.
