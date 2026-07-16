# Justificación del Stack Tecnológico — El Zapatito

Este documento detalla y justifica cada tecnología, lenguaje, librería, gestor de base de datos, API y servicio externo utilizado durante el desarrollo del proyecto "El Zapatito", una tienda de calzado en línea con panel de administración integrado.

---

## 1. Lenguajes de Programación

### TypeScript (Frontend)
TypeScript es el lenguaje principal del frontend. Al ser un superset de JavaScript, añade tipado estático que permite detectar errores en tiempo de desarrollo antes de que lleguen a producción. Fue elegido porque Angular lo adopta de forma nativa, mejora el autocompletado en el editor de código y facilita el trabajo en equipo al documentar implícitamente las estructuras de datos.

### Python 3.13 (Backend)
Python fue seleccionado como lenguaje del servidor por su legibilidad, su velocidad de desarrollo y el robusto ecosistema de librerías para APIs web. FastAPI, el framework elegido, aprovecha al máximo las anotaciones de tipo de Python moderno para generar validaciones y documentación automática sin código adicional.

### SQL (Base de Datos)
El lenguaje de consultas estructuradas (SQL) fue utilizado para la definición del esquema relacional, consultas complejas y migraciones de datos en PostgreSQL a través de Supabase.

---

## 2. Frameworks Utilizados

### Angular 21 (Frontend)
Angular fue seleccionado como framework de frontend por las siguientes razones:

- **Arquitectura robusta:** Su estructura modular y basada en componentes permite organizar el código de forma clara y escalable, separando responsabilidades entre vistas, servicios y rutas.
- **Tipado estático con TypeScript:** Reduce errores en tiempo de desarrollo y mejora el mantenimiento del código a largo plazo.
- **Sistema de routing integrado:** Soporta lazy loading de componentes, mejorando el tiempo de carga inicial al dividir el bundle por rutas.
- **Standalone Components:** La versión 21 elimina la necesidad de NgModules, simplificando la estructura de la aplicación y alineándola con estándares modernos.
- **HttpClient nativo:** Facilita la comunicación con la API REST sin dependencias externas.
- **Angular Signals:** Sistema de reactividad de nueva generación que permite un manejo de estado eficiente (usado en el carrito de compras y catálogo).

### FastAPI (Backend)
FastAPI fue seleccionado como framework para la API REST por los siguientes motivos:

- **Alto rendimiento:** Basado en ASGI (Uvicorn), es uno de los frameworks Python más rápidos, comparable a Node.js y Go en benchmarks.
- **Tipado automático con Pydantic:** La validación de datos de entrada y salida se define mediante modelos Python con anotaciones de tipo.
- **Documentación automática:** Genera una interfaz Swagger/OpenAPI en `/docs` de forma automática, facilitando las pruebas y la integración con el equipo.
- **Integración con SQLAlchemy:** Permite el uso de un ORM maduro para gestionar la base de datos relacional (PostgreSQL en Supabase).
- **Soporte asíncrono nativo:** Permite definir endpoints `async`, fundamental para operaciones de I/O como subida de imágenes a Cloudinary.

---

## 3. Librerías y Dependencias Principales

### Frontend (Angular / Node.js)
| Librería | Versión | Uso dentro del proyecto |
| :--- | :--- | :--- |
| `@angular/core` | 21.x | Framework base, componentes, directivas, servicios |
| `@angular/router` | 21.x | Sistema de rutas y navegación entre vistas |
| `@angular/common/http` | 21.x | Módulo HTTP para consumir la API REST del backend |
| `@supabase/supabase-js` | 2.x | Cliente de Supabase para autenticación desde el frontend |
| `rxjs` | 7.x | Manejo de operaciones asíncronas, observables y flujos de datos |
| `@paypal/paypal-js` | Latest | SDK oficial del botón inteligente de pagos con PayPal |

### Backend (Python)
| Librería | Versión | Uso dentro del proyecto |
| :--- | :--- | :--- |
| `fastapi` | 0.139.x | Framework principal del servidor de API REST |
| `uvicorn` | 0.51.x | Servidor ASGI para ejecutar la aplicación FastAPI |
| `sqlalchemy` | 2.0.x | ORM para definir modelos relacionales y realizar consultas a PostgreSQL |
| `psycopg2-binary` | 2.9.x | Driver de conexión entre SQLAlchemy y la base de datos PostgreSQL |
| `pydantic` | 2.x | Validación y serialización de datos de entrada/salida de la API |
| `pydantic-settings` | 2.x | Gestión tipada de variables de entorno desde el archivo `.env` |
| `python-dotenv` | 1.x | Carga de variables de entorno desde archivos `.env` en desarrollo local |
| `python-jose[cryptography]` | 3.x | Generación y verificación de tokens JWT para autenticación |
| `passlib[bcrypt]` | 1.7.x | Encriptación segura de contraseñas de usuarios con bcrypt |
| `cloudinary` | 1.45.x | SDK oficial de Cloudinary para subir y gestionar imágenes de calzado |
| `python-multipart` | 0.0.x | Soporte para recibir archivos e imágenes en endpoints de la API |
| `email-validator` | 2.x | Validación de formato de correos electrónicos en los esquemas Pydantic |

---

## 4. Gestor de Base de Datos

### PostgreSQL en Supabase
El sistema gestor de base de datos relacional (RDBMS) utilizado es **PostgreSQL**, alojado y administrado a través de la plataforma **Supabase**.

