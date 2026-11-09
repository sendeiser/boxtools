import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// En Vite, las variables VITE_* provienen de .env (local) o del panel de Netlify (producción)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
