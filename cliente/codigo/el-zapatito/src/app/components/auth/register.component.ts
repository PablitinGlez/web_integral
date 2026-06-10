import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="auth-container">
      <h2>Registro</h2>
      <form (submit)="onSubmit()">
        <input type="text" [(ngModel)]="fullName" name="fullName" placeholder="Nombre completo" required>
        <input type="email" [(ngModel)]="email" name="email" placeholder="Email" required>
        <input type="password" [(ngModel)]="password" name="password" placeholder="Contraseña" required>
        <button type="submit">Crear Cuenta</button>
      </form>
    </div>
  `,
  styles: [`
    .auth-container { max-width: 400px; margin: 4rem auto; padding: 2rem; border: 1px solid #eee; border-radius: 8px; }
    h2 { margin-bottom: 2rem; text-align: center; }
    input { width: 100%; padding: 0.8rem; margin-bottom: 1rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
    button { width: 100%; padding: 0.8rem; background: #000; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
  `]
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.auth.register({ 
      full_name: this.fullName, 
      email: this.email, 
      password: this.password,
      role: 'admin' // Por ahora los creamos todos como admin para pruebas del usuario
    }).subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => alert('Error en el registro')
    });
  }
}
