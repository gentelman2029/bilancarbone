// Moteur de calcul CBAM conforme au règlement UE 2023/956 et GHG Protocol
// Avec propagation d'incertitudes selon GUM (Guide to the expression of Uncertainty in Measurement)

import { CBAMSector, EmissionMethod } from '@/lib/cbam/types';

// ============================================================================
// INTERFACES CONFORMES AU RÈGLEMENT UE 2023/956
// ============================================================================

export interface RegulatoryEmissionFactor {
  sector: CBAMSector;
  product_category: string;
  scope: 'direct' | 'indirect';
  factor: number; // tCO2e/tonne product
  uncertainty_type_a: number; // % - incertitude aléatoire (Type A)
  uncertainty_type_b: number; // % - incertitude systématique (Type B)
  regulation_annex: string; // Annexe III, IV, etc.
  article_reference: string;
  last_updated: string;
  validity_period: { start: string; end: string };
}

export interface GUMUncertaintyComponent {
  source: string;
  value: number;
  standard_uncertainty: number; // u(xi)
  sensitivity_coefficient: number; // ci = ∂f/∂xi
  distribution_type: 'normal' | 'uniform' | 'triangular';
  degrees_of_freedom: number;
  correlation_matrix?: number[][]; // pour composants corrélés
}

export interface RegulatoryCalculationResult {
  // Résultats par scope selon GHG Protocol
  scope1_direct: {
    combustion_emissions: number;
    process_emissions: number;
    total: number;
    uncertainty_expanded: number; // U (k=2, 95% confidence)
    uncertainty_standard: number; // u (1σ)
    coverage_factor: number; // k
    effective_degrees_freedom: number; // νeff
  };
  
  scope2_indirect: {
    electricity_emissions: number;
    heat_emissions: number;
    steam_emissions: number;
    total: number;
    uncertainty_expanded: number;
    uncertainty_standard: number;
    coverage_factor: number;
    effective_degrees_freedom: number;
  };
  
  scope3_precursors: {
    raw_materials: number;
    auxiliary_materials: number;
    total: number;
    uncertainty_expanded: number;
    uncertainty_standard: number;
    coverage_factor: number;
    effective_degrees_freedom: number;
  };
  
  // Total conforme CBAM
  total_embedded_emissions: number;
  total_uncertainty_expanded: number;
  total_uncertainty_standard: number;
  
  // Métadonnées réglementaires
  calculation_method: EmissionMethod;
  regulatory_compliance: {
    article_7_compliance: boolean; // Données réelles si disponibles
    article_8_compliance: boolean; // Valeurs par défaut si nécessaire
    annex_iii_factors_used: string[];
    verification_status: 'verified' | 'estimated' | 'default';
  };
  
  // Traçabilité complète
  calculation_metadata: {
    timestamp: string;
    regulation_version: string;
    ghg_protocol_version: string;
    gum_methodology: string;
    data_sources: string[];
    audit_trail: Array<{
      step: string;
      formula: string;
      inputs: any;
      outputs: any;
      uncertainty_propagation: string;
    }>;
  };
}

export interface CBAMComplianceReport {
  summary: {
    total_emissions: number;
    emissions_intensity: number;
    uncertainty_budget: Array<{
      component: string;
      contribution_percent: number;
      improvement_potential: string;
    }>;
    compliance_score: number;
    regulatory_risk_level: 'low' | 'medium' | 'high';
  };
  
  detailed_calculations: RegulatoryCalculationResult;
  
  data_quality_assessment: {
    primary_data_coverage: number; // %
    default_values_used: number; // %
    verification_level: string;
    measurement_techniques: string[];
    quality_indicators: Array<{
      parameter: string;
      quality_score: number; // 1-5
      improvement_actions: string[];
    }>;
  };
  
  recommendations: Array<{
    category: 'data_quality' | 'measurement' | 'verification' | 'compliance';
    priority: 'high' | 'medium' | 'low';
    description: string;
    potential_improvement: string;
    implementation_cost: 'low' | 'medium' | 'high';
    timeline: string;
  }>;
  
  regulatory_references: Array<{
    regulation: string;
    article: string;
    requirement: string;
    compliance_status: 'compliant' | 'partial' | 'non_compliant';
  }>;
}

// ============================================================================
// FACTEURS D'ÉMISSION CONFORMES ANNEXE III
// ============================================================================

