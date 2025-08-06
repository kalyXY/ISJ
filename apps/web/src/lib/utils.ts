export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CD', {
    style: 'currency',
    currency: 'CDF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('fr-CD', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
}
