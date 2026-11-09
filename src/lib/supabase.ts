import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Credenciales oficiales de Supabase Cloud provistas por el usuario
const DEFAULT_SUPABASE_URL = 'https://ydoviusjpgmjsxpspexu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkb3ZpdXNqcGdtanN4cHNwZXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxODc0ODgsImV4cCI6MjEwOTc2MzQ4OH0.zG3dniHtMfwqdx0sf6IcueNMWLoUVfr9zgz5zmXC-6Y';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
