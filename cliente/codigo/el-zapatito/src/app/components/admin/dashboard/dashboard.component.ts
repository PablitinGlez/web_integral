import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="db-header">
        <div>
          <h1>Panel de Control</h1>
          <p class="subtitle">Bienvenido de nuevo, Administrador</p>
        </div>
        <div class="date-display">
          {{ today | date:'fullDate' }}
        </div>
      </header>

      <!-- Metrics Grid -->
      <section class="metrics-grid">
        <div class="metric-card" *ngFor="let m of metrics()">
          <div class="m-icon" [style.background]="m.color + '22'" [style.color]="m.color">
            <span class="material-icons">{{ m.icon }}</span>
          </div>
          <div class="m-info">
            <p class="m-label">{{ m.label }}</p>
            <h3 class="m-value">{{ m.value }}</h3>
            <p class="m-trend" *ngIf="m.trend !== undefined" [class.up]="m.trend > 0" [class.down]="m.trend < 0">
              {{ m.trend > 0 ? '+' : '' }}{{ m.trend }}% vs mes anterior
            </p>
          </div>
        </div>
      </section>

      <div class="db-content-grid">
        <!-- Recent Activity Table -->
        <section class="activity-section">
          <div class="card-header">
            <h3>Ventas Recientes</h3>
            <button class="btn-text">Ver todas</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Producto</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of recentOrders">
                  <td>
                    <div class="client-cell">
                      <div class="avatar">{{ order.client[0] }}</div>
                      <span>{{ order.client }}</span>
                    </div>
                  </td>
                  <td>{{ order.product }}</td>
                  <td>{{ order.date }}</td>
                  <td>{{ order.total | currency:'USD' }}</td>
                  <td>
                    <span class="status-badge" [class]="order.status.toLowerCase()">
                      {{ order.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Top Products -->
        <section class="top-products-section">
          <div class="card-header">
            <h3>Más Vendidos</h3>
          </div>
          <div class="top-list">
            <div class="top-item" *ngFor="let p of topProducts; let i = index">
              <span class="rank">#{{ i + 1 }}</span>
              <img [src]="p.img" alt="Product">
              <div class="p-details">
                <p class="p-name">{{ p.name }}</p>
                <p class="p-sales">{{ p.sales }} ventas</p>
              </div>
              <p class="p-revenue">{{ p.revenue | currency:'USD' }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 1rem; }
    
    .db-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3rem; }
    h1 { font-size: 2.5rem; letter-spacing: -1.5px; margin: 0 0 0.5rem; }
    .subtitle { color: #888; font-size: 1.1rem; }
    .date-display { background: #000; color: #fff; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 500; font-size: 0.9rem; }

    /* Metrics */
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .metric-card { background: #fff; border: 1px solid #eee; padding: 1.5rem; border-radius: 16px; display: flex; align-items: center; gap: 1.5rem; }
    .m-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    .m-label { font-size: 0.85rem; color: #888; margin: 0 0 0.3rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .m-value { font-size: 1.8rem; margin: 0 0 0.3rem; letter-spacing: -1px; }
    .m-trend { font-size: 0.8rem; margin: 0; font-weight: 500; }
    .m-trend.up { color: #10b981; }
    .m-trend.down { color: #ef4444; }

    /* Layout Grid */
    .db-content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }

    /* Activity Table */
    .activity-section, .top-products-section { background: #fff; border: 1px solid #eee; border-radius: 20px; padding: 1.5rem; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .card-header h3 { font-size: 1.25rem; font-weight: 700; margin: 0; }
    .btn-text { background: transparent; border: none; color: #000; font-weight: 600; cursor: pointer; border-bottom: 2px solid #000; padding: 0.2rem 0; }

    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1rem; color: #999; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #fafafa; }
    td { padding: 1.2rem 1rem; border-bottom: 1px solid #fafafa; font-size: 0.95rem; }
    .client-cell { display: flex; align-items: center; gap: 0.8rem; }
    .avatar { width: 32px; height: 32px; background: #eee; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; }
    .status-badge { padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .status-badge.completado { background: #d1fae5; color: #059669; }
    .status-badge.pendiente { background: #fef3c7; color: #d97706; }
    .status-badge.cancelado { background: #fee2e2; color: #dc2626; }

    /* Top Products */
    .top-list { display: flex; flex-direction: column; gap: 1.5rem; }
    .top-item { display: flex; align-items: center; gap: 1rem; }
    .rank { font-size: 0.8rem; color: #ccc; font-weight: 700; width: 25px; }
    .top-item img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; background: #f9f9f9; }
    .p-details { flex: 1; }
    .p-name { font-weight: 600; margin: 0; font-size: 0.95rem; }
    .p-sales { font-size: 0.8rem; color: #888; margin: 0; }
    .p-revenue { font-weight: 700; font-size: 0.95rem; }

    @media (max-width: 1200px) {
      .db-content-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  today = new Date();

  totalProducts = signal(0);
  totalCategories = signal(0);
  totalBrands = signal(0);
  totalStock = signal(0);
  availableProducts = signal(0);
  activeProducts = signal(0);
  lowStockAlerts = signal(0);
  totalOrders = signal(0);
  totalSales = signal(0);

  metrics = computed(() => [
    { label: 'Ventas Totales', value: `$${this.totalSales().toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, icon: 'payments', trend: 12.5, color: '#2b8a3e' },
    { label: 'Pedidos', value: `${this.totalOrders()}`, icon: 'shopping_bag', trend: 8.2, color: '#3b82f6' },
    { label: 'Productos', value: `${this.totalProducts()}`, icon: 'style', trend: undefined, color: '#8b5cf6' },
    { label: 'Categorías', value: `${this.totalCategories()}`, icon: 'category', trend: undefined, color: '#10b981' },
    { label: 'Marcas', value: `${this.totalBrands()}`, icon: 'sell', trend: undefined, color: '#ec4899' },
    { label: 'Disponibles en stock', value: `${this.availableProducts()}`, icon: 'check_circle', trend: undefined, color: '#2563eb' },
    { label: 'Unidades en stock', value: `${this.totalStock()} u.`, icon: 'inventory_2', trend: undefined, color: '#f59e0b' },
    { label: 'Productos activos', value: `${this.activeProducts()}`, icon: 'verified', trend: undefined, color: '#14b8a6' },
    { label: 'Stock Bajo (<5)', value: `${this.lowStockAlerts()}`, icon: 'warning', trend: undefined, color: '#ef4444' }
  ]);

  recentOrders = [
    { client: 'Juan Pérez', product: 'Nike Air Max', date: '21 May, 2026', total: 189.99, status: 'Completado' },
    { client: 'María García', product: 'Jordan Retro', date: '21 May, 2026', total: 210.00, status: 'Pendiente' },
    { client: 'Carlos Ruiz', product: 'Yeezy 350', date: '20 May, 2026', total: 220.00, status: 'Completado' },
    { client: 'Ana López', product: 'Adidas Ultra', date: '20 May, 2026', total: 160.00, status: 'Cancelado' }
  ];

  topProducts = [
    { name: 'Nike Air Max Minimal', sales: 450, revenue: 85495, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=100' },
    { name: 'Jordan Retro High', sales: 320, revenue: 67200, img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=100' },
    { name: 'Yeezy Boost 350', sales: 280, revenue: 61600, img: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=100' }
  ];

  ngOnInit() {
    this.loadMetrics();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.urlAfterRedirects === '/admin' || event.urlAfterRedirects === '/admin/') {
          this.loadMetrics();
        }
      });
  }

  private buildMetrics(res: any) {
    this.totalProducts.set(res.total_products || 0);
    this.totalCategories.set(res.total_categories || 0);
    this.totalBrands.set(res.total_brands || 0);
    this.totalStock.set(res.total_stock || 0);
    this.availableProducts.set(res.available_products || 0);
    this.activeProducts.set(res.active_products || 0);
    this.lowStockAlerts.set(res.low_stock_alerts || 0);
    this.totalOrders.set(res.total_orders || 0);
    this.totalSales.set(res.total_sales || 0);

  }

  loadMetrics() {
    this.http.get<any>('http://localhost:8000/metrics/summary').subscribe({
      next: (res) => this.buildMetrics(res),
      error: (err) => {
        console.error('Error cargando métricas:', err);
      }
    });
  }
}

