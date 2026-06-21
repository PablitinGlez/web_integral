import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
                <input type="text" placeholder="Ej. Zapatillas Runner Pro">
              </div>
              <div class="field">
                <label>Marca</label>
                <input type="text" placeholder="Ej. Nike">
              </div>
              <div class="field">
                <label>Categoría</label>
                <select>
                  <option>Deportivos</option>
                  <option>Casuales</option>
                  <option>Elegantes</option>
                </select>
              </div>
              <div class="field col-span-2">
                <label>Descripción detallada</label>
                <textarea rows="4" placeholder="Describe los materiales, estilo, etc..."></textarea>
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
                <input type="number" placeholder="0.00">
              </div>
              <div class="field">
                <label>Precio de Comparación (Tachado)</label>
                <input type="number" placeholder="0.00">
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
            <p class="helper-text">Sube hasta 5 imágenes. Arrástralas para cambiar el orden. La primera será la imagen principal (portada).</p>
            
            <div class="images-grid">
              <!-- Cajas mockeadas para el drag and drop visual -->
              <div class="image-box main-image">
                <span class="badge-main">Principal</span>
                <span class="material-icons drag-handle">drag_indicator</span>
                <div class="placeholder-content">
                  <span class="material-icons">add_photo_alternate</span>
                  <span>Subir</span>
                </div>
              </div>
              <div class="image-box">
                <span class="material-icons drag-handle">drag_indicator</span>
                <div class="placeholder-content">
                  <span class="material-icons">add_photo_alternate</span>
                </div>
              </div>
              <div class="image-box">
                <span class="material-icons drag-handle">drag_indicator</span>
                <div class="placeholder-content">
                  <span class="material-icons">add_photo_alternate</span>
                </div>
              </div>
              <div class="image-box">
                <span class="material-icons drag-handle">drag_indicator</span>
                <div class="placeholder-content">
                  <span class="material-icons">add_photo_alternate</span>
                </div>
              </div>
              <div class="image-box">
                <span class="material-icons drag-handle">drag_indicator</span>
                <div class="placeholder-content">
                  <span class="material-icons">add_photo_alternate</span>
                </div>
              </div>
            </div>

            <div class="actions between">
              <button class="btn-secondary" (click)="prevStep()"><span class="material-icons">arrow_back</span> Atrás</button>
              <button class="btn-success">Guardar y Publicar <span class="material-icons">check_circle</span></button>
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
    input, select, textarea { width: 100%; padding: 0.9rem; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; font-size: 0.95rem; background: #fafafa; transition: border 0.2s; }
    input:focus, select:focus, textarea:focus { border-color: #000; outline: none; background: #fff; }

    /* Images Grid (Drag & Drop Mockup) */
    .images-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .image-box { aspect-ratio: 1; border: 2px dashed #ddd; border-radius: 12px; background: #fafafa; position: relative; display: flex; align-items: center; justify-content: center; cursor: grab; transition: all 0.2s; }
    .image-box:hover { border-color: #999; background: #f0f0f0; }
    .image-box:active { cursor: grabbing; transform: scale(0.98); }
    .drag-handle { position: absolute; top: 8px; right: 8px; color: #aaa; font-size: 1.2rem; }
    .placeholder-content { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: #888; }
    
    .main-image { grid-column: span 2; grid-row: span 2; aspect-ratio: auto; border-color: #000; border-style: solid; }
    .badge-main { position: absolute; top: 12px; left: 12px; background: #000; color: #fff; font-size: 0.7rem; font-weight: bold; padding: 0.3rem 0.6rem; border-radius: 20px; text-transform: uppercase; }

    /* Actions */
    .actions { display: flex; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #eee; align-items: center; }
    .actions.right { justify-content: flex-end; }
    .actions.between { justify-content: space-between; }
    
    button { display: flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1.8rem; border-radius: 10px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; border: none; }
    .btn-primary { background: #000; color: #fff; }
    .btn-primary:hover { background: #222; }
    .btn-secondary { background: #f5f5f5; color: #333; }
    .btn-secondary:hover { background: #e5e5e5; }
    .btn-success { background: #006600; color: #fff; }
    .btn-success:hover { background: #005500; }
  `]
})
export class AddProductComponent {
  // Estado usando Signals
  currentStep = signal(1);

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
}

