import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatNumber } from '../lib/liverMetrics';
import { tableWrap } from '../lib/ui';

type DrinksRegressionRow = {
  id: number;
  variable_name: string;
  slope: number;
  intercept: number;
  r_value: number;
  r_squared: number;
  count_used: number;
  created_at: string;
};

export function DrinksRegressionTab() {
  const [rows, setRows] = useState<DrinksRegressionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRows() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: queryError } = await supabase
          .from('bupa_drinks_regression_stats')
          .select(
            'id, variable_name, slope, intercept, r_value, r_squared, count_used, created_at',
          )
          .order('variable_name', { ascending: true });

        if (queryError) {
          throw new Error(queryError.message);
        }

        if (active) {
          setRows((data ?? []) as DrinksRegressionRow[]);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load drinks regression statistics.',
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
        Loading drinks regression...
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
        No drinks regression results found.
      </div>
    );
  }

  return (
    <div className={tableWrap}>
      <table className="min-w-[760px] w-full border-collapse">
        <thead>
          <tr>
            <th className="bg-[var(--table-head)] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--table-head-text)]">
              Variable
            </th>
            {['Slope', 'Intercept', 'Correlation (r)', 'R²', 'Count Used'].map((label) => (
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
                {row.variable_name}
              </td>
              <td className="border-t border-[var(--border-subtle)] px-4 py-3 text-right text-sm tabular-nums text-[var(--table-numeric)]">
                {formatNumber(row.slope, 3)}
              </td>
              <td className="border-t border-[var(--border-subtle)] px-4 py-3 text-right text-sm tabular-nums text-[var(--table-numeric)]">
                {formatNumber(row.intercept, 3)}
              </td>
              <td className="border-t border-[var(--border-subtle)] px-4 py-3 text-right text-sm tabular-nums text-[var(--table-numeric)]">
                {formatNumber(row.r_value, 3)}
              </td>
              <td className="border-t border-[var(--border-subtle)] px-4 py-3 text-right text-sm tabular-nums text-[var(--table-numeric)]">
                {formatNumber(row.r_squared, 3)}
              </td>
              <td className="border-t border-[var(--border-subtle)] px-4 py-3 text-right text-sm tabular-nums text-[var(--table-numeric)]">
                {formatNumber(row.count_used)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
