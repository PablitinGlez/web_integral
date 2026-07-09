import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

export interface Address {
  id: string;
  user_id: string;
  label: string;
  street: string;
  city: string;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  phone: string | null;
  is_default: boolean;
  created_at?: string;
}

export interface AddressInput {
  label: string;
  street: string;
  city: string;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
  phone?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AddressService {
  private apiUrl = 'http://localhost:8000/addresses';

  addresses = signal<Address[]>([]);
  loading = signal(false);

  constructor(private http: HttpClient, private auth: AuthService) {}

  private async authHeaders(): Promise<HttpHeaders> {
    const token = await this.auth.getSessionToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para gestionar tus direcciones.');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  async loadAddresses(_userId?: string) {
    this.loading.set(true);
    try {
      const headers = await this.authHeaders();
      const data = await firstValueFrom(this.http.get<Address[]>(`${this.apiUrl}/`, { headers }));
      this.addresses.set(data || []);
    } catch (err: any) {
      throw new Error(this.extractError(err, 'No se pudieron cargar tus direcciones.'));
    } finally {
      this.loading.set(false);
    }
  }

  async addAddress(_userId: string, input: AddressInput, makeDefault: boolean = false) {
    const headers = await this.authHeaders();
    try {
      const created = await firstValueFrom(
        this.http.post<Address>(`${this.apiUrl}/`, { ...input, is_default: makeDefault }, { headers })
      );
      this.addresses.update(list => this.sortAddresses([...list, created]));
      return created;
    } catch (err: any) {
      throw new Error(this.extractError(err, 'No se pudo guardar la dirección.'));
    }
  }

  async updateAddress(id: string, input: AddressInput) {
    const headers = await this.authHeaders();
    try {
      const updated = await firstValueFrom(
        this.http.put<Address>(`${this.apiUrl}/${id}`, input, { headers })
      );
      this.addresses.update(list => this.sortAddresses(list.map(a => (a.id === id ? updated : a))));
      return updated;
    } catch (err: any) {
      throw new Error(this.extractError(err, 'No se pudo actualizar la dirección.'));
    }
  }

  async deleteAddress(id: string, _userId?: string) {
    const headers = await this.authHeaders();
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`, { headers }));
      // Volvemos a pedir la lista completa: el backend ya resolvió si había que
      // promover otra dirección como principal al borrar la que lo era.
      await this.loadAddresses();
    } catch (err: any) {
      throw new Error(this.extractError(err, 'No se pudo eliminar la dirección.'));
    }
  }

  async setDefault(id: string, _userId?: string) {
    const headers = await this.authHeaders();
    try {
      const updated = await firstValueFrom(
        this.http.post<Address>(`${this.apiUrl}/${id}/set-default`, {}, { headers })
      );
      this.addresses.update(list =>
        this.sortAddresses(list.map(a => (a.id === id ? updated : { ...a, is_default: false })))
      );
    } catch (err: any) {
      throw new Error(this.extractError(err, 'No se pudo marcar como principal.'));
    }
  }

  private sortAddresses(list: Address[]): Address[] {
    return [...list].sort((a, b) => {
      if (a.is_default !== b.is_default) return a.is_default ? -1 : 1;
      return (a.created_at || '').localeCompare(b.created_at || '');
    });
  }

  private extractError(err: any, fallback: string): string {
    return err?.error?.detail || err?.message || fallback;
  }
}