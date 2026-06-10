import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="orders-container">
      <header class="page-header">
        <div>
          <h1>Pedidos</h1>
          <p class="subtitle">Historial y seguimiento de órdenes de compra</p>
        </div>
        <div class="header-stats">
          <div class="stat-chip"><span class="dot pending"></span>{{ getCount('Pendiente') }} Pendientes</div>
          <div class="stat-chip"><span class="dot completado"></span>{{ getCount('Completado') }} Completados</div>
          <div class="stat-chip"><span class="dot cancelado"></span>{{ getCount('Cancelado') }} Cancelados</div>
        </div>
      </header>

      <!-- Filtros -->
      <div class="filters-row">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()" placeholder="Buscar por cliente o producto...">
        </div>
        <div class="status-tabs">
          <button *ngFor="let tab of tabs" class="tab" [class.active]="activeTab === tab" (click)="setTab(tab)">
            {{ tab }}
          </button>
        </div>
      </div>

      <!-- Tabla de pedidos -->
      <div class="table-card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of filteredOrders">
                <td class="order-id">{{ order.id }}</td>
                <td>
                  <div class="client-cell">
                    <div class="avatar">{{ order.client[0] }}</div>
                    <div>
                      <p class="client-name">{{ order.client }}</p>
                      <p class="client-email">{{ order.email }}</p>
                    </div>
                  </div>
                </td>
                <td>{{ order.product }}</td>
                <td class="date-col">{{ order.date }}</td>
                <td class="total-col">{{ order.total | currency:'USD' }}</td>
                <td>
                  <span class="status-badge" [class]="order.status.toLowerCase()">
                    {{ order.status }}
                  </span>
                </td>
                <td>
                  <select class="status-select" [(ngModel)]="order.status" (change)="changeStatus(order)">
                    <option *ngFor="let s of statusOptions" [value]="s">{{ s }}</option>
                  </select>
                </td>
              </tr>
              <tr *ngIf="filteredOrders.length === 0">
                <td colspan="7" class="empty-state">
                  <span class="material-icons">receipt_long</span>
                  <p>No hay pedidos que coincidan con el filtro.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-container { padding: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    h1 { font-size: 2.2rem; letter-spacing: -1px; margin: 0 0 0.5rem; }
    .subtitle { color: #888; margin: 0; }

    .header-stats { display: flex; gap: 0.8rem; flex-wrap: wrap; }
    .stat-chip { display: flex; align-items: center; gap: 0.5rem; background: #fff; border: 1px solid #eee; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.pending { background: #d97706; }
    .dot.completado { background: #059669; }
    .dot.cancelado { background: #dc2626; }

    /* Filters */
    .filters-row { display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .search-bar { display: flex; align-items: center; gap: 0.5rem; background: #fff; border: 1px solid #eee; padding: 0.7rem 1.2rem; border-radius: 12px; flex: 1; min-width: 240px; }
    .search-bar input { border: none; outline: none; width: 100%; font-size: 0.95rem; }
    .search-bar .material-icons { color: #888; }

    .status-tabs { display: flex; gap: 0.5rem; background: #f5f5f5; padding: 0.4rem; border-radius: 12px; }
    .tab { background: transparent; border: none; padding: 0.5rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem; color: #888; transition: all 0.2s; font-family: inherit; }
    .tab.active { background: #fff; color: #000; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

    /* Table */
    .table-card { background: #fff; border: 1px solid #eee; border-radius: 20px; overflow: hidden; }
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1.2rem 1.5rem; color: #999; font-size: 0.78rem; text-transform: uppercase; border-bottom: 1px solid #f5f5f5; font-weight: 700; }
    td { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f9f9f9; font-size: 0.95rem; }

    .order-id { font-family: monospace; color: #888; font-size: 0.85rem; }

    .client-cell { display: flex; align-items: center; gap: 0.8rem; }
    .avatar { width: 36px; height: 36px; background: #000; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; flex-shrink: 0; }
    .client-name { font-weight: 600; margin: 0 0 0.15rem; font-size: 0.9rem; }
    .client-email { color: #aaa; margin: 0; font-size: 0.78rem; }

    .date-col { color: #888; font-size: 0.88rem; }
    .total-col { font-weight: 700; }

    .status-badge { padding: 0.35rem 0.9rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
    .status-badge.completado { background: #d1fae5; color: #059669; }
    .status-badge.pendiente { background: #fef3c7; color: #d97706; }
    .status-badge.cancelado { background: #fee2e2; color: #dc2626; }

    .status-select { border: 1px solid #eee; border-radius: 8px; padding: 0.5rem 0.8rem; font-size: 0.85rem; font-family: inherit; outline: none; background: #fafafa; cursor: pointer; }

    .empty-state { text-align: center; padding: 4rem 2rem; color: #aaa; }
    .empty-state .material-icons { font-size: 3rem; margin-bottom: 1rem; color: #ddd; display: block; }
    .empty-state p { margin: 0; }
  `]
})
export class OrdersComponent {
  searchQuery = '';
  activeTab = 'Todos';
  tabs = ['Todos', 'Pendiente', 'Completado', 'Cancelado'];
  statusOptions = ['Pendiente', 'Completado', 'Cancelado'];

  orders = [
    { id: '#ZAP-001', client: 'Juan Pérez', email: 'juan@example.com', product: 'Nike Air Max Minimal', date: '28 May, 2026', total: 189.99, status: 'Completado' },
    { id: '#ZAP-002', client: 'María García', email: 'maria@example.com', product: 'Jordan Retro High', date: '27 May, 2026', total: 210.00, status: 'Pendiente' },
    { id: '#ZAP-003', client: 'Carlos Ruiz', email: 'carlos@example.com', product: 'Yeezy Boost 350', date: '27 May, 2026', total: 220.00, status: 'Completado' },
    { id: '#ZAP-004', client: 'Ana López', email: 'ana@example.com', product: 'Adidas Ultra Boost', date: '26 May, 2026', total: 160.00, status: 'Cancelado' },
    { id: '#ZAP-005', client: 'Pedro Martínez', email: 'pedro@example.com', product: 'New Balance 574', date: '25 May, 2026', total: 140.00, status: 'Pendiente' },
    { id: '#ZAP-006', client: 'Sofía Torres', email: 'sofia@example.com', product: 'Converse Chuck 70', date: '24 May, 2026', total: 95.00, status: 'Completado' },
    { id: '#ZAP-007', client: 'Luis Herrera', email: 'luis@example.com', product: 'Puma RS-X', date: '23 May, 2026', total: 125.00, status: 'Pendiente' },
    { id: '#ZAP-008', client: 'Valentina Rios', email: 'vale@example.com', product: 'Nike Dunk Low', date: '22 May, 2026', total: 175.00, status: 'Cancelado' },
  ];

  filteredOrders = [...this.orders];

  setTab(tab: string) {
    this.activeTab = tab;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.orders];

    if (this.activeTab !== 'Todos') {
      result = result.filter(o => o.status === this.activeTab);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(o =>
        o.client.toLowerCase().includes(q) || o.product.toLowerCase().includes(q)
      );
    }

    this.filteredOrders = result;
  }

  getCount(status: string): number {
    return this.orders.filter(o => o.status === status).length;
  }

  changeStatus(order: any) {
    // Los cambios quedan en memoria (datos estáticos)
    this.applyFilters();
  }
}
