import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { AddressService, Address, AddressInput } from '../../../services/address.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="checkout-page-container">
      @if (checkoutStep === 'success') {
        <!-- Pantalla de Éxito -->
        <div class="success-container">
          <div class="success-card">
            <span class="material-icons success-icon">check_circle</span>
            <h2>¡Pedido completado con éxito!</h2>
            <p class="success-msg">Tu pago ha sido procesado de manera segura.</p>
            
            <div class="order-info-box">
              <p>ID del Pedido:</p>
              <code class="order-id">{{ createdOrderId }}</code>
            </div>
            
            <p class="success-subtext">Puedes ver los detalles de tu compra y su estado en la sección de historial en tu perfil.</p>
            
            <div class="success-actions">
              <button routerLink="/profile" class="btn-action-primary">Ir a mi Perfil</button>
              <button routerLink="/catalog" class="btn-action-secondary">Seguir Comprando</button>
            </div>
          </div>
        </div>
      } @else {
        <!-- Contenido principal del Checkout -->
        <div class="checkout-content">
          <div class="checkout-grid">
            <!-- Columna Izquierda: Dirección y Método de Pago -->
            <div class="checkout-main-col">
              
              <!-- SECCIÓN 1: Dirección de Envío -->
              <div class="checkout-section-card">
                <div class="section-header">
                  <div class="header-title-wrapper">
                    <span class="section-num">1</span>
                    <h2>Dirección de Envío</h2>
                  </div>
                  
                  @if (selectedAddress && !isEditingAddress && !isAddingAddress) {
                    <button class="btn-change-section" (click)="toggleChangeAddress()">
                      Cambiar
                    </button>
                  }
                </div>

                <div class="section-body">
                  @if (isAddingAddress) {
                    <!-- Formulario agregar dirección -->
                    <div class="address-form-title-row">
                      <h3>Agregar una nueva dirección</h3>
                    </div>
                    
                    <div class="address-form">
                      <div class="form-row">
                        <div class="form-field">
                          <label>Nombre / Alias (Ej. Casa, Trabajo)</label>
                          <input type="text" [(ngModel)]="addressForm.label" placeholder="Nombre para identificar" [disabled]="savingAddress">
                        </div>
                        <div class="form-field">
                          <label>Teléfono</label>
                          <input type="tel" [(ngModel)]="addressForm.phone" placeholder="10 dígitos" [disabled]="savingAddress">
                        </div>
                      </div>
                      <div class="form-field">
                        <label>Calle y Número</label>
                        <input type="text" [(ngModel)]="addressForm.street" placeholder="Calle, número exterior e interior" [disabled]="savingAddress">
                      </div>
                      <div class="form-row three-cols">
                        <div class="form-field">
                          <label>Ciudad</label>
                          <input type="text" [(ngModel)]="addressForm.city" placeholder="Ciudad" [disabled]="savingAddress">
                        </div>
                        <div class="form-field">
                          <label>Estado</label>
                          <input type="text" [(ngModel)]="addressForm.state" placeholder="Estado" [disabled]="savingAddress">
                        </div>
                        <div class="form-field">
                          <label>Código Postal</label>
                          <input type="text" [(ngModel)]="addressForm.zip_code" placeholder="C.P." [disabled]="savingAddress">
                        </div>
                      </div>
                      
                      @if (addressError) {
                        <p class="error-text">{{ addressError }}</p>
                      }
                      
                      <div class="form-actions">
                        <button class="btn-cancel-addr" (click)="cancelAddAddress()" [disabled]="savingAddress">Cancelar</button>
                        <button class="btn-save-addr" (click)="saveNewAddress()" [disabled]="savingAddress">
                          {{ savingAddress ? 'Guardando...' : 'Guardar dirección' }}
                        </button>
                      </div>
                    </div>
                  } @else if (isEditingAddress || !selectedAddress) {
                    <!-- Listado de direcciones para elegir -->
                    @if (addressService.loading()) {
                      <div class="loading-state">
                        <div class="mini-spinner"></div>
                        <p>Cargando tus direcciones...</p>
                      </div>
                    } @else if (addressService.addresses().length === 0) {
                      <div class="no-address-state">
                        <p>No tienes ninguna dirección registrada en tu cuenta.</p>
                        <button class="btn-add-address" (click)="startAddAddress()">
                          + Agregar primera dirección
                        </button>
                      </div>
                    } @else {
                      <p class="select-instructions">Selecciona una dirección de entrega:</p>
                      <div class="address-list">
                        @for (addr of addressService.addresses(); track addr.id) {
                          <div class="address-item" 
                               [class.active]="selectedAddressId === addr.id" 
                               (click)="selectAddress(addr)">
                            <div class="radio-indicator">
                              <span class="radio-dot" [class.checked]="selectedAddressId === addr.id"></span>
                            </div>
                            <div class="address-details">
                              <div class="address-label">
                                <strong>{{ addr.label }}</strong>
                                @if (addr.is_default) {
                                  <span class="default-badge">Principal</span>
                                }
                              </div>
                              <p class="address-text">{{ addr.street }}, {{ addr.city }}, {{ addr.state || '' }} C.P. {{ addr.zip_code || '' }}</p>
                              @if (addr.phone) {
                                <p class="address-phone">Teléfono: {{ addr.phone }}</p>
                              }
                            </div>
                          </div>
                        }
                      </div>
                      <div class="address-list-actions">
                        <button class="btn-add-address" (click)="startAddAddress()">
                          + Agregar nueva dirección
                        </button>
                        @if (selectedAddress) {
                          <button class="btn-confirm-selection" (click)="isEditingAddress = false">
                            Usar esta dirección
                          </button>
                        }
                      </div>
                    }
                  } @else {
                    <!-- Dirección seleccionada (Vista estática) -->
                    <div class="selected-address-summary">
                      <div class="summary-details">
                        <p class="user-name"><strong>Enviar a:</strong> {{ auth.currentUser()?.fullName || 'Cliente' }}</p>
                        <p class="addr-line">{{ selectedAddress.street }}</p>
                        <p class="addr-line">{{ selectedAddress.city }}, {{ selectedAddress.state || '' }} C.P. {{ selectedAddress.zip_code || '' }}</p>
                        @if (selectedAddress.phone) {
                          <p class="addr-phone"><strong>Teléfono:</strong> {{ selectedAddress.phone }}</p>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- SECCIÓN 2: Método de Pago -->
              <div class="checkout-section-card" [class.disabled-section]="!selectedAddress || isEditingAddress || isAddingAddress">
                <div class="section-header">
                  <div class="header-title-wrapper">
                    <span class="section-num">2</span>
                    <h2>Método de Pago</h2>
                  </div>
                </div>
                
                <div class="section-body">
                  @if (!selectedAddress) {
                    <p class="select-address-msg">Primero selecciona o agrega una dirección de envío para continuar con el pago.</p>
                  } @else if (isEditingAddress || isAddingAddress) {
                    <p class="select-address-msg">Confirma tu dirección de envío para habilitar la pasarela de pago.</p>
                  } @else {
                    <div class="amazon-payment-box">
                      <!-- 1. Mis tarjetas -->
                      <div class="payment-group">
                        <h4 class="group-title">Mis tarjetas</h4>
                        <p class="no-cards-msg">No tienes tarjetas registradas.</p>
                        
                        <div class="add-method-row">
                          <span class="plus-icon">+</span>
                          <img src="https://img.icons8.com/color/48/card-exchange.png" alt="Card" class="add-icon-img">
                          <a href="#" class="add-link">Agregar una tarjeta de crédito o débito</a>
                          <span class="add-desc">El Zapatito acepta las principales tarjetas de crédito</span>
                        </div>
                      </div>

                      <hr class="payment-group-divider">

                      <!-- 2. Tus servicios de pago -->
                      <div class="payment-group">
                        <h4 class="group-title">Tus servicios de pago</h4>
                        
                        <!-- PayPal (Funcional) -->
                        <div class="payment-row active-method-row">
                          <label class="row-label">
                            <input type="radio" name="payment_method_option" checked>
                            <span class="custom-radio checked"></span>
                            <img src="https://img.icons8.com/color/48/paypal.png" alt="PayPal" class="card-type-icon">
                            <span class="card-desc"><strong>Pagar con PayPal o Tarjeta de Crédito/Débito</strong><br><small class="free-shipping-note">Procesamiento seguro e inmediato</small></span>
                          </label>
                          
                          <!-- Contenedor del Botón de PayPal -->
                          <div class="paypal-buttons-inline-wrapper">
                            <div id="paypal-button-container" class="paypal-buttons-wrapper"></div>
                          </div>
                        </div>

                        <!-- Paga en efectivo (Mock) -->
                        <div class="payment-row disabled-method-row">
                          <label class="row-label">
                            <input type="radio" name="payment_method_option" disabled>
                            <span class="custom-radio disabled"></span>
                            <img src="https://img.icons8.com/color/48/cash-in-hand.png" alt="Cash" class="card-type-icon">
                            <span class="card-desc"><strong>Paga en efectivo en tienda</strong><br><small class="cash-note">Paga antes de 72 horas</small></span>
                          </label>
                          <span class="cash-details">
                            <a href="#" class="collapse-link">Paga en OXXO, 7-Eleven, +5 tiendas <span class="material-icons arrow">keyboard_arrow_down</span></a>
                          </span>
                        </div>
                      </div>

                      <hr class="payment-group-divider">

                      <!-- 3. Tu saldo disponible -->
                      <div class="payment-group">
                        <h4 class="group-title">Tu saldo disponible</h4>
                        <div class="coupon-row">
                          <span class="plus-icon">+</span>
                          <div class="coupon-input-wrapper">
                            <label>Ingresa un código de tarjeta de regalo o de promoción</label>
                            <div class="input-btn-row">
                              <input type="text" [(ngModel)]="couponCode" placeholder="Introducir código">
                              <button class="btn-apply-coupon" (click)="applyCoupon()">Aplicar</button>
                            </div>
                            @if (couponMessage) {
                              <p class="coupon-message" [class.success-message]="couponApplied">{{ couponMessage }}</p>
                            }
                          </div>
                        </div>
                      </div>

                      <hr class="payment-group-divider">

                      <!-- 4. Planes de Pago -->
                      <div class="payment-group">
                        <h4 class="group-title">Planes de Pago</h4>
                        <div class="add-method-row">
                          <span class="plus-icon">+</span>
                          <img src="https://img.icons8.com/color/48/deposit.png" alt="Kueski" class="add-icon-img">
                          <a href="#" class="add-link">Paga en quincenas con Kueski Pay &gt;</a>
                          <span class="add-desc">Hasta 12 pagos quincenales, sin tarjeta. <a href="#">Conocer más</a></span>
                        </div>
                      </div>

                      <hr class="payment-group-divider">

                      <!-- 5. Otros métodos de pago -->
                      <div class="payment-group">
                        <h4 class="group-title">Otros métodos de pago</h4>
                        <div class="add-method-row">
                          <span class="plus-icon">+</span>
                          <a href="#" class="add-link">Agregar un nuevo vale de despensa &gt;</a>
                          <span class="add-desc">Usa tus vales de despensa de SiVale y Pluxee para comprar artículos elegibles.</span>
                        </div>
                      </div>

                      @if (orderError) {
                        <p class="payment-error-msg">
                          <span class="material-icons text-icon">error</span> {{ orderError }}
                        </p>
                      }
                      
                      @if (isSubmittingOrder) {
                        <div class="processing-order-loader">
                          <div class="mini-spinner"></div>
                          <p>Registrando y confirmando tu pedido, por favor no cierres esta pestaña...</p>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>

            </div>

            <!-- Columna Derecha: Resumen de Compra -->
            <div class="checkout-sidebar-col">
              <div class="summary-card">
                <h3>Resumen del Pedido</h3>
                
                <div class="summary-details-list">
                  <div class="summary-item">
                    <span>Productos ({{ cart.cartCount() }}):</span>
                    <span>{{ cart.cartTotal() | currency:'USD' }}</span>
                  </div>
                  <div class="summary-item">
                    <span>Envío:</span>
                    <span class="free-badge">GRATIS</span>
                  </div>
                  
                  <hr class="summary-divider">
                  
                  <div class="summary-total">
                    <span>Total a pagar:</span>
                    <span class="total-amount">{{ cart.cartTotal() | currency:'USD' }}</span>
                  </div>
                </div>

                <p class="tax-instructions">El precio incluye IVA (en caso de ser aplicable).</p>

                <!-- Listado de artículos en el carrito -->
                <div class="checkout-items-preview">
                  <h4>Artículos en tu bolsa</h4>
                  <div class="preview-list">
                    @for (item of cart.cartItems(); track item.product.id + '-' + item.size) {
                      <div class="preview-item">
                        <img [src]="item.product.main_image_url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=150'" [alt]="item.product.name" class="preview-img">
                        <div class="preview-info">
                          <p class="preview-name">{{ item.product.name }}</p>
                          <p class="preview-details">Talla: {{ item.size }} &middot; Cantidad: {{ item.quantity }}</p>
                          <p class="preview-price">{{ (item.unit_price * item.quantity) | currency:'USD' }}</p>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-page-container {
      min-height: 100vh;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
      font-family: inherit;
      color: #0f172a;
      padding-bottom: 4rem;
    }

    /* Contenido */
    .checkout-content {
      max-width: 1180px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
    }

    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 2rem;
      align-items: start;
    }
    @media (max-width: 900px) {
      .checkout-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    /* Columnas y Secciones */
    .checkout-main-col {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .checkout-section-card {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.06);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.02), 0 2px 8px -1px rgba(0, 0, 0, 0.01);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .checkout-section-card:hover {
      box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.04), 0 4px 12px -2px rgba(0, 0, 0, 0.02);
    }

    .disabled-section {
      opacity: 0.6;
      pointer-events: none;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 1rem;
    }
    .header-title-wrapper {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .section-num {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
    }
    .section-header h2 {
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .btn-change-section {
      background: #eff6ff;
      border: none;
      color: #2563eb;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-change-section:hover {
      background: #dbeafe;
      color: #1d4ed8;
      transform: translateY(-1px);
    }

    .section-body {
      padding-left: 0;
    }

    /* Listado de direcciones */
    .select-instructions {
      font-size: 0.95rem;
      margin: 0 0 1.2rem;
      color: #475569;
      text-align: left;
    }
    .address-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .address-item {
      display: flex;
      align-items: flex-start;
      gap: 1.2rem;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.2rem;
      cursor: pointer;
      background: #ffffff;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .address-item:hover {
      border-color: #cbd5e1;
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.04);
    }
    .address-item.active {
      border-color: #3b82f6;
      border-width: 2px;
      background: #f8fafc;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    .radio-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 20px;
    }
    .radio-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid #cbd5e1;
      display: inline-block;
      position: relative;
      background: #fff;
      transition: all 0.2s;
    }
    .radio-dot.checked {
      border-color: #2563eb;
      background: #fff;
    }
    .radio-dot.checked::after {
      content: '';
      width: 10px;
      height: 10px;
      background: #2563eb;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .address-details {
      flex: 1;
      text-align: left;
    }
    .address-label {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.4rem;
    }
    .address-label strong {
      font-size: 1rem;
      color: #0f172a;
    }
    .default-badge {
      background: #f0fdf4;
      color: #166534;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 12px;
      border: 1px solid #bbf7d0;
    }
    .address-text {
      margin: 0 0 0.25rem;
      font-size: 0.9rem;
      color: #475569;
      line-height: 1.5;
    }
    .address-phone {
      margin: 0;
      font-size: 0.85rem;
      color: #64748b;
    }

    .address-list-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-start;
      margin-top: 1.5rem;
    }
    .btn-add-address {
      background: #ffffff;
      border: 1px dashed #cbd5e1;
      color: #475569;
      padding: 0.7rem 1.2rem;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .btn-add-address:hover {
      border-color: #3b82f6;
      color: #2563eb;
      background: #eff6ff;
    }
    .btn-confirm-selection {
      background: #2563eb;
      border: 1px solid #1d4ed8;
      color: #ffffff;
      padding: 0.7rem 1.5rem;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
    }
    .btn-confirm-selection:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);
    }

    /* Vista estática de dirección seleccionada */
    .selected-address-summary {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.2rem;
      text-align: left;
    }
    .user-name {
      margin: 0 0 0.5rem;
      font-size: 0.95rem;
      color: #0f172a;
    }
    .addr-line {
      margin: 0 0 0.3rem;
      font-size: 0.9rem;
      color: #475569;
    }

    /* Formulario para agregar dirección */
    .address-form {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 1rem;
    }
    .form-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      text-align: left;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .three-cols {
      grid-template-columns: 1fr 1fr 1fr;
    }
    @media (max-width: 600px) {
      .form-row, .three-cols {
        grid-template-columns: 1fr;
      }
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      text-align: left;
    }
    .form-field label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #475569;
    }
    .form-field input {
      padding: 0.65rem 0.8rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
      background: #ffffff;
      transition: all 0.2s;
    }
    .form-field input:focus {
      border-color: #3b82f6;
      outline: none;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 0.5rem;
    }
    .btn-cancel-addr {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #475569;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.88rem;
      transition: all 0.2s;
    }
    .btn-cancel-addr:hover {
      background: #f1f5f9;
    }
    .btn-save-addr {
      background: #2563eb;
      border: 1px solid #1d4ed8;
      color: #ffffff;
      padding: 0.6rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.88rem;
      transition: all 0.2s;
    }
    .btn-save-addr:hover {
      background: #1d4ed8;
    }
    .error-text {
      color: #dc2626;
      font-size: 0.85rem;
      margin: 0;
      text-align: left;
    }

    /* Mensaje de dirección requerida */
    .select-address-msg {
      font-size: 0.95rem;
      color: #64748b;
      margin: 0;
      text-align: left;
    }

    /* Diseño de métodos de pago estilo Amazon pero Premium */
    .amazon-payment-box {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      background-color: #f8fafc;
    }
    .payment-group {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    .group-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem;
      text-align: left;
      letter-spacing: -0.01em;
    }
    .no-cards-msg {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0 0 0.5rem 0.5rem;
      text-align: left;
    }

    .payment-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.2rem;
      background: #ffffff;
      gap: 1rem;
      flex-wrap: wrap;
      transition: all 0.2s;
    }
    .active-method-row {
      border-color: #eab308;
      background: #fdfaf2;
      box-shadow: 0 4px 15px rgba(234, 179, 8, 0.08);
    }
    .disabled-method-row {
      opacity: 0.65;
    }

    .row-label {
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      flex: 1;
      min-width: 250px;
      text-align: left;
    }
    .row-label input[type="radio"] {
      display: none;
    }
    .custom-radio {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid #cbd5e1;
      display: inline-block;
      position: relative;
      flex-shrink: 0;
      background: #fff;
    }
    .custom-radio.checked {
      border-color: #d97706;
    }
    .custom-radio.checked::after {
      content: '';
      width: 10px;
      height: 10px;
      background: #d97706;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .custom-radio.disabled {
      border-color: #e2e8f0;
      background-color: #f1f5f9;
    }

    .card-type-icon {
      width: 42px;
      height: 42px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .card-desc {
      font-size: 0.9rem;
      color: #334155;
      line-height: 1.5;
    }
    .card-desc strong {
      color: #0f172a;
    }
    .free-shipping-note, .cash-note {
      color: #64748b;
      font-size: 0.82rem;
    }

    .add-method-row {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      font-size: 0.9rem;
      padding-left: 0.5rem;
      text-align: left;
      flex-wrap: wrap;
    }
    .plus-icon {
      font-size: 1.4rem;
      color: #94a3b8;
      font-weight: 300;
    }
    .add-icon-img {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }
    .add-link {
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s;
    }
    .add-link:hover {
      text-decoration: underline;
      color: #1d4ed8;
    }
    .add-desc {
      color: #64748b;
      font-size: 0.85rem;
    }

    .payment-group-divider {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 1.8rem 0;
    }

    .paypal-buttons-inline-wrapper {
      width: 100%;
      margin-top: 1.2rem;
      padding-left: 3rem;
    }
    @media (max-width: 480px) {
      .paypal-buttons-inline-wrapper {
        padding-left: 0;
      }
    }

    .cash-details {
      font-size: 0.85rem;
    }
    .collapse-link {
      color: #2563eb;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.1rem;
      font-weight: 500;
    }
    .collapse-link:hover {
      text-decoration: underline;
    }
    .collapse-link .arrow {
      font-size: 1.1rem;
    }

    /* Cupones */
    .coupon-row {
      display: flex;
      align-items: flex-start;
      gap: 0.8rem;
      padding-left: 0.5rem;
    }
    .coupon-input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      text-align: left;
      flex: 1;
    }
    .coupon-input-wrapper label {
      font-size: 0.9rem;
      color: #475569;
      font-weight: 500;
    }
    .input-btn-row {
      display: flex;
      gap: 0.6rem;
      max-width: 380px;
    }
    .input-btn-row input {
      flex: 1;
      padding: 0.6rem 0.8rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
      background: #ffffff;
    }
    .input-btn-row input:focus {
      border-color: #3b82f6;
      outline: none;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
    }
    .btn-apply-coupon {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #334155;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.88rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-apply-coupon:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
    }

    /* Errores y Carga */
    .payment-error-msg {
      color: #dc2626;
      font-size: 0.88rem;
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      text-align: left;
    }
    .text-icon {
      font-size: 1.1rem;
    }

    .processing-order-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.8rem;
      margin-top: 1.5rem;
      padding: 1rem;
      background: #eff6ff;
      border-radius: 8px;
      color: #1e40af;
    }
    .processing-order-loader p {
      margin: 0;
      font-size: 0.88rem;
      font-weight: 500;
    }

    /* Columna Derecha: Resumen */
    .summary-card {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.06);
      border-radius: 16px;
      padding: 1.8rem;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.02), 0 2px 8px -1px rgba(0, 0, 0, 0.01);
      position: sticky;
      top: 2rem;
    }
    .summary-card h3 {
      font-size: 1.2rem;
      font-weight: 700;
      margin: 0 0 1.2rem;
      color: #0f172a;
      text-align: left;
      letter-spacing: -0.01em;
    }

    .summary-details-list {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      margin-bottom: 1.2rem;
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: #475569;
    }
    .free-badge {
      color: #15803d;
      font-weight: 700;
    }
    .summary-divider {
      border: none;
      border-top: 1px solid #f1f5f9;
      margin: 0.8rem 0;
    }
    .summary-total {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .summary-total span:first-child {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
    }
    .total-amount {
      font-size: 1.35rem;
      font-weight: 800;
      color: #b45309; /* Warm amber */
    }

    .tax-instructions {
      font-size: 0.78rem;
      color: #64748b;
      margin: 0 0 1.5rem;
      text-align: left;
      line-height: 1.4;
    }

    /* Vista previa de artículos */
    .checkout-items-preview {
      border-top: 1px solid #f1f5f9;
      padding-top: 1.2rem;
      text-align: left;
    }
    .checkout-items-preview h4 {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 1rem;
    }
    .preview-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: 280px;
      overflow-y: auto;
      padding-right: 0.3rem;
    }
    .preview-list::-webkit-scrollbar {
      width: 4px;
    }
    .preview-list::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 2px;
    }
    .preview-item {
      display: flex;
      gap: 0.8rem;
      align-items: center;
    }
    .preview-img {
      width: 52px;
      height: 52px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    .preview-info {
      flex: 1;
      min-width: 0;
    }
    .preview-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 0.15rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .preview-details {
      margin: 0;
      font-size: 0.78rem;
      color: #64748b;
    }
    .preview-price {
      margin: 0;
      font-size: 0.82rem;
      font-weight: 700;
      color: #0f172a;
    }

    /* Éxito */
    .success-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5rem 1.5rem;
    }
    .success-card {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.06);
      border-radius: 24px;
      padding: 3.5rem 2.5rem;
      text-align: center;
      max-width: 520px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
      animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes popIn {
      0% { transform: scale(0.9); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    .success-icon {
      font-size: 5rem;
      color: #10b981;
      margin-bottom: 1.5rem;
      filter: drop-shadow(0 4px 10px rgba(16, 185, 129, 0.2));
    }
    .success-card h2 {
      font-size: 1.6rem;
      font-weight: 800;
      margin: 0 0 0.8rem;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .success-msg {
      font-size: 1rem;
      color: #475569;
      margin-bottom: 1.8rem;
      line-height: 1.5;
    }
    .order-info-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 1rem;
      border-radius: 12px;
      margin-bottom: 1.8rem;
    }
    .order-info-box p {
      margin: 0 0 0.3rem;
      font-size: 0.78rem;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .order-id {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
      font-family: monospace;
    }
    .success-subtext {
      font-size: 0.88rem;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 2.2rem;
    }
    .success-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .btn-action-primary {
      background: #2563eb;
      border: 1px solid #1d4ed8;
      padding: 0.8rem 1.8rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      color: #ffffff;
      font-size: 0.9rem;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
    }
    .btn-action-primary:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);
    }
    .btn-action-secondary {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 0.8rem 1.8rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      color: #475569;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .btn-action-secondary:hover {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1.5rem;
      background-color: #fcfcfc;
    }
    .payment-group {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    .group-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #111;
      margin: 0 0 0.5rem;
      text-align: left;
    }
    .group-headers {
      display: flex;
      justify-content: flex-end;
      font-size: 0.78rem;
      color: #666;
      border-bottom: 1px solid #eee;
      padding-bottom: 0.4rem;
      margin-bottom: 0.2rem;
    }
    .hdr-name {
      margin-right: 120px;
    }
    .hdr-expiry {
      margin-right: 60px;
    }
    @media (max-width: 600px) {
      .group-headers {
        display: none;
      }
    }

    .payment-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      background: #fff;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .expired-card-row {
      background: #fbfbfb;
      opacity: 0.85;
    }
    .active-method-row {
      border-color: #f0c14b;
      background: #fdfaf2;
      box-shadow: 0 0 4px rgba(240, 193, 75, 0.4);
    }
    .disabled-method-row {
      opacity: 0.7;
    }

    .row-label {
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      flex: 1;
      min-width: 250px;
      text-align: left;
    }
    .row-label input[type="radio"] {
      display: none;
    }
    .custom-radio {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid #888;
      display: inline-block;
      position: relative;
      flex-shrink: 0;
    }
    .custom-radio.checked {
      border-color: #e77600;
    }
    .custom-radio.checked::after {
      content: '';
      width: 10px;
      height: 10px;
      background: #e77600;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .custom-radio.disabled {
      border-color: #ccc;
      background-color: #f1f1f1;
    }

    .card-type-icon {
      width: 40px;
      height: 40px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .card-desc {
      font-size: 0.9rem;
      color: #333;
      line-height: 1.4;
    }
    .no-installments {
      color: #666;
    }
    .no-installments a {
      color: #0066c0;
      text-decoration: none;
    }
    .no-installments a:hover {
      text-decoration: underline;
    }

    .card-owner {
      font-size: 0.9rem;
      color: #333;
      width: 150px;
      text-align: left;
    }
    @media (max-width: 600px) {
      .card-owner {
        width: 100%;
      }
    }

    .card-expiry-error {
      color: #c40000;
      font-weight: 700;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      width: 120px;
      text-align: left;
    }
    .warning-circle {
      font-size: 1.1rem;
    }
    .card-edit-action {
      font-size: 0.9rem;
    }
    .edit-link {
      color: #0066c0;
      text-decoration: none;
    }
    .edit-link:hover {
      text-decoration: underline;
    }

    .add-method-row {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      font-size: 0.9rem;
      padding-left: 0.5rem;
      text-align: left;
      flex-wrap: wrap;
    }
    .plus-icon {
      font-size: 1.5rem;
      color: #888;
      font-weight: 300;
      line-height: 1;
    }
    .add-icon-img {
      width: 28px;
      height: 28px;
      object-fit: contain;
    }
    .add-link {
      color: #0066c0;
      text-decoration: none;
      font-weight: 600;
    }
    .add-link:hover {
      text-decoration: underline;
      color: #c45500;
    }
    .add-desc {
      color: #666;
    }

    .payment-group-divider {
      border: none;
      border-top: 1px solid #ddd;
      margin: 1.5rem 0;
    }

    .paypal-buttons-inline-wrapper {
      width: 100%;
      margin-top: 1rem;
      padding-left: 2.8rem;
    }
    @media (max-width: 480px) {
      .paypal-buttons-inline-wrapper {
        padding-left: 0;
      }
    }

    .free-shipping-note, .cash-note {
      color: #666;
    }

    .cash-details {
      font-size: 0.85rem;
    }
    .collapse-link {
      color: #0066c0;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.1rem;
    }
    .collapse-link:hover {
      text-decoration: underline;
    }
    .collapse-link .arrow {
      font-size: 1.1rem;
    }

    /* Cupones */
    .coupon-row {
      display: flex;
      align-items: flex-start;
      gap: 0.8rem;
      padding-left: 0.5rem;
    }
    .coupon-input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      text-align: left;
      flex: 1;
    }
    .coupon-input-wrapper label {
      font-size: 0.9rem;
      color: #333;
    }
    .input-btn-row {
      display: flex;
      gap: 0.5rem;
      max-width: 350px;
    }
    .input-btn-row input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #a6a6a6;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    .input-btn-row input:focus {
      border-color: #e77600;
      outline: none;
      box-shadow: 0 0 3px rgba(228,121,17,0.5);
    }
    .btn-apply-coupon {
      background: #f0c14b;
      border: 1px solid #a88734;
      color: #111;
      padding: 0.5rem 1.2rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.88rem;
      font-weight: 600;
    }
    .btn-apply-coupon:hover {
      background: #ddb347;
    }
    .no-cards-msg {
      font-size: 0.9rem;
      color: #666;
      margin: 0 0 0.5rem 0.5rem;
      text-align: left;
    }
  `]
})
export class CheckoutComponent implements OnInit {
  auth = inject(AuthService);
  cart = inject(CartService);
  orderService = inject(OrderService);
  addressService = inject(AddressService);
  private router = inject(Router);

  checkoutStep: 'shipping' | 'success' = 'shipping';
  createdOrderId = '';
  orderError = '';
  isSubmittingOrder = false;

  selectedAddress: Address | null = null;
  selectedAddressId: string | null = null;
  isEditingAddress = false;
  isAddingAddress = false;
  savingAddress = false;
  addressError = '';
  shippingAddress = '';
  couponCode = '';
  couponMessage = '';
  couponApplied: any = null;
  discountAmount = 0;

  addressForm: AddressInput = {
    label: '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    phone: ''
  };

  async ngOnInit() {
    await this.auth.waitForAuthInit();
    const user = this.auth.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.cart.cartItems().length === 0) {
      this.router.navigate(['/catalog']);
      return;
    }

    this.addressService.loadAddresses(user.id).then(() => {
      const list = this.addressService.addresses();
      const defaultAddr = list.find(a => a.is_default) || list[0];
      if (defaultAddr) {
        this.selectAddress(defaultAddr);
      } else {
        this.selectedAddress = null;
        this.selectedAddressId = null;
        this.isEditingAddress = true;
      }
    });
  }

  selectAddress(addr: Address) {
    this.selectedAddress = addr;
    this.selectedAddressId = addr.id;
    this.isEditingAddress = false;
    this.isAddingAddress = false;

    // Formatear dirección para el backend
    const parts = [addr.street, addr.city];
    if (addr.state) parts.push(addr.state);
    if (addr.zip_code) parts.push(`C.P. ${addr.zip_code}`);
    if (addr.phone) parts.push(`Tel: ${addr.phone}`);
    this.shippingAddress = parts.filter(Boolean).join(', ');

    // Cargar SDK y renderizar botones de PayPal
    setTimeout(() => {
      this.initPaypalButtons();
    }, 150);
  }

  toggleChangeAddress() {
    this.isEditingAddress = !this.isEditingAddress;
    this.isAddingAddress = false;
    this.orderError = '';
  }

  startAddAddress() {
    this.addressForm = { label: '', street: '', city: '', state: '', zip_code: '', phone: '' };
    this.addressError = '';
    this.isAddingAddress = true;
  }

  cancelAddAddress() {
    this.isAddingAddress = false;
    this.addressError = '';
  }

  async saveNewAddress() {
    const user = this.auth.currentUser();
    if (!user) return;

    this.addressError = '';
    this.savingAddress = true;
    try {
      const newAddr = await this.addressService.addAddress(user.id, this.addressForm);
      this.selectAddress(newAddr);
    } catch (err: any) {
      this.addressError = err?.message || 'No se pudo guardar la dirección.';
    } finally {
      this.savingAddress = false;
    }
  }

  applyCoupon() {
    const subtotal = this.cart.cartTotal();
    if (!this.couponCode.trim()) {
      this.couponMessage = 'Ingresa un código de cupón.';
      this.couponApplied = null;
      return;
    }

    this.orderService.validateCoupon(this.couponCode.trim(), subtotal).subscribe({
      next: (res) => {
        this.couponApplied = res.coupon;
        this.discountAmount = res.discount_amount;
        this.couponMessage = `${res.coupon.name} aplicado correctamente.`;
      },
      error: (err) => {
        this.couponApplied = null;
        this.discountAmount = 0;
        this.couponMessage = err?.error?.detail || 'No se pudo aplicar el cupón.';
      }
    });
  }

  getDiscountedTotal() {
    return Math.max(0, this.cart.cartTotal() - this.discountAmount);
  }

  initPaypalButtons() {
    const container = document.getElementById('paypal-button-container');
    if (!container) return;
    container.innerHTML = '';

    this.orderService.getPaypalConfig().subscribe({
      next: (config) => {
        let clientId = config.client_id || 'sb';
        if (clientId.includes('mock') || clientId === 'test') {
          clientId = 'sb'; // Usar 'sb' (Sandbox público de PayPal) para desarrollo local
        }
        this.loadPaypalScript(clientId).then((paypal) => {
          // Volver a verificar que el contenedor siga existiendo
          const target = document.getElementById('paypal-button-container');
          if (!target) return;
          target.innerHTML = '';

          paypal.Buttons({
            createOrder: (data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    currency_code: 'USD',
                    value: this.getDiscountedTotal().toFixed(2)
                  }
                }]
              });
            },
            onApprove: (data: any, actions: any) => {
              this.isSubmittingOrder = true;
              return actions.order.capture().then((details: any) => {
                const paypalOrderId = details.id;
                this.submitOrder(paypalOrderId);
              });
            },
            onError: (err: any) => {
              console.error('PayPal Error:', err);
              this.orderError = 'Hubo un error con la pasarela de PayPal. Inténtalo de nuevo.';
              this.isSubmittingOrder = false;
            }
          }).render('#paypal-button-container');
        }).catch(err => {
          console.error('Error al cargar PayPal SDK:', err);
          this.orderError = 'No se pudo cargar la pasarela de pago de PayPal.';
        });
      },
      error: (err) => {
        console.error('Error al obtener config de PayPal:', err);
        this.orderError = 'No se pudo obtener la configuración del backend para PayPal.';
      }
    });
  }

  loadPaypalScript(clientId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if ((window as any).paypal) {
        resolve((window as any).paypal);
        return;
      }
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.onload = () => resolve((window as any).paypal);
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  }

  submitOrder(paypalOrderId?: string) {
    if (!this.shippingAddress.trim()) {
      this.orderError = 'Por favor selecciona una dirección de envío.';
      return;
    }

    this.isSubmittingOrder = true;
    this.orderError = '';

    const orderData = {
      shipping_address: this.shippingAddress,
      paypal_order_id: paypalOrderId,
      items: this.cart.cartItems().map(item => ({
        product_id: item.product.id,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.unit_price
      })),
      coupon_code: this.couponApplied?.code || null
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (res) => {
        this.createdOrderId = res.id;
        this.cart.clearCart();
        this.checkoutStep = 'success';
        this.isSubmittingOrder = false;
      },
      error: (err) => {
        console.error('Error al registrar el pedido:', err);
        this.orderError = err?.error?.detail || 'Error al procesar el pedido. Revisa el stock disponible de las tallas.';
        this.isSubmittingOrder = false;
      }
    });
  }
}
