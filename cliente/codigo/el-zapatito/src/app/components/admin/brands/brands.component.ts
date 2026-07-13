import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BrandService, Brand } from '../../../services/brand.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="brands-container">
      <nav class="breadcrumbs">
        <a routerLink="/admin">Dashboard</a>
        <span class="separator">/</span>
        <span class="current">Marcas</span>
      </nav>

      <header class="page-header">
        <div>
          <h1>Gestión de Marcas</h1>
          <p class="subtitle">Administra las marcas de calzado disponibles en tu catálogo (ej. Nike, Adidas)</p>
        </div>
        <button class="btn-primary" (click)="openFormDrawer()">
          <span class="material-icons">add</span> Nueva Marca
        </button>
      </header>

      <div class="table-card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (brand of brands(); track brand.id) {
                <tr [class.inactive-row]="!brand.is_active">
                  <td class="font-bold">{{ brand.name }}</td>
                  <td class="desc-text">{{ brand.description || 'Sin descripción' }}</td>
                  <td>
                    <!-- Toggle de estado -->
                    <button class="toggle-btn" [class.on]="brand.is_active" (click)="confirmToggle(brand)" [title]="brand.is_active ? 'Desactivar' : 'Activar'">
                      <span class="toggle-track">
                        <span class="toggle-thumb"></span>
                      </span>
                      <span class="toggle-label">{{ brand.is_active ? 'Activa' : 'Inactiva' }}</span>
                    </button>
                  </td>
                  <td class="actions-col">
                    <button class="btn-icon" title="Editar" (click)="openFormDrawer(brand)">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-icon btn-delete" title="Eliminar" (click)="confirmDelete(brand)">
                      <span class="material-icons">delete</span>
                    </button>
                  </td>
                </tr>
              }
              @if (brands().length === 0) {
                <tr>
                  <td colspan="4" class="empty-state">
                    <span class="material-icons">sell</span>
                    <p>No hay marcas registradas.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Drawer de Creación / Edición -->
      @if (showFormDrawer()) {
        <div class="backdrop" (click)="closeFormDrawer()">
          <div class="drawer" (click)="$event.stopPropagation()">
            <header class="drawer-header">
              <h2>{{ editingId() ? 'Editar Marca' : 'Nueva Marca' }}</h2>
              <button class="btn-close" (click)="closeFormDrawer()"><span class="material-icons">close</span></button>
            </header>
            <div class="drawer-body">
              @if (formErrorMessage()) {
                <div class="error-banner">
                  <span class="material-icons">error_outline</span>
                  <span>{{ formErrorMessage() }}</span>
                </div>
              }

              <div class="field">
                <label>Nombre de la Marca <span class="required-asterisk">*</span></label>
                <input type="text" [(ngModel)]="formData.name" (input)="clearFormError()" placeholder="Ej. Nike, Adidas, Reebok" maxlength="105">
                @if (formData.name && formData.name.trim().length > 100) {
                  <span class="field-error">El nombre no puede superar los 100 caracteres.</span>
                }
              </div>
              <div class="field">
                <label>Descripción</label>
                <textarea rows="3" [(ngModel)]="formData.description" (input)="clearFormError()" placeholder="Breve descripción e historia de la marca..." maxlength="505"></textarea>
                @if (formData.description && formData.description.length > 500) {
                  <span class="field-error">La descripción no puede superar los 500 caracteres.</span>
                }
              </div>
              @if (editingId()) {
                <div class="field">
                  <label>Estado de la Marca</label>
                  <div class="toggle-row-form">
                    <button class="toggle-btn" [class.on]="formData.is_active" (click)="formData.is_active = !formData.is_active">
                      <span class="toggle-track"><span class="toggle-thumb"></span></span>
                    </button>
                    <span class="toggle-text">{{ formData.is_active ? 'Activa (Disponible para asignar a productos)' : 'Inactiva (Oculta para asignar)' }}</span>
                  </div>
                </div>
              }
            </div>
            <footer class="drawer-footer">
              <button class="btn-secondary" (click)="closeFormDrawer()">Cancelar</button>
              <button class="btn-primary" (click)="saveBrand()" [disabled]="loading() || (formData.name && formData.name.trim().length > 100) || (formData.description && formData.description.length > 500)">
                {{ loading() ? 'Guardando...' : 'Guardar' }}
              </button>
            </footer>
          </div>
        </div>
      }

      <!-- Modal de Confirmación (Activar / Desactivar) -->
      @if (showConfirmModal()) {
        <div class="backdrop center" (click)="closeConfirmModal()">
          <div class="confirm-modal" (click)="$event.stopPropagation()">
            <div class="confirm-icon" [class.deactivate]="brandToToggle()?.is_active">
              <span class="material-icons">{{ brandToToggle()?.is_active ? 'toggle_off' : 'toggle_on' }}</span>
            </div>
            <h3>{{ brandToToggle()?.is_active ? 'Desactivar Marca' : 'Activar Marca' }}</h3>
            <p>
              @if (brandToToggle()?.is_active) {
                La marca <strong>"{{ brandToToggle()?.name }}"</strong> quedará oculta para asignar a nuevos productos. Los productos vinculados no se verán afectados.
              } @else {
                La marca <strong>"{{ brandToToggle()?.name }}"</strong> volverá a estar disponible para asignar y filtrar.
              }
            </p>
            <div class="confirm-actions">
              <button class="btn-secondary" (click)="closeConfirmModal()">Cancelar</button>
              <button [class]="brandToToggle()?.is_active ? 'btn-danger' : 'btn-success'" (click)="executeToggle()">
                {{ brandToToggle()?.is_active ? 'Sí, Desactivar' : 'Sí, Activar' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal de Confirmación (Eliminar) -->
      @if (showDeleteModal()) {
        <div class="backdrop center" (click)="closeDeleteModal()">
          <div class="confirm-modal" (click)="$event.stopPropagation()">
            <div class="confirm-icon deactivate">
              <span class="material-icons">delete_forever</span>
            </div>
            <h3>Eliminar Marca</h3>
            <p>
              ¿Estás seguro de que deseas eliminar permanentemente la marca <strong>"{{ brandToDelete()?.name }}"</strong>? Esta acción no se puede deshacer.
            </p>

            @if (deleteErrorMessage()) {
              <div class="error-banner">
                <span class="material-icons">error_outline</span>
                <span>{{ deleteErrorMessage() }}</span>
              </div>
            }

            <div class="confirm-actions">
              <button class="btn-secondary" (click)="closeDeleteModal()" [disabled]="loading()">Cancelar</button>
              <button class="btn-danger" (click)="executeDelete()" [disabled]="loading()">
                {{ loading() ? 'Eliminando...' : 'Sí, Eliminar' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .brands-container { padding: 1rem; }
    
    /* Breadcrumbs */
    .breadcrumbs { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #666; margin-bottom: 1.5rem; }
    .breadcrumbs a { color: #888; text-decoration: none; transition: color 0.2s; }
    .breadcrumbs a:hover { color: #000; text-decoration: underline; }
    .separator { color: #ccc; }
    .current { color: #000; font-weight: 600; }

    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { font-size: 2.2rem; letter-spacing: -1px; margin: 0 0 0.5rem; }
    .subtitle { color: #888; margin: 0; }
    
    .btn-primary { background: #000; color: #fff; border: none; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: background 0.3s; }
    .btn-primary:hover { background: #222; }
    .btn-primary:disabled { background: #888; cursor: not-allowed; }
    .btn-secondary { background: #f5f5f5; color: #333; border: none; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; transition: background 0.3s; }
    .btn-secondary:hover { background: #e5e5e5; }
    .btn-danger { background: #e03131; color: #fff; border: none; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .btn-danger:hover { background: #c92a2a; }
    .btn-danger:disabled { background: #fca5a5; cursor: not-allowed; }
    .btn-success { background: #2f9e44; color: #fff; border: none; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .btn-success:hover { background: #2b8a3e; }
    .btn-icon { background: none; border: none; cursor: pointer; color: #666; padding: 0.5rem; border-radius: 8px; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; }
    .btn-icon:hover { background: #f0f0f0; color: #000; }
    .btn-icon.btn-delete:hover { background: #fff5f5; color: #e03131; }

    .table-card { background: #fff; border: 1px solid #eee; border-radius: 20px; overflow: hidden; }
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1.2rem 1.5rem; color: #999; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #f5f5f5; font-weight: 700; }
    td { padding: 1rem 1.5rem; border-bottom: 1px solid #f9f9f9; font-size: 0.95rem; vertical-align: middle; }
    .font-bold { font-weight: 600; }
    .desc-text { color: #666; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .actions-col { text-align: right; white-space: nowrap; display: flex; justify-content: flex-end; gap: 0.25rem; }
    .inactive-row td { opacity: 0.55; }
    .empty-state { text-align: center; padding: 4rem 2rem; color: #aaa; }
    .empty-state .material-icons { font-size: 3rem; margin-bottom: 1rem; color: #ccc; display: block; }

    /* Toggle Switch */
    .toggle-btn { background: none; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.6rem; padding: 0; }
    .toggle-track { width: 42px; height: 24px; border-radius: 12px; background: #ddd; position: relative; transition: background 0.25s; display: block; flex-shrink: 0; }
    .toggle-btn.on .toggle-track { background: #2f9e44; }
    .toggle-thumb { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform 0.25s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    .toggle-btn.on .toggle-thumb { transform: translateX(18px); }
    .toggle-label { font-size: 0.85rem; font-weight: 600; color: #555; }
    .toggle-btn.on .toggle-label { color: #2f9e44; }
    .toggle-row-form { display: flex; align-items: center; gap: 1rem; }
    .toggle-text { font-size: 0.9rem; color: #555; }

    /* Backdrop compartido */
    .backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; justify-content: flex-end; z-index: 100; }
    .backdrop.center { justify-content: center; align-items: center; }

    /* Drawer (Slider Derecho) */
    .drawer { background: #fff; width: 100%; max-width: 450px; height: 100vh; display: flex; flex-direction: column; box-shadow: -10px 0 30px rgba(0,0,0,0.1); animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .drawer-header { padding: 1.5rem 2rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .drawer-header h2 { margin: 0; font-size: 1.4rem; }
    .btn-close { background: none; border: none; cursor: pointer; color: #999; display: flex; align-items: center; padding: 0; transition: color 0.2s; }
    .btn-close:hover { color: #000; }
    .drawer-body { padding: 2rem; flex: 1; overflow-y: auto; }
    .field { margin-bottom: 1.5rem; }
    .field > label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; color: #444; }
    input[type="text"], textarea { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; font-family: inherit; font-size: 0.95rem; }
    input:focus, textarea:focus { border-color: #000; outline: none; }
    .drawer-footer { padding: 1.5rem 2rem; border-top: 1px solid #eee; background: #fafafa; display: flex; justify-content: flex-end; gap: 1rem; }

    /* Confirm Modal */
    .confirm-modal { background: #fff; border-radius: 20px; padding: 2.5rem; max-width: 420px; width: 90%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.15); animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .confirm-icon { width: 70px; height: 70px; border-radius: 50%; background: #e6fced; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
    .confirm-icon .material-icons { font-size: 2rem; color: #2f9e44; }
    .confirm-icon.deactivate { background: #fff5f5; }
    .confirm-icon.deactivate .material-icons { color: #e03131; }
    .confirm-modal h3 { margin: 0 0 0.75rem; font-size: 1.3rem; }
    .confirm-modal p { color: #666; margin: 0 0 2rem; line-height: 1.5; }
    .confirm-actions { display: flex; gap: 1rem; justify-content: center; }

    /* Estilos de errores y avisos */
    .required-asterisk { color: #e03131; margin-left: 0.2rem; }
    .field-error { display: block; color: #e03131; font-size: 0.8rem; margin-top: 0.25rem; font-weight: 500; }
    .error-banner { display: flex; align-items: center; gap: 0.75rem; background: #fff5f5; border: 1px solid #ffc9c9; color: #c92a2a; padding: 0.8rem 1.2rem; border-radius: 10px; margin-bottom: 1.5rem; font-size: 0.9rem; text-align: left; line-height: 1.4; }
    .error-banner .material-icons { color: #e03131; font-size: 1.3rem; flex-shrink: 0; }
  `]
})
export class BrandsComponent implements OnInit {
  brandService = inject(BrandService);
  toast = inject(ToastService);

  brands = signal<Brand[]>([]);
  loading = signal(false);

  // Form Drawer State
  showFormDrawer = signal(false);
  editingId = signal<string | null>(null);
  formData = { name: '', description: '', is_active: true };
  formErrorMessage = signal<string | null>(null);

  // Confirm Status Modal State
  showConfirmModal = signal(false);
  brandToToggle = signal<Brand | null>(null);

  // Confirm Delete Modal State
  showDeleteModal = signal(false);
  brandToDelete = signal<Brand | null>(null);
  deleteErrorMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadBrands();
  }

  loadBrands() {
    this.brandService.getBrands().subscribe({
      next: (data) => this.brands.set(data),
      error: (err) => console.error('Error cargando marcas', err)
    });
  }

  openFormDrawer(brand?: Brand) {
    this.formErrorMessage.set(null);
    if (brand) {
      this.editingId.set(brand.id!);
      this.formData = { name: brand.name, description: brand.description || '', is_active: brand.is_active ?? true };
    } else {
      this.editingId.set(null);
      this.formData = { name: '', description: '', is_active: true };
    }
    this.showFormDrawer.set(true);
  }

  closeFormDrawer() {
    this.showFormDrawer.set(false);
  }

  clearFormError() {
    this.formErrorMessage.set(null);
  }

  saveBrand() {
    const nameTrimmed = this.formData.name.trim();
    if (!nameTrimmed) {
      this.formErrorMessage.set('El nombre de la marca es obligatorio.');
      return;
    }
    if (nameTrimmed.length > 100) {
      this.formErrorMessage.set('El nombre no puede superar los 100 caracteres.');
      return;
    }
    if (this.formData.description && this.formData.description.length > 500) {
      this.formErrorMessage.set('La descripción no puede superar los 500 caracteres.');
      return;
    }

    this.loading.set(true);
    this.formErrorMessage.set(null);

    const payload = {
      name: nameTrimmed,
      description: this.formData.description ? this.formData.description.trim() : '',
      is_active: this.formData.is_active
    };

    const obs = this.editingId()
      ? this.brandService.updateBrand(this.editingId()!, payload)
      : this.brandService.createBrand(payload);

    obs.subscribe({
      next: () => {
        this.toast.success(this.editingId() ? 'Marca actualizada con éxito.' : 'Marca creada con éxito.');
        this.loadBrands();
        this.closeFormDrawer();
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const errMsg = err.error?.detail || 'Error al guardar la marca. Por favor intenta de nuevo.';
        this.formErrorMessage.set(errMsg);
      }
    });
  }

  // Toggle status confirmation flow
  confirmToggle(brand: Brand) {
    this.brandToToggle.set(brand);
    this.showConfirmModal.set(true);
  }

  closeConfirmModal() {
    this.showConfirmModal.set(false);
    this.brandToToggle.set(null);
  }

  executeToggle() {
    const brand = this.brandToToggle();
    if (!brand) return;

    const newState = !brand.is_active;
    this.brandService.updateBrand(brand.id!, { is_active: newState }).subscribe({
      next: () => {
        this.toast.success(`Marca "${brand.name}" ${newState ? 'activada' : 'desactivada'} con éxito.`);
        this.loadBrands();
        this.closeConfirmModal();
      },
      error: (err) => {
        this.toast.error('No se pudo cambiar el estado de la marca.');
        console.error('Error al cambiar estado de marca', err);
      }
    });
  }

  // Delete confirmation flow
  confirmDelete(brand: Brand) {
    this.deleteErrorMessage.set(null);
    this.brandToDelete.set(brand);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    if (this.loading()) return;
    this.showDeleteModal.set(false);
    this.brandToDelete.set(null);
    this.deleteErrorMessage.set(null);
  }

  executeDelete() {
    const brand = this.brandToDelete();
    if (!brand) return;

    this.loading.set(true);
    this.deleteErrorMessage.set(null);

    this.brandService.deleteBrand(brand.id!).subscribe({
      next: () => {
        this.toast.success(`Marca "${brand.name}" eliminada correctamente.`);
        this.loading.set(false);
        this.loadBrands();
        this.closeDeleteModal();
      },
      error: (err) => {
        this.loading.set(false);
        const errMsg = err.error?.detail || 'Error al eliminar la marca. Por favor intenta de nuevo.';
        this.deleteErrorMessage.set(errMsg);
      }
    });
  }
}
