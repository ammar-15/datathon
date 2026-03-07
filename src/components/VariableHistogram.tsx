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
    <article className="chart-card">
      <div className="chart-card__header">
        <p className="chart-card__eyebrow">Distribution</p>
        <h3>{liverLabels[variable]}</h3>
      </div>

      {bins.length === 0 ? (
        <div className="chart-card__empty">{emptyMessage}</div>
      ) : (
        <div className="chart-card__body">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bins}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" vertical={false} />
              <XAxis
                dataKey="label"
                label={{ value: liverLabels[variable], position: 'insideBottom', offset: -4, fill: '#93a4b8' }}
                tick={{ fill: '#93a4b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#93a4b8' }}
                tick={{ fill: '#93a4b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(125, 211, 252, 0.08)' }}
                contentStyle={{
                  background: 'rgba(8, 14, 26, 0.96)',
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                  borderRadius: '14px',
                  color: '#e6eef8',
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {bins.map((_, index) => (
                  <Cell
                    key={`${variable}-${index}`}
                    fill={index % 2 === 0 ? 'rgba(56, 189, 248, 0.92)' : 'rgba(45, 212, 191, 0.88)'}
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
