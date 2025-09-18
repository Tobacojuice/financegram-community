export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function formatPercent(value: number, fractionDigits = 2) {
  if (!Number.isFinite(value)) {
    return '-';
  }
  const sign = value > 0 ? '+' : value < 0 ? '' : '';
  return `${sign}${value.toFixed(fractionDigits)}%`;
}

export function formatCurrency(value: number, currency = 'USD', fractionDigits = 2) {
  if (!Number.isFinite(value)) {
    return '-';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatCompactNumber(value?: number) {
  if (!Number.isFinite(value ?? NaN)) {
    return '-';
  }
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value!);
}

export function formatRelativeTime(input?: Date | string | number) {
  if (!input) {
    return '-';
  }

  const date =
    input instanceof Date ? input : typeof input === 'string' ? new Date(input) : new Date(input);

  if (!Number.isFinite(date.getTime())) {
    return '-';
  }

  const diff = Date.now() - date.getTime();
  const absDiff = Math.abs(diff);

  const units: Array<{ limit: number; divisor: number; suffix: string }> = [
    { limit: 60_000, divisor: 1_000, suffix: 's' },
    { limit: 3_600_000, divisor: 60_000, suffix: 'm' },
    { limit: 86_400_000, divisor: 3_600_000, suffix: 'h' },
    { limit: 604_800_000, divisor: 86_400_000, suffix: 'd' },
  ];

  for (const unit of units) {
    if (absDiff < unit.limit) {
      const value = Math.round(diff / unit.divisor);
      const magnitude = Math.abs(value);
      if (magnitude === 0) {
        return 'now';
      }
      return value > 0 ? `${magnitude}${unit.suffix} ago` : `in ${magnitude}${unit.suffix}`;
    }
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