**Justificación de PostgreSQL:**
- Es el RDBMS de código abierto más avanzado y completo disponible, con soporte para tipos de datos complejos, transacciones ACID y alta concurrencia.
- Supabase proporciona una instancia PostgreSQL completamente gestionada en la nube, eliminando la necesidad de configurar y mantener un servidor de base de datos propio.

**Estructura relacional del proyecto:**

| Tabla | Descripción |
| :--- | :--- |
| `categories` | Categorías de calzado (Deportivo, Casual, Formal, etc.) |
| `brands` | Marcas registradas (Nike, Adidas, Vans, etc.) |
| `products` | Catálogo principal de artículos de calzado |
| `inventory` | Registro de stock físico separado por talla por producto |
| `product_images` | Galería de imágenes extra asociadas a cada producto |
| `users` | Información de usuarios autenticados gestionada por Supabase Auth |
| `addresses` | Direcciones físicas de envío registradas por cada usuario |
| `orders` | Historial de órdenes de compra con su estatus y folio de PayPal |
| `order_items` | Detalle de productos y tallas incluidos en cada orden |
| `coupons` | Códigos de descuento promocionales con reglas de vigencia |

---

## 5. APIs Utilizadas

### API REST Propia (FastAPI — El Zapatito Backend)
La API central del proyecto fue desarrollada desde cero usando FastAPI. Expone los siguientes grupos de endpoints organizados por routers:

| Prefijo de Ruta | Descripción |
| :--- | :--- |
| `/products` | Listado, filtrado, creación, edición y baja de productos |
| `/categories` | CRUD completo de categorías de calzado |
| `/brands` | CRUD completo de marcas de calzado |
| `/inventory` | Consulta y actualización de stock por talla |
| `/auth` | Registro, inicio de sesión y validación de tokens |
| `/addresses` | Gestión de direcciones de envío por usuario |
| `/orders` | Creación y consulta del historial de órdenes |
| `/coupons` | Creación, validación y aplicación de cupones de descuento |
| `/metrics` | Estadísticas del dashboard administrativo |

### PayPal REST API (Sandbox)
La pasarela de pago fue integrada mediante la API oficial de PayPal en modo **Sandbox** (entorno de pruebas). Permite simular transacciones reales sin involucrar dinero real.

- **Endpoints usados:** `POST /v2/checkout/orders` (crear orden) y `POST /v2/checkout/orders/{id}/capture` (capturar pago aprobado).
- El SDK de JavaScript de PayPal renderiza el botón de pago inteligente en el frontend.

### Supabase Auth API
Supabase provee un sistema de autenticación completo con soporte para OAuth, contraseñas y sesiones basadas en JWT. En "El Zapatito" se utiliza para:
- Registro de nuevos usuarios con correo y contraseña.
- Verificación de identidad mediante tokens de sesión que el frontend envía en las cabeceras de las peticiones al backend.

---

## 6. Servicios Externos

### Supabase
- **Tipo:** Backend as a Service (BaaS) / Base de Datos en la nube.
- **Uso:** Alojamiento de la base de datos PostgreSQL del proyecto, autenticación de usuarios y administración visual de tablas.
- **Justificación:** Elimina la necesidad de un servidor de base de datos propio, ofrece panel de administración visual tipo Airtable, autenticación lista para usar, y tier gratuito generoso para proyectos académicos.

### Cloudinary
- **Tipo:** Servicio de gestión de medios digitales (CDN de imágenes).
- **Uso:** Almacenamiento y entrega optimizada de imágenes de los productos de calzado (fotos principales y galería).
- **Justificación:** Proporciona transformación automática de imágenes (redimensionado, compresión, formato WebP) y entrega mediante CDN global, mejorando la velocidad de carga de las imágenes en la tienda.

### Render
- **Tipo:** Plataforma de despliegue de aplicaciones en la nube (PaaS).
- **Uso:** Hospedaje del Backend (API REST de FastAPI/Uvicorn) en producción.
- **Justificación:** Permite desplegar aplicaciones Python directamente desde GitHub con detección automática del framework, variables de entorno seguras y tier gratuito funcional.
- **URL de producción del backend:** `https://web-integral.onrender.com`

### Vercel
- **Tipo:** Plataforma de despliegue de aplicaciones frontend (PaaS).
- **Uso:** Hospedaje del Frontend (aplicación Angular) en producción.
- **Justificación:** Especializado en aplicaciones frontend y frameworks JavaScript. Integra con GitHub para despliegues automáticos en cada push, maneja rutas SPA automáticamente y ofrece CDN global para una entrega ultrarrápida de archivos estáticos.
- **URL de producción del frontend:** `https://web-integral-wheat.vercel.app`

### PayPal Developer Sandbox
- **Tipo:** Entorno de pruebas de pasarela de pago.
- **Uso:** Simulación de transacciones financieras sin dinero real durante el desarrollo y demostración del proyecto.
- **Justificación:** Permite demostrar un flujo de pago completo y realista sin requerir credenciales bancarias reales, con cuentas de prueba de comprador y vendedor proporcionadas por PayPal.

### Unsplash (API pública de imágenes)
- **Tipo:** Repositorio público de imágenes de alta calidad.
- **Uso:** URLs de imágenes de calzado utilizadas en el script `seed.py` para poblar los productos de prueba con fotografías de alta resolución.
- **Justificación:** Ofrece imágenes libres de derechos y de alta calidad para representar visualmente el catálogo de zapatos durante el desarrollo y demostración del proyecto.
