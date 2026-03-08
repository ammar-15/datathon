import { useMemo, useState } from 'react';
import { formatNumber } from '../lib/liverMetrics';
import {
  buttonSecondary,
  cardTitle,
  cn,
  fieldLabel,
  inputClass,
  panelInner,
  panelShell,
  sectionKicker,
  tableWrap,
} from '../lib/ui';
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
  { key: 'ast_alt_ratio', label: 'AST/ALT Ratio', align: 'right', numeric: true },
  { key: 'ggt', label: 'GGT', align: 'right', numeric: true },
  { key: 'drinks', label: 'Drinks', align: 'right', numeric: true },
  { key: 'selector', label: 'Selector', align: 'right', numeric: true },
];

const PAGE_SIZE = 25;

const tableHeadCell =
  'bg-[var(--table-head)] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--table-head-text)]';

const tableBodyCell = 'border-t border-[var(--border-subtle)] px-4 py-3 text-sm text-[var(--table-text)]';

export function RecordsTable({ records }: RecordsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return records.filter((record) => {
      if (!query) {
        return true;
      }

      const searchableValues = [
        record.id,
        record.mcv,
        record.alp,
        record.alt,
        record.ast,
        record.ast_alt_ratio,
        record.ggt,
        record.drinks,
        record.selector,
      ];

      return searchableValues.some((value) => String(value).toLowerCase().includes(query));
    });
  }, [records, searchTerm]);

  const sortedRecords = useMemo(() => {
    const nextRecords = [...filteredRecords];

    nextRecords.sort((left, right) => {
      const leftValue = left[sortKey];
      const rightValue = right[sortKey];

      if (leftValue == null && rightValue == null) {
        return 0;
      }

      if (leftValue == null) {
        return sortDirection === 'asc' ? 1 : -1;
      }

      if (rightValue == null) {
        return sortDirection === 'asc' ? -1 : 1;
      }

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

  return (
    <section className={`${panelShell} ${panelInner} space-y-5`}>
      <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className={sectionKicker}>Dataset</p>
          <h2 className={cardTitle}>Raw records</h2>
        </div>
        <div className="w-full max-w-sm">
          <label className="space-y-2">
            <span className={fieldLabel}>Search</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search values"
              className={inputClass}
            />
          </label>
        </div>
      </div>

      {sortedRecords.length === 0 ? (
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-strong)] px-4 py-5 text-sm text-[var(--text-soft)]">
          No matching records.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-soft)]">
            <span>{formatNumber(sortedRecords.length)} visible rows</span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <span>
              Sorted by {columns.find((column) => column.key === sortKey)?.label} ({sortDirection})
            </span>
          </div>

          <div className={tableWrap}>
            <table className="min-w-[920px] w-full border-collapse">
              <thead>
                <tr>
                  {columns.map((column) => {
                    const isActive = sortKey === column.key;

                    return (
                      <th
                        key={column.key}
                        className={cn(
                          tableHeadCell,
                          column.align === 'right' ? 'text-right' : '',
                        )}
                      >
                        <button
                          type="button"
                          className={cn(
                            'inline-flex items-center gap-2 font-inherit transition hover:text-[var(--accent)]',
                            isActive ? 'text-[var(--accent)]' : 'text-inherit',
                          )}
                          onClick={() => handleSort(column.key)}
                        >
                          {column.label}
                          <span aria-hidden="true">
                            {isActive ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                          </span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-[var(--table-row-hover)]">
                    {columns.map((column) => {
                      const value = record[column.key];

                      return (
                        <td
                          key={column.key}
                          className={cn(
                            tableBodyCell,
                            column.align === 'right' ? 'text-right' : '',
                            column.numeric ? 'tabular-nums text-[var(--table-numeric)]' : '',
                          )}
                        >
                          {column.key === 'drinks'
                            ? formatNumber(record.drinks, 2)
                            : column.key === 'ast_alt_ratio'
                              ? value == null
                                ? 'Not calculated'
                                : formatNumber(Number(value), 2)
                              : value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-[var(--text-soft)]">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}-
              {Math.min(currentPage * PAGE_SIZE, sortedRecords.length)} of {sortedRecords.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={buttonSecondary}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                type="button"
                className={buttonSecondary}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
