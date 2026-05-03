export interface MetricCardProps {
  label: string;
  value: string;
  icon: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  subtitle?: string;
  theme?: "primary" | "warning" | "secondary" | "tertiary" | "error";
}

export default function MetricCard({ label, value, icon, trend, subtitle, theme = "primary" }: MetricCardProps) {
  const themeClasses = {
    primary: "text-primary bg-primary/10",
    warning: "text-amber-500 bg-amber-500/10", // Using amber for warning
    secondary: "text-secondary bg-secondary/10",
    tertiary: "text-tertiary bg-tertiary/10",
    error: "text-error bg-error/10",
  };

  const bubbleClasses = {
    primary: "bg-primary/5 group-hover:bg-primary/10",
    warning: "bg-amber-500/5 group-hover:bg-amber-500/10",
    secondary: "bg-secondary/5 group-hover:bg-secondary/10",
    tertiary: "bg-tertiary/5 group-hover:bg-tertiary/10",
    error: "bg-error/5 group-hover:bg-error/10",
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/15 flex flex-col justify-between h-32 relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-xl transition-colors ${bubbleClasses[theme]}`}></div>
      <div className="flex justify-between items-start relative z-10">
        <span className="text-on-surface-variant text-sm font-medium">{label}</span>
        <span className={`material-symbols-outlined p-1.5 rounded-lg text-[20px] ${themeClasses[theme]}`}>
          {icon}
        </span>
      </div>
      <div className="flex items-end justify-between relative z-10">
        <span className="text-[2.75rem] font-bold tracking-[-0.02em] leading-none text-on-surface tabular-nums">
          {value}
        </span>
        {trend ? (
          <span className={`text-sm font-semibold flex items-center px-2 py-0.5 rounded-md ${trend.isUp ? "text-tertiary bg-tertiary/10" : "text-error bg-error/10"}`}>
            <span className="material-symbols-outlined text-[16px]">
              {trend.isUp ? "arrow_upward" : "arrow_downward"}
            </span>{" "}
            {trend.value}
          </span>
        ) : (
          subtitle && <span className="text-on-surface-variant text-sm font-medium">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
