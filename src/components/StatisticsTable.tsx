import { formatNumber } from '../lib/liverMetrics';
import { liverLabels } from '../types/liver';
import type { LiverStatistic } from '../types/liver';

type StatisticsTableProps = {
  statisticsRows: LiverStatistic[];
};

export function StatisticsTable({ statisticsRows }: StatisticsTableProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Stored statistics</p>
          <h2>Descriptive Statistics</h2>
        </div>
        <p className="section-heading__copy">
          Values are read from <code>bupa_liver_statistics</code>. Re-run the Python script after
          importing or editing records to refresh these summaries.
        </p>
      </div>

      {statisticsRows.length === 0 ? (
        <div className="state-card">
          <h3>No descriptive statistics found.</h3>
          <p>Run the statistics script to populate bupa_liver_statistics.</p>
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
              {statisticsRows.map((row) => (
                <tr key={row.column_name}>
                  <td>{liverLabels[row.column_name]}</td>
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
    </section>
  );
}
