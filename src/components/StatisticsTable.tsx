import { formatNumber } from '../lib/liverMetrics';
import { tableWrap } from '../lib/ui';
import { liverLabels } from '../types/liver';
import type { LiverStatistic } from '../types/liver';

type StatisticsTableProps = {
  statisticsRows: LiverStatistic[];
};

export function StatisticsTable({ statisticsRows }: StatisticsTableProps) {
  if (statisticsRows.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-strong)] px-4 py-5 text-sm text-[var(--text-soft)]">
        No descriptive statistics found.
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
          {statisticsRows.map((row) => (
            <tr key={row.column_name} className="hover:bg-[var(--table-row-hover)]">
              <td className="border-t border-[var(--border-subtle)] px-4 py-3 text-sm text-[var(--table-text)]">
                {liverLabels[row.column_name]}
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
