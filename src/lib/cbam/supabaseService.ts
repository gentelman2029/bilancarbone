// Service Supabase pour le module CBAM
// Implémente toutes les opérations CRUD pour les entités CBAM

import { supabase } from '@/integrations/supabase/client';
import type {
  CBAMImporter,
  CBAMDeclarant,
  CBAMSupplier,
  CBAMInstallation,
  CBAMProduct,
  CBAMShipment,
  CBAMShipmentItem,
  CBAMEmissionsData,
  CBAMDefaultEmissionFactor,
  CBAMCarbonPriceOrigin,
  CBAMQuarterlyReport,
  CBAMQuarterlyReportItem,
  CBAMDeclaration,
  CBAMCertificate,
  CBAMExchangeRate,
  CBAMETSPrice,
  CreateCBAMProductForm,
  CreateCBAMShipmentForm,
  CreateEmissionsDataForm,
  CBAMServiceResponse,
  CBAMSector,
  EmissionMethod,
  CBAMStatus,
  CBAMPhase
} from './types';

// ============================================================================
// SERVICE PRINCIPAL CBAM
// ============================================================================

export class CBAMSupabaseService {
  
  // ========================================================================== 
  // IMPORTATEURS
  // ==========================================================================
  
  async getImporters(): Promise<CBAMServiceResponse<CBAMImporter[]>> {
    try {
      const { data, error } = await supabase
        .from('cbam_importers')
        .select('*')
        .eq('is_active', true)
        .order('company_name');

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { error: `Erreur lors de la récupération des importateurs: ${error}` };
    }
  }

  async createImporter(importer: Omit<CBAMImporter, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CBAMServiceResponse<CBAMImporter>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('cbam_importers')
        .insert({
          ...importer,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: `Erreur lors de la création de l'importateur: ${error}` };
    }
  }

  async updateImporter(id: string, updates: Partial<CBAMImporter>): Promise<CBAMServiceResponse<CBAMImporter>> {
    try {
      const { data, error } = await supabase
        .from('cbam_importers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: `Erreur lors de la mise à jour de l'importateur: ${error}` };
    }
  }

  async deleteImporter(id: string): Promise<CBAMServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('cbam_importers')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return {};
    } catch (error) {
      return { error: `Erreur lors de la suppression de l'importateur: ${error}` };
    }
  }

  // ========================================================================== 
  // FOURNISSEURS
  // ==========================================================================

  async getSuppliers(): Promise<CBAMServiceResponse<CBAMSupplier[]>> {
    try {
      const { data, error } = await supabase
        .from('cbam_suppliers')
        .select('*')
        .order('company_name');

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { error: `Erreur lors de la récupération des fournisseurs: ${error}` };
    }
  }

  async createSupplier(supplier: Omit<CBAMSupplier, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CBAMServiceResponse<CBAMSupplier>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('cbam_suppliers')
        .insert({
          ...supplier,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: `Erreur lors de la création du fournisseur: ${error}` };
    }
  }

  // ========================================================================== 
  // PRODUITS
  // ==========================================================================

  async getProducts(sector?: CBAMSector): Promise<CBAMServiceResponse<CBAMProduct[]>> {
    try {
      let query = supabase
        .from('cbam_products')
        .select('*')
        .order('product_name');

      if (sector) {
        query = query.eq('sector', sector);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { error: `Erreur lors de la récupération des produits: ${error}` };
    }
  }

  async createProduct(product: CreateCBAMProductForm): Promise<CBAMServiceResponse<CBAMProduct>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Validation du code CN8
      if (!/^\d{8}$/.test(product.cn8_code)) {
        return {
          validationErrors: [{
            field: 'cn8_code',
            message: 'Le code CN8 doit contenir exactement 8 chiffres',
            code: 'INVALID_CN8_FORMAT'
          }]
        };
      }

      const { data, error } = await supabase
        .from('cbam_products')
        .insert({
          ...product,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Violation contrainte unique
          return {
            validationErrors: [{
              field: 'cn8_code',
              message: 'Ce code CN8 existe déjà pour ce secteur',
              code: 'DUPLICATE_CN8'
            }]
          };
        }
        throw error;
      }

      return { data };
    } catch (error) {
      return { error: `Erreur lors de la création du produit: ${error}` };
    }
  }

  async updateProduct(id: string, updates: Partial<CBAMProduct>): Promise<CBAMServiceResponse<CBAMProduct>> {
    try {
      const { data, error } = await supabase
        .from('cbam_products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: `Erreur lors de la mise à jour du produit: ${error}` };
    }
  }

  async deleteProduct(id: string): Promise<CBAMServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('cbam_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return {};
    } catch (error) {
      return { error: `Erreur lors de la suppression du produit: ${error}` };
    }
  }

