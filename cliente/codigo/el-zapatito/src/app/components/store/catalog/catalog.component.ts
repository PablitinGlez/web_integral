import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="catalog-page">
      <!-- Header Section -->
      <header class="catalog-header">
        <div class="header-top">
          <h1>Tenis y Calzado ({{ filteredProducts().length }})</h1>
          <div class="header-actions">
            <button class="btn-toggle-filters" (click)="toggleSidebar()">
              {{ showSidebar() ? 'Ocultar filtros' : 'Mostrar filtros' }}
              <span class="material-icons">tune</span>
            </button>
            <div class="sort-container">
              <span>Ordenar por:</span>
              <select class="sort-select" (change)="sortProducts($event)">
                <option value="relevance">Relevancia</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Horizontal Filter Bar (Mobile/Tablets or optional) -->
        <div class="horizontal-filters">
          <button class="filter-pill" [class.active]="totalActiveFilters() > 0">
            Filtros {{ totalActiveFilters() > 0 ? '(' + totalActiveFilters() + ')' : '' }}
          </button>
          <div class="dropdown-filter">
            <button class="filter-pill">Género <span class="material-icons">expand_more</span></button>
          </div>
          <div class="dropdown-filter">
            <button class="filter-pill">Marca <span class="material-icons">expand_more</span></button>
          </div>
          <div class="dropdown-filter">
            <button class="filter-pill">Talla <span class="material-icons">expand_more</span></button>
          </div>
          <div class="dropdown-filter">
            <button class="filter-pill">Color <span class="material-icons">expand_more</span></button>
          </div>
          <div class="dropdown-filter">
            <button class="filter-pill">Comprar por precio <span class="material-icons">expand_more</span></button>
          </div>
        </div>

        <!-- Compra por categorías (as seen in image) -->
        <section class="shop-by-category">
          <h2>COMPRA POR CATEGORÍAS</h2>
          <div class="category-scroll">
            <div class="category-card" *ngFor="let cat of shopCategories">
              <div class="cat-img-wrapper">
                <img [src]="cat.img" [alt]="cat.name">
              </div>
              <span>{{ cat.name }}</span>
            </div>
          </div>
        </section>
      </header>

      <div class="catalog-layout" [class.sidebar-hidden]="!showSidebar()">
        <!-- Sidebar Filters -->
        <aside class="sidebar" *ngIf="showSidebar()">
          <div class="sidebar-scrollable">
            <div class="filter-group">
              <ul class="category-list">
                <li class="active">Todos los productos</li>
                <li>Jordan 1</li>
                <li>Jordan 4</li>
                <li>Jordan Spizike</li>
                <li>Jordan Flight Court</li>
                <li>Jordan Session</li>
                <li>Luka Doncic</li>
                <li>Jayson Tatum</li>
                <li>Básquetbol</li>
                <li>Fútbol americano</li>
                <li>Golf</li>
                <li>Sandalias y chanclas</li>
              </ul>
            </div>

            <hr class="sidebar-divider">

            <!-- Género -->
            <div class="filter-group">
              <h3>Género</h3>
              <div class="check-list">
                <label class="check-container" *ngFor="let g of genders">
                  {{ g }}
                  <input type="checkbox" [checked]="selectedGenders.has(g)" (change)="toggleGenderFilter(g)">
                  <span class="checkmark"></span>
                </label>
              </div>
            </div>

            <hr class="sidebar-divider">

            <!-- Marcas -->
            <div class="filter-group">
              <h3>Marca</h3>
              <div class="check-list">
                <label class="check-container" *ngFor="let b of brands">
                  {{ b }}
                  <input type="checkbox" [checked]="selectedBrands.has(b)" (change)="toggleBrandFilter(b)">
                  <span class="checkmark"></span>
                </label>
              </div>
            </div>

            <hr class="sidebar-divider">

            <!-- Colores -->
            <div class="filter-group">
              <h3>Color</h3>
              <div class="color-grid">
                <div
                  class="color-item"
                  *ngFor="let c of colors"
                  (click)="toggleColorFilter(c.name)"
                  [class.active]="selectedColors.has(c.name)">
                  <div class="color-circle" [style.background-color]="c.hex">
                    <span class="material-icons" *ngIf="selectedColors.has(c.name)">check</span>
                  </div>
                  <span>{{ c.name }}</span>
                </div>
              </div>
            </div>

            <hr class="sidebar-divider">

            <!-- Tallas -->
            <div class="filter-group">
              <h3>Talla</h3>
              <div class="size-filter-grid">
                <button
                  *ngFor="let s of availableSizes"
                  class="size-filter-btn"
                  [class.active]="selectedSizes.has(s)"
                  (click)="toggleSizeFilter(s)">
                  {{ s }}
                </button>
              </div>
            </div>

            <hr class="sidebar-divider">

            <!-- Precio -->
            <div class="filter-group">
              <h3>Comprar por precio</h3>
              <div class="check-list">
                <label class="check-container" *ngFor="let r of priceRanges">
                  {{ r.label }}
                  <input type="checkbox" [checked]="selectedPriceRanges.has(r)" (change)="togglePriceRangeFilter(r)">
                  <span class="checkmark"></span>
                </label>
              </div>
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
    .catalog-page { padding: 1rem 3rem; max-width: 1600px; margin: 0 auto; }

    /* Header */
    .catalog-header { margin-bottom: 2rem; }
    .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    h1 { font-size: 1.5rem; font-weight: 500; margin: 0; }
    .header-actions { display: flex; align-items: center; gap: 2rem; }
    .btn-toggle-filters { background: none; border: none; display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; cursor: pointer; padding: 0.5rem; }
    .btn-toggle-filters:hover { opacity: 0.7; }
    .sort-container { display: flex; align-items: center; gap: 0.5rem; }
    .sort-container span { font-size: 1rem; }
    .sort-select { border: none; font-size: 1rem; font-weight: 500; outline: none; background: #fff; cursor: pointer; padding: 0.5rem; }

    .horizontal-filters { display: flex; gap: 0.5rem; border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 0.8rem 0; overflow-x: auto; scrollbar-width: none; }
    .horizontal-filters::-webkit-scrollbar { display: none; }
    .filter-pill { background: #fff; border: 1px solid #e5e5e5; border-radius: 20px; padding: 0.5rem 1.2rem; font-size: 0.95rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; white-space: nowrap; }
    .filter-pill:hover { border-color: #000; }
    .filter-pill.active { border-color: #000; background: #f5f5f5; }

    /* Shop by Category */
    .shop-by-category { margin-top: 3rem; text-align: center; }
    .shop-by-category h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 2rem; letter-spacing: 1px; }
    .category-scroll { display: flex; gap: 2rem; overflow-x: auto; padding-bottom: 1rem; scrollbar-width: none; justify-content: center; }
    .category-scroll::-webkit-scrollbar { display: none; }
    .category-card { display: flex; flex-direction: column; align-items: center; gap: 0.8rem; cursor: pointer; min-width: 120px; }
    .cat-img-wrapper { width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; }
    .cat-img-wrapper img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .category-card span { font-size: 0.85rem; font-weight: 500; white-space: nowrap; }

    /* Layout */
    .catalog-layout { display: grid; grid-template-columns: 260px 1fr; gap: 2rem; transition: all 0.3s; }
    .catalog-layout.sidebar-hidden { grid-template-columns: 1fr; }

    /* Sidebar Filters */
    .sidebar { position: sticky; top: 100px; height: calc(100vh - 120px); overflow-y: auto; padding-right: 1rem; }
    .sidebar::-webkit-scrollbar { width: 4px; }
    .sidebar::-webkit-scrollbar-thumb { background: #eee; border-radius: 4px; }

    .sidebar-divider { border: 0; border-top: 1px solid #f5f5f5; margin: 1.5rem 0; }

    .filter-group h3 { font-size: 1rem; font-weight: 600; margin-bottom: 1.2rem; }

    .category-list { list-style: none; padding: 0; margin: 0; }
    .category-list li { padding: 0.3rem 0; cursor: pointer; color: #111; font-weight: 500; font-size: 1rem; }
    .category-list li:hover { color: #757575; }
    .category-list li.active { font-weight: 600; }

    .check-list { display: flex; flex-direction: column; gap: 0.6rem; }
    .check-container { display: flex; align-items: center; position: relative; padding-left: 30px; cursor: pointer; font-size: 1rem; user-select: none; min-height: 24px; }
    .check-container input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; }
    .checkmark { position: absolute; top: 0; left: 0; height: 20px; width: 20px; background-color: #fff; border: 1px solid #ccc; border-radius: 4px; }
    .check-container:hover input ~ .checkmark { border-color: #000; }
    .check-container input:checked ~ .checkmark { background-color: #000; border-color: #000; }
    .checkmark:after { content: ""; position: absolute; display: none; left: 6px; top: 2px; width: 5px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
    .check-container input:checked ~ .checkmark:after { display: block; }

    /* Color Grid */
    .color-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .color-item { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; cursor: pointer; }
    .color-circle { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #eee; display: flex; align-items: center; justify-content: center; position: relative; }
    .color-circle .material-icons { font-size: 16px; color: #fff; }
    .color-item span { font-size: 0.75rem; color: #111; }
    .color-item.active .color-circle { border: 2px solid #000; }
    .color-item:nth-child(9) .color-circle .material-icons { color: #000; } /* Check color for white */

    /* Size Grid */
    .size-filter-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
    .size-filter-btn { background: #fff; border: 1px solid #e5e5e5; border-radius: 4px; padding: 0.6rem 0; font-size: 0.9rem; font-weight: 500; cursor: pointer; }
    .size-filter-btn:hover { border-color: #000; }
    .size-filter-btn.active { border-color: #000; background: #f5f5f5; }

    /* Product Grid */
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
    .product-card { cursor: pointer; margin-bottom: 2rem; }
    .img-container { position: relative; aspect-ratio: 1/1; background: #f6f6f6; overflow: hidden; margin-bottom: 0.8rem; }
    .img-container img { width: 100%; height: 100%; object-fit: cover; }

    .brand { font-size: 0.95rem; font-weight: 500; color: #111; margin: 0; }
    .name { font-size: 0.95rem; font-weight: 500; color: #757575; margin: 0 0 0.5rem; }
    .price { font-size: 1rem; font-weight: 500; color: #111; margin: 0; }

    /* Skeleton loader */
    .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
    .skeleton-card { display: flex; flex-direction: column; gap: 0.5rem; }
    .skeleton-img { aspect-ratio: 1/1; background: #f6f6f6; border-radius: 0; }
    .skeleton-line { height: 14px; border-radius: 6px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
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
  router = inject(Router);

  products = signal<any[]>([]);
  filteredProducts = signal<any[]>([]);
  loading = signal(true);

  // Para el skeleton loader (6 tarjetas de carga animadas)
  skeletons = [1, 2, 3, 4, 5, 6];

  // Filtros
  brands = ['Nike', 'Jordan', 'Adidas', 'New Balance', 'Yeezy', 'Converse'];
  genders = ['Hombre', 'Mujer', 'Unisex'];
  colors = [
    { name: 'Negro', hex: '#000000' },
    { name: 'Azul', hex: '#1e90ff' },
    { name: 'Marrón', hex: '#8b4513' },
    { name: 'Verde', hex: '#32cd32' },
    { name: 'Gris', hex: '#808080' },
    { name: 'Rosa', hex: '#ff69b4' },
    { name: 'Morado', hex: '#800080' },
    { name: 'Rojo', hex: '#ff0000' },
    { name: 'Blanco', hex: '#ffffff' },
    { name: 'Amarillo', hex: '#ffff00' }
  ];
  priceRanges = [
    { label: 'Menos de $1000', min: 0, max: 1000 },
    { label: '$1000 - $2000', min: 1000, max: 2000 },
    { label: '$2000 - $3000', min: 2000, max: 3000 },
    { label: 'Más de $3000', min: 3000, max: 999999 }
  ];
  availableSizes = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12];

  shopCategories = [
    { name: 'Personalizar con NBY', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop' },
    { name: 'Jerseys fútbol', img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop' },
    { name: 'Jordan 1', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop' },
    { name: 'Gorras y gorros', img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=100&h=100&fit=crop' },
    { name: 'Bras deportivos', img: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=100&h=100&fit=crop' },
    { name: 'Chanclas y sandalias', img: 'https://images.unsplash.com/photo-1603487759130-804107147746?w=100&h=100&fit=crop' },
    { name: 'Air Max', img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=100&h=100&fit=crop' },
    { name: 'Dunk', img: 'https://images.unsplash.com/photo-1612821745127-53c5a93ed883?w=100&h=100&fit=crop' }
  ];

  selectedBrands = new Set<string>();
  selectedGenders = new Set<string>();
  selectedColors = new Set<string>();
  selectedPriceRanges = new Set<any>();
  selectedSizes = new Set<number>();

  showSidebar = signal(true);
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
      gender: 'Hombre',
      color: 'Negro',
      price: 1899.99,
      base_price: 2199.99,
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
      gender: 'Hombre',
      color: 'Rojo',
      price: 4299.00,
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
      gender: 'Mujer',
      color: 'Blanco',
      price: 3200.00,
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
      gender: 'Unisex',
      color: 'Marrón',
      price: 5500.00,
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
      gender: 'Hombre',
      color: 'Gris',
      price: 1300.00,
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
      gender: 'Unisex',
      color: 'Negro',
      price: 950.00,
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

    // Filtrar por Género
    if (this.selectedGenders.size > 0) {
      result = result.filter(p => this.selectedGenders.has(p.gender || ''));
    }

    // Filtrar por Color
    if (this.selectedColors.size > 0) {
      result = result.filter(p => this.selectedColors.has(p.color || ''));
    }

    // Filtrar por Talla
    if (this.selectedSizes.size > 0) {
      result = result.filter(p => {
        const productSizes = p.inventory?.map((inv: any) => inv.size) || [];
        return Array.from(this.selectedSizes).some(size => productSizes.includes(size));
      });
    }

    // Filtrar por Rango de Precio
    if (this.selectedPriceRanges.size > 0) {
      result = result.filter(p => {
        return Array.from(this.selectedPriceRanges).some((range: any) => p.price >= range.min && p.price <= range.max);
      });
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

  toggleGenderFilter(gender: string) {
    if (this.selectedGenders.has(gender)) {
      this.selectedGenders.delete(gender);
    } else {
      this.selectedGenders.add(gender);
    }
    this.applyFilters();
  }

  toggleColorFilter(color: string) {
    if (this.selectedColors.has(color)) {
      this.selectedColors.delete(color);
    } else {
      this.selectedColors.add(color);
    }
    this.applyFilters();
  }

  toggleSizeFilter(size: number) {
    if (this.selectedSizes.has(size)) {
      this.selectedSizes.delete(size);
    } else {
      this.selectedSizes.add(size);
    }
    this.applyFilters();
  }

  togglePriceRangeFilter(range: any) {
    if (this.selectedPriceRanges.has(range)) {
      this.selectedPriceRanges.delete(range);
    } else {
      this.selectedPriceRanges.add(range);
    }
    this.applyFilters();
  }

  toggleSidebar() {
    this.showSidebar.set(!this.showSidebar());
  }

  totalActiveFilters() {
    return this.selectedBrands.size + this.selectedGenders.size + this.selectedColors.size + this.selectedSizes.size + this.selectedPriceRanges.size;
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
    const prodName = this.selectedProduct.name;
    const prodSize = this.selectedSize;
    this.closeProductDetails();

    // Abrir automáticamente el drawer del carrito
    setTimeout(() => {
      this.cartService.isCartOpen.set(true);
    }, 100);
  }

  goToProduct(item: any) {
    if (item?.id) {
      this.router.navigate(['/product', item.id]);
    }
  }
}
