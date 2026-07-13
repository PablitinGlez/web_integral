import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

export interface Category {
  id?: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:8000/categories/';
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

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }
  
  createCategory(category: {name: string, description: string, is_active: boolean}): Observable<Category> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.post<Category>(this.apiUrl, category, { headers }))
    );
  }

  updateCategory(id: string, category: {name?: string, description?: string, is_active?: boolean}): Observable<Category> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.put<Category>(`${this.apiUrl}${id}`, category, { headers }))
    );
  }

  deleteCategory(id: string): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.delete<any>(`${this.apiUrl}${id}`, { headers }))
    );
  }
}
