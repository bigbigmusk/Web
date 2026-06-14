import { cn } from "@/lib/utils";
import { scoreTone } from "@/lib/utils";

const toneColor: Record<string, string> = {
  high: "#0ea5b7",
  medium: "#d97706",
  low: "#dc2626",
};

export function ScoreGauge({
  score,
  size = 120,
  label,
  className,
}: {
  score: number;
  size?: number;
  label?: string;
  className?: string;
}) {
  const tone = scoreTone(score);
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={toneColor[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold tabular-nums tracking-tight">
          {score}
        </span>
        {label && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
