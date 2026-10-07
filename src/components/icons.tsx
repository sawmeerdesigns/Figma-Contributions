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
