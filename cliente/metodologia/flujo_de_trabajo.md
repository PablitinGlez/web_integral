# Protocolo de Flujo de Trabajo y Gestión de Versiones

Este documento formaliza la metodología de colaboración técnica del equipo "El Zapatito", con el objetivo de asegurar la integridad del código y la calidad de los entregables durante el ciclo de vida del proyecto.

## 1. Arquitectura de Ramificaciones (Git Flow)

Para permitir el desarrollo paralelo sin interferencias entre los 5 integrantes, se establece la siguiente jerarquía de ramas:

- **Ramas de Desarrollo Individual (`dev-[nombre]`)**: Espacios de trabajo aislados para cada integrante (Pablo, Eliezer, Jhonatan, Jocelyn, Alberto). Se utilizan para la implementación diaria de funcionalidades.
- **Rama de Integración (`desarrollo`)**: Entorno donde se consolidan los desarrollos finalizados para realizar pruebas de integración y validación conjunta.
- **Rama de Producción (`main`)**: Contiene exclusivamente el código estable y aprobado para la entrega final al cliente.

## 2. Ciclo de Vida del Desarrollo e Integración

1. **Implementación Local**: Cada desarrollador realiza sus actividades dentro de su rama asignada, garantizando que sus cambios no afecten la estabilidad global de forma prematura.
2. **Validación Técnica y Estética (Peer Review)**: Una vez concluido un módulo o funcionalidad, se somete a una revisión por pares (Peer Review). El equipo valida:
   - **Consistencia Visual**: Verificación de iconografía, paleta de colores y estilos según la identidad de marca.
   - **Navegabilidad**: Comprobación de rutas funcionales y usabilidad de componentes.
3. **Sincronización e Integración**: Tras la aprobación del equipo, se procede a la integración de la rama individual hacia la rama de `desarrollo`.
4. **Consolidación de Versión**: Al concluir cada Sprint o fase del proyecto, el código estable se despliega hacia la rama `main` para su entrega final.

## 3. Normas de Integridad del Código

- **Protección de Producción**: Queda estrictamente prohibido realizar commits directos a la rama `main`.
- **Resolución de Conflictos**: Los procesos de integración (merges) que presenten conflictos técnicos deben ser resueltos en colaboración con otros integrantes del equipo para asegurar la consistencia del sistema.
- **Documentación de Cambios**: Cada commit debe ir acompañado de un mensaje descriptivo que identifique la mejora o corrección implementada.
