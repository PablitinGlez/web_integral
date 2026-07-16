import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

export interface Supplier {
  id?: string;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active?: boolean;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private apiUrl = 'http://localhost:8000/suppliers/';
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

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.apiUrl);
  }

  getSupplier(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}${id}`);
  }

  createSupplier(supplier: Supplier): Observable<Supplier> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.post<Supplier>(this.apiUrl, supplier, { headers }))
    );
  }

  updateSupplier(id: string, supplier: Partial<Supplier>): Observable<Supplier> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.put<Supplier>(`${this.apiUrl}${id}`, supplier, { headers }))
    );
  }

  deleteSupplier(id: string): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.delete<any>(`${this.apiUrl}${id}`, { headers }))
    );
  }
}
