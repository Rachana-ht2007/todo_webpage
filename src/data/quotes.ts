export interface MindfulnessQuote {
  text: string;
  author: string;
}

export const MINDFULNESS_QUOTES: MindfulnessQuote[] = [
  {
    text: 'Do not hurry; do not rest. Move through what matters with quiet steadiness.',
    author: 'Goethe',
  },
  {
    text: 'Nature does not hurry, yet everything is accomplished.',
    author: 'Lao Tzu',
  },
  {
    text: 'Calm mind brings inner strength and self-confidence, so that is very important for good health.',
    author: 'Dalai Lama',
  },
  {
    text: 'In the midst of movement and chaos, keep stillness inside of you.',
    author: 'Deepak Chopra',
  },
  {
    text: 'Simplicity is about subtracting the obvious and adding the meaningful.',
    author: 'John Maeda',
  },
  {
    text: 'One mindful step at a time turns an overwhelming day into a peaceful rhythm.',
    author: 'Thich Nhat Hanh',
  },
];

export function getLiveGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatFriendlyDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDueDateLabel(dueDate: string | null): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
} | null {
  if (!dueDate) return null;
  const parts = dueDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;

  const target = new Date(parts[0], parts[1] - 1, parts[2]);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: 'Today', isOverdue: false, isToday: true };
  if (diffDays === 1) return { label: 'Tomorrow', isOverdue: false, isToday: false };
  if (diffDays === -1) return { label: 'Yesterday', isOverdue: true, isToday: false };

  const formatted = target.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return {
    label: formatted,
    isOverdue: diffDays < 0,
    isToday: false,
  };
}
