import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { FavoritesService } from '../../../services/favorites.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="catalog-page">
      <!-- Header / Sidebar Toggle -->
      <header class="catalog-header">
        <h1>Catálogo General</h1>
        <div class="catalog-controls">
          <p class="results-count">{{ products().length }} Productos encontrados</p>
          <select class="sort-select" (change)="sortProducts($event)">
            <option value="relevance">Relevancia</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
          </select>
        </div>
      </header>

      <div class="catalog-layout">
        <!-- Sidebar Filters -->
        <aside class="sidebar">
          <div class="filter-group">
            <h3>Categorías</h3>
            <ul>
              <li class="active">Todos los productos</li>
              <li>Running</li>
              <li>Casual / Lifestyle</li>
              <li>Formal</li>
              <li>Training</li>
            </ul>
          </div>

          <div class="filter-group">
            <h3>Marcas</h3>
            <div class="brand-list">
              <label class="check-container" *ngFor="let b of brands">
                {{ b }}
                <input type="checkbox" [checked]="selectedBrands.has(b)" (change)="toggleBrandFilter(b)">
                <span class="checkmark"></span>
              </label>
            </div>
          </div>
        </aside>

        <!-- Product Grid -->
        <main class="main-content">
          @if (loading()) {
            <div class="loading-grid">
              @for (i of skeletons; track i) {
                <div class="skeleton-card">
                  <div class="skeleton-img"></div>
                  <div class="skeleton-line short"></div>
                  <div class="skeleton-line long"></div>
                  <div class="skeleton-line medium"></div>
                </div>
              }
            </div>
          } @else if (filteredProducts().length === 0) {
            <div class="no-products">
              <span class="material-icons">inventory_2</span>
              <p>No hay productos disponibles con los filtros actuales.</p>
            </div>
          } @else {
            <div class="product-grid">
              @for (item of filteredProducts(); track item.id) {
                <div class="product-card" (click)="openProductDetails(item)">
                  <div class="img-container">
                    <img [src]="item.main_image_url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600'" [alt]="item.name">
                    <button class="quick-add" (click)="$event.stopPropagation(); openProductDetails(item)">+</button>
                    <button class="favorite-toggle" (click)="$event.stopPropagation(); toggleFavorite(item)" [attr.aria-label]="isFavorite(item.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'">
                      <span class="material-icons">{{ isFavorite(item.id) ? 'favorite' : 'favorite_border' }}</span>
                    </button>
                  </div>
                  <div class="info">
                    <p class="brand">{{ item.brand || 'El Zapatito' }}</p>
                    <h4 class="name">{{ item.name }}</h4>
                    <div class="bottom-info">
                      <p class="price">{{ item.price | currency:'USD' }}</p>
                      <span class="tag" *ngIf="item.price > 200">Luxury</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </main>
      </div>
    </div>

    <!-- MODAL PREMIUM DE DETALLE DE PRODUCTO -->
    @if (selectedProduct) {
      <div class="modal-backdrop" (click)="closeProductDetails()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <button class="modal-close-btn" (click)="closeProductDetails()">
            <span class="material-icons">close</span>
          </button>
          
          <div class="modal-grid">
            <!-- Imagen izquierda -->
            <div class="modal-image-column">
              <img [src]="selectedProduct.main_image_url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600'" [alt]="selectedProduct.name" class="modal-main-img">
            </div>

            <!-- Info y controles derecha -->
            <div class="modal-info-column">
              <span class="modal-brand-badge">{{ selectedProduct.brand || 'El Zapatito' }}</span>
              <h2 class="modal-product-name">{{ selectedProduct.name }}</h2>
              <div class="modal-price-tag">
                <span class="price-current">{{ selectedProduct.price | currency:'USD' }}</span>
                <span class="price-discount" *ngIf="selectedProduct.base_price && selectedProduct.base_price > selectedProduct.price">
                  {{ selectedProduct.base_price | currency:'USD' }}
                </span>
              </div>
              
              <hr class="divider">

              <p class="modal-description">
                {{ selectedProduct.description || 'Este exclusivo calzado combina confort y sofisticación para un estilo diario inigualable. Fabricado con materiales seleccionados de la más alta calidad y un diseño ergonómico de vanguardia.' }}
              </p>

              <!-- Selector de tallas -->
              <div class="size-selection-section">
                <h3>Selecciona una Talla (US)</h3>
                <div class="modal-sizes-grid">
                  <button 
                    *ngFor="let variant of getProductVariants(selectedProduct)"
                    [class.selected]="selectedSize === variant.size"
                    [class.out-of-stock]="variant.stock_quantity <= 0"
                    [disabled]="variant.stock_quantity <= 0"
                    (click)="selectSize(variant.size)"
                    class="size-bubble">
                    {{ variant.size }}
                    @if (variant.stock_quantity > 0 && variant.stock_quantity <= 3) {
                      <span class="low-stock-alert">¡Casi agotado!</span>
                    }
                  </button>
                </div>
              </div>

              <!-- Selector de cantidad y Agregar -->
              <div class="purchase-actions-section">
                <div class="quantity-controller">
                  <button (click)="changeQty(-1)" [disabled]="selectedQuantity <= 1">-</button>
                  <span class="qty-display">{{ selectedQuantity }}</span>
                  <button (click)="changeQty(1)">+</button>
                </div>

                <button 
                  class="btn-add-to-cart" 
                  [disabled]="!selectedSize"
                  (click)="addProductToCart()">
                  {{ selectedSize ? 'Agregar a la Bolsa' : 'Selecciona una Talla' }}
                </button>
              </div>

              <!-- Mensajes adicionales -->
              <div class="modal-delivery-highlights">
                <div class="highlight-item">
                  <span class="material-icons">local_shipping</span>
                  <span>Envío gratuito estándar a nivel nacional.</span>
                </div>
                <div class="highlight-item">
                  <span class="material-icons">verified_user</span>
                  <span>100% Original de Diseñador. Garantía El Zapatito.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .catalog-page { padding: 2rem 0; }
    
    /* Header */
    .catalog-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; border-bottom: 1px solid #eee; padding-bottom: 2rem; }
    h1 { font-size: 3rem; letter-spacing: -2px; margin: 0; }
    .catalog-controls { display: flex; align-items: center; gap: 2rem; }
    .results-count { color: #888; font-size: 0.9rem; margin: 0; }
    .sort-select { border: 1px solid #eee; border-radius: 8px; font-weight: 600; outline: none; background: #fff; cursor: pointer; padding: 0.5rem 1rem; }

    /* Layout */
    .catalog-layout { display: grid; grid-template-columns: 250px 1fr; gap: 4rem; }

    /* Sidebar Filters */
    .sidebar { display: flex; flex-direction: column; gap: 3rem; }
    .filter-group h3 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 1.5rem; color: #999; }
    .filter-group ul { list-style: none; padding: 0; margin: 0; }
    .filter-group li { padding: 0.5rem 0; cursor: pointer; color: #555; transition: color 0.3s; font-weight: 500; }
    .filter-group li:hover, .filter-group li.active { color: #000; }
    
    .brand-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .check-container { display: block; position: relative; padding-left: 30px; margin-bottom: 12px; cursor: pointer; font-size: 0.95rem; user-select: none; }
    .check-container input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; }
    .checkmark { position: absolute; top: 2px; left: 0; height: 18px; width: 18px; background-color: #fff; border: 2px solid #eee; border-radius: 4px; }
    .check-container:hover input ~ .checkmark { border-color: #000; }
    .check-container input:checked ~ .checkmark { background-color: #000; border-color: #000; }
    .checkmark:after { content: ""; position: absolute; display: none; left: 5px; top: 1px; width: 4px; height: 9px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
    .check-container input:checked ~ .checkmark:after { display: block; }

    /* Product Grid */
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 3rem 2rem; }
    .product-card { cursor: pointer; }
    .img-container { position: relative; height: 350px; background: #f9f9f9; border-radius: 20px; overflow: hidden; margin-bottom: 1.2rem; }
    .img-container img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    .product-card:hover img { transform: scale(1.08); }
    
    .quick-add { position: absolute; right: 1rem; bottom: 1rem; background: #fff; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transform: translateY(10px); transition: all 0.3s; }
    .product-card:hover .quick-add { opacity: 1; transform: translateY(0); }
    .favorite-toggle { position: absolute; left: 1rem; top: 1rem; background: rgba(255,255,255,0.95); border: none; width: 42px; height: 42px; border-radius: 50%; font-size: 1.2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.12); cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 2; }
    .favorite-toggle .material-icons { color: #e11d48; }

    .brand { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 700; margin: 0 0 0.5rem; }
    .name { font-size: 1.1rem; font-weight: 600; margin: 0 0 1rem; color: #111; }
    .bottom-info { display: flex; justify-content: space-between; align-items: center; }
    .price { font-size: 1.2rem; font-weight: 700; margin: 0; }
    .tag { font-size: 0.6rem; color: #000; border: 1px solid #000; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; text-transform: uppercase; }

    .no-products { text-align: center; padding: 5rem; border: 1px dashed #eee; border-radius: 20px; color: #888; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .no-products .material-icons { font-size: 3rem; color: #ccc; }

    /* Skeleton loader */
    .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 3rem 2rem; }
    .skeleton-card { display: flex; flex-direction: column; gap: 0.8rem; }
    .skeleton-img { height: 350px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 20px; }
    .skeleton-line { height: 14px; border-radius: 6px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
    .skeleton-line.short { width: 40%; }
    .skeleton-line.long { width: 80%; }
    .skeleton-line.medium { width: 55%; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* MODAL DE DETALLE PREMIUM */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(12px);
      z-index: 1100;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
      box-sizing: border-box;
      animation: fadeIn 0.3s forwards;
    }
    .modal-container {
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(255,255,255,0.4);
      width: 950px;
      max-width: 100%;
      max-height: 90vh;
      border-radius: 28px;
      overflow-y: auto;
      position: relative;
      padding: 3rem;
      box-shadow: 0 20px 50px rgba(0,0,0,0.15);
      box-sizing: border-box;
      animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .modal-close-btn {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      background: none;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .modal-close-btn:hover {
      background: rgba(0,0,0,0.05);
    }
    .modal-close-btn .material-icons {
      font-size: 1.8rem;
    }

    .modal-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 3.5rem;
    }

    /* Imagen */
    .modal-image-column {
      background: #f9f9f9;
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 480px;
    }
    .modal-main-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Info */
    .modal-info-column {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .modal-brand-badge {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #999;
      font-weight: 800;
      margin-bottom: 0.5rem;
    }
    .modal-product-name {
      font-size: 2.2rem;
      letter-spacing: -1.5px;
      margin: 0 0 1rem;
      font-weight: 700;
      line-height: 1.1;
    }
    .modal-price-tag {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .price-current {
      font-size: 1.8rem;
      font-weight: 800;
    }
    .price-discount {
      text-decoration: line-through;
      color: #999;
      font-size: 1.2rem;
    }
    .divider {
      border: 0;
      border-top: 1px solid #eee;
      margin: 1rem 0;
    }
    .modal-description {
      color: #555;
      line-height: 1.6;
      font-size: 0.95rem;
      margin-bottom: 2rem;
    }

    /* Selector de Tallas */
    .size-selection-section h3 {
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #000;
      margin-bottom: 1rem;
    }
    .modal-sizes-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.6rem;
      margin-bottom: 2.5rem;
    }
    .size-bubble {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 12px;
      padding: 0.8rem 0;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.2s;
    }
    .size-bubble:hover {
      border-color: #000;
      background: #fafafa;
    }
    .size-bubble.selected {
      background: #000;
      color: #fff;
      border-color: #000;
    }
    .size-bubble.out-of-stock {
      opacity: 0.4;
      text-decoration: line-through;
      cursor: not-allowed;
      border-color: #f0f0f0;
      background: #fafafa;
    }
    .low-stock-alert {
      position: absolute;
      bottom: 2px;
      font-size: 0.55rem;
      color: #d97706;
      font-weight: 700;
    }

    /* Acciones */
    .purchase-actions-section {
      display: flex;
      gap: 1.5rem;
      align-items: center;
      margin-bottom: 2rem;
    }
    .quantity-controller {
      display: flex;
      align-items: center;
      border: 1.5px solid #000;
      border-radius: 12px;
      overflow: hidden;
      height: 48px;
    }
    .quantity-controller button {
      background: none;
      border: none;
      width: 40px;
      height: 100%;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: bold;
      transition: background 0.2s;
    }
    .quantity-controller button:hover:not(:disabled) {
      background: #f5f5f5;
    }
    .quantity-controller button:disabled {
      color: #ccc;
      cursor: not-allowed;
    }
    .qty-display {
      width: 40px;
      text-align: center;
      font-weight: 700;
      font-size: 1rem;
    }
    .btn-add-to-cart {
      flex: 1;
      background: #000;
      color: #fff;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1.05rem;
      cursor: pointer;
      height: 48px;
      transition: opacity 0.2s;
    }
    .btn-add-to-cart:hover:not(:disabled) {
      opacity: 0.9;
    }
    .btn-add-to-cart:disabled {
      background: #aaa;
      cursor: not-allowed;
    }

    /* Destacados */
    .modal-delivery-highlights {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      border-top: 1px solid #eee;
      padding-top: 1.5rem;
    }
    .highlight-item {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      font-size: 0.85rem;
      color: #666;
    }
    .highlight-item .material-icons {
      font-size: 1.25rem;
      color: #444;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleUp {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @media (max-width: 992px) {
      .catalog-layout { grid-template-columns: 1fr; }
      .sidebar { display: none; }
      h1 { font-size: 2.2rem; }
      .modal-grid { grid-template-columns: 1fr; gap: 2rem; }
      .modal-image-column { height: 300px; }
      .modal-container { padding: 2rem; }
    }
  `]
})
export class CatalogComponent implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  favoritesService = inject(FavoritesService);
  router = inject(Router);

  products = signal<any[]>([]);
  filteredProducts = signal<any[]>([]);
  loading = signal(true);

  // Para el skeleton loader (6 tarjetas de carga animadas)
  skeletons = [1, 2, 3, 4, 5, 6];

  // Filtros
  brands = ['Nike', 'Jordan', 'Adidas', 'New Balance', 'Yeezy', 'Converse'];
  selectedBrands = new Set<string>();
  currentSort = 'relevance';

  // Detalle del producto (modal)
  selectedProduct: any = null;
  selectedSize: number | null = null;
  selectedQuantity = 1;

  mockProducts = [
    {
      id: 'mock-1',
      name: 'Nike Air Max Minimal',
      brand: 'Nike',
      price: 189.99,
      base_price: 219.99,
      description: 'Experimenta la máxima amortiguación y diseño minimalista clásico con el modelo Air Max de alta gama. Su suela translúcida y capellada transpirable lo hacen idóneo tanto para running urbano como para looks lifestyle premium.',
      main_image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
      inventory: [
        { size: 7.0, stock_quantity: 5 },
        { size: 8.0, stock_quantity: 0 }, // Agotado
        { size: 9.0, stock_quantity: 2 }, // Bajo Stock
        { size: 10.0, stock_quantity: 12 },
        { size: 11.0, stock_quantity: 4 }
      ]
    },
    {
      id: 'mock-2',
      name: 'Jordan Retro High',
      brand: 'Jordan',
      price: 210.00,
      description: 'El regreso de la leyenda. Esta silueta clásica Jordan rinde tributo a las duelas de los 80s con piel texturizada genuina y esquemas de color contrastantes que capturan todas las miradas.',
      main_image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600',
      inventory: [
        { size: 8.0, stock_quantity: 8 },
        { size: 9.0, stock_quantity: 7 },
        { size: 10.0, stock_quantity: 0 },
        { size: 11.0, stock_quantity: 6 }
      ]
    },
    {
      id: 'mock-3',
      name: 'Adidas Ultra Boost',
      brand: 'Adidas',
      price: 160.00,
      description: 'Diseñados para devolverte energía. El calzado Ultra Boost cuenta con tecnología de retorno continuo, tejido Primeknit flexible y un talón protector para máxima velocidad con la máxima comodidad.',
      main_image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600',
      inventory: [
        { size: 7.5, stock_quantity: 4 },
        { size: 8.5, stock_quantity: 1 },
        { size: 9.5, stock_quantity: 10 },
        { size: 10.5, stock_quantity: 8 }
      ]
    },
    {
      id: 'mock-4',
      name: 'Yeezy Boost 350',
      brand: 'Yeezy',
      price: 220.00,
      description: 'Innovación y alta costura se funden en el Yeezy Boost. Un diseño estilizado y aerodinámico en un tono tierra neutro, complementado por la amortiguación suave icónica que lo define.',
      main_image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600',
      inventory: [
        { size: 8.0, stock_quantity: 3 },
        { size: 9.0, stock_quantity: 4 },
        { size: 10.0, stock_quantity: 6 }
      ]
    },
    {
      id: 'mock-5',
      name: 'NB Vintage 574',
      brand: 'New Balance',
      price: 130.00,
      description: 'El clásico indiscutible. El modelo 574 es el estandarte de estilo urbano y comodidad duradera de New Balance, confeccionado con paneles de gamuza suave y malla de nylon resistente.',
      main_image_url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=600',
      inventory: [
        { size: 8.0, stock_quantity: 15 },
        { size: 9.0, stock_quantity: 14 },
        { size: 10.0, stock_quantity: 12 },
        { size: 11.0, stock_quantity: 8 }
      ]
    },
    {
      id: 'mock-6',
      name: 'Chuck Taylor 70',
      brand: 'Converse',
      price: 95.00,
      description: 'Un ícono atemporal remasterizado con lona gruesa y plantillas de amortiguación mejorada. Combina con absolutamente todo en tu armario.',
      main_image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600',
      inventory: [
        { size: 7.0, stock_quantity: 10 },
        { size: 8.0, stock_quantity: 10 },
        { size: 9.0, stock_quantity: 10 },
        { size: 10.0, stock_quantity: 10 }
      ]
    }
  ];

  ngOnInit() {
    this.loading.set(true);
    // Inicializamos con mock para que se vea rico de inmediato
    this.setProductsList(this.mockProducts);

    this.productService.getProducts().subscribe({
      next: (data) => {
        // Solo productos activos son visibles en el catálogo público
        const activeOnly = (data ?? []).filter((p: any) => p.is_active !== false);

        if (activeOnly.length > 0) {
          // Si los productos de la API no traen inventario, les creamos uno por defecto para que no fallen las tallas
          const apiProducts = activeOnly.map(p => ({
            ...p,
            inventory: p.inventory && p.inventory.length > 0 ? p.inventory : [
              { size: 7.5, stock_quantity: 5 },
              { size: 8.5, stock_quantity: 8 },
              { size: 9.5, stock_quantity: 12 },
              { size: 10.5, stock_quantity: 6 },
              { size: 11.5, stock_quantity: 3 }
            ]
          }));
          this.setProductsList(apiProducts);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar catálogo, usando datos de prueba:', err);
        this.loading.set(false);
      }
    });
  }

  setProductsList(list: any[]) {
    this.products.set(list);
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.products()];

    // Filtrar por Marca
    if (this.selectedBrands.size > 0) {
      result = result.filter(p => this.selectedBrands.has(p.brand || ''));
    }

    // Ordenar
    if (this.currentSort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (this.currentSort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    this.filteredProducts.set(result);
  }

  toggleBrandFilter(brandName: string) {
    if (this.selectedBrands.has(brandName)) {
      this.selectedBrands.delete(brandName);
    } else {
      this.selectedBrands.add(brandName);
    }
    this.applyFilters();
  }

  sortProducts(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.currentSort = value;
    this.applyFilters();
  }

  // Métodos del Modal de Detalles
  openProductDetails(product: any) {
    this.selectedProduct = product;
    this.selectedSize = null; // Reiniciar selección
    this.selectedQuantity = 1;
  }

  closeProductDetails() {
    this.selectedProduct = null;
    this.selectedSize = null;
  }

  getProductVariants(product: any): any[] {
    return product.inventory || [];
  }

  selectSize(size: number) {
    this.selectedSize = size;
  }

  changeQty(amount: number) {
    this.selectedQuantity = Math.max(1, this.selectedQuantity + amount);
  }

  addProductToCart() {
    if (!this.selectedProduct || !this.selectedSize) return;

    // Agregar al servicio de carrito
    this.cartService.addToCart(this.selectedProduct, this.selectedSize, this.selectedQuantity);

    // Cerrar modal
    this.closeProductDetails();

    // Abrir automáticamente el drawer del carrito
    setTimeout(() => {
      this.cartService.isCartOpen.set(true);
    }, 100);
  }

  isFavorite(productId: string | number | undefined): boolean {
    return this.favoritesService.isFavorite(productId);
  }

  toggleFavorite(product: any) {
    this.favoritesService.toggleFavorite(product);
  }

  goToProduct(item: any) {
    if (item?.id) {
      this.router.navigate(['/product', item.id]);
    }
  }
}
