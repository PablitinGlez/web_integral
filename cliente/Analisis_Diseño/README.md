
## 4. Burndown Chart (Gráfico de Trabajo Pendiente)
El equipo utilizó gráficos de trabajo pendiente para monitorear el avance diario de los Sprints. Abajo se muestra la tabla de datos que simula el descenso de puntos de historia pendientes a lo largo de los 10 días laborables de cada Sprint (de lunes a viernes por dos semanas):

### Historial de Puntos Pendientes (Burndown Data)
| Día | Sprint 1 (Pendiente/Ideal) | Sprint 2 (Pendiente/Ideal) | Sprint 3 (Pendiente/Ideal) |
| :---: | :---: | :---: | :---: |
| **Inicio (D0)** | 34 / 34 SP | 40 / 40 SP | 32 / 32 SP |
| **Día 1** | 34 / 30.6 SP | 40 / 36.0 SP | 32 / 28.8 SP |
| **Día 2** | 29 / 27.2 SP | 40 / 32.0 SP | 32 / 25.6 SP |
| **Día 3** | 29 / 23.8 SP | 35 / 28.0 SP | 24 / 22.4 SP |
| **Día 4** | 24 / 20.4 SP | 35 / 24.0 SP | 24 / 19.2 SP |
| **Día 5 (Mitad)** | 19 / 17.0 SP | 27 / 20.0 SP | 16 / 16.0 SP |
| **Día 6** | 19 / 13.6 SP | 22 / 16.0 SP | 16 / 12.8 SP |
| **Día 7** | 14 / 10.2 SP | 14 / 12.0 SP | 11 / 9.6 SP |
| **Día 8** | 9 / 6.8 SP | 9 / 8.0 SP | 6 / 6.4 SP |
| **Día 9** | 3 / 3.4 SP | 5 / 4.0 SP | 3 / 3.2 SP |
| **Fin (D10)** | 0 / 0.0 SP | 0 / 0.0 SP | 0 / 0.0 SP |

---

## 5. Incrementos de Software (Software Increments)

* **Incremento 1 (Fin del Sprint 1):** Un catálogo funcional integrado que extrae dinámicamente información de marcas, categorías y productos desde Supabase y cuenta con registro/login de usuarios con tokens de seguridad JWT encriptados.
* **Incremento 2 (Fin del Sprint 2):** Plataforma de e-commerce transaccional. Permite seleccionar variantes de calzado (talla/stock), agregar ítems a un carrito de compras interactivo y pagar la orden exitosamente mediante una simulación real con el botón inteligente de PayPal, actualizando el almacén.
* **Incremento 3 (Fin del Sprint 3):** Producto terminado y operativo en producción. Incluye todo el flujo de clientes, un panel de administración integrado con métricas de ventas y control total de stock, cupones funcionales y despliegue público en la nube (Vercel + Render).
