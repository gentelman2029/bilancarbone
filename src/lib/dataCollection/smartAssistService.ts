// AI Smart Assist Service for Data Collection
// Provides intelligent categorization, suggestions, and anomaly detection

import { ExtractedData, GhgScope, ActivityData } from './types';
import { emissionsCalculator } from './emissionsCalculator';
import { SCOPE3_CATEGORIES } from '@/lib/ghg/scope3Categories';

export interface SmartSuggestion {
  field: string;
  suggestedValue: string | number;
  confidence: number;
  reason: string;
  source?: string;
}

export interface AnomalyDetection {
  type: 'duplicate' | 'outlier' | 'missing_data' | 'inconsistent' | 'suspicious_value';
  severity: 'low' | 'medium' | 'high';
  message: string;
  field?: string;
  suggestion?: string;
}

export interface SmartAssistResult {
  scope_suggestion: {
    scope: GhgScope;
    confidence: number;
    reason: string;
  };
  category_suggestion: {
    category: string;
    subcategory?: string;
    confidence: number;
    reason: string;
  };
  emission_factor_suggestion?: {
    factor_value: number;
    factor_unit: string;
    source: string;
    confidence: number;
  };
  anomalies: AnomalyDetection[];
  field_suggestions: SmartSuggestion[];
  overall_confidence: number;
  ai_badge: 'high' | 'medium' | 'low' | 'manual_required';
}

class SmartAssistService {
  
  /**
   * Analyze extracted data and provide smart suggestions
   */
  async analyzeDocument(extractedData: ExtractedData, documentType?: string): Promise<SmartAssistResult> {
    const suggestions: SmartSuggestion[] = [];
    const anomalies: AnomalyDetection[] = [];
    
    // 1. Determine scope
    const scopeSuggestion = this.suggestScope(extractedData, documentType);
    
    // 2. Categorize activity
    const categorySuggestion = this.suggestCategory(extractedData, documentType);
    
    // 3. Get emission factor suggestion
    const emissionFactorSuggestion = await this.suggestEmissionFactor(
      categorySuggestion.category,
      extractedData.unit
    );
    
    // 4. Detect anomalies
    const detectedAnomalies = this.detectAnomalies(extractedData);
    anomalies.push(...detectedAnomalies);
    
    // 5. Generate field suggestions
    const fieldSuggestions = this.generateFieldSuggestions(extractedData, categorySuggestion);
    suggestions.push(...fieldSuggestions);
    
    // 6. Calculate overall confidence
    const overallConfidence = this.calculateOverallConfidence(
      scopeSuggestion.confidence,
      categorySuggestion.confidence,
      emissionFactorSuggestion?.confidence || 0.5
    );
    
    // 7. Determine AI badge
    const aiBadge = this.determineAIBadge(overallConfidence, anomalies);
    
    return {
      scope_suggestion: scopeSuggestion,
      category_suggestion: categorySuggestion,
      emission_factor_suggestion: emissionFactorSuggestion,
      anomalies,
      field_suggestions: suggestions,
      overall_confidence: overallConfidence,
      ai_badge: aiBadge,
    };
  }
  
  /**
   * Suggest GHG scope based on document content
   */
  suggestScope(data: ExtractedData, documentType?: string): { scope: GhgScope; confidence: number; reason: string } {
    // Document type based inference
    const docTypeMapping: Record<string, { scope: GhgScope; confidence: number }> = {
      'fuel_invoice': { scope: 'scope1', confidence: 0.95 },
      'fuel_voucher': { scope: 'scope1', confidence: 0.95 },
      'gas_bill': { scope: 'scope1', confidence: 0.95 },
      'refrigerant_invoice': { scope: 'scope1', confidence: 0.90 },
      'electricity_bill': { scope: 'scope2', confidence: 0.95 },
      'transport_invoice': { scope: 'scope3', confidence: 0.85 },
      'freight_invoice': { scope: 'scope3', confidence: 0.85 },
      'purchase_invoice': { scope: 'scope3', confidence: 0.75 },
    };
    
    if (documentType && docTypeMapping[documentType]) {
      const mapping = docTypeMapping[documentType];
      return {
        scope: mapping.scope,
        confidence: mapping.confidence,
        reason: `Basé sur le type de document: ${documentType}`,
      };
    }
    
    // Unit based inference
    const unit = data.unit?.toLowerCase() || '';
    if (unit.includes('kwh')) {
      return { scope: 'scope2', confidence: 0.85, reason: 'Unité en kWh suggère énergie électrique' };
    }
    if (unit.includes('litre') || unit.includes('l')) {
      return { scope: 'scope1', confidence: 0.80, reason: 'Unité en litres suggère carburant' };
    }
    if (unit.includes('km') || unit.includes('t.km')) {
      return { scope: 'scope3', confidence: 0.80, reason: 'Unité en km suggère transport' };
    }
    if (unit.includes('€') || unit.includes('eur')) {
      return { scope: 'scope3', confidence: 0.70, reason: 'Données monétaires typiques du Scope 3' };
    }
    
    // Supplier based inference
    const supplier = data.supplier_name?.toLowerCase() || '';
    if (supplier.includes('steg') || supplier.includes('electricite') || supplier.includes('sonede')) {
      return { scope: 'scope2', confidence: 0.90, reason: 'Fournisseur d\'énergie identifié' };
    }
    if (supplier.includes('total') || supplier.includes('shell') || supplier.includes('petro')) {
      return { scope: 'scope1', confidence: 0.85, reason: 'Station carburant identifiée' };
    }
    
    // Default
    return { scope: 'scope3', confidence: 0.50, reason: 'Scope par défaut - vérification recommandée' };
  }
  
