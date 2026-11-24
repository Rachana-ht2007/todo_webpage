import { useState, FormEvent, RefObject } from 'react';
import { Plus, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { CreateTodoInput, TodoCategory, TodoPriority } from '../types/todo';

interface TaskComposerProps {
  onAddTask: (input: CreateTodoInput) => Promise<void>;
  inputRef?: RefObject<HTMLInputElement | null>;
}

const CATEGORIES: TodoCategory[] = ['Personal', 'Wellness', 'Study', 'Project'];
const PRIORITIES: TodoPriority[] = ['Low', 'Medium', 'High'];

export function TaskComposer({ onAddTask, inputRef }: TaskComposerProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TodoCategory>('Personal');
  const [priority, setPriority] = useState<TodoPriority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setValidationError('Please write a brief task title.');
      return;
    }

    setValidationError(null);
    setSubmitting(true);
    try {
      await onAddTask({
        title: trimmed,
        description,
        category,
        priority,
        due_date: dueDate || null,
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setShowNotes(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[20px] bg-white border border-[#E4E8E5] p-4 sm:p-5 shadow-[0_2px_14px_rgba(36,43,40,0.03)] transition-colors focus-within:border-[#B8C9C0]"
      aria-label="Add a new task"
    >
      {/* Top Row: Title input & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <label htmlFor="new-task-title" className="sr-only">
            Task title
          </label>
          <input
            ref={inputRef}
            id="new-task-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="What deserves your gentle attention today?"
            className="w-full min-h-[44px] bg-transparent text-[15px] sm:text-base text-[#1E2522] placeholder:text-[#86918C] focus:outline-none"
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#344E44] hover:bg-[#283E35] disabled:opacity-60 text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7EB8] focus-visible:ring-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>{submitting ? 'Saving...' : 'Add Task'}</span>
        </button>
      </div>

      {validationError && (
        <p className="mt-1.5 text-xs text-[#B45349]" role="alert">
          {validationError}
        </p>
      )}

      {/* Optional description field */}
      {showNotes && (
        <div className="mt-3 pt-3 border-t border-[#EFF2F0]">
          <label htmlFor="new-task-description" className="sr-only">
            Task notes
          </label>
          <textarea
            id="new-task-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add quiet context or supporting steps (optional)..."
            className="w-full resize-none bg-[#FAF9F6] border border-[#E4E8E5] rounded-xl px-3.5 py-2.5 text-sm text-[#242B28] placeholder:text-[#86918C] focus:outline-none focus:border-[#9B8EC4]"
            disabled={submitting}
          />
        </div>
      )}

      {/* Bottom Metadata Selectors Row */}
      <div className="mt-3 pt-3 border-t border-[#EFF2F0] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Select */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="new-task-category" className="text-xs font-medium text-[#64706A]">
              Category
            </label>
            <select
              id="new-task-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TodoCategory)}
              className="min-h-[36px] rounded-lg bg-[#F4F6F4] hover:bg-[#EBF0EC] border border-[#E2E7E4] px-2.5 py-1 text-xs font-medium text-[#242B28] focus:outline-none focus:ring-2 focus:ring-[#8B7EB8] cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Select */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="new-task-priority" className="text-xs font-medium text-[#64706A]">
              Priority
            </label>
            <select
              id="new-task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TodoPriority)}
              className="min-h-[36px] rounded-lg bg-[#F4F6F4] hover:bg-[#EBF0EC] border border-[#E2E7E4] px-2.5 py-1 text-xs font-medium text-[#242B28] focus:outline-none focus:ring-2 focus:ring-[#8B7EB8] cursor-pointer"
            >
              {PRIORITIES.map((prio) => (
                <option key={prio} value={prio}>
                  {prio}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date Picker */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="new-task-due-date" className="text-xs font-medium text-[#64706A]">
              Due
            </label>
            <input
              id="new-task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="min-h-[36px] rounded-lg bg-[#F4F6F4] hover:bg-[#EBF0EC] border border-[#E2E7E4] px-2.5 py-1 text-xs font-medium text-[#242B28] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#8B7EB8] cursor-pointer"
            />
          </div>
        </div>

        {/* Toggle Notes Button */}
        <button
          type="button"
          onClick={() => setShowNotes((prev) => !prev)}
          className="inline-flex items-center gap-1.5 min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-medium text-[#5A6560] hover:text-[#1E2522] hover:bg-[#F4F6F4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7EB8] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{showNotes ? 'Hide note' : 'Add note'}</span>
          {showNotes ? (
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>
      </div>
    </form>
  );
}
