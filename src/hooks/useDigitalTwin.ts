import { useState, useMemo, useCallback } from "react";

// Constants for calculations
const COST_PER_KWC = 850; // TND per kWc
const COST_PER_KWH_BATTERY = 450; // TND per kWh
const SAVINGS_PER_KWC = 180; // TND annual savings per kWc
const SAVINGS_PER_KWH_BATTERY = 25; // TND annual savings per kWh battery
const TRACKER_BONUS = 1.15; // 15% efficiency boost
const SUBSIDY_REDUCTION = 0.3; // 30% CAPEX reduction with FTE subsidy
const CO2_INTENSITY = 0.48; // kg CO2/kWh (STEG mix)
const CBAM_PRICE_EUR = 0.065; // EUR per kg CO2
const SOLAR_HOURS_PER_YEAR = 1600; // Average irradiation hours in Tunisia
const PROJECT_LIFETIME_YEARS = 25;
const PANEL_DEGRADATION_RATE = 0.007; // 0.7% per year
const BATTERY_REPLACEMENT_YEAR = 10;

export interface DigitalTwinConfig {
  solarPower: number;
  hasTracker: boolean;
  batteryCapacity: number;
  withSubsidy: boolean;
  inflationRate: number;
  voltageRegime: 'MT' | 'HT';
}

export interface DigitalTwinMetrics {
  effectiveSolar: number;
  annualSavings: number;
  baseInvestment: number;
  investment: number;
  payback: number;
  cbamSavings: number;
  lcoe: number;
  co2Avoided: number;
  lifetimeSavings: number;
}

export interface ProjectionDataPoint {
  year: string;
  cashFlow: number;
  cumulative: number;
  degradation: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

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

  return {
    isValid: errors.length === 0,
    errors
  };
};

const calculateMetrics = (config: DigitalTwinConfig): DigitalTwinMetrics => {
  const { solarPower, hasTracker, batteryCapacity, withSubsidy, voltageRegime } = config;

  // Voltage regime impact on savings (HT = higher savings)
  const voltageMultiplier = voltageRegime === 'HT' ? 1.12 : 1;

  const trackerBonus = hasTracker ? TRACKER_BONUS : 1;
  const effectiveSolar = solarPower * trackerBonus;
  
  const annualSavings = (effectiveSolar * SAVINGS_PER_KWC + batteryCapacity * SAVINGS_PER_KWH_BATTERY) * voltageMultiplier;
  const baseInvestment = solarPower * COST_PER_KWC + batteryCapacity * COST_PER_KWH_BATTERY;
  const investment = withSubsidy ? baseInvestment * (1 - SUBSIDY_REDUCTION) : baseInvestment;
  
  // Prevent division by zero
  const payback = annualSavings > 0 ? investment / annualSavings : Infinity;
  
  // CBAM savings in EUR per year
  const annualEnergyProduced = effectiveSolar * SOLAR_HOURS_PER_YEAR;
  const cbamSavings = annualEnergyProduced * CO2_INTENSITY * CBAM_PRICE_EUR;
  
  // LCOE calculation (TND/kWh)
  const totalEnergy = effectiveSolar * SOLAR_HOURS_PER_YEAR * PROJECT_LIFETIME_YEARS;
  const lcoe = totalEnergy > 0 ? (investment / totalEnergy) * 1000 : 0;
  
  // CO2 avoided per year (tonnes)
  const co2Avoided = (annualEnergyProduced * CO2_INTENSITY) / 1000;
  
  // Lifetime savings estimate
  const lifetimeSavings = annualSavings * PROJECT_LIFETIME_YEARS - investment;

  return {
    effectiveSolar,
    annualSavings,
    baseInvestment,
    investment,
    payback,
    cbamSavings,
    lcoe,
    co2Avoided,
    lifetimeSavings
  };
};

const generateProjectionData = (
  config: DigitalTwinConfig,
  metrics: DigitalTwinMetrics
): ProjectionDataPoint[] => {
  const { inflationRate, batteryCapacity } = config;
  const { investment, annualSavings } = metrics;
  const inflation = inflationRate / 100;

  return Array.from({ length: 11 }, (_, i) => {
    const year = 2026 + i;
    
    // Apply panel degradation
    const degradationFactor = Math.pow(1 - PANEL_DEGRADATION_RATE, i);
    
    // Apply inflation to savings (energy costs increase = more savings)
    const inflationFactor = Math.pow(1 + inflation, i);
    
    // Battery replacement cost at year 10
    const batteryReplacementCost = i === BATTERY_REPLACEMENT_YEAR ? batteryCapacity * COST_PER_KWH_BATTERY * 0.5 : 0;
    
    // Year 0 is initial investment
    if (i === 0) {
      return {
        year: year.toString(),
        cashFlow: Math.round(-investment / 1000),
        cumulative: Math.round(-investment / 1000),
        degradation: 100
      };
    }
    
    // Calculate adjusted savings considering degradation and inflation
    const adjustedSavings = annualSavings * degradationFactor * inflationFactor;
    const cashFlow = (adjustedSavings - batteryReplacementCost) / 1000;
    
    // Calculate cumulative (sum of all previous cash flows)
    let cumulative = -investment / 1000;
    for (let j = 1; j <= i; j++) {
      const degFactor = Math.pow(1 - PANEL_DEGRADATION_RATE, j);
      const inflFactor = Math.pow(1 + inflation, j);
      const yearSavings = annualSavings * degFactor * inflFactor;
      const yearBatteryReplacement = j === BATTERY_REPLACEMENT_YEAR ? batteryCapacity * COST_PER_KWH_BATTERY * 0.5 : 0;
      cumulative += (yearSavings - yearBatteryReplacement) / 1000;
    }
    
    return {
      year: year.toString(),
      cashFlow: Math.round(cashFlow),
      cumulative: Math.round(cumulative),
      degradation: Math.round(degradationFactor * 100)
    };
  });
};

