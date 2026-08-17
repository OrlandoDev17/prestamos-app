import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClassName?: string;
  prefix?: string;
  bgColor?: string;
  className?: string;
}

export function KPICard({
  label,
  value,
  icon: Icon,
  iconClassName = "",
  prefix,
  bgColor = "bg-surface",
  className = "",
}: KPICardProps) {
  return (
    <article
      className={`flex flex-col gap-3 p-4 shadow-xs rounded-xl ${bgColor} ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm opacity-65 font-medium">{label}</span>
        <Icon className={`size-7 p-1.5 rounded-full ${iconClassName}`} />
      </div>
      <span className="text-2xl font-bold tabular-nums">
        {prefix}
        {value}
      </span>
    </article>
  );
}
