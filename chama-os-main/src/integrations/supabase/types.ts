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
      billing_subscriptions: {
        Row: {
          chama_id: string
          plan: string
          renews_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          chama_id: string
          plan?: string
          renews_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          chama_id?: string
          plan?: string
          renews_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_subscriptions_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: true
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_invites: {
        Row: {
          accepted_at: string | null
          chama_id: string
          created_at: string
          email: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["invite_status"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          chama_id: string
          created_at?: string
          email: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          chama_id?: string
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "chama_invites_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      chamas: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          invite_code: string
          location: string | null
          name: string
          rules: Json
          type: Database["public"]["Enums"]["chama_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          invite_code?: string
          location?: string | null
          name: string
          rules?: Json
          type?: Database["public"]["Enums"]["chama_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          invite_code?: string
          location?: string | null
          name?: string
          rules?: Json
          type?: Database["public"]["Enums"]["chama_type"]
          updated_at?: string
        }
        Relationships: []
      }
      contributions: {
        Row: {
          amount: number
          chama_id: string
          edited_at: string | null
          edited_by: string | null
          id: string
          member_id: string
          notes: string | null
          recorded_at: string
          recorded_by: string
          type: Database["public"]["Enums"]["contribution_type"]
        }
        Insert: {
          amount: number
          chama_id: string
          edited_at?: string | null
          edited_by?: string | null
          id?: string
          member_id: string
          notes?: string | null
          recorded_at?: string
          recorded_by: string
          type: Database["public"]["Enums"]["contribution_type"]
        }
        Update: {
          amount?: number
          chama_id?: string
          edited_at?: string | null
          edited_by?: string | null
          id?: string
          member_id?: string
          notes?: string | null
          recorded_at?: string
          recorded_by?: string
          type?: Database["public"]["Enums"]["contribution_type"]
        }
        Relationships: [
          {
            foreignKeyName: "contributions_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          author_id: string
          body: string
          chama_id: string
          created_at: string
          id: string
          is_announcement: boolean
        }
        Insert: {
          author_id: string
          body: string
          chama_id: string
          created_at?: string
          id?: string
          is_announcement?: boolean
        }
        Update: {
          author_id?: string
          body?: string
          chama_id?: string
          created_at?: string
          id?: string
          is_announcement?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "feed_posts_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          category: string | null
          chama_id: string
          created_at: string
          current_value: number
          id: string
          initial_value: number
          monthly_income: number
          name: string
          notes: string | null
        }
        Insert: {
          category?: string | null
          chama_id: string
          created_at?: string
          current_value?: number
          id?: string
          initial_value?: number
          monthly_income?: number
          name: string
          notes?: string | null
        }
        Update: {
          category?: string | null
          chama_id?: string
          created_at?: string
          current_value?: number
          id?: string
          initial_value?: number
          monthly_income?: number
          name?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investments_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_guarantors: {
        Row: {
          guarantor_id: string
          id: string
          loan_id: string
          responded_at: string | null
          status: Database["public"]["Enums"]["guarantor_status"]
        }
        Insert: {
          guarantor_id: string
          id?: string
          loan_id: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["guarantor_status"]
        }
        Update: {
          guarantor_id?: string
          id?: string
          loan_id?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["guarantor_status"]
        }
        Relationships: [
          {
            foreignKeyName: "loan_guarantors_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          amount: number
          amount_repaid: number
          applied_at: string
          borrower_id: string
          chair_notes: string | null
          chama_id: string
          decided_at: string | null
          id: string
          purpose: string
          repayment_months: number
          status: Database["public"]["Enums"]["loan_status"]
          treasurer_notes: string | null
        }
        Insert: {
          amount: number
          amount_repaid?: number
          applied_at?: string
          borrower_id: string
          chair_notes?: string | null
          chama_id: string
          decided_at?: string | null
          id?: string
          purpose: string
          repayment_months?: number
          status?: Database["public"]["Enums"]["loan_status"]
          treasurer_notes?: string | null
        }
        Update: {
          amount?: number
          amount_repaid?: number
          applied_at?: string
          borrower_id?: string
          chair_notes?: string | null
          chama_id?: string
          decided_at?: string | null
          id?: string
          purpose?: string
          repayment_months?: number
          status?: Database["public"]["Enums"]["loan_status"]
          treasurer_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loans_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_attendance: {
        Row: {
          meeting_id: string
          present: boolean
          user_id: string
        }
        Insert: {
          meeting_id: string
          present?: boolean
          user_id: string
        }
        Update: {
          meeting_id?: string
          present?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_attendance_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agenda: string | null
          chama_id: string
          created_at: string
          created_by: string | null
          id: string
          location: string | null
          minutes: string | null
          scheduled_at: string
          title: string
        }
        Insert: {
          agenda?: string | null
          chama_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          minutes?: string | null
          scheduled_at: string
          title: string
        }
        Update: {
          agenda?: string | null
          chama_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          minutes?: string | null
          scheduled_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          chama_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          chama_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          chama_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          chama_id: string | null
          created_at: string
          id: string
          kind: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          chama_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          chama_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_private: {
        Row: {
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      transparency_logs: {
        Row: {
          action: string
          chama_id: string
          created_at: string
          edited_by: string
          id: string
          new_value: Json | null
          previous_value: Json | null
          reason: string | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          chama_id: string
          created_at?: string
          edited_by: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          reason?: string | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          chama_id?: string
          created_at?: string
          edited_by?: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          reason?: string | null
          record_id?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "transparency_logs_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_chama_invite_code: { Args: { _chama: string }; Returns: string }
      has_chama_role: {
        Args: {
          _chama: string
          _role: Database["public"]["Enums"]["app_role"]
          _user: string
        }
        Returns: boolean
      }
      is_member_of: {
        Args: { _chama: string; _user: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "chairperson" | "treasurer" | "secretary" | "member"
      chama_type:
        | "investment"
        | "welfare"
        | "sacco"
        | "table_banking"
        | "women"
        | "men"
        | "youth"
        | "church"
        | "community"
      contribution_type:
        | "savings"
        | "welfare"
        | "project"
        | "penalty"
        | "withdrawal"
        | "investment"
      guarantor_status: "pending" | "approved" | "rejected"
      invite_status: "pending" | "accepted" | "revoked"
      loan_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "active"
        | "completed"
        | "overdue"
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
      app_role: ["chairperson", "treasurer", "secretary", "member"],
      chama_type: [
        "investment",
        "welfare",
        "sacco",
        "table_banking",
        "women",
        "men",
        "youth",
        "church",
        "community",
      ],
      contribution_type: [
        "savings",
        "welfare",
        "project",
        "penalty",
        "withdrawal",
        "investment",
      ],
      guarantor_status: ["pending", "approved", "rejected"],
      invite_status: ["pending", "accepted", "revoked"],
      loan_status: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "active",
        "completed",
        "overdue",
      ],
    },
  },
} as const
