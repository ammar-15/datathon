import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function NonDrinkerStatsTable() {
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
            'id, column_name, mean, median, mode, std_dev, min_value, max_value, record_count',
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
    <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-slate-200/40 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
            Subgroup statistics
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            Non-Drinker Liver Profile
          </h2>
        </div>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Descriptive statistics for records where <code className="font-semibold">drinks = 0</code>,
          fetched directly from Supabase table <code className="font-semibold">bupa_non_drinker_stats</code>.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
          Loading non-drinker statistics...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-8 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
          No descriptive statistics found in <code className="font-semibold">bupa_non_drinker_stats</code>.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-2xl">
            <thead>
              <tr className="bg-slate-100 text-left text-xs uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <th className="px-4 py-3">Column Name</th>
                <th className="px-4 py-3 text-right">Mean</th>
                <th className="px-4 py-3 text-right">Median</th>
                <th className="px-4 py-3 text-right">Mode</th>
                <th className="px-4 py-3 text-right">Standard Deviation</th>
                <th className="px-4 py-3 text-right">Min</th>
                <th className="px-4 py-3 text-right">Max</th>
                <th className="px-4 py-3 text-right">Record Count</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={
                    index % 2 === 0
                      ? 'bg-white text-slate-900 dark:bg-slate-950/40 dark:text-slate-100'
                      : 'bg-slate-50/80 text-slate-900 dark:bg-slate-900/50 dark:text-slate-100'
                  }
                >
                  <td className="border-t border-slate-200 px-4 py-3 font-medium dark:border-slate-800">
                    {row.column_name}
                  </td>
                  <td className="border-t border-slate-200 px-4 py-3 text-right tabular-nums dark:border-slate-800">
                    {formatNumber(row.mean)}
                  </td>
                  <td className="border-t border-slate-200 px-4 py-3 text-right tabular-nums dark:border-slate-800">
                    {formatNumber(row.median)}
                  </td>
                  <td className="border-t border-slate-200 px-4 py-3 text-right tabular-nums dark:border-slate-800">
                    {formatNumber(row.mode)}
                  </td>
                  <td className="border-t border-slate-200 px-4 py-3 text-right tabular-nums dark:border-slate-800">
                    {formatNumber(row.std_dev)}
                  </td>
                  <td className="border-t border-slate-200 px-4 py-3 text-right tabular-nums dark:border-slate-800">
                    {formatNumber(row.min_value)}
                  </td>
                  <td className="border-t border-slate-200 px-4 py-3 text-right tabular-nums dark:border-slate-800">
                    {formatNumber(row.max_value)}
                  </td>
                  <td className="border-t border-slate-200 px-4 py-3 text-right tabular-nums dark:border-slate-800">
                    {formatNumber(row.record_count)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
