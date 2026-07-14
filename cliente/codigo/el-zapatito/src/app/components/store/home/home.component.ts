import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { CategoryService, Category } from '../../../services/category.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="home-container">
      <!-- Search & Context Section -->
      <section class="search-bar-section">
        <div class="search-container-glass">
          <span class="material-icons search-icon-left">search</span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (keyup.enter)="onSearch()" 
            placeholder="¿Qué zapatos buscas hoy? (Ej. Nike, Jordan, Running...)" 
            class="search-input">
          <button (click)="onSearch()" class="search-btn">Buscar</button>
        </div>
        <div class="quick-filters">
          <span>Tendencias:</span>
          <button class="trend-tag" (click)="onSearchTag('Minimal')">#Minimal</button>
          <button class="trend-tag" (click)="onSearchTag('Jordan')">#Jordan</button>
          <button class="trend-tag" (click)="onSearchTag('Running')">#Running</button>
        </div>
      </section>

      <!-- Hero Section -->
      <section class="hero-premium">
        <div class="hero-content">
          <span class="badge">Nueva Colección 2026</span>
          <h1>Camina con Identidad.</h1>
          <p>Diseños abstractos para personalidades únicas. Calidad premium en cada paso.</p>
          <div class="hero-actions">
            <a routerLink="/catalog" class="btn-primary">Ver Catálogo</a>
            <button (click)="scrollToFeatured()" class="btn-secondary">Saber más</button>
          </div>
        </div>
        <div class="hero-image">
          <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800" alt="Zapatito Hero">
        </div>
      </section>

      <!-- Recomendados / Filtros Preestablecidos -->
      <section class="filter-presets-section">
        <h2>Filtros Recomendados</h2>
        <p class="section-subtitle">Encuentra tu estilo ideal al instante con nuestras colecciones preestablecidas</p>
        <div class="presets-grid">
          <!-- Hombres -->
          <div class="preset-card card-men" (click)="onFilterPreset({ gender: 'Hombre' })">
            <div class="preset-overlay"></div>
            <div class="preset-content">
              <span class="material-icons preset-icon">man</span>
              <h3>Caballeros</h3>
              <p>Colección Masculina</p>
            </div>
          </div>
          <!-- Damas -->
          <div class="preset-card card-women" (click)="onFilterPreset({ gender: 'Mujer' })">
            <div class="preset-overlay"></div>
            <div class="preset-content">
              <span class="material-icons preset-icon">woman</span>
              <h3>Damas</h3>
              <p>Colección Femenina</p>
            </div>
          </div>
          <!-- Ofertas -->
          <div class="preset-card card-budget" (click)="onFilterPreset({ priceMax: 1500 })">
            <div class="preset-overlay"></div>
            <div class="preset-content">
              <span class="material-icons preset-icon">local_offer</span>
              <h3>Ofertas</h3>
              <p>Menos de $1,500</p>
            </div>
          </div>
          <!-- Luxury -->
          <div class="preset-card card-luxury" (click)="onFilterPreset({ priceMin: 3000 })">
            <div class="preset-overlay"></div>
            <div class="preset-content">
              <span class="material-icons preset-icon">stars</span>
              <h3>Luxury</h3>
              <p>Más de $3,000</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Categories Section (Dynamic) -->
      <section class="categories-section">
        <h2>Explora por Categoría</h2>
        <p class="section-subtitle">Navega por las categorías activas en nuestra tienda</p>
        
        <div class="categories-grid" *ngIf="!loadingCategories(); else loadingCategoriesSkeleton">
          <div 
            class="category-card" 
            *ngFor="let cat of dbCategories()" 
            (click)="onCategoryClick(cat.id)">
            <div class="cat-img-wrapper">
              <img [src]="cat.img" [alt]="cat.name">
            </div>
            <h3>{{ cat.name }}</h3>
            <p class="cat-desc" *ngIf="cat.description">{{ cat.description }}</p>
          </div>
        </div>

        <ng-template #loadingCategoriesSkeleton>
          <div class="categories-grid">
            <div class="category-card-skeleton" *ngFor="let item of [1, 2, 3, 4]">
              <div class="skeleton-img"></div>
              <div class="skeleton-line short"></div>
              <div class="skeleton-line medium"></div>
            </div>
          </div>
        </ng-template>
      </section>

      <!-- Featured Items (Dynamic) -->
      <section id="featured-section" class="featured-section">
        <div class="section-header">
          <div>
            <h2>Destacados ahora</h2>
            <p class="section-subtitle">Las últimas tendencias y modelos más solicitados</p>
          </div>
          <a routerLink="/catalog" class="view-all-link">Ver todo el catálogo &rarr;</a>
        </div>

        <div class="featured-grid" *ngIf="!loadingProducts(); else loadingProductsSkeleton">
          <div 
            class="product-card" 
            *ngFor="let p of featuredProducts()" 
            (click)="onProductClick(p.id)">
            <div class="badge-sale" *ngIf="p.base_price && p.base_price > p.price">Sale</div>
            <div class="img-wrapper">
              <img 
                [src]="p.main_image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400'" 
                [alt]="p.name">
              <span class="hover-view-details">Ver Detalles</span>
            </div>
            <div class="p-info">
              <p class="brand">{{ p.brand || 'El Zapatito' }}</p>
              <h4>{{ p.name }}</h4>
              <div class="price-row">
                <span class="price-old" *ngIf="p.base_price && p.base_price > p.price">
                  {{ p.base_price | currency:'USD' }}
                </span>
                <span class="price-current">{{ p.price | currency:'USD' }}</span>
              </div>
            </div>
          </div>
        </div>

        <ng-template #loadingProductsSkeleton>
          <div class="featured-grid">
            <div class="product-card-skeleton" *ngFor="let item of [1, 2, 3, 4]">
              <div class="skeleton-img"></div>
              <div class="skeleton-line short"></div>
              <div class="skeleton-line long"></div>
              <div class="skeleton-line medium"></div>
            </div>
          </div>
        </ng-template>
      </section>
    </div>
  `,
  styles: [`
    .home-container { display: flex; flex-direction: column; gap: 6rem; padding: 2rem 4rem 6rem; max-width: 1400px; margin: 0 auto; }
    
    .section-subtitle {
      font-size: 1.05rem;
      color: #666;
      margin-top: -1.5rem;
      margin-bottom: 2.5rem;
      font-weight: 400;
    }

    /* Search Bar Glassmorphism */
    .search-bar-section { text-align: center; margin-top: 1rem; }
    .search-container-glass { 
      display: flex; 
      align-items: center;
      max-width: 650px; 
      margin: 0 auto; 
      gap: 0.5rem; 
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1.5px solid rgba(0, 0, 0, 0.05);
      border-radius: 50px;
      padding: 0.4rem 0.4rem 0.4rem 1.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.03);
      transition: all 0.3s ease;
    }
    .search-container-glass:focus-within {
      background: #fff;
      border-color: #000;
      box-shadow: 0 15px 40px rgba(0,0,0,0.08);
    }
    .search-icon-left {
      color: #888;
      font-size: 1.4rem;
      margin-right: 0.2rem;
    }
    .search-input { 
      flex: 1; 
      border: none;
      background: transparent;
      font-size: 1.05rem; 
      outline: none; 
      color: #000;
      font-family: inherit;
    }
    .search-btn { 
      background: #000; 
      color: #fff; 
      border: none; 
      padding: 0.9rem 2rem; 
      border-radius: 50px; 
      cursor: pointer; 
      font-weight: 600;
      font-size: 0.95rem;
      transition: background 0.2s, transform 0.2s;
    }
    .search-btn:hover {
      background: #222;
      transform: scale(1.02);
    }
    .search-btn:active {
      transform: scale(0.98);
    }
    .quick-filters { margin-top: 1.2rem; display: flex; justify-content: center; align-items: center; gap: 0.8rem; font-size: 0.9rem; color: #888; }
    .trend-tag { 
      background: none;
      border: none;
      color: #555; 
      font-weight: 600; 
      cursor: pointer;
      font-family: inherit;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      transition: all 0.2s;
    }
    .trend-tag:hover {
      color: #000;
      background: #f0f0f0;
    }

    /* Hero Premium */
    .hero-premium { display: flex; align-items: center; justify-content: space-between; gap: 3rem; background: #fafafa; padding: 4.5rem; border-radius: 32px; overflow: hidden; border: 1px solid #f0f0f0; }
    .hero-content { flex: 1.1; }
    .badge { background: #000; color: #fff; padding: 0.4rem 1.2rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; }
    h1 { font-size: 4.2rem; margin: 1.5rem 0; line-height: 1.05; letter-spacing: -2.5px; font-weight: 800; color: #000; }
    p { font-size: 1.25rem; color: #555; margin-bottom: 2.5rem; line-height: 1.6; }
    .hero-actions { display: flex; gap: 1rem; align-items: center; }
    .btn-primary { background: #000; color: #fff; padding: 1.2rem 2.8rem; border-radius: 14px; text-decoration: none; font-weight: 600; transition: background 0.2s, transform 0.2s; }
    .btn-primary:hover { background: #222; transform: translateY(-2px); }
    .btn-secondary { background: transparent; color: #000; padding: 1.2rem 2.8rem; border-radius: 14px; text-decoration: none; font-weight: 600; border: 1.5px solid #000; cursor: pointer; font-family: inherit; transition: background 0.2s, transform 0.2s; }
    .btn-secondary:hover { background: rgba(0,0,0,0.03); transform: translateY(-2px); }
    .hero-image { flex: 0.9; display: flex; justify-content: center; }
    .hero-image img { width: 100%; max-width: 420px; border-radius: 24px; box-shadow: 0 25px 50px rgba(0,0,0,0.12); transform: rotate(-2.5deg); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    .hero-image img:hover { transform: rotate(0deg) scale(1.03); }

    /* Filtros Recomentados */
    .filter-presets-section h2 { font-size: 2.2rem; letter-spacing: -1px; margin-bottom: 2rem; font-weight: 750; }
    .presets-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
    .preset-card { 
      position: relative; 
      height: 160px; 
      border-radius: 20px; 
      overflow: hidden; 
      cursor: pointer; 
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 10px 20px rgba(0,0,0,0.02);
      border: 1px solid rgba(0,0,0,0.03);
    }
    .preset-overlay {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(255,255,255,0.05);
      transition: opacity 0.3s;
    }
    .preset-content {
      position: absolute;
      bottom: 0; left: 0; width: 100%;
      padding: 1.8rem;
      box-sizing: border-box;
      color: #fff;
      z-index: 2;
    }
    .preset-icon { font-size: 2.2rem; margin-bottom: 0.5rem; display: block; opacity: 0.9; }
    .preset-content h3 { font-size: 1.4rem; margin: 0 0 0.2rem; font-weight: 700; }
    .preset-content p { font-size: 0.85rem; margin: 0; color: rgba(255,255,255,0.8); }

    /* Presets Card Gradients */
    .card-men { background: linear-gradient(135deg, #1f2937 0%, #111827 100%); }
    .card-men:hover { transform: translateY(-5px); box-shadow: 0 20px 30px rgba(31,41,55,0.2); }
    
    .card-women { background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%); }
    .card-women:hover { transform: translateY(-5px); box-shadow: 0 20px 30px rgba(79,70,229,0.25); }

    .card-budget { background: linear-gradient(135deg, #059669 0%, #064e3b 100%); }
    .card-budget:hover { transform: translateY(-5px); box-shadow: 0 20px 30px rgba(5,150,105,0.25); }

    .card-luxury { 
      background: linear-gradient(135deg, #b45309 0%, #78350f 100%);
    }
    .card-luxury:hover { transform: translateY(-5px); box-shadow: 0 20px 30px rgba(180,83,9,0.25); }

    /* Categories */
    .categories-section h2 { font-size: 2.2rem; letter-spacing: -1px; margin-bottom: 2rem; font-weight: 750; }
    .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2.5rem; }
    .category-card { cursor: pointer; text-align: left; transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .category-card:hover { transform: translateY(-4px); }
    .cat-img-wrapper { height: 350px; border-radius: 20px; overflow: hidden; background: #f6f6f6; margin-bottom: 1.2rem; border: 1px solid #f0f0f0; }
    .cat-img-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    .category-card:hover img { transform: scale(1.05); }
    .category-card h3 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.3rem; color: #111; }
    .cat-desc { font-size: 0.9rem; color: #777; margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    /* Featured Section */
    .featured-section .section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1rem; }
    .featured-section h2 { font-size: 2.2rem; letter-spacing: -1px; margin: 0; font-weight: 750; }
    .view-all-link { color: #000; font-weight: 600; text-decoration: none; font-size: 0.95rem; border-bottom: 1.5px solid #000; padding-bottom: 0.2rem; transition: opacity 0.2s; }
    .view-all-link:hover { opacity: 0.7; }
    
    .featured-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 2rem; }
    .product-card { 
      position: relative; 
      border-radius: 20px; 
      overflow: hidden; 
      cursor: pointer;
      background: #fff;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .product-card:hover {
      transform: translateY(-6px);
    }
    .img-wrapper { 
      position: relative; 
      height: 320px; 
      border-radius: 16px; 
      overflow: hidden; 
      background: #f8f8f8;
      border: 1px solid #f5f5f5;
    }
    .img-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    .product-card:hover .img-wrapper img { transform: scale(1.04); }
    
    .hover-view-details {
      position: absolute;
      bottom: 1.2rem;
      left: 50%;
      transform: translateX(-50%) translateY(10px);
      background: #fff;
      color: #000;
      padding: 0.7rem 1.5rem;
      border-radius: 30px;
      font-weight: 700;
      font-size: 0.8rem;
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
    }
    .product-card:hover .hover-view-details {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    .badge-sale { position: absolute; top: 1rem; left: 1rem; background: #cc0000; color: #fff; padding: 0.35rem 0.9rem; border-radius: 8px; font-size: 0.72rem; font-weight: 750; z-index: 1; box-shadow: 0 4px 10px rgba(204,0,0,0.25); text-transform: uppercase; }
    
    .p-info { padding: 1.2rem 0.2rem; }
    .brand { color: #888; text-transform: uppercase; font-size: 0.72rem; font-weight: 750; margin-bottom: 0.3rem; letter-spacing: 1px; }
    h4 { margin: 0 0 0.5rem; font-size: 1.05rem; font-weight: 600; color: #111; line-height: 1.3; }
    .price-row { display: flex; align-items: center; gap: 0.6rem; }
    .price-current { font-weight: 750; font-size: 1.15rem; color: #000; }
    .price-old { text-decoration: line-through; color: #999; font-size: 0.95rem; font-weight: 500; }

    /* Skeleton loaders */
    .category-card-skeleton, .product-card-skeleton { display: flex; flex-direction: column; gap: 0.8rem; }
    .skeleton-img { height: 350px; border-radius: 20px; background: linear-gradient(90deg, #f3f3f3 25%, #eaeaea 50%, #f3f3f3 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .product-card-skeleton .skeleton-img { height: 320px; border-radius: 16px; }
    .skeleton-line { height: 14px; border-radius: 4px; background: linear-gradient(90deg, #f3f3f3 25%, #eaeaea 50%, #f3f3f3 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .skeleton-line.short { width: 45%; }
    .skeleton-line.medium { width: 65%; }
    .skeleton-line.long { width: 85%; }
    
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @media (max-width: 992px) {
      .home-container { padding: 1rem 1.5rem 4rem; gap: 4rem; }
      .hero-premium { flex-direction: column; padding: 2.5rem; text-align: center; gap: 2rem; }
      h1 { font-size: 2.8rem; letter-spacing: -1.5px; }
      .hero-actions { justify-content: center; }
      .hero-image img { max-width: 320px; }
    }
  `]
})
export class HomeComponent implements OnInit {
    router = inject(Router);
    productService = inject(ProductService);
    categoryService = inject(CategoryService);

    searchQuery = '';
    loadingCategories = signal(true);
    loadingProducts = signal(true);

    dbCategories = signal<any[]>([]);
    featuredProducts = signal<any[]>([]);

    ngOnInit() {
      // 1. Cargar Categorías Dinámicas
      this.categoryService.getCategories().subscribe({
        next: (cats) => {
          const activeCats = cats.filter(c => c.is_active !== false);
          
          const defaultImages: { [key: string]: string } = {
            'Running': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
            'Basketball': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600',
            'Casual': 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=600',
            'Deportivo': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
            'Deportivos': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600'
          };

          const mapped = activeCats.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            img: defaultImages[c.name] || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600'
          }));
          
          this.dbCategories.set(mapped.slice(0, 8));
          this.loadingCategories.set(false);
        },
        error: (err) => {
          console.error('Error cargando categorías en Home:', err);
          this.loadingCategories.set(false);
        }
      });

      // 2. Cargar Productos Destacados Dinámicos
      this.productService.getProducts().subscribe({
        next: (data) => {
          const activeProducts = (data ?? []).filter((p: any) => p.is_active !== false);
          this.featuredProducts.set(activeProducts.slice(0, 8));
          this.loadingProducts.set(false);
        },
        error: (err) => {
          console.error('Error cargando productos en Home:', err);
          this.loadingProducts.set(false);
        }
      });
    }

    onSearch() {
      if (this.searchQuery && this.searchQuery.trim()) {
        this.router.navigate(['/catalog'], { queryParams: { search: this.searchQuery.trim() } });
      } else {
        this.router.navigate(['/catalog']);
      }
    }

    onSearchTag(tag: string) {
      this.router.navigate(['/catalog'], { queryParams: { search: tag } });
    }

    onFilterPreset(params: any) {
      this.router.navigate(['/catalog'], { queryParams: params });
    }

    onCategoryClick(categoryId: string) {
      this.router.navigate(['/catalog'], { queryParams: { category: categoryId } });
    }

    onProductClick(productId: string) {
      this.router.navigate(['/product', productId]);
    }

    scrollToFeatured() {
      const element = document.getElementById('featured-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
}
