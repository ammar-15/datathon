import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { buildHistogramBins } from '../lib/liverMetrics';
import { cardTitle, panelInner, panelShell } from '../lib/ui';
import { liverLabels } from '../types/liver';
import type { LiverRecord, LiverVariableKey } from '../types/liver';

type VariableHistogramProps = {
  records: LiverRecord[];
  variable: LiverVariableKey;
};

export function VariableHistogram({ records, variable }: VariableHistogramProps) {
  const bins = buildHistogramBins(records, variable, variable === 'selector' ? 2 : 10);
  const emptyMessage =
    variable === 'ast_alt_ratio'
      ? 'AST/ALT ratio not yet calculated.'
      : 'No data available for this chart.';

  return (
    <article className={`${panelShell} ${panelInner} space-y-4`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className={cardTitle}>{liverLabels[variable]}</h3>
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Distribution
        </span>
      </div>

      {bins.length === 0 ? (
        <div className="grid min-h-[220px] place-items-center rounded-lg border border-dashed border-[var(--border-subtle)] text-sm text-[var(--text-soft)]">
          {emptyMessage}
        </div>
      ) : (
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bins}>
              <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--chart-text)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis
                tick={{ fill: 'var(--chart-text)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'var(--table-row-hover)' }}
                contentStyle={{
                  background: 'var(--tooltip-bg)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  color: 'var(--tooltip-text)',
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {bins.map((_, index) => (
                  <Cell
                    key={`${variable}-${index}`}
                    fill={index % 2 === 0 ? 'var(--chart-bar)' : 'var(--chart-bar-alt)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}
