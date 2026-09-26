// Loupe stylisée, utilisée dans l'en-tête.
export default function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#1d4ed8" />
      <circle cx="14" cy="14" r="6.5" fill="none" stroke="#fff" strokeWidth="2.5" />
      <path d="M19 19l5.5 5.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M11 14.2l2 2 3.6-3.8" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
