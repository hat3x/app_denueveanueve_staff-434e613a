import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const SUPABASE_URL = "https://cpocwvedqlxtwazwoyfn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwb2N3dmVkcWx4dHdhendveWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDAyOTQsImV4cCI6MjA4ODM3NjI5NH0.hmPg_dNwauEQ6fAQQGA6alZzwuFsb0unnZ6wg20OmX4";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const SUPABASE_PROJECT_ID = "cpocwvedqlxtwazwoyfn";
