import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase-client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = supabase;
  currentUser = signal<{
    id: string;
    email: string;
    role: string;
    fullName: string | null;
    createdAt: string | null;
    age: number | null;
    phone: string | null;
  } | null>(null);

  constructor(private router: Router) {
    this.init();
  }

  private async init() {
    // Restore session if exists
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session?.user) {
      await this.loadProfile(session.user);
    }

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH] Event:', event, session?.user?.email);
      if (session?.user) {
        await this.loadProfile(session.user);
      } else {
        this.currentUser.set(null);
      }
    });
  }

  private async loadProfile(user: User) {
    // Try to get el perfil completo de la tabla pública users, con fallback a los metadatos del auth
    const { data } = await this.supabase
      .from('users')
      .select('role, full_name, created_at, age, phone')
      .eq('id', user.id)
      .maybeSingle();

    this.currentUser.set({
      id: user.id,
      email: user.email!,
      role: data?.role ?? 'user',
      fullName: data?.full_name ?? (user.user_metadata?.['full_name'] as string) ?? null,
      createdAt: data?.created_at ?? user.created_at ?? null,
      age: data?.age ?? null,
      phone: data?.phone ?? null
    });
    console.log('[AUTH] Profile loaded:', this.currentUser());
  }

  async updateProfile(profileData: { fullName: string; age?: number | null; phone?: string | null }) {
    const user = this.currentUser();
    if (!user) throw new Error('No hay una sesión activa.');

    const trimmedName = profileData.fullName.trim();
    if (!trimmedName) {
      throw new Error('El nombre no puede estar vacío.');
    }

    if (profileData.age !== null && profileData.age !== undefined && (profileData.age < 0 || profileData.age > 120)) {
      throw new Error('Ingresa una edad válida.');
    }

    const payload = {
      id: user.id,
      email: user.email,
      full_name: trimmedName,
      role: user.role,
      age: profileData.age ?? null,
      phone: profileData.phone?.trim() || null
    };

    // Usamos upsert porque algunos usuarios aún no tienen una fila creada en la tabla "users"
    const { error } = await this.supabase
      .from('users')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      throw new Error('No se pudo actualizar el perfil: ' + error.message);
    }

    this.currentUser.set({
      ...user,
      fullName: trimmedName,
      age: payload.age,
      phone: payload.phone
    });
  }

  async register(email: string, password: string, fullName: string) {
    if (!email || !password || !fullName) {
      throw new Error('Todos los campos son obligatorios.');
    }
    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    
    if (error) {
      if (error.message.includes('already registered')) throw new Error('Este correo ya está registrado.');
      if (error.message.includes('Password should be')) throw new Error('La contraseña es demasiado débil.');
      throw new Error('Error al registrar: ' + error.message);
    }
    
    // Supabase returns identities=[] if user already exists (silently)
    if (data.user && data.user.identities?.length === 0) {
      throw new Error('Este correo ya está registrado. Intenta iniciar sesión.');
    }
    return data;
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new Error('Por favor ingresa tu correo y contraseña.');
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) throw new Error('Correo o contraseña incorrectos.');
      if (error.message.includes('Email not confirmed')) throw new Error('Por favor confirma tu correo electrónico primero.');
      throw new Error('Error al iniciar sesión: ' + error.message);
    }
    return data;
  }

  async logout() {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  async getSessionToken(): Promise<string | null> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session?.access_token ?? null;
  }
}