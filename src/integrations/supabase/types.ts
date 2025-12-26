export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      carbon_actions: {
        Row: {
          calculation_id: string | null
          category: string
          created_at: string
          description: string
          estimated_cost: number | null
          estimated_reduction_kg: number | null
          estimated_reduction_percent: number | null
          id: string
          implementation_time: string | null
          is_custom: boolean | null
          priority: string
          progress: number | null
          scope_type: string
          status: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calculation_id?: string | null
          category: string
          created_at?: string
          description: string
          estimated_cost?: number | null
          estimated_reduction_kg?: number | null
          estimated_reduction_percent?: number | null
          id?: string
          implementation_time?: string | null
          is_custom?: boolean | null
          priority: string
          progress?: number | null
          scope_type: string
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calculation_id?: string | null
          category?: string
          created_at?: string
          description?: string
          estimated_cost?: number | null
          estimated_reduction_kg?: number | null
          estimated_reduction_percent?: number | null
          id?: string
          implementation_time?: string | null
          is_custom?: boolean | null
          priority?: string
          progress?: number | null
          scope_type?: string
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carbon_actions_calculation_id_fkey"
            columns: ["calculation_id"]
            isOneToOne: false
            referencedRelation: "emissions_calculations"
            referencedColumns: ["id"]
          },
        ]
      }
      carbon_documents: {
        Row: {
          calculation_id: string | null
          category: string
          created_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          updated_at: string | null
          upload_date: string | null
          user_id: string
        }
        Insert: {
          calculation_id?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          updated_at?: string | null
          upload_date?: string | null
          user_id: string
        }
        Update: {
          calculation_id?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          updated_at?: string | null
          upload_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carbon_documents_calculation_id_fkey"
            columns: ["calculation_id"]
            isOneToOne: false
            referencedRelation: "emissions_calculations"
            referencedColumns: ["id"]
          },
        ]
      }
      carbon_reports: {
        Row: {
          calculation_id: string | null
          carbon_intensity: number | null
          company_info: Json | null
          created_at: string
          id: string
          period: string
          report_name: string
          scope1_total: number
          scope2_total: number
          scope3_total: number
          total_co2e: number
          updated_at: string
          user_id: string
        }
        Insert: {
          calculation_id?: string | null
          carbon_intensity?: number | null
          company_info?: Json | null
          created_at?: string
          id?: string
          period: string
          report_name: string
          scope1_total?: number
          scope2_total?: number
          scope3_total?: number
          total_co2e?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          calculation_id?: string | null
          carbon_intensity?: number | null
          company_info?: Json | null
          created_at?: string
          id?: string
          period?: string
          report_name?: string
          scope1_total?: number
          scope2_total?: number
          scope3_total?: number
          total_co2e?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carbon_reports_calculation_id_fkey"
            columns: ["calculation_id"]
            isOneToOne: false
            referencedRelation: "emissions_calculations"
            referencedColumns: ["id"]
          },
        ]
      }
      cbam_audit_events: {
        Row: {
          entity_id: string | null
          entity_type: string
          error_message: string | null
          event_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          occurred_at: string
          organization_id: string | null
          previous_values: Json | null
          session_id: string | null
          status: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          entity_id?: string | null
          entity_type: string
          error_message?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          occurred_at?: string
          organization_id?: string | null
          previous_values?: Json | null
          session_id?: string | null
          status?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          entity_id?: string | null
          entity_type?: string
          error_message?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          occurred_at?: string
          organization_id?: string | null
          previous_values?: Json | null
          session_id?: string | null
          status?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbam_audit_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cbam_audit_log: {
        Row: {
          action: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cbam_calculation_metadata: {
        Row: {
          assumptions: Json | null
          calculation_version: number
          change_reason: string | null
          created_at: string
          data_source: string | null
          default_factor_source: string | null
          emission_factor_source: string
          emission_factor_unit: string | null
          emission_factor_value: number | null
          entity_id: string
          entity_type: string
          id: string
          methodology_reference: string | null
          organization_id: string
          previous_version_id: string | null
          regulation_reference: string | null
          supporting_documents: Json | null
          uncertainty_method: string | null
          uncertainty_percent: number | null
          updated_at: string
          user_id: string
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          assumptions?: Json | null
          calculation_version?: number
          change_reason?: string | null
          created_at?: string
          data_source?: string | null
          default_factor_source?: string | null
          emission_factor_source: string
          emission_factor_unit?: string | null
          emission_factor_value?: number | null
          entity_id: string
          entity_type: string
          id?: string
          methodology_reference?: string | null
          organization_id: string
          previous_version_id?: string | null
          regulation_reference?: string | null
          supporting_documents?: Json | null
          uncertainty_method?: string | null
          uncertainty_percent?: number | null
          updated_at?: string
          user_id: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          assumptions?: Json | null
          calculation_version?: number
          change_reason?: string | null
          created_at?: string
          data_source?: string | null
          default_factor_source?: string | null
          emission_factor_source?: string
          emission_factor_unit?: string | null
          emission_factor_value?: number | null
          entity_id?: string
          entity_type?: string
          id?: string
          methodology_reference?: string | null
          organization_id?: string
          previous_version_id?: string | null
          regulation_reference?: string | null
          supporting_documents?: Json | null
          uncertainty_method?: string | null
          uncertainty_percent?: number | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cbam_calculation_metadata_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbam_calculation_metadata_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "cbam_calculation_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      cbam_carbon_price_origin: {
        Row: {
          carbon_price_eur: number
          carbon_price_local: number
          carbon_pricing_system: string
          country_code: string
          created_at: string
          exchange_rate: number
          id: string
          local_currency: string
          period_end: string
          period_start: string
          shipment_item_id: string | null
          supporting_documents: Json | null
          updated_at: string
          user_id: string
          verification_date: string | null
          verified: boolean
        }
        Insert: {
          carbon_price_eur: number
          carbon_price_local: number
          carbon_pricing_system: string
          country_code: string
          created_at?: string
          exchange_rate: number
          id?: string
          local_currency: string
          period_end: string
          period_start: string
          shipment_item_id?: string | null
          supporting_documents?: Json | null
          updated_at?: string
          user_id: string
          verification_date?: string | null
          verified?: boolean
        }
        Update: {
          carbon_price_eur?: number
          carbon_price_local?: number
          carbon_pricing_system?: string
          country_code?: string
          created_at?: string
          exchange_rate?: number
          id?: string
          local_currency?: string
          period_end?: string
          period_start?: string
          shipment_item_id?: string | null
          supporting_documents?: Json | null
          updated_at?: string
          user_id?: string
          verification_date?: string | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "cbam_carbon_price_origin_shipment_item_id_fkey"
            columns: ["shipment_item_id"]
            isOneToOne: false
            referencedRelation: "cbam_shipment_items"
            referencedColumns: ["id"]
          },
        ]
      }
      cbam_certificates: {
        Row: {
          certificate_serial: string
          certificate_type: string
          created_at: string
          declaration_id: string | null
          id: string
          importer_id: string | null
          is_active: boolean
          organization_id: string | null
          quantity: number
          total_cost_eur: number | null
          transaction_date: string
          transaction_type: string
          unit_price_eur: number | null
          updated_at: string
          user_id: string
          validity_period_end: string | null
          validity_period_start: string | null
        }
        Insert: {
          certificate_serial: string
          certificate_type?: string
          created_at?: string
          declaration_id?: string | null
          id?: string
          importer_id?: string | null
          is_active?: boolean
          organization_id?: string | null
          quantity: number
          total_cost_eur?: number | null
          transaction_date: string
          transaction_type: string
          unit_price_eur?: number | null
          updated_at?: string
          user_id: string
          validity_period_end?: string | null
          validity_period_start?: string | null
        }
        Update: {
          certificate_serial?: string
          certificate_type?: string
          created_at?: string
          declaration_id?: string | null
          id?: string
          importer_id?: string | null
          is_active?: boolean
          organization_id?: string | null
          quantity?: number
          total_cost_eur?: number | null
          transaction_date?: string
          transaction_type?: string
          unit_price_eur?: number | null
          updated_at?: string
          user_id?: string
          validity_period_end?: string | null
          validity_period_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cbam_certificates_declaration_id_fkey"
            columns: ["declaration_id"]
            isOneToOne: false
            referencedRelation: "cbam_declarations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbam_certificates_importer_id_fkey"
            columns: ["importer_id"]
            isOneToOne: false
            referencedRelation: "cbam_importers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbam_certificates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cbam_declarants: {
        Row: {
          company_name: string
          contact_email: string
          country_code: string
          created_at: string
          eori_number: string | null
          id: string
          importer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          contact_email: string
          country_code: string
          created_at?: string
          eori_number?: string | null
          id?: string
          importer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          contact_email?: string
          country_code?: string
          created_at?: string
          eori_number?: string | null
          id?: string
          importer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbam_declarants_importer_id_fkey"
            columns: ["importer_id"]
            isOneToOne: false
            referencedRelation: "cbam_importers"
            referencedColumns: ["id"]
          },
        ]
      }
      cbam_declarations: {
        Row: {
          certificates_required: number
          created_at: string
          id: string
          importer_id: string | null
          organization_id: string | null
          status: Database["public"]["Enums"]["cbam_status"]
          submission_deadline: string
          submitted_at: string | null
          total_cbam_obligation_eur: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          certificates_required?: number
          created_at?: string
          id?: string
          importer_id?: string | null
          organization_id?: string | null
          status?: Database["public"]["Enums"]["cbam_status"]
          submission_deadline: string
          submitted_at?: string | null
          total_cbam_obligation_eur?: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          certificates_required?: number
          created_at?: string
          id?: string
          importer_id?: string | null
          organization_id?: string | null
          status?: Database["public"]["Enums"]["cbam_status"]
          submission_deadline?: string
          submitted_at?: string | null
          total_cbam_obligation_eur?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cbam_declarations_importer_id_fkey"
            columns: ["importer_id"]
            isOneToOne: false
            referencedRelation: "cbam_importers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbam_declarations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cbam_default_emission_factors: {
        Row: {
          country_code: string
          created_at: string
          direct_factor: number
          id: string
          indirect_factor: number
          is_active: boolean
          product_category: string
          sector: Database["public"]["Enums"]["cbam_sector"]
          source_regulation: string
          valid_from: string
          valid_to: string | null
          version: string
        }
        Insert: {
          country_code: string
          created_at?: string
          direct_factor: number
          id?: string
          indirect_factor?: number
          is_active?: boolean
          product_category: string
          sector: Database["public"]["Enums"]["cbam_sector"]
          source_regulation: string
          valid_from: string
          valid_to?: string | null
          version?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          direct_factor?: number
          id?: string
          indirect_factor?: number
          is_active?: boolean
          product_category?: string
          sector?: Database["public"]["Enums"]["cbam_sector"]
          source_regulation?: string
          valid_from?: string
          valid_to?: string | null
          version?: string
        }
        Relationships: []
      }
      cbam_emissions_data: {
        Row: {
          calculation_details: Json | null
          created_at: string
          direct_emissions: number
          direct_method: Database["public"]["Enums"]["emission_method"]
          direct_verified: boolean
          id: string
          indirect_emissions: number
          indirect_method: Database["public"]["Enums"]["emission_method"]
          indirect_verified: boolean
          installation_id: string | null
          measurement_uncertainty: number | null
          organization_id: string | null
          reporting_period: string
          shipment_item_id: string | null
          supporting_documents: Json | null
          updated_at: string
          user_id: string
          verification_date: string | null
          verifier_name: string | null
        }
        Insert: {
          calculation_details?: Json | null
          created_at?: string
          direct_emissions?: number
          direct_method: Database["public"]["Enums"]["emission_method"]
          direct_verified?: boolean
          id?: string
          indirect_emissions?: number
          indirect_method: Database["public"]["Enums"]["emission_method"]
          indirect_verified?: boolean
          installation_id?: string | null
          measurement_uncertainty?: number | null
          organization_id?: string | null
          reporting_period: string
          shipment_item_id?: string | null
          supporting_documents?: Json | null
          updated_at?: string
          user_id: string
          verification_date?: string | null
          verifier_name?: string | null
        }
        Update: {
          calculation_details?: Json | null
          created_at?: string
          direct_emissions?: number
          direct_method?: Database["public"]["Enums"]["emission_method"]
          direct_verified?: boolean
          id?: string
          indirect_emissions?: number
          indirect_method?: Database["public"]["Enums"]["emission_method"]
          indirect_verified?: boolean
          installation_id?: string | null
          measurement_uncertainty?: number | null
          organization_id?: string | null
          reporting_period?: string
          shipment_item_id?: string | null
          supporting_documents?: Json | null
          updated_at?: string
          user_id?: string
          verification_date?: string | null
          verifier_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cbam_emissions_data_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "cbam_installations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbam_emissions_data_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbam_emissions_data_shipment_item_id_fkey"
            columns: ["shipment_item_id"]
            isOneToOne: false
            referencedRelation: "cbam_shipment_items"
            referencedColumns: ["id"]
          },
        ]
      }
      cbam_ets_prices: {
        Row: {
          contract_type: string
          created_at: string
          date: string
          id: string
          price_eur_per_tonne: number
          source: string
        }
        Insert: {
          contract_type?: string
          created_at?: string
          date: string
          id?: string
          price_eur_per_tonne: number
          source?: string
        }
        Update: {
          contract_type?: string
          created_at?: string
          date?: string
          id?: string
          price_eur_per_tonne?: number
          source?: string
        }
        Relationships: []
      }
      cbam_exchange_rates: {
        Row: {
          created_at: string
          currency_code: string
          date: string
          id: string
          rate_to_eur: number
          source: string
        }
        Insert: {
          created_at?: string
          currency_code: string
          date: string
          id?: string
          rate_to_eur: number
          source?: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          date?: string
          id?: string
          rate_to_eur?: number
          source?: string
        }
        Relationships: []
      }
      cbam_importers: {
        Row: {
          address: string | null
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          country_code: string
          created_at: string
          eori_number: string
          id: string
          is_active: boolean
          organization_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_email?: string | null
          contact_phone?: string | null
          country_code: string
          created_at?: string
          eori_number: string
          id?: string
          is_active?: boolean
          organization_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          country_code?: string
          created_at?: string
          eori_number?: string
          id?: string
          is_active?: boolean
          organization_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbam_importers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cbam_installations: {
        Row: {
          address: string
          coordinates: unknown
          country_code: string
          created_at: string
          id: string
          installation_name: string
          is_verified: boolean
          organization_id: string | null
          permit_number: string | null
          sector: Database["public"]["Enums"]["cbam_sector"]
          supplier_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          coordinates?: unknown
          country_code: string
          created_at?: string
          id?: string
          installation_name: string
          is_verified?: boolean
          organization_id?: string | null
          permit_number?: string | null
          sector: Database["public"]["Enums"]["cbam_sector"]
          supplier_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          coordinates?: unknown
          country_code?: string
          created_at?: string
          id?: string
          installation_name?: string
          is_verified?: boolean
          organization_id?: string | null
          permit_number?: string | null
          sector?: Database["public"]["Enums"]["cbam_sector"]
          supplier_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbam_installations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbam_installations_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "cbam_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      cbam_products: {
        Row: {
          cn8_code: string
          created_at: string
          description: string | null
          id: string
          is_precursor: boolean
          organization_id: string | null
          parent_product_id: string | null
          product_name: string
          sector: Database["public"]["Enums"]["cbam_sector"]
          unit_measure: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cn8_code: string
          created_at?: string
          description?: string | null
          id?: string
          is_precursor?: boolean
          organization_id?: string | null
          parent_product_id?: string | null
          product_name: string
          sector: Database["public"]["Enums"]["cbam_sector"]
          unit_measure?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cn8_code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_precursor?: boolean
          organization_id?: string | null
          parent_product_id?: string | null
          product_name?: string
          sector?: Database["public"]["Enums"]["cbam_sector"]
          unit_measure?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbam_products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbam_products_parent_product_id_fkey"
            columns: ["parent_product_id"]
            isOneToOne: false
            referencedRelation: "cbam_products"
            referencedColumns: ["id"]
          },
        ]
      }
      cbam_quarterly_report_items: {
        Row: {
          country_of_origin: string
          created_at: string
          id: string
          predominant_direct_method: Database["public"]["Enums"]["emission_method"]
          predominant_indirect_method: Database["public"]["Enums"]["emission_method"]
          product_id: string | null
          report_id: string | null
          total_direct_emissions: number
          total_indirect_emissions: number
          total_quantity: number
          total_value_eur: number
          updated_at: string
          user_id: string
        }
        Insert: {
          country_of_origin: string
          created_at?: string
          id?: string
          predominant_direct_method: Database["public"]["Enums"]["emission_method"]
          predominant_indirect_method: Database["public"]["Enums"]["emission_method"]
          product_id?: string | null
          report_id?: string | null
          total_direct_emissions: number
          total_indirect_emissions: number
          total_quantity: number
          total_value_eur: number
          updated_at?: string
          user_id: string
        }
        Update: {
          country_of_origin?: string
          created_at?: string
          id?: string
          predominant_direct_method?: Database["public"]["Enums"]["emission_method"]
          predominant_indirect_method?: Database["public"]["Enums"]["emission_method"]
          product_id?: string | null
          report_id?: string | null
          total_direct_emissions?: number
          total_indirect_emissions?: number
          total_quantity?: number
          total_value_eur?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbam_quarterly_report_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "cbam_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbam_quarterly_report_items_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "cbam_quarterly_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      cbam_quarterly_reports: {
        Row: {
          created_at: string
          export_file_path: string | null
          export_generated_at: string | null
          id: string
          importer_id: string | null
          organization_id: string | null
          phase: Database["public"]["Enums"]["cbam_phase"]
          quarter: number
          status: Database["public"]["Enums"]["cbam_status"]
          submission_deadline: string
          submitted_at: string | null
          total_emissions_direct: number
          total_emissions_indirect: number
          total_shipments: number
          total_value_eur: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          export_file_path?: string | null
          export_generated_at?: string | null
          id?: string
          importer_id?: string | null
          organization_id?: string | null
          phase?: Database["public"]["Enums"]["cbam_phase"]
          quarter: number
          status?: Database["public"]["Enums"]["cbam_status"]
          submission_deadline: string
          submitted_at?: string | null
          total_emissions_direct?: number
          total_emissions_indirect?: number
          total_shipments?: number
          total_value_eur?: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          export_file_path?: string | null
          export_generated_at?: string | null
          id?: string
          importer_id?: string | null
          organization_id?: string | null
          phase?: Database["public"]["Enums"]["cbam_phase"]
          quarter?: number
          status?: Database["public"]["Enums"]["cbam_status"]
          submission_deadline?: string
          submitted_at?: string | null
          total_emissions_direct?: number
          total_emissions_indirect?: number
          total_shipments?: number
          total_value_eur?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cbam_quarterly_reports_importer_id_fkey"
            columns: ["importer_id"]
            isOneToOne: false
            referencedRelation: "cbam_importers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbam_quarterly_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cbam_shipment_items: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          quantity: number
          shipment_id: string | null
          total_value_eur: number | null
          unit: string
          unit_value_eur: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          quantity: number
          shipment_id?: string | null
          total_value_eur?: number | null
          unit?: string
          unit_value_eur?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          shipment_id?: string | null
          total_value_eur?: number | null
          unit?: string
          unit_value_eur?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbam_shipment_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "cbam_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbam_shipment_items_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "cbam_shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      cbam_shipments: {
        Row: {
          country_of_origin: string
          created_at: string
          currency_code: string | null
          exchange_rate: number | null
          exchange_rate_date: string | null
          id: string
          import_date: string
          importer_id: string | null
          installation_id: string | null
          organization_id: string | null
          phase: Database["public"]["Enums"]["cbam_phase"]
          reference_number: string
          status: Database["public"]["Enums"]["cbam_status"]
          supplier_id: string | null
          total_value_eur: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          country_of_origin: string
          created_at?: string
          currency_code?: string | null
          exchange_rate?: number | null
          exchange_rate_date?: string | null
          id?: string
          import_date: string
          importer_id?: string | null
          installation_id?: string | null
          organization_id?: string | null
          phase?: Database["public"]["Enums"]["cbam_phase"]
          reference_number: string
          status?: Database["public"]["Enums"]["cbam_status"]
          supplier_id?: string | null
          total_value_eur?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          country_of_origin?: string
          created_at?: string
          currency_code?: string | null
          exchange_rate?: number | null
          exchange_rate_date?: string | null
          id?: string
          import_date?: string
          importer_id?: string | null
          installation_id?: string | null
          organization_id?: string | null
          phase?: Database["public"]["Enums"]["cbam_phase"]
          reference_number?: string
          status?: Database["public"]["Enums"]["cbam_status"]
          supplier_id?: string | null
          total_value_eur?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbam_shipments_importer_id_fkey"
            columns: ["importer_id"]
            isOneToOne: false
            referencedRelation: "cbam_importers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbam_shipments_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "cbam_installations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbam_shipments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbam_shipments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "cbam_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      cbam_suppliers: {
        Row: {
          address: string | null
          carbon_pricing_system: string | null
          company_name: string
          contact_email: string | null
          country_code: string
          created_at: string
          id: string
          organization_id: string | null
          tax_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          carbon_pricing_system?: string | null
          company_name: string
          contact_email?: string | null
          country_code: string
          created_at?: string
          id?: string
          organization_id?: string | null
          tax_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          carbon_pricing_system?: string | null
          company_name?: string
          contact_email?: string | null
          country_code?: string
          created_at?: string
          id?: string
          organization_id?: string | null
          tax_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbam_suppliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      emissions_calculations: {
        Row: {
          calculation_data: Json | null
          carbon_intensity: number | null
          company_size: string | null
          created_at: string
          id: string
          period_end: string | null
          period_start: string | null
          scope1: number
          scope2: number
          scope3: number
          status: string | null
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          calculation_data?: Json | null
          carbon_intensity?: number | null
          company_size?: string | null
          created_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          scope1?: number
          scope2?: number
          scope3?: number
          status?: string | null
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          calculation_data?: Json | null
          carbon_intensity?: number | null
          company_size?: string | null
          created_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          scope1?: number
          scope2?: number
          scope3?: number
          status?: string | null
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      emissions_data: {
        Row: {
          calculation_id: string | null
          category: string
          co2_equivalent: number
          created_at: string
          data_details: Json | null
          emission_factor: number | null
          id: string
          scope_type: string
          subcategory: string | null
          unit: string
          value: number
        }
        Insert: {
          calculation_id?: string | null
          category: string
          co2_equivalent: number
          created_at?: string
          data_details?: Json | null
          emission_factor?: number | null
          id?: string
          scope_type: string
          subcategory?: string | null
          unit: string
          value: number
        }
        Update: {
          calculation_id?: string | null
          category?: string
          co2_equivalent?: number
          created_at?: string
          data_details?: Json | null
          emission_factor?: number | null
          id?: string
          scope_type?: string
          subcategory?: string | null
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "emissions_data_calculation_id_fkey"
            columns: ["calculation_id"]
            isOneToOne: false
            referencedRelation: "emissions_calculations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean
          is_primary: boolean
          joined_at: string | null
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          is_primary?: boolean
          joined_at?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          is_primary?: boolean
          joined_at?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          cbam_registration_id: string | null
          contact_email: string | null
          contact_phone: string | null
          country_code: string
          created_at: string
          id: string
          is_active: boolean
          legal_name: string | null
          name: string
          registration_number: string | null
          settings: Json | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          cbam_registration_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country_code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          legal_name?: string | null
          name: string
          registration_number?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          cbam_registration_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country_code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          legal_name?: string | null
          name?: string
          registration_number?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      dashboard_data: {
        Row: {
          carbon_intensity: number | null
          company_info: Json | null
          created_at: string | null
          emissions_breakdown: Json | null
          period: string | null
          report_id: string | null
          report_name: string | null
          scope1_total: number | null
          scope2_total: number | null
          scope3_total: number | null
          total_co2e: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      user_has_min_role: {
        Args: {
          _min_role: Database["public"]["Enums"]["app_role"]
          _org_id: string
          _user_id: string
        }
        Returns: boolean
      }
      user_has_org_access: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      user_org_role: {
        Args: { _org_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "admin_org" | "supervisor" | "user" | "accountant" | "auditor"
      cbam_phase: "transitional" | "operational"
      cbam_sector:
        | "cement"
        | "iron_steel"
        | "aluminium"
        | "fertilizers"
        | "electricity"
        | "hydrogen"
      cbam_status:
        | "draft"
        | "submitted"
        | "corrected"
        | "validated"
        | "rejected"
      emission_method: "ACTUAL" | "DEFAULT" | "HYBRID"
      priority_level: "high" | "medium" | "low"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin_org", "supervisor", "user", "accountant", "auditor"],
      cbam_phase: ["transitional", "operational"],
      cbam_sector: [
        "cement",
        "iron_steel",
        "aluminium",
        "fertilizers",
        "electricity",
        "hydrogen",
      ],
      cbam_status: ["draft", "submitted", "corrected", "validated", "rejected"],
      emission_method: ["ACTUAL", "DEFAULT", "HYBRID"],
      priority_level: ["high", "medium", "low"],
    },
  },
} as const
