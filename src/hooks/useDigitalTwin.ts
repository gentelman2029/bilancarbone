import { useState, useMemo, useCallback, useRef, useEffect } from "react";

// =====================================================
// CONSTANTS & PRICING MODELS (DEFAULTS - User can override)
// =====================================================

// Installation costs
const COST_PER_KWC = 850; // TND per kWc
const COST_PER_KWH_BATTERY = 450; // TND per kWh
const TRACKER_ADDITIONAL_COST = 120; // TND per kWc for tracker system
const DEFAULT_ANNUAL_OM_PERCENT = 1.5; // 1.5% of CAPEX per year for O&M
const DEFAULT_BATTERY_LIFETIME = 10;
const BATTERY_REPLACEMENT_COST_FACTOR = 0.5; // 50% of original battery cost

// System performance
const TRACKER_BONUS = 1.15; // 15% efficiency boost
const SUBSIDY_REDUCTION = 0.3; // 30% CAPEX reduction with FTE subsidy
const SOLAR_HOURS_PER_YEAR = 1600; // Average irradiation hours in Tunisia
const DEFAULT_PANEL_LIFETIME = 25;
const PANEL_DEGRADATION_RATE = 0.007; // 0.7% per year

// Emissions
const CO2_INTENSITY = 0.48; // kg CO2/kWh (STEG mix)

// Fiscal defaults
const DEFAULT_CORPORATE_TAX_RATE = 15; // 15% corporate tax in Tunisia
const DEFAULT_DEPRECIATION_YEARS = 7; // Accelerated depreciation for renewable energy
const DEFAULT_DISCOUNT_RATE = 8; // 8% WACC

// Weather risk
const P90_REDUCTION_FACTOR = 0.95; // 5% reduction for P90 scenario

// =====================================================
// STEG TARIFF STRUCTURE (2024)
// =====================================================
interface STEGTariff {
  peak: number;     // Pointe (18h-22h)
  day: number;      // Jour (7h-18h)
  night: number;    // Nuit (22h-7h)
  peakHours: number;    // Hours per day
  dayHours: number;
  nightHours: number;
}

// TND/kWh for each voltage regime
const STEG_TARIFFS: Record<'MT' | 'HT', STEGTariff> = {
  MT: { // Moyenne Tension
    peak: 0.285,
    day: 0.195,
    night: 0.095,
    peakHours: 4,
    dayHours: 11,
    nightHours: 9
  },
  HT: { // Haute Tension
    peak: 0.245,
    day: 0.175,
    night: 0.085,
    peakHours: 4,
    dayHours: 11,
    nightHours: 9
  }
};

// Energy distribution throughout the day (solar production pattern)
const SOLAR_PRODUCTION_PROFILE = {
  peakPercent: 0.15,  // 15% of production during peak (18h-22h, only 18h-sunset)
  dayPercent: 0.80,   // 80% during day hours (7h-18h)
  nightPercent: 0.05  // 5% (early morning before 7h)
};

// With battery, we can shift consumption
const BATTERY_SHIFT_PROFILE = {
  peakShiftPercent: 0.6,  // 60% of battery can cover peak consumption
  nightChargePercent: 0.3 // 30% charging at night rates
};

// =====================================================
// CBAM PRICE PROJECTIONS (EUR per tonne CO2)
// =====================================================
const CBAM_PRICE_PROJECTIONS: Record<number, number> = {
  2024: 50,
  2025: 55,
  2026: 65,
  2027: 75,
  2028: 85,
  2029: 95,
  2030: 100,
  2031: 105,
  2032: 110,
  2033: 115,
  2034: 120,
  2035: 125,
  2036: 130
};

const getCBAMPrice = (year: number): number => {
  if (year <= 2024) return CBAM_PRICE_PROJECTIONS[2024];
  if (year >= 2036) return CBAM_PRICE_PROJECTIONS[2036];
  return CBAM_PRICE_PROJECTIONS[year] || 100;
};