  /**
   * Suggest GHG category
   */
  suggestCategory(data: ExtractedData, documentType?: string): { category: string; subcategory?: string; confidence: number; reason: string } {
    const unit = data.unit?.toLowerCase() || '';
    const supplier = data.supplier_name?.toLowerCase() || '';
    
    // Document type mapping
    const docCategoryMapping: Record<string, { category: string; subcategory?: string }> = {
      'fuel_invoice': { category: 'diesel', subcategory: 'Carburant véhicules' },
      'fuel_voucher': { category: 'diesel', subcategory: 'Bon carburant' },
      'gas_bill': { category: 'gaz_naturel', subcategory: 'Gaz naturel' },
      'electricity_bill': { category: 'electricite', subcategory: 'Électricité réseau' },
      'transport_invoice': { category: 'transport_routier', subcategory: 'Fret routier' },
      'freight_invoice': { category: 'transport_maritime', subcategory: 'Fret maritime' },
      'purchase_invoice': { category: 'achats_services', subcategory: 'Achats et services' },
    };
    
    if (documentType && docCategoryMapping[documentType]) {
      const mapping = docCategoryMapping[documentType];
      return {
        category: mapping.category,
        subcategory: mapping.subcategory,
        confidence: 0.85,
        reason: `Catégorie déduite du type de document`,
      };
    }
    
    // Unit-based detection
    if (unit.includes('kwh')) {
      return { category: 'electricite', confidence: 0.90, reason: 'Unité kWh = électricité' };
    }
    if (unit.includes('m3') || unit.includes('m³')) {
      if (supplier.includes('gaz') || supplier.includes('sonede')) {
        return { category: 'gaz_naturel', confidence: 0.85, reason: 'Gaz naturel (m³)' };
      }
    }
    if (unit.includes('litre')) {
      // Guess fuel type from supplier or description
      if (supplier.includes('diesel') || supplier.includes('gazole')) {
        return { category: 'diesel', confidence: 0.90, reason: 'Diesel identifié' };
      }
      if (supplier.includes('essence') || supplier.includes('sans plomb')) {
        return { category: 'essence', confidence: 0.90, reason: 'Essence identifiée' };
      }
      return { category: 'diesel', confidence: 0.70, reason: 'Carburant par défaut' };
    }
    
    return { category: 'autres', confidence: 0.40, reason: 'Catégorie indéterminée' };
  }
  
  /**
   * Suggest emission factor
   */
  async suggestEmissionFactor(category: string, unit?: string): Promise<{ 
    factor_value: number; 
    factor_unit: string; 
    source: string; 
    confidence: number 
  } | undefined> {
    try {
      const result = await emissionsCalculator.matchEmissionFactor({
        activity_type: category,
        quantity: 1,
        unit: unit || 'unit',
        ghg_category: category,
      });
      
      return {
        factor_value: result.factor_value,
        factor_unit: result.factor_unit,
        source: result.source,
        confidence: result.confidence_score,
      };
    } catch (error) {
      console.error('Error suggesting emission factor:', error);
      return undefined;
    }
  }
  
  /**
   * Detect anomalies in extracted data
   */
  detectAnomalies(data: ExtractedData): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    // Missing critical data
    if (!data.quantity) {
      anomalies.push({
        type: 'missing_data',
        severity: 'high',
        message: 'Quantité manquante - essentielle pour le calcul carbone',
        field: 'quantity',
        suggestion: 'Saisir manuellement la quantité consommée',
      });
    }
    
