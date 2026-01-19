// Central Emissions Calculator Service
// Conforme GHG Protocol, Base Carbone ADEME, et DEFRA

import { supabase } from '@/integrations/supabase/client';
import { GhgScope } from './types';
import { SCOPE3_CATEGORIES, Scope3SubCategory } from '@/lib/ghg/scope3Categories';
import { MONETARY_EMISSION_FACTORS, findMonetaryFactor, MonetaryEmissionFactor } from './monetaryRatios';

// Types
export interface EmissionFactorMatch {
  factor_value: number;
  factor_unit: string;
  source: string;
  source_reference?: string;
  uncertainty_percent: number;
  method: 'actual' | 'technical' | 'monetary' | 'default';
  confidence_score: number;
}

export interface CalculationInput {
  activity_type: string;
  quantity: number;
  unit: string;
  amount_eur?: number;
  ghg_scope?: GhgScope;
  ghg_category?: string;
  country_code?: string;
  subcategory?: string;
}

export interface CalculationResult {
  co2_equivalent_kg: number;
  co2_equivalent_tonnes: number;
  emission_factor: EmissionFactorMatch;
  calculation_formula: string;
  methodology: string;
  ghg_scope: GhgScope;
  ghg_category: string;
  uncertainty_kg: number;
  confidence_score: number;
}

export interface UnitConversion {
  from: string;
  to: string;
  factor: number;
}

// Unit Conversions (standard conversions)
const UNIT_CONVERSIONS: UnitConversion[] = [
  // Energy
  { from: 'kWh_PCS', to: 'kWh_PCI', factor: 0.9 },
  { from: 'MWh', to: 'kWh', factor: 1000 },
  { from: 'GJ', to: 'kWh', factor: 277.78 },
  { from: 'TJ', to: 'kWh', factor: 277780 },
  { from: 'thermie', to: 'kWh', factor: 1.163 },
  { from: 'tep', to: 'kWh', factor: 11630 },
  { from: 'BTU', to: 'kWh', factor: 0.000293 },
  
  // Volume
  { from: 'm3', to: 'litres', factor: 1000 },
  { from: 'gallon_us', to: 'litres', factor: 3.785 },
  { from: 'gallon_uk', to: 'litres', factor: 4.546 },
  
  // Mass
  { from: 'tonne', to: 'kg', factor: 1000 },
  { from: 't', to: 'kg', factor: 1000 },
  { from: 'lb', to: 'kg', factor: 0.4536 },
  
  // Distance
  { from: 'km', to: 'm', factor: 1000 },
  { from: 'mile', to: 'km', factor: 1.609 },
  { from: 'nm', to: 'km', factor: 1.852 },
];

