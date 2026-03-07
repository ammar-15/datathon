type LiverCalcDisclaimerProps = {
  compact?: boolean;
};

export function LiverCalcDisclaimer({ compact = false }: LiverCalcDisclaimerProps) {
  return (
    <p className={`calc-disclaimer ${compact ? 'calc-disclaimer--compact' : ''}`}>
      This tool is educational only and does not diagnose liver disease.
    </p>
  );
}
