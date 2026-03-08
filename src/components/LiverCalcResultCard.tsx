import { LiverCalcDisclaimer } from './LiverCalcDisclaimer';
import { formatNumber } from '../lib/liverMetrics';
import type { LiverRiskResponse } from '../types/liverCalc';

type LiverCalcResultCardProps = {
  result: LiverRiskResponse | null;
  astAltRatio: number | null;
  aiSummary: string | null;
  aiLoading: boolean;
  /** GGT value from the submitted form — used to apply critical overrides client-side */
  ggt?: number | null;
  /** Optional override returned by the edge function (e.g. "CRITICAL" or "HIGH") */
  riskBandOverride?: string | null;
};

const GGT_CRITICAL_THRESHOLD = 400;
const GGT_HIGH_THRESHOLD = 150;

function resolveDisplayBand(
  resultBand: string,
  riskBandOverride: string | null | undefined,
  ggt: number | null | undefined,
): string {
  // Edge function override takes first priority
  if (riskBandOverride) return riskBandOverride;
  // Client-side fallback in case edge function hasn't returned yet
  if (ggt != null) {
    if (ggt >= GGT_CRITICAL_THRESHOLD) return "CRITICAL";
    if (ggt >= GGT_HIGH_THRESHOLD && resultBand.toLowerCase() === "low") return "HIGH";
  }
  return resultBand;
}

export function LiverCalcResultCard({
  result,
  astAltRatio,
  aiSummary,
  aiLoading,
  ggt,
  riskBandOverride,
}: LiverCalcResultCardProps) {
  if (!result) {
    return (
      <section className="panel calc-result calc-result--placeholder">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">Result</p>
            <h2>Risk Estimate</h2>
          </div>
        </div>
        <p className="calc-result__placeholder">
          Submit the form to view a risk band, score, AST:ALT ratio, and summary response.
        </p>
      </section>
    );
  }

  const rawBand = result.risk_band ?? 'Unavailable';
  const displayBand = resolveDisplayBand(rawBand, riskBandOverride, ggt);
  const isCritical = displayBand.toUpperCase() === 'CRITICAL';
  const isHigh = displayBand.toUpperCase() === 'HIGH';

  const score =
    result.rule_score != null && typeof result.rule_score === 'number'
      ? `${formatNumber(result.rule_score, 1)} / 100`
      : 'Unavailable';

  return (
    <section className="panel calc-result">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Result</p>
          <h2>Liver Risk Estimate</h2>
        </div>
      </div>

      <div
        className={`calc-result__badge calc-result__badge--${displayBand.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {displayBand}
      </div>

      {/* Urgent alert banner for critical or high-override cases */}
      {isCritical && (
        <div className="calc-result__alert calc-result__alert--critical" role="alert">
          <strong>⚠ Consult a doctor promptly.</strong> Your GGT is critically elevated
          {ggt != null ? ` (${ggt} vs normal up to 85)` : ''} and may indicate a serious
          liver condition beyond alcohol use. Please seek medical evaluation soon — do not wait
          for routine follow-up.
        </div>
      )}

      {isHigh && !isCritical && (
        <div className="calc-result__alert calc-result__alert--high" role="alert">
          <strong>Your GGT is significantly elevated.</strong> Even if other markers appear
          normal, this level warrants prompt discussion with a doctor.
        </div>
      )}

      <dl className="calc-result__grid">
        <div>
          <dt>Score</dt>
          <dd>{score}</dd>
        </div>
        <div>
          <dt>AST:ALT Ratio</dt>
          <dd>
            {astAltRatio === null ? 'Unavailable' : formatNumber(astAltRatio, 2)}
          </dd>
        </div>
      </dl>

      {result.explanation ? (
        <div className="calc-result__block">
          <h3>Explanation</h3>
          <p>{result.explanation}</p>
        </div>
      ) : null}

      {aiLoading && (
        <div className="calc-result__block">
          <h3>AI Summary</h3>
          <p className="calc-result__loading">Generating clinical summary…</p>
        </div>
      )}

      {!aiLoading && aiSummary && (
        <div className="calc-result__block">
          <h3>AI Summary</h3>
          <p>{aiSummary}</p>
        </div>
      )}

      {result.rejected_reason ? (
        <div className="calc-result__block calc-result__block--warning">
          <h3>Rejected Reason</h3>
          <p>{result.rejected_reason}</p>
        </div>
      ) : null}

      <LiverCalcDisclaimer compact />
    </section>
  );
}