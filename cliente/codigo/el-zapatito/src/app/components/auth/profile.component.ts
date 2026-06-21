import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <h2>Mi Perfil</h2>
      <div class="profile-card">
        <div class="profile-avatar">
          {{ auth.currentUser()?.email?.charAt(0)?.toUpperCase() || 'U' }}
        </div>
        <div class="profile-details">
          <h3>Información de la Cuenta</h3>
          <div class="detail-row">
            <span class="label">Correo Electrónico:</span>
            <span class="value">{{ auth.currentUser()?.email }}</span>
          </div>
          @if (auth.isAdmin()) {
            <div class="detail-row">
              <span class="label">Rol:</span>
              <span class="value badge-admin">rol_administrador</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container { max-width: 600px; margin: 2rem auto; padding: 2rem; }
    h2 { margin-bottom: 2rem; color: #333; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
    .profile-card { display: flex; gap: 2rem; align-items: flex-start; background: #f9f9f9; padding: 2rem; border-radius: 12px; border: 1px solid #eee; }
    .profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: bold; flex-shrink: 0; }
    .profile-details { flex: 1; }
    h3 { margin-top: 0; margin-bottom: 1.5rem; font-size: 1.2rem; }
    .detail-row { display: flex; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .label { font-weight: 600; width: 180px; color: #666; }
    .value { color: #000; }
    .badge-admin { background: #000; color: #fff; padding: 0.2rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: bold; }
  `]
})
export class ProfileComponent {
  auth = inject(AuthService);
}
