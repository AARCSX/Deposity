export interface AlertItemProps {
  title: string;
  description: string;
  type: "warning" | "error" | "info";
  tags?: string[];
  actionLabel: string;
  onAction?: () => void;
  metadata?: string;
}

export default function AlertItem({ title, description, type, tags, actionLabel, onAction, metadata }: AlertItemProps) {
  const typeIcons = {
    warning: { icon: "warning", color: "text-warning bg-warning/10", fill: "fill" },
    error: { icon: "error", color: "text-error bg-error/10", fill: "fill" },
    info: { icon: "info", color: "text-primary bg-primary/10", fill: "fill" },
  };

  const { icon, color } = typeIcons[type];

  return (
    <div className="flex items-start gap-4 p-6 hover:bg-surface-container-low/50 transition-colors cursor-pointer border-b border-outline-variant/15 last:border-b-0">
      <div className={`${color} p-2 rounded-full mt-1`}>
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-on-surface mb-1">{title}</h3>
        <p className="text-xs text-on-surface-variant mb-2">{description}</p>
        
        {tags && tags.length > 0 && (
          <div className="flex gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-surface text-on-surface-variant text-[10px] font-semibold px-2 py-1 rounded border border-outline-variant/15 uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {metadata && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-on-surface tabular-nums">{metadata}</span>
          </div>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAction?.();
        }}
        className="text-primary text-sm font-semibold hover:underline"
      >
        {actionLabel}
      </button>
    </div>
  );
}
