import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fnkmgolemfkyqldopjfr.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZua21nb2xlbWZreXFsZG9wamZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTY4MDEsImV4cCI6MjA5NDkzMjgwMX0.MgHnGywGZYzb4mpcxBcd1KOSY9fOWyYi6sDZmVTZlWU';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient;
  currentUser = signal<{ id: string; email: string; role: string } | null>(null);

  constructor(private router: Router) {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
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
    // Try to get role from public users table, fallback to 'user'
    const { data } = await this.supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    this.currentUser.set({
      id: user.id,
      email: user.email!,
      role: data?.role ?? 'user'
    });
    console.log('[AUTH] Profile loaded:', this.currentUser());
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
