import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatNumber } from '../lib/liverMetrics';
import { tableWrap } from '../lib/ui';

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

  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-strong)] px-4 py-5 text-sm text-[var(--text-soft)]">
        Loading non-drinker statistics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-4 py-5 text-sm text-[var(--danger)]">
        {error}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-strong)] px-4 py-5 text-sm text-[var(--text-soft)]">
        No non-drinker statistics found.
      </div>
    );
  }

  return (
    <div className={tableWrap}>
      <table className="min-w-[860px] w-full border-collapse">
        <thead>
          <tr>
            <th className="bg-[var(--table-head)] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--table-head-text)]">
              Variable
            </th>
            {['Mean', 'Median', 'Mode', 'Std Dev', 'Min', 'Max', 'Count'].map((label) => (
              <th
                key={label}
                className="bg-[var(--table-head)] px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--table-head-text)]"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-[var(--table-row-hover)]">
              <td className="border-t border-[var(--border-subtle)] px-4 py-3 text-sm text-[var(--table-text)]">
                {row.column_name}
              </td>
              <td className="border-t border-[var(--border-subtle)] px-4 py-3 text-right text-sm tabular-nums text-[var(--table-numeric)]">
                {formatNumber(row.mean, 2)}
              </td>
              <td className="border-t border-[var(--border-subtle)] px-4 py-3 text-right text-sm tabular-nums text-[var(--table-numeric)]">
                {formatNumber(row.median, 2)}
              </td>
              <td className="border-t border-[var(--border-subtle)] px-4 py-3 text-right text-sm tabular-nums text-[var(--table-numeric)]">
                {formatNumber(row.mode, 2)}
              </td>
              <td className="border-t border-[var(--border-subtle)] px-4 py-3 text-right text-sm tabular-nums text-[var(--table-numeric)]">
                {formatNumber(row.std_dev, 2)}
              </td>
              <td className="border-t border-[var(--border-subtle)] px-4 py-3 text-right text-sm tabular-nums text-[var(--table-numeric)]">
                {formatNumber(row.min_value, 2)}
              </td>
              <td className="border-t border-[var(--border-subtle)] px-4 py-3 text-right text-sm tabular-nums text-[var(--table-numeric)]">
                {formatNumber(row.max_value, 2)}
              </td>
              <td className="border-t border-[var(--border-subtle)] px-4 py-3 text-right text-sm tabular-nums text-[var(--table-numeric)]">
                {formatNumber(row.record_count)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
