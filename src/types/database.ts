// Database types for the staff app - mirrors the client app's Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          phone: string
          email: string
          status: string
          qr_token: string
          preferred_location_id: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      loyalty_accounts: {
        Row: {
          customer_id: string
          visits_total: number
          points_balance: number
          last_visit_at: string | null
          last_activity_at: string | null
          created_at: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      points_movements: {
        Row: {
          id: string
          customer_id: string
          type: string
          points: number
          reason: string
          ref_type: string | null
          ref_id: string | null
          created_at: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      rewards: {
        Row: {
          id: string
          customer_id: string
          type: string
          status: string
          code: string
          expires_at: string
          redeemed_at: string | null
          created_at: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      services: {
        Row: {
          id: string
          name: string
          category: string | null
          duration_min: number | null
          active: boolean
          fixed_points: number | null
          base_price: number | null
          location_id: string | null
          section: string | null
          created_at: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      locations: {
        Row: {
          id: string
          name: string
          address: string
          hours_json: Json
          whatsapp_contact: string | null
          created_at: string
          updated_at: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          action: string
          actor_id: string | null
          actor_role: string
          entity: string
          entity_id: string
          location_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      qr_scan_logs: {
        Row: {
          id: string
          customer_id: string
          appointment_id: string | null
          scanned_by_staff_id: string | null
          scanned_at: string
          result: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      verification_pins: {
        Row: {
          id: string
          customer_id: string
          pin: string
          expires_at: string
          used: boolean
          created_by_staff_id: string | null
          created_at: string
        }
        Insert: {
          customer_id: string
          pin: string
          expires_at: string
          created_by_staff_id?: string | null
          [key: string]: unknown
        }
        Update: Record<string, unknown>
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          id: string
          customer_id: string
          appointment_id: string | null
          type: string
          points: number
          description: string | null
          created_by_user_id: string | null
          created_at: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      has_role: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "staff" | "customer"
      customer_status: "PENDING_VERIFICATION" | "ACTIVE" | "DISABLED"
      appointment_status: "CONFIRMED" | "RESCHEDULED" | "CANCELLED" | "COMPLETED" | "NO_SHOW"
      audit_actor_role: "CUSTOMER" | "STAFF" | "MANAGER" | "ADMIN" | "SYSTEM"
      points_movement_type: "EARN" | "REDEEM" | "ADJUST" | "EXPIRE"
      reward_status: "AVAILABLE" | "REDEEMED" | "EXPIRED"
      reward_type: "SCALP_DIAGNOSIS" | "EXPRESS_TREATMENT" | "RETAIL_VOUCHER" | "PACK_UPGRADE" | "CUSTOM"
      salon_section: "CABALLEROS" | "SENORAS" | "ESTETICA"
    }
    CompositeTypes: Record<string, never>
  }
}