// =====================================================
// WEATHER VARIABILITY MODEL
// =====================================================
interface WeatherScenario {
  name: string;
  productionFactor: number;
  probability: number;
}

const WEATHER_SCENARIOS: WeatherScenario[] = [
  { name: 'excellent', productionFactor: 1.15, probability: 0.1 },
  { name: 'good', productionFactor: 1.05, probability: 0.25 },
  { name: 'normal', productionFactor: 1.0, probability: 0.35 },
  { name: 'below_average', productionFactor: 0.92, probability: 0.20 },
  { name: 'poor', productionFactor: 0.85, probability: 0.10 }
];

// Deterministic weather pattern for projection (varies by year for realism)
const getWeatherFactor = (yearIndex: number, useP90: boolean): number => {
  if (useP90) return P90_REDUCTION_FACTOR; // Conservative scenario
  // Create a pseudo-random but deterministic pattern for P50
  const patterns = [1.0, 1.05, 0.95, 1.08, 0.92, 1.0, 0.98, 1.03, 0.94, 1.02, 1.0];
  return patterns[yearIndex % patterns.length];
};

// =====================================================
// FISCAL AMORTIZATION MODEL (Dynamic)
// =====================================================
interface FiscalBenefits {
  annualDepreciation: number;
  taxSavings: number;
  depreciationYears: number;
}

const calculateFiscalBenefits = (
  investment: number, 
  taxRate: number, 
  depreciationYears: number
): FiscalBenefits => {
  const annualDepreciation = investment / depreciationYears;
  const taxSavings = annualDepreciation * (taxRate / 100);
  
  return {
    annualDepreciation,
    taxSavings,
    depreciationYears
  };
};

// =====================================================
// INTERFACES
// =====================================================

export interface AdvancedHypotheses {
  corporateTaxRate: number;      // % (default 15)
  discountRate: number;          // WACC % (default 8)
  omPercentage: number;          // O&M as % of CAPEX (default 1.5)
  panelLifetime: number;         // years (default 25)
  batteryLifetime: number;       // years (default 10)
  depreciationYears: number;     // fiscal years (default 7)
  weatherScenario: 'P50' | 'P90'; // P50 = standard, P90 = conservative
}

export interface DigitalTwinConfig {
  solarPower: number;
  hasTracker: boolean;
  batteryCapacity: number;
  withSubsidy: boolean;
  inflationRate: number;
  energyPriceEscalation: number;
  voltageRegime: 'MT' | 'HT';
  includeWeatherVariability: boolean;
  includeFiscalBenefits: boolean;
  // Advanced hypotheses
  hypotheses: AdvancedHypotheses;
}

export interface DigitalTwinMetrics {
  // Basic metrics
  effectiveSolar: number;
  annualSavings: number;
  baseInvestment: number;
  investment: number;
  payback: number;
  co2Avoided: number;
  lifetimeSavings: number;
  
  // Advanced metrics
  lcoe: number; // Including O&M
  lcoeWithoutOM: number;
  annualOMCost: number;
  totalOMCost: number;
  van: number; // Net Present Value (VAN) over 25 years at 8% discount rate
  
  // CBAM
  cbamSavingsYear1: number;
  cbamSavingsLifetime: number;
  
  // Tariff breakdown
  savingsBreakdown: {
    peakSavings: number;
    daySavings: number;
    nightSavings: number;
    batteryPeakShiftSavings: number;
  };
  
  // Fiscal
  fiscalBenefits: FiscalBenefits;
  
  // Risk
  weatherAdjustedSavings: number;
  savingsRange: {
    pessimistic: number;
    expected: number;
    optimistic: number;
  };
}

