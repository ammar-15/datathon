import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatNumber } from '../lib/liverMetrics';

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

  return (
    <div className="stats-tab-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Regression results</p>
          <h2>Regression Analysis: Drinks vs Liver Biomarkers</h2>
        </div>
        <p className="section-heading__copy">
          This table summarizes the linear relationship between drinks and each biomarker using
          regression outputs stored in <code>bupa_drinks_regression_stats</code>.
        </p>
      </div>

      {loading ? (
        <div className="state-card">
          <h3>Loading drinks regression</h3>
          <p>Fetching regression rows from Supabase.</p>
        </div>
      ) : error ? (
        <div className="state-card state-card--error">
          <h3>Could not load drinks regression</h3>
          <p>{error}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="state-card">
          <h3>No drinks regression results found</h3>
          <p>No rows are currently available in bupa_drinks_regression_stats.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="records-table records-table--stats">
            <thead>
              <tr>
                <th>Variable</th>
                <th className="align-right">Slope</th>
                <th className="align-right">Intercept</th>
                <th className="align-right">Correlation (r)</th>
                <th className="align-right">R²</th>
                <th className="align-right">Count Used</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.variable_name}</td>
                  <td className="align-right numeric-cell">{formatNumber(row.slope, 3)}</td>
                  <td className="align-right numeric-cell">{formatNumber(row.intercept, 3)}</td>
                  <td className="align-right numeric-cell">{formatNumber(row.r_value, 3)}</td>
                  <td className="align-right numeric-cell">{formatNumber(row.r_squared, 3)}</td>
                  <td className="align-right numeric-cell">{formatNumber(row.count_used)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
