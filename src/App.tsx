import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Search,
  X,
  Database,
  Undo2,
  ArrowUpDown,
  AlertCircle,
  LogOut,
  User,
} from 'lucide-react';
import {
  CategoryFilter,
  CreateTodoInput,
  SortOption,
  StatusFilter,
  Todo,
  UpdateTodoInput,
} from './types/todo';
import { isSupabaseConfigured } from './lib/supabase';
import {
  clearCompletedTodos,
  createTodo,
  deleteTodo,
  fetchTodos,
  restoreTodos,
  updateTodo,
} from './services/todoService';
import { FocusWellnessCard } from './components/FocusWellnessCard';
import { TaskComposer } from './components/TaskComposer';
import { TaskCard } from './components/TaskCard';
import { EditTaskDrawer } from './components/EditTaskDrawer';
import { EmptyTasksState } from './components/EmptyTasksState';
import { TaskListSkeleton } from './components/TaskListSkeleton';
import { AuthScreen } from './components/AuthScreen';

const CATEGORY_TABS: CategoryFilter[] = ['All', 'Personal', 'Wellness', 'Study', 'Project'];
const STATUS_TABS: StatusFilter[] = ['All', 'Active', 'Completed'];

const PRIORITY_WEIGHT: Record<Todo['priority'], number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

interface UndoBannerState {
  message: string;
  removedTodos: Todo[];
}

const USER_STORAGE_KEY = 'stillwater_current_user';

