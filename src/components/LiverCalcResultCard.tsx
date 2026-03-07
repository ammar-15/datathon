import { LiverCalcDisclaimer } from './LiverCalcDisclaimer';
import { formatNumber } from '../lib/liverMetrics';
import type { LiverRiskResponse } from '../types/liverCalc';

type LiverCalcResultCardProps = {
  result: LiverRiskResponse | null;
  astAltRatio: number | null;
};

export function LiverCalcResultCard({ result, astAltRatio }: LiverCalcResultCardProps) {
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
  const score = typeof result.score === 'number' ? `${formatNumber(result.score, 1)} / 100` : 'Unavailable';

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

      {result.ai_summary ? (
        <div className="calc-result__block">
          <h3>AI Summary</h3>
          <p>{result.ai_summary}</p>
        </div>
      ) : null}

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
