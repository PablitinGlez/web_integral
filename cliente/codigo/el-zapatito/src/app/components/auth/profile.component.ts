import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { AddressService, Address, AddressInput } from '../../services/address.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <h2>Mi Perfil</h2>

      @if (!auth.currentUser()) {
        <div class="empty-state">
          <p>No hay una sesión activa.</p>
        </div>
      } @else {
        <div class="profile-grid">
          <!-- Panel Izquierdo: Info de la cuenta -->
          <div class="profile-card">
            <div class="profile-avatar">
              {{ initials() }}
            </div>

            <div class="profile-details">
              <div class="card-header-row">
                <h3>Información de la Cuenta</h3>
                @if (!editing()) {
                  <button class="btn-link" (click)="startEdit()">
                    <span class="material-icons">edit</span> Editar
                  </button>
                }
              </div>

              @if (!editing()) {
                <div class="detail-row">
                  <span class="label">Nombre:</span>
                  <span class="value">{{ auth.currentUser()?.fullName || 'Sin especificar' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Correo Electrónico:</span>
                  <span class="value">{{ auth.currentUser()?.email }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Edad:</span>
                  <span class="value">{{ auth.currentUser()?.age ?? 'Sin especificar' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Teléfono:</span>
                  <span class="value">{{ auth.currentUser()?.phone || 'Sin especificar' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Tipo de cuenta:</span>
                  <span class="value">
                    @if (auth.isAdmin()) {
                      <span class="badge-admin">Administrador</span>
                    } @else {
                      <span class="badge-user">Cliente</span>
                    }
                  </span>
                </div>
                @if (memberSince()) {
                  <div class="detail-row">
                    <span class="label">Miembro desde:</span>
                    <span class="value">{{ memberSince() }}</span>
                  </div>
                }
                <div class="detail-row">
                  <span class="label">Artículos en el carrito:</span>
                  <span class="value">{{ cart.totalItems() }}</span>
                </div>
              } @else {
                <div class="edit-form">
                  <div class="edit-field">
                    <label>Nombre completo</label>
                    <input type="text" [(ngModel)]="editableForm.fullName" name="fullName" placeholder="Tu nombre completo" [disabled]="saving()">
                  </div>

                  <div class="edit-row">
                    <div class="edit-field">
                      <label>Edad</label>
                      <input type="number" min="0" max="120" [(ngModel)]="editableForm.age" name="age" placeholder="Ej. 28" [disabled]="saving()">
                    </div>
                    <div class="edit-field">
                      <label>Teléfono</label>
                      <input type="tel" [(ngModel)]="editableForm.phone" name="phone" placeholder="Ej. 55 1234 5678" [disabled]="saving()">
                    </div>
                  </div>

                  @if (errorMessage()) {
                    <p class="error-text">{{ errorMessage() }}</p>
                  }

                  <div class="edit-actions">
                    <button class="btn-secondary" (click)="cancelEdit()" [disabled]="saving()">Cancelar</button>
                    <button class="btn-primary" (click)="saveEdit()" [disabled]="saving()">
                      {{ saving() ? 'Guardando...' : 'Guardar cambios' }}
                    </button>
                  </div>
                </div>
              }

              @if (successMessage()) {
                <p class="success-text">
                  <span class="material-icons">check_circle</span> {{ successMessage() }}
                </p>
              }
            </div>

            <div class="actions-bar" style="margin-top: 1.5rem; display: flex; justify-content: flex-start; width: 100%;">
              <button class="btn-primary" (click)="goToAdmin()" style="width: 100%; justify-content: center; background: #111; color: #fff; border: none; padding: 0.8rem; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s;">
                <span class="material-icons">dashboard</span> Panel de Administración
              </button>
            </div>

            <div class="actions-bar" style="margin-top: 2rem; display: flex; justify-content: flex-start; width: 100%;">
              <button class="btn-logout" (click)="logout()" style="width: 100%; justify-content: center;">
                <span class="material-icons">logout</span> Cerrar sesión
              </button>
            </div>
          </div>

          <!-- Panel Derecho: Direcciones, Historial de Pedidos y Favoritos -->
          <div class="profile-main-content" style="display: flex; flex-direction: column; gap: 2rem;">
            <!-- Mis Pedidos -->
            <div class="orders-card">
              <h3>Mis Pedidos</h3>
              <p class="orders-subtitle">Historial de tus compras realizadas en El Zapatito</p>

              @if (loadingOrders()) {
                <div class="orders-loading">
                  <div class="spinner"></div>
                  <p>Cargando tus pedidos...</p>
                </div>
              } @else if (orders().length === 0) {
                <div class="empty-orders-state">
                  <span class="material-icons empty-icon">receipt_long</span>
                  <p class="empty-title">Aún no tienes pedidos</p>
                  <p class="empty-desc">Tus compras con PayPal aparecerán aquí una vez completadas.</p>
                </div>
              } @else {
                <div class="orders-list">
                  @for (order of orders(); track order.id) {
                    <div class="order-item-box">
                      <header class="order-box-header">
                        <div>
                          <span class="order-hash">#{{ order.id.substring(0, 8).toUpperCase() }}</span>
                          <span class="order-date">{{ order.created_at | date:'dd MMM yyyy, HH:mm' }}</span>
                        </div>
                        <span class="status-badge" [class]="order.status.toLowerCase()">
                          {{ mapToFrontendStatus(order.status) }}
                        </span>
                      </header>

                      <main class="order-box-products">
                        @for (item of order.items; track item.id) {
                          <div class="product-item-row">
                            <img 
                              [src]="item.product?.main_image_url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=150'" 
                              [alt]="item.product?.name || 'Calzado'"
                              class="product-row-img"
                            >
                            <div class="product-row-info">
                              <p class="prod-brand">{{ item.product?.brand || 'El Zapatito' }}</p>
                              <h5 class="prod-name">{{ item.product?.name || 'Zapato' }}</h5>
                              <span class="prod-details">Talla: <strong>{{ item.size }}</strong> &middot; Cantidad: <strong>{{ item.quantity }}</strong></span>
                            </div>
                            <div class="product-row-price">
                              {{ (item.unit_price * item.quantity) | currency:'USD' }}
                            </div>
                          </div>
                        }
                      </main>

                      <footer class="order-box-footer">
                        @if (order.paypal_order_id) {
                          <span class="paypal-txn">
                            <span class="material-icons txn-icon">payment</span>
                            Transacción: <code>{{ order.paypal_order_id }}</code>
                          </span>
                        }
                        <div class="order-total-amount">
                          <span>Total Pagado:</span>
                          <strong>{{ order.total_amount | currency:'USD' }}</strong>
                        </div>
                      </footer>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Mis Direcciones -->
            <div class="addresses-section">
              <div class="section-header-row">
                <h3><span class="material-icons">location_on</span> Mis Direcciones</h3>
                @if (!addingAddress() && !editingAddressId()) {
                  <button class="btn-link" (click)="startAddAddress()">
                    <span class="material-icons">add</span> Agregar dirección
                  </button>
                }
              </div>

              @if (addressError()) {
                <p class="error-text">{{ addressError() }}</p>
              }

              <!-- Formulario de alta / edición -->
              @if (addingAddress() || editingAddressId()) {
                <div class="address-form">
                  <div class="edit-row">
                    <div class="edit-field">
                      <label>Nombre de la dirección</label>
                      <input type="text" [(ngModel)]="addressForm.label" name="label" placeholder="Ej. Casa, Oficina" [disabled]="savingAddress()">
                    </div>
                    <div class="edit-field">
                      <label>Teléfono de contacto</label>
                      <input type="tel" [(ngModel)]="addressForm.phone" name="addrPhone" placeholder="Opcional" [disabled]="savingAddress()">
                    </div>
                  </div>

                  <div class="edit-field">
                    <label>Calle y número</label>
                    <input type="text" [(ngModel)]="addressForm.street" name="street" placeholder="Ej. Av. Reforma 123" [disabled]="savingAddress()">
                  </div>

                  <div class="edit-row three">
                    <div class="edit-field">
                      <label>Ciudad</label>
                      <input type="text" [(ngModel)]="addressForm.city" name="city" placeholder="Ciudad" [disabled]="savingAddress()">
                    </div>
                    <div class="edit-field">
                      <label>Estado</label>
                      <input type="text" [(ngModel)]="addressForm.state" name="state" placeholder="Estado" [disabled]="savingAddress()">
                    </div>
                    <div class="edit-field">
                      <label>Código Postal</label>
                      <input type="text" [(ngModel)]="addressForm.zip_code" name="zip" placeholder="C.P." [disabled]="savingAddress()">
                    </div>
                  </div>

                  <div class="edit-actions">
                    <button class="btn-secondary" (click)="cancelAddressForm()" [disabled]="savingAddress()">Cancelar</button>
                    <button class="btn-primary" (click)="saveAddressForm()" [disabled]="savingAddress()">
                      {{ savingAddress() ? 'Guardando...' : (editingAddressId() ? 'Guardar cambios' : 'Agregar dirección') }}
                    </button>
                  </div>
                </div>
              }

              <!-- Listado de direcciones -->
              @if (addresses.addresses().length === 0 && !addingAddress()) {
                <div class="reserved-empty">
                  <p>Todavía no has guardado ninguna dirección.</p>
                </div>
              } @else {
                <div class="address-list">
                  @for (addr of addresses.addresses(); track addr.id) {
                    <div class="address-card" [class.is-default]="addr.is_default">
                      <div class="address-card-header">
                        <strong>{{ addr.label }}</strong>
                        @if (addr.is_default) {
                          <span class="default-badge">Principal</span>
                        }
                      </div>
                      <p class="address-text">{{ addressLine(addr) }}</p>
                      @if (addr.phone) {
                        <p class="address-phone">Tel: {{ addr.phone }}</p>
                      }
                      <div class="address-card-actions">
                        @if (!addr.is_default) {
                          <button class="btn-mini" (click)="makeDefault(addr)">Marcar como principal</button>
                        }
                        <button class="btn-mini" (click)="startEditAddress(addr)">Editar</button>
                        <button class="btn-mini danger" (click)="removeAddress(addr)">Eliminar</button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Sección reservada: Favoritos -->
            <div class="reserved-section">
              <div class="reserved-header">
                <span class="material-icons">favorite_border</span>
                <h3>Mis Favoritos</h3>
              </div>
              <div class="reserved-empty">
                <p>Todavía no tienes productos guardados como favoritos.</p>
                <span class="coming-soon-tag">Próximamente</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-container { max-width: 1000px; margin: 3rem auto; padding: 0 1.5rem; }
    h2 { font-size: 2.2rem; letter-spacing: -1px; margin-bottom: 2rem; color: #000; border-bottom: 1px solid #eee; padding-bottom: 0.8rem; }
    .empty-state { color: #888; text-align: center; padding: 3rem 0; }

    .profile-grid { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; align-items: start; }
    @media (max-width: 800px) {
      .profile-grid { grid-template-columns: 1fr; }
    }

    .profile-card { background: #fff; border: 1px solid #eee; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); display: flex; flex-direction: column; align-items: center; }
    .profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; flex-shrink: 0; margin-bottom: 1.5rem; }
    .profile-details { width: 100%; }

    .card-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    h3 { margin: 0; font-size: 1.25rem; font-weight: 700; letter-spacing: -0.3px; display: flex; align-items: center; gap: 0.5rem; }

    .btn-link {
      display: flex; align-items: center; gap: 0.3rem; background: none; border: none;
      color: #000; font-weight: 600; font-size: 0.9rem; cursor: pointer; padding: 0.3rem 0.6rem;
      border-radius: 6px; transition: background 0.2s;
    }
    .btn-link:hover { background: #eee; }
    .btn-link .material-icons { font-size: 1.1rem; }

    .detail-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .label { font-size: 0.78rem; text-transform: uppercase; font-weight: 700; color: #999; letter-spacing: 0.5px; }
    .value { font-size: 0.95rem; color: #000; font-weight: 500; text-align: right; word-break: break-word; }
    .badge-admin { background: #000; color: #fff; padding: 0.2rem 0.8rem; border-radius: 20px; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .badge-user { background: #e7f5e7; color: #2b6b2b; padding: 0.2rem 0.8rem; border-radius: 20px; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

    .edit-form, .address-form { display: flex; flex-direction: column; gap: 1.1rem; }
    .edit-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .edit-row.three { grid-template-columns: 1fr 1fr 1fr; }
    @media (max-width: 480px) {
      .edit-row, .edit-row.three { grid-template-columns: 1fr; }
    }
    .edit-field { display: flex; flex-direction: column; gap: 0.4rem; }
    .edit-field label { font-weight: 600; font-size: 0.9rem; color: #444; }
    .edit-field input, .edit-field textarea {
      width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 8px;
      box-sizing: border-box; font-size: 0.95rem; background: #fff; font-family: inherit; resize: vertical;
    }
    .edit-field input:focus, .edit-field textarea:focus { border-color: #000; outline: none; }
    .edit-field input:disabled, .edit-field textarea:disabled { background: #f1f1f1; color: #999; }

    .error-text { color: #cc0000; font-size: 0.85rem; margin: 0; }
    .success-text {
      display: flex; align-items: center; gap: 0.4rem; color: #2b6b2b;
      font-size: 0.9rem; font-weight: 600; margin: 1rem 0 0;
    }
    .success-text .material-icons { font-size: 1.1rem; }

    .edit-actions { display: flex; gap: 0.8rem; margin-top: 0.3rem; }
    button { border: none; border-radius: 8px; padding: 0.7rem 1.4rem; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: #000; color: #fff; }
    .btn-primary:hover:not(:disabled) { background: #222; }
    .btn-primary:disabled { background: #999; cursor: not-allowed; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-secondary:hover:not(:disabled) { background: #ddd; }
    .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Mis Direcciones */
    .addresses-section {
      background: #fff; border: 1px solid #eee; border-radius: 16px;
      padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.02);
    }
    .section-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; }
    .section-header-row h3 .material-icons { color: #888; }

    .address-form { background: #fafafa; border: 1px solid #eee; border-radius: 10px; padding: 1.2rem; margin-bottom: 1.2rem; }

    .address-list { display: flex; flex-direction: column; gap: 1rem; }
    .address-card {
      border: 1px solid #eee; border-radius: 10px; padding: 1rem 1.2rem; background: #fafafa;
    }
    .address-card.is-default { border-color: #000; background: #fdfdfd; }
    .address-card-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem; }
    .default-badge { background: #000; color: #fff; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; padding: 0.15rem 0.6rem; border-radius: 20px; }
    .address-text { margin: 0 0 0.2rem; color: #444; font-size: 0.9rem; }
    .address-phone { margin: 0 0 0.6rem; color: #888; font-size: 0.85rem; }
    .address-card-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }
    .btn-mini {
      background: #fff; border: 1px solid #ddd; color: #333; font-size: 0.8rem;
      font-weight: 600; padding: 0.4rem 0.8rem; border-radius: 6px;
    }
    .btn-mini:hover { border-color: #000; }
    .btn-mini.danger { color: #cc0000; }
    .btn-mini.danger:hover { border-color: #cc0000; background: #fff5f5; }

    /* Tarjeta de Pedidos */
    .orders-card { background: #fff; border: 1px solid #eee; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
    .orders-card h3 { margin: 0 0 0.3rem 0; font-size: 1.4rem; letter-spacing: -0.5px; }
    .orders-subtitle { margin: 0 0 2rem 0; color: #888; font-size: 0.92rem; }

    /* Estados de Carga */
    .orders-loading { text-align: center; padding: 4rem 2rem; color: #888; }
    .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #000; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    /* Estado Vacío */
    .empty-orders-state { text-align: center; padding: 5rem 2rem; color: #aaa; border: 2px dashed #f0f0f0; border-radius: 12px; }
    .empty-icon { font-size: 3.5rem; color: #ddd; margin-bottom: 1rem; }
    .empty-title { font-weight: 700; font-size: 1.1rem; color: #444; margin: 0 0 0.5rem 0; }
    .empty-desc { font-size: 0.88rem; color: #888; margin: 0; }

    /* Lista de Pedidos */
    .orders-list { display: flex; flex-direction: column; gap: 1.5rem; }
    .order-item-box { border: 1px solid #eee; border-radius: 12px; overflow: hidden; background: #fafafa; transition: border-color 0.2s; }
    .order-item-box:hover { border-color: #ddd; }
    
    .order-box-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background: #fff; border-bottom: 1px solid #eee; }
    .order-hash { font-family: monospace; font-weight: 700; color: #000; font-size: 0.95rem; margin-right: 0.8rem; }
    .order-date { color: #888; font-size: 0.82rem; }
    
    /* Badges */
    .status-badge { padding: 0.35rem 0.8rem; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-badge.completado { background: #d1fae5; color: #065f46; }
    .status-badge.pendiente { background: #fef3c7; color: #92400e; }
    .status-badge.cancelado { background: #fee2e2; color: #991b1b; }

    .order-box-products { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.2rem; }
    .product-item-row { display: flex; align-items: center; gap: 1rem; }
    .product-row-img { width: 52px; height: 52px; object-fit: cover; border-radius: 8px; border: 1px solid #eee; background: #fff; }
    .product-row-info { flex: 1; }
    .prod-brand { margin: 0 0 0.15rem 0; font-size: 0.65rem; color: #999; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .prod-name { margin: 0 0 0.25rem 0; font-size: 0.92rem; font-weight: 600; color: #000; }
    .prod-details { font-size: 0.78rem; color: #666; }
    .product-row-price { font-weight: 700; font-size: 0.95rem; color: #000; }

    .order-box-footer { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background: #fff; border-top: 1px solid #eee; flex-wrap: wrap; gap: 0.8rem; }
    .paypal-txn { display: flex; align-items: center; gap: 0.4rem; color: #003087; font-size: 0.78rem; font-weight: 600; }
    .txn-icon { font-size: 1.1rem; }
    .paypal-txn code { background: #e6f0fa; padding: 0.15rem 0.4rem; border-radius: 4px; font-family: monospace; font-size: 0.75rem; font-weight: bold; }
    
    .order-total-amount { display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; }
    .order-total-amount span { color: #666; }
    .order-total-amount strong { font-size: 1.15rem; font-weight: 800; color: #000; }

    /* Secciones reservadas: Favoritos */
    .reserved-section {
      background: #fff; border: 1px dashed #ddd; border-radius: 12px;
      padding: 1.5rem 2rem;
    }
    .reserved-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.8rem; }
    .reserved-header .material-icons { color: #999; }
    .reserved-header h3 { margin: 0; font-size: 1.05rem; }
    .reserved-empty { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .reserved-empty p { margin: 0; color: #888; font-size: 0.9rem; }
    .coming-soon-tag {
      background: #f1f3f5; color: #666; font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.5px; padding: 0.3rem 0.7rem; border-radius: 20px;
      flex-shrink: 0;
    }

    .actions-bar { margin-top: 1.5rem; display: flex; justify-content: flex-end; }
    .btn-logout {
      display: flex; align-items: center; gap: 0.5rem; background: #fff; color: #cc0000;
      border: 1px solid #f0c0c0;
    }
    .btn-logout:hover { background: #fff5f5; }
    .btn-logout .material-icons { font-size: 1.1rem; }
  `]
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  cart = inject(CartService);
  addresses = inject(AddressService);
  orderService = inject(OrderService);
  private router = inject(Router);

  // Datos de cuenta
  editing = signal(false);
  saving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  editableForm = {
    fullName: '',
    age: null as number | null,
    phone: ''
  };

  // Direcciones
  addingAddress = signal(false);
  editingAddressId = signal<string | null>(null);
  savingAddress = signal(false);
  addressError = signal('');

  addressForm: AddressInput = {
    label: '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    phone: ''
  };

  // Pedidos
  orders = signal<any[]>([]);
  loadingOrders = signal(true);

  ngOnInit() {
    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.addresses.loadAddresses(userId);
    }
    this.loadMyOrders();
  }

  initials(): string {
    const name = this.auth.currentUser()?.fullName;
    if (name && name.trim()) {
      return name.trim().charAt(0).toUpperCase();
    }
    return this.auth.currentUser()?.email?.charAt(0)?.toUpperCase() || 'U';
  }

  memberSince(): string {
    const createdAt = this.auth.currentUser()?.createdAt;
    if (!createdAt) return '';
    try {
      return new Date(createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return '';
    }
  }

  addressLine(addr: Address): string {
    const parts = [addr.street, addr.city];
    if (addr.state) parts.push(addr.state);
    if (addr.zip_code) parts.push(`C.P. ${addr.zip_code}`);
    return parts.filter(Boolean).join(', ');
  }

  // --- Cuenta ---
  startEdit() {
    const user = this.auth.currentUser();
    this.editableForm = {
      fullName: user?.fullName || '',
      age: user?.age ?? null,
      phone: user?.phone || ''
    };
    this.errorMessage.set('');
    this.successMessage.set('');
    this.editing.set(true);
  }

  cancelEdit() {
    this.editing.set(false);
    this.errorMessage.set('');
  }

  async saveEdit() {
    this.errorMessage.set('');
    this.saving.set(true);
    try {
      await this.auth.updateProfile({
        fullName: this.editableForm.fullName,
        age: this.editableForm.age,
        phone: this.editableForm.phone
      });
      this.editing.set(false);
      this.successMessage.set('Perfil actualizado correctamente.');
      setTimeout(() => this.successMessage.set(''), 3500);
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'No se pudo actualizar el perfil.');
    } finally {
      this.saving.set(false);
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  // --- Direcciones ---
  private resetAddressForm() {
    this.addressForm = { label: '', street: '', city: '', state: '', zip_code: '', phone: '' };
  }

  startAddAddress() {
    this.resetAddressForm();
    this.editingAddressId.set(null);
    this.addressError.set('');
    this.addingAddress.set(true);
  }

  startEditAddress(addr: Address) {
    this.addressForm = {
      label: addr.label,
      street: addr.street,
      city: addr.city,
      state: addr.state || '',
      zip_code: addr.zip_code || '',
      phone: addr.phone || ''
    };
    this.addingAddress.set(false);
    this.addressError.set('');
    this.editingAddressId.set(addr.id);
  }

  cancelAddressForm() {
    this.addingAddress.set(false);
    this.editingAddressId.set(null);
    this.addressError.set('');
  }

  async saveAddressForm() {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;

    this.addressError.set('');
    this.savingAddress.set(true);
    try {
      if (this.editingAddressId()) {
        await this.addresses.updateAddress(this.editingAddressId()!, this.addressForm);
      } else {
        await this.addresses.addAddress(userId, this.addressForm);
      }
      this.addingAddress.set(false);
      this.editingAddressId.set(null);
    } catch (err: any) {
      this.addressError.set(err?.message || 'No se pudo guardar la dirección.');
    } finally {
      this.savingAddress.set(false);
    }
  }

  async makeDefault(addr: Address) {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    try {
      await this.addresses.setDefault(addr.id, userId);
    } catch (err: any) {
      this.addressError.set(err?.message || 'No se pudo marcar como principal.');
    }
  }

  async removeAddress(addr: Address) {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    if (!confirm(`¿Eliminar la dirección "${addr.label}"?`)) return;
    try {
      await this.addresses.deleteAddress(addr.id, userId);
    } catch (err: any) {
      this.addressError.set(err?.message || 'No se pudo eliminar la dirección.');
    }
  }

  // --- Pedidos ---
  loadMyOrders() {
    this.loadingOrders.set(true);
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders.set(data ?? []);
        this.loadingOrders.set(false);
      },
      error: (err) => {
        console.error('Error al cargar historial de pedidos:', err);
        this.loadingOrders.set(false);
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
}
