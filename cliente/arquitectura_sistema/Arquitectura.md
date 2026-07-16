# Arquitectura del Sistema — El Zapatito

## Tipo de Arquitectura: Por Capas (N-Tier / Layered Architecture)

El sistema "El Zapatito" fue diseñado e implementado siguiendo el patrón de **Arquitectura por Capas (N-Tier)**, también conocido como arquitectura en niveles. Este patrón organiza el sistema en capas horizontales donde cada capa tiene una responsabilidad única y bien definida, y solo se comunica directamente con la capa inmediatamente adyacente.

Esta decisión de diseño garantiza:
- **Separación de responsabilidades:** Cada capa se ocupa únicamente de su función específica.
- **Mantenibilidad:** Un cambio en una capa no afecta directamente a las demás.
- **Escalabilidad:** Cada capa puede escalar de forma independiente.
- **Testabilidad:** Cada capa puede probarse de forma aislada.

---

## Descripción de las 5 Capas del Sistema

### Capa 1: Presentación — Angular (Frontend)
**Responsabilidad:** Es la capa con la que interactúa directamente el usuario final (cliente de la tienda o administrador). Gestiona la interfaz visual, la navegación entre vistas y la presentación de datos recibidos desde la API.

**Tecnología:** Angular 21 con TypeScript.

**Módulos que contiene:**
- **Dashboard:** Vista del panel de control administrativo con KPIs, métricas de ventas y alertas de stock bajo.
- **Login / Auth:** Formularios de inicio de sesión y registro de usuarios.
- **Inventario:** Interfaz para consultar y actualizar el stock físico de cada talla de calzado.
- **Ventas / POS:** Vista del catálogo de tienda y flujo de compra (carrito + checkout con PayPal).
- **Reportes:** Historial de órdenes y estatus de pedidos por usuario.

**Comunicación hacia abajo:** Se comunica con la Capa 2 (API) exclusivamente mediante peticiones **HTTPS / REST** (protocolo HTTP sobre TLS) usando el `HttpClient` de Angular.

---

### Capa 2: API — FastAPI (Backend)
**Responsabilidad:** Actúa como la puerta de entrada al sistema del lado del servidor. Recibe, valida y enruta las peticiones HTTP que llegan desde el frontend. Implementa la seguridad mediante autenticación con JWT.

**Tecnología:** FastAPI con Uvicorn (servidor ASGI).

**Componentes que contiene:**
- **Endpoints REST:** Definen las rutas HTTP disponibles para cada recurso del sistema (`/products`, `/orders`, `/auth`, `/coupons`, etc.). Cada recurso tiene su propio router independiente.
- **Auth Middleware (JWT):** Intercepta las peticiones entrantes para verificar que el token de sesión JWT sea válido antes de permitir el acceso a recursos protegidos. Diferencia entre usuarios normales y administradores.
- **Validación (Pydantic):** Valida automáticamente los datos del cuerpo de las peticiones (request body) contra los esquemas definidos con Pydantic. Si los datos no cumplen el esquema, rechaza la petición con un error 422 antes de que llegue a la lógica de negocio.

**Comunicación hacia abajo:** Delega la lógica de procesamiento a la Capa 3 (Lógica de Negocio).

---

### Capa 3: Lógica de Negocio — Servicios Python
**Responsabilidad:** Contiene las reglas de negocio del sistema. Es la capa que "piensa": decide qué hacer con los datos, aplica las reglas de descuento, valida la disponibilidad de stock, gestiona los flujos de pago y coordina las operaciones entre varios recursos.

**Tecnología:** Python 3.13 (módulos de servicio dentro de la carpeta `app/services/`).

**Servicios principales:**
- **Servicio de Inventario:** Gestiona la lógica de stock físico. Valida que haya existencias suficientes antes de confirmar una orden. Descuenta unidades tras un pago aprobado.
- **Servicio de Ventas:** Coordina la creación de órdenes, la aplicación de cupones de descuento y la integración con la pasarela de PayPal.
- **Servicio de Usuarios:** Gestiona el registro, inicio de sesión, encriptación de contraseñas (bcrypt) y generación de tokens JWT.

**Comunicación hacia abajo:** Solicita datos a la Capa 4 (Acceso a Datos) para leer o escribir en la base de datos.

---

