import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="admin-shell">
      <aside class="sidebar">
        <div class="sidebar-header">
          <img src="logo.png" alt="Logo" class="admin-logo">
          <p class="brand-name">EL ZAPATITO</p>
          <span class="version">Admin v1.2</span>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-section">
            <span class="nav-label">General</span>
            <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <span class="material-icons">dashboard</span> Dashboard
            </a>
          </div>

          <div class="nav-section">
            <span class="nav-label">Catálogo</span>
            <a routerLink="/admin/categories" routerLinkActive="active">
              <span class="material-icons">category</span> Categorías
            </a>
            <a routerLink="/admin/brands" routerLinkActive="active">
              <span class="material-icons">sell</span> Marcas
            </a>
            <a routerLink="/admin/coupons" routerLinkActive="active">
              <span class="material-icons">discount</span> Cupones
            </a>
            <a routerLink="/admin/products" routerLinkActive="active">
              <span class="material-icons">style</span> Productos
            </a>
            <a routerLink="/admin/inventory" routerLinkActive="active">
              <span class="material-icons">inventory</span> Inventario
            </a>
            <a routerLink="/admin/suppliers" routerLinkActive="active">
              <span class="material-icons">local_shipping</span> Proveedores
            </a>
            <a routerLink="/admin/orders" routerLinkActive="active">
              <span class="material-icons">shopping_cart</span> Pedidos
            </a>
          </div>

          <div class="nav-section">
            <span class="nav-label">Configuración</span>
            <a routerLink="/admin/settings" routerLinkActive="active">
              <span class="material-icons">settings</span> Ajustes
            </a>
          </div>
        </nav>

        <div class="sidebar-footer">
          <hr>
          <a routerLink="/" class="view-store">
            <span class="material-icons">storefront</span> Ver Tienda
          </a>
        </div>
      </aside>

      <main class="main-content">
        <header class="top-bar">
          <div class="search-box">
            <span class="material-icons">search</span>
            <input type="text" placeholder="Buscar pedido, cliente...">
          </div>
          <div class="user-profile">
            <span class="material-icons">notifications</span>
            <div class="divider"></div>
            <span class="u-name">Admin Maestro</span>
            <div class="u-avatar">AM</div>
          </div>
        </header>
        <div class="content-body">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-shell { display: flex; height: 100vh; overflow: hidden; background: #fbfbfb; }
    
    /* Sidebar */
    .sidebar { width: 280px; background: #000; color: #fff; display: flex; flex-direction: column; padding: 2rem 1.5rem; }
    .sidebar-header { margin-bottom: 3rem; text-align: center; }
    .admin-logo { width: 60px; height: 60px; object-fit: contain; margin-bottom: 0.5rem; filter: invert(1); }
    .brand-name { font-weight: 800; font-size: 1.2rem; letter-spacing: 2px; margin: 0; }
    .version { font-size: 0.65rem; background: #333; padding: 0.2rem 0.6rem; border-radius: 4px; color: #aaa; }

    .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 2rem; }
    .nav-section { display: flex; flex-direction: column; gap: 0.5rem; }
    .nav-label { font-size: 0.65rem; color: #555; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-bottom: 0.5rem; }
    
    .sidebar-nav a { display: flex; align-items: center; gap: 0.8rem; color: #888; text-decoration: none; padding: 0.8rem 1rem; border-radius: 12px; font-weight: 500; transition: all 0.3s; }
    .sidebar-nav a:hover { color: #fff; background: #111; }
    .sidebar-nav a.active { background: #fff; color: #000; }
    .sidebar-nav a.active .material-icons { color: #000; }
    .material-icons { font-size: 1.2rem; min-width: 20px; }

    .sidebar-footer { padding-top: 1rem; }
    hr { border: 0; border-top: 1px solid #222; margin-bottom: 1.5rem; }
    .view-store { color: #fff; text-decoration: none; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; padding: 0.5rem; }

    /* Main Content */
    .main-content { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow-y: auto; }
    .top-bar { height: 70px; background: #fff; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; position: sticky; top: 0; z-index: 10; }
    
    .search-box { display: flex; align-items: center; gap: 0.5rem; background: #f5f5f5; padding: 0.6rem 1rem; border-radius: 10px; width: 300px; }
    .search-box input { border: none; background: transparent; outline: none; width: 100%; font-size: 0.9rem; }
    .search-box .material-icons { color: #aaa; }

    .user-profile { display: flex; align-items: center; gap: 1rem; }
    .divider { width: 1px; height: 30px; background: #eee; }
    .u-name { font-weight: 600; font-size: 0.9rem; }
    .u-avatar { width: 35px; height: 35px; background: #000; color: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; }

    .content-body { padding: 2rem; }
  `]
})
export class AdminLayoutComponent {}
