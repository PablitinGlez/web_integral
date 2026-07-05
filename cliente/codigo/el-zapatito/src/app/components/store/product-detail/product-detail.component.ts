import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';

interface ProductImage {
  id?: string;
  image_url: string;
  display_order?: number;
}

interface InventoryItem {
  id?: string;
  size: number;
  stock_quantity: number;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detail-page">
      @if (loading()) {
        <div class="state-message">
          <span class="material-icons spin">autorenew</span>
          <p>Cargando producto...</p>
        </div>
      } @else if (!product()) {
        <div class="state-message">
          <span class="material-icons">search_off</span>
          <p>No pudimos encontrar este producto.</p>
          <a routerLink="/catalog" class="back-link">Volver al catálogo</a>
        </div>
      } @else {
        <!-- Breadcrumbs -->
        <nav class="breadcrumbs">
          <a routerLink="/">Inicio</a>
          <span class="separator">/</span>
          <a routerLink="/catalog">Catálogo</a>
          <span class="separator">/</span>
          <span class="current">{{ product().name }}</span>
        </nav>

        <div class="detail-layout">
          <!-- Galería de imágenes -->
          <div class="gallery">
            <div class="main-image-box">
              <img [src]="activeImage()" [alt]="product().name">
              @if (hasDiscount()) {
                <span class="discount-badge">-{{ discountPercent() }}%</span>
              }
            </div>
            @if (galleryImages().length > 1) {
              <div class="thumbs-row">
                @for (img of galleryImages(); track $index) {
                  <button
                    class="thumb-btn"
                    [class.active]="img === activeImage()"
                    (click)="activeImage.set(img)">
                    <img [src]="img" [alt]="product().name">
                  </button>
                }
              </div>
            }
          </div>

          <!-- Información del producto -->
          <div class="info-panel">
            <p class="brand-tag">{{ product().brand || 'El Zapatito' }}</p>
            <h1>{{ product().name }}</h1>

            <div class="chips-row">
              @if (product().category?.name) {
                <span class="category-chip">{{ product().category.name }}</span>
              }
              @if (product().gender) {
                <span class="category-chip gender-chip">{{ product().gender }}</span>
              }
            </div>

            <div class="price-row">
              @if (hasDiscount()) {
                <span class="price-old">{{ product().base_price | currency:'USD' }}</span>
              }
              <span class="price-current">{{ product().price | currency:'USD' }}</span>
            </div>

            <p class="description">{{ product().description || 'Este producto no tiene una descripción detallada todavía.' }}</p>

            <!-- Colores disponibles -->
            @if (colorList().length > 0) {
              <div class="section">
                <h3>Colores Disponibles</h3>
                <div class="color-options">
                  @for (c of colorList(); track c) {
                    <span class="color-pill">
                      <span class="color-dot" [style.background]="colorHex(c)"></span>
                      {{ c }}
                    </span>
                  }
                </div>
              </div>
            }

            <!-- Selector de tallas -->
            <div class="section">
              <h3>Talla</h3>
              @if (sizes().length > 0) {
                <div class="size-options">
                  @for (s of sizes(); track s.size) {
                    <button
                      class="size-btn"
                      [class.active]="selectedSize()?.size === s.size"
                      [disabled]="s.stock_quantity === 0"
                      (click)="selectSize(s)">
                      {{ s.size }}
                      @if (s.stock_quantity === 0) {
                        <span class="sold-out-tag">Agotado</span>
                      }
                    </button>
                  }
                </div>
              } @else {
                <p class="no-sizes">No hay tallas disponibles para este producto por el momento.</p>
              }
            </div>

            <!-- Selector de cantidad -->
            @if (selectedSize()) {
              <div class="section">
                <h3>Cantidad</h3>
                <div class="quantity-selector">
                  <button class="qty-btn" (click)="decreaseQty()" [disabled]="quantity() <= 1">
                    <span class="material-icons">remove</span>
                  </button>
                  <span class="qty-value">{{ quantity() }}</span>
                  <button class="qty-btn" (click)="increaseQty()" [disabled]="quantity() >= (selectedSize()?.stock_quantity || 0)">
                    <span class="material-icons">add</span>
                  </button>
                  <span class="stock-note">{{ selectedSize()?.stock_quantity }} disponibles</span>
                </div>
              </div>
            }

            <!-- Acciones -->
            <div class="actions-row">
              <button class="btn-add-cart" [disabled]="!selectedSize()" (click)="addToCart()">
                <span class="material-icons">shopping_bag</span>
                Agregar al carrito
              </button>
            </div>

            @if (addedMessage()) {
              <div class="added-confirmation">
                <span class="material-icons">check_circle</span>
                {{ addedMessage() }}
              </div>
            }

            <!-- Datos adicionales -->
            <div class="extra-info">
              <div class="extra-item">
                <span class="material-icons">sell</span>
                <span>Marca: {{ product().brand || 'No especificada' }}</span>
              </div>
              @if (product().category?.name) {
                <div class="extra-item">
                  <span class="material-icons">category</span>
                  <span>Categoría: {{ product().category.name }}</span>
                </div>
              }
              @if (product().sku) {
                <div class="extra-item">
                  <span class="material-icons">qr_code_2</span>
                  <span>SKU: {{ product().sku }}</span>
                </div>
              }
              <div class="extra-item">
                <span class="material-icons">inventory_2</span>
                <span>Disponibilidad: {{ availabilityText() }}</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-page { max-width: 1200px; margin: 0 auto; padding: 1rem 0 3rem; }

    /* Estados de carga / error */
    .state-message {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 6rem 2rem; text-align: center; color: #888; gap: 1rem;
    }
    .state-message .material-icons { font-size: 3rem; color: #ccc; }
    .state-message .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .back-link { color: #000; font-weight: 600; text-decoration: underline; }

    /* Breadcrumbs */
    .breadcrumbs { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #666; margin-bottom: 2rem; }
    .breadcrumbs a { color: #888; text-decoration: none; }
    .breadcrumbs a:hover { color: #000; text-decoration: underline; }
    .separator { color: #ccc; }
    .current { color: #000; font-weight: 600; }

    /* Layout */
    .detail-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }
    @media (max-width: 900px) {
      .detail-layout { grid-template-columns: 1fr; gap: 2rem; }
    }

    /* Galería */
    .gallery { display: flex; flex-direction: column; gap: 1rem; }
    .main-image-box {
      position: relative; background: #f9f9f9; border-radius: 20px; overflow: hidden;
      height: 480px; display: flex; align-items: center; justify-content: center;
    }
    .main-image-box img { width: 100%; height: 100%; object-fit: cover; }
    .discount-badge {
      position: absolute; top: 1rem; left: 1rem; background: #cc0000; color: #fff;
      font-size: 0.8rem; font-weight: 700; padding: 0.4rem 0.8rem; border-radius: 6px;
    }
    .thumbs-row { display: flex; gap: 0.8rem; flex-wrap: wrap; }
    .thumb-btn {
      width: 70px; height: 70px; border-radius: 10px; overflow: hidden; padding: 0;
      border: 2px solid #eee; cursor: pointer; background: #fafafa; flex-shrink: 0;
    }
    .thumb-btn img { width: 100%; height: 100%; object-fit: cover; }
    .thumb-btn.active { border-color: #000; }

    /* Panel de información */
    .info-panel { display: flex; flex-direction: column; }
    .brand-tag { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 700; margin: 0 0 0.5rem; }
    h1 { font-size: 2.2rem; letter-spacing: -1px; margin: 0 0 1rem; }
    .chips-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
    .category-chip {
      display: inline-block; background: #f1f3f5; color: #333; font-size: 0.8rem;
      padding: 0.3rem 0.8rem; border-radius: 20px; width: fit-content; margin-bottom: 0;
    }
    .gender-chip { background: #eef2ff; color: #3730a3; }

    .price-row { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 1.5rem; }
    .price-old { text-decoration: line-through; color: #999; font-size: 1.1rem; }
    .price-current { font-size: 2rem; font-weight: 700; }

    .description { color: #555; line-height: 1.6; margin-bottom: 2rem; }

    .color-options { display: flex; flex-wrap: wrap; gap: 0.6rem; }
    .color-pill {
      display: flex; align-items: center; gap: 0.5rem; background: #fafafa;
      border: 1px solid #eee; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem;
    }
    .color-dot {
      width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.15);
      display: inline-block; flex-shrink: 0;
    }

    .section { margin-bottom: 2rem; }
    .section h3 { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; color: #666; margin: 0 0 1rem; }

    .size-options { display: flex; gap: 0.7rem; flex-wrap: wrap; }
    .size-btn {
      position: relative; min-width: 55px; padding: 0.7rem 1rem; border: 1px solid #ddd;
      border-radius: 10px; background: #fff; cursor: pointer; font-weight: 600; font-size: 0.95rem;
      transition: all 0.2s;
    }
    .size-btn:hover:not(:disabled) { border-color: #000; }
    .size-btn.active { background: #000; color: #fff; border-color: #000; }
    .size-btn:disabled { color: #ccc; border-color: #eee; cursor: not-allowed; background: #fafafa; }
    .sold-out-tag { display: block; font-size: 0.6rem; font-weight: 500; }
    .no-sizes { color: #999; font-size: 0.95rem; }

    .quantity-selector { display: flex; align-items: center; gap: 1rem; }
    .qty-btn {
      width: 38px; height: 38px; border-radius: 50%; border: 1px solid #ddd; background: #fff;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
    }
    .qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .qty-value { font-size: 1.1rem; font-weight: 700; min-width: 30px; text-align: center; }
    .stock-note { color: #888; font-size: 0.85rem; margin-left: 0.5rem; }

    .actions-row { margin-bottom: 1rem; }
    .btn-add-cart {
      display: flex; align-items: center; justify-content: center; gap: 0.6rem;
      width: 100%; padding: 1.1rem; background: #000; color: #fff; border: none;
      border-radius: 12px; font-size: 1rem; font-weight: 700; cursor: pointer;
      transition: background 0.2s;
    }
    .btn-add-cart:hover:not(:disabled) { background: #222; }
    .btn-add-cart:disabled { background: #ccc; cursor: not-allowed; }

    .added-confirmation {
      display: flex; align-items: center; gap: 0.5rem; color: #006600;
      font-weight: 600; font-size: 0.9rem; margin-bottom: 1.5rem;
    }

    .extra-info { border-top: 1px solid #eee; padding-top: 1.5rem; display: flex; flex-direction: column; gap: 0.8rem; }
    .extra-item { display: flex; align-items: center; gap: 0.6rem; color: #555; font-size: 0.9rem; }
    .extra-item .material-icons { font-size: 1.2rem; color: #888; }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  loading = signal(true);
  product = signal<any>(null);
  activeImage = signal<string>('');
  selectedSize = signal<InventoryItem | null>(null);
  quantity = signal(1);
  addedMessage = signal('');

  // Catálogo de demostración por si el backend no está disponible (misma idea que el catálogo)
  private mockProducts: { [key: string]: any } = {
    'mock-1': {
      id: 'mock-1', name: 'Nike Air Max Minimal', brand: 'Nike', price: 189.99, base_price: 219.99,
      description: 'Comodidad y estilo minimalista para el día a día.',
      main_image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
      images: [], category: { name: 'Running' },
      inventory: [{ size: 7, stock_quantity: 4 }, { size: 8, stock_quantity: 0 }, { size: 9, stock_quantity: 6 }]
    },
    'mock-2': {
      id: 'mock-2', name: 'Jordan Retro High', brand: 'Jordan', price: 210.00,
      description: 'Un clásico atemporal con la actitud de siempre.',
      main_image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
      images: [], category: { name: 'Basketball' },
      inventory: [{ size: 8, stock_quantity: 3 }, { size: 9, stock_quantity: 5 }, { size: 10, stock_quantity: 2 }]
    },
    'mock-3': {
      id: 'mock-3', name: 'Adidas Ultra Boost', brand: 'Adidas', price: 160.00,
      description: 'Máximo retorno de energía en cada paso.',
      main_image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800',
      images: [], category: { name: 'Running' },
      inventory: [{ size: 7.5, stock_quantity: 8 }, { size: 8.5, stock_quantity: 0 }]
    },
    'mock-4': {
      id: 'mock-4', name: 'Yeezy Boost 350', brand: 'Yeezy', price: 220.00,
      description: 'Edición limitada con diseño icónico.',
      main_image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800',
      images: [], category: { name: 'Edición Limitada' },
      inventory: [{ size: 9, stock_quantity: 1 }]
    },
    'mock-5': {
      id: 'mock-5', name: 'NB Vintage 574', brand: 'New Balance', price: 130.00,
      description: 'Estilo retro con la comodidad de todos los días.',
      main_image_url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800',
      images: [], category: { name: 'Casual / Lifestyle' },
      inventory: [{ size: 8, stock_quantity: 10 }, { size: 9, stock_quantity: 10 }]
    },
    'mock-6': {
      id: 'mock-6', name: 'Chuck Taylor 70', brand: 'Converse', price: 95.00,
      description: 'El sneaker de lona más reconocido del mundo.',
      main_image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
      images: [], category: { name: 'Casual / Lifestyle' },
      inventory: [{ size: 7, stock_quantity: 5 }, { size: 8, stock_quantity: 5 }, { size: 9, stock_quantity: 5 }]
    }
  };

  galleryImages = computed(() => {
    const p = this.product();
    if (!p) return [];
    const extra: ProductImage[] = (p.images || [])
      .slice()
      .sort((a: ProductImage, b: ProductImage) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map((img: ProductImage) => img.image_url);
    const urls: string[] = [p.main_image_url, ...extra].filter(Boolean);
    // Quitar duplicados manteniendo el orden
    return Array.from(new Set(urls));
  });

  sizes = computed<InventoryItem[]>(() => {
    const p = this.product();
    if (!p || !p.inventory) return [];
    return [...p.inventory].sort((a: InventoryItem, b: InventoryItem) => a.size - b.size);
  });

  private colorHexMap: { [key: string]: string } = {
    'Negro': '#000000',
    'Blanco': '#ffffff',
    'Gris': '#9e9e9e',
    'Rojo': '#e03131',
    'Azul': '#1971c2',
    'Verde': '#2f9e44',
    'Amarillo': '#f2c200',
    'Café': '#8b5a2b',
    'Rosa': '#f06595',
    'Morado': '#9c36b5',
    'Naranja': '#f76707',
    'Beige': '#e8dcc8'
  };

  colorList = computed<string[]>(() => {
    const p = this.product();
    if (!p || !p.colors) return [];
    return String(p.colors)
      .split(',')
      .map((c: string) => c.trim())
      .filter((c: string) => c.length > 0);
  });

  colorHex(name: string): string {
    return this.colorHexMap[name] || '#cccccc';
  }

  totalStock = computed(() => this.sizes().reduce((acc, s) => acc + s.stock_quantity, 0));

  availabilityText = computed(() => {
    const selected = this.selectedSize();
    if (selected) {
      return selected.stock_quantity > 0
        ? `${selected.stock_quantity} disponibles en talla ${selected.size}`
        : `Agotado en talla ${selected.size}`;
    }
    return this.totalStock() > 0
      ? `En stock (${this.totalStock()} unidades en total)`
      : 'Agotado';
  });

  hasDiscount = computed(() => {
    const p = this.product();
    return !!(p && p.base_price && p.base_price > p.price);
  });

  discountPercent = computed(() => {
    const p = this.product();
    if (!this.hasDiscount()) return 0;
    return Math.round(((p.base_price - p.price) / p.base_price) * 100);
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }

    this.productService.getProduct(id).subscribe({
      next: (data) => {
        // Los productos en Borrador no deben ser visibles públicamente, ni por URL directa
        if (data && data.is_active === false) {
          this.product.set(null);
        } else {
          this.setProduct(data);
        }
        this.loading.set(false);
      },
      error: () => {
        // Si el backend no responde, intentamos con el catálogo de demostración
        const mock = this.mockProducts[id];
        if (mock) {
          this.setProduct(mock);
        }
        this.loading.set(false);
      }
    });
  }

  private setProduct(data: any) {
    this.product.set(data);
    this.activeImage.set(data?.main_image_url || '');
    this.selectedSize.set(null);
    this.quantity.set(1);
  }

  selectSize(size: InventoryItem) {
    if (size.stock_quantity === 0) return;
    this.selectedSize.set(size);
    this.quantity.set(1);
  }

  increaseQty() {
    const max = this.selectedSize()?.stock_quantity || 0;
    if (this.quantity() < max) {
      this.quantity.update(q => q + 1);
    }
  }

  decreaseQty() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart() {
    const p = this.product();
    const size = this.selectedSize();
    if (!p || !size) return;

    this.cartService.addItem({
      productId: p.id,
      name: p.name,
      price: p.price,
      image: p.main_image_url,
      size: size.size,
      quantity: this.quantity()
    });

    this.addedMessage.set(`Agregaste ${this.quantity()} par(es) talla ${size.size} al carrito.`);
    setTimeout(() => this.addedMessage.set(''), 3500);
  }
}