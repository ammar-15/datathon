type LiverCalcDisclaimerProps = {
  compact?: boolean;
};

export function LiverCalcDisclaimer({ compact = false }: LiverCalcDisclaimerProps) {
  return (
    <p
      className={[
        'text-sm leading-6 text-[var(--text-muted)]',
        compact ? 'border-t border-[var(--border-subtle)] pt-4' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      This tool is educational only and does not diagnose liver disease.
    </p>
  );
}
