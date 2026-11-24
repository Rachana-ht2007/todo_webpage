import { useState } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { StatusFilter } from '../types/todo';

interface EmptyTasksStateProps {
  hasFilters: boolean;
  statusFilter: StatusFilter;
  onResetFilters: () => void;
  onFocusComposer: () => void;
}

const EMPTY_IMAGE_PATH = '/src/assets/images/empty_still_water_photo_1795501568523.jpg';

export function EmptyTasksState({
  hasFilters,
  statusFilter,
  onResetFilters,
  onFocusComposer,
}: EmptyTasksStateProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const headingText = hasFilters
    ? 'No tasks match this filter'
    : statusFilter === 'Completed'
      ? 'No completed tasks yet'
      : 'Your space is clear.';

  const bodyText = hasFilters
    ? 'Try clearing your search or switching category filters to reveal your other tasks.'
    : statusFilter === 'Completed'
      ? 'Your finished intentions will rest gently here once checked off.'
      : "Add a gentle intention when you're ready.";

  return (
    <div className="rounded-[24px] bg-white border border-[#E4E8E5] px-6 py-10 sm:py-12 text-center shadow-[0_2px_12px_rgba(36,43,40,0.02)]">
      <div className="mx-auto max-w-[280px] mb-6 overflow-hidden rounded-2xl bg-[#E8F1F5]/50 border border-[#E6ECE9] shadow-[0_10px_28px_rgba(36,43,40,0.08)]">
        {!imgFailed ? (
          <img
            src={EMPTY_IMAGE_PATH}
            alt="Calm morning water ripples with a smooth river stone and floating leaf"
            referrerPolicy="no-referrer"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgFailed(true)}
            className={`w-full aspect-[4/3] object-cover object-center transition-opacity duration-700 ease-out ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full aspect-[4/3] flex flex-col items-center justify-center bg-gradient-to-br from-[#E8F1F5] via-[#FAF9F6] to-[#E3EDE8] p-6">
            <Sparkles className="w-10 h-10 text-[#6A8C7D] mb-2" aria-hidden="true" />
            <span className="text-xs font-medium text-[#5A6560]">Stillness</span>
          </div>
        )}
      </div>

      <h3 className="font-display text-xl sm:text-2xl font-medium text-[#1E2522] [text-wrap:balance]">
        {headingText}
      </h3>

      <p className="mt-2 mx-auto max-w-sm text-sm leading-relaxed text-[#5A6560]">
        {bodyText}
      </p>

      <div className="mt-6 flex justify-center">
        {hasFilters ? (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2 rounded-xl bg-[#E3EDE8] hover:bg-[#D5E3DC] text-[#24372F] text-sm font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Reset Filters</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onFocusComposer}
            className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2 rounded-xl bg-[#344E44] hover:bg-[#283E35] text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <span>Add a Task</span>
          </button>
        )}
      </div>
    </div>
  );
}