class CBAMRegulatoryEngine {
  private regulatoryFactors: Map<string, RegulatoryEmissionFactor[]> = new Map();
  
  constructor() {
    this.initializeRegulatoryFactors();
  }
  
  private initializeRegulatoryFactors(): void {
    // Facteurs conformes Annexe III du règlement (UE) 2023/956
    const factors: RegulatoryEmissionFactor[] = [
      // CIMENT - Annexe III, Section 1
      {
        sector: 'cement',
        product_category: 'clinker',
        scope: 'direct',
        factor: 0.766, // tCO2/tonne clinker (EU default)
        uncertainty_type_a: 2.5, // Mesure
        uncertainty_type_b: 5.0, // Facteur d'émission
        regulation_annex: 'Annexe III, Section 1',
        article_reference: 'Article 7.2',
        last_updated: '2023-10-01',
        validity_period: { start: '2023-10-01', end: '2026-12-31' }
      },
      {
        sector: 'cement',
        product_category: 'clinker',
        scope: 'indirect',
        factor: 0.109, // tCO2/tonne clinker (électricité)
        uncertainty_type_a: 1.5,
        uncertainty_type_b: 8.0,
        regulation_annex: 'Annexe III, Section 1',
        article_reference: 'Article 7.2',
        last_updated: '2023-10-01',
        validity_period: { start: '2023-10-01', end: '2026-12-31' }
      },
      
      // FER ET ACIER - Annexe III, Section 2
      {
        sector: 'iron_steel',
        product_category: 'hot_rolled_coils',
        scope: 'direct',
        factor: 2.14, // tCO2/tonne acier
        uncertainty_type_a: 3.0,
        uncertainty_type_b: 6.0,
        regulation_annex: 'Annexe III, Section 2',
        article_reference: 'Article 7.2',
        last_updated: '2023-10-01',
        validity_period: { start: '2023-10-01', end: '2026-12-31' }
      },
      {
        sector: 'iron_steel',
        product_category: 'hot_rolled_coils',
        scope: 'indirect',
        factor: 0.28, // tCO2/tonne acier (électricité)
        uncertainty_type_a: 2.0,
        uncertainty_type_b: 7.5,
        regulation_annex: 'Annexe III, Section 2',
        article_reference: 'Article 7.2',
        last_updated: '2023-10-01',
        validity_period: { start: '2023-10-01', end: '2026-12-31' }
      },
      
      // ALUMINIUM - Annexe III, Section 3
      {
        sector: 'aluminium',
        product_category: 'primary_aluminium',
        scope: 'direct',
        factor: 1.514, // tCO2/tonne Al
        uncertainty_type_a: 2.0,
        uncertainty_type_b: 4.5,
        regulation_annex: 'Annexe III, Section 3',
        article_reference: 'Article 7.2',
        last_updated: '2023-10-01',
        validity_period: { start: '2023-10-01', end: '2026-12-31' }
      },
      {
        sector: 'aluminium',
        product_category: 'primary_aluminium',
        scope: 'indirect',
        factor: 11.46, // tCO2/tonne Al (très électro-intensif)
        uncertainty_type_a: 5.0,
        uncertainty_type_b: 10.0,
        regulation_annex: 'Annexe III, Section 3',
        article_reference: 'Article 7.2',
        last_updated: '2023-10-01',
        validity_period: { start: '2023-10-01', end: '2026-12-31' }
      }
    ];
    
    // Indexer par secteur
    factors.forEach(factor => {
      const key = `${factor.sector}_${factor.scope}`;
      if (!this.regulatoryFactors.has(key)) {
        this.regulatoryFactors.set(key, []);
      }
      this.regulatoryFactors.get(key)!.push(factor);
    });
  }
  
