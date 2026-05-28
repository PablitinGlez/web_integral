Justificación del Stack Tecnológico — El Zapatito

1\. Selección de Tecnologías

Frontend: Angular 21

Angular fue seleccionado como framework de frontend por las siguientes razones:



Arquitectura robusta: Su estructura modular y basada en componentes permite organizar el código de forma clara y escalable, separando responsabilidades entre vistas, servicios y rutas.

Tipado estático con TypeScript: Reduce errores en tiempo de desarrollo y mejora el mantenimiento del código a largo plazo.

Sistema de routing integrado: Soporta lazy loading de componentes, lo que mejora el tiempo de carga inicial de la aplicación al dividir el bundle por rutas.

Standalone Components: La versión 21 elimina la necesidad de NgModules, simplificando la estructura de la aplicación y alineándola con estándares modernos.

HttpClient nativo: Facilita la comunicación con la API REST sin dependencias externas, integrándose directamente con el sistema de inyección de dependencias del framework.

Backend: FastAPI

FastAPI fue seleccionado como framework para la API REST por los siguientes motivos:



Alto rendimiento: Basado en ASGI (Uvicorn), es uno de los frameworks Python más rápidos disponibles, comparable a Node.js y Go en benchmarks.

Tipado automático con Pydantic: La validación de datos de entrada y salida se define mediante modelos Python con anotaciones de tipo, reduciendo la cantidad de código de validación manual.

Documentación automática: Genera una interfaz Swagger/OpenAPI en /docs de forma automática, facilitando las pruebas y la integración con el equipo.

Integración con SQLAlchemy: Permite el uso de un ORM maduro y ampliamente adoptado para gestionar la base de datos relacional (PostgreSQL en Supabase).

Soporte asíncrono nativo: Permite definir endpoints async, lo cual es fundamental para operaciones de I/O como subida de imágenes a Cloudinary.

