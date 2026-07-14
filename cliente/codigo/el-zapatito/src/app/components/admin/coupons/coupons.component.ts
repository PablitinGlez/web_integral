import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, delay, finalize, retryWhen, take } from 'rxjs/operators';

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="coupons-page">
      <header class="page-header">
        <div>
          <h1>Cupones y promociones</h1>
          <p class="subtitle">Gestiona descuentos para tus clientes desde aquí.</p>
        </div>
      </header>

      <section class="coupon-form-card">
        <h3>Agregar nuevo cupón</h3>
        <div class="coupon-form-grid">
          <label>
            <span>Nombre</span>
            <input type="text" [(ngModel)]="newCoupon.name" placeholder="Ej. Black Friday">
          </label>
          <label>
            <span>Código</span>
            <input type="text" [(ngModel)]="newCoupon.code" placeholder="Ej. BF2026">
          </label>
          <label>
            <span>Porcentaje de descuento</span>
            <input type="number" min="1" max="100" [(ngModel)]="newCoupon.percentage" placeholder="10">
          </label>
          <label>
            <span>Compra mínima ($)</span>
            <input type="number" min="0" [(ngModel)]="newCoupon.min_purchase" placeholder="100">
          </label>
          <label>
            <span>Vigencia desde</span>
            <input type="date" [(ngModel)]="newCoupon.start_date">
          </label>
          <label>
            <span>Vigencia hasta</span>
            <input type="date" [(ngModel)]="newCoupon.end_date">
          </label>
        </div>
        <div class="coupon-form-actions">
          <button class="btn-primary" (click)="createCoupon()" [disabled]="creatingCoupon">
            {{ creatingCoupon ? 'Creando...' : 'Guardar cupón' }}
          </button>
        </div>
        <p class="form-message" *ngIf="formMessage">{{ formMessage }}</p>
      </section>

      <section class="coupons-list-card">
        <div class="card-header">
          <h3>Cupones activos</h3>
          <span class="pill">{{ coupons.length }} disponibles</span>
        </div>

        <div class="coupons-list" *ngIf="coupons.length > 0; else emptyState">
          <div class="coupon-card" *ngFor="let coupon of coupons">
            <div>
              <p class="coupon-name">{{ coupon.name }}</p>
              <p class="coupon-code">{{ coupon.code }}</p>
            </div>
            <div class="coupon-meta">
              <span class="coupon-badge">{{ coupon.value }}%</span>
              <small>Min: \${{ coupon.min_amount || 0 }}</small>
            </div>
          </div>
        </div>

        <ng-template #emptyState>
          <p class="empty-state">No hay cupones activos aún.</p>
        </ng-template>
      </section>
    </div>
  `,
  styles: [`
    .coupons-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header h1 { margin: 0 0 0.25rem; font-size: 2rem; }
    .subtitle { color: #777; margin: 0; }
    .coupon-form-card, .coupons-list-card { background: #fff; border: 1px solid #eee; border-radius: 20px; padding: 1.25rem; }
    .coupon-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    .coupon-form-grid label { display: flex; flex-direction: column; gap: 0.35rem; color: #444; font-size: 0.95rem; }
    .coupon-form-grid input { border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.7rem 0.8rem; font: inherit; }
    .coupon-form-actions { margin-top: 1rem; }
    .btn-primary { background: #111827; color: #fff; border: none; border-radius: 10px; padding: 0.75rem 1rem; font-weight: 600; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.7; cursor: wait; }
    .form-message { margin-top: 0.75rem; color: #059669; font-weight: 600; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .pill { background: #f3f4f6; padding: 0.35rem 0.8rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; }
    .coupons-list { display: grid; gap: 1rem; }
    .coupon-card { display: flex; justify-content: space-between; align-items: center; border: 1px solid #f0f0f0; border-radius: 14px; padding: 1rem; background: #fafafa; }
    .coupon-name { font-weight: 700; margin: 0 0 0.25rem; }
    .coupon-code { color: #666; margin: 0; font-size: 0.9rem; }
    .coupon-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 0.2rem; }
    .coupon-badge { background: #111827; color: #fff; padding: 0.4rem 0.7rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; }
    .empty-state { color: #777; margin: 0; }
  `]
})
export class CouponsComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  coupons: any[] = [];
  creatingCoupon = false;
  formMessage = '';
  newCoupon = {
    name: '',
    code: '',
    percentage: 10,
    min_purchase: 100,
    start_date: '',
    end_date: ''
  };

  ngOnInit(): void {
    this.loadCoupons();
  }

  createCoupon(): void {
    if (!this.newCoupon.name?.trim()) {
      this.formMessage = 'Ingresa un nombre para el cupón.';
      this.cdr.detectChanges();
      return;
    }

    const percentage = Number(this.newCoupon.percentage || 0);
    if (percentage <= 0 || percentage > 100) {
      this.formMessage = 'El porcentaje debe estar entre 1 y 100.';
      this.cdr.detectChanges();
      return;
    }

    const code = (this.newCoupon.code || this.newCoupon.name).trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const payload = {
      code,
      name: this.newCoupon.name.trim(),
      description: 'Creado desde la sección de cupones',
      discount_type: 'percentage',
      value: percentage,
      min_amount: Number(this.newCoupon.min_purchase || 0),
      is_active: true,
      start_date: this.newCoupon.start_date ? new Date(`${this.newCoupon.start_date}T00:00:00`).toISOString() : null,
      end_date: this.newCoupon.end_date ? new Date(`${this.newCoupon.end_date}T23:59:59`).toISOString() : null,
      usage_limit: 0
    };

    this.creatingCoupon = true;
    this.formMessage = '';
    this.cdr.detectChanges();

    this.http.post('https://web-integral.onrender.com/coupons/', payload)
      .pipe(finalize(() => {
        this.creatingCoupon = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.formMessage = 'Cupón creado correctamente.';
          this.newCoupon = { name: '', code: '', percentage: 10, min_purchase: 100, start_date: '', end_date: '' };
          this.loadCoupons();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.formMessage = err?.error?.detail || 'No se pudo crear el cupón.';
          this.cdr.detectChanges();
        }
      });
  }

  private loadCoupons(): void {
    this.http.get<any[]>('https://web-integral.onrender.com/coupons/')
      .pipe(
        retryWhen(errors => errors.pipe(delay(500), take(3))),
        catchError(() => {
          this.coupons = [];
          this.cdr.detectChanges();
          return of([]);
        })
      )
      .subscribe((data) => {
        this.coupons = (data || []).filter((coupon: any) => coupon.is_active);
        this.cdr.detectChanges();
      });
  }
}
