import { cn } from '@/lib/utils';

interface CircularProgressGaugeProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
  suffix?: string;
  color?: 'emerald' | 'blue' | 'amber' | 'purple';
  icon?: React.ReactNode;
}

const COLOR_MAP = {
  emerald: {
    stroke: 'stroke-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    gradient: 'url(#emerald-gradient)',
  },
  blue: {
    stroke: 'stroke-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    gradient: 'url(#blue-gradient)',
  },
  amber: {
    stroke: 'stroke-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    gradient: 'url(#amber-gradient)',
  },
  purple: {
    stroke: 'stroke-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    gradient: 'url(#purple-gradient)',
  },
};

export function CircularProgressGauge({
  value,
  maxValue = 100,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  suffix = '%',
  color = 'emerald',
  icon,
}: CircularProgressGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / maxValue) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colors = COLOR_MAP[color];

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Gradients */}
        <svg width={0} height={0} className="absolute">
          <defs>
            <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(152, 76%, 45%)" />
              <stop offset="100%" stopColor="hsl(152, 76%, 35%)" />
            </linearGradient>
            <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(217, 91%, 60%)" />
              <stop offset="100%" stopColor="hsl(217, 91%, 50%)" />
            </linearGradient>
            <linearGradient id="amber-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(45, 93%, 47%)" />
              <stop offset="100%" stopColor="hsl(45, 93%, 37%)" />
            </linearGradient>
            <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(263, 70%, 50%)" />
              <stop offset="100%" stopColor="hsl(263, 70%, 40%)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Background Circle */}
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.gradient}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon && (
            <div className={cn('mb-1', colors.text)}>
              {icon}
            </div>
          )}
          <span className={cn('text-2xl font-bold tabular-nums', colors.text)}>
            {typeof value === 'number' && value >= 1000 
              ? `${(value / 1000).toFixed(0)}K` 
              : value}
            {suffix && <span className="text-sm font-medium">{suffix}</span>}
          </span>
        </div>
      </div>

      {/* Labels */}
      <div className="mt-3 text-center">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {sublabel && (
          <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
