import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../../services/category.service';
import { BrandService, Brand } from '../../../services/brand.service';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="add-product-container">
      <!-- Breadcrumbs -->
      <nav class="breadcrumbs">
        <a routerLink="/admin">Dashboard</a>
        <span class="separator">/</span>
        <a routerLink="/admin/products">Productos</a>
        <span class="separator">/</span>
        <span class="current">Nuevo Producto</span>
      </nav>

      <header class="page-header">
        <div>
          <h1>Añadir Nuevo Zapato</h1>
          <p class="subtitle">Sigue los pasos para publicar un nuevo producto en la tienda.</p>
        </div>
      </header>

      <!-- Stepper / Timeline -->
      <div class="stepper-container">
        <div class="step" [class.active]="currentStep() >= 1" [class.completed]="currentStep() > 1" (click)="setStep(1)">
          <div class="step-circle">1</div>
          <span class="step-label">Info Básica</span>
        </div>
        <div class="step-line" [class.active]="currentStep() >= 2"></div>
        <div class="step" [class.active]="currentStep() >= 2" [class.completed]="currentStep() > 2" (click)="setStep(2)">
          <div class="step-circle">2</div>
          <span class="step-label">Precios</span>
        </div>
        <div class="step-line" [class.active]="currentStep() >= 3"></div>
        <div class="step" [class.active]="currentStep() >= 3" [class.completed]="currentStep() > 3" (click)="setStep(3)">
          <div class="step-circle">3</div>
          <span class="step-label">Imágenes</span>
        </div>
      </div>

      <div class="form-card">
        <!-- Paso 1 -->
        @if (currentStep() === 1) {
          <div class="step-content">
            <h3>Información General</h3>
            <div class="grid-form">
              <div class="field col-span-2">
                <label>Nombre del Producto</label>
                <input type="text" [(ngModel)]="productForm.name" name="name" placeholder="Ej. Zapatillas Runner Pro">
              </div>
              <div class="field">
                <label>Marca</label>
                <div class="custom-select-container">
                  <div class="custom-select-trigger" (click)="toggleDropdown('brand')" [class.active]="showBrandDropdown()">
                    <span>{{ getSelectedBrandName() || 'Selecciona una marca' }}</span>
                    <span class="material-icons select-arrow">expand_more</span>
                  </div>
                  @if (showBrandDropdown()) {
                    <div class="custom-select-options">
                      <div class="select-search-box">
                        <span class="material-icons">search</span>
                        <input type="text" [(ngModel)]="brandSearch" placeholder="Buscar marca..." (click)="$event.stopPropagation()">
                      </div>
                      <div class="options-list">
                        <div class="option-item" (click)="selectBrand('')">
                          <em>Ninguna / Selecciona una marca</em>
                        </div>
                        @for (b of filteredBrands(); track b.id) {
                          <div class="option-item" [class.selected]="productForm.brand === b.id" (click)="selectBrand(b.id!)">
                            {{ b.name }}
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>

              <div class="field">
                <label>Categoría</label>
                <div class="custom-select-container">
                  <div class="custom-select-trigger" (click)="toggleDropdown('category')" [class.active]="showCategoryDropdown()">
                    <span>{{ getSelectedCategoryName() || 'Selecciona una categoría' }}</span>
                    <span class="material-icons select-arrow">expand_more</span>
                  </div>
                  @if (showCategoryDropdown()) {
                    <div class="custom-select-options">
                      <div class="select-search-box">
                        <span class="material-icons">search</span>
                        <input type="text" [(ngModel)]="categorySearch" placeholder="Buscar categoría..." (click)="$event.stopPropagation()">
                      </div>
                      <div class="options-list">
                        <div class="option-item" (click)="selectCategory('')">
                          <em>Ninguna / Selecciona una categoría</em>
                        </div>
                        @for (c of filteredCategories(); track c.id) {
                          <div class="option-item" [class.selected]="productForm.category_id === c.id" (click)="selectCategory(c.id!)">
                            {{ c.name }}
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
              <div class="field col-span-2">
                <label>Descripción detallada</label>
                <textarea rows="4" [(ngModel)]="productForm.description" name="description" placeholder="Describe los materiales, estilo, etc..."></textarea>
              </div>
            </div>
            <div class="actions right">
              <button class="btn-primary" (click)="nextStep()">Siguiente Paso <span class="material-icons">arrow_forward</span></button>
            </div>
          </div>
        }

        <!-- Paso 2 -->
        @if (currentStep() === 2) {
          <div class="step-content">
            <h3>Precios e Inventario (Base)</h3>
            <div class="grid-form">
              <div class="field">
                <label>Precio de Venta (MXN)</label>
                <input type="number" [(ngModel)]="productForm.price" name="price" placeholder="0.00">
              </div>
              <div class="field">
                <label>Precio de Comparación (Tachado)</label>
                <input type="number" [(ngModel)]="productForm.base_price" name="base_price" placeholder="0.00">
              </div>
            </div>
            <div class="actions between">
              <button class="btn-secondary" (click)="prevStep()"><span class="material-icons">arrow_back</span> Atrás</button>
              <button class="btn-primary" (click)="nextStep()">Siguiente Paso <span class="material-icons">arrow_forward</span></button>
            </div>
          </div>
        }

        <!-- Paso 3 -->
        @if (currentStep() === 3) {
          <div class="step-content">
            <h3>Imágenes del Producto</h3>
            <p class="helper-text">Sube las imágenes de tu calzado. Puedes cambiar el orden usando las flechas y decidir cuál será la foto de portada (principal).</p>
            
            <div class="images-manager-wrapper">
              <!-- Botón grande para añadir fotos -->
              <div class="upload-trigger-area" (click)="multipleFileInput.click()">
                <span class="material-icons">add_a_photo</span>
                <p>Seleccionar imágenes del calzado</p>
                <span class="sub-text">Soporta múltiples archivos (.png, .jpg, .webp)</span>
              </div>
              <input #multipleFileInput type="file" style="display: none" (change)="onFilesSelected($event)" accept="image/*" multiple>

              <!-- Grid de imágenes cargadas -->
              @if (imageList().length > 0) {
                <div class="images-grid">
                  @for (img of imageList(); track img.id; let idx = $index) {
                    <div class="image-grid-card" [class.is-cover]="idx === 0">
                      <div class="img-preview-box">
                        <img [src]="img.previewUrl" alt="Foto">
                        @if (idx === 0) {
                          <span class="badge-cover">Portada</span>
                        }
                      </div>
                      
                      <div class="img-card-actions">
                        <div class="order-controls">
                          <button class="btn-mini-icon" (click)="moveImageUp(idx)" [disabled]="idx === 0" title="Mover a la izquierda (anterior)">
                            <span class="material-icons">chevron_left</span>
                          </button>
                          <button class="btn-mini-icon" (click)="moveImageDown(idx)" [disabled]="idx === imageList().length - 1" title="Mover a la derecha (siguiente)">
                            <span class="material-icons">chevron_right</span>
                          </button>
                        </div>
                        <button class="btn-mini-icon danger" (click)="removeImage(idx)" title="Eliminar imagen">
                          <span class="material-icons">delete</span>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-images-state">
                  <span class="material-icons">collections</span>
                  <p>Aún no has agregado ninguna imagen para este producto.</p>
                </div>
              }
            </div>

            <div class="actions between">
              <button class="btn-secondary" (click)="prevStep()"><span class="material-icons">arrow_back</span> Atrás</button>
              <button class="btn-success" (click)="saveProduct()" [disabled]="loading() || imageList().length === 0">
                {{ loading() ? 'Guardando...' : 'Guardar y Publicar' }} <span class="material-icons">check_circle</span>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .add-product-container { padding: 1rem; max-width: 900px; margin: 0 auto; }
    
    /* Breadcrumbs */
    .breadcrumbs { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #666; margin-bottom: 2rem; }
    .breadcrumbs a { color: #888; text-decoration: none; transition: color 0.2s; }
    .breadcrumbs a:hover { color: #000; text-decoration: underline; }
    .separator { color: #ccc; }
    .current { color: #000; font-weight: 600; }

    /* Header */
    .page-header { margin-bottom: 3rem; text-align: center; }
    h1 { font-size: 2.2rem; letter-spacing: -1px; margin: 0 0 0.5rem; }
    .subtitle { color: #888; margin: 0; }

    /* Stepper */
    .stepper-container { display: flex; align-items: center; justify-content: center; margin-bottom: 3rem; }
    .step { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; cursor: pointer; position: relative; z-index: 2; }
    .step-circle { width: 40px; height: 40px; border-radius: 50%; background: #fff; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #888; transition: all 0.3s; }
    .step-label { font-size: 0.85rem; color: #888; font-weight: 500; position: absolute; top: 45px; white-space: nowrap; transition: color 0.3s; }
    
    .step.active .step-circle { border-color: #000; color: #000; }
    .step.active .step-label { color: #000; font-weight: 600; }
    .step.completed .step-circle { background: #000; color: #fff; border-color: #000; }
    
    .step-line { width: 100px; height: 2px; background: #ddd; margin: 0 10px; position: relative; top: -10px; transition: background 0.3s; }
    .step-line.active { background: #000; }

    /* Form Card */
    .form-card { background: #fff; border: 1px solid #eee; border-radius: 20px; padding: 2.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
    h3 { margin-top: 0; margin-bottom: 2rem; font-size: 1.4rem; color: #222; }
    .helper-text { color: #666; margin-bottom: 2rem; font-size: 0.95rem; }
    
    .grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .col-span-2 { grid-column: span 2; }
    .field label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; color: #444; }
    input, textarea { width: 100%; padding: 0.9rem; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; font-size: 0.95rem; background: #fafafa; transition: border 0.2s; }
    input:focus, textarea:focus { border-color: #000; outline: none; background: #fff; }

    /* Custom Premium Select Dropdowns */
    .custom-select-container { position: relative; width: 100%; user-select: none; }
    .custom-select-trigger {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.9rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fafafa;
      cursor: pointer;
      font-size: 0.95rem;
      transition: all 0.2s ease-in-out;
    }
    .custom-select-trigger:hover { border-color: #aaa; background: #fdfdfd; }
    .custom-select-trigger.active { border-color: #000; background: #fff; box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05); }
    .select-arrow { transition: transform 0.2s; color: #777; }
    .custom-select-trigger.active .select-arrow { transform: rotate(180deg); color: #000; }
    
    .custom-select-options {
      position: absolute;
      top: calc(100% + 5px);
      left: 0;
      width: 100%;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      z-index: 50;
      overflow: hidden;
      animation: dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes dropdownFadeIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .select-search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 0.8rem;
      border-bottom: 1px solid #f0f0f0;
      background: #fafafa;
    }
    .select-search-box .material-icons { color: #888; font-size: 1.1rem; }
    .select-search-box input {
      border: none;
      background: transparent;
      padding: 0.2rem;
      font-size: 0.9rem;
      width: 100%;
    }
    .select-search-box input:focus { border: none; outline: none; background: transparent; }
    
    .options-list { max-height: 180px; overflow-y: auto; }
    .option-item {
      padding: 0.8rem 1rem;
      font-size: 0.95rem;
      cursor: pointer;
      color: #333;
      transition: all 0.15s;
    }
    .option-item:hover { background: #f5f5f5; color: #000; }
    .option-item.selected { background: #000; color: #fff; font-weight: 600; }
    .option-item.selected em { color: #bbb; }

    /* Images Manager Styles */
    .images-manager-wrapper { display: flex; flex-direction: column; gap: 1.5rem; }
    
    .upload-trigger-area {
      border: 2px dashed #bbb;
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      background: #fbfbfb;
      cursor: pointer;
      transition: all 0.25s ease-in-out;
    }
    .upload-trigger-area:hover {
      border-color: #000;
      background: #f1f3f5;
    }
    .upload-trigger-area .material-icons {
      font-size: 2.5rem;
      color: #555;
      margin-bottom: 0.5rem;
    }
    .upload-trigger-area p {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: #222;
    }
    .upload-trigger-area .sub-text {
      font-size: 0.8rem;
      color: #888;
    }

    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1rem;
    }
    
    .image-grid-card {
      display: flex;
      flex-direction: column;
      background: #fafafa;
      border: 1px solid #eee;
      border-radius: 12px;
      padding: 0.5rem;
      transition: all 0.25s;
    }
    .image-grid-card.is-cover {
      border-color: #000;
      background: #f8f9fa;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      transform: scale(1.02);
    }
    
    .img-preview-box {
      position: relative;
      width: 100%;
      height: 140px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #ddd;
      margin-bottom: 0.5rem;
    }
    .img-preview-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .badge-cover {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      background: #000;
      color: #fff;
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 700;
      padding: 0.3rem 0.6rem;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .img-card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    
    .order-controls {
      display: flex;
      gap: 0.4rem;
    }
    
    .btn-mini-icon {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 0.4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #555;
      transition: all 0.15s;
    }
    .btn-mini-icon:hover:not(:disabled) {
      border-color: #000;
      color: #000;
    }
    .btn-mini-icon.danger {
      color: #e03131;
    }
    .btn-mini-icon.danger:hover:not(:disabled) {
      border-color: #e03131;
      background: #fff5f5;
    }
    .btn-mini-icon:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .btn-mini-icon .material-icons {
      font-size: 1.2rem;
    }
    
    .empty-images-state {
      text-align: center;
      padding: 3rem;
      color: #aaa;
      border: 2px dashed #eee;
      border-radius: 16px;
    }
    .empty-images-state .material-icons {
      font-size: 3rem;
      color: #ddd;
      margin-bottom: 0.5rem;
    }

    /* Actions */
    .actions { display: flex; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #eee; align-items: center; }
    .actions.right { justify-content: flex-end; }
    .actions.between { justify-content: space-between; }
    
    button { display: flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1.8rem; border-radius: 10px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; border: none; }
    .btn-primary { background: #000; color: #fff; }
    .btn-primary:hover { background: #222; }
    .btn-primary:disabled { background: #888; cursor: not-allowed; }
    .btn-secondary { background: #f5f5f5; color: #333; }
    .btn-secondary:hover { background: #e5e5e5; }
    .btn-success { background: #006600; color: #fff; }
    .btn-success:hover { background: #005500; }
    .btn-success:disabled { background: #888; cursor: not-allowed; }
  `]
})
export class AddProductComponent implements OnInit {
  categoryService = inject(CategoryService);
  brandService = inject(BrandService);
  productService = inject(ProductService);
  router = inject(Router);

  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  
  currentStep = signal(1);
  loading = signal(false);

  // Custom Select Dropdowns State
  showBrandDropdown = signal(false);
  showCategoryDropdown = signal(false);
  brandSearch: string = '';
  categorySearch: string = '';

  // Form State
  productForm = {
    name: '',
    brand: '', // Holds brand ID
    category_id: '',
    description: '',
    price: 0,
    base_price: 0
  };

  // Múltiples imágenes locales para ordenación
  imageList = signal<{ id: string; file: File; previewUrl: string }[]>([]);

  ngOnInit() {
    this.loadDropdownData();
  }

  loadDropdownData() {
    // Load active categories
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories.set(data.filter(c => c.is_active !== false)),
      error: (err) => console.error('Error al cargar categorías para el formulario', err)
    });

    // Load active brands
    this.brandService.getBrands().subscribe({
      next: (data) => this.brands.set(data.filter(b => b.is_active !== false)),
      error: (err) => console.error('Error al cargar marcas para el formulario', err)
    });
  }

  // Filter lists for custom dropdown search
  filteredBrands() {
    const term = this.brandSearch.toLowerCase().trim();
    if (!term) return this.brands();
    return this.brands().filter(b => b.name.toLowerCase().includes(term));
  }

  filteredCategories() {
    const term = this.categorySearch.toLowerCase().trim();
    if (!term) return this.categories();
    return this.categories().filter(c => c.name.toLowerCase().includes(term));
  }

  // Dropdown actions
  toggleDropdown(type: 'brand' | 'category') {
    if (type === 'brand') {
      this.showBrandDropdown.update(v => !v);
      this.showCategoryDropdown.set(false);
    } else {
      this.showCategoryDropdown.update(v => !v);
      this.showBrandDropdown.set(false);
    }
  }

  selectBrand(brandId: string) {
    this.productForm.brand = brandId;
    this.showBrandDropdown.set(false);
    this.brandSearch = '';
  }

  selectCategory(categoryId: string) {
    this.productForm.category_id = categoryId;
    this.showCategoryDropdown.set(false);
    this.categorySearch = '';
  }

  getSelectedBrandName(): string {
    const found = this.brands().find(b => b.id === this.productForm.brand);
    return found ? found.name : '';
  }

  getSelectedCategoryName(): string {
    const found = this.categories().find(c => c.id === this.productForm.category_id);
    return found ? found.name : '';
  }

  // Acciones de multi-imágenes
  onFilesSelected(event: any) {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const previewUrl = URL.createObjectURL(file);
        const uniqueId = Math.random().toString(36).substring(2, 9);
        this.imageList.update(list => [...list, { id: uniqueId, file, previewUrl }]);
      }
    }
  }

  removeImage(index: number) {
    this.imageList.update(list => {
      const copy = [...list];
      copy.splice(index, 1);
      return copy;
    });
  }

  moveImageUp(index: number) {
    if (index === 0) return;
    this.imageList.update(list => {
      const copy = [...list];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  }

  moveImageDown(index: number) {
    if (index === this.imageList().length - 1) return;
    this.imageList.update(list => {
      const copy = [...list];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  }

  nextStep() {
    if (this.currentStep() < 3) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  setStep(step: number) {
    this.currentStep.set(step);
  }

  saveProduct() {
    if (!this.productForm.name.trim() || !this.productForm.price || this.imageList().length === 0) {
      alert('Por favor completa los campos obligatorios: Nombre, Precio e Imagen.');
      return;
    }

    this.loading.set(true);

    const formData = new FormData();
    formData.append('name', this.productForm.name);
    formData.append('brand', this.productForm.brand);
    formData.append('category_id', this.productForm.category_id);
    formData.append('description', this.productForm.description);
    formData.append('price', this.productForm.price.toString());
    
    if (this.productForm.base_price) {
      formData.append('base_price', this.productForm.base_price.toString());
    }
    
    // Adjuntar todas las imágenes en el orden correcto
    this.imageList().forEach(img => {
      formData.append('files', img.file);
    });

    this.productService.createProduct(formData).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin/products']);
      },
      error: (err) => {
        console.error('Error al guardar el producto', err);
        alert('Error al guardar el producto. Verifica tu conexión.');
        this.loading.set(false);
      }
    });
  }
}





