import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div class="auth-container">
      <h2>Iniciar Sesión</h2>
      <form (ngSubmit)="doLogin()">
        <input type="email" [(ngModel)]="email" name="email" placeholder="Email" required>
        <input type="password" [(ngModel)]="password" name="password" placeholder="Contraseña" required>
        @if (errorMsg()) {
          <p class="error">{{ errorMsg() }}</p>
        }
        <button type="submit" [disabled]="loading()">
          Iniciar Sesión
        </button>
      </form>
      <p>¿No tienes cuenta? <a routerLink="/register">Regístrate</a></p>
    </div>
  `,
  styles: [`
    .auth-container { max-width: 400px; margin: 4rem auto; padding: 2rem; border: 1px solid #eee; border-radius: 8px; }
    h2 { margin-bottom: 2rem; text-align: center; }
    input { display: block; width: 100%; padding: 0.8rem; margin-bottom: 1rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
    button { width: 100%; padding: 0.8rem; background: #000; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { background: #888; cursor: not-allowed; }
    p { margin-top: 1rem; text-align: center; font-size: 0.9rem; }
    .error { color: #cc0000; background: #fff0f0; padding: 0.5rem; border-radius: 4px; }
  `]
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  
  // Usando Signals para reactividad perfecta
  loading = signal(false);
  errorMsg = signal('');

  constructor(
    private auth: AuthService, 
    private router: Router
  ) {}

  async ngOnInit() {
    await this.auth.waitForAuthInit();
    if (this.auth.currentUser()) {
      this.router.navigate(['/']);
    }
  }

  async doLogin() {
    this.errorMsg.set('');
    
    if (!this.email || !this.password) {
      this.errorMsg.set('Por favor ingresa tu correo y contraseña.');
      return;
    }

    this.loading.set(true);
    
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/']);
    } catch (error: any) {
      this.errorMsg.set(error?.message || 'Ha ocurrido un error al iniciar sesión.');
    } finally {
      this.loading.set(false);
    }
  }
}
