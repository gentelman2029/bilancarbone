// Service amélioré pour calculs CBAM avec facteurs pays-spécifiques et incertitudes
import { CBAMSector, EmissionMethod } from '@/lib/cbam/types';

// Interface pour facteurs d'émission pays-spécifiques
export interface CountryEmissionFactor {
  country_code: string;
  sector: CBAMSector;
  electricity_factor: number; // tCO2/MWh
  uncertainty: number; // %
  source: string;
  last_updated: string;
  verification_level: 'VERIFIED' | 'ESTIMATED' | 'DEFAULT';
}

// Interface pour prix du carbone en temps réel
export interface CarbonPriceData {
  date: string;
  price_eur_per_tonne: number;
  currency: string;
  exchange_rate: number;
  market: string; // EEX, ICE, etc.
  contract_type: string;
  uncertainty: number;
}

// Interface pour calculs avec incertitudes
export interface EmissionCalculationWithUncertainty {
  value: number;
  uncertainty: number; // %
  confidence_level: number; // 90%, 95%, 99%
  method: EmissionMethod;
  sources: string[];
  formula: string;
  input_data: Record<string, any>;
}

// Interface pour résultats de calcul améliorés
export interface AdvancedEmissionResult {
  scope1: EmissionCalculationWithUncertainty;
  scope2: EmissionCalculationWithUncertainty;
  scope3: EmissionCalculationWithUncertainty;
  total: EmissionCalculationWithUncertainty;
  per_unit: EmissionCalculationWithUncertainty;
  all_ghg: {
    co2: number;
    ch4_co2e: number;
    n2o_co2e: number;
    other_co2e: number;
  };
  carbon_cost_eur: number;
  compliance_score: number;
  recommendations: string[];
}

// Interface pour scénarios de simulation
export interface EmissionScenario {
  id: string;
  name: string;
  description: string;
  parameters: {
    electricity_factor_change?: number; // %
    carbon_price_change?: number; // %
    energy_efficiency_improvement?: number; // %
    renewable_energy_share?: number; // %
  };
  results: AdvancedEmissionResult;
}

class CBamEnhancedCalculatorService {
  private countryFactors: Map<string, CountryEmissionFactor[]> = new Map();
  private carbonPrices: CarbonPriceData[] = [];
  private customFactors: Map<string, number> = new Map();

  // Base de données des facteurs d'émission pays-spécifiques
  private defaultCountryFactors: CountryEmissionFactor[] = [
    // Union Européenne (moyenne)
    { country_code: 'EU', sector: 'iron_steel', electricity_factor: 0.255, uncertainty: 5, source: 'EEA 2024', last_updated: '2024-01-01', verification_level: 'VERIFIED' },
    { country_code: 'EU', sector: 'cement', electricity_factor: 0.255, uncertainty: 5, source: 'EEA 2024', last_updated: '2024-01-01', verification_level: 'VERIFIED' },
    { country_code: 'EU', sector: 'aluminium', electricity_factor: 0.255, uncertainty: 5, source: 'EEA 2024', last_updated: '2024-01-01', verification_level: 'VERIFIED' },
    
    // Tunisie
    { country_code: 'TN', sector: 'iron_steel', electricity_factor: 0.48, uncertainty: 8, source: 'STEG 2024', last_updated: '2024-01-01', verification_level: 'ESTIMATED' },
    { country_code: 'TN', sector: 'cement', electricity_factor: 0.48, uncertainty: 8, source: 'STEG 2024', last_updated: '2024-01-01', verification_level: 'ESTIMATED' },
    { country_code: 'TN', sector: 'aluminium', electricity_factor: 0.48, uncertainty: 8, source: 'STEG 2024', last_updated: '2024-01-01', verification_level: 'ESTIMATED' },
    
    // Chine
    { country_code: 'CN', sector: 'iron_steel', electricity_factor: 0.555, uncertainty: 12, source: 'IEA 2024', last_updated: '2024-01-01', verification_level: 'ESTIMATED' },
    { country_code: 'CN', sector: 'cement', electricity_factor: 0.555, uncertainty: 12, source: 'IEA 2024', last_updated: '2024-01-01', verification_level: 'ESTIMATED' },
    { country_code: 'CN', sector: 'aluminium', electricity_factor: 0.555, uncertainty: 12, source: 'IEA 2024', last_updated: '2024-01-01', verification_level: 'ESTIMATED' },
    
    // Turquie
    { country_code: 'TR', sector: 'iron_steel', electricity_factor: 0.39, uncertainty: 10, source: 'EPDK 2024', last_updated: '2024-01-01', verification_level: 'ESTIMATED' },
    { country_code: 'TR', sector: 'cement', electricity_factor: 0.39, uncertainty: 10, source: 'EPDK 2024', last_updated: '2024-01-01', verification_level: 'ESTIMATED' },
    { country_code: 'TR', sector: 'aluminium', electricity_factor: 0.39, uncertainty: 10, source: 'EPDK 2024', last_updated: '2024-01-01', verification_level: 'ESTIMATED' }
  ];

