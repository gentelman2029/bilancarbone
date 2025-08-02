export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
