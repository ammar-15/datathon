import type { LiverRecord, LiverVariableKey } from '../types/liver';

export type HistogramBin = {
  label: string;
  count: number;
};

export function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function averageOf(records: LiverRecord[], key: LiverVariableKey) {
  if (records.length === 0) {
    return 0;
  }

  const total = records.reduce((sum, record) => sum + record[key], 0);
  return total / records.length;
}

export function buildHistogramBins(
  records: LiverRecord[],
  key: LiverVariableKey,
  binCount = 10,
): HistogramBin[] {
  if (records.length === 0) {
    return [];
  }

  const values = records.map((record) => record[key]);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);

  if (minimum === maximum) {
    return [{ label: formatRange(minimum, maximum), count: values.length }];
  }

  const effectiveBinCount = key === 'selector' ? Math.min(2, binCount) : binCount;
  const binSize = (maximum - minimum) / effectiveBinCount;

  return Array.from({ length: effectiveBinCount }, (_, index) => {
    const start = minimum + binSize * index;
    const end = index === effectiveBinCount - 1 ? maximum : minimum + binSize * (index + 1);
    const count = values.filter((value) => {
      if (index === effectiveBinCount - 1) {
        return value >= start && value <= end;
      }

      return value >= start && value < end;
    }).length;

    return {
      label: formatRange(start, end),
      count,
    };
  });
}

function formatRange(start: number, end: number) {
  return `${formatCompact(start)}-${formatCompact(end)}`;
}

function formatCompact(value: number) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(1);
}
