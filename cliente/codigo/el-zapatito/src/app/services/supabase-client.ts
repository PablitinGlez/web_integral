import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fnkmgolemfkyqldopjfr.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZua21nb2xlbWZreXFsZG9wamZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTY4MDEsImV4cCI6MjA5NDkzMjgwMX0.MgHnGywGZYzb4mpcxBcd1KOSY9fOWyYi6sDZmVTZlWU';

// Instancia única compartida por todos los servicios (AuthService, AddressService, etc.)
// Crear más de un cliente de Supabase en la misma app puede causar comportamientos
// inesperados con la sesión de autenticación.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);