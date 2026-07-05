import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="products-container">
      <header class="page-header">
        <div>
          <h1>Catálogo de Zapatos</h1>
          <p class="subtitle">Administra los productos de tu tienda virtual</p>
        </div>
        <a routerLink="/admin/add-product" class="btn-primary">
          <span class="material-icons">add</span> Añadir Zapato
        </a>
      </header>

      <div class="table-card">
        <div class="card-filters">
          <div class="search-bar">
            <span class="material-icons">search</span>
            <input
              type="text"
              [value]="searchQuery()"
              (input)="onSearch($any($event.target).value)"
              placeholder="Buscar por nombre o marca..."
            >
          </div>
        </div>

        @if (loading()) {
          <div class="loading-state">
            <span class="material-icons spin">autorenew</span>
            <p>Cargando productos...</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Marca</th>
                  <th>Precio</th>
                  <th class="actions-col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (item of filteredProducts(); track item.id) {
                  <tr>
                    <td>
                      <img
                        [src]="item.main_image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=80'"
                        alt="Zapato"
                        class="product-thumb"
                      >
                    </td>
                    <td class="font-bold">{{ item.name }}</td>
                    <td><span class="brand-tag">{{ item.brand || 'Sin marca' }}</span></td>
                    <td class="price-val">{{ item.price | currency:'MXN':'symbol':'1.2-2' }}</td>
                    <td class="actions-col">
                      <button class="btn-delete" (click)="deleteProduct(item.id)">
                        <span class="material-icons">delete</span> Borrar
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="empty-state">
                      <span class="material-icons">inventory_2</span>
                      <p>{{ searchQuery() ? 'Sin resultados para "' + searchQuery() + '"' : 'No hay productos registrados aún.' }}</p>
                      @if (!searchQuery()) {
                        <a routerLink="/admin/add-product" class="btn-add-first">
                          <span class="material-icons">add</span> Añadir el primer producto
                        </a>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (products().length > 0) {
            <div class="table-footer">
              Mostrando {{ filteredProducts().length }} de {{ products().length }} producto(s)
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .products-container { padding: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { font-size: 2.2rem; letter-spacing: -1px; margin: 0 0 0.5rem; }
    .subtitle { color: #888; margin: 0; }

    .btn-primary {
      background: #000; color: #fff; text-decoration: none;
      padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 600;
      display: flex; align-items: center; gap: 0.5rem; transition: background 0.3s;
    }
    .btn-primary:hover { background: #222; }

    .table-card { background: #fff; border: 1px solid #eee; border-radius: 20px; overflow: hidden; }
    .card-filters { padding: 1.5rem; border-bottom: 1px solid #f5f5f5; }

    .search-bar {
      display: flex; align-items: center; gap: 0.5rem;
      background: #f5f5f5; padding: 0.7rem 1.2rem;
      border-radius: 12px; width: 100%; max-width: 400px;
    }
    .search-bar input { border: none; background: transparent; outline: none; width: 100%; font-size: 0.95rem; }
    .search-bar .material-icons { color: #888; }

    .loading-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 4rem 2rem; color: #aaa; gap: 1rem;
    }
    .loading-state .material-icons { font-size: 2.5rem; color: #ccc; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1.2rem 1.5rem; color: #999; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #f5f5f5; font-weight: 700; }
    td { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f9f9f9; font-size: 0.95rem; }

    .product-thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 10px; background: #fafafa; border: 1px solid #eee; }
    .font-bold { font-weight: 600; }
    .brand-tag { background: #f1f3f5; color: #495057; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
    .price-val { font-weight: 700; }

    .actions-col { text-align: right; }
    .btn-delete {
      background: #fff5f5; color: #e03131; border: 1px solid #ffe3e3;
      padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer;
      display: inline-flex; align-items: center; gap: 0.3rem;
      font-weight: 600; font-size: 0.85rem; transition: all 0.2s;
    }
    .btn-delete:hover { background: #e03131; color: #fff; border-color: #e03131; }

    .empty-state { text-align: center; padding: 4rem 2rem; color: #aaa; }
    .empty-state .material-icons { font-size: 3rem; margin-bottom: 1rem; display: block; color: #ccc; }
    .empty-state p { margin: 0 0 1.5rem; font-size: 1rem; }

    .btn-add-first {
      display: inline-flex; align-items: center; gap: 0.4rem;
      background: #000; color: #fff; text-decoration: none;
      padding: 0.7rem 1.4rem; border-radius: 10px;
      font-weight: 600; font-size: 0.9rem; transition: background 0.2s;
    }
    .btn-add-first:hover { background: #222; }

    .table-footer {
      padding: 1rem 1.5rem; border-top: 1px solid #f5f5f5;
      color: #999; font-size: 0.85rem; text-align: right;
    }
  `]
})
export class ProductsComponent implements OnInit {
  productService = inject(ProductService);

  // ✅ Signals — Angular detecta cambios automáticamente sin depender de zone
  products = signal<any[]>([]);
  searchQuery = signal<string>('');
  loading = signal<boolean>(true);

  // computed — se recalcula reactivamente cuando products() o searchQuery() cambian
  filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.products();
    if (!q) return all;
    return all.filter(
      p => p.name?.toLowerCase().includes(q) ||
           (p.brand && p.brand.toLowerCase().includes(q))
    );
  });

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.products.set([]);
        this.loading.set(false);
      }
    });
  }

  onSearch(value: string) {
    this.searchQuery.set(value);
  }

  deleteProduct(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este zapato?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products.update(list => list.filter(p => p.id !== id));
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('No se pudo eliminar el producto.');
        }
      });
    }
  }
}