### Capa 4: Acceso a Datos — SQLAlchemy (ORM)
**Responsabilidad:** Abstrae el acceso a la base de datos. En lugar de escribir SQL crudo, los desarrolladores interactúan con objetos Python (modelos) y SQLAlchemy traduce esas operaciones a consultas SQL optimizadas automáticamente.

**Tecnología:** SQLAlchemy 2.0 (ORM) con el driver `psycopg2-binary` para PostgreSQL.

**Componentes que contiene:**
- **ORM (SQLAlchemy):** Define los modelos de la base de datos como clases Python (`Product`, `Order`, `Category`, etc.) y gestiona las sesiones de conexión a la base de datos.
- **Repositorios:** Funciones de acceso a datos que encapsulan las consultas más comunes (obtener producto por ID, listar productos por categoría, registrar una orden nueva, etc.).

**Comunicación hacia abajo:** Envía consultas **SQL** a la Capa 5 (Base de Datos) a través del driver de conexión `psycopg2-binary`.

---

### Capa 5: Base de Datos — PostgreSQL (Supabase)
**Responsabilidad:** Es la capa de persistencia del sistema. Almacena de forma permanente y estructurada todos los datos del negocio: usuarios, productos, inventario, órdenes y cupones.

**Tecnología:** PostgreSQL alojado en Supabase (servicio en la nube).

**Tablas principales del sistema:**
| Tabla | Contenido |
| :--- | :--- |
| `users` | Datos de los usuarios registrados (gestionada por Supabase Auth) |
| `products` | Catálogo completo de artículos de calzado |
| `categories` | Categorías de clasificación del calzado |
| `brands` | Marcas disponibles en la tienda |
| `inventory` | Stock físico desglosado por talla para cada producto |
| `product_images` | URLs de imágenes adicionales de cada producto |
| `addresses` | Direcciones de envío registradas por los usuarios |
| `orders` | Historial de órdenes de compra con folio de PayPal y estatus |
| `order_items` | Detalle línea por línea de los productos dentro de cada orden |
| `coupons` | Códigos de descuento con reglas de vigencia y tipo de descuento |

---

## Flujo de una Petición a través de las Capas

El siguiente ejemplo ilustra cómo fluye una petición de "Agregar producto al carrito y pagar" a través del sistema:

```
[Usuario en Vercel]
       │  Hace clic en "Pagar con PayPal"
       ▼
┌─────────────────────────────────────┐
│  CAPA 1: Angular (Frontend)         │  → Envía POST /orders/ con token JWT
│  Componente: checkout.component.ts  │    en el header Authorization
└─────────────────────────────────────┘
                    │  HTTPS / REST
                    ▼
┌─────────────────────────────────────┐
│  CAPA 2: FastAPI (API)              │  → Verifica el token JWT
│  Router: orders.py                  │  → Valida el schema de la orden (Pydantic)
│  Middleware: JWT Auth               │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│  CAPA 3: Lógica de Negocio          │  → Verifica si hay stock de la talla
│  Servicio de Ventas                 │  → Llama a PayPal para capturar el pago
│  Servicio de Inventario             │  → Aplica el cupón si existe
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│  CAPA 4: Acceso a Datos (SQLAlchemy)│  → Crea el registro en la tabla orders
│  Repositorio de Órdenes             │  → Actualiza el stock en la tabla inventory
└─────────────────────────────────────┘
                    │  SQL
                    ▼
┌─────────────────────────────────────┐
│  CAPA 5: Base de Datos (PostgreSQL) │  → Guarda los datos de forma permanente
│  Supabase                           │
└─────────────────────────────────────┘
```

---

## Ventajas de la Arquitectura por Capas en este Proyecto

| Ventaja | Aplicación en "El Zapatito" |
| :--- | :--- |
| **Independencia tecnológica** | El frontend (Angular) y el backend (FastAPI) son completamente independientes. Se despliegan en plataformas distintas (Vercel y Render) y se comunican solo por HTTP. |
| **Reutilización** | Los servicios de la Capa 3 (lógica de negocio) son reutilizados por múltiples endpoints. Por ejemplo, el servicio de inventario es utilizado tanto al crear una orden como al actualizar el stock desde el panel admin. |
| **Seguridad en capas** | La validación de autenticación (JWT) en la Capa 2 protege el acceso antes de que cualquier petición llegue a la lógica de negocio o a la base de datos. |
| **Despliegue independiente** | El frontend puede actualizarse sin reiniciar el backend, y viceversa. Cada capa escala de forma independiente según la demanda. |
