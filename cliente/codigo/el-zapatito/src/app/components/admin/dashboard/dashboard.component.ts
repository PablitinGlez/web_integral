import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, delay, retryWhen, take } from 'rxjs/operators';
import { OrderService } from '../../../services/order.service';

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
        <div class="metric-card" *ngFor="let m of metrics">
          <div class="m-icon" [style.background]="m.color + '22'" [style.color]="m.color">
            <span class="material-icons">{{ m.icon }}</span>
          </div>
          <div class="m-info">
            <p class="m-label">{{ m.label }}</p>
            <h3 class="m-value">{{ m.value }}</h3>
            <p class="m-trend" [class.up]="m.trend > 0" [class.down]="m.trend < 0">
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
  orderService = inject(OrderService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  today = new Date();
  metrics: Array<{ label: string; value: string; icon: string; trend: number; color: string }> = [];

  recentOrders: any[] = [];
  topProducts: any[] = [];

  ngOnInit(): void {
    this.loadMetrics();
    this.loadRecentOrders();
  }

  private loadRecentOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        // Mapear Ventas Recientes (tomar las últimas 4)
        this.recentOrders = orders.slice(0, 4).map(item => ({
          client: item.user?.full_name || 'Invitado',
          product: item.items.map((i: any) => `${i.product?.name || 'Zapato'} (${i.size})`).join(', '),
          date: new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
          total: Number(item.total_amount),
          status: this.mapToFrontendStatus(item.status)
        }));

        // Calcular los productos más vendidos
        const productSales: { [name: string]: { sales: number; revenue: number; img: string } } = {};
        orders.forEach(o => {
          o.items.forEach((i: any) => {
            const name = i.product?.name || 'Zapato';
            if (!productSales[name]) {
              productSales[name] = {
                sales: 0,
                revenue: 0,
                img: i.product?.main_image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=100'
              };
            }
            productSales[name].sales += i.quantity;
            productSales[name].revenue += Number(i.unit_price) * i.quantity;
          });
        });

        this.topProducts = Object.entries(productSales)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 3);
          
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar pedidos para el Dashboard:', err);
      }
    });
  }

  private loadMetrics(): void {
    this.metrics = this.getDefaultMetrics();
    this.cdr.detectChanges();

    this.http.get<any>('http://localhost:8000/metrics/summary')
      .pipe(
        retryWhen(errors => errors.pipe(delay(500), take(3))),
        catchError(() => {
          this.metrics = this.getDefaultMetrics();
          this.cdr.detectChanges();
          return of(null);
        })
      )
      .subscribe((data) => {
        if (!data) {
          return;
        }

        this.metrics = [
          { label: 'Productos', value: data.total_products.toString(), icon: 'inventory_2', trend: 0, color: '#3b82f6' },
          { label: 'Categorías', value: data.total_categories.toString(), icon: 'category', trend: 0, color: '#8b5cf6' },
          { label: 'Marcas', value: data.total_brands.toString(), icon: 'branding_watermark', trend: 0, color: '#10b981' },
          { label: 'Disponibles', value: data.available_products.toString(), icon: 'check_circle', trend: 0, color: '#f59e0b' },
          { label: 'Stock Total', value: data.total_stock.toString(), icon: 'warehouse', trend: 0, color: '#ef4444' },
          { label: 'Cupones Activos', value: data.active_coupons.toString(), icon: 'discount', trend: 0, color: '#000000' }
        ];
        
        this.cdr.detectChanges();
      });
  }

  private getDefaultMetrics() {
    return [
      { label: 'Productos', value: '0', icon: 'inventory_2', trend: 0, color: '#3b82f6' },
      { label: 'Categorías', value: '0', icon: 'category', trend: 0, color: '#8b5cf6' },
      { label: 'Marcas', value: '0', icon: 'branding_watermark', trend: 0, color: '#10b981' },
      { label: 'Disponibles', value: '0', icon: 'check_circle', trend: 0, color: '#f59e0b' },
      { label: 'Stock Total', value: '0', icon: 'warehouse', trend: 0, color: '#ef4444' },
      { label: 'Cupones Activos', value: '0', icon: 'discount', trend: 0, color: '#000000' }
    ];
  }

  mapToFrontendStatus(status: string): string {
    const s = status.toLowerCase();
    if (s === 'pendiente' || s === 'pending') return 'Pendiente';
    if (s === 'completado' || s === 'completed') return 'Completado';
    if (s === 'cancelado' || s === 'cancelled') return 'Cancelado';
    return status;
  }
}
