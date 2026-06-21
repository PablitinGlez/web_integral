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
        <button class="btn-primary" (click)="openModal()">
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
                    @if (cat.is_active) {
                      <span class="badge active">Activa</span>
                    } @else {
                      <span class="badge inactive">Inactiva</span>
                    }
                  </td>
                  <td class="actions-col">
                    <button class="btn-icon" title="Editar" (click)="openModal(cat)">
                      <span class="material-icons">edit</span>
                    </button>
                    @if (cat.is_active) {
                      <button class="btn-icon text-danger" title="Desactivar" (click)="deactivate(cat)">
                        <span class="material-icons">block</span>
                      </button>
                    }
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

      <!-- Modal de Creación / Edición -->
      @if (showModal()) {
        <div class="modal-backdrop">
          <div class="modal">
            <header class="modal-header">
              <h2>{{ editingId() ? 'Editar Categoría' : 'Nueva Categoría' }}</h2>
              <button class="btn-close" (click)="closeModal()"><span class="material-icons">close</span></button>
            </header>
            <div class="modal-body">
              <div class="field">
                <label>Nombre de Categoría</label>
                <input type="text" [(ngModel)]="formData.name" placeholder="Ej. Zapatillas Urbanas">
              </div>
              <div class="field">
                <label>Descripción</label>
                <textarea rows="3" [(ngModel)]="formData.description" placeholder="Breve descripción..."></textarea>
              </div>
              @if (editingId()) {
                <div class="field checkbox-field">
                  <input type="checkbox" id="isActiveCheck" [(ngModel)]="formData.is_active">
                  <label for="isActiveCheck">Categoría Activa (Visible)</label>
                </div>
              }
            </div>
            <footer class="modal-footer">
              <button class="btn-secondary" (click)="closeModal()">Cancelar</button>
              <button class="btn-primary" (click)="saveCategory()" [disabled]="loading()">
                {{ loading() ? 'Guardando...' : 'Guardar' }}
              </button>
            </footer>
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
    .btn-icon { background: none; border: none; cursor: pointer; color: #666; padding: 0.5rem; border-radius: 8px; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; }
    .btn-icon:hover { background: #f0f0f0; color: #000; }
    .btn-icon.text-danger:hover { color: #cc0000; background: #fff0f0; }

    .table-card { background: #fff; border: 1px solid #eee; border-radius: 20px; overflow: hidden; }
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1.2rem 1.5rem; color: #999; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #f5f5f5; font-weight: 700; }
    td { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f9f9f9; font-size: 0.95rem; }
    
    .font-bold { font-weight: 600; }
    .desc-text { color: #666; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .actions-col { text-align: right; white-space: nowrap; }
    
    .badge { padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .badge.active { background: #e6fced; color: #0b722d; }
    .badge.inactive { background: #f8f9fa; color: #868e96; border: 1px solid #dee2e6; }
    .inactive-row td { opacity: 0.6; }

    .empty-state { text-align: center; padding: 4rem 2rem; color: #aaa; }
    .empty-state .material-icons { font-size: 3rem; margin-bottom: 1rem; color: #ccc; }

    /* Drawer (Slider Derecho) */
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; justify-content: flex-end; z-index: 100; }
    .modal { background: #fff; width: 100%; max-width: 450px; height: 100vh; display: flex; flex-direction: column; box-shadow: -10px 0 30px rgba(0,0,0,0.1); animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    
    .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .modal-header h2 { margin: 0; font-size: 1.4rem; }
    .btn-close { background: none; border: none; cursor: pointer; color: #999; display: flex; align-items: center; justify-content: center; padding: 0; transition: color 0.2s; }
    .btn-close:hover { color: #000; }
    
    .modal-body { padding: 2rem; flex: 1; overflow-y: auto; }
    .field { margin-bottom: 1.5rem; }
    .field label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; color: #444; }
    input[type="text"], textarea { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; font-family: inherit; font-size: 0.95rem; }
    input:focus, textarea:focus { border-color: #000; outline: none; }
    
    .checkbox-field { display: flex; align-items: center; gap: 0.5rem; }
    .checkbox-field label { margin: 0; cursor: pointer; }
    .checkbox-field input { width: 18px; height: 18px; cursor: pointer; }

    .modal-footer { padding: 1.5rem 2rem; border-top: 1px solid #eee; background: #fafafa; display: flex; justify-content: flex-end; gap: 1rem; margin-top: auto; }
  `]
})
export class CategoriesComponent implements OnInit {
  categoryService = inject(CategoryService);

  categories = signal<Category[]>([]);
  loading = signal(false);
  
  // Modal State
  showModal = signal(false);
  editingId = signal<string | null>(null);
  formData = { name: '', description: '', is_active: true };

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Error cargando categorías', err)
    });
  }

  openModal(cat?: Category) {
    if (cat) {
      this.editingId.set(cat.id!);
      this.formData = { 
        name: cat.name, 
        description: cat.description || '', 
        is_active: cat.is_active ?? true 
      };
    } else {
      this.editingId.set(null);
      this.formData = { name: '', description: '', is_active: true };
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveCategory() {
    if (!this.formData.name.trim()) return;

    this.loading.set(true);
    
    if (this.editingId()) {
      // Update
      this.categoryService.updateCategory(this.editingId()!, this.formData).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      // Create
      this.categoryService.createCategory(this.formData).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  deactivate(cat: Category) {
    if (confirm(`¿Estás seguro de desactivar la categoría "${cat.name}"? Los productos vinculados no se borrarán, pero la categoría ya no será visible para los clientes.`)) {
      this.categoryService.deactivateCategory(cat.id!).subscribe({
        next: () => this.loadCategories(),
        error: (err) => console.error('Error desactivando', err)
      });
    }
  }
}
