import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-store-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, FormsModule],
  template: `
    <nav class="minimal-nav">
      <h1>
        <a routerLink="/">
          <img src="logo.png" alt="El Zapatito" class="main-logo">
        </a>
      </h1>
      <div class="links">
        <a routerLink="/catalog">Catálogo</a>
        <a routerLink="/about">Quiénes Somos</a>
        
        @if (auth.isAdmin()) {
          <a routerLink="/admin" class="admin-panel-btn">Panel Admin</a>
        }

        <!-- Botón del Carrito con Badge -->
        <button class="cart-trigger-btn" (click)="toggleCart()">
          <span class="material-icons">shopping_bag</span>
          @if (cart.cartCount() > 0) {
            <span class="cart-badge">{{ cart.cartCount() }}</span>
          }
        </button>
        
        @if (!auth.currentUser()) {
          <a routerLink="/login" class="login-nav-btn">Iniciar Sesión</a>
        } @else {
          <div class="user-menu-container" (click)="toggleDropdown()">
            <div class="avatar">
              {{ auth.currentUser()?.email?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
            
            @if (isDropdownOpen) {
              <div class="dropdown-menu">
                <div class="dropdown-header">
                  <strong>{{ auth.currentUser()?.email }}</strong>
                </div>
                <a routerLink="/profile" class="dropdown-item">Mi Perfil</a>
                <a (click)="auth.logout()" class="dropdown-item logout-link">Salir</a>
              </div>
            }
          </div>
        }
      </div>
    </nav>

    <!-- Backdrop del Carrito -->
    <div class="cart-backdrop" *ngIf="cart.isCartOpen()" (click)="toggleCart()"></div>

    <!-- Drawer del Carrito Slidable -->
    <div class="cart-drawer" [class.open]="cart.isCartOpen()">
      <header class="cart-header">
        <h2>Tu Bolsa</h2>
        <button class="close-drawer-btn" (click)="toggleCart()">
          <span class="material-icons">close</span>
        </button>
      </header>

      <!-- PASO 1: Lista del Carrito -->
      @if (checkoutStep === 'cart') {
        <main class="cart-content">
          @if (cart.cartItems().length === 0) {
            <div class="empty-cart">
              <span class="material-icons empty-icon">shopping_basket</span>
              <p>Tu carrito está vacío</p>
              <button class="btn-shop-now" (click)="toggleCart()" routerLink="/catalog">Ver Catálogo</button>
            </div>
          } @else {
            <div class="cart-items-list">
              <div class="cart-item-card" *ngFor="let item of cart.cartItems()">
                <img [src]="item.product.main_image_url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=200'" [alt]="item.product.name" class="item-img">
                <div class="item-info">
                  <p class="item-brand">{{ item.product.brand || 'El Zapatito' }}</p>
                  <h4 class="item-name">{{ item.product.name }}</h4>
                  <p class="item-size">Talla: <strong>{{ item.size }}</strong></p>
                  <div class="item-controls">
                    <div class="quantity-picker">
                      <button (click)="cart.updateQuantity(item.product.id, item.size, item.quantity - 1)">-</button>
                      <span>{{ item.quantity }}</span>
                      <button (click)="cart.updateQuantity(item.product.id, item.size, item.quantity + 1)">+</button>
                    </div>
                    <button class="btn-remove" (click)="cart.removeFromCart(item.product.id, item.size)">
                      <span class="material-icons">delete_outline</span>
                    </button>
                  </div>
                </div>
                <div class="item-price">
                  {{ (item.unit_price * item.quantity) | currency:'USD' }}
                </div>
              </div>
            </div>
          }
        </main>

        <footer class="cart-footer" *ngIf="cart.cartItems().length > 0">
          <div class="summary-row">
            <span>Subtotal</span>
            <strong>{{ cart.cartTotal() | currency:'USD' }}</strong>
          </div>
          <div class="summary-row">
            <span>Envío</span>
            <span class="free-shipping">Gratis</span>
          </div>
          <hr>
          <div class="summary-row total-row">
            <span>Total</span>
            <strong>{{ cart.cartTotal() | currency:'USD' }}</strong>
          </div>
          <button class="btn-checkout" (click)="proceedToCheckout()">
            Proceder al Pago
          </button>
        </footer>
      }

      <!-- PASO 2: Datos de Envío -->
      @if (checkoutStep === 'shipping') {
        <main class="cart-content">
          <button class="btn-back" (click)="checkoutStep = 'cart'">
            &larr; Volver al carrito
          </button>
          
          <div class="checkout-form-container">
            <h3>Dirección de Envío</h3>
            <p class="checkout-instructions">Por favor, ingresa los detalles del domicilio de entrega para registrar tu pedido.</p>
            
            <textarea 
              [(ngModel)]="shippingAddress" 
              placeholder="Calle, Número, Colonia, Municipio, Estado, Código Postal..."
              rows="4"
              class="address-textarea">
            </textarea>

            @if (orderError) {
              <p class="checkout-error">{{ orderError }}</p>
            }
          </div>
        </main>

        <footer class="cart-footer">
          <div class="summary-row total-row">
            <span>Total a pagar</span>
            <strong>{{ cart.cartTotal() | currency:'USD' }}</strong>
          </div>
          <button 
            class="btn-checkout btn-place-order" 
            [disabled]="isSubmittingOrder || !shippingAddress.trim()"
            (click)="submitOrder()">
            {{ isSubmittingOrder ? 'Procesando...' : 'Confirmar y Pagar' }}
          </button>
        </footer>
      }

      <!-- PASO 3: Éxito -->
      @if (checkoutStep === 'success') {
        <main class="cart-content success-screen">
          <div class="success-illustration">
            <span class="material-icons success-icon">check_circle</span>
          </div>
          <h2>¡Pedido Confirmado!</h2>
          <p class="success-message">Hemos registrado tu compra exitosamente. Tu número de pedido es:</p>
          <code class="order-id-badge">{{ createdOrderId }}</code>
          <p class="success-subtext">El calzado ya está siendo preparado para su envío. ¡Gracias por confiar en El Zapatito!</p>
          <button class="btn-success-close" (click)="closeSuccessCart()">
            Seguir comprando
          </button>
        </main>
      }
    </div>

    <main>
      <router-outlet></router-outlet>
    </main>

    <footer>
      <p>&copy; 2026 El Zapatito - Minimalist Storefront</p>
      <a routerLink="/privacy-policy" class="privacy-link">
        Aviso de Privacidad
      </a>
    </footer>
  `,
  styles: [`
    .minimal-nav { 
      display: flex; 
      justify-content: space-between; 
      padding: 0 2rem; 
      height: 80px; 
      border-bottom: 1px solid #eee; 
      align-items: center; 
      position: sticky;
      top: 0;
      background: #fff;
      z-index: 100;
    }
    .privacy-link {
      display: inline-block;
      margin-top: 0.5rem;
      text-decoration: none;
      color: #666;
      font-size: 0.9rem;
    }
    .privacy-link:hover {
      text-decoration: underline;
    }
    h1 a { text-decoration: none; color: #000; letter-spacing: -1px; display: flex; align-items: center; }
    .main-logo { height: 50px; width: auto; display: block; }
    .links { display: flex; align-items: center; gap: 1.5rem; }
    .links a { text-decoration: none; color: #333; font-weight: 500; cursor: pointer; }
    .admin-panel-btn { background: #000; color: #fff !important; padding: 0.5rem 1rem; border-radius: 4px; }
    .login-nav-btn { border: 1.5px solid #000; padding: 0.5rem 1rem; border-radius: 4px; transition: all 0.2s; }
    .login-nav-btn:hover { background: #000; color: #fff !important; }
    
    main { min-height: 80vh; padding: 2rem; }
    footer { padding: 2rem; text-align: center; border-top: 1px solid #eee; color: #888; }
    
    .user-menu-container { position: relative; cursor: pointer; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; }
    .dropdown-menu { position: absolute; top: 50px; right: 0; background: white; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 200px; overflow: hidden; display: flex; flex-direction: column; z-index: 200; }
    .dropdown-header { padding: 1rem; border-bottom: 1px solid #eee; font-size: 0.9rem; color: #666; background: #fafafa; word-break: break-all; }
    .dropdown-item { padding: 1rem; text-decoration: none; color: #333; transition: background 0.2s; }
    .dropdown-item:hover { background: #f5f5f5; }
    .logout-link { color: #cc0000; border-top: 1px solid #eee; }

    /* Botón Disparador del Carrito */
    .cart-trigger-btn {
      background: transparent;
      border: none;
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      border-radius: 50%;
      transition: background 0.2s;
    }
    .cart-trigger-btn:hover {
      background: #f5f5f5;
    }
    .cart-trigger-btn .material-icons {
      font-size: 1.8rem;
      color: #000;
    }
    .cart-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #cc0000;
      color: #fff;
      font-size: 0.72rem;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Backdrop del Carrito */
    .cart-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(4px);
      z-index: 900;
      animation: fadeIn 0.3s forwards;
    }

    /* Drawer del Carrito */
    .cart-drawer {
      position: fixed;
      top: 0;
      right: -460px; /* Escondido */
      width: 450px;
      max-width: 100vw;
      height: 100vh;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      border-left: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: -10px 0 30px rgba(0,0,0,0.06);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cart-drawer.open {
      right: 0;
    }

    .cart-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cart-header h2 {
      margin: 0;
      font-size: 1.5rem;
      letter-spacing: -0.5px;
    }
    .close-drawer-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      transition: background 0.2s;
    }
    .close-drawer-btn:hover {
      background: rgba(0,0,0,0.05);
    }

    .cart-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
      display: flex;
      flex-direction: column;
    }

    /* Items */
    .cart-items-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .cart-item-card {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      padding-bottom: 1.5rem;
    }
    .item-img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 12px;
      background: #f9f9f9;
    }
    .item-info {
      flex: 1;
    }
    .item-brand {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #999;
      font-weight: 700;
      margin: 0 0 0.25rem;
    }
    .item-name {
      font-size: 0.95rem;
      font-weight: 600;
      margin: 0 0 0.5rem;
    }
    .item-size {
      font-size: 0.8rem;
      color: #666;
      margin: 0 0 0.8rem;
    }
    .item-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .quantity-picker {
      display: flex;
      align-items: center;
      border: 1px solid #ddd;
      border-radius: 20px;
      overflow: hidden;
      background: #fff;
    }
    .quantity-picker button {
      background: none;
      border: none;
      width: 28px;
      height: 28px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.2s;
    }
    .quantity-picker button:hover {
      background: #f5f5f5;
    }
    .quantity-picker span {
      width: 30px;
      text-align: center;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .btn-remove {
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s;
    }
    .btn-remove:hover {
      color: #cc0000;
      background: rgba(204, 0, 0, 0.05);
    }
    .item-price {
      font-weight: 700;
      font-size: 1rem;
    }

    /* Carrito Vacío */
    .empty-cart {
      text-align: center;
      margin: auto 0;
      color: #888;
    }
    .empty-icon {
      font-size: 4rem;
      color: #ddd;
      margin-bottom: 1.5rem;
    }
    .btn-shop-now {
      background: #000;
      color: #fff;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 30px;
      cursor: pointer;
      margin-top: 1.5rem;
      font-weight: 600;
    }

    /* Footer del Carrito */
    .cart-footer {
      padding: 2rem;
      border-top: 1px solid rgba(0,0,0,0.05);
      background: rgba(255,255,255,0.9);
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.8rem;
      color: #666;
    }
    .free-shipping {
      color: #059669;
      font-weight: 600;
    }
    .total-row {
      font-size: 1.25rem;
      color: #000;
      margin-top: 0.8rem;
    }
    .btn-checkout {
      width: 100%;
      background: #000;
      color: #fff;
      border: none;
      padding: 1.2rem;
      border-radius: 12px;
      font-size: 1.05rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
      margin-top: 1.5rem;
    }
    .btn-checkout:hover {
      opacity: 0.9;
    }

    /* Formulario de Checkout */
    .btn-back {
      background: none;
      border: none;
      cursor: pointer;
      font-weight: 600;
      color: #666;
      align-self: flex-start;
      margin-bottom: 2rem;
    }
    .checkout-form-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .checkout-instructions {
      font-size: 0.9rem;
      color: #666;
      line-height: 1.5;
    }
    .address-textarea {
      width: 100%;
      border: 1px solid #ddd;
      border-radius: 12px;
      padding: 1rem;
      font-family: inherit;
      font-size: 0.95rem;
      outline: none;
      resize: none;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .address-textarea:focus {
      border-color: #000;
    }
    .checkout-error {
      color: #cc0000;
      background: #fff0f0;
      padding: 0.8rem;
      border-radius: 8px;
      font-size: 0.88rem;
      margin: 0;
    }
    .btn-place-order:disabled {
      background: #aaa;
      cursor: not-allowed;
    }

    /* Pantalla de Éxito */
    .success-screen {
      text-align: center;
      justify-content: center;
      align-items: center;
      gap: 1rem;
    }
    .success-icon {
      font-size: 5rem;
      color: #059669;
    }
    .success-message {
      color: #666;
      margin-bottom: 0.5rem;
    }
    .order-id-badge {
      display: inline-block;
      background: #f5f5f5;
      padding: 0.5rem 1.5rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: bold;
      border: 1px solid #eee;
      margin-bottom: 1.5rem;
      font-family: monospace;
    }
    .success-subtext {
      font-size: 0.88rem;
      color: #888;
      line-height: 1.5;
      max-width: 320px;
    }
    .btn-success-close {
      background: #000;
      color: #fff;
      border: none;
      padding: 1rem 2rem;
      border-radius: 30px;
      cursor: pointer;
      font-weight: 600;
      margin-top: 1.5rem;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class StoreLayoutComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  orderService = inject(OrderService);

  isDropdownOpen = false;

  // Checkout flow state
  checkoutStep: 'cart' | 'shipping' | 'success' = 'cart';
  shippingAddress = '';
  isSubmittingOrder = false;
  createdOrderId = '';
  orderError = '';

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleCart() {
    this.cart.isCartOpen.set(!this.cart.isCartOpen());
    if (this.cart.isCartOpen()) {
      // Reiniciar estado del checkout al abrir
      this.checkoutStep = 'cart';
      this.orderError = '';
    }
  }

  proceedToCheckout() {
    if (!this.auth.currentUser()) {
      this.toggleCart();
      // Opcional: Redirigir a login
      alert('Por favor, inicia sesión para completar tu compra.');
      // O directamente navegar
      return;
    }
    this.checkoutStep = 'shipping';
  }

  submitOrder() {
    if (!this.shippingAddress.trim()) {
      this.orderError = 'Por favor ingresa una dirección de envío.';
      return;
    }

    this.isSubmittingOrder = true;
    this.orderError = '';

    const orderData = {
      shipping_address: this.shippingAddress,
      items: this.cart.cartItems().map(item => ({
        product_id: item.product.id,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (res) => {
        this.createdOrderId = res.id;
        this.cart.clearCart();
        this.checkoutStep = 'success';
        this.isSubmittingOrder = false;
        this.shippingAddress = '';
      },
      error: (err) => {
        console.error('Error al registrar el pedido:', err);
        this.orderError = err?.error?.detail || 'Error al procesar el pedido. Revisa el stock disponible de las tallas.';
        this.isSubmittingOrder = false;
      }
    });
  }

  closeSuccessCart() {
    this.cart.isCartOpen.set(false);
    this.checkoutStep = 'cart';
  }
}
