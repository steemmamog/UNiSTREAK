type IconProps = { className?: string };

const common = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function UserIcon({ className = "h-full w-full" }: IconProps) {
  return (
    <svg {...common} className={className}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M4.5 20c.5-4 3-6 7.5-6s7 2 7.5 6z" />
    </svg>
  );
}

export function MailIcon({ className = "h-full w-full" }: IconProps) {
  return (
    <svg {...common} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function LockIcon({ className = "h-full w-full" }: IconProps) {
  return (
    <svg {...common} className={className}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M7.5 10V7a4.5 4.5 0 0 1 9 0v3" />
      <circle cx="12" cy="15.5" r="1" />
    </svg>
  );
}

export function EyeIcon({ className = "h-full w-full" }: IconProps) {
  return (
    <svg {...common} className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon({ className = "h-full w-full" }: IconProps) {
  return (
    <svg {...common} className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M4 4l16 16" />
    </svg>
  );
}