import type { ReactNode } from 'react';
import { LiverCalcDisclaimer } from './LiverCalcDisclaimer';
import { formatNumber } from '../lib/liverMetrics';
import { cn, panelInner, panelShell, sectionKicker } from '../lib/ui';
import type { LiverRiskResponse } from '../types/liverCalc';

type LiverCalcResultCardProps = {
  result: LiverRiskResponse | null;
  astAltRatio: number | null;
  aiSummary: string | null;
  aiLoading: boolean;
  ggt?: number | null;
  riskBandOverride?: string | null;
  drinksPerDay?: number | null;
};

const NL_RESOURCES = [
  {
    name: 'Provincial Mental Health & Addictions Navigator',
    url: 'https://www.gov.nl.ca/hcs/mentalhealth-committee/mentalhealth/',
  },
  { name: 'Bridge The Gap', url: 'https://nl.bridgethegapp.ca' },
  { name: 'LifeWise NL', url: 'https://lifewisenl.ca' },
  { name: 'Breaking Free Recovery Support', url: 'https://www.breakingfreeonline.ca' },
  {
    name: 'The Recovery Centre (Eastern Health)',
    url: 'https://mha.easternhealth.ca/adults/treatment-centres-and-withdrawal-management/the-recovery-centre-16/',
  },
  { name: 'Guardians of Recovery', url: 'https://guardiansofrecovery.foundation' },
  { name: 'Choices for Youth', url: 'https://www.choicesforyouth.ca/health-outreach' },
  { name: 'Vida Nova Recovery Centre', url: 'https://vidanovarecovery.ca' },
  {
    name: "Stella's Circle – Mental Health",
    url: 'https://stellascircle.ca/what-we-do/mental-health/',
  },
  {
    name: "St. John's Status of Women – Safer Substance Use",
    url: 'https://sjswc.ca/safer-substance-use-program/',
  },
];

const CANADA_RESOURCES = [
  { name: 'Drug Rehab Services', url: 'https://www.drugrehab.ca' },
  { name: 'Community Addictions Peer Support (CAPSA)', url: 'https://capsa.ca/peer-support/' },
  { name: 'Alcoholics Anonymous Canada', url: 'https://www.aa.org' },
  { name: 'SMART Recovery Canada', url: 'https://smartrecovery-canada.ca' },
  { name: 'Quit Coach – Call 1-866-366-3667', url: null },
  { name: 'Finch Self Care App', url: 'https://finchcare.com' },
];

const GGT_CRITICAL_THRESHOLD = 400;
const GGT_HIGH_THRESHOLD = 150;

function resolveDisplayBand(
  resultBand: string,
  riskBandOverride: string | null | undefined,
  ggt: number | null | undefined,
): string {
  if (riskBandOverride) return riskBandOverride;
  if (ggt != null) {
    if (ggt >= GGT_CRITICAL_THRESHOLD) return 'CRITICAL';
    if (ggt >= GGT_HIGH_THRESHOLD && resultBand.toLowerCase() === 'low') return 'HIGH';
  }
  return resultBand;
}

function bandClasses(band: string) {
  switch (band.toLowerCase()) {
    case 'low':
      return 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
    case 'moderate':
      return 'border border-amber-500/20 bg-amber-500/10 text-amber-300';
    case 'high':
      return 'border border-orange-500/20 bg-orange-500/10 text-orange-300';
    case 'very high':
    case 'critical':
      return 'border border-rose-500/20 bg-rose-500/10 text-rose-300';
    default:
      return 'border border-[var(--border-subtle)] bg-[var(--surface-strong)] text-[var(--text-soft)]';
  }
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-strong)] p-4">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {label}
      </dt>
      <dd className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--text-main)]">
        {value}
      </dd>
    </div>
  );
}