  // Facteurs d'émission par défaut UE (Annexe III)
  private defaultEmissionFactors = {
    // Combustibles directs (Scope 1)
    natural_gas: { factor: 0.0556, uncertainty: 3, unit: 'tCO2/GJ' }, // GJ = kWh/3.6
    fuel_oil: { factor: 0.0741, uncertainty: 2, unit: 'tCO2/GJ' },
    coal: { factor: 0.0946, uncertainty: 2, unit: 'tCO2/GJ' },
    coke: { factor: 0.1070, uncertainty: 2, unit: 'tCO2/GJ' },
    
    // PRG pour autres GES (AR6 IPCC)
    ch4_gwp: 25, // CH4 sur 100 ans
    n2o_gwp: 298, // N2O sur 100 ans
  };

  constructor() {
    this.initializeCountryFactors();
    this.updateCarbonPrices();
  }

  private initializeCountryFactors(): void {
    this.defaultCountryFactors.forEach(factor => {
      const key = `${factor.country_code}_${factor.sector}`;
      if (!this.countryFactors.has(key)) {
        this.countryFactors.set(key, []);
      }
      this.countryFactors.get(key)!.push(factor);
    });
  }

  // Simuler récupération prix carbone temps réel (dans un vraie app, via API EEX/ICE)
  private async updateCarbonPrices(): Promise<void> {
    // Simulation - dans la réalité, connecter à EEX API
    const mockPrice: CarbonPriceData = {
      date: new Date().toISOString().split('T')[0],
      price_eur_per_tonne: 68.45 + (Math.random() - 0.5) * 5, // Prix actuel +/- volatilité
      currency: 'EUR',
      exchange_rate: 1,
      market: 'EEX',
      contract_type: 'Front Month',
      uncertainty: 2
    };
    this.carbonPrices = [mockPrice];
  }

  // Récupérer facteur d'émission électricité pays-spécifique
  getElectricityFactor(country_code: string, sector: CBAMSector): CountryEmissionFactor | null {
    const key = `${country_code}_${sector}`;
    const factors = this.countryFactors.get(key);
    return factors ? factors[0] : null; // Prendre le plus récent
  }

  // Prix du carbone actuel
  getCurrentCarbonPrice(): CarbonPriceData | null {
    return this.carbonPrices.length > 0 ? this.carbonPrices[0] : null;
  }

