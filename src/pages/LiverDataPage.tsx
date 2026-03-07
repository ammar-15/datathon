import { useEffect, useMemo, useState } from 'react';
import { NonDrinkerStatsTab } from '../components/NonDrinkerStatsTab';
import { RecordsTable } from '../components/RecordsTable';
import { StatisticsTable } from '../components/StatisticsTable';
import { VariableHistogram } from '../components/VariableHistogram';
import { averageOf, formatNumber } from '../lib/liverMetrics';
import { fetchLiverRecords, fetchLiverStatistics } from '../services/liverData';
import { liverLabels, liverVariables } from '../types/liver';
import type { LiverRecord, LiverStatistic } from '../types/liver';
import './LiverDataPage.css';

type ThemeMode = 'dark' | 'light';
type StatsTab = 'all-stats' | 'non-drinker-stats';

function buildSelectorSplit(records: LiverRecord[]) {
  const counts = records.reduce<Record<number, number>>((accumulator, record) => {
    accumulator[record.selector] = (accumulator[record.selector] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts)
    .sort(([left], [right]) => Number(left) - Number(right))
    .map(([selector, count]) => `#${selector}: ${count}`)
    .join(' · ');
}

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
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [activeStatsTab, setActiveStatsTab] = useState<StatsTab>('all-stats');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('bupa-dashboard-theme');
    const preferredTheme =
      savedTheme === 'light' || savedTheme === 'dark'
        ? savedTheme
        : window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark';

    setTheme(preferredTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('bupa-dashboard-theme', theme);
  }, [theme]);

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

  const selectorSplit = useMemo(() => buildSelectorSplit(records), [records]);
  const totalCount = records.length;
  const averageDrinks = averageOf(records, 'drinks');
  const averageGgt = averageOf(records, 'ggt');
  const averageAlt = averageOf(records, 'alt');
  const highestGgt = getHighestGgt(records);

  return (
    <main className="dashboard">
      <section className="dashboard__hero">
        <div className="dashboard__hero-row">
          <div>
            <p className="dashboard__eyebrow">Supabase dataset dashboard</p>
            <h1>BUPA Liver Records</h1>
            <p className="dashboard__lede">
              Explore the full dataset, descriptive statistics stored in Supabase, and variable
              distributions for each measurement in one demo-ready dashboard.
            </p>
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className="theme-toggle__icon" aria-hidden="true">
              {theme === 'dark' ? '☀' : '☾'}
            </span>
            <span className="theme-toggle__text">
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </span>
          </button>
        </div>
      </section>

      {loading ? (
        <section className="state-card">
          <h2>Loading dashboard</h2>
          <p>Fetching records, statistics, and chart data from Supabase.</p>
        </section>
      ) : error ? (
        <section className="state-card state-card--error">
          <h2>Could not load dashboard</h2>
          <p>{error}</p>
          <p className="state-card__note">
            Confirm the renamed columns exist, both tables are readable through RLS, and your
            frontend env values are correct.
          </p>
        </section>
      ) : records.length === 0 ? (
        <section className="state-card">
          <h2>No records found in bupa_liver_records.</h2>
          <p>Import the dataset into Supabase to view the table.</p>
        </section>
      ) : (
        <>
          <section className="stats-grid" aria-label="Dataset summary">
            <article className="stat-card">
              <span className="stat-card__label">Total Rows</span>
              <strong>{formatNumber(totalCount)}</strong>
              <span className="stat-card__hint">Records currently in Supabase</span>
            </article>
            <article className="stat-card">
              <span className="stat-card__label">Average Drinks</span>
              <strong>{formatNumber(averageDrinks, 2)}</strong>
              <span className="stat-card__hint">Half-pint equivalents per day</span>
            </article>
            <article className="stat-card">
              <span className="stat-card__label">Average GGT</span>
              <strong>{formatNumber(averageGgt, 2)}</strong>
              <span className="stat-card__hint">Mean gamma-glutamyl transpeptidase</span>
            </article>
            <article className="stat-card">
              <span className="stat-card__label">Selector Split</span>
              <strong>{selectorSplit || 'No data'}</strong>
              <span className="stat-card__hint">Distribution across selector classes</span>
            </article>
            <article className="stat-card">
              <span className="stat-card__label">Average ALT</span>
              <strong>{formatNumber(averageAlt, 2)}</strong>
              <span className="stat-card__hint">Useful quick scan for enzyme levels</span>
            </article>
            <article className="stat-card">
              <span className="stat-card__label">Highest GGT</span>
              <strong>{formatNumber(highestGgt)}</strong>
              <span className="stat-card__hint">Maximum observed GGT value</span>
            </article>
          </section>

          <RecordsTable records={records} />
          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">Stats and results</p>
                <h2>Statistics Outputs</h2>
              </div>
              <p className="section-heading__copy">
                Switch between the full descriptive statistics and the non-drinker subgroup profile.
              </p>
            </div>

            <div className="stats-tabs" role="tablist" aria-label="Statistics tabs">
              <button
                type="button"
                role="tab"
                aria-selected={activeStatsTab === 'all-stats'}
                className={`stats-tabs__button ${
                  activeStatsTab === 'all-stats' ? 'stats-tabs__button--active' : ''
                }`}
                onClick={() => setActiveStatsTab('all-stats')}
              >
                Descriptive Stats
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeStatsTab === 'non-drinker-stats'}
                className={`stats-tabs__button ${
                  activeStatsTab === 'non-drinker-stats' ? 'stats-tabs__button--active' : ''
                }`}
                onClick={() => setActiveStatsTab('non-drinker-stats')}
              >
                Non-Drinker Stats
              </button>
            </div>

            <div className="stats-tabs__panel" role="tabpanel">
              {activeStatsTab === 'all-stats' ? (
                <StatisticsTable statisticsRows={statisticsRows} />
              ) : (
                <NonDrinkerStatsTab />
              )}
            </div>
          </section>

          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">Charts</p>
                <h2>Variable Distributions</h2>
              </div>
              <p className="section-heading__copy">
                Histogram-style charts are computed from the live Supabase records in the browser.
              </p>
            </div>

            <div className="charts-grid">
              {liverVariables.map((variable) => (
                <VariableHistogram key={variable} records={records} variable={variable} />
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">Quick range view</p>
                <h2>Min / Mean / Max Summary</h2>
              </div>
              <p className="section-heading__copy">
                A compact comparison using the stored descriptive statistics table.
              </p>
            </div>

            {statisticsRows.length === 0 ? (
              <div className="state-card">
                <h3>No descriptive statistics found.</h3>
                <p>Run the statistics script to populate bupa_liver_statistics.</p>
              </div>
            ) : (
              <div className="range-grid">
                {statisticsRows.map((row) => {
                  const span = Math.max(row.max_value - row.min_value, 1);
                  const meanOffset = ((row.mean - row.min_value) / span) * 100;

                  return (
                    <article key={row.column_name} className="range-card">
                      <div className="range-card__header">
                        <h3>{liverLabels[row.column_name]}</h3>
                        <span>{formatNumber(row.record_count)} rows</span>
                      </div>
                      <div className="range-card__values">
                        <span>{formatNumber(row.min_value, 2)}</span>
                        <span>{formatNumber(row.mean, 2)}</span>
                        <span>{formatNumber(row.max_value, 2)}</span>
                      </div>
                      <div className="range-card__track">
                        <div className="range-card__line" />
                        <div className="range-card__marker" style={{ left: `${meanOffset}%` }} />
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
