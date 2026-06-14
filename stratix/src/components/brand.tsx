import { cn } from "@/lib/utils";

export function StratixMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-7 w-7", className)}
      fill="none"
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="#0d1117" />
      <path
        d="M9 21.5L16 7l7 14.5M11.5 17.5h9"
        stroke="#22d3ee"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="7" r="2" fill="#22d3ee" />
    </svg>
  );
}

export function StratixLogo({
  className,
  showTagline = false,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <StratixMark />
      <div className="leading-none">
        <span className="text-[15px] font-bold tracking-[0.18em] text-foreground">
          STRATIX
        </span>
        {showTagline && (
          <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Strategic Intelligence
          </span>
        )}
      </div>
    </div>
  );
}