  // ========================================================================== 
  // EXPÉDITIONS
  // ==========================================================================

  async getShipments(filters?: {
    status?: CBAMStatus;
    phase?: CBAMPhase;
    date_from?: string;
    date_to?: string;
    importer_id?: string;
  }): Promise<CBAMServiceResponse<CBAMShipment[]>> {
    try {
      let query = supabase
        .from('cbam_shipments')
        .select(`
          *,
          cbam_importers(company_name),
          cbam_suppliers(company_name)
        `)
        .order('import_date', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.phase) {
        query = query.eq('phase', filters.phase);
      }
      if (filters?.date_from) {
        query = query.gte('import_date', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('import_date', filters.date_to);
      }
      if (filters?.importer_id) {
        query = query.eq('importer_id', filters.importer_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { error: `Erreur lors de la récupération des expéditions: ${error}` };
    }
  }

  async createShipment(shipment: CreateCBAMShipmentForm): Promise<CBAMServiceResponse<CBAMShipment>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Validation du numéro de référence unique
      const { data: existing } = await supabase
        .from('cbam_shipments')
        .select('id')
        .eq('reference_number', shipment.reference_number)
        .eq('importer_id', shipment.importer_id)
        .single();

      if (existing) {
        return {
          validationErrors: [{
            field: 'reference_number',
            message: 'Cette référence d\'expédition existe déjà pour cet importateur',
            code: 'DUPLICATE_REFERENCE'
          }]
        };
      }

      // Transaction pour créer expédition + articles
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('cbam_shipments')
        .insert({
          user_id: user.id,
          importer_id: shipment.importer_id,
          supplier_id: shipment.supplier_id,
          installation_id: shipment.installation_id,
          reference_number: shipment.reference_number,
          import_date: shipment.import_date,
          country_of_origin: shipment.country_of_origin,
          total_value_eur: shipment.total_value_eur,
          currency_code: shipment.currency_code,
          status: 'draft',
          phase: 'transitional'
        })
        .select()
        .single();

      if (shipmentError) throw shipmentError;

      // Créer les articles de l'expédition
      if (shipment.items && shipment.items.length > 0) {
        const items = shipment.items.map(item => ({
          user_id: user.id,
          shipment_id: shipmentData.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit: item.unit || 'tonnes',
          unit_value_eur: item.unit_value_eur,
          total_value_eur: item.unit_value_eur ? item.unit_value_eur * item.quantity : undefined
        }));

        const { error: itemsError } = await supabase
          .from('cbam_shipment_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      return { data: shipmentData };
    } catch (error) {
      return { error: `Erreur lors de la création de l'expédition: ${error}` };
    }
  }

  async updateShipmentStatus(id: string, status: CBAMStatus): Promise<CBAMServiceResponse<CBAMShipment>> {
    try {
      const { data, error } = await supabase
        .from('cbam_shipments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: `Erreur lors de la mise à jour du statut: ${error}` };
    }
  }

  // ========================================================================== 
  // DONNÉES D'ÉMISSIONS
  // ==========================================================================

  async getEmissionsData(shipment_item_id: string): Promise<CBAMServiceResponse<CBAMEmissionsData[]>> {
    try {
      const { data, error } = await supabase
        .from('cbam_emissions_data')
        .select('*')
        .eq('shipment_item_id', shipment_item_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { error: `Erreur lors de la récupération des données d'émissions: ${error}` };
    }
  }

  async createEmissionsData(emissions: CreateEmissionsDataForm): Promise<CBAMServiceResponse<CBAMEmissionsData>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Validation des valeurs d'émissions
      if (emissions.direct_emissions < 0 || emissions.indirect_emissions < 0) {
        return {
          validationErrors: [{
            field: 'emissions',
            message: 'Les émissions ne peuvent pas être négatives',
            code: 'NEGATIVE_EMISSIONS'
          }]
        };
      }

      const { data, error } = await supabase
        .from('cbam_emissions_data')
        .insert({
          ...emissions,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: `Erreur lors de la création des données d'émissions: ${error}` };
    }
  }

  // ========================================================================== 
  // FACTEURS D'ÉMISSION PAR DÉFAUT
  // ==========================================================================

  async getDefaultEmissionFactors(sector?: CBAMSector, country_code?: string): Promise<CBAMServiceResponse<CBAMDefaultEmissionFactor[]>> {
    try {
      let query = supabase
        .from('cbam_default_emission_factors')
        .select('*')
        .eq('is_active', true)
        .order('sector', { ascending: true });

      if (sector) {
        query = query.eq('sector', sector);
      }
      if (country_code) {
        query = query.eq('country_code', country_code);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { error: `Erreur lors de la récupération des facteurs d'émission: ${error}` };
    }
  }

  // ========================================================================== 
  // RAPPORTS TRIMESTRIELS
  // ==========================================================================

  async getQuarterlyReports(year?: number): Promise<CBAMServiceResponse<CBAMQuarterlyReport[]>> {
    try {
      let query = supabase
        .from('cbam_quarterly_reports')
        .select(`
          *,
          cbam_importers(company_name)
        `)
        .order('year', { ascending: false })
        .order('quarter', { ascending: false });

      if (year) {
        query = query.eq('year', year);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { error: `Erreur lors de la récupération des rapports trimestriels: ${error}` };
    }
  }

  async createQuarterlyReport(importer_id: string, quarter: number, year: number): Promise<CBAMServiceResponse<CBAMQuarterlyReport>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Vérifier si le rapport existe déjà
      const { data: existing } = await supabase
        .from('cbam_quarterly_reports')
        .select('id')
        .eq('importer_id', importer_id)
        .eq('quarter', quarter)
        .eq('year', year)
        .single();

      if (existing) {
        return {
          validationErrors: [{
            field: 'quarter',
            message: 'Un rapport existe déjà pour cette période',
            code: 'DUPLICATE_REPORT'
          }]
        };
      }

      // Calculer la date limite de soumission (31 janvier suivant le trimestre)
      const submission_deadline = new Date(year + (quarter === 4 ? 1 : 0), quarter === 4 ? 0 : quarter * 3, 31)
        .toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('cbam_quarterly_reports')
        .insert({
          user_id: user.id,
          importer_id,
          quarter,
          year,
          submission_deadline,
          status: 'draft',
          phase: 'transitional'
        })
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: `Erreur lors de la création du rapport trimestriel: ${error}` };
    }
  }

  // ========================================================================== 
  // TAUX DE CHANGE ET PRIX ETS
  // ==========================================================================

  async getExchangeRate(currency_code: string, date: string): Promise<CBAMServiceResponse<CBAMExchangeRate>> {
    try {
      const { data, error } = await supabase
        .from('cbam_exchange_rates')
        .select('*')
        .eq('currency_code', currency_code)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = No rows found
      return { data: data || null };
    } catch (error) {
      return { error: `Erreur lors de la récupération du taux de change: ${error}` };
    }
  }

  async getETSPrice(date: string): Promise<CBAMServiceResponse<CBAMETSPrice>> {
    try {
      const { data, error } = await supabase
        .from('cbam_ets_prices')
        .select('*')
        .eq('date', date)
        .eq('contract_type', 'front_month')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data || null };
    } catch (error) {
      return { error: `Erreur lors de la récupération du prix EU ETS: ${error}` };
    }
  }

  // ========================================================================== 
  // UTILITAIRES ET CALCULS
  // ==========================================================================

  async calculateCBAMObligation(shipment_item_id: string): Promise<CBAMServiceResponse<number>> {
    try {
      // Cette fonction calculera l'obligation CBAM pour la phase opérationnelle
      // Formule: Émissions_incorporées × Prix_EU_ETS - Prix_carbone_origine
      
      // Pour l'instant, retourne 0 (phase transitoire)
      return { data: 0 };
    } catch (error) {
      return { error: `Erreur lors du calcul de l'obligation CBAM: ${error}` };
    }
  }

  async getDashboardStats(): Promise<CBAMServiceResponse<any>> {
    try {
      // Statistiques du tableau de bord
      const [importersResult, shipmentsResult, reportsResult] = await Promise.all([
        supabase.from('cbam_importers').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('cbam_shipments').select('id', { count: 'exact' }),
        supabase.from('cbam_quarterly_reports').select('id', { count: 'exact' }).eq('status', 'draft')
      ]);

      const stats = {
        active_importers: importersResult.count || 0,
        total_shipments: shipmentsResult.count || 0,
        pending_reports: reportsResult.count || 0,
        compliance_rate: 85 // Simulation
      };

      return { data: stats };
    } catch (error) {
      return { error: `Erreur lors de la récupération des statistiques: ${error}` };
    }
  }
}

// Instance singleton du service
export const cbamService = new CBAMSupabaseService();