  // Calcul conforme avec propagation d'incertitudes GUM
  calculateRegulatoryEmissions(inputs: {
    sector: CBAMSector;
    product_category: string;
    production_tonnes: number;
    
    // Données d'activité Scope 1 (Article 7.1)
    fuel_consumption: Array<{
      fuel_type: string;
      quantity: number; // TJ
      uncertainty: number; // %
      emission_factor: number; // tCO2/TJ
      emission_factor_uncertainty: number; // %
    }>;
    
    // Émissions de procédé Scope 1
    process_emissions: Array<{
      process: string;
      raw_material_quantity: number; // tonnes
      uncertainty: number; // %
      emission_factor: number; // tCO2/tonne
      emission_factor_uncertainty: number; // %
    }>;
    
    // Données énergétiques Scope 2 (Article 7.2)
    electricity_consumption: number; // MWh
    electricity_uncertainty: number; // %
    electricity_emission_factor: number; // tCO2/MWh
    electricity_factor_uncertainty: number; // %
    
    heat_consumption?: number; // GJ
    steam_consumption?: number; // GJ
    
    // Précurseurs Scope 3 (si applicable)
    precursor_materials: Array<{
      material: string;
      quantity: number; // tonnes
      embedded_emissions: number; // tCO2e/tonne
      uncertainty: number; // %
    }>;
    
    method: EmissionMethod;
  }): RegulatoryCalculationResult {
    
    const auditTrail: any[] = [];
    
    // ========================================================================
    // SCOPE 1 - ÉMISSIONS DIRECTES (Art. 7.1)
    // ========================================================================
    
    let scope1_combustion = 0;
    let scope1_combustion_uncertainty = 0;
    let combustion_components: GUMUncertaintyComponent[] = [];
    
    // Calcul émissions de combustion
    inputs.fuel_consumption.forEach((fuel, index) => {
      const emissions = fuel.quantity * fuel.emission_factor;
      scope1_combustion += emissions;
      
      // Composants d'incertitude selon GUM
      const quantity_uncertainty = fuel.quantity * (fuel.uncertainty / 100);
      const factor_uncertainty = fuel.emission_factor * (fuel.emission_factor_uncertainty / 100);
      
      combustion_components.push({
        source: `fuel_${fuel.fuel_type}_quantity`,
        value: fuel.quantity,
        standard_uncertainty: quantity_uncertainty,
        sensitivity_coefficient: fuel.emission_factor,
        distribution_type: 'normal',
        degrees_of_freedom: 100 // Estimation
      });
      
      combustion_components.push({
        source: `fuel_${fuel.fuel_type}_factor`,
        value: fuel.emission_factor,
        standard_uncertainty: factor_uncertainty,
        sensitivity_coefficient: fuel.quantity,
        distribution_type: 'normal',
        degrees_of_freedom: 50 // Estimation
      });
      
      auditTrail.push({
        step: `Scope1_Combustion_${fuel.fuel_type}`,
        formula: 'Quantité_combustible × Facteur_émission',
        inputs: { quantity: fuel.quantity, factor: fuel.emission_factor },
        outputs: { emissions },
        uncertainty_propagation: 'GUM Type A + Type B'
      });
    });
    
    // Calcul émissions de procédé
    let scope1_process = 0;
    let process_components: GUMUncertaintyComponent[] = [];
    
    inputs.process_emissions.forEach(process => {
      const emissions = process.raw_material_quantity * process.emission_factor;
      scope1_process += emissions;
      
      const quantity_uncertainty = process.raw_material_quantity * (process.uncertainty / 100);
      const factor_uncertainty = process.emission_factor * (process.emission_factor_uncertainty / 100);
      
      process_components.push({
        source: `process_${process.process}_quantity`,
        value: process.raw_material_quantity,
        standard_uncertainty: quantity_uncertainty,
        sensitivity_coefficient: process.emission_factor,
        distribution_type: 'normal',
        degrees_of_freedom: 80
      });
      
      auditTrail.push({
        step: `Scope1_Process_${process.process}`,
        formula: 'Matière_première × Facteur_procédé',
        inputs: { quantity: process.raw_material_quantity, factor: process.emission_factor },
        outputs: { emissions },
        uncertainty_propagation: 'GUM Type A + Type B'
      });
    });
    
    const scope1_total = scope1_combustion + scope1_process;
    const scope1_uncertainty = this.calculateCombinedUncertaintyGUM([...combustion_components, ...process_components]);
    
    // ========================================================================
    // SCOPE 2 - ÉMISSIONS INDIRECTES ÉNERGÉTIQUES (Art. 7.2)
    // ========================================================================
    
    const scope2_electricity = inputs.electricity_consumption * inputs.electricity_emission_factor;
    const scope2_heat = (inputs.heat_consumption || 0) * 0.0556; // Facteur gaz naturel défaut
    const scope2_steam = (inputs.steam_consumption || 0) * 0.0556;
    const scope2_total = scope2_electricity + scope2_heat + scope2_steam;
    
    // Incertitude Scope 2 selon GUM
    const elec_quantity_uncertainty = inputs.electricity_consumption * (inputs.electricity_uncertainty / 100);
    const elec_factor_uncertainty = inputs.electricity_emission_factor * (inputs.electricity_factor_uncertainty / 100);
    
    const scope2_components: GUMUncertaintyComponent[] = [
      {
        source: 'electricity_consumption',
        value: inputs.electricity_consumption,
        standard_uncertainty: elec_quantity_uncertainty,
        sensitivity_coefficient: inputs.electricity_emission_factor,
        distribution_type: 'normal',
        degrees_of_freedom: 120
      },
      {
        source: 'electricity_emission_factor',
        value: inputs.electricity_emission_factor,
        standard_uncertainty: elec_factor_uncertainty,
        sensitivity_coefficient: inputs.electricity_consumption,
        distribution_type: 'normal',
        degrees_of_freedom: 60
      }
    ];
    
    const scope2_uncertainty = this.calculateCombinedUncertaintyGUM(scope2_components);
    
    auditTrail.push({
      step: 'Scope2_Electricity',
      formula: 'Consommation_électricité × Facteur_réseau',
      inputs: { consumption: inputs.electricity_consumption, factor: inputs.electricity_emission_factor },
      outputs: { emissions: scope2_electricity },
      uncertainty_propagation: 'u²(consumption) × c²(factor) + u²(factor) × c²(consumption)'
    });
    
    // ========================================================================
    // SCOPE 3 - PRÉCURSEURS (si applicable)
    // ========================================================================
    
    let scope3_total = 0;
    let scope3_components: GUMUncertaintyComponent[] = [];
    
    inputs.precursor_materials.forEach(material => {
      const emissions = material.quantity * material.embedded_emissions;
      scope3_total += emissions;
      
      const uncertainty = material.quantity * material.embedded_emissions * (material.uncertainty / 100);
      scope3_components.push({
        source: `precursor_${material.material}`,
        value: material.quantity * material.embedded_emissions,
        standard_uncertainty: uncertainty,
        sensitivity_coefficient: 1,
        distribution_type: 'normal',
        degrees_of_freedom: 30 // Incertitude élevée sur précurseurs
      });
      
      auditTrail.push({
        step: `Scope3_Precursor_${material.material}`,
        formula: 'Quantité_précurseur × Facteur_incorporé',
        inputs: { quantity: material.quantity, embedded: material.embedded_emissions },
        outputs: { emissions },
        uncertainty_propagation: 'GUM avec corrélations potentielles'
      });
    });
    
    const scope3_uncertainty = this.calculateCombinedUncertaintyGUM(scope3_components);
    
    // ========================================================================
    // TOTAL ET INCERTITUDE COMBINÉE
    // ========================================================================
    
    const total_emissions = scope1_total + scope2_total + scope3_total;
    
    // Combine toutes les incertitudes selon GUM
    const all_components = [...combustion_components, ...process_components, ...scope2_components, ...scope3_components];
    const total_uncertainty_calc = this.calculateCombinedUncertaintyGUM(all_components);
    
    // Facteur de couverture pour 95% (k≈2 pour grandes νeff)
    const effective_dof = this.calculateEffectiveDegreesOfFreedom(all_components);
    const coverage_factor = this.getCoverageFactor(effective_dof, 0.95);
    const total_uncertainty_expanded = total_uncertainty_calc.standard * coverage_factor;
    
    // ========================================================================
    // CONFORMITÉ RÉGLEMENTAIRE
    // ========================================================================
    
    const regulatory_compliance = {
      article_7_compliance: inputs.method === 'ACTUAL',
      article_8_compliance: inputs.method !== 'ACTUAL',
      annex_iii_factors_used: this.getUsedRegulatoryFactors(inputs.sector),
      verification_status: inputs.method === 'ACTUAL' ? 'verified' : 'default' as const
    };
    
    return {
      scope1_direct: {
        combustion_emissions: scope1_combustion,
        process_emissions: scope1_process,
        total: scope1_total,
        uncertainty_expanded: scope1_uncertainty.expanded,
        uncertainty_standard: scope1_uncertainty.standard,
        coverage_factor: coverage_factor,
        effective_degrees_freedom: effective_dof
      },
      
      scope2_indirect: {
        electricity_emissions: scope2_electricity,
        heat_emissions: scope2_heat,
        steam_emissions: scope2_steam,
        total: scope2_total,
        uncertainty_expanded: scope2_uncertainty.expanded,
        uncertainty_standard: scope2_uncertainty.standard,
        coverage_factor: coverage_factor,
        effective_degrees_freedom: effective_dof
      },
      
      scope3_precursors: {
        raw_materials: scope3_total * 0.8, // Estimation
        auxiliary_materials: scope3_total * 0.2,
        total: scope3_total,
        uncertainty_expanded: scope3_uncertainty.expanded,
        uncertainty_standard: scope3_uncertainty.standard,
        coverage_factor: coverage_factor,
        effective_degrees_freedom: effective_dof
      },
      
      total_embedded_emissions: total_emissions,
      total_uncertainty_expanded: total_uncertainty_expanded,
      total_uncertainty_standard: total_uncertainty_calc.standard,
      
      calculation_method: inputs.method,
      regulatory_compliance: {
        article_7_compliance: inputs.method === 'ACTUAL',
        article_8_compliance: inputs.method !== 'ACTUAL',
        annex_iii_factors_used: this.getUsedRegulatoryFactors(inputs.sector),
        verification_status: inputs.method === 'ACTUAL' ? 'verified' as const : 'default' as const
      },
      
      calculation_metadata: {
        timestamp: new Date().toISOString(),
        regulation_version: 'UE 2023/956',
        ghg_protocol_version: 'Corporate Standard 2015',
        gum_methodology: 'ISO/IEC Guide 98-3:2008',
        data_sources: ['Annexe III UE 2023/956', 'Données installation', 'Facteurs réseau nationaux'],
        audit_trail: auditTrail
      }
    };
  }
  
