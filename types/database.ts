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
      acknowledgments: {
        Row: {
          acknowledged_at: string | null
          company_profile_id: string
          created_at: string | null
          id: string
          listing_id: string
          responded_at: string | null
          status: string
          student_email_revealed: boolean | null
          student_profile_id: string
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          company_profile_id: string
          created_at?: string | null
          id?: string
          listing_id: string
          responded_at?: string | null
          status?: string
          student_email_revealed?: boolean | null
          student_profile_id: string
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          company_profile_id?: string
          created_at?: string | null
          id?: string
          listing_id?: string
          responded_at?: string | null
          status?: string
          student_email_revealed?: boolean | null
          student_profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acknowledgments_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acknowledgments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acknowledgments_student_profile_id_fkey"
            columns: ["student_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_whitelist: {
        Row: {
          added_at: string | null
          email: string
          id: string
        }
        Insert: {
          added_at?: string | null
          email: string
          id?: string
        }
        Update: {
          added_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          cover_note: string | null
          created_at: string | null
          id: string
          listing_id: string
          status: string
          student_profile_id: string
          updated_at: string | null
        }
        Insert: {
          cover_note?: string | null
          created_at?: string | null
          id?: string
          listing_id: string
          status?: string
          student_profile_id: string
          updated_at?: string | null
        }
        Update: {
          cover_note?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string
          status?: string
          student_profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_student_profile_id_fkey"
            columns: ["student_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profiles: {
        Row: {
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          company_description: string | null
          company_email: string
          company_name: string
          company_website: string | null
          created_at: string | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          profile_id: string
          rejection_reason: string | null
          size_range: string | null
          updated_at: string | null
        }
        Insert: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          company_description?: string | null
          company_email: string
          company_name: string
          company_website?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          profile_id: string
          rejection_reason?: string | null
          size_range?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          company_description?: string | null
          company_email?: string
          company_name?: string
          company_website?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          profile_id?: string
          rejection_reason?: string | null
          size_range?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_profiles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_subscriptions: {
        Row: {
          company_profile_id: string
          created_at: string | null
          id: string
          student_profile_id: string
        }
        Insert: {
          company_profile_id: string
          created_at?: string | null
          id?: string
          student_profile_id: string
        }
        Update: {
          company_profile_id?: string
          created_at?: string | null
          id?: string
          student_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_subscriptions_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_subscriptions_student_profile_id_fkey"
            columns: ["student_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faculties: {
        Row: {
          abbreviation: string
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          abbreviation: string
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          abbreviation?: string
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      listing_skills: {
        Row: {
          id: string
          listing_id: string
          skill_id: string
        }
        Insert: {
          id?: string
          listing_id: string
          skill_id: string
        }
        Update: {
          id?: string
          listing_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_skills_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          company_profile_id: string
          created_at: string | null
          description: string
          experience_level: string | null
          focus_area: string | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          listing_type: string
          slots_remaining: number
          title: string
          total_slots: number
          updated_at: string | null
        }
        Insert: {
          company_profile_id: string
          created_at?: string | null
          description: string
          experience_level?: string | null
          focus_area?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          listing_type: string
          slots_remaining: number
          title: string
          total_slots: number
          updated_at?: string | null
        }
        Update: {
          company_profile_id?: string
          created_at?: string | null
          description?: string
          experience_level?: string | null
          focus_area?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          listing_type?: string
          slots_remaining?: number
          title?: string
          total_slots?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          recipient_id: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          cv_url: string | null
          full_name: string | null
          github_url: string | null
          id: string
          is_verified_student: boolean | null
          linkedin_url: string | null
          phone: string | null
          portfolio_url: string | null
          profile_completeness: number | null
          role: string
          ukim_email: string | null
          updated_at: string | null
          username: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          cv_url?: string | null
          full_name?: string | null
          github_url?: string | null
          id: string
          is_verified_student?: boolean | null
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          profile_completeness?: number | null
          role: string
          ukim_email?: string | null
          updated_at?: string | null
          username: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          cv_url?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          is_verified_student?: boolean | null
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          profile_completeness?: number | null
          role?: string
          ukim_email?: string | null
          updated_at?: string | null
          username?: string
          website_url?: string | null
        }
        Relationships: []
      }
      skill_categories: {
        Row: {
          id: string
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category_id: string
          id: string
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          category_id: string
          id?: string
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          category_id?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "skill_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          created_at: string | null
          degree_type: string | null
          experience_level: string | null
          faculty: string | null
          focus_area: string | null
          graduation_year: number | null
          id: string
          profile_id: string
          short_description: string | null
          university: string | null
          updated_at: string | null
          year_of_study: number | null
        }
        Insert: {
          created_at?: string | null
          degree_type?: string | null
          experience_level?: string | null
          faculty?: string | null
          focus_area?: string | null
          graduation_year?: number | null
          id?: string
          profile_id: string
          short_description?: string | null
          university?: string | null
          updated_at?: string | null
          year_of_study?: number | null
        }
        Update: {
          created_at?: string | null
          degree_type?: string | null
          experience_level?: string | null
          faculty?: string | null
          focus_area?: string | null
          graduation_year?: number | null
          id?: string
          profile_id?: string
          short_description?: string | null
          university?: string | null
          updated_at?: string | null
          year_of_study?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_skills: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string
          skill_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id: string
          skill_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_profile_completeness: {
        Args: { p_profile_id: string }
        Returns: number
      }
      get_anonymous_student_card: {
        Args: { p_student_profile_id: string }
        Returns: Json
      }
      get_skill_match_score: {
        Args: { p_listing_id: string; p_student_profile_id: string }
        Returns: number
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
