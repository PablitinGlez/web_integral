import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <!-- Search & Context Section -->
      <section class="search-bar-section">
        <div class="search-container">
          <input type="text" placeholder="¿Qué zapatos buscas hoy?" class="search-input">
          <button class="search-btn">Buscar</button>
        </div>
        <div class="quick-filters">
          <span>Tendencias:</span>
          <a href="#">#Minimal</a>
          <a href="#">#Deportivo</a>
          <a href="#">#EdiciónLimitada</a>
        </div>
      </section>

      <!-- Hero Section -->
      <section class="hero-premium">
        <div class="hero-content">
          <span class="badge">Nueva Colección 2026</span>
          <h1>Camina con Identidad.</h1>
          <p>Diseños abstractos para personalidades únicas. Calidad premium en cada paso.</p>
          <div class="hero-actions">
            <a href="/catalog" class="btn-primary">Ver Catálogo</a>
            <a href="#" class="btn-secondary">Saber más</a>
          </div>
        </div>
        <div class="hero-image">
          <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800" alt="Zapatito Hero">
        </div>
      </section>

      <!-- Static Categories -->
      <section class="categories-section">
        <h2>Explora por Categoría</h2>
        <div class="categories-grid">
          <div class="category-card" *ngFor="let cat of categories">
            <div class="cat-img-wrapper">
              <img [src]="cat.img" [alt]="cat.name">
            </div>
            <h3>{{ cat.name }}</h3>
          </div>
        </div>
      </section>

      <!-- Featured Items -->
      <section class="featured-section">
        <div class="section-header">
          <h2>Destacados ahora</h2>
          <a href="/catalog">Ver todo &rarr;</a>
        </div>
        <div class="featured-grid">
          <div class="product-card-static" *ngFor="let p of featured">
            <div class="badge-sale" *ngIf="p.sale">Sale</div>
            <img [src]="p.img" [alt]="p.name">
            <div class="p-info">
              <p class="brand">{{ p.brand }}</p>
              <h4>{{ p.name }}</h4>
              <p class="price">{{ p.price | currency:'USD' }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container { display: flex; flex-direction: column; gap: 5rem; padding-bottom: 5rem; }
    
    /* Search Bar */
    .search-bar-section { text-align: center; margin-top: 2rem; }
    .search-container { display: flex; max-width: 600px; margin: 0 auto; gap: 0.5rem; }
    .search-input { flex: 1; padding: 1rem 1.5rem; border: 1.5px solid #eee; border-radius: 50px; font-size: 1rem; outline: none; transition: border-color 0.3s; }
    .search-input:focus { border-color: #000; }
    .search-btn { background: #000; color: #fff; border: none; padding: 0 1.5rem; border-radius: 50px; cursor: pointer; }
    .quick-filters { margin-top: 1rem; display: flex; justify-content: center; gap: 1rem; font-size: 0.85rem; color: #888; }
    .quick-filters a { text-decoration: none; color: #555; font-weight: 500; }

    /* Hero Premium */
    .hero-premium { display: flex; align-items: center; justify-content: space-between; gap: 3rem; background: #fafafa; padding: 4rem; border-radius: 24px; overflow: hidden; }
    .hero-content { flex: 1; }
    .badge { background: #000; color: #fff; padding: 0.4rem 1rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    h1 { font-size: 4rem; margin: 1.5rem 0; line-height: 1.1; letter-spacing: -2px; }
    p { font-size: 1.25rem; color: #666; margin-bottom: 2.5rem; line-height: 1.6; }
    .hero-actions { display: flex; gap: 1rem; }
    .btn-primary { background: #000; color: #fff; padding: 1.2rem 2.5rem; border-radius: 12px; text-decoration: none; font-weight: 600; }
    .btn-secondary { background: transparent; color: #000; padding: 1.2rem 2.5rem; border-radius: 12px; text-decoration: none; font-weight: 600; border: 1.5px solid #000; }
    .hero-image { flex: 1; }
    .hero-image img { width: 100%; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); transform: rotate(-2deg); transition: transform 0.5s; }
    .hero-image img:hover { transform: rotate(0deg); }

    /* Categories */
    .categories-section h2 { margin-bottom: 3rem; font-size: 2.5rem; letter-spacing: -1px; }
    .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
    .category-card { cursor: pointer; text-align: center; }
    .cat-img-wrapper { height: 350px; border-radius: 16px; overflow: hidden; background: #eee; margin-bottom: 1.5rem; }
    .cat-img-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .category-card:hover img { transform: scale(1.1); }
    .category-card h3 { font-size: 1.25rem; font-weight: 600; }

    /* Featured */
    .featured-section .section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; }
    .featured-section h2 { font-size: 2.5rem; letter-spacing: -1px; margin: 0; }
    .featured-section a { color: #000; font-weight: 600; text-decoration: none; }
    .featured-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 2rem; }
    .product-card-static { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid #f0f0f0; transition: border-color 0.3s; }
    .product-card-static:hover { border-color: #ccc; }
    .product-card-static img { width: 100%; height: 320px; object-fit: cover; }
    .badge-sale { position: absolute; top: 1rem; left: 1rem; background: #cc0000; color: #fff; padding: 0.3rem 0.8rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; z-index: 1; }
    .p-info { padding: 1.5rem; }
    .brand { color: #888; text-transform: uppercase; font-size: 0.7rem; font-weight: 700; margin-bottom: 0.5rem; }
    h4 { margin: 0 0 0.5rem; font-size: 1.1rem; }
    .price { font-weight: 700; font-size: 1.2rem; }

    @media (max-width: 768px) {
      .hero-premium { flex-direction: column; padding: 2rem; text-align: center; }
      h1 { font-size: 2.5rem; }
      .hero-actions { justify-content: center; }
    }
  `]
})
export class HomeComponent {
  categories = [
    { name: 'Deportivo', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600' },
    { name: 'Casual', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600' },
    { name: 'Formal', img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600' },
    { name: 'Básicos', img: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600' }
  ];

  featured = [
    { brand: 'Nike', name: 'Air Zoom Terra', price: 145, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400', sale: true },
    { brand: 'Adidas', name: 'UltraBoost 22', price: 180, img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=400', sale: false },
    { brand: 'New Balance', name: 'Vintage 574', price: 110, img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=400', sale: false },
    { brand: 'Converse', name: 'Chuck Taylor All Star', price: 65, img: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=400', sale: true }
  ];
}
