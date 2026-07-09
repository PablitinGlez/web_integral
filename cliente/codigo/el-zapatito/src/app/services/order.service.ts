import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8000/orders';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  createOrder(orderData: { shipping_address?: string; paypal_order_id?: string; items: any[] }): Observable<any> {
    return from(this.authService.getSessionToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http.post<any>(`${this.apiUrl}/`, orderData, { headers });
      })
    );
  }

  getOrders(): Observable<any[]> {
    return from(this.authService.getSessionToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http.get<any[]>(`${this.apiUrl}/`, { headers });
      })
    );
  }

  getMyOrders(): Observable<any[]> {
    return from(this.authService.getSessionToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http.get<any[]>(`${this.apiUrl}/my-orders`, { headers });
      })
    );
  }

  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return from(this.authService.getSessionToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        }
        // Pasamos status como parámetro query
        return this.http.put<any>(`${this.apiUrl}/${orderId}/status?status=${encodeURIComponent(status)}`, {}, { headers });
      })
    );
  }

  getPaypalConfig(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/config/paypal`);
  }
}
