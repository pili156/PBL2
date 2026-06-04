import { getStatusBadgeClass, getStatusLabel, getStatusTooltip, type StatusDomain } from "@/src/lib/status-utils";

type BadgeSize = 'sm' | 'md' | 'lg' | 'xl';

interface StatusBadgeProps {
  status: string | null | undefined;
  domain?: StatusDomain;
  size?: BadgeSize;
  dot?: boolean;
  tooltip?: string;
  uppercase?: boolean;
  className?: string;
}

const SIZE_MAP: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
  xl: 'px-5 py-4 text-base',
};

const RADIUS = 'rounded-md';

function StatusBadgeInner({ status, domain, size = 'md', dot, uppercase, className }: StatusBadgeProps) {
  const label = getStatusLabel(status, domain) || '-';
  const badgeClass = getStatusBadgeClass(status, domain);
  const sizeClass = SIZE_MAP[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold ${RADIUS} ${sizeClass} ${badgeClass} ${className || ''}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />}
      <span>{uppercase ? label.toUpperCase() : label}</span>
    </span>
  );
}

export default function StatusBadge(props: StatusBadgeProps) {
  const tooltipText = props.tooltip ?? getStatusTooltip(props.status, props.domain);

  if (!tooltipText) {
    return <StatusBadgeInner {...props} />;
  }

  return (
    <span className="group relative inline-flex">
      <StatusBadgeInner {...props} />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-slate-800 text-white text-[11px] leading-tight px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap max-w-[220px] text-center">
          {tooltipText}
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
      </div>
    </span>
  );
}
