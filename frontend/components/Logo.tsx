export default function Logo({
  size = 28,
  wordmark = true,
  className = "",
}: {
  size?: number;
  wordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="flex shrink-0 items-center justify-center rounded-[7px] bg-ink"
        style={{ width: size, height: size }}
      >
        <svg
          width={Math.round(size * 0.72)}
          height={Math.round(size * 0.72)}
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
        >
          <rect x="15" y="17" width="14" height="14" rx="3.5" fill="#1e5b3e" />
          <path
            d="M18.5 24l2.6 2.6 5.2-5.2"
            stroke="#faf8f4"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="35" y="20" width="15" height="4.5" rx="2.25" fill="#faf8f4" opacity="0.92" />
          <rect x="15" y="37" width="30" height="4.5" rx="2.25" fill="#faf8f4" opacity="0.5" />
          <rect x="15" y="46" width="21" height="4.5" rx="2.25" fill="#faf8f4" opacity="0.5" />
        </svg>
      </span>
      {wordmark && (
        <span className="font-display text-lg font-semibold leading-none tracking-tight text-ink">
          TaskFlow
        </span>
      )}
    </span>
  );
}
