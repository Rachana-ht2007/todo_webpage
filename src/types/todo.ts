export type TodoCategory = 'Study' | 'Personal' | 'Wellness' | 'Project';
export type TodoPriority = 'Low' | 'Medium' | 'High';
export type StatusFilter = 'All' | 'Active' | 'Completed';
export type CategoryFilter = 'All' | TodoCategory;
export type SortOption = 'created' | 'priority' | 'due_date';

export interface Todo {
  id: string;
  title: string;
  description: string;
  category: TodoCategory;
  priority: TodoPriority;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  category: TodoCategory;
  priority: TodoPriority;
  due_date?: string | null;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  category?: TodoCategory;
  priority?: TodoPriority;
  due_date?: string | null;
  is_completed?: boolean;
}