export interface ProjectionDataPoint {
  year: string;
  cashFlow: number;
  cumulative: number;
  degradation: number;
  cbamSavings: number;
  weatherFactor: number;
  omCost: number;
  fiscalSavings: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// =====================================================
// VALIDATION
// =====================================================

const validateConfig = (config: DigitalTwinConfig): ValidationResult => {
  const errors: string[] = [];

  if (config.solarPower < 0) {
    errors.push("La puissance solaire ne peut pas être négative");
  }
  if (config.solarPower === 0 && config.batteryCapacity === 0) {
    errors.push("Veuillez configurer au moins une source d'énergie");
  }
  if (config.batteryCapacity < 0) {
    errors.push("La capacité batterie ne peut pas être négative");
  }
  if (config.inflationRate < 0 || config.inflationRate > 20) {
    errors.push("Le taux d'inflation doit être entre 0% et 20%");
  }
  if (config.energyPriceEscalation < -5 || config.energyPriceEscalation > 15) {
    errors.push("L'escalade du prix de l'énergie doit être entre -5% et 15%");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// =====================================================
// CORE CALCULATIONS
// =====================================================

const calculateMetrics = (config: DigitalTwinConfig): DigitalTwinMetrics => {
  const { 
    solarPower, hasTracker, batteryCapacity, withSubsidy, 
    voltageRegime, includeFiscalBenefits, includeWeatherVariability,
    hypotheses
  } = config;

  // Extract user-defined hypotheses
  const omPercentage = hypotheses.omPercentage / 100;
  const panelLifetime = hypotheses.panelLifetime;
  const batteryLifetime = hypotheses.batteryLifetime;
  const depreciationYears = hypotheses.depreciationYears;
  const discountRate = hypotheses.discountRate / 100;
  const corporateTaxRate = hypotheses.corporateTaxRate;
  const useP90 = hypotheses.weatherScenario === 'P90';

  const tariff = STEG_TARIFFS[voltageRegime];
  const trackerBonus = hasTracker ? TRACKER_BONUS : 1;
  const effectiveSolar = solarPower * trackerBonus;
  
  // Apply P90 reduction if conservative scenario selected
  const weatherReductionFactor = useP90 ? P90_REDUCTION_FACTOR : 1.0;
  
  // Annual energy production (kWh)
  const annualEnergy = effectiveSolar * SOLAR_HOURS_PER_YEAR * weatherReductionFactor;
  
  // Calculate savings by time-of-use (TOU)
  const peakProduction = annualEnergy * SOLAR_PRODUCTION_PROFILE.peakPercent;
  const dayProduction = annualEnergy * SOLAR_PRODUCTION_PROFILE.dayPercent;
  const nightProduction = annualEnergy * SOLAR_PRODUCTION_PROFILE.nightPercent;
  
  const peakSavings = peakProduction * tariff.peak;
  const daySavings = dayProduction * tariff.day;
  const nightSavings = nightProduction * tariff.night;
  
  // Battery value: shifting cheap night energy to expensive peak
  const batteryDailyShift = Math.min(batteryCapacity * 0.8, annualEnergy / 365 * 0.3);
  const batteryAnnualShift = batteryDailyShift * 365 * BATTERY_SHIFT_PROFILE.peakShiftPercent;
  const batteryPeakShiftSavings = batteryAnnualShift * (tariff.peak - tariff.night);
  
  const savingsBreakdown = {
    peakSavings,
    daySavings,
    nightSavings,
    batteryPeakShiftSavings
  };
  
  const annualSavings = peakSavings + daySavings + nightSavings + batteryPeakShiftSavings;
  
  // Investment calculation
  const solarCost = solarPower * COST_PER_KWC;
  const trackerCost = hasTracker ? solarPower * TRACKER_ADDITIONAL_COST : 0;
  const batteryCost = batteryCapacity * COST_PER_KWH_BATTERY;
  const baseInvestment = solarCost + trackerCost + batteryCost;
  const investment = withSubsidy ? baseInvestment * (1 - SUBSIDY_REDUCTION) : baseInvestment;
  
  // O&M costs (user-defined percentage)
  const annualOMCost = baseInvestment * omPercentage;
  const totalOMCost = annualOMCost * panelLifetime;
  
  // Payback (simple, without inflation)
  const netAnnualCashflow = annualSavings - annualOMCost;
  const payback = netAnnualCashflow > 0 ? investment / netAnnualCashflow : Infinity;
  
  // LCOE calculation (with and without O&M)
  const totalLifetimeEnergy = annualEnergy * panelLifetime * 0.88; // Average degradation factor
  const lcoeWithoutOM = totalLifetimeEnergy > 0 ? (investment / totalLifetimeEnergy) * 1000 : 0;
  const lcoe = totalLifetimeEnergy > 0 ? ((investment + totalOMCost) / totalLifetimeEnergy) * 1000 : 0;
  
  // CO2 avoided per year (tonnes)
  const co2Avoided = (annualEnergy * CO2_INTENSITY) / 1000;
  
  // CBAM savings (year 1 and lifetime with price escalation)
  const cbamPriceYear1 = getCBAMPrice(2026) / 1000;
  const cbamSavingsYear1 = annualEnergy * CO2_INTENSITY * cbamPriceYear1;
  
  let cbamSavingsLifetime = 0;
  for (let i = 0; i < panelLifetime; i++) {
    const yearDegradation = Math.pow(1 - PANEL_DEGRADATION_RATE, i);
    const yearEnergy = annualEnergy * yearDegradation;
    const cbamPrice = getCBAMPrice(2026 + i) / 1000;
    cbamSavingsLifetime += yearEnergy * CO2_INTENSITY * cbamPrice;
  }
  
  // Fiscal benefits (user-defined tax rate and depreciation period)
  const fiscalBenefits = calculateFiscalBenefits(investment, corporateTaxRate, depreciationYears);
  
  // Weather risk analysis
  const expectedProduction = WEATHER_SCENARIOS.reduce(
    (sum, s) => sum + s.productionFactor * s.probability, 0
  );
  const weatherAdjustedSavings = includeWeatherVariability 
    ? annualSavings * expectedProduction 
    : annualSavings;
  
  const pessimisticFactor = WEATHER_SCENARIOS.find(s => s.name === 'poor')?.productionFactor || 0.85;
  const optimisticFactor = WEATHER_SCENARIOS.find(s => s.name === 'excellent')?.productionFactor || 1.15;
  
  // Lifetime savings (with all adjustments including battery replacement)
  let lifetimeSavings = -investment;
  for (let i = 0; i < panelLifetime; i++) {
    const yearDegradation = Math.pow(1 - PANEL_DEGRADATION_RATE, i);
    const yearSavings = annualSavings * yearDegradation - annualOMCost;
    const fiscalYear = i < depreciationYears && includeFiscalBenefits ? fiscalBenefits.taxSavings : 0;
    // Battery replacement at batteryLifetime years (re-vamping)
    const batteryReplacement = i === batteryLifetime ? batteryCapacity * COST_PER_KWH_BATTERY * BATTERY_REPLACEMENT_COST_FACTOR : 0;
    lifetimeSavings += yearSavings + fiscalYear - batteryReplacement;
  }

  // VAN (Net Present Value) with user-defined discount rate
  let van = -investment;
  for (let t = 1; t <= panelLifetime; t++) {
    const yearDegradation = Math.pow(1 - PANEL_DEGRADATION_RATE, t - 1);
    const yearSavings = annualSavings * yearDegradation;
    const yearOMCost = annualOMCost;
    const fiscalYear = t <= depreciationYears && includeFiscalBenefits ? fiscalBenefits.taxSavings : 0;
    const batteryReplacement = t === batteryLifetime + 1 ? batteryCapacity * COST_PER_KWH_BATTERY * BATTERY_REPLACEMENT_COST_FACTOR : 0;
    
    const annualFlux = yearSavings - yearOMCost + fiscalYear - batteryReplacement;
    van += annualFlux / Math.pow(1 + discountRate, t);
  }

  return {
    effectiveSolar,
    annualSavings,
    baseInvestment,
    investment,
    payback,
    co2Avoided,
    lifetimeSavings,
    lcoe,
    lcoeWithoutOM,
    annualOMCost,
    totalOMCost,
    van,
    cbamSavingsYear1,
    cbamSavingsLifetime,
    savingsBreakdown,
    fiscalBenefits,
    weatherAdjustedSavings,
    savingsRange: {
      pessimistic: annualSavings * pessimisticFactor,
      expected: annualSavings * expectedProduction,
      optimistic: annualSavings * optimisticFactor
    }
  };
};

// =====================================================
// PROJECTION DATA GENERATION
// =====================================================

const generateProjectionData = (
  config: DigitalTwinConfig,
  metrics: DigitalTwinMetrics
): ProjectionDataPoint[] => {
  const { 
    inflationRate, energyPriceEscalation, batteryCapacity, 
    includeWeatherVariability, includeFiscalBenefits,
    hypotheses
  } = config;
  const { investment, annualSavings, annualOMCost, fiscalBenefits } = metrics;
  
  const inflation = inflationRate / 100;
  const energyEscalation = energyPriceEscalation / 100;
  const batteryLifetime = hypotheses.batteryLifetime;
  const depreciationYears = hypotheses.depreciationYears;
  const useP90 = hypotheses.weatherScenario === 'P90';

  return Array.from({ length: 11 }, (_, i) => {
    const year = 2026 + i;
    
    // Apply panel degradation
    const degradationFactor = Math.pow(1 - PANEL_DEGRADATION_RATE, i);
    
    // Weather variability (deterministic for chart consistency)
    const weatherFactor = includeWeatherVariability ? getWeatherFactor(i, useP90) : 1.0;
    
    // Energy price escalation (distinct from general inflation)
    const energyPriceFactor = Math.pow(1 + energyEscalation, i);
    
    // O&M cost with inflation
    const omCostInflated = annualOMCost * Math.pow(1 + inflation, i);
    
    // Battery replacement cost at batteryLifetime years (re-vamping)
    const batteryReplacementCost = i === batteryLifetime 
      ? batteryCapacity * COST_PER_KWH_BATTERY * BATTERY_REPLACEMENT_COST_FACTOR * Math.pow(1 + inflation, i) * 0.7
      : 0;
    
    // Fiscal savings (depreciation)
    const fiscalSavings = i < depreciationYears && includeFiscalBenefits 
      ? fiscalBenefits.taxSavings 
      : 0;
    
    // CBAM savings for this year
    const cbamPrice = getCBAMPrice(year) / 1000;
    const yearlyEnergy = metrics.effectiveSolar * SOLAR_HOURS_PER_YEAR * degradationFactor * weatherFactor;
    const cbamSavings = yearlyEnergy * CO2_INTENSITY * cbamPrice;
    
    // Year 0 is initial investment
    if (i === 0) {
      return {
        year: year.toString(),
        cashFlow: Math.round(-investment / 1000),
        cumulative: Math.round(-investment / 1000),
        degradation: 100,
        cbamSavings: Math.round(cbamSavings),
        weatherFactor: Math.round(weatherFactor * 100),
        omCost: Math.round(omCostInflated / 1000),
        fiscalSavings: Math.round(fiscalSavings / 1000)
      };
    }
    
    // Calculate adjusted savings
    const adjustedSavings = annualSavings * degradationFactor * weatherFactor * energyPriceFactor;
    const netCashFlow = adjustedSavings - omCostInflated - batteryReplacementCost + fiscalSavings + cbamSavings;
    const cashFlow = netCashFlow / 1000;
    
    // Calculate cumulative (sum of all previous cash flows)
    let cumulative = -investment / 1000;
    for (let j = 1; j <= i; j++) {
      const degFactor = Math.pow(1 - PANEL_DEGRADATION_RATE, j);
      const wFactor = includeWeatherVariability ? getWeatherFactor(j, useP90) : 1.0;
      const ePriceFactor = Math.pow(1 + energyEscalation, j);
      const omCost = annualOMCost * Math.pow(1 + inflation, j);
      const battReplacement = j === batteryLifetime 
        ? batteryCapacity * COST_PER_KWH_BATTERY * BATTERY_REPLACEMENT_COST_FACTOR * Math.pow(1 + inflation, j) * 0.7
        : 0;
      const fiscal = j < depreciationYears && includeFiscalBenefits ? fiscalBenefits.taxSavings : 0;
      const yearCBAM = getCBAMPrice(2026 + j) / 1000 * metrics.effectiveSolar * SOLAR_HOURS_PER_YEAR * degFactor * wFactor * CO2_INTENSITY;
      
      const yearSavings = annualSavings * degFactor * wFactor * ePriceFactor;
      cumulative += (yearSavings - omCost - battReplacement + fiscal + yearCBAM) / 1000;
    }
    
    return {
      year: year.toString(),
      cashFlow: Math.round(cashFlow),
      cumulative: Math.round(cumulative),
      degradation: Math.round(degradationFactor * 100),
      cbamSavings: Math.round(cbamSavings),
      weatherFactor: Math.round(weatherFactor * 100),
      omCost: Math.round(omCostInflated / 1000),
      fiscalSavings: Math.round(fiscalSavings / 1000)
    };
  });
};

// =====================================================
// AI RECOMMENDATIONS
// =====================================================

const generateAIRecommendation = (
  config: DigitalTwinConfig,
  metrics: DigitalTwinMetrics
): { type: 'optimization' | 'warning' | 'info'; message: string } => {
  const { solarPower, batteryCapacity, hasTracker, withSubsidy, voltageRegime } = config;
  const { payback, cbamSavingsLifetime, savingsBreakdown, lcoe, annualOMCost } = metrics;

  // High peak savings potential without battery
  if (savingsBreakdown.peakSavings > savingsBreakdown.batteryPeakShiftSavings * 3 && batteryCapacity < solarPower * 0.2) {
    return {
      type: 'optimization',
      message: `Vos économies tarifaires "Pointe" (${Math.round(savingsBreakdown.peakSavings).toLocaleString('fr-FR')} TND/an) pourraient augmenter de 40% avec un stockage de ${Math.round(solarPower * 0.25)} kWh, permettant l'effacement des heures 18h-22h.`
    };
  }

  // Battery too small relative to solar
  if (solarPower > 1000 && batteryCapacity < solarPower * 0.3) {
    const additionalBattery = Math.round(solarPower * 0.1);
    const additionalShiftSavings = additionalBattery * 0.8 * 365 * 0.6 * (STEG_TARIFFS[voltageRegime].peak - STEG_TARIFFS[voltageRegime].night);
    return {
      type: 'optimization',
      message: `Augmenter le stockage de ${additionalBattery} kWh générerait ${Math.round(additionalShiftSavings).toLocaleString('fr-FR')} TND/an supplémentaires via le décalage pointe/nuit (tarif ${voltageRegime}).`
    };
  }

  // No tracker with high solar
  if (solarPower > 2000 && !hasTracker) {
    return {
      type: 'optimization',
      message: `Pour ${solarPower} kWc, l'ajout d'un tracker (+15% rendement, +${Math.round(solarPower * TRACKER_ADDITIONAL_COST).toLocaleString('fr-FR')} TND) réduirait le payback de ${(payback * 0.12).toFixed(1)} années et le LCOE à ${(lcoe * 0.87).toFixed(0)} TND/MWh.`
    };
  }

  // Missing subsidy
  if (!withSubsidy && metrics.investment > 500000) {
    return {
      type: 'warning',
      message: `Subvention FTE disponible : -${Math.round(metrics.baseInvestment * 0.3).toLocaleString('fr-FR')} TND sur le CAPEX. Payback réduit à ${((metrics.investment * 0.7) / (metrics.annualSavings - annualOMCost)).toFixed(1)} ans.`
    };
  }

  // CBAM impact info
  if (cbamSavingsLifetime > 50000) {
    return {
      type: 'info',
      message: `Impact CBAM 2026-2036 : ${Math.round(cbamSavingsLifetime).toLocaleString('fr-FR')} € d'économies sur vos exportations UE, avec un prix carbone passant de 65€ à 130€/tCO2.`
    };
  }

  // Default recommendation with tariff insight
  return {
    type: 'optimization',
    message: `Régime ${voltageRegime} : maximisez l'autoconsommation en heures "Jour" (${(STEG_TARIFFS[voltageRegime].day * 1000).toFixed(0)} millimes/kWh) et utilisez le stockage pour éviter la "Pointe" (${(STEG_TARIFFS[voltageRegime].peak * 1000).toFixed(0)} millimes/kWh).`
  };
};

// =====================================================
// HOOK EXPORT
// =====================================================

export const useDigitalTwin = () => {
  // Configuration states
  const [solarPower, setSolarPower] = useState<number[]>([1500]);
  const [hasTracker, setHasTracker] = useState(false);
  const [batteryCapacity, setBatteryCapacity] = useState<number[]>([500]);
  const [withSubsidy, setWithSubsidy] = useState(true);
  const [inflationRate, setInflationRate] = useState("5");
  const [energyPriceEscalation, setEnergyPriceEscalation] = useState("6");
  const [voltageRegime, setVoltageRegime] = useState<'MT' | 'HT'>('MT');
  const [includeWeatherVariability, setIncludeWeatherVariability] = useState(true);
  const [includeFiscalBenefits, setIncludeFiscalBenefits] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  // Advanced hypotheses states
  const [corporateTaxRate, setCorporateTaxRate] = useState(DEFAULT_CORPORATE_TAX_RATE.toString());
  const [discountRate, setDiscountRate] = useState(DEFAULT_DISCOUNT_RATE.toString());
  const [omPercentage, setOmPercentage] = useState(DEFAULT_ANNUAL_OM_PERCENT.toString());
  const [panelLifetime, setPanelLifetime] = useState(DEFAULT_PANEL_LIFETIME.toString());
  const [batteryLifetime, setBatteryLifetimeState] = useState(DEFAULT_BATTERY_LIFETIME.toString());
  const [depreciationYears, setDepreciationYears] = useState(DEFAULT_DEPRECIATION_YEARS.toString());
  const [weatherScenario, setWeatherScenario] = useState<'P50' | 'P90'>('P50');

  // Track previous metrics for sensitivity insight
  const previousMetricsRef = useRef<{ payback: number; lcoe: number; van: number } | null>(null);
  const [changedParameter, setChangedParameter] = useState<string | null>(null);

  // Build hypotheses object
  const hypotheses: AdvancedHypotheses = useMemo(() => ({
    corporateTaxRate: Math.max(0, Math.min(35, Number(corporateTaxRate) || DEFAULT_CORPORATE_TAX_RATE)),
    discountRate: Math.max(1, Math.min(20, Number(discountRate) || DEFAULT_DISCOUNT_RATE)),
    omPercentage: Math.max(0.5, Math.min(3, Number(omPercentage) || DEFAULT_ANNUAL_OM_PERCENT)),
    panelLifetime: Math.max(15, Math.min(35, Number(panelLifetime) || DEFAULT_PANEL_LIFETIME)),
    batteryLifetime: Math.max(5, Math.min(15, Number(batteryLifetime) || DEFAULT_BATTERY_LIFETIME)),
    depreciationYears: Math.max(3, Math.min(15, Number(depreciationYears) || DEFAULT_DEPRECIATION_YEARS)),
    weatherScenario
  }), [corporateTaxRate, discountRate, omPercentage, panelLifetime, batteryLifetime, depreciationYears, weatherScenario]);

  // Build config object
  const config: DigitalTwinConfig = useMemo(() => ({
    solarPower: solarPower[0],
    hasTracker,
    batteryCapacity: batteryCapacity[0],
    withSubsidy,
    inflationRate: Math.max(0, Math.min(20, Number(inflationRate) || 0)),
    energyPriceEscalation: Math.max(-5, Math.min(15, Number(energyPriceEscalation) || 0)),
    voltageRegime,
    includeWeatherVariability,
    includeFiscalBenefits,
    hypotheses
  }), [solarPower, hasTracker, batteryCapacity, withSubsidy, inflationRate, energyPriceEscalation, voltageRegime, includeWeatherVariability, includeFiscalBenefits, hypotheses]);

  // Validation
  const validation = useMemo(() => validateConfig(config), [config]);

  // Centralized metrics calculation
  const metrics = useMemo(() => calculateMetrics(config), [config]);

  // Store previous metrics when they change (for sensitivity insight)
  useEffect(() => {
    if (changedParameter) {
      const timer = setTimeout(() => setChangedParameter(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [changedParameter]);

  // Projection data with inflation
  const projectionData = useMemo(() => 
    generateProjectionData(config, metrics), 
    [config, metrics]
  );

  // AI recommendation
  const aiRecommendation = useMemo(() => 
    generateAIRecommendation(config, metrics),
    [config, metrics]
  );

  // Simulation handler
  const handleSimulation = useCallback(() => {
    if (!validation.isValid) return;
    
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 1500);
  }, [validation.isValid]);

  // Setters with validation and parameter tracking
  const createTrackedSetter = useCallback((
    setter: (value: any) => void, 
    paramName: string
  ) => (value: any) => {
    previousMetricsRef.current = { payback: metrics.payback, lcoe: metrics.lcoe, van: metrics.van };
    setChangedParameter(paramName);
    setter(value);
  }, [metrics.payback, metrics.lcoe, metrics.van]);

  const handleInflationChange = useCallback((value: string) => {
    const numValue = Number(value);
    if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 20)) {
      setInflationRate(value);
    }
  }, []);

  const handleEnergyEscalationChange = useCallback((value: string) => {
    const numValue = Number(value);
    if (value === '' || (!isNaN(numValue) && numValue >= -5 && numValue <= 15)) {
      setEnergyPriceEscalation(value);
    }
  }, []);

  return {
    // State
    solarPower,
    setSolarPower: createTrackedSetter(setSolarPower, 'solarPower'),
    hasTracker,
    setHasTracker,
    batteryCapacity,
    setBatteryCapacity: createTrackedSetter(setBatteryCapacity, 'batteryCapacity'),
    withSubsidy,
    setWithSubsidy,
    inflationRate,
    setInflationRate: handleInflationChange,
    energyPriceEscalation,
    setEnergyPriceEscalation: handleEnergyEscalationChange,
    voltageRegime,
    setVoltageRegime,
    includeWeatherVariability,
    setIncludeWeatherVariability,
    includeFiscalBenefits,
    setIncludeFiscalBenefits,
    isSimulating,
    
    // Advanced hypotheses
    corporateTaxRate,
    setCorporateTaxRate: createTrackedSetter(setCorporateTaxRate, 'corporateTaxRate'),
    discountRate,
    setDiscountRate: createTrackedSetter(setDiscountRate, 'discountRate'),
    omPercentage,
    setOmPercentage: createTrackedSetter(setOmPercentage, 'omPercentage'),
    panelLifetime,
    setPanelLifetime,
    batteryLifetime,
    setBatteryLifetime: setBatteryLifetimeState,
    depreciationYears,
    setDepreciationYears,
    weatherScenario,
    setWeatherScenario: createTrackedSetter(setWeatherScenario, 'weatherScenario'),
    
    // Sensitivity tracking
    previousMetrics: previousMetricsRef.current,
    changedParameter,
    
    // Computed
    config,
    validation,
    metrics,
    projectionData,
    aiRecommendation,
    
    // Actions
    handleSimulation,
    
    // Constants for UI
    STEG_TARIFFS,
    CBAM_PRICE_PROJECTIONS,
    
    // Defaults for reference
    defaults: {
      corporateTaxRate: DEFAULT_CORPORATE_TAX_RATE,
      discountRate: DEFAULT_DISCOUNT_RATE,
      omPercentage: DEFAULT_ANNUAL_OM_PERCENT,
      panelLifetime: DEFAULT_PANEL_LIFETIME,
      batteryLifetime: DEFAULT_BATTERY_LIFETIME,
      depreciationYears: DEFAULT_DEPRECIATION_YEARS
    }
  };
};
