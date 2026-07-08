import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="orders-container">
      <header class="page-header">
        <div>
          <h1>Pedidos</h1>
          <p class="subtitle">Historial y seguimiento de órdenes de compra en tiempo real</p>
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
                <th>Producto (Talla y Cant.)</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of filteredOrders">
                <td class="order-id" [title]="order.realId">{{ order.id }}</td>
                <td>
                  <div class="client-cell">
                    <div class="avatar">{{ order.client[0]?.toUpperCase() }}</div>
                    <div>
                      <p class="client-name">{{ order.client }}</p>
                      <p class="client-email">{{ order.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="product-cell">{{ order.product }}</td>
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
                  <p>No hay pedidos registrados por el momento.</p>
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

    .order-id { font-family: monospace; color: #888; font-size: 0.85rem; cursor: help; }

    .client-cell { display: flex; align-items: center; gap: 0.8rem; }
    .avatar { width: 36px; height: 36px; background: #000; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; flex-shrink: 0; }
    .client-name { font-weight: 600; margin: 0 0 0.15rem; font-size: 0.9rem; }
    .client-email { color: #aaa; margin: 0; font-size: 0.78rem; }

    .product-cell { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.9rem; }
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
export class OrdersComponent implements OnInit {
  orderService = inject(OrderService);

  searchQuery = '';
  activeTab = 'Todos';
  tabs = ['Todos', 'Pendiente', 'Completado', 'Cancelado'];
  statusOptions = ['Pendiente', 'Completado', 'Cancelado'];

  orders: any[] = [];
  filteredOrders: any[] = [];

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data.map(item => ({
          realId: item.id,
          id: '#' + item.id.substring(0, 8).toUpperCase(),
          client: item.user?.full_name || 'Invitado',
          email: item.user?.email || 'N/A',
          product: item.items.map((i: any) => `${i.product?.name || 'Zapato'} (${i.size}) x${i.quantity}`).join(', '),
          date: new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
          total: Number(item.total_amount),
          status: this.mapToFrontendStatus(item.status)
        }));
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error al cargar pedidos de la base de datos:', err);
      }
    });
  }

  mapToFrontendStatus(status: string): string {
    const s = status.toLowerCase();
    if (s === 'pendiente' || s === 'pending') return 'Pendiente';
    if (s === 'completado' || s === 'completed') return 'Completado';
    if (s === 'cancelado' || s === 'cancelled') return 'Cancelado';
    return status;
  }

  mapToBackendStatus(status: string): string {
    const s = status.toLowerCase();
    if (s === 'pendiente') return 'pendiente';
    if (s === 'completado') return 'completado';
    if (s === 'cancelado') return 'cancelado';
    return s;
  }

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
        o.client.toLowerCase().includes(q) || o.product.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
      );
    }

    this.filteredOrders = result;
  }

  getCount(status: string): number {
    return this.orders.filter(o => o.status === status).length;
  }

  changeStatus(order: any) {
    const backendStatus = this.mapToBackendStatus(order.status);
    this.orderService.updateOrderStatus(order.realId, backendStatus).subscribe({
      next: (res) => {
        // Actualizar el estado en local
        order.status = this.mapToFrontendStatus(res.status);
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error al actualizar el estado del pedido:', err);
        alert('Error al cambiar el estado del pedido: ' + (err?.error?.detail || 'Inténtalo de nuevo.'));
        this.loadOrders(); // Recargar datos reales en caso de fallo
      }
    });
  }
}
