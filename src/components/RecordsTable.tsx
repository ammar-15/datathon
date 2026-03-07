import { useMemo, useState } from 'react';
import { formatNumber } from '../lib/liverMetrics';
import type { LiverRecord } from '../types/liver';

type SortDirection = 'asc' | 'desc';
type SortKey = keyof LiverRecord;

type RecordsTableProps = {
  records: LiverRecord[];
};

const columns: Array<{
  key: SortKey;
  label: string;
  align?: 'left' | 'right';
  numeric?: boolean;
}> = [
  { key: 'id', label: 'ID', align: 'right', numeric: true },
  { key: 'mcv', label: 'MCV', align: 'right', numeric: true },
  { key: 'alp', label: 'ALP', align: 'right', numeric: true },
  { key: 'alt', label: 'ALT', align: 'right', numeric: true },
  { key: 'ast', label: 'AST', align: 'right', numeric: true },
  { key: 'ggt', label: 'GGT', align: 'right', numeric: true },
  { key: 'drinks', label: 'Drinks', align: 'right', numeric: true },
  { key: 'selector', label: 'Selector', align: 'right', numeric: true },
];

const PAGE_SIZE = 25;

export function RecordsTable({ records }: RecordsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectorFilter, setSelectorFilter] = useState<'all' | '1' | '2'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);

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
        record.alp,
        record.alt,
        record.ast,
        record.ggt,
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

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function handleSort(nextKey: SortKey) {
    setPage(1);

    if (nextKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(nextKey);
    setSortDirection('asc');
  }

  function handleSearch(value: string) {
    setSearchTerm(value);
    setPage(1);
  }

  function handleSelector(value: 'all' | '1' | '2') {
    setSelectorFilter(value);
    setPage(1);
  }

  return (
    <section className="panel panel--table">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Full dataset</p>
          <h2>Raw Records Table</h2>
        </div>
        <p className="section-heading__copy">
          Browse the entire BUPA dataset with search, sorting, selector filtering, and pagination.
        </p>
      </div>

      <div className="toolbar">
        <label className="toolbar__field">
          <span>Search records</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search numeric values"
          />
          <small className="helper-text">
            Search numeric values from records, for example 85, 92, 1, or 2.
          </small>
        </label>

        <label className="toolbar__field toolbar__field--compact">
          <span>Selector</span>
          <select
            value={selectorFilter}
            onChange={(event) => handleSelector(event.target.value as 'all' | '1' | '2')}
          >
            <option value="all">All selectors</option>
            <option value="1">Selector 1</option>
            <option value="2">Selector 2</option>
          </select>
        </label>
      </div>

      {sortedRecords.length === 0 ? (
        <div className="state-card">
          <h3>No matching records</h3>
          <p>Try clearing the search box or changing the selector filter.</p>
        </div>
      ) : (
        <div className="table-shell">
          <div className="table-shell__meta">
            <span>{formatNumber(sortedRecords.length)} visible rows</span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <span>
              Sorted by {columns.find((column) => column.key === sortKey)?.label} ({sortDirection})
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
                {paginatedRecords.map((record) => (
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

          <div className="pagination">
            <button
              type="button"
              className="pagination__button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="pagination__status">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, sortedRecords.length)} of{' '}
              {sortedRecords.length}
            </span>
            <button
              type="button"
              className="pagination__button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
