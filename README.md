# Stillwater — Mindful Task Planner

A calm, visually nourishing To-Do application with an asymmetric split-focus layout, daily wellness progress ring, and full CRUD persistence backed by Supabase.

## Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and run the following SQL to create the `todos` table:

```sql
CREATE TABLE IF NOT EXISTS public.todos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'Personal' CHECK (category IN ('Study', 'Personal', 'Wellness', 'Project')),
  priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  due_date date,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Demo policy allowing anonymous client CRUD (replace with auth.uid() policies for multi-user apps)
CREATE POLICY "Allow anonymous demo access" ON public.todos
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

3. Add your project credentials to `.env.local` (or your hosting environment variables):

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

4. Restart the dev server. Until these environment variables are provided, Stillwater automatically runs in local browser storage fallback mode so every CRUD feature remains usable.
