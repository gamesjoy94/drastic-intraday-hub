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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      mt5_accounts: {
        Row: {
          bridge_account_id: string | null
          created_at: string
          id: string
          is_active: boolean
          is_demo: boolean
          label: string
          last_connected_at: string | null
          login: string
          server_name: string
          symbol_suffix: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bridge_account_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_demo?: boolean
          label: string
          last_connected_at?: string | null
          login: string
          server_name: string
          symbol_suffix?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          bridge_account_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_demo?: boolean
          label?: string
          last_connected_at?: string | null
          login?: string
          server_name?: string
          symbol_suffix?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mt5_orders: {
        Row: {
          account_id: string | null
          closed_at: string | null
          created_at: string
          error: string | null
          fill_price: number | null
          id: string
          requested_price: number | null
          retcode: number | null
          side: string
          signal_id: string | null
          status: string
          stop_loss: number | null
          symbol: string
          take_profit: number | null
          ticket: string | null
          updated_at: string
          user_id: string
          volume: number
        }
        Insert: {
          account_id?: string | null
          closed_at?: string | null
          created_at?: string
          error?: string | null
          fill_price?: number | null
          id?: string
          requested_price?: number | null
          retcode?: number | null
          side: string
          signal_id?: string | null
          status?: string
          stop_loss?: number | null
          symbol: string
          take_profit?: number | null
          ticket?: string | null
          updated_at?: string
          user_id?: string
          volume: number
        }
        Update: {
          account_id?: string | null
          closed_at?: string | null
          created_at?: string
          error?: string | null
          fill_price?: number | null
          id?: string
          requested_price?: number | null
          retcode?: number | null
          side?: string
          signal_id?: string | null
          status?: string
          stop_loss?: number | null
          symbol?: string
          take_profit?: number | null
          ticket?: string | null
          updated_at?: string
          user_id?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "mt5_orders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "mt5_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mt5_orders_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "mt5_signals"
            referencedColumns: ["id"]
          },
        ]
      }
      mt5_risk_settings: {
        Row: {
          allowed_symbols: string[]
          auto_trading_enabled: boolean
          created_at: string
          kill_switch_engaged: boolean
          max_open_positions: number
          max_position_size: number
          max_risk_percentage: number
          max_slippage_percentage: number
          min_confidence: number
          require_manual_confirm: boolean
          updated_at: string
          use_stop_loss: boolean
          use_take_profit: boolean
          user_id: string
        }
        Insert: {
          allowed_symbols?: string[]
          auto_trading_enabled?: boolean
          created_at?: string
          kill_switch_engaged?: boolean
          max_open_positions?: number
          max_position_size?: number
          max_risk_percentage?: number
          max_slippage_percentage?: number
          min_confidence?: number
          require_manual_confirm?: boolean
          updated_at?: string
          use_stop_loss?: boolean
          use_take_profit?: boolean
          user_id?: string
        }
        Update: {
          allowed_symbols?: string[]
          auto_trading_enabled?: boolean
          created_at?: string
          kill_switch_engaged?: boolean
          max_open_positions?: number
          max_position_size?: number
          max_risk_percentage?: number
          max_slippage_percentage?: number
          min_confidence?: number
          require_manual_confirm?: boolean
          updated_at?: string
          use_stop_loss?: boolean
          use_take_profit?: boolean
          user_id?: string
        }
        Relationships: []
      }
      mt5_signals: {
        Row: {
          account_id: string | null
          confidence: number | null
          created_at: string
          current_price: number | null
          dedupe_key: string | null
          direction: string
          entry: number | null
          executed: boolean
          id: string
          raw: Json | null
          reason: string | null
          stop_loss: number | null
          symbol: string
          take_profit: number | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          confidence?: number | null
          created_at?: string
          current_price?: number | null
          dedupe_key?: string | null
          direction: string
          entry?: number | null
          executed?: boolean
          id?: string
          raw?: Json | null
          reason?: string | null
          stop_loss?: number | null
          symbol: string
          take_profit?: number | null
          user_id?: string
        }
        Update: {
          account_id?: string | null
          confidence?: number | null
          created_at?: string
          current_price?: number | null
          dedupe_key?: string | null
          direction?: string
          entry?: number | null
          executed?: boolean
          id?: string
          raw?: Json | null
          reason?: string | null
          stop_loss?: number | null
          symbol?: string
          take_profit?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mt5_signals_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "mt5_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
