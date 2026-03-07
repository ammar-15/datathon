import { useEffect, useMemo, useState } from 'react';
import { fetchLiverRecords } from '../services/liverRecords';
import type { LiverNumericKey, LiverRecord } from '../types/liver';
import './LiverDataPage.css';

type SortDirection = 'asc' | 'desc';
type SortKey = keyof LiverRecord;

const columns: Array<{
  key: SortKey;
  label: string;
  align?: 'left' | 'right';
  numeric?: boolean;
}> = [
  { key: 'id', label: 'ID', align: 'right', numeric: true },
  { key: 'mcv', label: 'MCV', align: 'right', numeric: true },
  { key: 'alkphos', label: 'Alkphos', align: 'right', numeric: true },
  { key: 'sgpt', label: 'SGPT', align: 'right', numeric: true },
  { key: 'sgot', label: 'SGOT', align: 'right', numeric: true },
  { key: 'gammagt', label: 'GammaGT', align: 'right', numeric: true },
  { key: 'drinks', label: 'Drinks', align: 'right', numeric: true },
  { key: 'selector', label: 'Selector', align: 'right', numeric: true },
];

function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function averageOf(records: LiverRecord[], key: LiverNumericKey) {
  if (records.length === 0) {
    return 0;
  }

  const total = records.reduce((sum, record) => sum + record[key], 0);
  return total / records.length;
}

export function LiverDataPage() {
  const [records, setRecords] = useState<LiverRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectorFilter, setSelectorFilter] = useState<'all' | '1' | '2'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRecords() {
      try {
        setLoading(true);
        setError(null);
        const nextRecords = await fetchLiverRecords();

        if (active) {
          setRecords(nextRecords);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load records.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRecords();

    return () => {
      active = false;
    };
  }, []);

  const selectorCounts = useMemo(() => {
    return records.reduce<Record<number, number>>((counts, record) => {
      counts[record.selector] = (counts[record.selector] ?? 0) + 1;
      return counts;
    }, {});
  }, [records]);

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSelector =
        selectorFilter === 'all' || record.selector === Number(selectorFilter);

      if (!matchesSelector) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableValues = [
        record.id,
        record.mcv,
        record.alkphos,
        record.sgpt,
        record.sgot,
        record.gammagt,
        record.drinks,
        record.selector,
      ];

      return searchableValues.some((value) => String(value).toLowerCase().includes(query));
    });
  }, [records, searchTerm, selectorFilter]);

  const sortedRecords = useMemo(() => {
    const nextRecords = [...filteredRecords];

    nextRecords.sort((left, right) => {
      const leftValue = left[sortKey];
      const rightValue = right[sortKey];

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return sortDirection === 'asc' ? leftValue - rightValue : rightValue - leftValue;
      }

      const leftText = String(leftValue).toLowerCase();
      const rightText = String(rightValue).toLowerCase();

      if (leftText < rightText) {
        return sortDirection === 'asc' ? -1 : 1;
      }

      if (leftText > rightText) {
        return sortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });

    return nextRecords;
  }, [filteredRecords, sortDirection, sortKey]);

  const totalCount = records.length;
  const averageDrinks = averageOf(records, 'drinks');
  const averageGammaGt = averageOf(records, 'gammagt');

  function handleSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortDirection((currentDirection) => (currentDirection === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(nextKey);
    setSortDirection('asc');
  }

  return (
    <main className="dashboard">
      <section className="dashboard__hero">
        <div>
          <p className="dashboard__eyebrow">Supabase dataset dashboard</p>
          <h1>BUPA Liver Records</h1>
          <p className="dashboard__lede">
            Live records from <code>bupa_liver_records</code> with simple metrics, filtering,
            and a table layout ready for charts later.
          </p>
        </div>
      </section>

      <section className="stats-grid" aria-label="Dataset summary">
        <article className="stat-card">
          <span className="stat-card__label">Total Rows</span>
          <strong>{formatNumber(totalCount)}</strong>
          <span className="stat-card__hint">Current records fetched from Supabase</span>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">Average Drinks</span>
          <strong>{formatNumber(averageDrinks, 2)}</strong>
          <span className="stat-card__hint">Half-pint equivalents per day</span>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">Average GammaGT</span>
          <strong>{formatNumber(averageGammaGt, 2)}</strong>
          <span className="stat-card__hint">Mean gamma-glutamyl transpeptidase</span>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">Selector Split</span>
          <strong>
            {Object.entries(selectorCounts)
              .sort(([left], [right]) => Number(left) - Number(right))
              .map(([selector, count]) => `#${selector}: ${count}`)
              .join(' · ') || 'No data'}
          </strong>
          <span className="stat-card__hint">Quick class distribution</span>
        </article>
      </section>

      <section className="panel">
        <div className="toolbar">
          <label className="toolbar__field">
            <span>Search records</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by any value"
            />
            <small
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
              }}
            >
              Search numeric values from records, for example 85, 92, 1, or 2.
            </small>
          </label>

          <label className="toolbar__field toolbar__field--compact">
            <span>Selector</span>
            <select
              value={selectorFilter}
              onChange={(event) => setSelectorFilter(event.target.value as 'all' | '1' | '2')}
            >
              <option value="all">All selectors</option>
              <option value="1">Selector 1</option>
              <option value="2">Selector 2</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="state-card">
            <h2>Loading records</h2>
            <p>Fetching rows from Supabase.</p>
          </div>
        ) : error ? (
          <div className="state-card state-card--error">
            <h2>Could not load data</h2>
            <p>{error}</p>
            <p className="state-card__note">
              Confirm the table exists, RLS policies allow reads, and your env values are correct.
            </p>
          </div>
        ) : records.length === 0 ? (
          <div className="state-card">
            <h2>No records found in bupa_liver_records.</h2>
            <p>Import the dataset into Supabase to view the table.</p>
          </div>
        ) : sortedRecords.length === 0 ? (
          <div className="state-card">
            <h2>No matching records</h2>
            <p>Try clearing the search box or changing the selector filter.</p>
          </div>
        ) : (
          <div className="table-shell">
            <div className="table-shell__meta">
              <span>{formatNumber(sortedRecords.length)} visible rows</span>
              <span>
                Sorted by {sortKey} ({sortDirection})
              </span>
            </div>

            <div className="table-scroll">
              <table className="records-table">
                <thead>
                  <tr>
                    {columns.map((column) => {
                      const isActive = sortKey === column.key;

                      return (
                        <th
                          key={column.key}
                          className={column.align === 'right' ? 'align-right' : undefined}
                        >
                          <button
                            type="button"
                            className={`sort-button ${isActive ? 'sort-button--active' : ''}`}
                            onClick={() => handleSort(column.key)}
                          >
                            {column.label}
                            <span>{isActive ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedRecords.map((record) => (
                    <tr key={record.id}>
                      {columns.map((column) => {
                        const value = record[column.key];

                        return (
                          <td
                            key={column.key}
                            className={[
                              column.align === 'right' ? 'align-right' : '',
                              column.numeric ? 'numeric-cell' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {column.key === 'drinks' ? formatNumber(record.drinks, 2) : value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
