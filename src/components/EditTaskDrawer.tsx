import { useEffect, useState, FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Trash2, CheckCircle2 } from 'lucide-react';
import { Todo, TodoCategory, TodoPriority, UpdateTodoInput } from '../types/todo';

interface EditTaskDrawerProps {
  todo: Todo | null;
  onClose: () => void;
  onSave: (id: string, updates: UpdateTodoInput) => Promise<void>;
  onDelete: (todo: Todo) => Promise<void>;
}

const CATEGORIES: TodoCategory[] = ['Personal', 'Wellness', 'Study', 'Project'];
const PRIORITIES: TodoPriority[] = ['Low', 'Medium', 'High'];

export function EditTaskDrawer({ todo, onClose, onSave, onDelete }: EditTaskDrawerProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TodoCategory>('Personal');
  const [priority, setPriority] = useState<TodoPriority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setCategory(todo.category);
      setPriority(todo.priority);
      setDueDate(todo.due_date || '');
      setIsCompleted(todo.is_completed);
      setError(null);
    }
  }, [todo]);

  useEffect(() => {
    if (!todo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [todo, onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!todo) return;
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Task title cannot be empty.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(todo.id, {
        title: trimmed,
        description,
        category,
        priority,
        due_date: dueDate || null,
        is_completed: isCompleted,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!todo) return;
    await onDelete(todo);
    onClose();
  };

  return (
    <AnimatePresence>
      {todo && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-drawer-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1E2522]/25 backdrop-blur-[2px]"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-[#FAF9F6] border-l border-[#DDE4DF] shadow-2xl flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E4E8E5] bg-white">
              <h2 id="edit-drawer-title" className="font-display text-xl font-medium text-[#1E2522]">
                Edit Task
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close edit drawer"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#5A6560] hover:text-[#1E2522] hover:bg-[#EFF3F0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7EB8] cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label htmlFor="edit-title" className="block text-xs font-semibold text-[#4E5A55] mb-1.5">
                  Title
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl bg-white border border-[#DCE2DE] px-3.5 py-2.5 text-[15px] text-[#1E2522] focus:outline-none focus:border-[#8B7EB8] focus:ring-2 focus:ring-[#8B7EB8]/20"
                />
              </div>

              <div>
                <label htmlFor="edit-description" className="block text-xs font-semibold text-[#4E5A55] mb-1.5">
                  Notes
                </label>
                <textarea
                  id="edit-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional details or intention..."
                  className="w-full rounded-xl bg-white border border-[#DCE2DE] px-3.5 py-2.5 text-sm text-[#242B28] placeholder:text-[#86918C] focus:outline-none focus:border-[#8B7EB8] focus:ring-2 focus:ring-[#8B7EB8]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-category" className="block text-xs font-semibold text-[#4E5A55] mb-1.5">
                    Category
                  </label>
                  <select
                    id="edit-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TodoCategory)}
                    className="w-full min-h-[44px] rounded-xl bg-white border border-[#DCE2DE] px-3 py-2 text-sm text-[#1E2522] focus:outline-none focus:border-[#8B7EB8] cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-priority" className="block text-xs font-semibold text-[#4E5A55] mb-1.5">
                    Priority
                  </label>
                  <select
                    id="edit-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TodoPriority)}
                    className="w-full min-h-[44px] rounded-xl bg-white border border-[#DCE2DE] px-3 py-2 text-sm text-[#1E2522] focus:outline-none focus:border-[#8B7EB8] cursor-pointer"
                  >
                    {PRIORITIES.map((prio) => (
                      <option key={prio} value={prio}>
                        {prio}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="edit-due-date" className="block text-xs font-semibold text-[#4E5A55] mb-1.5">
                  Due Date
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="edit-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="flex-1 min-h-[44px] rounded-xl bg-white border border-[#DCE2DE] px-3.5 py-2 text-sm text-[#1E2522] tabular-nums focus:outline-none focus:border-[#8B7EB8]"
                  />
                  {dueDate && (
                    <button
                      type="button"
                      onClick={() => setDueDate('')}
                      className="min-h-[44px] px-3 rounded-xl text-xs font-medium text-[#5A6560] hover:text-[#1E2522] hover:bg-[#EFF3F0] transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsCompleted((prev) => !prev)}
                  className={`w-full min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                    isCompleted
                      ? 'bg-[#E3EDE8] border-[#C1D3C8] text-[#283E35]'
                      : 'bg-white border-[#DCE2DE] text-[#4E5A55] hover:bg-[#F4F6F4]'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    <span>{isCompleted ? 'Completed' : 'Mark as completed'}</span>
                  </span>
                  <span className="text-xs opacity-80">{isCompleted ? 'Done' : 'Active'}</span>
                </button>
              </div>

              {error && (
                <p className="text-xs text-[#9A4B42]" role="alert">
                  {error}
                </p>
              )}

              {/* Footer Actions inside Form */}
              <div className="pt-4 border-t border-[#E4E8E5] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-[#9A4B42] hover:bg-[#F9ECEA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7EB8] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  <span>Delete</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-[#5A6560] hover:text-[#1E2522] hover:bg-[#EFF3F0] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-[#344E44] hover:bg-[#283E35] disabled:opacity-60 text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7EB8] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
