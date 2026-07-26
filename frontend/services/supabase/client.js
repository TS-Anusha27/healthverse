// HealthVerse — Supabase Client Setup
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://aywozrmnjecwqlpzrjka.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5d296cm1uamVjd3FscHpyamthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzkzNzQsImV4cCI6MjA5OTYxNTM3NH0.dG-suJOZUDquj-xCfPMZgEFN4LkhEBGF9nggViAACbM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
