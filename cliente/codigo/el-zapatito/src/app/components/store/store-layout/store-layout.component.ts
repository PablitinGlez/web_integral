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
          <span class="user-email">{{ auth.currentUser()?.email }}</span>
          <a (click)="auth.logout()" class="logout-btn">Salir</a>
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
    .logout-btn { color: #cc0000 !important; }
    .user-email { color: #888; font-size: 0.9rem; }
    main { min-height: 80vh; padding: 2rem; }
    footer { padding: 2rem; text-align: center; border-top: 1px solid #eee; color: #888; }
  `]
})
export class StoreLayoutComponent {
  auth = inject(AuthService);
}
