
export const formatNumber = (num: number | null | undefined) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return num.toLocaleString();
};
export const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  return `$${amount.toFixed(2)}`;
};
export const formatPercentage = (percentage: number | null | undefined) => {
  if (percentage === null || percentage === undefined || isNaN(percentage)) return '0.0%';
  return `${percentage.toFixed(1)}%`;
};