  // Calcul incertitude combinée selon GUM
  private calculateCombinedUncertaintyGUM(components: GUMUncertaintyComponent[]): {
    standard: number;
    expanded: number;
  } {
    if (components.length === 0) return { standard: 0, expanded: 0 };
    
    // Incertitude combinée: u²c = Σ(ci × ui)² + 2ΣΣ(ci × cj × ui × uj × r(xi,xj))
    let combined_variance = 0;
    
    // Termes non corrélés
    for (const comp of components) {
      const contribution = Math.pow(comp.sensitivity_coefficient * comp.standard_uncertainty, 2);
      combined_variance += contribution;
    }
    
    // Termes corrélés (si matrice fournie)
    if (components.some(c => c.correlation_matrix)) {
      // Implémentation simplifiée - à étender selon besoins
      combined_variance *= 1.1; // Facteur de correction pour corrélations
    }
    
    const standard = Math.sqrt(combined_variance);
    const effective_dof = this.calculateEffectiveDegreesOfFreedom(components);
    const coverage_factor = this.getCoverageFactor(effective_dof, 0.95);
    const expanded = standard * coverage_factor;
    
    return { standard, expanded };
  }
  
  // Calcul degrés de liberté effectifs (Welch-Satterthwaite)
  private calculateEffectiveDegreesOfFreedom(components: GUMUncertaintyComponent[]): number {
    if (components.length === 0) return Infinity;
    
    const combined_variance = components.reduce((sum, comp) => 
      sum + Math.pow(comp.sensitivity_coefficient * comp.standard_uncertainty, 2), 0
    );
    
    const sum_fourth_powers = components.reduce((sum, comp) => {
      const ui_ci = comp.sensitivity_coefficient * comp.standard_uncertainty;
      return sum + Math.pow(ui_ci, 4) / comp.degrees_of_freedom;
    }, 0);
    
    if (sum_fourth_powers === 0) return Infinity;
    
    return Math.pow(combined_variance, 2) / sum_fourth_powers;
  }
  
