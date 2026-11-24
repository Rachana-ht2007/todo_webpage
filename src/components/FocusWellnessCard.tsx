import { useEffect, useState } from 'react';
import { RefreshCw, Leaf } from 'lucide-react';
import {
  formatFriendlyDate,
  getLiveGreeting,
  MINDFULNESS_QUOTES,
} from '../data/quotes';

interface FocusWellnessCardProps {
  totalCount: number;
  completedCount: number;
  highPriorityActiveCount: number;
}

const HERO_IMAGE_PATH = '/src/assets/images/hero_sunlit_eucalyptus_1795501565969.jpg';

export function FocusWellnessCard({
  totalCount,
  completedCount,
  highPriorityActiveCount,
}: FocusWellnessCardProps) {
  const [now, setNow] = useState<Date>(() => new Date());
  const [quoteIndex, setQuoteIndex] = useState<number>(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return dayOfYear % MINDFULNESS_QUOTES.length;
  });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const completionPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const activeCount = totalCount - completedCount;

  // SVG Ring Math
  const size = 92;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPct / 100) * circumference;

  const quote = MINDFULNESS_QUOTES[quoteIndex];
  const greeting = getLiveGreeting(now);
  const friendlyDate = formatFriendlyDate(now);

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MINDFULNESS_QUOTES.length);
  };

  return (
    <section
      aria-label="Daily focus and wellness overview"
      className="relative overflow-hidden rounded-[24px] border border-[#DDE4DF] bg-gradient-to-br from-[#FAF9F6] via-[#E8F1F5] to-[#E3EDE8] shadow-[0_8px_30px_rgba(36,43,40,0.05)] lg:min-h-[620px] flex flex-col justify-between"
    >
      {/* Subtle low-opacity sunlit eucalyptus & calm water backdrop with fade-in */}
      {!imgFailed ? (
        <img
          src={HERO_IMAGE_PATH}
          alt="Sunlit pale sage eucalyptus leaves over calm morning water ripples"
          referrerPolicy="no-referrer"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover object-center pointer-events-none select-none transition-opacity duration-700 ease-out ${
            imgLoaded ? 'opacity-35' : 'opacity-0'
          }`}
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-[#E8F1F5] via-[#FAF9F6] to-[#E3EDE8] flex items-end justify-end p-8 opacity-70"
        >
          <Leaf className="w-28 h-28 text-[#9BB5A8]/40" />
        </div>
      )}

      {/* Smooth warm off-white & sage gradient overlay for crisp serif legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6]/85 via-[#FAF9F6]/60 to-[#E3EDE8]/82"
      />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col justify-between gap-6 p-6 sm:p-8 h-full">
        {/* Top: Date & Live Greeting */}
        <div className="space-y-2">
          <p className="text-[13px] font-medium tracking-wide text-[#4E5A55]">
            {friendlyDate}
          </p>
          <h1 className="font-display text-3xl sm:text-[38px] leading-[1.15] font-medium tracking-tight text-[#1E2522] [text-wrap:balance]">
            {greeting}. Breathe into today&rsquo;s rhythm.
          </h1>
        </div>

        {/* Middle: Glassmorphic Mindfulness Quote */}
        <div className="rounded-2xl bg-white/65 backdrop-blur-md border border-white/75 p-5 shadow-[0_2px_12px_rgba(36,43,40,0.03)]">
          <blockquote className="text-[15px] leading-relaxed text-[#242B28] font-normal">
            &ldquo;{quote.text}&rdquo;
          </blockquote>
          <div className="mt-3 flex items-center justify-between gap-4">
            <cite className="not-italic text-xs font-medium text-[#5A6560]">
              {quote.author}
            </cite>
            <button
              type="button"
              onClick={handleNextQuote}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4A6258] hover:text-[#1E2522] py-1.5 px-2.5 rounded-lg hover:bg-white/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7EB8] whitespace-nowrap shrink-0"
              aria-label="Show another mindfulness quote"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Another reflection</span>
            </button>
          </div>
        </div>

        {/* Bottom: Circular Progress Ring + Summary */}
        <div className="rounded-2xl bg-white/78 backdrop-blur-md border border-white/80 p-5 shadow-[0_2px_12px_rgba(36,43,40,0.04)]">
          <div className="flex items-center gap-5">
            {/* Circular Progress Ring */}
            <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="-rotate-90"
                role="img"
                aria-label={`${completionPct}% of tasks completed`}
              >
                <defs>
                  <linearGradient id="stillwaterRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5D8273" />
                    <stop offset="100%" stopColor="#8B7EB8" />
                  </linearGradient>
                </defs>
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#DDE5E0"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="url(#stillwaterRingGrad)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 450ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                />
              </svg>
              <span className="absolute text-lg font-semibold text-[#1E2522] tabular-nums">
                {completionPct}%
              </span>
            </div>

            {/* Unboxed Summary Metrics */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <h2 className="font-display text-lg font-medium text-[#1E2522]">
                Daily completion
              </h2>
              <p className="text-sm text-[#4E5A55] tabular-nums">
                {totalCount === 0
                  ? 'Your slate is open and peaceful.'
                  : `${completedCount} of ${totalCount} ${totalCount === 1 ? 'task' : 'tasks'} completed`}
              </p>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#5A6560] tabular-nums pt-0.5">
                <span>{activeCount} remaining</span>
                <span aria-hidden="true">·</span>
                <span>{highPriorityActiveCount} high priority</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
