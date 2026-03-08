import { LiverCalcDisclaimer } from './LiverCalcDisclaimer';
import { formatNumber } from '../lib/liverMetrics';
import type { LiverRiskResponse } from '../types/liverCalc';

type LiverCalcResultCardProps = {
  result: LiverRiskResponse | null;
  astAltRatio: number | null;
  aiSummary: string | null;
  aiLoading: boolean;
};

export function LiverCalcResultCard({
  result,
  astAltRatio,
  aiSummary,
  aiLoading,
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

  const riskBand = result.risk_band ?? 'Unavailable';
  const score =
    typeof result.rule_score === 'number' ? `${formatNumber(result.rule_score, 1)} / 100` : 'Unavailable';

  return (
    <section className="panel calc-result">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Result</p>
          <h2>Liver Risk Estimate</h2>
        </div>
      </div>

      <div className={`calc-result__badge calc-result__badge--${riskBand.toLowerCase().replace(/\s+/g, '-')}`}>
        {riskBand}
      </div>

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
