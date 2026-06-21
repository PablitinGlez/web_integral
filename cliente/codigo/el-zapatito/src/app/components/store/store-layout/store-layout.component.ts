import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-store-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
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

        @if (!auth.currentUser()) {
          <a routerLink="/login">Iniciar Sesión</a>
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
    .user-email { color: #888; font-size: 0.9rem; }
    main { min-height: 80vh; padding: 2rem; }
    footer { padding: 2rem; text-align: center; border-top: 1px solid #eee; color: #888; }
    
    .user-menu-container { position: relative; cursor: pointer; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; }
    .dropdown-menu { position: absolute; top: 50px; right: 0; background: white; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 200px; overflow: hidden; display: flex; flex-direction: column; z-index: 200; }
    .dropdown-header { padding: 1rem; border-bottom: 1px solid #eee; font-size: 0.9rem; color: #666; background: #fafafa; word-break: break-all; }
    .dropdown-item { padding: 1rem; text-decoration: none; color: #333; transition: background 0.2s; }
    .dropdown-item:hover { background: #f5f5f5; }
    .logout-link { color: #cc0000; border-top: 1px solid #eee; }
  `]
})
export class StoreLayoutComponent {
  auth = inject(AuthService);
  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}
