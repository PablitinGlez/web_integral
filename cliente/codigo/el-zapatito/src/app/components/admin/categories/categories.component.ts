import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../../services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="categories-container">
      <header class="page-header">
        <div>
          <h1>Catálogo de Categorías</h1>
          <p class="subtitle">Administra las colecciones de tu tienda (ej. Deportivos, Casuales)</p>
        </div>
        <button class="btn-primary" (click)="openFormDrawer()">
          <span class="material-icons">add</span> Nueva Categoría
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
              @for (cat of categories(); track cat.id) {
                <tr [class.inactive-row]="!cat.is_active">
                  <td class="font-bold">{{ cat.name }}</td>
                  <td class="desc-text">{{ cat.description || 'Sin descripción' }}</td>
                  <td>
                    <!-- Toggle de estado -->
                    <button class="toggle-btn" [class.on]="cat.is_active" (click)="confirmToggle(cat)" [title]="cat.is_active ? 'Desactivar' : 'Activar'">
                      <span class="toggle-track">
                        <span class="toggle-thumb"></span>
                      </span>
                      <span class="toggle-label">{{ cat.is_active ? 'Activa' : 'Inactiva' }}</span>
                    </button>
                  </td>
                  <td class="actions-col">
                    <button class="btn-icon" title="Editar" (click)="openFormDrawer(cat)">
                      <span class="material-icons">edit</span>
                    </button>
                  </td>
                </tr>
              }
              @if (categories().length === 0) {
                <tr>
                  <td colspan="4" class="empty-state">
                    <span class="material-icons">category</span>
                    <p>No hay categorías registradas.</p>
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
              <h2>{{ editingId() ? 'Editar Categoría' : 'Nueva Categoría' }}</h2>
              <button class="btn-close" (click)="closeFormDrawer()"><span class="material-icons">close</span></button>
            </header>
            <div class="drawer-body">
              <div class="field">
                <label>Nombre de Categoría</label>
                <input type="text" [(ngModel)]="formData.name" placeholder="Ej. Zapatillas Urbanas">
              </div>
              <div class="field">
                <label>Descripción</label>
                <textarea rows="3" [(ngModel)]="formData.description" placeholder="Breve descripción..."></textarea>
              </div>
              @if (editingId()) {
                <div class="field">
                  <label>Estado de la Categoría</label>
                  <div class="toggle-row">
                    <button class="toggle-btn" [class.on]="formData.is_active" (click)="formData.is_active = !formData.is_active">
                      <span class="toggle-track"><span class="toggle-thumb"></span></span>
                    </button>
                    <span class="toggle-text">{{ formData.is_active ? 'Activa (Visible para clientes)' : 'Inactiva (Oculta para clientes)' }}</span>
                  </div>
                </div>
              }
            </div>
            <footer class="drawer-footer">
              <button class="btn-secondary" (click)="closeFormDrawer()">Cancelar</button>
              <button class="btn-primary" (click)="saveCategory()" [disabled]="loading()">
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
            <div class="confirm-icon" [class.deactivate]="categoryToToggle()?.is_active">
              <span class="material-icons">{{ categoryToToggle()?.is_active ? 'toggle_off' : 'toggle_on' }}</span>
            </div>
            <h3>{{ categoryToToggle()?.is_active ? 'Desactivar Categoría' : 'Activar Categoría' }}</h3>
            <p>
              @if (categoryToToggle()?.is_active) {
                La categoría <strong>"{{ categoryToToggle()?.name }}"</strong> quedará oculta para los clientes. Los productos vinculados no serán eliminados.
              } @else {
                La categoría <strong>"{{ categoryToToggle()?.name }}"</strong> volverá a ser visible para los clientes.
              }
            </p>
            <div class="confirm-actions">
              <button class="btn-secondary" (click)="closeConfirmModal()">Cancelar</button>
              <button [class]="categoryToToggle()?.is_active ? 'btn-danger' : 'btn-success'" (click)="executeToggle()">
                {{ categoryToToggle()?.is_active ? 'Sí, Desactivar' : 'Sí, Activar' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .categories-container { padding: 1rem; }
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
    .btn-success { background: #2f9e44; color: #fff; border: none; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .btn-success:hover { background: #2b8a3e; }
    .btn-icon { background: none; border: none; cursor: pointer; color: #666; padding: 0.5rem; border-radius: 8px; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; }
    .btn-icon:hover { background: #f0f0f0; color: #000; }

    .table-card { background: #fff; border: 1px solid #eee; border-radius: 20px; overflow: hidden; }
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1.2rem 1.5rem; color: #999; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #f5f5f5; font-weight: 700; }
    td { padding: 1rem 1.5rem; border-bottom: 1px solid #f9f9f9; font-size: 0.95rem; vertical-align: middle; }
    .font-bold { font-weight: 600; }
    .desc-text { color: #666; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .actions-col { text-align: right; white-space: nowrap; }
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
    .toggle-row { display: flex; align-items: center; gap: 1rem; }
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
  `]
})
export class CategoriesComponent implements OnInit {
  categoryService = inject(CategoryService);

  categories = signal<Category[]>([]);
  loading = signal(false);

  // Form Drawer State
  showFormDrawer = signal(false);
  editingId = signal<string | null>(null);
  formData = { name: '', description: '', is_active: true };

  // Confirm Modal State
  showConfirmModal = signal(false);
  categoryToToggle = signal<Category | null>(null);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Error cargando categorías', err)
    });
  }

  openFormDrawer(cat?: Category) {
    if (cat) {
      this.editingId.set(cat.id!);
      this.formData = { name: cat.name, description: cat.description || '', is_active: cat.is_active ?? true };
    } else {
      this.editingId.set(null);
      this.formData = { name: '', description: '', is_active: true };
    }
    this.showFormDrawer.set(true);
  }

  closeFormDrawer() {
    this.showFormDrawer.set(false);
  }

  saveCategory() {
    if (!this.formData.name.trim()) return;
    this.loading.set(true);

    const obs = this.editingId()
      ? this.categoryService.updateCategory(this.editingId()!, this.formData)
      : this.categoryService.createCategory(this.formData);

    obs.subscribe({
      next: () => { this.loadCategories(); this.closeFormDrawer(); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  // Toggle confirmation flow
  confirmToggle(cat: Category) {
    this.categoryToToggle.set(cat);
    this.showConfirmModal.set(true);
  }

  closeConfirmModal() {
    this.showConfirmModal.set(false);
    this.categoryToToggle.set(null);
  }

  executeToggle() {
    const cat = this.categoryToToggle();
    if (!cat) return;

    const newState = !cat.is_active;
    this.categoryService.updateCategory(cat.id!, { is_active: newState }).subscribe({
      next: () => { this.loadCategories(); this.closeConfirmModal(); },
      error: (err) => console.error('Error al cambiar estado', err)
    });
  }
}
