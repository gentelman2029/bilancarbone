// Utility functions for data formatting and cleaning

/**
 * Format large numbers with space separators (French convention)
 * e.g., 15000000 → "15 000 000"
 */
export function formatNumber(value: number | undefined | null, decimals: number = 0): string {
  if (value === undefined || value === null || isNaN(value)) return '—';
  
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency with TND suffix
 * e.g., 15000000 → "15 000 000 TND"
 */
export function formatCurrency(value: number | undefined | null, currency: string = 'TND'): string {
  if (value === undefined || value === null || isNaN(value)) return '—';
  
  return `${formatNumber(value)} ${currency}`;
}

/**
 * Format CO2 emissions with appropriate unit
 * Automatically selects kg or tonnes based on magnitude
 */
export function formatCO2(kgValue: number | undefined | null, forceUnit?: 'kg' | 't'): string {
  if (kgValue === undefined || kgValue === null || isNaN(kgValue)) return '—';
  
  const useUnit = forceUnit || (Math.abs(kgValue) >= 1000 ? 't' : 'kg');
  
  if (useUnit === 't') {
    return `${formatNumber(kgValue / 1000, 2)} tCO₂e`;
  }
  return `${formatNumber(kgValue, 2)} kgCO₂e`;
}

/**
 * Format percentage with % suffix
 */
export function formatPercent(value: number | undefined | null, decimals: number = 1): string {
  if (value === undefined || value === null || isNaN(value)) return '—';
  
  return `${formatNumber(value, decimals)} %`;
}

/**
 * Clean string: trim whitespace, normalize spaces
 */
export function cleanString(str: string | undefined | null): string {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Clean filename: remove extra spaces, normalize special chars
 */
export function cleanFilename(filename: string | undefined | null): string {
  if (!filename) return '';
  return cleanString(filename)
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/_+/g, '_');
}

/**
 * Format date for display (French format)
 */
export function formatDate(date: string | Date | undefined | null, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '—';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-FR', options || {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Format a value with its unit, ensuring no text overlap
 */
export function formatWithUnit(value: number | undefined | null, unit: string, decimals: number = 0): string {
  if (value === undefined || value === null || isNaN(value)) return '—';
  
  // Clean the unit
  const cleanUnit = unit.trim();
  
  return `${formatNumber(value, decimals)} ${cleanUnit}`;
}