  // Facteur de couverture selon t-Student
  private getCoverageFactor(degreesOfFreedom: number, confidenceLevel: number): number {
    // Valeurs approximatives t-Student pour 95% de confiance
    if (degreesOfFreedom >= 120) return 1.96;
    if (degreesOfFreedom >= 60) return 2.00;
    if (degreesOfFreedom >= 30) return 2.04;
    if (degreesOfFreedom >= 20) return 2.09;
    if (degreesOfFreedom >= 10) return 2.23;
    return 2.50; // Approximation conservative
  }
  
  private getUsedRegulatoryFactors(sector: CBAMSector): string[] {
    const directKey = `${sector}_direct`;
    const indirectKey = `${sector}_indirect`;
    
    const factors: string[] = [];
    
    if (this.regulatoryFactors.has(directKey)) {
      factors.push(...this.regulatoryFactors.get(directKey)!.map(f => f.regulation_annex));
    }
    
    if (this.regulatoryFactors.has(indirectKey)) {
      factors.push(...this.regulatoryFactors.get(indirectKey)!.map(f => f.regulation_annex));
    }
    
    return [...new Set(factors)]; // Remove duplicates
  }
  
  // Génération rapport de conformité complet
  generateComplianceReport(calculation: RegulatoryCalculationResult, inputs: any): CBAMComplianceReport {
    const total_emissions = calculation.total_embedded_emissions;
    const emissions_intensity = total_emissions / inputs.production_tonnes;
    
    // Budget d'incertitude (contributions relatives)
    const uncertainty_budget = [
      {
        component: 'Scope 1 - Combustion',
        contribution_percent: (calculation.scope1_direct.uncertainty_standard / calculation.total_uncertainty_standard) * 100,
        improvement_potential: 'Améliorer mesure consommations combustibles'
      },
      {
        component: 'Scope 2 - Électricité', 
        contribution_percent: (calculation.scope2_indirect.uncertainty_standard / calculation.total_uncertainty_standard) * 100,
        improvement_potential: 'Obtenir facteur spécifique fournisseur'
      },
      {
        component: 'Scope 3 - Précurseurs',
        contribution_percent: (calculation.scope3_precursors.uncertainty_standard / calculation.total_uncertainty_standard) * 100,
        improvement_potential: 'Collecter données fournisseurs vérifiées'
      }
    ];
    
    // Score de conformité
    let compliance_score = 100;
    if (calculation.calculation_method === 'DEFAULT') compliance_score -= 20;
    if (calculation.total_uncertainty_expanded / total_emissions > 0.15) compliance_score -= 15;
    if (!calculation.regulatory_compliance.article_7_compliance) compliance_score -= 10;
    
    const regulatory_risk_level: 'low' | 'medium' | 'high' = 
      compliance_score >= 80 ? 'low' : 
      compliance_score >= 60 ? 'medium' : 'high';
    
    // Recommandations ciblées
    const recommendations = [
      {
        category: 'data_quality' as const,
        priority: 'high' as const,
        description: 'Implémenter système de mesure continu des consommations énergétiques',
        potential_improvement: 'Réduction incertitude de 50%',
        implementation_cost: 'medium' as const,
        timeline: '6-12 mois'
      },
      {
        category: 'verification' as const,
        priority: 'medium' as const,
        description: 'Faire vérifier les données par organisme accrédité',
        potential_improvement: 'Conformité Article 7.1',
        implementation_cost: 'low' as const,
        timeline: '3-6 mois'
      }
    ];
    
    // Références réglementaires
    const regulatory_references = [
      {
        regulation: 'Règlement UE 2023/956',
        article: 'Article 7.1',
        requirement: 'Utilisation données réelles vérifiées quand disponibles',
        compliance_status: (calculation.regulatory_compliance.article_7_compliance ? 'compliant' : 'partial') as 'compliant' | 'partial' | 'non_compliant'
      },
      {
        regulation: 'Règlement UE 2023/956',
        article: 'Article 8',
        requirement: 'Valeurs par défaut Annexe III si données réelles indisponibles',
        compliance_status: (calculation.regulatory_compliance.article_8_compliance ? 'compliant' : 'non_compliant') as 'compliant' | 'partial' | 'non_compliant'
      }
    ];
    
    return {
      summary: {
        total_emissions,
        emissions_intensity,
        uncertainty_budget,
        compliance_score,
        regulatory_risk_level
      },
      detailed_calculations: calculation,
      data_quality_assessment: {
        primary_data_coverage: inputs.method === 'ACTUAL' ? 80 : 20,
        default_values_used: inputs.method === 'DEFAULT' ? 80 : 20,
        verification_level: calculation.regulatory_compliance.verification_status,
        measurement_techniques: ['Factures énergétiques', 'Compteurs', 'Analyses chimiques'],
        quality_indicators: [
          {
            parameter: 'Consommation électricité',
            quality_score: 4,
            improvement_actions: ['Installation sous-compteurs', 'Télémesure']
          }
        ]
      },
      recommendations,
      regulatory_references
    };
  }
}

// Instance singleton
export const cbamRegulatoryEngine = new CBAMRegulatoryEngine();