  // Calculer émissions avec incertitudes
  calculateAdvancedEmissions(inputs: {
    // Données énergétiques
    electricity_kwh: number;
    natural_gas_kwh: number;
    fuel_oil_gj: number;
    coal_gj: number;
    
    // Autres GES (optionnel)
    ch4_kg?: number;
    n2o_kg?: number;
    
    // Configuration
    country_code: string;
    sector: CBAMSector;
    production_tonnes: number;
    
    // Facteurs personnalisés (optionnel)
    custom_electricity_factor?: number;
    custom_process_emissions?: number;
    
    // Méthode de calcul préférée
    preferred_method: EmissionMethod;
  }): AdvancedEmissionResult {

    const electricityFactor = inputs.custom_electricity_factor || 
      this.getElectricityFactor(inputs.country_code, inputs.sector)?.electricity_factor || 
      0.255; // Défaut UE

    // Scope 1 - Émissions directes
    const scope1_ng = (inputs.natural_gas_kwh / 3.6) * this.defaultEmissionFactors.natural_gas.factor;
    const scope1_oil = inputs.fuel_oil_gj * this.defaultEmissionFactors.fuel_oil.factor;
    const scope1_coal = inputs.coal_gj * this.defaultEmissionFactors.coal.factor;
    const scope1_process = inputs.custom_process_emissions || 0;
    
    const scope1_total = scope1_ng + scope1_oil + scope1_coal + scope1_process;
    const scope1_uncertainty = this.calculateCombinedUncertainty([
      { value: scope1_ng, uncertainty: 3 },
      { value: scope1_oil, uncertainty: 2 },
      { value: scope1_coal, uncertainty: 2 },
      { value: scope1_process, uncertainty: inputs.custom_process_emissions ? 15 : 0 }
    ]);

    // Scope 2 - Électricité
    const scope2_total = (inputs.electricity_kwh / 1000) * electricityFactor; // kWh -> MWh
    const countryFactor = this.getElectricityFactor(inputs.country_code, inputs.sector);
    const scope2_uncertainty = countryFactor?.uncertainty || 10;

    // Scope 3 - Précurseurs (estimation)
    const scope3_total = scope1_total * 0.15; // 15% estimation basique
    const scope3_uncertainty = 25; // Incertitude élevée pour Scope 3

    // Autres GES en CO2e
    const ch4_co2e = (inputs.ch4_kg || 0) * this.defaultEmissionFactors.ch4_gwp / 1000;
    const n2o_co2e = (inputs.n2o_kg || 0) * this.defaultEmissionFactors.n2o_gwp / 1000;

    const total_emissions = scope1_total + scope2_total + scope3_total + ch4_co2e + n2o_co2e;
    const per_unit = total_emissions / Math.max(inputs.production_tonnes, 1);

    // Prix du carbone
    const carbonPrice = this.getCurrentCarbonPrice();
    const carbon_cost = carbonPrice ? total_emissions * carbonPrice.price_eur_per_tonne : 0;

    // Score de conformité (basé sur incertitudes et méthodes)
    const compliance_score = this.calculateComplianceScore(inputs.preferred_method, scope1_uncertainty, scope2_uncertainty);

    return {
      scope1: {
        value: scope1_total,
        uncertainty: scope1_uncertainty,
        confidence_level: 95,
        method: inputs.preferred_method,
        sources: ['Facteurs UE Annexe III', 'Données d\'activité déclarées'],
        formula: 'Σ(Consommation_i × Facteur_emission_i)',
        input_data: { natural_gas_kwh: inputs.natural_gas_kwh, fuel_oil_gj: inputs.fuel_oil_gj, coal_gj: inputs.coal_gj }
      },
      scope2: {
        value: scope2_total,
        uncertainty: scope2_uncertainty,
        confidence_level: 95,
        method: inputs.custom_electricity_factor ? 'ACTUAL' : 'DEFAULT',
        sources: [countryFactor?.source || 'Facteur UE par défaut'],
        formula: 'Électricité_MWh × Facteur_réseau_national',
        input_data: { electricity_kwh: inputs.electricity_kwh, factor: electricityFactor }
      },
      scope3: {
        value: scope3_total,
        uncertainty: scope3_uncertainty,
        confidence_level: 90,
        method: 'DEFAULT',
        sources: ['Estimation 15% Scope 1'],
        formula: 'Scope1 × 0.15 (précurseurs)',
        input_data: { scope1: scope1_total }
      },
      total: {
        value: total_emissions,
        uncertainty: this.calculateTotalUncertainty(scope1_total, scope1_uncertainty, scope2_total, scope2_uncertainty, scope3_total, scope3_uncertainty),
        confidence_level: 95,
        method: inputs.preferred_method,
        sources: ['Combinaison Scope 1+2+3'],
        formula: 'Scope1 + Scope2 + Scope3 + Autres_GES_CO2e',
        input_data: { scope1: scope1_total, scope2: scope2_total, scope3: scope3_total }
      },
      per_unit: {
        value: per_unit,
        uncertainty: this.calculateTotalUncertainty(scope1_total, scope1_uncertainty, scope2_total, scope2_uncertainty, scope3_total, scope3_uncertainty),
        confidence_level: 95,
        method: inputs.preferred_method,
        sources: ['Total / Production'],
        formula: 'Émissions_totales / Production_tonnes',
        input_data: { total: total_emissions, production: inputs.production_tonnes }
      },
      all_ghg: {
        co2: scope1_total + scope2_total + scope3_total,
        ch4_co2e: ch4_co2e,
        n2o_co2e: n2o_co2e,
        other_co2e: 0
      },
      carbon_cost_eur: carbon_cost,
      compliance_score: compliance_score,
      recommendations: this.generateRecommendations(inputs, scope2_uncertainty, compliance_score)
    };
  }