    if (!data.period_start || !data.period_end) {
      anomalies.push({
        type: 'missing_data',
        severity: 'medium',
        message: 'Période de consommation non identifiée',
        field: 'period_start',
        suggestion: 'Vérifier les dates sur le document',
      });
    }
    
    // Suspicious values
    if (data.quantity && data.quantity < 0) {
      anomalies.push({
        type: 'suspicious_value',
        severity: 'high',
        message: 'Quantité négative détectée',
        field: 'quantity',
        suggestion: 'Vérifier si c\'est une note de crédit',
      });
    }
    
    if (data.amount_ht && data.amount_ht > 1000000) {
      anomalies.push({
        type: 'outlier',
        severity: 'medium',
        message: 'Montant exceptionnellement élevé',
        field: 'amount_ht',
        suggestion: 'Vérifier l\'unité monétaire et le montant',
      });
    }
    
    // Period consistency
    if (data.period_start && data.period_end) {
      const start = new Date(data.period_start);
      const end = new Date(data.period_end);
      const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff < 0) {
        anomalies.push({
          type: 'inconsistent',
          severity: 'high',
          message: 'La date de fin est antérieure à la date de début',
          field: 'period_end',
        });
      }
      
      if (daysDiff > 365) {
        anomalies.push({
          type: 'suspicious_value',
          severity: 'low',
          message: 'Période de plus d\'un an - vérifier si intentionnel',
          field: 'period_end',
        });
      }
    }
    
    return anomalies;
  }
  
  /**
   * Generate field suggestions
   */
  generateFieldSuggestions(data: ExtractedData, categorySuggestion: { category: string }): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    
    // Unit suggestions based on category
    const categoryUnits: Record<string, string> = {
      'electricite': 'kWh',
      'gaz_naturel': 'm³',
      'diesel': 'litres',
      'essence': 'litres',
      'transport_routier': 't.km',
      'transport_maritime': 't.km',
      'transport_aerien': 't.km',
    };
    
    if (!data.unit && categoryUnits[categorySuggestion.category]) {
      suggestions.push({
        field: 'unit',
        suggestedValue: categoryUnits[categorySuggestion.category],
        confidence: 0.80,
        reason: `Unité standard pour ${categorySuggestion.category}`,
      });
    }
    
    // Period suggestions (default to current month if missing)
    if (!data.period_start) {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      suggestions.push({
        field: 'period_start',
        suggestedValue: firstDay.toISOString().split('T')[0],
        confidence: 0.50,
        reason: 'Premier jour du mois courant (par défaut)',
      });
    }
    
    return suggestions;
  }
  
  /**
   * Check for duplicate activities
   */
  async checkDuplicates(newActivity: Partial<ActivityData>, existingActivities: ActivityData[]): Promise<AnomalyDetection[]> {
    const duplicates: AnomalyDetection[] = [];
    
    for (const existing of existingActivities) {
      // Check for potential duplicates
      const sameSupplier = existing.supplier_name === newActivity.supplier_name;
      const samePeriod = existing.period_start === newActivity.period_start;
      const sameQuantity = Math.abs((existing.quantity || 0) - (newActivity.quantity || 0)) < 0.01;
      const sameCategory = existing.ghg_category === newActivity.ghg_category;
      
      if (sameSupplier && samePeriod && sameCategory) {
        if (sameQuantity) {
          duplicates.push({
            type: 'duplicate',
            severity: 'high',
            message: `Doublon potentiel détecté avec une activité existante du ${existing.period_start}`,
            suggestion: 'Vérifier si cette facture n\'a pas déjà été importée',
          });
        } else {
          duplicates.push({
            type: 'duplicate',
            severity: 'medium',
            message: `Activité similaire trouvée pour la même période et le même fournisseur`,
            suggestion: 'Comparer les quantités pour éviter les doublons',
          });
        }
      }
    }
    
    return duplicates;
  }
  
  /**
   * Calculate overall confidence
   */
  private calculateOverallConfidence(scopeConf: number, categoryConf: number, factorConf: number): number {
    // Weighted average
    return (scopeConf * 0.3 + categoryConf * 0.4 + factorConf * 0.3);
  }
  
  /**
   * Determine AI recommendation badge
   */
  private determineAIBadge(confidence: number, anomalies: AnomalyDetection[]): 'high' | 'medium' | 'low' | 'manual_required' {
    const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high').length;
    
    if (highSeverityAnomalies > 0) return 'manual_required';
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    if (confidence >= 0.4) return 'low';
    return 'manual_required';
  }
}

export const smartAssistService = new SmartAssistService();
