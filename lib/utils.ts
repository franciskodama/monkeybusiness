import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const colors = [
  { name: 'BLUE', code: '#1E90FF', foreground: '#FFFFFF' },
  { name: 'GREEN', code: '#32CD32', foreground: '#FFFFFF' },
  { name: 'RED', code: '#FF4500', foreground: '#FFFFFF' },
  { name: 'YELLOW', code: '#FFD700', foreground: '#000000' },
  { name: 'PURPLE', code: '#8A2BE2', foreground: '#FFFFFF' },
  { name: 'ORANGE', code: '#FFA500', foreground: '#000000' },
  { name: 'PINK', code: '#FF69B4', foreground: '#000000' },
  { name: 'TEAL', code: '#20B2AA', foreground: '#FFFFFF' },
  { name: 'GRAY', code: '#808080', foreground: '#FFFFFF' },
  { name: 'BROWN', code: '#A52A2A', foreground: '#FFFFFF' },
  { name: 'BLACK', code: '#000000', foreground: '#FFFFFF' }
];

export const getColorCode = (colorName: string) => {
  const color = colors.find(
    (c) => c.name.toUpperCase() === colorName.toUpperCase()
  );

  return {
    color: color?.foreground || '#FFFFFF',
    backgroundColor: color?.code || '#808080'
  };
};

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export const getSourceTotals = (transactions: any[]) => {
  const totals: Record<string, number> = {};

  transactions.forEach((tx) => {
    // We only care about spending (positive amounts in our system)
    // and we exclude income if you want purely a "Credit Card" breakdown
    if (tx.amount > 0 && tx.source) {
      totals[tx.source] = (totals[tx.source] || 0) + tx.amount;
    }
  });

  return Object.entries(totals).sort((a, b) => b[1] - a[1]); // Highest spend first
};