// Default emission factors (fallback when database is empty)
const DEFAULT_EMISSION_FACTORS: Record<string, { value: number; unit: string; source: string; uncertainty: number }> = {
  // Scope 1 - Direct emissions
  'diesel': { value: 2.67, unit: 'kgCO2e/litre', source: 'ADEME Base Carbone', uncertainty: 5 },
  'essence': { value: 2.31, unit: 'kgCO2e/litre', source: 'ADEME Base Carbone', uncertainty: 5 },
  'gpl': { value: 1.67, unit: 'kgCO2e/litre', source: 'ADEME Base Carbone', uncertainty: 5 },
  'fioul': { value: 2.72, unit: 'kgCO2e/litre', source: 'ADEME Base Carbone', uncertainty: 5 },
  'gaz_naturel': { value: 2.04, unit: 'kgCO2e/m³', source: 'ADEME Base Carbone', uncertainty: 5 },
  'propane': { value: 1.53, unit: 'kgCO2e/kg', source: 'ADEME Base Carbone', uncertainty: 5 },
  'butane': { value: 1.45, unit: 'kgCO2e/kg', source: 'ADEME Base Carbone', uncertainty: 5 },
  'charbon': { value: 2.94, unit: 'kgCO2e/kg', source: 'ADEME Base Carbone', uncertainty: 8 },
  
  // Scope 2 - Electricity
  'electricite': { value: 0.42, unit: 'kgCO2e/kWh', source: 'ADEME - Mix Tunisia', uncertainty: 10 },
  'electricite_fr': { value: 0.052, unit: 'kgCO2e/kWh', source: 'ADEME - Mix France', uncertainty: 5 },
  'electricite_ue': { value: 0.233, unit: 'kgCO2e/kWh', source: 'ADEME - Mix EU', uncertainty: 10 },
  'vapeur': { value: 0.2, unit: 'kgCO2e/kWh', source: 'ADEME Base Carbone', uncertainty: 15 },
  'chaleur': { value: 0.19, unit: 'kgCO2e/kWh', source: 'ADEME Base Carbone', uncertainty: 15 },
  
  // Scope 3 - Transport
  'transport_routier': { value: 0.1, unit: 'kgCO2e/t.km', source: 'ADEME Base Carbone', uncertainty: 20 },
  'transport_maritime': { value: 0.016, unit: 'kgCO2e/t.km', source: 'ADEME Base Carbone', uncertainty: 25 },
  'transport_aerien': { value: 1.06, unit: 'kgCO2e/t.km', source: 'ADEME Base Carbone', uncertainty: 15 },
  'transport_ferroviaire': { value: 0.022, unit: 'kgCO2e/t.km', source: 'ADEME Base Carbone', uncertainty: 15 },
  
  // Scope 3 - Travel
  'voiture': { value: 0.193, unit: 'kgCO2e/km', source: 'ADEME Base Carbone', uncertainty: 20 },
  'train': { value: 0.0037, unit: 'kgCO2e/km', source: 'ADEME Base Carbone', uncertainty: 10 },
  'avion_court': { value: 0.258, unit: 'kgCO2e/km', source: 'ADEME Base Carbone', uncertainty: 10 },
  'avion_long': { value: 0.178, unit: 'kgCO2e/km', source: 'ADEME Base Carbone', uncertainty: 10 },
  
  // Scope 3 - Waste
  'dechets_menagers': { value: 0.55, unit: 'kgCO2e/kg', source: 'ADEME Base Carbone', uncertainty: 25 },
  'dechets_dangereux': { value: 1.2, unit: 'kgCO2e/kg', source: 'ADEME Base Carbone', uncertainty: 30 },
  'recyclage': { value: 0.02, unit: 'kgCO2e/kg', source: 'ADEME Base Carbone', uncertainty: 30 },
};

// Scope mapping
const CATEGORY_TO_SCOPE: Record<string, GhgScope> = {
  // Scope 1
  'diesel': 'scope1',
  'essence': 'scope1',
  'gpl': 'scope1',
  'fioul': 'scope1',
  'gaz_naturel': 'scope1',
  'propane': 'scope1',
  'butane': 'scope1',
  'charbon': 'scope1',
  'fluides_frigorigenes': 'scope1',
  
  // Scope 2
  'electricite': 'scope2',
  'electricite_fr': 'scope2',
  'electricite_ue': 'scope2',
  'vapeur': 'scope2',
  'chaleur': 'scope2',
  
  // Scope 3
  'transport_routier': 'scope3',
  'transport_maritime': 'scope3',
  'transport_aerien': 'scope3',
  'transport_ferroviaire': 'scope3',
  'achats_biens': 'scope3',
  'achats_services': 'scope3',
  'deplacements_domicile_travail': 'scope3',
  'deplacements_professionnels': 'scope3',
  'dechets': 'scope3',
};

class EmissionsCalculatorService {
  