const generateAIRecommendation = (
  config: DigitalTwinConfig,
  metrics: DigitalTwinMetrics
): { type: 'optimization' | 'warning' | 'info'; message: string } => {
  const { solarPower, batteryCapacity, hasTracker, withSubsidy } = config;
  const { payback, cbamSavings } = metrics;

  // Battery too small relative to solar
  if (solarPower > 1000 && batteryCapacity < solarPower * 0.3) {
    return {
      type: 'optimization',
      message: `Augmenter le stockage de ${Math.round(solarPower * 0.1)} kWh améliorerait le TRI de 1.2% grâce à l'effacement de pointe (Peak-shaving). Cette configuration permettrait d'éviter les heures de tarif "Pointe" (18h-22h).`
    };
  }

  // No tracker with high solar
  if (solarPower > 2000 && !hasTracker) {
    return {
      type: 'optimization',
      message: `Pour une installation de ${solarPower} kWc, l'ajout d'un système tracker (+15% rendement) réduirait le payback de ${(payback * 0.12).toFixed(1)} années.`
    };
  }

  // Missing subsidy
  if (!withSubsidy && metrics.investment > 500000) {
    return {
      type: 'warning',
      message: `Vous êtes éligible à la subvention FTE (ANME). Son application réduirait votre CAPEX de ${Math.round(metrics.baseInvestment * 0.3).toLocaleString('fr-FR')} TND.`
    };
  }

  // CBAM impact info
  if (cbamSavings > 10000) {
    return {
      type: 'info',
      message: `Avec l'entrée en vigueur du CBAM Phase 3 en 2026, votre investissement vous permettra d'éviter ${Math.round(cbamSavings).toLocaleString('fr-FR')} € de taxe carbone annuellement sur vos exportations vers l'UE.`
    };
  }

  // Default recommendation
  return {
    type: 'optimization',
    message: `Selon les tarifs STEG actuels, augmenter le stockage de 50 kWh améliore le TRI de 1.2% grâce à l'effacement de pointe (Peak-shaving).`
  };
};

export const useDigitalTwin = () => {
  // Configuration states
  const [solarPower, setSolarPower] = useState<number[]>([1500]);
  const [hasTracker, setHasTracker] = useState(false);
  const [batteryCapacity, setBatteryCapacity] = useState<number[]>([500]);
  const [withSubsidy, setWithSubsidy] = useState(true);
  const [inflationRate, setInflationRate] = useState("5");
  const [voltageRegime, setVoltageRegime] = useState<'MT' | 'HT'>('MT');
  const [isSimulating, setIsSimulating] = useState(false);

  // Build config object
  const config: DigitalTwinConfig = useMemo(() => ({
    solarPower: solarPower[0],
    hasTracker,
    batteryCapacity: batteryCapacity[0],
    withSubsidy,
    inflationRate: Math.max(0, Math.min(20, Number(inflationRate) || 0)),
    voltageRegime
  }), [solarPower, hasTracker, batteryCapacity, withSubsidy, inflationRate, voltageRegime]);

  // Validation
  const validation = useMemo(() => validateConfig(config), [config]);

  // Centralized metrics calculation
  const metrics = useMemo(() => calculateMetrics(config), [config]);

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

  // Setters with validation
  const handleInflationChange = useCallback((value: string) => {
    const numValue = Number(value);
    if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 20)) {
      setInflationRate(value);
    }
  }, []);

  return {
    // State
    solarPower,
    setSolarPower,
    hasTracker,
    setHasTracker,
    batteryCapacity,
    setBatteryCapacity,
    withSubsidy,
    setWithSubsidy,
    inflationRate,
    setInflationRate: handleInflationChange,
    voltageRegime,
    setVoltageRegime,
    isSimulating,
    
    // Computed
    config,
    validation,
    metrics,
    projectionData,
    aiRecommendation,
    
    // Actions
    handleSimulation
  };
};
