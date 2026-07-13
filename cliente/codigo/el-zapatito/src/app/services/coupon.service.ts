import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

export interface Coupon {
  id?: string;
  code: string;
  discount_type: string;
  value: number;
  min_purchase_amount: number;
  is_active: boolean;
  expiration_date?: string | null;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private apiUrl = 'http://localhost:8000/coupons/';
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private getHeaders(): Observable<HttpHeaders> {
    return from(this.auth.getSessionToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return [headers];
      })
    );
  }

  getCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(this.apiUrl);
  }

  createCoupon(coupon: any): Observable<Coupon> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.post<Coupon>(this.apiUrl, coupon, { headers }))
    );
  }

  deleteCoupon(id: string): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.delete<any>(`${this.apiUrl}${id}`, { headers }))
    );
  }

  validateCoupon(code: string, totalAmount: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}validate`, { code, total_amount: totalAmount });
  }
}
