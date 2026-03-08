import { useEffect, useState } from 'react';
import { DrinksRegressionTab } from '../components/DrinksRegressionTab';
import { NonDrinkerStatsTab } from '../components/NonDrinkerStatsTab';
import { RecordsTable } from '../components/RecordsTable';
import { StatisticsTable } from '../components/StatisticsTable';
import { VariableHistogram } from '../components/VariableHistogram';
import { averageOf, formatNumber } from '../lib/liverMetrics';
import {
  cardTitle,
  cn,
  pageShell,
  panelInner,
  panelShell,
  sectionKicker,
  sectionSubtitle,
  sectionTitle,
  stateCard,
  tabClass,
} from '../lib/ui';
import { fetchLiverRecords, fetchLiverStatistics } from '../services/liverData';
import { liverLabels, liverVariables } from '../types/liver';
import type { LiverRecord, LiverStatistic } from '../types/liver';

type StatsTab = 'all-stats' | 'non-drinker-stats' | 'drinks-regression';

function getHighestGgt(records: LiverRecord[]) {
  if (records.length === 0) {
    return 0;
  }

  return Math.max(...records.map((record) => record.ggt));
}

export function LiverDataPage() {
  const [records, setRecords] = useState<LiverRecord[]>([]);
  const [statisticsRows, setStatisticsRows] = useState<LiverStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatsTab, setActiveStatsTab] = useState<StatsTab>('all-stats');

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [recordsResponse, statisticsResponse] = await Promise.all([
          fetchLiverRecords(),
          fetchLiverStatistics(),
        ]);

        if (!active) {
          return;
        }

        setRecords(recordsResponse);
        setStatisticsRows(statisticsResponse);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const totalCount = records.length;
  const averageDrinks = averageOf(records, 'drinks');
  const averageGgt = averageOf(records, 'ggt');
  const averageAlt = averageOf(records, 'alt');
  const highestGgt = getHighestGgt(records);

  const summaryCards = [
    { label: 'Rows', value: formatNumber(totalCount) },
    { label: 'Average Drinks', value: formatNumber(averageDrinks, 2) },
    { label: 'Average GGT', value: formatNumber(averageGgt, 2) },
    { label: 'Average ALT', value: formatNumber(averageAlt, 2) },
    { label: 'Highest GGT', value: formatNumber(highestGgt) },
  ];

  return (
    <main className={pageShell}>
      <section className={`${panelShell} ${panelInner} space-y-3`}>
        <div className="space-y-3">
          <p className={sectionKicker}>Supabase Dataset</p>
          <div className="space-y-3">
            <h1 className={sectionTitle}>BUPA liver records dashboard</h1>
            <p className={sectionSubtitle}>
              Explore the dataset, descriptive statistics, and distribution views from one clinical
              dashboard.
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <section className={stateCard}>
          <h2 className={cardTitle}>Loading dashboard</h2>
          <p className="mt-2 text-sm text-[var(--text-soft)]">
            Fetching records, statistics, and chart data.
          </p>
        </section>
      ) : error ? (
        <section className={`${stateCard} border-[var(--danger-soft)] bg-[var(--danger-soft)]`}>
          <h2 className={cardTitle}>Could not load dashboard</h2>
          <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>
          <p className="mt-2 text-sm text-[var(--danger)]">
            Confirm the tables are readable through RLS and the frontend env values are correct.
          </p>
        </section>
      ) : records.length === 0 ? (
        <section className={stateCard}>
          <h2 className={cardTitle}>No records found</h2>
          <p className="mt-2 text-sm text-[var(--text-soft)]">
            Import the dataset into Supabase to populate the dashboard.
          </p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6" aria-label="Dataset summary">
            {summaryCards.map((card) => (
              <article key={card.label} className={`${panelShell} p-5`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  {card.label}
                </p>
                <p
                  className={cn('mt-4 text-3xl font-semibold tracking-[-0.03em] text-[var(--text-main)]')}
                >
                  {card.value}
                </p>
              </article>
            ))}
          </section>

          <RecordsTable records={records} />

          <section className={`${panelShell} ${panelInner} space-y-5`}>
            <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <p className={sectionKicker}>Statistics</p>
                <h2 className={cardTitle}>Stored outputs</h2>
              </div>

              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Statistics tabs">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeStatsTab === 'all-stats'}
                  className={tabClass(activeStatsTab === 'all-stats')}
                  onClick={() => setActiveStatsTab('all-stats')}
                >
                  Descriptive stats
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeStatsTab === 'non-drinker-stats'}
                  className={tabClass(activeStatsTab === 'non-drinker-stats')}
                  onClick={() => setActiveStatsTab('non-drinker-stats')}
                >
                  Non-drinker stats
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeStatsTab === 'drinks-regression'}
                  className={tabClass(activeStatsTab === 'drinks-regression')}
                  onClick={() => setActiveStatsTab('drinks-regression')}
                >
                  Drinks regression
                </button>
              </div>
            </div>

            <div role="tabpanel">
              {activeStatsTab === 'all-stats' ? (
                <StatisticsTable statisticsRows={statisticsRows} />
              ) : activeStatsTab === 'non-drinker-stats' ? (
                <NonDrinkerStatsTab />
              ) : (
                <DrinksRegressionTab />
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-2">
              <p className={sectionKicker}>Charts</p>
              <h2 className={cardTitle}>Variable distributions</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {liverVariables.map((variable) => (
                <VariableHistogram key={variable} records={records} variable={variable} />
              ))}
            </div>
          </section>

          <section className={`${panelShell} ${panelInner} space-y-5`}>
            <div className="space-y-2">
              <p className={sectionKicker}>Summary</p>
              <h2 className={cardTitle}>Min / mean / max</h2>
            </div>

            {statisticsRows.length === 0 ? (
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-strong)] px-4 py-5 text-sm text-[var(--text-soft)]">
                No descriptive statistics found.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {statisticsRows.map((row) => {
                  const span = Math.max(row.max_value - row.min_value, 1);
                  const meanOffset = ((row.mean - row.min_value) / span) * 100;

                  return (
                    <article
                      key={row.column_name}
                      className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-strong)] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold tracking-[-0.02em] text-[var(--text-main)]">
                          {liverLabels[row.column_name]}
                        </h3>
                        <span className="text-xs text-[var(--text-muted)]">
                          {formatNumber(row.record_count)} rows
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3 text-sm tabular-nums text-[var(--text-soft)]">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                            Min
                          </p>
                          <p className="mt-2 text-base text-[var(--text-main)]">
                            {formatNumber(row.min_value, 2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                            Mean
                          </p>
                          <p className="mt-2 text-base text-[var(--text-main)]">
                            {formatNumber(row.mean, 2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                            Max
                          </p>
                          <p className="mt-2 text-base text-[var(--text-main)]">
                            {formatNumber(row.max_value, 2)}
                          </p>
                        </div>
                      </div>

                      <div className="relative mt-5 h-2 rounded-full bg-[var(--accent-soft)]">
                        <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]/25" />
                        <div
                          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[var(--surface-elevated)] bg-[var(--accent)] shadow-[0_0_0_3px_var(--accent-soft)]"
                          style={{ left: `calc(${meanOffset}% - 8px)` }}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