  /**
   * Main calculation method - calculates CO2e from activity data
   */
  async calculate(input: CalculationInput): Promise<CalculationResult> {
    // 1. Normalize units if needed
    const normalizedQuantity = this.convertUnit(input.quantity, input.unit);
    
    // 2. Match to emission factor
    const emissionFactor = await this.matchEmissionFactor(input);
    
    // 3. Determine GHG scope and category
    const ghgScope = input.ghg_scope || this.determineScope(input.activity_type, input.ghg_category);
    const ghgCategory = input.ghg_category || this.determineCategory(input.activity_type);
    
    // 4. Calculate emissions
    let co2Kg: number;
    let formula: string;
    
    if (emissionFactor.method === 'monetary' && input.amount_eur) {
      co2Kg = input.amount_eur * emissionFactor.factor_value;
      formula = `${input.amount_eur} € × ${emissionFactor.factor_value} ${emissionFactor.factor_unit} = ${co2Kg.toFixed(2)} kgCO₂e`;
    } else {
      co2Kg = normalizedQuantity.value * emissionFactor.factor_value;
      formula = `${normalizedQuantity.value} ${normalizedQuantity.unit} × ${emissionFactor.factor_value} ${emissionFactor.factor_unit} = ${co2Kg.toFixed(2)} kgCO₂e`;
    }
    
    // 5. Calculate uncertainty
    const uncertaintyKg = co2Kg * (emissionFactor.uncertainty_percent / 100);
    
    return {
      co2_equivalent_kg: co2Kg,
      co2_equivalent_tonnes: co2Kg / 1000,
      emission_factor: emissionFactor,
      calculation_formula: formula,
      methodology: this.getMethodology(emissionFactor.method),
      ghg_scope: ghgScope,
      ghg_category: ghgCategory,
      uncertainty_kg: uncertaintyKg,
      confidence_score: emissionFactor.confidence_score,
    };
  }
  
  /**
   * Batch calculation for multiple activities
   */
  async calculateBatch(inputs: CalculationInput[]): Promise<CalculationResult[]> {
    return Promise.all(inputs.map(input => this.calculate(input)));
  }
  
  /**
   * Match activity to best emission factor
   */
  async matchEmissionFactor(input: CalculationInput): Promise<EmissionFactorMatch> {
    // Try database first
    const dbFactor = await this.fetchFactorFromDatabase(input);
    if (dbFactor) return dbFactor;
    
    // Try Scope 3 categories
    const scope3Factor = this.matchScope3Factor(input);
    if (scope3Factor) return scope3Factor;
    
    // Try monetary ratios for services
    if (input.amount_eur && input.activity_type) {
      const monetaryFactor = findMonetaryFactor(input.activity_type, input.subcategory);
      if (monetaryFactor) {
        return {
          factor_value: monetaryFactor.factor_value,
          factor_unit: monetaryFactor.source,
          source: 'kgCO2e/€',
          uncertainty_percent: 25,
          method: 'monetary',
          confidence_score: 0.7,
        };
      }
    }
    
    // Use default factors
    const category = input.ghg_category || input.activity_type;
    const defaultFactor = DEFAULT_EMISSION_FACTORS[category];
    
    if (defaultFactor) {
      return {
        factor_value: defaultFactor.value,
        factor_unit: defaultFactor.unit,
        source: defaultFactor.source,
        uncertainty_percent: defaultFactor.uncertainty,
        method: 'default',
        confidence_score: 0.8,
      };
    }
    
    // Fallback to generic factor
    return {
      factor_value: 0.5,
      factor_unit: 'kgCO2e/unit',
      source: 'Estimation générique',
      uncertainty_percent: 50,
      method: 'default',
      confidence_score: 0.3,
    };
  }
  
  /**
   * Fetch emission factor from database
   */
  private async fetchFactorFromDatabase(input: CalculationInput): Promise<EmissionFactorMatch | null> {
    try {
      const category = input.ghg_category || input.activity_type;
      const countryCode = input.country_code || 'TN';
      
      const { data, error } = await supabase
        .from('emission_factors_local')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .or(`country_code.eq.${countryCode},country_code.eq.GLOBAL`)
        .order('is_default', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error || !data) return null;
      
      return {
        factor_value: data.factor_value,
        factor_unit: data.factor_unit,
        source: data.source_name,
        source_reference: data.source_reference || undefined,
        uncertainty_percent: 10,
        method: 'actual',
        confidence_score: 0.95,
      };
    } catch (error) {
      console.error('Error fetching emission factor:', error);
      return null;
    }
  }
  
