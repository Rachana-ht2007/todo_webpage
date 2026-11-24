import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isValidUrl = (value: string | undefined): value is string => {
  if (!value) return false;
  if (value.includes('your-project-id')) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

const isValidKey = (value: string | undefined): value is string => {
  return Boolean(value && value.trim().length > 10 && !value.includes('your-supabase-anon-key'));
};

export const isSupabaseConfigured: boolean = isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export const SUPABASE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS public.todos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_key text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'Personal' CHECK (category IN ('Study', 'Personal', 'Wellness', 'Project')),
  priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  due_date date,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS todos_user_key_idx ON public.todos (user_key);

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow client CRUD by user_key" ON public.todos
  FOR ALL
  USING (true)
  WITH CHECK (true);`;
