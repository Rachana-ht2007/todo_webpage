import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { CreateTodoInput, Todo, UpdateTodoInput } from '../types/todo';

const LOCAL_STORAGE_PREFIX = 'stillwater_todos_v3_';

const createStarterTodos = (userKey: string): Todo[] => {
  const today = new Date();
  const formatDate = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'starter-1',
      user_key: userKey,
      title: 'Morning stretch & ten minutes of quiet breathwork',
      description: 'Open the window for fresh air before checking messages.',
      category: 'Wellness',
      priority: 'High',
      due_date: formatDate(0),
      is_completed: true,
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 'starter-2',
      user_key: userKey,
      title: 'Review research notes on atmospheric design systems',
      description: 'Summarize key typographic spacing principles for the studio deck.',
      category: 'Study',
      priority: 'Medium',
      due_date: formatDate(0),
      is_completed: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: 'starter-3',
      user_key: userKey,
      title: 'Refine Q4 product roadmap milestones',
      description: 'Align timeline milestones with engineering and design leads.',
      category: 'Project',
      priority: 'High',
      due_date: formatDate(1),
      is_completed: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'starter-4',
      user_key: userKey,
      title: 'Water indoor monstera and olive tree',
      description: 'Check soil moisture and mist leaves lightly.',
      category: 'Personal',
      priority: 'Low',
      due_date: formatDate(2),
      is_completed: false,
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
  ];
};

const readLocalTodos = (userKey: string): Todo[] => {
  try {
    const key = `${LOCAL_STORAGE_PREFIX}${userKey}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      const starter = createStarterTodos(userKey);
      localStorage.setItem(key, JSON.stringify(starter));
      return starter;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalTodos = (userKey: string, todos: Todo[]): void => {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${userKey}`, JSON.stringify(todos));
  } catch {
    // Ignore storage quota errors
  }
};

export async function fetchTodos(userKey: string): Promise<Todo[]> {
  if (!userKey) return [];

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_key', userKey)
      .order('created_at', { ascending: false });

    if (error) {
      const missingTable =
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        error.message.toLowerCase().includes('relation') ||
        error.message.toLowerCase().includes('does not exist');
      const err = new Error(error.message) as Error & { isMissingTable?: boolean };
      err.isMissingTable = missingTable;
      throw err;
    }

    return (data ?? []) as Todo[];
  }

  return readLocalTodos(userKey);
}

export async function createTodo(input: CreateTodoInput, userKey: string): Promise<Todo> {
  if (!userKey) {
    throw new Error('Please log in to add tasks.');
  }

  const payload = {
    user_key: userKey,
    title: input.title.trim(),
    description: (input.description ?? '').trim(),
    category: input.category,
    priority: input.priority,
    due_date: input.due_date || null,
    is_completed: false,
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('todos')
      .insert([payload])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data as Todo;
  }

  const newTodo: Todo = {
    id: crypto.randomUUID(),
    ...payload,
    created_at: new Date().toISOString(),
  };
  const current = readLocalTodos(userKey);
  writeLocalTodos(userKey, [newTodo, ...current]);
  return newTodo;
}

export async function updateTodo(
  id: string,
  updates: UpdateTodoInput,
  userKey: string
): Promise<Todo> {
  if (!userKey) {
    throw new Error('Please log in to update tasks.');
  }

  const sanitized: UpdateTodoInput = { ...updates };
  if (sanitized.title !== undefined) sanitized.title = sanitized.title.trim();
  if (sanitized.description !== undefined) sanitized.description = sanitized.description.trim();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('todos')
      .update(sanitized)
      .eq('id', id)
      .eq('user_key', userKey)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data as Todo;
  }

  const current = readLocalTodos(userKey);
  let updatedItem: Todo | null = null;
  const next = current.map((item) => {
    if (item.id === id && item.user_key === userKey) {
      updatedItem = { ...item, ...sanitized };
      return updatedItem;
    }
    return item;
  });

  if (!updatedItem) {
    throw new Error('Task not found.');
  }

  writeLocalTodos(userKey, next);
  return updatedItem;
}

export async function deleteTodo(id: string, userKey: string): Promise<void> {
  if (!userKey) {
    throw new Error('Please log in to delete tasks.');
  }

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_key', userKey);
    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  const current = readLocalTodos(userKey);
  writeLocalTodos(
    userKey,
    current.filter((item) => !(item.id === id && item.user_key === userKey))
  );
}

export async function clearCompletedTodos(userKey: string): Promise<void> {
  if (!userKey) {
    throw new Error('Please log in to clear completed tasks.');
  }

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('is_completed', true)
      .eq('user_key', userKey);
    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  const current = readLocalTodos(userKey);
  writeLocalTodos(
    userKey,
    current.filter((item) => !item.is_completed)
  );
}

export async function restoreTodos(todosToRestore: Todo[], userKey: string): Promise<Todo[]> {
  if (!userKey || todosToRestore.length === 0) return [];

  if (isSupabaseConfigured && supabase) {
    const payloads = todosToRestore.map((t) => ({
      id: t.id,
      user_key: userKey,
      title: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority,
      due_date: t.due_date,
      is_completed: t.is_completed,
      created_at: t.created_at,
    }));

    const { data, error } = await supabase.from('todos').insert(payloads).select();
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as Todo[];
  }

  const current = readLocalTodos(userKey);
  const existingIds = new Set(current.map((t) => t.id));
  const merged = [
    ...todosToRestore.filter((t) => !existingIds.has(t.id)).map((t) => ({ ...t, user_key: userKey })),
    ...current,
  ];
  writeLocalTodos(userKey, merged);
  return todosToRestore;
}
