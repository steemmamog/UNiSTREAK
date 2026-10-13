type LogoProps = { size?: "md" | "lg" };

export function Logo({ size = "md" }: LogoProps) {
  const large = size === "lg";

  return (
    <div className="flex flex-col items-center gap-3" aria-label="UNiSTREAK">
      <svg
        viewBox="0 0 100 100"
        className={`text-snow ${large ? "h-24 w-24" : "h-[72px] w-[72px]"}`}
        aria-hidden="true"
      >
        <path
          d="M22 20v38a17 17 0 0 0 34 0V44a15 15 0 0 1 30 0v34"
          fill="none"
          stroke="currentColor"
          strokeWidth="16"
        />
        <polygon points="66,16 96,0 96,30" className="fill-volt" />
      </svg>
      <span
        className={`font-extrabold tracking-tight ${large ? "text-[34px]" : "text-[28px]"}`}
      >
        UNi<span className="text-volt">STREAK</span>
      </span>
    </div>
  );
}