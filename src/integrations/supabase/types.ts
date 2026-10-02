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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      tb_admin_account: {
        Row: {
          admin_account_id: string
          created_at: string
          email: string
          full_name: string | null
          is_active: boolean
          role: string
          updated_at: string
        }
        Insert: {
          admin_account_id: string
          created_at?: string
          email: string
          full_name?: string | null
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          admin_account_id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      tb_category: {
        Row: {
          category_id: number
          created_at: string
          name: string
          parent_category_id: number | null
          slug: string
        }
        Insert: {
          category_id?: never
          created_at?: string
          name: string
          parent_category_id?: number | null
          slug: string
        }
        Update: {
          category_id?: never
          created_at?: string
          name?: string
          parent_category_id?: number | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "tb_category_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "tb_category"
            referencedColumns: ["category_id"]
          },
        ]
      }
      tb_enquiry: {
        Row: {
          channel: string
          created_at: string
          customer_cell: string
          customer_email: string
          customer_name: string
          enquiry_id: number
          image_path: string | null
          message: string
          status: string
          supplier_account_id: string
        }
        Insert: {
          channel: string
          created_at?: string
          customer_cell: string
          customer_email: string
          customer_name: string
          enquiry_id?: never
          image_path?: string | null
          message: string
          status?: string
          supplier_account_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          customer_cell?: string
          customer_email?: string
          customer_name?: string
          enquiry_id?: never
          image_path?: string | null
          message?: string
          status?: string
          supplier_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tb_enquiry_supplier_account_id_fkey"
            columns: ["supplier_account_id"]
            isOneToOne: false
            referencedRelation: "tb_supplier_account"
            referencedColumns: ["supplier_account_id"]
          },
        ]
      }
      tb_package: {
        Row: {
          benefits: Json
          created_by: string | null
          date_created: string
          date_updated: string
          description: string
          duration_months: number
          is_active: boolean
          is_recommended: boolean
          name: string
          package_id: number
          price: number
          sort_order: number
          updated_by: string | null
        }
        Insert: {
          benefits?: Json
          created_by?: string | null
          date_created?: string
          date_updated?: string
          description?: string
          duration_months?: number
          is_active?: boolean
          is_recommended?: boolean
          name: string
          package_id?: never
          price: number
          sort_order?: number
          updated_by?: string | null
        }
        Update: {
          benefits?: Json
          created_by?: string | null
          date_created?: string
          date_updated?: string
          description?: string
          duration_months?: number
          is_active?: boolean
          is_recommended?: boolean
          name?: string
          package_id?: never
          price?: number
          sort_order?: number
          updated_by?: string | null
        }
        Relationships: []
      }
      tb_profile_view: {
        Row: {
          profile_view_id: number
          supplier_account_id: string
          viewed_at: string
          viewer_account_id: string | null
          visitor_hash: string
        }
        Insert: {
          profile_view_id?: never
          supplier_account_id: string
          viewed_at?: string
          viewer_account_id?: string | null
          visitor_hash: string
        }
        Update: {
          profile_view_id?: never
          supplier_account_id?: string
          viewed_at?: string
          viewer_account_id?: string | null
          visitor_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "tb_profile_view_supplier_account_id_fkey"
            columns: ["supplier_account_id"]
            isOneToOne: false
            referencedRelation: "tb_supplier_account"
            referencedColumns: ["supplier_account_id"]
          },
        ]
      }
      tb_subscription: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          failure_reason: string | null
          gateway: string
          gateway_reference: string | null
          is_test: boolean
          package_id: number | null
          paid_at: string | null
          payment_reference: string | null
          starts_at: string | null
          subscription_id: number
          subscription_status: string
          supplier_account_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at?: string | null
          failure_reason?: string | null
          gateway?: string
          gateway_reference?: string | null
          is_test?: boolean
          package_id?: number | null
          paid_at?: string | null
          payment_reference?: string | null
          starts_at?: string | null
          subscription_id?: never
          subscription_status?: string
          supplier_account_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          failure_reason?: string | null
          gateway?: string
          gateway_reference?: string | null
          is_test?: boolean
          package_id?: number | null
          paid_at?: string | null
          payment_reference?: string | null
          starts_at?: string | null
          subscription_id?: never
          subscription_status?: string
          supplier_account_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tb_subscription_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "tb_package"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "tb_subscription_supplier_account_id_fkey"
            columns: ["supplier_account_id"]
            isOneToOne: false
            referencedRelation: "tb_supplier_account"
            referencedColumns: ["supplier_account_id"]
          },
        ]
      }
      tb_supplier_account: {
        Row: {
          created_at: string
          email: string
          status: string
          supplier_account_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          status?: string
          supplier_account_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          status?: string
          supplier_account_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tb_supplier_profile: {
        Row: {
          address: string | null
          business_description: string | null
          business_logo: string | null
          business_name: string
          category_id: number | null
          cell_no: string | null
          closing_time: string
          date_created: string
          date_updated: string
          is_product_seller: boolean
          is_service_provider: boolean
          notes: string | null
          opening_time: string
          other_service: string | null
          product_images: Json
          products_offered: string[]
          rejection_reason: string | null
          service_categories: string[]
          status: string
          supplier_account_id: string
          supplier_profile_id: number
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          business_description?: string | null
          business_logo?: string | null
          business_name?: string
          category_id?: number | null
          cell_no?: string | null
          closing_time?: string
          date_created?: string
          date_updated?: string
          is_product_seller?: boolean
          is_service_provider?: boolean
          notes?: string | null
          opening_time?: string
          other_service?: string | null
          product_images?: Json
          products_offered?: string[]
          rejection_reason?: string | null
          service_categories?: string[]
          status?: string
          supplier_account_id: string
          supplier_profile_id?: never
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          business_description?: string | null
          business_logo?: string | null
          business_name?: string
          category_id?: number | null
          cell_no?: string | null
          closing_time?: string
          date_created?: string
          date_updated?: string
          is_product_seller?: boolean
          is_service_provider?: boolean
          notes?: string | null
          opening_time?: string
          other_service?: string | null
          product_images?: Json
          products_offered?: string[]
          rejection_reason?: string | null
          service_categories?: string[]
          status?: string
          supplier_account_id?: string
          supplier_profile_id?: never
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tb_supplier_profile_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tb_category"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "tb_supplier_profile_supplier_account_id_fkey"
            columns: ["supplier_account_id"]
            isOneToOne: true
            referencedRelation: "tb_supplier_account"
            referencedColumns: ["supplier_account_id"]
          },
        ]
      }
    }
    Views: {
      tb_public_supplier_listing: {
        Row: {
          business_description: string | null
          business_logo: string | null
          business_name: string | null
          category_name: string | null
          closing_time: string | null
          is_product_seller: boolean | null
          is_service_provider: boolean | null
          opening_time: string | null
          other_service: string | null
          product_images: Json | null
          products_offered: string[] | null
          public_area: string | null
          service_categories: string[] | null
          supplier_account_id: string | null
          supplier_profile_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tb_supplier_profile_supplier_account_id_fkey"
            columns: ["supplier_account_id"]
            isOneToOne: true
            referencedRelation: "tb_supplier_account"
            referencedColumns: ["supplier_account_id"]
          },
        ]
      }
    }
    Functions: {
      admin_supplier_monetization: {
        Args: never
        Returns: {
          has_active_subscription: boolean
          monetization_status: string
          supplier_account_id: string
          total_enquiries: number
        }[]
      }
      admin_top_profile_views: {
        Args: { _limit?: number }
        Returns: {
          business_name: string
          platform_total: number
          supplier_account_id: string
          total_views: number
          views_this_month: number
        }[]
      }
      can_supplier_receive_enquiries: {
        Args: { _supplier_account_id: string }
        Returns: boolean
      }
      get_my_lead_status: {
        Args: never
        Returns: {
          free_limit: number
          has_active_subscription: boolean
          monetization_status: string
          total_enquiries: number
        }[]
      }
      get_my_profile_view_stats: {
        Args: never
        Returns: {
          daily: Json
          total_views: number
          views_last_month: number
          views_this_month: number
          views_this_week: number
        }[]
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      record_profile_view: {
        Args: { _supplier_account_id: string; _visitor_id: string }
        Returns: boolean
      }
      supplier_has_active_subscription: {
        Args: { _supplier_account_id: string }
        Returns: boolean
      }
      supplier_monetization_status: {
        Args: { _active: boolean; _total: number }
        Returns: string
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
