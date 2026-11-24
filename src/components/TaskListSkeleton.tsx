export function TaskListSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading tasks" aria-busy="true">
      {[0, 1, 2, 3].map((idx) => (
        <div
          key={idx}
          className="rounded-[18px] bg-white border border-[#E4E8E5] px-4 py-4 sm:px-5 animate-pulse"
        >
          <div className="flex items-start gap-3.5">
            <div className="h-5 w-5 rounded-full bg-[#E6ECE8] mt-1 shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-4 w-3/4 rounded-md bg-[#E9EEEC]" />
              <div className="h-3 w-1/2 rounded-md bg-[#F0F4F2]" />
              <div className="h-3 w-1/3 rounded-md bg-[#F0F4F2]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
