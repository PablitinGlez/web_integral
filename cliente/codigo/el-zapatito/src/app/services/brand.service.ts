import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

export interface Brand {
  id?: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private apiUrl = 'http://localhost:8000/brands/';
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

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.apiUrl);
  }

  createBrand(brand: {name: string, description: string, is_active: boolean}): Observable<Brand> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.post<Brand>(this.apiUrl, brand, { headers }))
    );
  }

  updateBrand(id: string, brand: {name?: string, description?: string, is_active?: boolean}): Observable<Brand> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.put<Brand>(`${this.apiUrl}${id}`, brand, { headers }))
    );
  }

  deleteBrand(id: string): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.delete<any>(`${this.apiUrl}${id}`, { headers }))
    );
  }
}
