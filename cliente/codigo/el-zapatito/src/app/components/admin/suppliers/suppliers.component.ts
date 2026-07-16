import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupplierService, Supplier } from '../../../services/supplier.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="suppliers-container">
      <nav class="breadcrumbs">
        <a routerLink="/admin">Dashboard</a>
        <span class="separator">/</span>
        <span class="current">Proveedores</span>
      </nav>

      <header class="page-header">
        <div>
          <h1>Gestión de Proveedores</h1>
          <p class="subtitle">Administra los distribuidores de calzado y sus datos de contacto para resurtir stock</p>
        </div>
        <button class="btn-primary" (click)="openFormDrawer()">
          <span class="material-icons">add</span> Nuevo Proveedor
        </button>
      </header>

      <!-- Barra de Filtros -->
      <div class="filter-bar">
        <div class="search-box">
          <span class="material-icons">search</span>
          <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" placeholder="Buscar por nombre, contacto o correo...">
        </div>
      </div>

      <div class="table-card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Estado</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (supplier of filteredSuppliers(); track supplier.id) {
                <tr [class.inactive-row]="!supplier.is_active">
                  <td class="font-bold">
                    <div class="supplier-info">
                      <span class="supplier-name">{{ supplier.name }}</span>
                      <small class="supplier-address" *ngIf="supplier.address">{{ supplier.address }}</small>
                    </div>
                  </td>
                  <td>{{ supplier.contact_name || 'Sin contacto' }}</td>
                  <td>
                    <span class="phone-link" *ngIf="supplier.phone">
                      <span class="material-icons text-sm">phone</span> {{ supplier.phone }}
                    </span>
                    <span *ngIf="!supplier.phone">-</span>
                  </td>
                  <td>
                    <span class="email-link" *ngIf="supplier.email">
                      <span class="material-icons text-sm">email</span> {{ supplier.email }}
                    </span>
                    <span *ngIf="!supplier.email">-</span>
                  </td>
                  <td>
                    <!-- Toggle de estado -->
                    <button class="toggle-btn" [class.on]="supplier.is_active" (click)="confirmToggle(supplier)" [title]="supplier.is_active ? 'Desactivar' : 'Activar'">
                      <span class="toggle-track">
                        <span class="toggle-thumb"></span>
                      </span>
                      <span class="toggle-label">{{ supplier.is_active ? 'Activo' : 'Inactivo' }}</span>
                    </button>
                  </td>
                  <td class="actions-col">
                    <button class="btn-icon" title="Editar" (click)="openFormDrawer(supplier)">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-icon btn-delete" title="Eliminar" (click)="confirmDelete(supplier)">
                      <span class="material-icons">delete</span>
                    </button>
                  </td>
                </tr>
              }
              @if (filteredSuppliers().length === 0) {
                <tr>
                  <td colspan="6" class="empty-state">
                    <span class="material-icons">local_shipping</span>
                    <p>No se encontraron proveedores.</p>
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
              <h2>{{ editingId() ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h2>
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
                <label>Nombre del Proveedor <span class="required-asterisk">*</span></label>
                <input type="text" [(ngModel)]="formData.name" (input)="clearFormError()" placeholder="Ej. Distribuidora del Norte, Calzado México" maxlength="100">
              </div>
              <div class="field">
                <label>Persona de Contacto</label>
                <input type="text" [(ngModel)]="formData.contact_name" placeholder="Nombre de la persona de ventas" maxlength="100">
              </div>
              <div class="field">
                <label>Teléfono</label>
                <input type="text" [(ngModel)]="formData.phone" placeholder="Ej. +52 555 123 4567" maxlength="50">
              </div>
              <div class="field">
                <label>Correo Electrónico</label>
                <input type="email" [(ngModel)]="formData.email" (input)="clearFormError()" placeholder="Ej. ventas@proveedor.com" maxlength="100">
              </div>
              <div class="field">
                <label>Dirección Física</label>
                <textarea rows="3" [(ngModel)]="formData.address" placeholder="Calle, número, colonia, ciudad..." maxlength="500"></textarea>
              </div>
              @if (editingId()) {
                <div class="field">
                  <label>Estado del Proveedor</label>
                  <div class="toggle-row-form">
                    <button class="toggle-btn" [class.on]="formData.is_active" (click)="formData.is_active = !formData.is_active">
                      <span class="toggle-track"><span class="toggle-thumb"></span></span>
                    </button>
                    <span class="toggle-text">{{ formData.is_active ? 'Activo (Disponible)' : 'Inactivo (Oculto)' }}</span>
                  </div>
                </div>
              }
            </div>
            <footer class="drawer-footer">
              <button class="btn-secondary" (click)="closeFormDrawer()">Cancelar</button>
              <button class="btn-primary" (click)="saveSupplier()" [disabled]="loading() || !formData.name.trim()">
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
            <div class="confirm-icon" [class.deactivate]="supplierToToggle()?.is_active">
              <span class="material-icons">{{ supplierToToggle()?.is_active ? 'toggle_off' : 'toggle_on' }}</span>
            </div>
            <h3>{{ supplierToToggle()?.is_active ? 'Desactivar Proveedor' : 'Activar Proveedor' }}</h3>
            <p>
              @if (supplierToToggle()?.is_active) {
                El proveedor <strong>"{{ supplierToToggle()?.name }}"</strong> quedará inactivo. Los productos seguirán listados pero no mostrarán información de contacto activa.
              } @else {
                El proveedor <strong>"{{ supplierToToggle()?.name }}"</strong> volverá a estar activo y disponible.
              }
            </p>
            <div class="confirm-actions">
              <button class="btn-secondary" (click)="closeConfirmModal()">Cancelar</button>
              <button [class]="supplierToToggle()?.is_active ? 'btn-danger' : 'btn-success'" (click)="executeToggle()">
                {{ supplierToToggle()?.is_active ? 'Sí, Desactivar' : 'Sí, Activar' }}
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
            <h3>Eliminar Proveedor</h3>
            <p>
              ¿Estás seguro de que deseas eliminar permanentemente al proveedor <strong>"{{ supplierToDelete()?.name }}"</strong>? Esta acción desvinculará sus productos asociados y no se puede deshacer.
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
    .suppliers-container { padding: 1rem; }
    
    /* Breadcrumbs */
    .breadcrumbs { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #666; margin-bottom: 1.5rem; }
    .breadcrumbs a { color: #888; text-decoration: none; transition: color 0.2s; }
    .breadcrumbs a:hover { color: #000; text-decoration: underline; }
    .separator { color: #ccc; }
    .current { color: #000; font-weight: 600; }

    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { font-size: 2.2rem; letter-spacing: -1px; margin: 0 0 0.5rem; }
    .subtitle { color: #888; margin: 0; }
    
    /* Barra de filtros */
    .filter-bar { margin-bottom: 1.5rem; display: flex; gap: 1rem; }
    .filter-bar .search-box { display: flex; align-items: center; gap: 0.5rem; background: #fff; border: 1px solid #eee; padding: 0.6rem 1rem; border-radius: 12px; width: 350px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
    .filter-bar .search-box input { border: none; background: transparent; outline: none; width: 100%; font-size: 0.9rem; }
    .filter-bar .search-box .material-icons { color: #aaa; }

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

    .table-card { background: #fff; border: 1px solid #eee; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.01); }
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1.2rem 1.5rem; color: #999; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #f5f5f5; font-weight: 700; }
    td { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f9f9f9; font-size: 0.95rem; vertical-align: middle; }
    .font-bold { font-weight: 600; }
    
    .supplier-info { display: flex; flex-direction: column; }
    .supplier-name { font-size: 0.95rem; color: #000; }
    .supplier-address { font-size: 0.75rem; color: #888; font-weight: 400; margin-top: 0.2rem; }

    .phone-link, .email-link { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; color: #444; }
    .text-sm { font-size: 1rem !important; color: #888; }

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
    input[type="text"], input[type="email"], textarea { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; font-family: inherit; font-size: 0.95rem; }
    input:focus, textarea:focus { border-color: #000; outline: none; }
    .required-asterisk { color: #e03131; }

    .drawer-footer { padding: 1.5rem 2rem; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 1rem; }

    .error-banner { background: #fff5f5; border: 1px solid #ffe3e3; border-radius: 12px; padding: 1rem; color: #c92a2a; display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.5rem; font-size: 0.9rem; }
    .error-banner .material-icons { color: #e03131; }

    /* Modal de Confirmación */
    .confirm-modal { background: #fff; border-radius: 24px; padding: 2.5rem; width: 90%; max-width: 450px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.15); animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .confirm-icon { width: 64px; height: 64px; border-radius: 50%; background: #ebfbee; color: #2b8a3e; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
    .confirm-icon .material-icons { font-size: 2.2rem; }
    .confirm-icon.deactivate { background: #fff5f5; color: #c92a2a; }
    .confirm-icon.deactivate .material-icons { color: #e03131; }
    .confirm-modal h3 { margin: 0 0 0.8rem; font-size: 1.3rem; font-weight: 700; }
    .confirm-modal p { margin: 0 0 2rem; color: #666; font-size: 0.95rem; line-height: 1.5; }
    .confirm-actions { display: flex; justify-content: center; gap: 1rem; }
  `]
})
export class SuppliersComponent implements OnInit {
  supplierService = inject(SupplierService);

  suppliers = signal<Supplier[]>([]);
  searchQuery = signal('');

  // Form Drawer state
  showFormDrawer = signal(false);
  editingId = signal<string | null>(null);
  loading = signal(false);
  formErrorMessage = signal<string | null>(null);
  formData = {
    name: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
    is_active: true
  };

  // Confirm Modal state (toggle status)
  showConfirmModal = signal(false);
  supplierToToggle = signal<Supplier | null>(null);

  // Delete Modal state
  showDeleteModal = signal(false);
  supplierToDelete = signal<Supplier | null>(null);
  deleteErrorMessage = signal<string | null>(null);

  // Computed filtered list
  filteredSuppliers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.suppliers();
    return this.suppliers().filter(s => 
      s.name.toLowerCase().includes(q) ||
      (s.contact_name && s.contact_name.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q))
    );
  });

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers.set(data);
      },
      error: (err) => {
        console.error('Error al cargar proveedores', err);
        // Fallback mock en local por si el backend no ha terminado de reiniciar o falla la conexión
        this.suppliers.set([
          { id: 's1', name: 'Distribuidora Internacional de Calzado', contact_name: 'Ana Martínez', phone: '+52 555-0199', email: 'contacto@distcalzado.com', address: 'Av. de la Industria 405, CDMX', is_active: true },
          { id: 's2', name: 'Proveedora del Calzado León', contact_name: 'Galo Ruiz', phone: '+52 477-9281', email: 'ventas@leoncalzado.mx', address: 'Blvd. Aeropuerto 1024, León, Gto', is_active: true },
          { id: 's3', name: 'Importaciones Deportivas Runner', contact_name: 'Sofía Herrera', phone: '+52 333-8271', email: 'runner@deportes.com', address: 'Calzada Independencia 44, Guadalajara, Jal', is_active: false }
        ]);
      }
    });
  }

  openFormDrawer(supplier?: Supplier) {
    this.clearFormError();
    if (supplier) {
      this.editingId.set(supplier.id || null);
      this.formData = {
        name: supplier.name,
        contact_name: supplier.contact_name || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        is_active: supplier.is_active !== undefined ? supplier.is_active : true
      };
    } else {
      this.editingId.set(null);
      this.formData = {
        name: '',
        contact_name: '',
        phone: '',
        email: '',
        address: '',
        is_active: true
      };
    }
    this.showFormDrawer.set(true);
  }

  closeFormDrawer() {
    this.showFormDrawer.set(false);
    this.editingId.set(null);
    this.clearFormError();
  }

  clearFormError() {
    this.formErrorMessage.set(null);
  }

  saveSupplier() {
    if (!this.formData.name.trim()) return;

    this.loading.set(true);
    this.clearFormError();

    const request$ = this.editingId()
      ? this.supplierService.updateSupplier(this.editingId()!, this.formData)
      : this.supplierService.createSupplier(this.formData);

    request$.subscribe({
      next: () => {
        this.loading.set(false);
        this.closeFormDrawer();
        this.loadSuppliers();
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.detail || 'Error al guardar el proveedor. Asegúrate de que el nombre no esté duplicado.';
        this.formErrorMessage.set(msg);
      }
    });
  }

  confirmToggle(supplier: Supplier) {
    this.supplierToToggle.set(supplier);
    this.showConfirmModal.set(true);
  }

  closeConfirmModal() {
    this.supplierToToggle.set(null);
    this.showConfirmModal.set(false);
  }

  executeToggle() {
    const supplier = this.supplierToToggle();
    if (!supplier || !supplier.id) return;

    const updatedState = !supplier.is_active;
    this.supplierService.updateSupplier(supplier.id, { is_active: updatedState }).subscribe({
      next: () => {
        this.closeConfirmModal();
        this.loadSuppliers();
      },
      error: (err) => {
        console.error('Error al cambiar estado del proveedor', err);
        this.closeConfirmModal();
      }
    });
  }

  confirmDelete(supplier: Supplier) {
    this.supplierToDelete.set(supplier);
    this.deleteErrorMessage.set(null);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.supplierToDelete.set(null);
    this.deleteErrorMessage.set(null);
    this.showDeleteModal.set(false);
  }

  executeDelete() {
    const supplier = this.supplierToDelete();
    if (!supplier || !supplier.id) return;

    this.loading.set(true);
    this.deleteErrorMessage.set(null);

    this.supplierService.deleteSupplier(supplier.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.closeDeleteModal();
        this.loadSuppliers();
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.detail || 'Error al eliminar el proveedor.';
        this.deleteErrorMessage.set(msg);
      }
    });
  }
}
