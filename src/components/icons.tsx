// Status icons for Alerts: status colour always comes with an icon (design.md Colour rules).
// Outlined, 24px frame with a 20px glyph, like the system's Material Symbols.
function StatusIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`size-5 shrink-0 ${className ?? ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      {children}
    </svg>
  );
}

export const InfoIcon = ({ className }: { className?: string }) => (
  <StatusIcon className={className}>
    <path d="M12 11v5M12 8h.01" />
  </StatusIcon>
);

export const ErrorIcon = ({ className }: { className?: string }) => (
  <StatusIcon className={className}>
    <path d="M12 7v6M12 16.5h.01" />
  </StatusIcon>
);

// Theme toggle glyphs, same 24px outlined style.
export const SunIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`size-5 shrink-0 ${className ?? ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

export const MoonIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`size-5 shrink-0 ${className ?? ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
  </svg>
);