function ResultBlock({
  title,
  children,
  tone = 'default',
}: {
  title: string;
  children: ReactNode;
  tone?: 'default' | 'warning';
}) {
  return (
    <section
      className={cn(
        'space-y-2 border-t pt-5',
        tone === 'warning'
          ? 'border-[var(--danger-soft)] text-[var(--danger)]'
          : 'border-[var(--border-subtle)]',
      )}
    >
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {title}
      </h3>
      <div
        className={cn(
          'text-sm leading-7',
          tone === 'warning' ? 'text-[var(--danger)]' : 'text-[var(--text-soft)]',
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function LiverCalcResultCard({
  result,
  astAltRatio,
  aiSummary,
  aiLoading,
  ggt,
  riskBandOverride,
  drinksPerDay,
}: LiverCalcResultCardProps) {
  if (!result) {
    return (
      <section className={`${panelShell} ${panelInner} space-y-4`}>
        <div className="space-y-2">
          <p className={sectionKicker}>Result</p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-main)]">
            Risk estimate
          </h2>
        </div>
        <p className="text-sm leading-6 text-[var(--text-soft)]">
          Submit the calculator to view the score, risk band, AST:ALT ratio, and clinical summary.
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
    <section className={`${panelShell} ${panelInner} space-y-5`}>
      <div className="space-y-4 border-b border-[var(--border-subtle)] pb-5">
        <div className="space-y-2">
          <p className={sectionKicker}>Result</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-main)]">
              Liver risk estimate
            </h2>
            <div
              className={cn(
                'inline-flex w-fit items-center rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]',
                bandClasses(displayBand),
              )}
            >
              {displayBand}
            </div>
          </div>
        </div>

        {(isCritical || isHigh) && (
          <div
            role="alert"
            className={cn(
              'rounded-lg border px-4 py-3 text-sm leading-6',
              isCritical
                ? 'border-rose-500/20 bg-rose-500/10 text-rose-200'
                : 'border-orange-500/20 bg-orange-500/10 text-orange-200',
            )}
          >
            {isCritical ? (
              <>
                <strong className="font-semibold">Consult a doctor promptly.</strong> Your GGT is
                critically elevated
                {ggt != null ? ` (${ggt} vs normal up to 85)` : ''} and may indicate a serious
                liver condition beyond alcohol use.
              </>
            ) : (
              <>
                <strong className="font-semibold">Your GGT is significantly elevated.</strong>{' '}
                Even if other markers appear normal, this level warrants prompt discussion with a
                doctor.
              </>
            )}
          </div>
        )}

        <dl className="grid gap-4 sm:grid-cols-2">
          <MetricCard label="Score" value={score} />
          <MetricCard
            label="AST:ALT Ratio"
            value={astAltRatio === null ? 'Unavailable' : formatNumber(astAltRatio, 2)}
          />
        </dl>
      </div>

      {result.explanation ? (
        <ResultBlock title="Explanation">
          <p>{result.explanation}</p>
        </ResultBlock>
      ) : null}

      {aiLoading ? (
        <ResultBlock title="AI Summary">
          <p>Generating clinical summary...</p>
        </ResultBlock>
      ) : null}

      {!aiLoading && aiSummary ? (
        <ResultBlock title="AI Summary">
          <p>{aiSummary}</p>
        </ResultBlock>
      ) : null}

      {typeof drinksPerDay === 'number' && drinksPerDay > 7 ? (
        <ResultBlock title="Support & Harm Reduction Resources">
          <p>Based on your reported alcohol intake, these free resources may be useful.</p>

          <div className="mt-4 space-y-4">
            <div>
              <p className="font-medium text-[var(--text-main)]">Newfoundland & Labrador</p>
              <ul className="mt-2 space-y-2">
                {NL_RESOURCES.map((resource) => (
                  <li key={resource.name}>
                    {resource.url ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent)] hover:text-[var(--accent-strong)]"
                      >
                        {resource.name}
                      </a>
                    ) : (
                      resource.name
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-medium text-[var(--text-main)]">Canada-Wide</p>
              <ul className="mt-2 space-y-2">
                {CANADA_RESOURCES.map((resource) => (
                  <li key={resource.name}>
                    {resource.url ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent)] hover:text-[var(--accent-strong)]"
                      >
                        {resource.name}
                      </a>
                    ) : (
                      resource.name
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ResultBlock>
      ) : null}

      {result.rejected_reason ? (
        <ResultBlock title="Rejected Reason" tone="warning">
          <p>{result.rejected_reason}</p>
        </ResultBlock>
      ) : null}

      <LiverCalcDisclaimer compact />
    </section>
  );
}
