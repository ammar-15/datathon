import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatNumber } from '../lib/liverMetrics';

type NonDrinkerStatRow = {
  id: number;
  column_name: string;
  mean: number;
  median: number;
  mode: number;
  std_dev: number;
  min_value: number;
  max_value: number;
  record_count: number;
  created_at: string;
};

export function NonDrinkerStatsTab() {
  const [rows, setRows] = useState<NonDrinkerStatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRows() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: queryError } = await supabase
          .from('bupa_non_drinker_stats')
          .select(
            'id, column_name, mean, median, mode, std_dev, min_value, max_value, record_count, created_at',
          )
          .order('column_name', { ascending: true });

        if (queryError) {
          throw new Error(queryError.message);
        }

        if (active) {
          setRows((data ?? []) as NonDrinkerStatRow[]);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load non-drinker descriptive statistics.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRows();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="stats-tab-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Subgroup statistics</p>
          <h2>Baseline Liver Biomarker Profile (Non-Drinkers)</h2>
        </div>
        <p className="section-heading__copy">
          Descriptive statistics fetched from <code>bupa_non_drinker_stats</code> for records with
          no reported drinks.
        </p>
      </div>

      {loading ? (
        <div className="state-card">
          <h3>Loading non-drinker statistics</h3>
          <p>Fetching rows from Supabase.</p>
        </div>
      ) : error ? (
        <div className="state-card state-card--error">
          <h3>Could not load non-drinker statistics</h3>
          <p>{error}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="state-card">
          <h3>No non-drinker statistics found</h3>
          <p>No rows are currently available in bupa_non_drinker_stats.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="records-table records-table--stats">
            <thead>
              <tr>
                <th>Variable</th>
                <th className="align-right">Mean</th>
                <th className="align-right">Median</th>
                <th className="align-right">Mode</th>
                <th className="align-right">Std Dev</th>
                <th className="align-right">Min</th>
                <th className="align-right">Max</th>
                <th className="align-right">Count</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.column_name}</td>
                  <td className="align-right numeric-cell">{formatNumber(row.mean, 2)}</td>
                  <td className="align-right numeric-cell">{formatNumber(row.median, 2)}</td>
                  <td className="align-right numeric-cell">{formatNumber(row.mode, 2)}</td>
                  <td className="align-right numeric-cell">{formatNumber(row.std_dev, 2)}</td>
                  <td className="align-right numeric-cell">{formatNumber(row.min_value, 2)}</td>
                  <td className="align-right numeric-cell">{formatNumber(row.max_value, 2)}</td>
                  <td className="align-right numeric-cell">{formatNumber(row.record_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
