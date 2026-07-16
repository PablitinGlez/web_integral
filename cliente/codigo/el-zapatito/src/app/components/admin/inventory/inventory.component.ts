import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inventory-container">
      <header class="page-header">
        <div>
          <h1>Gestión de Inventario</h1>
          <p class="subtitle">Controla el stock y las tallas disponibles por producto</p>
        </div>
      </header>

      <div class="inventory-grid">
        <!-- Selector de Producto -->
        <div class="control-card">
          <h3>Seleccionar Producto</h3>
          <div class="field">
            <select [(ngModel)]="selectedProductId" (change)="onProductChange()" class="product-select">
              <option value="" disabled selected>-- Elige un zapato --</option>
              <option *ngFor="let p of products" [value]="p.id">
                {{ p.brand || 'Calzado' }} - {{ p.name }} ({{ p.price | currency:'USD' }})
              </option>
            </select>
          </div>

          <div *ngIf="selectedProduct" class="selected-details">
            <img [src]="selectedProduct.main_image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=150'" alt="Selected product" class="details-thumb">
            <div class="details-text">
              <h4>{{ selectedProduct.name }}</h4>
              <p>{{ selectedProduct.brand }}</p>
              <span class="price-badge">{{ selectedProduct.price | currency:'USD' }}</span>
            </div>
          </div>

          <!-- Información del Proveedor -->
          <div *ngIf="selectedProduct" class="supplier-card-section">
            <hr class="mini-divider">
            <div class="supplier-header-title">
              <span class="material-icons title-icon">local_shipping</span>
              <h5>Información del Proveedor</h5>
            </div>
            <div *ngIf="selectedProduct.supplier; else noSupplier" class="supplier-contact-info">
              <p class="supplier-name-title">{{ selectedProduct.supplier.name }}</p>
              <div class="contact-details">
                <p class="contact-line" *ngIf="selectedProduct.supplier.contact_name">
                  <span class="lbl">Contacto:</span> {{ selectedProduct.supplier.contact_name }}
                </p>
                <p class="contact-line" *ngIf="selectedProduct.supplier.phone">
                  <span class="lbl">Teléfono:</span> <strong class="phone-highlight">{{ selectedProduct.supplier.phone }}</strong>
                </p>
                <p class="contact-line" *ngIf="selectedProduct.supplier.email">
                  <span class="lbl">Correo:</span> <a href="mailto:{{ selectedProduct.supplier.email }}" class="mail-link">{{ selectedProduct.supplier.email }}</a>
                </p>
              </div>
            </div>
            <ng-template #noSupplier>
              <p class="no-supplier-notice">Este zapato no tiene un proveedor asignado.</p>
            </ng-template>
          </div>
        </div>

        <!-- Panel de Stock -->
        <div class="stock-card" *ngIf="selectedProduct">
          <div class="stock-header">
            <h3>Tallas & Stock</h3>
            <span class="total-stock">Stock Total: {{ getTotalStock() }} u.</span>
          </div>

          <div class="sizes-grid">
            <div class="size-item" *ngFor="let variant of currentInventory">
              <span class="size-num">Talla {{ variant.size }}</span>
              <span class="size-qty" [class.out]="variant.stock_quantity === 0" [class.low]="variant.stock_quantity > 0 && variant.stock_quantity < 5">
                {{ variant.stock_quantity }} disponibles
              </span>
            </div>
            <div *ngIf="currentInventory.length === 0" class="no-sizes">
              No hay tallas registradas para este zapato.
            </div>
          </div>

          <hr class="divider">

          <!-- Ajustar Stock -->
          <div class="adjust-stock-section">
            <h4>Actualizar / Añadir Stock</h4>
            <form (submit)="updateOrAddStock()" class="adjust-form">
              <div class="form-fields">
                <div class="field">
                  <label>Talla (Ej: 38, 41.5)</label>
                  <input type="number" step="0.5" [(ngModel)]="stockForm.size" name="size" required placeholder="Talla">
                </div>
                <div class="field">
                  <label>Cantidad de Stock</label>
                  <input type="number" [(ngModel)]="stockForm.stock_quantity" name="stock" required min="0" placeholder="Cantidad">
                </div>
              </div>
              <button type="submit" class="btn-primary" [disabled]="loading">
                {{ loading ? 'Actualizando...' : 'Guardar Cambios' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Estado Inicial -->
        <div class="placeholder-card" *ngIf="!selectedProduct">
          <span class="material-icons placeholder-icon">inventory</span>
          <p>Selecciona un zapato del menú para ver y administrar sus existencias.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inventory-container { padding: 1rem; }
    .page-header { margin-bottom: 2rem; }
    h1 { font-size: 2.2rem; letter-spacing: -1px; margin: 0 0 0.5rem; }
    .subtitle { color: #888; margin: 0; }

    .inventory-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; align-items: start; }
    
    .control-card, .stock-card, .placeholder-card { 
      background: #fff; 
      border: 1px solid #eee; 
      border-radius: 20px; 
      padding: 1.8rem; 
    }

    h3 { font-size: 1.25rem; font-weight: 700; margin: 0 0 1.2rem; }
    h4 { font-size: 1.05rem; font-weight: 600; margin: 0 0 1rem; }

    .product-select { 
      width: 100%; 
      padding: 0.9rem; 
      border: 1px solid #ddd; 
      border-radius: 12px; 
      font-size: 0.95rem; 
      background-color: #fafafa;
      outline: none;
      font-family: inherit;
    }

    .selected-details { display: flex; gap: 1.2rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #f5f5f5; }
    .details-thumb { width: 80px; height: 80px; object-fit: cover; border-radius: 12px; border: 1px solid #eee; }
    .details-text h4 { margin: 0 0 0.2rem; font-size: 1.1rem; }
    .details-text p { margin: 0 0 0.6rem; color: #888; font-size: 0.9rem; }
    .price-badge { background: #000; color: #fff; padding: 0.3rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; }

    /* Estilos del Proveedor */
    .mini-divider { border: none; border-top: 1px solid #f5f5f5; margin: 1.5rem 0; }
    .supplier-header-title { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.8rem; }
    .supplier-header-title h5 { margin: 0; font-size: 0.95rem; font-weight: 700; color: #000; }
    .title-icon { font-size: 1.15rem; color: #555; }
    .supplier-name-title { font-weight: 600; font-size: 0.95rem; color: #000; margin: 0 0 0.5rem 0; }
    .contact-details { display: flex; flex-direction: column; gap: 0.3rem; }
    .contact-line { margin: 0; font-size: 0.85rem; color: #555; }
    .lbl { color: #888; font-weight: 500; }
    .phone-highlight { color: #000; font-weight: 700; }
    .mail-link { color: #000; text-decoration: underline; font-weight: 500; }
    .no-supplier-notice { font-size: 0.85rem; color: #aaa; margin: 0; font-style: italic; }

    /* Stock Panel */
    .stock-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .stock-header h3 { margin: 0; }
    .total-stock { background: #f1f3f5; color: #000; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }

    .sizes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .size-item { 
      background: #fafafa; 
      border: 1px solid #eee; 
      border-radius: 12px; 
      padding: 0.8rem; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      gap: 0.3rem; 
    }
    .size-num { font-weight: 700; font-size: 1rem; }
    .size-qty { font-size: 0.75rem; color: #059669; font-weight: 600; }
    .size-qty.low { color: #d97706; }
    .size-qty.out { color: #dc2626; }
    .no-sizes { grid-column: 1 / -1; text-align: center; color: #aaa; padding: 2rem 0; font-size: 0.9rem; }

    .divider { border: none; border-top: 1px solid #f5f5f5; margin: 2rem 0; }

    /* Forms */
    .adjust-stock-section h4 { margin-bottom: 1rem; font-weight: 700; }
    .adjust-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .form-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    .field label { font-size: 0.8rem; font-weight: 600; color: #666; }
    .field input { padding: 0.8rem; border: 1px solid #ddd; border-radius: 10px; font-size: 0.95rem; font-family: inherit; }
    
    .btn-primary { 
      background: #000; 
      color: #fff; 
      padding: 0.9rem; 
      border: none; 
      border-radius: 12px; 
      font-weight: 600; 
      cursor: pointer; 
      transition: background 0.3s;
    }
    .btn-primary:hover { background: #222; }
    .btn-primary:disabled { background: #ccc; cursor: not-allowed; }

    /* Placeholder State */
    .placeholder-card { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 2rem; text-align: center; color: #aaa; }
    .placeholder-icon { font-size: 4rem; color: #ddd; margin-bottom: 1.5rem; }
    .placeholder-card p { font-size: 1.1rem; margin: 0; }

    @media (max-width: 900px) {
      .inventory-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class InventoryComponent implements OnInit {
  productService = inject(ProductService);
  http = inject(HttpClient);

  products: any[] = [];
  selectedProductId: string = '';
  selectedProduct: any = null;
  currentInventory: any[] = [];
  loading = false;

  stockForm = {
    size: 38,
    stock_quantity: 10
  };

  // Mock de inventario por si falla la conexión
  mockInventories: { [key: string]: any[] } = {
    '1': [
      { id: 'v1', size: 37, stock_quantity: 12 },
      { id: 'v2', size: 38, stock_quantity: 0 },
      { id: 'v3', size: 39, stock_quantity: 3 },
      { id: 'v4', size: 40, stock_quantity: 15 },
      { id: 'v5', size: 41, stock_quantity: 6 }
    ],
    '2': [
      { id: 'v6', size: 38, stock_quantity: 8 },
      { id: 'v7', size: 39, stock_quantity: 10 },
      { id: 'v8', size: 40, stock_quantity: 2 },
      { id: 'v9', size: 42, stock_quantity: 0 }
    ],
    '3': [
      { id: 'v10', size: 39, stock_quantity: 5 },
      { id: 'v11', size: 40, stock_quantity: 5 },
      { id: 'v12', size: 41, stock_quantity: 5 },
      { id: 'v13', size: 42, stock_quantity: 5 }
    ]
  };

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.products = data;
        } else {
          this.products = [
            { id: '1', name: 'Nike Air Max Minimal', brand: 'Nike', price: 189.99, main_image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200' },
            { id: '2', name: 'Jordan Retro High Blue', brand: 'Jordan', price: 210.00, main_image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=200' },
            { id: '3', name: 'Yeezy Boost 350 V2', brand: 'Adidas', price: 220.00, main_image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=200' }
          ];
        }
      },
      error: () => {
        this.products = [
          { id: '1', name: 'Nike Air Max Minimal', brand: 'Nike', price: 189.99, main_image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200' },
          { id: '2', name: 'Jordan Retro High Blue', brand: 'Jordan', price: 210.00, main_image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=200' },
          { id: '3', name: 'Yeezy Boost 350 V2', brand: 'Adidas', price: 220.00, main_image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=200' }
        ];
      }
    });
  }

  onProductChange() {
    this.selectedProduct = this.products.find(p => p.id === this.selectedProductId);
    this.loadInventory();
  }

  loadInventory() {
    if (!this.selectedProductId) return;

    this.http.get<any[]>(`https://web-integral.onrender.com/inventory/${this.selectedProductId}`).subscribe({
      next: (data) => {
        if (data) {
          // Ordenar por talla
          this.currentInventory = data.sort((a, b) => a.size - b.size);
        } else {
          this.loadMockInventory();
        }
      },
      error: () => {
        this.loadMockInventory();
      }
    });
  }

  loadMockInventory() {
    const mock = this.mockInventories[this.selectedProductId];
    this.currentInventory = mock ? [...mock].sort((a, b) => a.size - b.size) : [];
  }

  getTotalStock(): number {
    return this.currentInventory.reduce((acc, curr) => acc + curr.stock_quantity, 0);
  }

  updateOrAddStock() {
    if (!this.selectedProductId) return;
    this.loading = true;

    // Buscar si ya existe la talla
    const existing = this.currentInventory.find(v => v.size === this.stockForm.size);

    if (existing) {
      // Caso 1: PUT (Actualizar stock)
      this.http.put(`https://web-integral.onrender.com/inventory/${existing.id}?quantity=${this.stockForm.stock_quantity}`, {}).subscribe({
        next: (updated: any) => {
          existing.stock_quantity = this.stockForm.stock_quantity;
          this.loading = false;
        },
        error: () => {
          // Mocking offline support
          existing.stock_quantity = this.stockForm.stock_quantity;
          this.loading = false;
        }
      });
    } else {
      // Caso 2: POST (Crear stock talla)
      const body = {
        size: this.stockForm.size,
        stock_quantity: this.stockForm.stock_quantity
      };
      this.http.post(`https://web-integral.onrender.com/inventory/?product_id=${this.selectedProductId}`, body).subscribe({
        next: (created: any) => {
          this.currentInventory.push(created);
          this.currentInventory.sort((a, b) => a.size - b.size);
          this.loading = false;
        },
        error: () => {
          // Mocking offline support
          const newMockItem = {
            id: 'mock-' + Date.now(),
            size: this.stockForm.size,
            stock_quantity: this.stockForm.stock_quantity,
            product_id: this.selectedProductId
          };
          this.currentInventory.push(newMockItem);
          this.currentInventory.sort((a, b) => a.size - b.size);
          this.loading = false;
        }
      });
    }
  }
}