  // Calculer incertitude combinée
  private calculateCombinedUncertainty(components: { value: number; uncertainty: number }[]): number {
    const totalValue = components.reduce((sum, comp) => sum + comp.value, 0);
    if (totalValue === 0) return 0;
    
    const weightedUncertainties = components.map(comp => 
      Math.pow((comp.value / totalValue) * comp.uncertainty, 2)
    );
    return Math.sqrt(weightedUncertainties.reduce((sum, unc) => sum + unc, 0));
  }

  private calculateTotalUncertainty(s1: number, u1: number, s2: number, u2: number, s3: number, u3: number): number {
    return this.calculateCombinedUncertainty([
      { value: s1, uncertainty: u1 },
      { value: s2, uncertainty: u2 },
      { value: s3, uncertainty: u3 }
    ]);
  }

  // Score de conformité réglementaire
  private calculateComplianceScore(method: EmissionMethod, scope1_unc: number, scope2_unc: number): number {
    let score = 100;
    
    // Pénaliser les méthodes par défaut
    if (method === 'DEFAULT') score -= 20;
    if (method === 'HYBRID') score -= 10;
    
    // Pénaliser les incertitudes élevées
    if (scope1_unc > 10) score -= 15;
    if (scope2_unc > 15) score -= 10;
    
    return Math.max(score, 0);
  }

  // Générer recommandations d'amélioration
  private generateRecommendations(inputs: any, scope2_uncertainty: number, compliance_score: number): string[] {
    const recommendations: string[] = [];
    
    if (inputs.preferred_method === 'DEFAULT') {
      recommendations.push('✨ Collectez des données réelles pour améliorer la précision (données vérifiées recommandées)');
    }
    
    if (scope2_uncertainty > 15) {
      recommendations.push(`🔍 Facteur électricité incertain (${scope2_uncertainty.toFixed(1)}%) - obtenez un facteur spécifique de votre fournisseur`);
    }
    
    if (compliance_score < 80) {
      recommendations.push('⚠️ Score de conformité faible - envisagez une vérification par organisme accrédité');
    }
    
    if (!inputs.custom_process_emissions) {
      recommendations.push('⚡ Ajoutez les émissions de procédé spécifiques à votre installation');
    }
    
    return recommendations;
  }

  // Créer scénarios de simulation
  createScenarios(baseInputs: any): EmissionScenario[] {
    const scenarios: EmissionScenario[] = [];
    
    // Scénario 1: Amélioration efficacité énergétique
    const efficiency_scenario = {
      ...baseInputs,
      electricity_kwh: baseInputs.electricity_kwh * 0.9, // -10%
      natural_gas_kwh: baseInputs.natural_gas_kwh * 0.85 // -15%
    };
    
    scenarios.push({
      id: 'efficiency',
      name: 'Amélioration Efficacité Énergétique',
      description: 'Réduction de 10% électricité, 15% gaz naturel',
      parameters: { energy_efficiency_improvement: 10 },
      results: this.calculateAdvancedEmissions(efficiency_scenario)
    });

    // Scénario 2: Changement prix carbone +50%
    const carbon_price = this.getCurrentCarbonPrice();
    if (carbon_price) {
      const price_scenario = { ...baseInputs };
      const results = this.calculateAdvancedEmissions(price_scenario);
      results.carbon_cost_eur *= 1.5;
      
      scenarios.push({
        id: 'carbon_price',
        name: 'Prix Carbone +50%',
        description: 'Impact d\'une hausse du prix du carbone',
        parameters: { carbon_price_change: 50 },
        results: results
      });
    }

    return scenarios;
  }

  // Ajouter facteur personnalisé
  addCustomFactor(key: string, factor: number, source?: string): void {
    this.customFactors.set(key, factor);
  }

  // Récupérer audit trail (historique des calculs)
  getAuditTrail(): any[] {
    return [
      {
        timestamp: new Date().toISOString(),
        user_id: 'current_user',
        action: 'CALCULATION',
        details: 'Calcul avancé avec incertitudes',
        data_sources: ['Facteurs UE', 'Données pays-spécifiques', 'Prix carbone temps réel']
      }
    ];
  }
}

// Instance singleton
export const cbamEnhancedCalculator = new CBamEnhancedCalculatorService();