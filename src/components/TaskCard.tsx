import { motion } from 'motion/react';
import { Check, Pencil, Trash2, Calendar, Flag } from 'lucide-react';
import { Todo } from '../types/todo';
import { formatDueDateLabel } from '../data/quotes';

interface TaskCardProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

const PRIORITY_STYLES: Record<Todo['priority'], { text: string; label: string }> = {
  High: { text: 'text-[#9A4B42]', label: 'High priority' },
  Medium: { text: 'text-[#6D5F98]', label: 'Medium priority' },
  Low: { text: 'text-[#5A6560]', label: 'Low priority' },
};

export function TaskCard({ todo, onToggle, onEdit, onDelete }: TaskCardProps) {
  const dueInfo = formatDueDateLabel(todo.due_date);
  const prioStyle = PRIORITY_STYLES[todo.priority];

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={`group rounded-[18px] border px-4 py-3.5 sm:px-5 sm:py-4 transition-colors ${
        todo.is_completed
          ? 'bg-[#F5F7F5]/75 border-[#E6EAE7]'
          : 'bg-white border-[#E4E8E5] hover:border-[#C5D3CC] shadow-[0_1px_6px_rgba(36,43,40,0.02)]'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* 44x44 accessible touch-target checkbox */}
        <button
          type="button"
          onClick={() => onToggle(todo)}
          aria-label={todo.is_completed ? `Mark "${todo.title}" as active` : `Mark "${todo.title}" as completed`}
          aria-pressed={todo.is_completed}
          className="relative -ml-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7EB8] cursor-pointer"
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-150 ${
              todo.is_completed
                ? 'border-[#4E7465] bg-[#4E7465] text-white scale-100'
                : 'border-[#B8C4BE] bg-white group-hover:border-[#6A8C7D]'
            }`}
          >
            {todo.is_completed && (
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.14 }}
              >
                <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
              </motion.span>
            )}
          </span>
        </button>

        {/* Task Body & Unboxed Typographic Metadata */}
        <div className="min-w-0 flex-1 pt-0.5">
          <button
            type="button"
            onClick={() => onEdit(todo)}
            className="text-left w-full focus-visible:outline-none focus-visible:underline cursor-pointer"
          >
            <h3
              className={`text-[15px] sm:text-base font-medium leading-snug transition-colors ${
                todo.is_completed
                  ? 'line-through text-[#7E8984]'
                  : 'text-[#1E2522]'
              }`}
            >
              {todo.title}
            </h3>
          </button>

          {todo.description && (
            <p
              className={`mt-1 text-sm leading-relaxed line-clamp-2 ${
                todo.is_completed ? 'text-[#929C97]' : 'text-[#5A6560]'
              }`}
            >
              {todo.description}
            </p>
          )}

          {/* Clean unboxed inline metadata with · separators (Zero-Pill Discipline) */}
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#64706A]">
            <span className="font-medium text-[#4A6258]">{todo.category}</span>
            <span aria-hidden="true">·</span>
            <span className={`inline-flex items-center gap-1 font-medium ${prioStyle.text}`}>
              <Flag className="w-3 h-3" aria-hidden="true" />
              <span>{prioStyle.label}</span>
            </span>
            {dueInfo && (
              <>
                <span aria-hidden="true">·</span>
                <span
                  className={`inline-flex items-center gap-1 tabular-nums ${
                    dueInfo.isOverdue && !todo.is_completed
                      ? 'text-[#9A4B42] font-medium'
                      : dueInfo.isToday && !todo.is_completed
                        ? 'text-[#4A6258] font-medium'
                        : 'text-[#64706A]'
                  }`}
                >
                  <Calendar className="w-3 h-3" aria-hidden="true" />
                  <span>
                    {dueInfo.isOverdue && !todo.is_completed ? `Overdue (${dueInfo.label})` : dueInfo.label}
                  </span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0 -mr-1.5">
          <button
            type="button"
            onClick={() => onEdit(todo)}
            aria-label={`Edit "${todo.title}"`}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#6D7873] hover:text-[#1E2522] hover:bg-[#EFF3F0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7EB8] cursor-pointer"
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(todo)}
            aria-label={`Delete "${todo.title}"`}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#6D7873] hover:text-[#9A4B42] hover:bg-[#F9ECEA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7EB8] cursor-pointer"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.li>
  );
}
