/**
 * Centralized unit conversion for the GHG Calculator.
 * All conversion logic lives here instead of being scattered across handlers.
 */

export type UnitMultiplier = {
  label: string;
  factor: number;
};

/**
 * Unit conversion map: key is the user-selected unit variant,
 * value is the multiplier to convert to the base unit expected by ADEME factors.
 */
const UNIT_CONVERSIONS: Record<string, UnitMultiplier> = {
  // Mass
  'kg': { label: 'Kilogrammes (kg)', factor: 1 },
  'tonne': { label: 'Tonnes → ×1000 kg', factor: 1000 },
  'standard': { label: 'Unité standard (facteur ADEME)', factor: 1 },

  // Distance
  'km': { label: 'Kilomètres (km)', factor: 1 },
  '1000km': { label: 'Milliers km → ×1000', factor: 1000 },

  // Energy
  'kWh': { label: 'Kilowattheure (kWh)', factor: 1 },
  'MWh': { label: 'Mégawattheure (MWh) → ×1000', factor: 1000 },
};

/**
 * Convert a user-entered quantity to the base unit expected by emission factors.
 * @param quantity - Raw user input
 * @param userUnit - The unit variant selected by the user (e.g., 'tonne', 'MWh')
 * @returns The quantity in base units
 */
export const convertToBaseUnit = (quantity: number, userUnit: string): number => {
  const conversion = UNIT_CONVERSIONS[userUnit];
  if (!conversion) return quantity; // Unknown unit, return as-is
  return quantity * conversion.factor;
};

/**
 * Validate that a quantity is a positive finite number.
 * Returns the sanitized value or null if invalid.
 */
export const validateQuantity = (value: number | string): number | null => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || !isFinite(num) || num < 0) return null;
  return num;
};

/**
 * Get available unit options for a given category context.
 */
export const getUnitOptions = (context: 'mass' | 'distance' | 'energy' | 'standard'): { value: string; label: string }[] => {
  switch (context) {
    case 'mass':
      return [
        { value: 'kg', label: UNIT_CONVERSIONS.kg.label },
        { value: 'tonne', label: UNIT_CONVERSIONS.tonne.label },
      ];
    case 'distance':
      return [
        { value: 'km', label: UNIT_CONVERSIONS.km.label },
        { value: '1000km', label: UNIT_CONVERSIONS['1000km'].label },
      ];
    case 'energy':
      return [
        { value: 'kWh', label: UNIT_CONVERSIONS.kWh.label },
        { value: 'MWh', label: UNIT_CONVERSIONS.MWh.label },
      ];
    case 'standard':
      return [
        { value: 'standard', label: UNIT_CONVERSIONS.standard.label },
        { value: 'tonne', label: UNIT_CONVERSIONS.tonne.label },
      ];
    default:
      return [];
  }
};
