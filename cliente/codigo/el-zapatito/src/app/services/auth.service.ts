import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/auth';
  currentUser = signal<any>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.checkToken();
  }

  register(userData: any) {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any) {
    // FastAPI OAuth2 usa form-data
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    return this.http.post<any>(`${this.apiUrl}/login`, formData).pipe(
      tap(res => {
        localStorage.setItem('token', res.access_token);
        this.decodeAndSetUser(res.access_token);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  private checkToken() {
    const token = localStorage.getItem('token');
    if (token) {
      this.decodeAndSetUser(token);
    }
  }

  private decodeAndSetUser(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUser.set({
        email: payload.sub,
        role: payload.role
      });
    } catch (e) {
      this.logout();
    }
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }
}
