import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente público (para operaciones del lado del cliente)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente con privilegios de servicio (para operaciones del lado del servidor)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  db: {
    schema: 'public',
  }
});

// Tipos para la base de datos
export interface Usuario {
  id: string;
  email: string;
  password: string;
  nombre: string;
  rol: 'admin' | 'editor' | 'visor';
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}
