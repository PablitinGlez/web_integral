import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <header class="page-header">
        <div>
          <h1>Ajustes</h1>
          <p class="subtitle">Configura tu tienda, integraciones y preferencias</p>
        </div>
        <button class="btn-save" (click)="saveSettings()">
          <span class="material-icons">save</span> Guardar Cambios
        </button>
      </header>

      <div class="settings-layout">
        <!-- Sidebar de Pestañas -->
        <nav class="settings-tabs">
          <button *ngFor="let tab of tabs" class="settings-tab" [class.active]="activeTab === tab.id" (click)="activeTab = tab.id">
            <span class="material-icons">{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </button>
        </nav>

        <!-- Contenido de Ajustes -->
        <div class="settings-body">

          <!-- Pestaña Perfil -->
          <div *ngIf="activeTab === 'profile'" class="settings-section">
            <h2>Perfil de Administrador</h2>
            <p class="section-desc">Actualiza tu información de acceso al panel.</p>

            <div class="fields-grid">
              <div class="field">
                <label>Nombre Completo</label>
                <input type="text" [(ngModel)]="profile.fullName" placeholder="Admin Maestro">
              </div>
              <div class="field">
                <label>Correo Electrónico</label>
                <input type="email" [(ngModel)]="profile.email" placeholder="admin@elzapatito.com">
              </div>
              <div class="field">
                <label>Nueva Contraseña</label>
                <input type="password" [(ngModel)]="profile.password" placeholder="••••••••••">
              </div>
              <div class="field">
                <label>Confirmar Contraseña</label>
                <input type="password" [(ngModel)]="profile.confirmPassword" placeholder="••••••••••">
              </div>
            </div>
          </div>

          <!-- Pestaña Integraciones -->
          <div *ngIf="activeTab === 'integrations'" class="settings-section">
            <h2>Integraciones</h2>
            <p class="section-desc">Tus conexiones a servicios externos. Solo lectura por seguridad.</p>

            <div class="integration-card">
              <div class="integration-header">
                <div class="integration-icon supabase">
                  <span class="material-icons">storage</span>
                </div>
                <div>
                  <h3>Supabase (Base de Datos)</h3>
                  <p>PostgreSQL en la nube</p>
                </div>
                <span class="status-connected">
                  <span class="dot-green"></span> Conectado
                </span>
              </div>
              <div class="integration-fields">
                <div class="field">
                  <label>URL del Proyecto</label>
                  <input type="text" readonly [value]="integrations.supabaseUrl">
                </div>
                <div class="field">
                  <label>Region</label>
                  <input type="text" readonly value="us-east-1 (AWS)">
                </div>
              </div>
            </div>

            <div class="integration-card">
              <div class="integration-header">
                <div class="integration-icon cloudinary">
                  <span class="material-icons">cloud_upload</span>
                </div>
                <div>
                  <h3>Cloudinary (Imágenes)</h3>
                  <p>Almacenamiento de medios en la nube</p>
                </div>
                <span class="status-connected">
                  <span class="dot-green"></span> Activo
                </span>
              </div>
              <div class="integration-fields">
                <div class="field">
                  <label>Cloud Name</label>
                  <input type="text" readonly [value]="integrations.cloudinaryName">
                </div>
                <div class="field">
                  <label>API Key</label>
                  <input type="text" readonly [value]="integrations.cloudinaryKey">
                </div>
              </div>
            </div>
          </div>

          <!-- Pestaña Tienda -->
          <div *ngIf="activeTab === 'store'" class="settings-section">
            <h2>Preferencias de la Tienda</h2>
            <p class="section-desc">Configura los parámetros generales de tu negocio.</p>

            <div class="fields-grid">
              <div class="field">
                <label>Nombre de la Tienda</label>
                <input type="text" [(ngModel)]="store.name" placeholder="El Zapatito">
              </div>
              <div class="field">
                <label>Divisa</label>
                <select [(ngModel)]="store.currency" class="styled-select">
                  <option value="USD">USD – Dólar estadounidense</option>
                  <option value="MXN">MXN – Peso mexicano</option>
                  <option value="EUR">EUR – Euro</option>
                </select>
              </div>
              <div class="field">
                <label>Porcentaje de Impuesto (%)</label>
                <input type="number" [(ngModel)]="store.tax" min="0" max="100">
              </div>
              <div class="field">
                <label>Costo de Envío Estándar</label>
                <input type="number" [(ngModel)]="store.shipping" min="0">
              </div>
              <div class="field span-2">
                <label>Política de Devoluciones</label>
                <textarea [(ngModel)]="store.returnPolicy" rows="4" placeholder="Describe tu política de devoluciones..."></textarea>
              </div>
            </div>

            <div class="toggle-row">
              <div class="toggle-item">
                <div>
                  <p class="toggle-label">Modo Mantenimiento</p>
                  <p class="toggle-desc">Oculta la tienda a los clientes mientras actualizas el catálogo.</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="store.maintenanceMode">
                  <span class="slider"></span>
                </label>
              </div>
              <div class="toggle-item">
                <div>
                  <p class="toggle-label">Envío Gratis Automático</p>
                  <p class="toggle-desc">Aplica envío gratis a todos los pedidos que superen $150.</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="store.freeShipping">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Toast de confirmación -->
      <div class="toast" [class.show]="showToast">
        <span class="material-icons">check_circle</span> Cambios guardados exitosamente
      </div>
    </div>
  `,
  styles: [`
    .settings-container { padding: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    h1 { font-size: 2.2rem; letter-spacing: -1px; margin: 0 0 0.5rem; }
    .subtitle { color: #888; margin: 0; }

    .btn-save { 
      background: #000; 
      color: #fff; 
      border: none; 
      padding: 0.8rem 1.5rem; 
      border-radius: 12px; 
      font-weight: 600; 
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      gap: 0.5rem;
      font-family: inherit;
      font-size: 0.95rem;
      transition: background 0.2s;
    }
    .btn-save:hover { background: #222; }

    /* Layout */
    .settings-layout { display: grid; grid-template-columns: 220px 1fr; gap: 2rem; align-items: start; }
    
    /* Tabs Nav */
    .settings-tabs { 
      background: #fff; 
      border: 1px solid #eee; 
      border-radius: 20px; 
      padding: 0.8rem; 
      display: flex; 
      flex-direction: column; 
      gap: 0.3rem;
    }
    .settings-tab { 
      background: transparent; 
      border: none; 
      padding: 0.8rem 1.2rem; 
      border-radius: 12px; 
      cursor: pointer; 
      font-weight: 600; 
      font-size: 0.9rem; 
      color: #888; 
      display: flex; 
      align-items: center; 
      gap: 0.7rem;
      transition: all 0.2s;
      text-align: left;
      font-family: inherit;
    }
    .settings-tab:hover { color: #000; background: #f5f5f5; }
    .settings-tab.active { background: #000; color: #fff; }
    .settings-tab .material-icons { font-size: 1.1rem; }

    /* Settings Body */
    .settings-body { background: #fff; border: 1px solid #eee; border-radius: 20px; padding: 2.5rem; }
    .settings-section h2 { font-size: 1.5rem; margin: 0 0 0.4rem; }
    .section-desc { color: #888; margin: 0 0 2.5rem; font-size: 0.95rem; }

    /* Fields */
    .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .span-2 { grid-column: 1 / -1; }
    .field { display: flex; flex-direction: column; gap: 0.5rem; }
    .field label { font-size: 0.82rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.3px; }
    .field input, .field textarea, .styled-select { 
      padding: 0.9rem 1rem; 
      border: 1px solid #e8e8e8; 
      border-radius: 12px; 
      font-size: 0.95rem; 
      font-family: inherit;
      outline: none;
      transition: border 0.2s;
      background: #fafafa;
    }
    .field input:focus, .field textarea:focus, .styled-select:focus { border-color: #000; background: #fff; }
    .field input[readonly] { background: #f5f5f5; color: #888; cursor: default; }
    .field textarea { resize: vertical; }

    /* Integration Cards */
    .integration-card { background: #fafafa; border: 1px solid #eee; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; }
    .integration-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .integration-icon { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .integration-icon.supabase { background: #3ecf8e22; color: #3ecf8e; }
    .integration-icon.cloudinary { background: #3448c522; color: #3448c5; }
    .integration-header h3 { margin: 0 0 0.2rem; font-size: 1rem; }
    .integration-header p { margin: 0; color: #888; font-size: 0.85rem; }
    .status-connected { margin-left: auto; display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; font-weight: 600; color: #059669; background: #d1fae5; padding: 0.35rem 0.9rem; border-radius: 20px; }
    .dot-green { width: 7px; height: 7px; background: #059669; border-radius: 50%; }
    .integration-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    /* Toggles */
    .toggle-row { display: flex; flex-direction: column; gap: 0; margin-top: 2.5rem; border: 1px solid #eee; border-radius: 16px; overflow: hidden; }
    .toggle-item { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 1.8rem; border-bottom: 1px solid #f5f5f5; gap: 2rem; }
    .toggle-item:last-child { border-bottom: none; }
    .toggle-label { font-weight: 700; margin: 0 0 0.2rem; }
    .toggle-desc { color: #888; font-size: 0.85rem; margin: 0; }

    .toggle-switch { position: relative; display: inline-block; width: 50px; height: 28px; flex-shrink: 0; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; inset: 0; background-color: #e8e8e8; border-radius: 28px; transition: 0.3s; }
    .slider:before { position: absolute; content: ""; height: 22px; width: 22px; left: 3px; bottom: 3px; background-color: white; border-radius: 50%; transition: 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
    input:checked + .slider { background-color: #000; }
    input:checked + .slider:before { transform: translateX(22px); }

    /* Toast */
    .toast { 
      position: fixed; 
      bottom: 2rem; 
      right: 2rem; 
      background: #000; 
      color: #fff; 
      padding: 1rem 1.5rem; 
      border-radius: 14px; 
      font-weight: 600; 
      display: flex; 
      align-items: center; 
      gap: 0.5rem; 
      opacity: 0; 
      transform: translateY(20px); 
      transition: all 0.3s ease;
      pointer-events: none;
      z-index: 1000;
    }
    .toast.show { opacity: 1; transform: translateY(0); }

    @media (max-width: 900px) {
      .settings-layout { grid-template-columns: 1fr; }
      .settings-tabs { flex-direction: row; flex-wrap: wrap; }
      .fields-grid { grid-template-columns: 1fr; }
      .integration-fields { grid-template-columns: 1fr; }
    }
  `]
})
export class SettingsComponent {
  activeTab = 'profile';
  showToast = false;

  tabs = [
    { id: 'profile', label: 'Perfil', icon: 'person' },
    { id: 'integrations', label: 'Integraciones', icon: 'electrical_services' },
    { id: 'store', label: 'Tienda', icon: 'store' },
  ];

  profile = {
    fullName: 'Admin Maestro',
    email: 'admin@elzapatito.com',
    password: '',
    confirmPassword: ''
  };

  integrations = {
    supabaseUrl: 'https://fnkmgolemfkyqldopjfr.supabase.co',
    cloudinaryName: 'dxgriy1hu',
    cloudinaryKey: '597316714382799'
  };

  store = {
    name: 'El Zapatito',
    currency: 'USD',
    tax: 16,
    shipping: 9.99,
    returnPolicy: 'Aceptamos devoluciones dentro de los 30 días posteriores a la compra. El producto debe estar en perfectas condiciones y con su empaque original.',
    maintenanceMode: false,
    freeShipping: true
  };

  saveSettings() {
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
}
