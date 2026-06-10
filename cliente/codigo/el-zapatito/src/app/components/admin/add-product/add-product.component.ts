import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="form-container">
      <h2>Añadir Nuevo Zapato</h2>
      <form (submit)="onSubmit()">
        <div class="field">
          <label>Nombre</label>
          <input type="text" [(ngModel)]="product.name" name="name" required>
        </div>
        <div class="field">
          <label>Marca</label>
          <input type="text" [(ngModel)]="product.brand" name="brand">
        </div>
        <div class="field">
          <label>Precio</label>
          <input type="number" [(ngModel)]="product.price" name="price" required>
        </div>
        <div class="field">
          <label>Descripción</label>
          <textarea [(ngModel)]="product.description" name="description"></textarea>
        </div>
        <div class="field">
          <label>Imagen</label>
          <input type="file" (change)="onFileSelected($event)" accept="image/*" required>
        </div>
        <button type="submit" [disabled]="loading">
          {{ loading ? 'Subiendo...' : 'Guardar Zapato' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .form-container { max-width: 600px; }
    .field { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    input, textarea { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
    button { background: #000; color: #fff; padding: 1rem 2rem; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { background: #ccc; }
  `]
})
export class AddProductComponent {
  productService = inject(ProductService);
  router = inject(Router);

  product = { name: '', brand: '', price: 0, description: '' };
  selectedFile: File | null = null;
  loading = false;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    if (!this.selectedFile) return;

    this.loading = true;
    const formData = new FormData();
    formData.append('name', this.product.name);
    formData.append('brand', this.product.brand);
    formData.append('price', this.product.price.toString());
    formData.append('description', this.product.description);
    formData.append('file', this.selectedFile);

    this.productService.createProduct(formData).subscribe({
      next: () => {
        alert('Zapato guardado con éxito!');
        this.router.navigate(['/admin']);
      },
      error: () => {
        alert('Error al guardar el producto');
        this.loading = false;
      }
    });
  }
}
