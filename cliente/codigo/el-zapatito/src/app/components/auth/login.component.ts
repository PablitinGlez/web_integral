import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="auth-container">
      <h2>Iniciar Sesión</h2>
      <form (submit)="onSubmit()">
        <input type="email" [(ngModel)]="email" name="email" placeholder="Email" required>
        <input type="password" [(ngModel)]="password" name="password" placeholder="Contraseña" required>
        <button type="submit">Iniciar Sesión</button>
      </form>
      <p>¿No tienes cuenta? <a href="/register">Regístrate</a></p>
    </div>
  `,
  styles: [`
    .auth-container { max-width: 400px; margin: 4rem auto; padding: 2rem; border: 1px solid #eee; border-radius: 8px; }
    h2 { margin-bottom: 2rem; text-align: center; }
    input { width: 100%; padding: 0.8rem; margin-bottom: 1rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
    button { width: 100%; padding: 0.8rem; background: #000; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
    p { margin-top: 1rem; text-align: center; font-size: 0.9rem; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => alert('Error en las credenciales')
    });
  }
}
