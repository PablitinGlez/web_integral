import { Injectable, signal } from '@angular/core';
import { supabase } from './supabase-client';

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
  private supabase = supabase;

  addresses = signal<Address[]>([]);
  loading = signal(false);

  async loadAddresses(userId: string) {
    this.loading.set(true);
    try {
      const { data, error } = await this.supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);
      this.addresses.set(data || []);
    } finally {
      this.loading.set(false);
    }
  }

  private validate(input: AddressInput) {
    if (!input.label?.trim()) throw new Error('Ponle un nombre a la dirección (ej. Casa, Oficina).');
    if (!input.street?.trim()) throw new Error('La calle y número son obligatorios.');
    if (!input.city?.trim()) throw new Error('La ciudad es obligatoria.');
  }

  async addAddress(userId: string, input: AddressInput, makeDefault: boolean = false) {
    this.validate(input);

    // Si es la primera dirección del usuario, se vuelve principal automáticamente
    const isFirstAddress = this.addresses().length === 0;
    const shouldBeDefault = makeDefault || isFirstAddress;

    if (shouldBeDefault) {
      await this.clearDefaults(userId);
    }

    const { data, error } = await this.supabase
      .from('addresses')
      .insert({
        user_id: userId,
        label: input.label.trim(),
        street: input.street.trim(),
        city: input.city.trim(),
        state: input.state?.trim() || null,
        zip_code: input.zip_code?.trim() || null,
        country: input.country?.trim() || 'México',
        phone: input.phone?.trim() || null,
        is_default: shouldBeDefault
      })
      .select()
      .single();

    if (error) throw new Error('No se pudo guardar la dirección: ' + error.message);

    this.addresses.update(list => this.sortAddresses([...list, data as Address]));
    return data as Address;
  }

  async updateAddress(id: string, input: AddressInput) {
    this.validate(input);

    const { data, error } = await this.supabase
      .from('addresses')
      .update({
        label: input.label.trim(),
        street: input.street.trim(),
        city: input.city.trim(),
        state: input.state?.trim() || null,
        zip_code: input.zip_code?.trim() || null,
        country: input.country?.trim() || 'México',
        phone: input.phone?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error('No se pudo actualizar la dirección: ' + error.message);

    this.addresses.update(list =>
      this.sortAddresses(list.map(a => (a.id === id ? (data as Address) : a)))
    );
    return data as Address;
  }

  async deleteAddress(id: string, userId: string) {
    const target = this.addresses().find(a => a.id === id);

    const { error } = await this.supabase.from('addresses').delete().eq('id', id);
    if (error) throw new Error('No se pudo eliminar la dirección: ' + error.message);

    const remaining = this.addresses().filter(a => a.id !== id);
    this.addresses.set(remaining);

    // Si borramos la dirección principal y quedan otras, la primera pasa a ser principal
    if (target?.is_default && remaining.length > 0) {
      await this.setDefault(remaining[0].id, userId);
    }
  }

  async setDefault(id: string, userId: string) {
    await this.clearDefaults(userId);

    const { error } = await this.supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id);

    if (error) throw new Error('No se pudo marcar como principal: ' + error.message);

    this.addresses.update(list =>
      this.sortAddresses(list.map(a => ({ ...a, is_default: a.id === id })))
    );
  }

  private async clearDefaults(userId: string) {
    const { error } = await this.supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true);

    if (error) throw new Error('No se pudo actualizar la dirección principal: ' + error.message);
  }

  private sortAddresses(list: Address[]): Address[] {
    return [...list].sort((a, b) => {
      if (a.is_default !== b.is_default) return a.is_default ? -1 : 1;
      return (a.created_at || '').localeCompare(b.created_at || '');
    });
  }
}