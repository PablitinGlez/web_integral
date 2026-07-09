import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';

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
    @if (cart.isCartOpen()) {
      <div class="cart-backdrop" (click)="toggleCart()"></div>
    }

    <!-- Drawer del Carrito Slidable -->
    <div class="cart-drawer" [class.open]="cart.isCartOpen()">
      <header class="cart-header">
        <h2>Tu Bolsa</h2>
        <button class="close-drawer-btn" (click)="toggleCart()">
          <span class="material-icons">close</span>
        </button>
      </header>

      <!-- Lista del Carrito -->
      <main class="cart-content">
        @if (cart.cartItems().length === 0) {
          <div class="empty-cart">
            <span class="material-icons empty-icon">shopping_basket</span>
            <p>Tu carrito está vacío</p>
            <button class="btn-shop-now" (click)="toggleCart()" routerLink="/catalog">Ver Catálogo</button>
          </div>
        } @else {
          <div class="cart-items-list">
            @for (item of cart.cartItems(); track item.product.id + '-' + item.size) {
              <div class="cart-item-card">
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
            }
          </div>
        }
      </main>

      @if (cart.cartItems().length > 0) {
        <footer class="cart-footer">
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
      overflow: hidden;
      box-sizing: border-box;
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
      min-height: 0;
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

    /* Direcciones en Checkout */
    .address-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      color: #888;
    }
    .mini-spinner {
      border: 2px solid #f3f3f3;
      border-top: 2px solid #000;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
      margin-bottom: 0.5rem;
    }
    .no-addresses-checkout {
      text-align: center;
      padding: 2rem 1rem;
      border: 1px dashed #ddd;
      border-radius: 12px;
      background: #fafafa;
    }
    .no-addresses-checkout p {
      margin: 0 0 1rem;
      color: #666;
      font-size: 0.92rem;
    }
    .btn-add-first-address {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #000;
      color: #fff;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.88rem;
    }
    .address-options-list {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      margin-bottom: 1.5rem;
    }
    .address-option-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      border: 1px solid #eee;
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      background: #fafafa;
      transition: all 0.2s ease;
    }
    .address-option-card:hover {
      border-color: #bbb;
      background: #fdfdfd;
    }
    .address-option-card.selected {
      border-color: #000;
      background: #fff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }
    .card-radio-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 20px;
      width: 20px;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }
    .custom-radio {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #ccc;
      display: inline-block;
      position: relative;
      transition: all 0.2s;
    }
    .address-option-card.selected .custom-radio {
      border-color: #000;
    }
    .custom-radio.checked::after {
      content: '';
      width: 8px;
      height: 8px;
      background: #000;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .card-details {
      flex: 1;
      text-align: left;
    }
    .card-header-addr {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }
    .card-header-addr strong {
      font-size: 0.95rem;
      color: #000;
    }
    .default-tag {
      background: #f0f0f0;
      color: #666;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 10px;
      text-transform: uppercase;
    }
    .addr-text-line {
      margin: 0;
      font-size: 0.88rem;
      color: #333;
    }
    .addr-subtext-line {
      margin: 0.15rem 0 0;
      font-size: 0.82rem;
      color: #666;
    }
    .addr-phone-line {
      margin: 0.25rem 0 0;
      font-size: 0.82rem;
      color: #888;
    }
    .btn-add-address-checkout {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      background: none;
      border: 1px dashed #ccc;
      color: #555;
      width: 100%;
      padding: 0.8rem;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.88rem;
      transition: all 0.2s;
    }
    .btn-add-address-checkout:hover {
      border-color: #000;
      color: #000;
      background: #fafafa;
    }

    /* Formulario en Checkout */
    .address-form-checkout {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background: #fafafa;
      border: 1px solid #eee;
      border-radius: 12px;
      padding: 1.2rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.8rem;
    }
    .form-row.three-cols {
      grid-template-columns: 1fr 1fr 1fr;
    }
    @media (max-width: 480px) {
      .form-row, .form-row.three-cols {
        grid-template-columns: 1fr;
      }
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      text-align: left;
    }
    .form-field label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #555;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .form-field input {
      width: 100%;
      padding: 0.7rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.9rem;
      box-sizing: border-box;
    }
    .form-field input:focus {
      border-color: #000;
      outline: none;
    }
    .address-error {
      color: #cc0000;
      font-size: 0.85rem;
      margin: 0;
      text-align: left;
    }
    .form-actions {
      display: flex;
      gap: 0.6rem;
      margin-top: 0.5rem;
    }
    .btn-cancel {
      flex: 1;
      background: #eee;
      color: #333;
      border: none;
      padding: 0.7rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-save-addr {
      flex: 1;
      background: #000;
      color: #fff;
      border: none;
      padding: 0.7rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-save-addr:disabled, .btn-cancel:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class StoreLayoutComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  private router = inject(Router);

  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleCart() {
    this.cart.isCartOpen.set(!this.cart.isCartOpen());
  }

  proceedToCheckout() {
    if (!this.auth.currentUser()) {
      this.toggleCart();
      alert('Por favor, inicia sesión para completar tu compra.');
      return;
    }
    this.toggleCart(); // Cierra el carrito
    this.router.navigate(['/checkout']);
  }
}
