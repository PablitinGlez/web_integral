import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';

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
          <select class="sort-select">
            <option>Relevancia</option>
            <option>Precio: Menor a Mayor</option>
            <option>Precio: Mayor a Menor</option>
            <option>Más buscados</option>
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
              <li>Basketball</li>
              <li>Training</li>
              <li>Edición Limitada</li>
            </ul>
          </div>

          <div class="filter-group">
            <h3>Rango de Precio</h3>
            <div class="price-range">
              <input type="range" min="50" max="500" step="10">
              <div class="range-labels">
                <span>$50</span>
                <span>$500</span>
              </div>
            </div>
          </div>

          <div class="filter-group">
            <h3>Tallas (US)</h3>
            <div class="size-grid">
              <button *ngFor="let s of sizes">{{ s }}</button>
            </div>
          </div>

          <div class="filter-group">
            <h3>Marcas</h3>
            <label class="check-container" *ngFor="let b of brands">
              {{ b }}
              <input type="checkbox">
              <span class="checkmark"></span>
            </label>
          </div>
        </aside>

        <!-- Product Grid -->
        <main class="main-content">
          <div *ngIf="products().length === 0" class="no-products">
            <p>No hay productos disponibles por ahora.</p>
          </div>

          <div class="product-grid">
            <div *ngFor="let item of products()" class="product-card">
              <div class="img-container">
                <img [src]="item.main_image_url" [alt]="item.name">
                <button class="quick-add">+</button>
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
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .catalog-page { padding: 2rem 0; }
    
    /* Header */
    .catalog-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; border-bottom: 1px solid #eee; padding-bottom: 2rem; }
    h1 { font-size: 3rem; letter-spacing: -2px; margin: 0; }
    .catalog-controls { display: flex; align-items: center; gap: 2rem; }
    .results-count { color: #888; font-size: 0.9rem; margin: 0; }
    .sort-select { border: none; font-weight: 600; outline: none; background: transparent; cursor: pointer; padding: 0.5rem; }

    /* Layout */
    .catalog-layout { display: grid; grid-template-columns: 250px 1fr; gap: 4rem; }

    /* Sidebar Filters */
    .sidebar { display: flex; flex-direction: column; gap: 3rem; }
    .filter-group h3 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 1.5rem; color: #999; }
    .filter-group ul { list-style: none; padding: 0; margin: 0; }
    .filter-group li { padding: 0.5rem 0; cursor: pointer; color: #555; transition: color 0.3s; font-weight: 500; }
    .filter-group li:hover, .filter-group li.active { color: #000; }
    
    .price-range { padding: 0 0.5rem; }
    input[type="range"] { width: 100%; accent-color: #000; cursor: pointer; }
    .range-labels { display: flex; justify-content: space-between; font-size: 0.8rem; color: #888; margin-top: 0.5rem; }

    .size-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
    .size-grid button { background: #fff; border: 1px solid #eee; padding: 0.5rem; border-radius: 8px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
    .size-grid button:hover { border-color: #000; background: #fafafa; }

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

    .brand { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 700; margin: 0 0 0.5rem; }
    .name { font-size: 1.1rem; font-weight: 600; margin: 0 0 1rem; color: #111; }
    .bottom-info { display: flex; justify-content: space-between; align-items: center; }
    .price { font-size: 1.2rem; font-weight: 700; margin: 0; }
    .tag { font-size: 0.6rem; color: #000; border: 1px solid #000; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; text-transform: uppercase; }

    .no-products { text-align: center; padding: 5rem; border: 1px dashed #eee; border-radius: 20px; color: #888; }

    @media (max-width: 992px) {
      .catalog-layout { grid-template-columns: 1fr; }
      .sidebar { display: none; } /* En producción haríamos un modal para filtros */
      h1 { font-size: 2.2rem; }
    }
  `]
})
export class CatalogComponent implements OnInit {
  productService = inject(ProductService);
  
  products = signal<any[]>([]);

  sizes = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'];
  brands = ['Nike', 'Jordan', 'Adidas', 'New Balance', 'Yeezy', 'Converse'];

  mockProducts = [
    {
      name: 'Nike Air Max Minimal',
      brand: 'Nike',
      price: 189.99,
      main_image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Jordan Retro High',
      brand: 'Jordan',
      price: 210.00,
      main_image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Adidas Ultra Boost',
      brand: 'Adidas',
      price: 160.00,
      main_image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Yeezy Boost 350',
      brand: 'Yeezy',
      price: 220.00,
      main_image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'NB Vintage 574',
      brand: 'New Balance',
      price: 130.00,
      main_image_url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=600'
    },
    {
      name: 'Chuck Taylor 70',
      brand: 'Converse',
      price: 95.00,
      main_image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600'
    }
  ];

  ngOnInit() {
    // Inicializamos con mock para que se vea rico de inmediato
    this.products.set(this.mockProducts);

    this.productService.getProducts().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.products.set(data);
        }
      },
      error: () => {
        console.warn('API con problemas, usando datos de prueba ampliados.');
      }
    });
  }
}