  /**
   * Match from Scope 3 categories
   */
  private matchScope3Factor(input: CalculationInput): EmissionFactorMatch | null {
    for (const category of SCOPE3_CATEGORIES) {
      for (const subcat of category.subcategories) {
        if (
          subcat.id === input.ghg_category ||
          subcat.id === input.activity_type ||
          subcat.name.toLowerCase().includes(input.activity_type?.toLowerCase() || '')
        ) {
          // Prefer actual > technical > monetary
          const factor = subcat.emissionFactors.actual ||
                        subcat.emissionFactors.technical ||
                        subcat.emissionFactors.monetary;
          
          if (factor) {
            return {
              factor_value: factor.value,
              factor_unit: factor.unit,
              source: factor.source,
              uncertainty_percent: factor.uncertainty,
              method: subcat.emissionFactors.actual ? 'actual' : 
                     subcat.emissionFactors.technical ? 'technical' : 'monetary',
              confidence_score: subcat.emissionFactors.actual ? 0.9 : 
                               subcat.emissionFactors.technical ? 0.85 : 0.7,
            };
          }
        }
      }
    }
    return null;
  }
  
  /**
   * Convert units to standard format
   */
  convertUnit(quantity: number, fromUnit: string): { value: number; unit: string } {
    const normalizedUnit = fromUnit.toLowerCase().trim();
    
    for (const conversion of UNIT_CONVERSIONS) {
      if (conversion.from.toLowerCase() === normalizedUnit) {
        return {
          value: quantity * conversion.factor,
          unit: conversion.to,
        };
      }
    }
    
    return { value: quantity, unit: fromUnit };
  }
  
  /**
   * Determine GHG scope from category
   */
  determineScope(activityType?: string, category?: string): GhgScope {
    const key = category || activityType || '';
    return CATEGORY_TO_SCOPE[key] || 'scope3';
  }
  
  /**
   * Determine GHG category from activity type
   */
  determineCategory(activityType?: string): string {
    if (!activityType) return 'autres';
    
    const normalizedType = activityType.toLowerCase();
    
    // Direct matches
    if (DEFAULT_EMISSION_FACTORS[normalizedType]) {
      return normalizedType;
    }
    
    // Fuzzy matching
    if (normalizedType.includes('diesel') || normalizedType.includes('gazole')) return 'diesel';
    if (normalizedType.includes('essence')) return 'essence';
    if (normalizedType.includes('electri') || normalizedType.includes('kwh')) return 'electricite';
    if (normalizedType.includes('gaz')) return 'gaz_naturel';
    if (normalizedType.includes('fioul') || normalizedType.includes('mazout')) return 'fioul';
    if (normalizedType.includes('transport') || normalizedType.includes('livraison')) return 'transport_routier';
    if (normalizedType.includes('avion') || normalizedType.includes('flight')) return 'avion_court';
    if (normalizedType.includes('train')) return 'train';
    
    return 'autres';
  }
  
  /**
   * Get methodology description
   */
  private getMethodology(method: string): string {
    const methodologies: Record<string, string> = {
      'actual': 'GHG Protocol - Données réelles (Tier 1)',
      'technical': 'GHG Protocol - Données techniques (Tier 2)',
      'monetary': 'GHG Protocol - Ratios monétaires (Tier 3)',
      'default': 'GHG Protocol - Facteurs par défaut',
    };
    return methodologies[method] || 'GHG Protocol';
  }
  
  /**
   * Get all available emission factors
   */
  getDefaultFactors(): Record<string, { value: number; unit: string; source: string }> {
    return DEFAULT_EMISSION_FACTORS;
  }
  
  /**
   * Get unit conversions
   */
  getUnitConversions(): UnitConversion[] {
    return UNIT_CONVERSIONS;
  }
  
  /**
   * Calculate scope totals from activities
   */
  async calculateScopeTotals(activities: Array<{ 
    ghg_scope: string; 
    co2_equivalent_kg?: number | null 
  }>): Promise<{ scope1: number; scope2: number; scope3: number; total: number }> {
    const totals = {
      scope1: 0,
      scope2: 0,
      scope3: 0,
      total: 0,
    };
    
    for (const activity of activities) {
      const co2 = activity.co2_equivalent_kg || 0;
      totals.total += co2;
      
      if (activity.ghg_scope === 'scope1') totals.scope1 += co2;
      else if (activity.ghg_scope === 'scope2') totals.scope2 += co2;
      else if (activity.ghg_scope === 'scope3') totals.scope3 += co2;
    }
    
    return totals;
  }
}

export const emissionsCalculator = new EmissionsCalculatorService();