const readStoredUser = (): string | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const normalized = raw.trim().toLowerCase();
    return normalized || null;
  } catch {
    return null;
  }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(() => readStoredUser());

  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMissingTable, setIsMissingTable] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('created');

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [undoState, setUndoState] = useState<UndoBannerState | null>(null);

  const composerInputRef = useRef<HTMLInputElement | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  const loadTasks = useCallback(async (userKey: string) => {
    setLoading(true);
    setErrorMsg(null);
    setIsMissingTable(false);
    try {
      const data = await fetchTodos(userKey);
      setTodos(data);
    } catch (err) {
      const typed = err as Error & { isMissingTable?: boolean };
      setErrorMsg(typed.message || 'Unable to load tasks.');
      setIsMissingTable(Boolean(typed.isMissingTable));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setTodos([]);
      setLoading(false);
      return;
    }
    loadTasks(currentUser);
  }, [currentUser, loadTasks]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    };
  }, []);

  const showUndoToast = (message: string, removedTodos: Todo[]) => {
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    setUndoState({ message, removedTodos });
    undoTimerRef.current = window.setTimeout(() => {
      setUndoState(null);
    }, 6000);
  };

  const handleLogin = (normalizedUserKey: string) => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, normalizedUserKey);
    } catch {
      // Ignore storage quota errors
    }
    setSearchQuery('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setCurrentUser(normalizedUserKey);
  };

  const handleLogOut = () => {
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setUndoState(null);
    setEditingTodo(null);
    setErrorMsg(null);
    setSearchQuery('');
    setTodos([]);
    setCurrentUser(null);
  };

  const handleAddTask = async (input: CreateTodoInput) => {
    if (!currentUser) return;
    setErrorMsg(null);
    try {
      const created = await createTodo(input, currentUser);
      setTodos((prev) => [created, ...prev]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save task.');
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    if (!currentUser) return;
    const nextCompleted = !todo.is_completed;
    setTodos((prev) =>
      prev.map((item) =>
        item.id === todo.id ? { ...item, is_completed: nextCompleted } : item
      )
    );
    try {
      await updateTodo(todo.id, { is_completed: nextCompleted }, currentUser);
    } catch (err) {
      setTodos((prev) =>
        prev.map((item) =>
          item.id === todo.id ? { ...item, is_completed: todo.is_completed } : item
        )
      );
      setErrorMsg(err instanceof Error ? err.message : 'Unable to update task.');
    }
  };

  const handleSaveEdit = async (id: string, updates: UpdateTodoInput) => {
    if (!currentUser) return;
    const updated = await updateTodo(id, updates, currentUser);
    setTodos((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  const handleDeleteTodo = async (todo: Todo) => {
    if (!currentUser) return;
    const snapshot = todos;
    setTodos((prev) => prev.filter((item) => item.id !== todo.id));
    try {
      await deleteTodo(todo.id, currentUser);
      showUndoToast(`Removed "${todo.title}"`, [todo]);
    } catch (err) {
      setTodos(snapshot);
      setErrorMsg(err instanceof Error ? err.message : 'Unable to delete task.');
    }
  };

  const handleClearCompleted = async () => {
    if (!currentUser) return;
    const completedItems = todos.filter((t) => t.is_completed);
    if (completedItems.length === 0) return;

    const snapshot = todos;
    setTodos((prev) => prev.filter((t) => !t.is_completed));
    try {
      await clearCompletedTodos(currentUser);
      showUndoToast(
        `Cleared ${completedItems.length} completed ${completedItems.length === 1 ? 'task' : 'tasks'}`,
        completedItems
      );
    } catch (err) {
      setTodos(snapshot);
      setErrorMsg(err instanceof Error ? err.message : 'Unable to clear completed tasks.');
    }
  };

  const handleUndoDelete = async () => {
    if (!undoState || !currentUser) return;
    const toRestore = undoState.removedTodos;
    setUndoState(null);
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);

    try {
      const restored = await restoreTodos(toRestore, currentUser);
      setTodos((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const uniqueRestored = restored.filter((t) => !existingIds.has(t.id));
        return [...uniqueRestored, ...prev];
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to restore removed tasks.');
    }
  };

  const focusComposer = () => {
    composerInputRef.current?.focus();
    composerInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const resetFilters = () => {
    setStatusFilter('All');
    setCategoryFilter('All');
    setSearchQuery('');
  };

  const totalCount = todos.length;
  const completedCount = useMemo(
    () => todos.filter((t) => t.is_completed).length,
    [todos]
  );
  const highPriorityActiveCount = useMemo(
    () => todos.filter((t) => !t.is_completed && t.priority === 'High').length,
    [todos]
  );

  const filteredAndSortedTodos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = todos.filter((todo) => {
      if (statusFilter === 'Active' && todo.is_completed) return false;
      if (statusFilter === 'Completed' && !todo.is_completed) return false;
      if (categoryFilter !== 'All' && todo.category !== categoryFilter) return false;

      if (query) {
        const hay = `${todo.title} ${todo.description} ${todo.category}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      // Keep active tasks gently above completed ones unless viewing Completed tab
      if (statusFilter === 'All' && a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }

      if (sortBy === 'priority') {
        const diff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        if (diff !== 0) return diff;
      }

      if (sortBy === 'due_date') {
        if (a.due_date && b.due_date) {
          const cmp = a.due_date.localeCompare(b.due_date);
          if (cmp !== 0) return cmp;
        } else if (a.due_date && !b.due_date) {
          return -1;
        } else if (!a.due_date && b.due_date) {
          return 1;
        }
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [todos, statusFilter, categoryFilter, searchQuery, sortBy]);

  const hasSearchOrCategoryFilter =
    categoryFilter !== 'All' || searchQuery.trim().length > 0;

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#242B28] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-[#E8ECE9] bg-[#FAF9F6]/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single text wordmark */}
          <a
            href="#top"
            className="font-display text-xl font-medium tracking-tight text-[#1E2522] whitespace-nowrap shrink-0"
          >
            Stillwater
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5A6560]"
          >
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className={`hover:text-[#1E2522] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === 'All' ? 'text-[#1E2522] underline underline-offset-4 decoration-[#8B7EB8]' : ''
              }`}
            >
              All Tasks
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Active')}
              className={`hover:text-[#1E2522] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === 'Active' ? 'text-[#1E2522] underline underline-offset-4 decoration-[#8B7EB8]' : ''
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Completed')}
              className={`hover:text-[#1E2522] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === 'Completed' ? 'text-[#1E2522] underline underline-offset-4 decoration-[#8B7EB8]' : ''
              }`}
            >
              Completed
            </button>
          </nav>

          {/* Zone 3: Logged-in User + Log Out + Primary New Task Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#5A6560] pr-1">
              <User className="w-3.5 h-3.5 text-[#6A8C7D] shrink-0" aria-hidden="true" />
              <span className="max-w-[160px] lg:max-w-[220px] truncate" title={currentUser}>
                {currentUser}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogOut}
              aria-label="Log out"
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl border border-[#DCE2DE] bg-white hover:bg-[#F4F6F4] text-[#4E5A55] hover:text-[#1E2522] text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7EB8] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Log Out</span>
            </button>
            <button
              type="button"
              onClick={focusComposer}
              className="px-4 py-2 min-h-[40px] rounded-xl bg-[#344E44] hover:bg-[#283E35] text-white text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7EB8] whitespace-nowrap shrink-0 cursor-pointer"
            >
              New Task
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main id="top" className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        {/* Supabase Fallback / Setup Notice */}
        {!isSupabaseConfigured && !bannerDismissed && (
          <div className="mb-6 rounded-2xl bg-[#E8F1F5]/80 border border-[#D4E3EB] px-4 py-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3 text-sm text-[#2A3B42]">
              <Database className="w-4 h-4 text-[#4A6B78] shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
              <p className="leading-snug">
                <span className="font-medium">Local preview mode active.</span>{' '}
                Add <code className="font-mono text-xs bg-white/70 px-1.5 py-0.5 rounded">VITE_SUPABASE_URL</code> and{' '}
                <code className="font-mono text-xs bg-white/70 px-1.5 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> to sync with your Supabase database.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                aria-label="Dismiss setup notice"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#4E646E] hover:bg-white/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Supabase Error State */}
        {errorMsg && (
          <div
            role="alert"
            className="mb-6 rounded-2xl bg-[#F9ECEA] border border-[#EBCBC7] px-4 py-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-[#7A3730]"
          >
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
              <span>
                {isMissingTable
                  ? 'Connected to Supabase, but the "todos" table has not been created yet.'
                  : errorMsg}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => currentUser && loadTasks(currentUser)}
                className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#7A3730] text-white text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Asymmetric 2-Column Split-Focus Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Top Column: Serene Daily Focus & Wellness Card */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
            <FocusWellnessCard
              totalCount={totalCount}
              completedCount={completedCount}
              highPriorityActiveCount={highPriorityActiveCount}
            />
          </div>

          {/* Right Column: Task Composer, Filters, and Task List */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5 min-w-0">
            {/* Task Composer */}
            <TaskComposer onAddTask={handleAddTask} inputRef={composerInputRef} />

            {/* Search & Filter Toolbar */}
            <div className="space-y-3 pt-1">
              {/* Row 1: Search Input + Sort + Clear Completed */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1 min-w-0">
                  <Search
                    className="w-4 h-4 text-[#78847E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <label htmlFor="task-search" className="sr-only">
                    Search tasks
                  </label>
                  <input
                    id="task-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks by title, note, or category..."
                    className="w-full min-h-[42px] rounded-xl bg-white border border-[#E4E8E5] pl-10 pr-9 py-2 text-sm text-[#1E2522] placeholder:text-[#86918C] focus:outline-none focus:border-[#8B7EB8]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-[#6D7873] hover:text-[#1E2522] hover:bg-[#F0F4F2] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                  {/* Sort Selector */}
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-[#E4E8E5] px-3 min-h-[42px]">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#6D7873]" aria-hidden="true" />
                    <label htmlFor="sort-tasks" className="sr-only">
                      Sort tasks
                    </label>
                    <select
                      id="sort-tasks"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-transparent text-xs font-medium text-[#242B28] focus:outline-none cursor-pointer"
                    >
                      <option value="created">Newest First</option>
                      <option value="priority">Priority</option>
                      <option value="due_date">Due Date</option>
                    </select>
                  </div>

                  {/* Clear Completed Action */}
                  {completedCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearCompleted}
                      className="min-h-[42px] px-3.5 py-2 rounded-xl bg-white hover:bg-[#F4F6F4] border border-[#E4E8E5] text-xs font-medium text-[#5A6560] hover:text-[#1E2522] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Clear Completed ({completedCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Status Filter Tabs & Category Filter Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Status Segmented Control */}
                <div
                  role="tablist"
                  aria-label="Filter tasks by status"
                  className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#EDF1EE] self-start"
                >
                  {STATUS_TABS.map((tab) => {
                    const active = statusFilter === tab;
                    return (
                      <button
                        key={tab}
                        role="tab"
                        aria-selected={active}
                        type="button"
                        onClick={() => setStatusFilter(tab)}
                        className={`min-h-[34px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-white text-[#1E2522] shadow-[0_1px_3px_rgba(36,43,40,0.06)]'
                            : 'text-[#5A6560] hover:text-[#1E2522]'
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>

                {/* Category Filter Buttons */}
                <div
                  role="group"
                  aria-label="Filter tasks by category"
                  className="flex flex-wrap items-center gap-1.5"
                >
                  {CATEGORY_TABS.map((cat) => {
                    const active = categoryFilter === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        aria-pressed={active}
                        className={`min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-[#E3EDE8] text-[#22392F] border border-[#C7D8CF]'
                            : 'bg-transparent text-[#5A6560] hover:text-[#1E2522] hover:bg-[#F0F3F1] border border-transparent'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Task List / Loading / Empty State */}
            {loading ? (
              <TaskListSkeleton />
            ) : filteredAndSortedTodos.length === 0 ? (
              <EmptyTasksState
                hasFilters={hasSearchOrCategoryFilter}
                statusFilter={statusFilter}
                onResetFilters={resetFilters}
                onFocusComposer={focusComposer}
              />
            ) : (
              <ul className="space-y-3" aria-label="Task list">
                <AnimatePresence initial={false}>
                  {filteredAndSortedTodos.map((todo) => (
                    <TaskCard
                      key={todo.id}
                      todo={todo}
                      onToggle={handleToggleTodo}
                      onEdit={setEditingTodo}
                      onDelete={handleDeleteTodo}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="mt-12 border-t border-[#E8ECE9] py-6 px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1320px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#64706A]">
          <p>Stillwater — Mindful daily planning</p>
          <p className="sm:hidden truncate max-w-full">Logged in as {currentUser}</p>
        </div>
      </footer>

      {/* Slide-Over Edit Drawer */}
      <EditTaskDrawer
        todo={editingTodo}
        onClose={() => setEditingTodo(null)}
        onSave={handleSaveEdit}
        onDelete={handleDeleteTodo}
      />

      {/* Undo Toast Notification */}
      <AnimatePresence>
        {undoState && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl bg-[#242B28] text-[#FAF9F6] px-4 py-3 shadow-xl flex items-center gap-4"
          >
            <span className="text-sm leading-snug truncate">{undoState.message}</span>
            <button
              type="button"
              onClick={handleUndoDelete}
              className="inline-flex items-center gap-1.5 min-h-[34px] px-3 py-1 rounded-lg bg-[#E3EDE8] hover:bg-white text-[#1E2522] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Undo</span>
            </button>
            <button
              type="button"
              onClick={() => setUndoState(null)}
              aria-label="Dismiss notification"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#B5C0BA] hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
