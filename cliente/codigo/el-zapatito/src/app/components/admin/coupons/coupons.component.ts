import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CouponService, Coupon } from '../../../services/coupon.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="coupons-container">
      <nav class="breadcrumbs">
        <a routerLink="/admin">Dashboard</a>
        <span class="separator">/</span>
        <span class="current">Cupones</span>
      </nav>

      <header class="page-header">
        <div>
          <h1>Gestión de Cupones</h1>
          <p class="subtitle">Crea y administra códigos promocionales para la tienda</p>
        </div>
        <button class="btn-primary" (click)="openFormDrawer()">
          <span class="material-icons">add</span> Nuevo Cupón
        </button>
      </header>

      <div class="table-card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Compra Mínima</th>
                <th>Expiración</th>
                <th>Estado</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (c of coupons(); track c.id) {
                <tr [class.inactive-row]="!c.is_active || isExpired(c)">
                  <td class="font-bold code-badge">{{ c.code }}</td>
                  <td>
                    <span class="type-tag" [class]="c.discount_type">
                      {{ c.discount_type === 'percentage' ? 'Porcentaje' : 'Monto Fijo' }}
                    </span>
                  </td>
                  <td class="font-bold">
                    {{ c.discount_type === 'percentage' ? c.value + '%' : (c.value | currency:'MXN') }}
                  </td>
                  <td>{{ c.min_purchase_amount | currency:'MXN' }}</td>
                  <td>
                    @if (c.expiration_date) {
                      <span [class.expired-text]="isExpired(c)">
                        {{ c.expiration_date | date:'shortDate' }}
                        @if (isExpired(c)) { (Expirado) }
                      </span>
                    } @else {
                      <span class="forever">Sin límite</span>
                    }
                  </td>
                  <td>
                    <span class="status-indicator" [class.active]="c.is_active && !isExpired(c)" [class.inactive]="!c.is_active || isExpired(c)">
                      {{ (c.is_active && !isExpired(c)) ? 'Activo' : (isExpired(c) ? 'Expirado' : 'Inactivo') }}
                    </span>
                  </td>
                  <td class="actions-col">
                    <button class="btn-icon btn-delete" title="Eliminar" (click)="confirmDelete(c)">
                      <span class="material-icons">delete</span>
                    </button>
                  </td>
                </tr>
              }
              @if (coupons().length === 0) {
                <tr>
                  <td colspan="7" class="empty-state">
                    <span class="material-icons">local_offer</span>
                    <p>No hay cupones registrados aún.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Drawer de Creación -->
      @if (showFormDrawer()) {
        <div class="backdrop" (click)="closeFormDrawer()">
          <div class="drawer" (click)="$event.stopPropagation()">
            <header class="drawer-header">
              <h2>Nuevo Cupón de Descuento</h2>
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
                <label>Código del Cupón <span class="required-asterisk">*</span></label>
                <input type="text" [(ngModel)]="formData.code" (input)="clearFormError()" placeholder="Ej. VERANO20, ZAPATITO10" maxlength="30">
                <span class="field-hint">Solo letras y números, se guardará en mayúsculas.</span>
                @if (formData.code && !isValidCode(formData.code)) {
                  <span class="field-error">El código contiene caracteres inválidos.</span>
                }
              </div>

              <div class="field">
                <label>Tipo de Descuento <span class="required-asterisk">*</span></label>
                <select [(ngModel)]="formData.discount_type" (change)="clearFormError()" class="native-select">
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto Fijo ($)</option>
                </select>
              </div>

              <div class="field">
                <label>Valor de Descuento <span class="required-asterisk">*</span></label>
                <input type="number" [(ngModel)]="formData.value" (input)="clearFormError()" placeholder="Ej. 15 (para 15%) o 100 (para $100)">
                @if (formData.value !== null && formData.value <= 0) {
                  <span class="field-error">El valor debe ser mayor a 0.</span>
                }
                @if (formData.discount_type === 'percentage' && formData.value !== null && formData.value > 100) {
                  <span class="field-error">El porcentaje de descuento no puede ser mayor a 100%.</span>
                }
              </div>

              <div class="field">
                <label>Compra Mínima Requerida ($)</label>
                <input type="number" [(ngModel)]="formData.min_purchase_amount" (input)="clearFormError()" placeholder="Ej. 500">
                @if (formData.min_purchase_amount !== null && formData.min_purchase_amount < 0) {
                  <span class="field-error">La compra mínima no puede ser negativa.</span>
                }
              </div>

              <div class="field">
                <label>Fecha de Expiración</label>
                <input type="date" [(ngModel)]="formData.expiration_date" (input)="clearFormError()" [min]="minDateString">
                <span class="field-hint">Opcional. Deja vacío si el cupón no expira.</span>
              </div>
            </div>
            <footer class="drawer-footer">
              <button class="btn-secondary" (click)="closeFormDrawer()">Cancelar</button>
              <button class="btn-primary" (click)="saveCoupon()" [disabled]="loading() || isFormInvalid()">
                {{ loading() ? 'Guardando...' : 'Guardar' }}
              </button>
            </footer>
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
            <h3>Eliminar Cupón</h3>
            <p>
              ¿Estás seguro de que deseas eliminar permanentemente el cupón <strong>"{{ couponToDelete()?.code }}"</strong>? Esta acción no se puede deshacer.
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
    .coupons-container { padding: 1rem; }
    .breadcrumbs { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #666; margin-bottom: 1.5rem; }
    .breadcrumbs a { color: #888; text-decoration: none; }
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
    .btn-danger { background: #e03131; color: #fff; border: none; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; }
    .btn-danger:hover { background: #c92a2a; }
    .btn-danger:disabled { background: #fca5a5; cursor: not-allowed; }
    
    .btn-icon { background: none; border: none; cursor: pointer; color: #666; padding: 0.5rem; border-radius: 8px; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; }
    .btn-icon:hover { background: #f0f0f0; color: #000; }
    .btn-icon.btn-delete:hover { background: #fff5f5; color: #e03131; }

    .table-card { background: #fff; border: 1px solid #eee; border-radius: 20px; overflow: hidden; }
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1.2rem 1.5rem; color: #999; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #f5f5f5; font-weight: 700; }
    td { padding: 1rem 1.5rem; border-bottom: 1px solid #f9f9f9; font-size: 0.95rem; vertical-align: middle; }
    .font-bold { font-weight: 600; }
    
    .code-badge { font-family: monospace; font-size: 1rem; letter-spacing: 0.5px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.3rem 0.6rem; border-radius: 6px; display: inline-block; }
    .type-tag { padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.78rem; font-weight: 600; }
    .type-tag.percentage { background: #e0f2fe; color: #0369a1; }
    .type-tag.fixed { background: #fef3c7; color: #d97706; }
    
    .expired-text { color: #ef4444; font-weight: 600; }
    .forever { color: #888; font-style: italic; }

    .status-indicator { font-size: 0.8rem; font-weight: 600; padding: 0.25rem 0.6rem; border-radius: 20px; }
    .status-indicator.active { background: #d1fae5; color: #065f46; }
    .status-indicator.inactive { background: #fee2e2; color: #991b1b; }

    .actions-col { text-align: right; white-space: nowrap; }
    .inactive-row td { opacity: 0.55; }
    .empty-state { text-align: center; padding: 4rem 2rem; color: #aaa; }
    .empty-state .material-icons { font-size: 3rem; margin-bottom: 1rem; color: #ccc; display: block; }

    /* Form validations */
    .required-asterisk { color: #e03131; }
    .field-error { display: block; color: #e03131; font-size: 0.8rem; margin-top: 0.25rem; font-weight: 500; }
    .field-hint { display: block; color: #888; font-size: 0.78rem; margin-top: 0.25rem; }
    .error-banner { display: flex; align-items: center; gap: 0.75rem; background: #fff5f5; border: 1px solid #ffc9c9; color: #c92a2a; padding: 0.8rem 1.2rem; border-radius: 10px; margin-bottom: 1.5rem; font-size: 0.9rem; text-align: left; }
    .error-banner .material-icons { color: #e03131; font-size: 1.3rem; }

    /* Select Dropdowns */
    .native-select {
      width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 8px;
      box-sizing: border-box; font-size: 0.95rem; background: #fafafa; cursor: pointer;
    }

    /* Backdrop */
    .backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; justify-content: flex-end; z-index: 100; }
    .backdrop.center { justify-content: center; align-items: center; }

    /* Drawer */
    .drawer { background: #fff; width: 100%; max-width: 450px; height: 100vh; display: flex; flex-direction: column; box-shadow: -10px 0 30px rgba(0,0,0,0.1); animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .drawer-header { padding: 1.5rem 2rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .drawer-header h2 { margin: 0; font-size: 1.4rem; }
    .btn-close { background: none; border: none; cursor: pointer; color: #999; display: flex; align-items: center; }
    .drawer-body { padding: 2rem; flex: 1; overflow-y: auto; }
    .field { margin-bottom: 1.5rem; text-align: left; }
    .field > label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; color: #444; }
    input[type="text"], input[type="number"], input[type="date"] { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; font-family: inherit; font-size: 0.95rem; }
    input:focus { border-color: #000; outline: none; }
    .drawer-footer { padding: 1.5rem 2rem; border-top: 1px solid #eee; background: #fafafa; display: flex; justify-content: flex-end; gap: 1rem; }

    /* Confirm Modal */
    .confirm-modal { background: #fff; border-radius: 20px; padding: 2.5rem; max-width: 420px; width: 90%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.15); animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .confirm-icon { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
    .confirm-icon.deactivate { background: #fff5f5; color: #e03131; }
    .confirm-icon .material-icons { font-size: 2rem; }
    .confirm-modal h3 { margin: 0 0 0.75rem; font-size: 1.3rem; }
    .confirm-modal p { color: #666; margin: 0 0 2rem; line-height: 1.5; }
    .confirm-actions { display: flex; gap: 1rem; justify-content: center; }
  `]
})
export class CouponsComponent implements OnInit {
  couponService = inject(CouponService);
  toast = inject(ToastService);

  coupons = signal<Coupon[]>([]);
  loading = signal(false);
  minDateString: string = '';

  // Form Drawer State
  showFormDrawer = signal(false);
  formData = {
    code: '',
    discount_type: 'percentage',
    value: null as number | null,
    min_purchase_amount: 0,
    is_active: true,
    expiration_date: ''
  };
  formErrorMessage = signal<string | null>(null);

  // Confirm Delete Modal State
  showDeleteModal = signal(false);
  couponToDelete = signal<Coupon | null>(null);
  deleteErrorMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadCoupons();
    
    // Set min date to today for the date picker
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.minDateString = `${yyyy}-${mm}-${dd}`;
  }

  loadCoupons() {
    this.couponService.getCoupons().subscribe({
      next: (data) => this.coupons.set(data),
      error: (err) => console.error('Error cargando cupones', err)
    });
  }

  openFormDrawer() {
    this.formErrorMessage.set(null);
    this.formData = {
      code: '',
      discount_type: 'percentage',
      value: null,
      min_purchase_amount: 0,
      is_active: true,
      expiration_date: ''
    };
    this.showFormDrawer.set(true);
  }

  closeFormDrawer() {
    this.showFormDrawer.set(false);
  }

  clearFormError() {
    this.formErrorMessage.set(null);
  }

  isValidCode(code: string): boolean {
    const regex = /^[A-Z0-9]+$/i;
    return regex.test(code);
  }

  isFormInvalid(): boolean {
    const code = this.formData.code.trim();
    if (!code || !this.isValidCode(code)) return true;
    
    const val = this.formData.value;
    if (val === null || val <= 0) return true;
    
    if (this.formData.discount_type === 'percentage' && val > 100) return true;
    if (this.formData.min_purchase_amount < 0) return true;
    
    return false;
  }

  isExpired(c: Coupon): boolean {
    if (!c.expiration_date) return false;
    return new Date(c.expiration_date).getTime() < new Date().getTime();
  }

  saveCoupon() {
    if (this.isFormInvalid()) {
      this.formErrorMessage.set('Corrige los errores del formulario antes de guardar.');
      return;
    }

    this.loading.set(true);
    this.formErrorMessage.set(null);

    const payload = {
      code: this.formData.code.toUpperCase().trim(),
      discount_type: this.formData.discount_type,
      value: Number(this.formData.value),
      min_purchase_amount: Number(this.formData.min_purchase_amount || 0),
      is_active: this.formData.is_active,
      expiration_date: this.formData.expiration_date ? new Date(this.formData.expiration_date).toISOString() : null
    };

    this.couponService.createCoupon(payload).subscribe({
      next: () => {
        this.toast.success(`Cupón "${payload.code}" creado con éxito.`);
        this.loadCoupons();
        this.closeFormDrawer();
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const errMsg = err.error?.detail || 'Error al guardar el cupón. Intenta de nuevo.';
        this.formErrorMessage.set(errMsg);
      }
    });
  }

  // Delete flow
  confirmDelete(coupon: Coupon) {
    this.deleteErrorMessage.set(null);
    this.couponToDelete.set(coupon);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    if (this.loading()) return;
    this.showDeleteModal.set(false);
    this.couponToDelete.set(null);
    this.deleteErrorMessage.set(null);
  }

  executeDelete() {
    const coupon = this.couponToDelete();
    if (!coupon) return;

    this.loading.set(true);
    this.deleteErrorMessage.set(null);

    this.couponService.deleteCoupon(coupon.id!).subscribe({
      next: () => {
        this.toast.success(`Cupón "${coupon.code}" eliminado.`);
        this.loading.set(false);
        this.loadCoupons();
        this.closeDeleteModal();
      },
      error: (err) => {
        this.loading.set(false);
        const errMsg = err.error?.detail || 'Error al eliminar. Intenta de nuevo.';
        this.deleteErrorMessage.set(errMsg);
      }
    });
  }
}
