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
      accountability_checkins: {
        Row: {
          created_at: string | null
          id: string
          message: string
          partner_id: string
          partner_name: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          partner_id: string
          partner_name: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          partner_id?: string
          partner_name?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      accountability_partners: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_emergency: boolean | null
          name: string
          phone: string | null
          relationship: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_emergency?: boolean | null
          name: string
          phone?: string | null
          relationship?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_emergency?: boolean | null
          name?: string
          phone?: string | null
          relationship?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      achievement: {
        Row: {
          category: string | null
          created_at: string | null
          criteria: Json | null
          description: string | null
          icon: string | null
          id: string
          reward_points: number | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          reward_points?: number | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          reward_points?: number | null
          title?: string
        }
        Relationships: []
      }
      achievement_definitions: {
        Row: {
          created_at: string | null
          criteria: Json
          description: string
          icon: string | null
          id: string
          name: string
          points_reward: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          criteria: Json
          description: string
          icon?: string | null
          id?: string
          name: string
          points_reward?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          criteria?: Json
          description?: string
          icon?: string | null
          id?: string
          name?: string
          points_reward?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      achievement_progress: {
        Row: {
          achievement_id: string
          created_at: string | null
          current_progress: number | null
          id: string
          unlocked_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          current_progress?: number | null
          id?: string
          unlocked_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          current_progress?: number | null
          id?: string
          unlocked_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_progress_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievement_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      achievement_rules: {
        Row: {
          badge_icon: string | null
          category: string | null
          created_at: string | null
          description: string
          id: string
          level: number | null
          name: string
          points_reward: number | null
          rarity: string | null
          trigger_type: string
          trigger_value: number
          updated_at: string | null
        }
        Insert: {
          badge_icon?: string | null
          category?: string | null
          created_at?: string | null
          description: string
          id?: string
          level?: number | null
          name: string
          points_reward?: number | null
          rarity?: string | null
          trigger_type: string
          trigger_value: number
          updated_at?: string | null
        }
        Update: {
          badge_icon?: string | null
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          level?: number | null
          name?: string
          points_reward?: number | null
          rarity?: string | null
          trigger_type?: string
          trigger_value?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      activity_feed: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          target_id: string
          target_name: string | null
          target_type: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          target_id: string
          target_name?: string | null
          target_type: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          target_id?: string
          target_name?: string | null
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          group_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          group_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          group_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_group"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_points_log: {
        Row: {
          activity_name: string | null
          activity_type: string
          created_at: string | null
          id: string
          points_earned: number
          user_id: string | null
        }
        Insert: {
          activity_name?: string | null
          activity_type: string
          created_at?: string | null
          id?: string
          points_earned: number
          user_id?: string | null
        }
        Update: {
          activity_name?: string | null
          activity_type?: string
          created_at?: string | null
          id?: string
          points_earned?: number
          user_id?: string | null
        }
        Relationships: []
      }
      ad_clicks: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          impression_id: string | null
          ip_address: unknown
          publisher_id: string
          revenue: number | null
          user_agent: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          impression_id?: string | null
          ip_address?: unknown
          publisher_id: string
          revenue?: number | null
          user_agent?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          impression_id?: string | null
          ip_address?: unknown
          publisher_id?: string
          revenue?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_clicks_impression_id_fkey"
            columns: ["impression_id"]
            isOneToOne: false
            referencedRelation: "ad_impressions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_clicks_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "ad_publishers"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_earnings: {
        Row: {
          clicks: number | null
          created_at: string | null
          ctr: number | null
          date: string
          earnings: number | null
          ecpm: number | null
          id: string
          impressions: number | null
          publisher_id: string
          updated_at: string | null
        }
        Insert: {
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          date: string
          earnings?: number | null
          ecpm?: number | null
          id?: string
          impressions?: number | null
          publisher_id: string
          updated_at?: string | null
        }
        Update: {
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          earnings?: number | null
          ecpm?: number | null
          id?: string
          impressions?: number | null
          publisher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_earnings_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "ad_publishers"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_impressions: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          page_url: string | null
          publisher_id: string
          revenue: number | null
          user_agent: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          page_url?: string | null
          publisher_id: string
          revenue?: number | null
          user_agent?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          page_url?: string | null
          publisher_id?: string
          revenue?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_impressions_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "ad_publishers"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_payouts: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          notes: string | null
          payment_details: Json | null
          payment_method: string | null
          processed_at: string | null
          publisher_id: string
          requested_at: string | null
          status: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_details?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          publisher_id: string
          requested_at?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_details?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          publisher_id?: string
          requested_at?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_payouts_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "ad_publishers"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_publishers: {
        Row: {
          approved_at: string | null
          available_balance: number | null
          category: string | null
          created_at: string | null
          earnings: number | null
          id: string
          lifetime_earnings: number | null
          minimum_payout: number | null
          monthly_traffic: number | null
          payment_details: Json | null
          payment_method: string | null
          placement_types: Json | null
          publisher_code: string
          status: string | null
          updated_at: string | null
          user_id: string
          website_name: string | null
          website_url: string
        }
        Insert: {
          approved_at?: string | null
          available_balance?: number | null
          category?: string | null
          created_at?: string | null
          earnings?: number | null
          id?: string
          lifetime_earnings?: number | null
          minimum_payout?: number | null
          monthly_traffic?: number | null
          payment_details?: Json | null
          payment_method?: string | null
          placement_types?: Json | null
          publisher_code: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          website_name?: string | null
          website_url: string
        }
        Update: {
          approved_at?: string | null
          available_balance?: number | null
          category?: string | null
          created_at?: string | null
          earnings?: number | null
          id?: string
          lifetime_earnings?: number | null
          minimum_payout?: number | null
          monthly_traffic?: number | null
          payment_details?: Json | null
          payment_method?: string | null
          placement_types?: Json | null
          publisher_code?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          website_name?: string | null
          website_url?: string
        }
        Relationships: []
      }
      adhoc_medicines: {
        Row: {
          cared_one_id: string
          created_at: string | null
          dosage: string | null
          id: string
          medicine_name: string
          notes: string | null
          reason: string | null
          taken_at: string
          user_id: string
        }
        Insert: {
          cared_one_id: string
          created_at?: string | null
          dosage?: string | null
          id?: string
          medicine_name: string
          notes?: string | null
          reason?: string | null
          taken_at: string
          user_id: string
        }
        Update: {
          cared_one_id?: string
          created_at?: string | null
          dosage?: string | null
          id?: string
          medicine_name?: string
          notes?: string | null
          reason?: string | null
          taken_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_email: {
        Row: {
          attachments: Json | null
          bcc_email: string[] | null
          body_html: string | null
          body_text: string | null
          cc_email: string[] | null
          created_at: string | null
          folder: string | null
          from_email: string
          from_name: string | null
          id: string
          is_archived: boolean | null
          is_draft: boolean | null
          is_read: boolean | null
          is_sent: boolean | null
          is_starred: boolean | null
          is_trash: boolean | null
          labels: string[] | null
          message_id: string | null
          received_at: string | null
          sent_at: string | null
          sent_by: string | null
          snippet: string | null
          subject: string
          thread_id: string | null
          to_email: string[]
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          bcc_email?: string[] | null
          body_html?: string | null
          body_text?: string | null
          cc_email?: string[] | null
          created_at?: string | null
          folder?: string | null
          from_email: string
          from_name?: string | null
          id?: string
          is_archived?: boolean | null
          is_draft?: boolean | null
          is_read?: boolean | null
          is_sent?: boolean | null
          is_starred?: boolean | null
          is_trash?: boolean | null
          labels?: string[] | null
          message_id?: string | null
          received_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          snippet?: string | null
          subject: string
          thread_id?: string | null
          to_email: string[]
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          bcc_email?: string[] | null
          body_html?: string | null
          body_text?: string | null
          cc_email?: string[] | null
          created_at?: string | null
          folder?: string | null
          from_email?: string
          from_name?: string | null
          id?: string
          is_archived?: boolean | null
          is_draft?: boolean | null
          is_read?: boolean | null
          is_sent?: boolean | null
          is_starred?: boolean | null
          is_trash?: boolean | null
          labels?: string[] | null
          message_id?: string | null
          received_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          snippet?: string | null
          subject?: string
          thread_id?: string | null
          to_email?: string[]
          updated_at?: string | null
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      advertisements: {
        Row: {
          ad_type: string
          budget: number
          clicks: number | null
          created_at: string | null
          daily_budget: number | null
          end_date: string
          id: string
          impressions: number | null
          product_id: string
          spent_amount: number | null
          start_date: string
          status: string | null
          target_audience: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ad_type: string
          budget: number
          clicks?: number | null
          created_at?: string | null
          daily_budget?: number | null
          end_date: string
          id?: string
          impressions?: number | null
          product_id: string
          spent_amount?: number | null
          start_date: string
          status?: string | null
          target_audience?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ad_type?: string
          budget?: number
          clicks?: number | null
          created_at?: string | null
          daily_budget?: number | null
          end_date?: string
          id?: string
          impressions?: number | null
          product_id?: string
          spent_amount?: number | null
          start_date?: string
          status?: string | null
          target_audience?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advertisements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_commissions: {
        Row: {
          affiliate_link_id: string | null
          affiliate_percentage: number | null
          affiliate_user_id: string | null
          commission_amount: number | null
          created_at: string | null
          id: string
          platform_commission_rate: number | null
          product_id: string | null
          product_price: number | null
          purchase_id: string | null
          status: string | null
        }
        Insert: {
          affiliate_link_id?: string | null
          affiliate_percentage?: number | null
          affiliate_user_id?: string | null
          commission_amount?: number | null
          created_at?: string | null
          id?: string
          platform_commission_rate?: number | null
          product_id?: string | null
          product_price?: number | null
          purchase_id?: string | null
          status?: string | null
        }
        Update: {
          affiliate_link_id?: string | null
          affiliate_percentage?: number | null
          affiliate_user_id?: string | null
          commission_amount?: number | null
          created_at?: string | null
          id?: string
          platform_commission_rate?: number | null
          product_id?: string | null
          product_price?: number | null
          purchase_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_affiliate_link_id_fkey"
            columns: ["affiliate_link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_affiliate_user_id_fkey"
            columns: ["affiliate_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_interactions: {
        Row: {
          affiliate_link: string | null
          created_at: string
          id: string
          interaction_type: string | null
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          affiliate_link?: string | null
          created_at?: string
          id?: string
          interaction_type?: string | null
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          affiliate_link?: string | null
          created_at?: string
          id?: string
          interaction_type?: string | null
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_interactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "deprecated_smokeless_products"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_links: {
        Row: {
          clicks_count: number | null
          code: string
          created_at: string | null
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          clicks_count?: number | null
          code: string
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          clicks_count?: number | null
          code?: string
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_sessions: {
        Row: {
          affiliate_link_id: string | null
          clicked_at: string | null
          clicked_product_id: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          affiliate_link_id?: string | null
          clicked_at?: string | null
          clicked_product_id?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          affiliate_link_id?: string | null
          clicked_at?: string | null
          clicked_product_id?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_sessions_affiliate_link_id_fkey"
            columns: ["affiliate_link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_sessions_clicked_product_id_fkey"
            columns: ["clicked_product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_message: {
        Row: {
          created_at: string | null
          id: string
          is_user: boolean
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_user: boolean
          message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_user?: boolean
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_response: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string | null
          id: string
          response_text: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          id?: string
          response_text: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          id?: string
          response_text?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_service: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      announcement_comments: {
        Row: {
          announcement_id: string | null
          author_id: string | null
          content: string
          created_at: string | null
          id: string
        }
        Insert: {
          announcement_id?: string | null
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
        }
        Update: {
          announcement_id?: string | null
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_comments_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          announcement_type: string | null
          attachments: Json | null
          author_id: string | null
          comments_count: number | null
          content: string
          created_at: string | null
          group_id: string | null
          help_needed: boolean | null
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          needs_met: boolean | null
          occasions: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          announcement_type?: string | null
          attachments?: Json | null
          author_id?: string | null
          comments_count?: number | null
          content: string
          created_at?: string | null
          group_id?: string | null
          help_needed?: boolean | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          needs_met?: boolean | null
          occasions?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          announcement_type?: string | null
          attachments?: Json | null
          author_id?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string | null
          group_id?: string | null
          help_needed?: boolean | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          needs_met?: boolean | null
          occasions?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_group"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          last_used_at: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          last_used_at?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          last_used_at?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      app_features: {
        Row: {
          created_at: string | null
          description: string
          icon: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title?: string
        }
        Relationships: []
      }
      app_reviews: {
        Row: {
          created_at: string | null
          days_smoke_free: number | null
          id: string
          quit_success: boolean | null
          rating: number
          review_text: string | null
          reviewer_name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          days_smoke_free?: number | null
          id?: string
          quit_success?: boolean | null
          rating: number
          review_text?: string | null
          reviewer_name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          days_smoke_free?: number | null
          id?: string
          quit_success?: boolean | null
          rating?: number
          review_text?: string | null
          reviewer_name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      app_session: {
        Row: {
          app_version: string | null
          created_at: string | null
          features_enabled: Json | null
          id: string
          is_native: boolean | null
          platform: string
          session_end: string | null
          session_start: string | null
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          created_at?: string | null
          features_enabled?: Json | null
          id?: string
          is_native?: boolean | null
          platform: string
          session_end?: string | null
          session_start?: string | null
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          created_at?: string | null
          features_enabled?: Json | null
          id?: string
          is_native?: boolean | null
          platform?: string
          session_end?: string | null
          session_start?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      app_statistics: {
        Row: {
          id: string
          stat_name: string
          stat_value: number
          updated_at: string | null
        }
        Insert: {
          id?: string
          stat_name: string
          stat_value: number
          updated_at?: string | null
        }
        Update: {
          id?: string
          stat_name?: string
          stat_value?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      background_checks: {
        Row: {
          adjudication: string | null
          checkr_candidate_id: string | null
          checkr_report_id: string | null
          completed_at: string | null
          created_at: string | null
          dispute_reason: string | null
          expires_at: string | null
          id: string
          initiated_at: string | null
          last_updated: string | null
          metadata: Json | null
          package_type: string | null
          provider_id: string | null
          report_status: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          adjudication?: string | null
          checkr_candidate_id?: string | null
          checkr_report_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          dispute_reason?: string | null
          expires_at?: string | null
          id?: string
          initiated_at?: string | null
          last_updated?: string | null
          metadata?: Json | null
          package_type?: string | null
          provider_id?: string | null
          report_status?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          adjudication?: string | null
          checkr_candidate_id?: string | null
          checkr_report_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          dispute_reason?: string | null
          expires_at?: string | null
          id?: string
          initiated_at?: string | null
          last_updated?: string | null
          metadata?: Json | null
          package_type?: string | null
          provider_id?: string | null
          report_status?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "background_checks_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "care_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      badge: {
        Row: {
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id: string
          image_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      badge_definitions: {
        Row: {
          category: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
          target_count: number | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          icon?: string | null
          id: string
          name: string
          sort_order?: number | null
          target_count?: number | null
        }
        Update: {
          category?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          target_count?: number | null
        }
        Relationships: []
      }
      beverage_logs: {
        Row: {
          amount_ml: number
          beverage_type_id: string | null
          created_at: string | null
          custom_name: string | null
          id: string
          logged_at: string
          user_id: string
        }
        Insert: {
          amount_ml: number
          beverage_type_id?: string | null
          created_at?: string | null
          custom_name?: string | null
          id?: string
          logged_at?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          beverage_type_id?: string | null
          created_at?: string | null
          custom_name?: string | null
          id?: string
          logged_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beverage_logs_beverage_type_id_fkey"
            columns: ["beverage_type_id"]
            isOneToOne: false
            referencedRelation: "beverage_types"
            referencedColumns: ["id"]
          },
        ]
      }
      beverage_types: {
        Row: {
          alcohol_content: number | null
          caffeine_content: number | null
          calories: number | null
          created_at: string | null
          id: string
          name: string
          water_content: number
        }
        Insert: {
          alcohol_content?: number | null
          caffeine_content?: number | null
          calories?: number | null
          created_at?: string | null
          id?: string
          name: string
          water_content?: number
        }
        Update: {
          alcohol_content?: number | null
          caffeine_content?: number | null
          calories?: number | null
          created_at?: string | null
          id?: string
          name?: string
          water_content?: number
        }
        Relationships: []
      }
      blocked_content_log: {
        Row: {
          blocked_at: string | null
          blocked_domain: string
          blocked_url: string
          browser: string | null
          category: string
          id: string
          page_title: string | null
          platform: string | null
          reason: string | null
          trigger_type: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_domain: string
          blocked_url: string
          browser?: string | null
          category: string
          id?: string
          page_title?: string | null
          platform?: string | null
          reason?: string | null
          trigger_type?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          blocked_at?: string | null
          blocked_domain?: string
          blocked_url?: string
          browser?: string | null
          category?: string
          id?: string
          page_title?: string | null
          platform?: string | null
          reason?: string | null
          trigger_type?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blocked_content_logs: {
        Row: {
          blocked_at: string | null
          blocked_domain: string | null
          blocked_url: string | null
          browser: string | null
          category: string | null
          id: string
          page_title: string | null
          platform: string | null
          trigger_type: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_domain?: string | null
          blocked_url?: string | null
          browser?: string | null
          category?: string | null
          id?: string
          page_title?: string | null
          platform?: string | null
          trigger_type?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          blocked_at?: string | null
          blocked_domain?: string | null
          blocked_url?: string | null
          browser?: string | null
          category?: string | null
          id?: string
          page_title?: string | null
          platform?: string | null
          trigger_type?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blocked_domain: {
        Row: {
          added_by: string | null
          block_level: string | null
          category: string
          created_at: string | null
          description: string | null
          domain: string
          id: string
          is_active: boolean | null
          is_custom: boolean | null
          severity: string | null
          subcategory: string | null
          updated_at: string | null
        }
        Insert: {
          added_by?: string | null
          block_level?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          domain: string
          id?: string
          is_active?: boolean | null
          is_custom?: boolean | null
          severity?: string | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Update: {
          added_by?: string | null
          block_level?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          is_custom?: boolean | null
          severity?: string | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blocked_items: {
        Row: {
          created_at: string
          id: string
          type: string
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          type: string
          user_id: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: string
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      blocked_keyword: {
        Row: {
          block_level: string | null
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_regex: boolean | null
          keyword: string
          severity: string | null
        }
        Insert: {
          block_level?: string | null
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_regex?: boolean | null
          keyword: string
          severity?: string | null
        }
        Update: {
          block_level?: string | null
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_regex?: boolean | null
          keyword?: string
          severity?: string | null
        }
        Relationships: []
      }
      board_members: {
        Row: {
          board_id: string
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          board_id: string
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          board_id?: string
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_members_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "kanban_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      booking: {
        Row: {
          appointment_date: string | null
          appointment_time: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          care_activities: Json | null
          care_recipient_id: string | null
          care_recipient_name: string | null
          caregiver_id: string | null
          check_in_location: Json | null
          check_in_time: string | null
          check_out_location: Json | null
          check_out_time: string | null
          created_at: string | null
          duration_hours: number | null
          end_time: string | null
          helper_id: string | null
          hourly_rate: number | null
          id: string
          location: string | null
          payment_status: string | null
          provider_id: string | null
          provider_notes: string | null
          recurring_booking_id: string | null
          service_type: string | null
          special_instructions: string | null
          start_time: string | null
          status: string | null
          total_cost: number | null
          updated_at: string | null
          user_id: string | null
          visit_completed_at: string | null
          visit_rating: number | null
          visit_summary: string | null
        }
        Insert: {
          appointment_date?: string | null
          appointment_time?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          care_activities?: Json | null
          care_recipient_id?: string | null
          care_recipient_name?: string | null
          caregiver_id?: string | null
          check_in_location?: Json | null
          check_in_time?: string | null
          check_out_location?: Json | null
          check_out_time?: string | null
          created_at?: string | null
          duration_hours?: number | null
          end_time?: string | null
          helper_id?: string | null
          hourly_rate?: number | null
          id?: string
          location?: string | null
          payment_status?: string | null
          provider_id?: string | null
          provider_notes?: string | null
          recurring_booking_id?: string | null
          service_type?: string | null
          special_instructions?: string | null
          start_time?: string | null
          status?: string | null
          total_cost?: number | null
          updated_at?: string | null
          user_id?: string | null
          visit_completed_at?: string | null
          visit_rating?: number | null
          visit_summary?: string | null
        }
        Update: {
          appointment_date?: string | null
          appointment_time?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          care_activities?: Json | null
          care_recipient_id?: string | null
          care_recipient_name?: string | null
          caregiver_id?: string | null
          check_in_location?: Json | null
          check_in_time?: string | null
          check_out_location?: Json | null
          check_out_time?: string | null
          created_at?: string | null
          duration_hours?: number | null
          end_time?: string | null
          helper_id?: string | null
          hourly_rate?: number | null
          id?: string
          location?: string | null
          payment_status?: string | null
          provider_id?: string | null
          provider_notes?: string | null
          recurring_booking_id?: string | null
          service_type?: string | null
          special_instructions?: string | null
          start_time?: string | null
          status?: string | null
          total_cost?: number | null
          updated_at?: string | null
          user_id?: string | null
          visit_completed_at?: string | null
          visit_rating?: number | null
          visit_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "care_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_requests: {
        Row: {
          created_at: string | null
          duration_hours: number
          expires_at: string | null
          id: string
          location: string | null
          proposed_rate: number | null
          provider_id: string | null
          provider_response: string | null
          requested_date: string
          requested_time: string
          responded_at: string | null
          service_type: string | null
          special_instructions: string | null
          status: string | null
          updated_at: string | null
          urgency: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_hours: number
          expires_at?: string | null
          id?: string
          location?: string | null
          proposed_rate?: number | null
          provider_id?: string | null
          provider_response?: string | null
          requested_date: string
          requested_time: string
          responded_at?: string | null
          service_type?: string | null
          special_instructions?: string | null
          status?: string | null
          updated_at?: string | null
          urgency?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_hours?: number
          expires_at?: string | null
          id?: string
          location?: string | null
          proposed_rate?: number | null
          provider_id?: string | null
          provider_response?: string | null
          requested_date?: string
          requested_time?: string
          responded_at?: string | null
          service_type?: string | null
          special_instructions?: string | null
          status?: string | null
          updated_at?: string | null
          urgency?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "care_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_reschedule_proposals: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          proposed_by: string | null
          proposed_end_time: string
          proposed_start_time: string
          reason: string | null
          responded_at: string | null
          response_reason: string | null
          status: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          proposed_by?: string | null
          proposed_end_time: string
          proposed_start_time: string
          reason?: string | null
          responded_at?: string | null
          response_reason?: string | null
          status?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          proposed_by?: string | null
          proposed_end_time?: string
          proposed_start_time?: string
          reason?: string | null
          responded_at?: string | null
          response_reason?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_reschedule_proposals_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_services: {
        Row: {
          booking_id: string
          created_at: string | null
          id: string
          service_category_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          id?: string
          service_category_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          id?: string
          service_category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_services_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_services_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      breathing_session: {
        Row: {
          completed_rounds: number
          created_at: string | null
          duration_seconds: number
          energy_after: number | null
          id: string
          mood_after: number | null
          notes: string | null
          project_id: string | null
          stress_after: number | null
          technique_id: string
          technique_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_rounds: number
          created_at?: string | null
          duration_seconds: number
          energy_after?: number | null
          id?: string
          mood_after?: number | null
          notes?: string | null
          project_id?: string | null
          stress_after?: number | null
          technique_id: string
          technique_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_rounds?: number
          created_at?: string | null
          duration_seconds?: number
          energy_after?: number | null
          id?: string
          mood_after?: number | null
          notes?: string | null
          project_id?: string | null
          stress_after?: number | null
          technique_id?: string
          technique_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      breathing_technique: {
        Row: {
          benefits: string[] | null
          category: string | null
          created_at: string
          default_rounds: number
          description: string | null
          difficulty: string | null
          exhale_duration: number
          hold1_duration: number
          hold2_duration: number
          id: string
          image_url: string | null
          inhale_duration: number
          instructions: string | null
          name: string
          updated_at: string
        }
        Insert: {
          benefits?: string[] | null
          category?: string | null
          created_at?: string
          default_rounds: number
          description?: string | null
          difficulty?: string | null
          exhale_duration: number
          hold1_duration?: number
          hold2_duration?: number
          id?: string
          image_url?: string | null
          inhale_duration: number
          instructions?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          benefits?: string[] | null
          category?: string | null
          created_at?: string
          default_rounds?: number
          description?: string | null
          difficulty?: string | null
          exhale_duration?: number
          hold1_duration?: number
          hold2_duration?: number
          id?: string
          image_url?: string | null
          inhale_duration?: number
          instructions?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      bypass_attempts: {
        Row: {
          attempted_at: string | null
          attempted_domain: string
          attempted_url: string
          bypass_reason: string | null
          id: string
          platform: string | null
          user_id: string
          was_granted: boolean | null
        }
        Insert: {
          attempted_at?: string | null
          attempted_domain: string
          attempted_url: string
          bypass_reason?: string | null
          id?: string
          platform?: string | null
          user_id: string
          was_granted?: boolean | null
        }
        Update: {
          attempted_at?: string | null
          attempted_domain?: string
          attempted_url?: string
          bypass_reason?: string | null
          id?: string
          platform?: string | null
          user_id?: string
          was_granted?: boolean | null
        }
        Relationships: []
      }
      caffeine_logs: {
        Row: {
          amount_mg: number
          beverage_type: string | null
          consumed_at: string
          created_at: string | null
          energy_rating: number | null
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          amount_mg: number
          beverage_type?: string | null
          consumed_at: string
          created_at?: string | null
          energy_rating?: number | null
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          amount_mg?: number
          beverage_type?: string | null
          consumed_at?: string
          created_at?: string | null
          energy_rating?: number | null
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calculators: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon_name: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          attendees: string[] | null
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string
          event_type: string | null
          group_id: string | null
          help_needed: boolean | null
          id: string
          location: string | null
          needs_met: boolean | null
          occasions: string[] | null
          recurrence_pattern: Json | null
          recurring: boolean | null
          reminders: Json | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          attendees?: string[] | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time: string
          event_type?: string | null
          group_id?: string | null
          help_needed?: boolean | null
          id?: string
          location?: string | null
          needs_met?: boolean | null
          occasions?: string[] | null
          recurrence_pattern?: Json | null
          recurring?: boolean | null
          reminders?: Json | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          attendees?: string[] | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string
          event_type?: string | null
          group_id?: string | null
          help_needed?: boolean | null
          id?: string
          location?: string | null
          needs_met?: boolean | null
          occasions?: string[] | null
          recurrence_pattern?: Json | null
          recurring?: boolean | null
          reminders?: Json | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_group"
            referencedColumns: ["id"]
          },
        ]
      }
      care_announcement: {
        Row: {
          attachments: Json | null
          author_id: string | null
          content: string
          created_at: string | null
          group_id: string | null
          id: string
          is_pinned: boolean | null
          priority: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          author_id?: string | null
          content: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_pinned?: boolean | null
          priority?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          author_id?: string | null
          content?: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_pinned?: boolean | null
          priority?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_announcements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_group"
            referencedColumns: ["id"]
          },
        ]
      }
      care_calendar_event: {
        Row: {
          attendees: string[] | null
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string
          event_type: string | null
          group_id: string | null
          id: string
          location: string | null
          reminders: Json | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          attendees?: string[] | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time: string
          event_type?: string | null
          group_id?: string | null
          id?: string
          location?: string | null
          reminders?: Json | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          attendees?: string[] | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string
          event_type?: string | null
          group_id?: string | null
          id?: string
          location?: string | null
          reminders?: Json | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_calendar_events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_group"
            referencedColumns: ["id"]
          },
        ]
      }
      care_checkiners: {
        Row: {
          checkin_types: string[]
          contact_info: string
          created_at: string
          id: string
          insurance_details: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checkin_types?: string[]
          contact_info: string
          created_at?: string
          id?: string
          insurance_details?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checkin_types?: string[]
          contact_info?: string
          created_at?: string
          id?: string
          insurance_details?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      care_group: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_private: boolean | null
          join_code: string | null
          max_members: number | null
          member_count: number | null
          name: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_private?: boolean | null
          join_code?: string | null
          max_members?: number | null
          member_count?: number | null
          name: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_private?: boolean | null
          join_code?: string | null
          max_members?: number | null
          member_count?: number | null
          name?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      care_group_announcement: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          group_id: string | null
          id: string
          is_pinned: boolean | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          group_id?: string | null
          id?: string
          is_pinned?: boolean | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          group_id?: string | null
          id?: string
          is_pinned?: boolean | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_group_announcements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_group"
            referencedColumns: ["id"]
          },
        ]
      }
      care_group_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      care_group_event: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          group_id: string
          id: string
          time: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          group_id: string
          id?: string
          time?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          group_id?: string
          id?: string
          time?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_group_events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_group"
            referencedColumns: ["id"]
          },
        ]
      }
      care_group_gallery: {
        Row: {
          created_at: string | null
          description: string | null
          file_name: string | null
          file_size: number | null
          file_url: string
          group_id: string
          height: number | null
          id: string
          is_pinned: boolean | null
          mime_type: string | null
          title: string | null
          updated_at: string | null
          uploaded_by: string
          width: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url: string
          group_id: string
          height?: number | null
          id?: string
          is_pinned?: boolean | null
          mime_type?: string | null
          title?: string | null
          updated_at?: string | null
          uploaded_by: string
          width?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string
          group_id?: string
          height?: number | null
          id?: string
          is_pinned?: boolean | null
          mime_type?: string | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "care_group_gallery_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_group"
            referencedColumns: ["id"]
          },
        ]
      }
      care_group_invitations: {
        Row: {
          accepted_at: string | null
          cancelled_at: string | null
          care_group_id: string
          created_at: string | null
          expires_at: string
          id: string
          invited_by_user_id: string
          invitee_email: string
          rejected_at: string | null
          role: string | null
          status: string | null
          token: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          cancelled_at?: string | null
          care_group_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          invited_by_user_id: string
          invitee_email: string
          rejected_at?: string | null
          role?: string | null
          status?: string | null
          token: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          cancelled_at?: string | null
          care_group_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          invited_by_user_id?: string
          invitee_email?: string
          rejected_at?: string | null
          role?: string | null
          status?: string | null
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_group_invitations_care_group_id_fkey"
            columns: ["care_group_id"]
            isOneToOne: false
            referencedRelation: "care_group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_group_invitations_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      care_group_member: {
        Row: {
          group_id: string | null
          id: string
          invited_by: string | null
          is_active: boolean | null
          is_admin: boolean | null
          is_cared_one: boolean | null
          is_owner: boolean | null
          joined_at: string | null
          last_active: string | null
          notification_preferences: Json | null
          permissions: Json | null
          user_id: string | null
        }
        Insert: {
          group_id?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          is_admin?: boolean | null
          is_cared_one?: boolean | null
          is_owner?: boolean | null
          joined_at?: string | null
          last_active?: string | null
          notification_preferences?: Json | null
          permissions?: Json | null
          user_id?: string | null
        }
        Update: {
          group_id?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          is_admin?: boolean | null
          is_cared_one?: boolean | null
          is_owner?: boolean | null
          joined_at?: string | null
          last_active?: string | null
          notification_preferences?: Json | null
          permissions?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_group"
            referencedColumns: ["id"]
          },
        ]
      }
      care_group_member_assigned_categories: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          care_group_member_id: string
          id: string
          member_category_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          care_group_member_id: string
          id?: string
          member_category_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          care_group_member_id?: string
          id?: string
          member_category_id?: string
        }
        Relationships: []
      }
      care_group_message: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          message: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          message: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          message?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      care_group_message_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          message_id: string
          storage_path: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          message_id: string
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          message_id?: string
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_group_message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "group_message"
            referencedColumns: ["id"]
          },
        ]
      }
      care_group_post: {
        Row: {
          care_group_post_type: string
          content: string
          created_at: string | null
          group_id: string
          id: string
          is_pinned: boolean | null
          metadata: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          care_group_post_type: string
          content: string
          created_at?: string | null
          group_id: string
          id?: string
          is_pinned?: boolean | null
          metadata?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          care_group_post_type?: string
          content?: string
          created_at?: string | null
          group_id?: string
          id?: string
          is_pinned?: boolean | null
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      care_group_task: {
        Row: {
          assigned_to: string | null
          category: string | null
          completed: boolean | null
          created_at: string | null
          created_by: string | null
          due_date: string | null
          group_id: string
          id: string
          priority: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          completed?: boolean | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          group_id: string
          id?: string
          priority?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          completed?: boolean | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          group_id?: string
          id?: string
          priority?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_group_tasks_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_group"
            referencedColumns: ["id"]
          },
        ]
      }
      care_group_task_assignees: {
        Row: {
          assigned_at: string
          task_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          task_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          task_id?: string
          user_id?: string
        }
        Relationships: []
      }
      care_group_update_attachments: {
        Row: {
          file_name: string | null
          file_type: string | null
          file_url: string
          id: string
          update_id: string
          uploaded_at: string
          uploader_id: string | null
        }
        Insert: {
          file_name?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          update_id: string
          uploaded_at?: string
          uploader_id?: string | null
        }
        Update: {
          file_name?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          update_id?: string
          uploaded_at?: string
          uploader_id?: string | null
        }
        Relationships: []
      }
      care_group_update_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          parent_comment_id: string | null
          subgroup_id: string | null
          update_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          subgroup_id?: string | null
          update_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          subgroup_id?: string | null
          update_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_group_update_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "care_group_update_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      care_needs_assessments: {
        Row: {
          activities_needed: string[] | null
          assistance_level: string | null
          budget_range: string | null
          care_type: string | null
          cared_one_id: string | null
          completed_at: string | null
          created_at: string | null
          emergency_info: string | null
          id: string
          medical_conditions: string[] | null
          preferred_schedule: Json | null
          special_requirements: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activities_needed?: string[] | null
          assistance_level?: string | null
          budget_range?: string | null
          care_type?: string | null
          cared_one_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          emergency_info?: string | null
          id: string
          medical_conditions?: string[] | null
          preferred_schedule?: Json | null
          special_requirements?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activities_needed?: string[] | null
          assistance_level?: string | null
          budget_range?: string | null
          care_type?: string | null
          cared_one_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          emergency_info?: string | null
          id?: string
          medical_conditions?: string[] | null
          preferred_schedule?: Json | null
          special_requirements?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      care_note_shares: {
        Row: {
          can_edit: boolean | null
          care_note_id: string
          id: string
          shared_at: string
          shared_by_user_id: string
          shared_with_user_id: string
        }
        Insert: {
          can_edit?: boolean | null
          care_note_id: string
          id?: string
          shared_at?: string
          shared_by_user_id: string
          shared_with_user_id: string
        }
        Update: {
          can_edit?: boolean | null
          care_note_id?: string
          id?: string
          shared_at?: string
          shared_by_user_id?: string
          shared_with_user_id?: string
        }
        Relationships: []
      }
      care_plan_section_audit_log: {
        Row: {
          care_group_id: string | null
          changed_at: string
          changed_by_user_id: string | null
          id: string
          new_record: Json | null
          old_record: Json | null
          operation_type: Database["public"]["Enums"]["audit_log_operation_type"]
          section_id: string
        }
        Insert: {
          care_group_id?: string | null
          changed_at?: string
          changed_by_user_id?: string | null
          id?: string
          new_record?: Json | null
          old_record?: Json | null
          operation_type: Database["public"]["Enums"]["audit_log_operation_type"]
          section_id: string
        }
        Update: {
          care_group_id?: string | null
          changed_at?: string
          changed_by_user_id?: string | null
          id?: string
          new_record?: Json | null
          old_record?: Json | null
          operation_type?: Database["public"]["Enums"]["audit_log_operation_type"]
          section_id?: string
        }
        Relationships: []
      }
      care_provider: {
        Row: {
          availability: Json | null
          availability_type: string | null
          average_rating: number | null
          background_check_status: string | null
          bio: string | null
          certifications: string[] | null
          created_at: string | null
          email: string | null
          hourly_rate: number | null
          id: string
          instant_book_enabled: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          location: string | null
          max_travel_distance: number | null
          minimum_notice_hours: number | null
          name: string
          phone: string | null
          portfolio_images: Json | null
          profile_image_url: string | null
          provider_type: string | null
          rating: number | null
          response_rate: number | null
          response_time_minutes: number | null
          service_area: string[] | null
          services_offered: string[] | null
          specialties: string[] | null
          status: string | null
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean | null
          total_bookings: number | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
          video_intro_url: string | null
          years_experience: number | null
        }
        Insert: {
          availability?: Json | null
          availability_type?: string | null
          average_rating?: number | null
          background_check_status?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          email?: string | null
          hourly_rate?: number | null
          id?: string
          instant_book_enabled?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          location?: string | null
          max_travel_distance?: number | null
          minimum_notice_hours?: number | null
          name: string
          phone?: string | null
          portfolio_images?: Json | null
          profile_image_url?: string | null
          provider_type?: string | null
          rating?: number | null
          response_rate?: number | null
          response_time_minutes?: number | null
          service_area?: string[] | null
          services_offered?: string[] | null
          specialties?: string[] | null
          status?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          total_bookings?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          video_intro_url?: string | null
          years_experience?: number | null
        }
        Update: {
          availability?: Json | null
          availability_type?: string | null
          average_rating?: number | null
          background_check_status?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          email?: string | null
          hourly_rate?: number | null
          id?: string
          instant_book_enabled?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          location?: string | null
          max_travel_distance?: number | null
          minimum_notice_hours?: number | null
          name?: string
          phone?: string | null
          portfolio_images?: Json | null
          profile_image_url?: string | null
          provider_type?: string | null
          rating?: number | null
          response_rate?: number | null
          response_time_minutes?: number | null
          service_area?: string[] | null
          services_offered?: string[] | null
          specialties?: string[] | null
          status?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          total_bookings?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          video_intro_url?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      care_providers: {
        Row: {
          accepts_insurance: boolean | null
          availability_schedule: Json | null
          availability_status:
            | Database["public"]["Enums"]["availability_status"]
            | null
          availability_type: string | null
          background_check_date: string | null
          bio: string | null
          caregiver_type: Database["public"]["Enums"]["caregiver_type"]
          certifications: Json | null
          completion_rate: number | null
          created_at: string | null
          hourly_rate: number | null
          id: string
          insurance_types: string[] | null
          insurance_verified: boolean | null
          is_active: boolean | null
          languages: string[] | null
          name: string | null
          profile_image: string | null
          provider_status: string | null
          provider_type: string | null
          rating: number | null
          response_time_minutes: number | null
          service_area: string[] | null
          services_offered: string[] | null
          specializations: string[] | null
          specialties: string[] | null
          total_hours_worked: number | null
          updated_at: string | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          accepts_insurance?: boolean | null
          availability_schedule?: Json | null
          availability_status?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          availability_type?: string | null
          background_check_date?: string | null
          bio?: string | null
          caregiver_type: Database["public"]["Enums"]["caregiver_type"]
          certifications?: Json | null
          completion_rate?: number | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          insurance_types?: string[] | null
          insurance_verified?: boolean | null
          is_active?: boolean | null
          languages?: string[] | null
          name?: string | null
          profile_image?: string | null
          provider_status?: string | null
          provider_type?: string | null
          rating?: number | null
          response_time_minutes?: number | null
          service_area?: string[] | null
          services_offered?: string[] | null
          specializations?: string[] | null
          specialties?: string[] | null
          total_hours_worked?: number | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          accepts_insurance?: boolean | null
          availability_schedule?: Json | null
          availability_status?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          availability_type?: string | null
          background_check_date?: string | null
          bio?: string | null
          caregiver_type?: Database["public"]["Enums"]["caregiver_type"]
          certifications?: Json | null
          completion_rate?: number | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          insurance_types?: string[] | null
          insurance_verified?: boolean | null
          is_active?: boolean | null
          languages?: string[] | null
          name?: string | null
          profile_image?: string | null
          provider_status?: string | null
          provider_type?: string | null
          rating?: number | null
          response_time_minutes?: number | null
          service_area?: string[] | null
          services_offered?: string[] | null
          specializations?: string[] | null
          specialties?: string[] | null
          total_hours_worked?: number | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      care_recipient_audit_log: {
        Row: {
          care_group_id: string | null
          changed_at: string
          changed_by_user_id: string | null
          id: string
          new_record: Json | null
          old_record: Json | null
          operation_type: Database["public"]["Enums"]["audit_log_operation_type"]
          recipient_id: string
        }
        Insert: {
          care_group_id?: string | null
          changed_at?: string
          changed_by_user_id?: string | null
          id?: string
          new_record?: Json | null
          old_record?: Json | null
          operation_type: Database["public"]["Enums"]["audit_log_operation_type"]
          recipient_id: string
        }
        Update: {
          care_group_id?: string | null
          changed_at?: string
          changed_by_user_id?: string | null
          id?: string
          new_record?: Json | null
          old_record?: Json | null
          operation_type?: Database["public"]["Enums"]["audit_log_operation_type"]
          recipient_id?: string
        }
        Relationships: []
      }
      care_recipients: {
        Row: {
          care_group_id: string | null
          created_at: string | null
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          medical_conditions: string[] | null
          name: string
          relationship_to_user: string | null
          updated_at: string | null
        }
        Insert: {
          care_group_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          medical_conditions?: string[] | null
          name: string
          relationship_to_user?: string | null
          updated_at?: string | null
        }
        Update: {
          care_group_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          medical_conditions?: string[] | null
          name?: string
          relationship_to_user?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_recipients_care_group_id_fkey"
            columns: ["care_group_id"]
            isOneToOne: false
            referencedRelation: "care_group"
            referencedColumns: ["id"]
          },
        ]
      }
      care_task: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          category: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          group_id: string | null
          id: string
          notes: string | null
          priority: string | null
          recurrence_pattern: Json | null
          recurring: boolean | null
          reminders: Json | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          group_id?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          recurrence_pattern?: Json | null
          recurring?: boolean | null
          reminders?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          group_id?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          recurrence_pattern?: Json | null
          recurring?: boolean | null
          reminders?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_tasks_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_group"
            referencedColumns: ["id"]
          },
        ]
      }
      care_well_wish: {
        Row: {
          author_id: string | null
          created_at: string | null
          group_id: string | null
          id: string
          is_pinned: boolean | null
          message: string
          reactions: Json | null
        }
        Insert: {
          author_id?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_pinned?: boolean | null
          message: string
          reactions?: Json | null
        }
        Update: {
          author_id?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_pinned?: boolean | null
          message?: string
          reactions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "care_well_wishes_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_group"
            referencedColumns: ["id"]
          },
        ]
      }
      caregiver_availability: {
        Row: {
          caregiver_id: string
          created_at: string | null
          date: string
          id: string
          is_available: boolean | null
          time_slots: Json | null
          updated_at: string | null
        }
        Insert: {
          caregiver_id: string
          created_at?: string | null
          date: string
          id?: string
          is_available?: boolean | null
          time_slots?: Json | null
          updated_at?: string | null
        }
        Update: {
          caregiver_id?: string
          created_at?: string | null
          date?: string
          id?: string
          is_available?: boolean | null
          time_slots?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_availability_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "care_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      caregiver_availability_settings: {
        Row: {
          advance_booking_days: number | null
          auto_approve_bookings: boolean | null
          buffer_time_minutes: number | null
          cancellation_notice_hours: number | null
          caregiver_id: string
          created_at: string | null
          id: string
          max_hours_per_day: number | null
          max_hours_per_week: number | null
          minimum_booking_hours: number | null
          same_day_booking: boolean | null
          updated_at: string | null
        }
        Insert: {
          advance_booking_days?: number | null
          auto_approve_bookings?: boolean | null
          buffer_time_minutes?: number | null
          cancellation_notice_hours?: number | null
          caregiver_id: string
          created_at?: string | null
          id?: string
          max_hours_per_day?: number | null
          max_hours_per_week?: number | null
          minimum_booking_hours?: number | null
          same_day_booking?: boolean | null
          updated_at?: string | null
        }
        Update: {
          advance_booking_days?: number | null
          auto_approve_bookings?: boolean | null
          buffer_time_minutes?: number | null
          cancellation_notice_hours?: number | null
          caregiver_id?: string
          created_at?: string | null
          id?: string
          max_hours_per_day?: number | null
          max_hours_per_week?: number | null
          minimum_booking_hours?: number | null
          same_day_booking?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      caregiver_availability_templates: {
        Row: {
          caregiver_id: string
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          template_data: Json
          updated_at: string | null
        }
        Insert: {
          caregiver_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          template_data: Json
          updated_at?: string | null
        }
        Update: {
          caregiver_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          template_data?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      caregiver_blocked_dates: {
        Row: {
          blocked_date: string
          caregiver_id: string
          created_at: string | null
          id: string
          reason: string | null
        }
        Insert: {
          blocked_date: string
          caregiver_id: string
          created_at?: string | null
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_date?: string
          caregiver_id?: string
          created_at?: string | null
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      caregiver_bookings: {
        Row: {
          address: string
          booking_date: string
          booking_time: string
          care_type: string
          caregiver_id: string
          created_at: string | null
          duration_hours: number
          id: string
          notes: string | null
          phone_number: string
          status: string
          total_cost: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          booking_date: string
          booking_time: string
          care_type: string
          caregiver_id: string
          created_at?: string | null
          duration_hours: number
          id?: string
          notes?: string | null
          phone_number: string
          status?: string
          total_cost: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          booking_date?: string
          booking_time?: string
          care_type?: string
          caregiver_id?: string
          created_at?: string | null
          duration_hours?: number
          id?: string
          notes?: string | null
          phone_number?: string
          status?: string
          total_cost?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_bookings_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "care_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      caregiver_details: {
        Row: {
          created_at: string | null
          id: string
          languages: string[] | null
          service_area_zip_codes: string[] | null
          service_provider_id: string | null
          updated_at: string | null
          vaccination_status_covid: string | null
          vaccination_status_flu: string | null
          willing_to_drive_client: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          languages?: string[] | null
          service_area_zip_codes?: string[] | null
          service_provider_id?: string | null
          updated_at?: string | null
          vaccination_status_covid?: string | null
          vaccination_status_flu?: string | null
          willing_to_drive_client?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          languages?: string[] | null
          service_area_zip_codes?: string[] | null
          service_provider_id?: string | null
          updated_at?: string | null
          vaccination_status_covid?: string | null
          vaccination_status_flu?: string | null
          willing_to_drive_client?: boolean | null
        }
        Relationships: []
      }
      caregiver_recurring_availability: {
        Row: {
          caregiver_id: string
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          caregiver_id: string
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          caregiver_id?: string
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cart_item: {
        Row: {
          cart_id: string | null
          created_at: string | null
          id: string
          price: number
          product_id: string | null
          quantity: number
          user_id: string | null
        }
        Insert: {
          cart_id?: string | null
          created_at?: string | null
          id?: string
          price: number
          product_id?: string | null
          quantity?: number
          user_id?: string | null
        }
        Update: {
          cart_id?: string | null
          created_at?: string | null
          id?: string
          price?: number
          product_id?: string | null
          quantity?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "shopping_carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      categories1: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories2: {
        Row: {
          category1_id: string | null
          color: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          category1_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          category1_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories2_category1_id_fkey"
            columns: ["category1_id"]
            isOneToOne: false
            referencedRelation: "categories1"
            referencedColumns: ["id"]
          },
        ]
      }
      claimed_reward: {
        Row: {
          claimed_at: string
          id: string
          points_redeemed: number
          reward_id: string
          status: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          id?: string
          points_redeemed?: number
          reward_id: string
          status?: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          id?: string
          points_redeemed?: number
          reward_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claimed_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "reward"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_component_definitions: {
        Row: {
          component_key: string
          date_created: string | null
          date_updated: string | null
          id: number
          name: string
          preview_image_url: string | null
          props_schema: Json | null
        }
        Insert: {
          component_key: string
          date_created?: string | null
          date_updated?: string | null
          id?: number
          name: string
          preview_image_url?: string | null
          props_schema?: Json | null
        }
        Update: {
          component_key?: string
          date_created?: string | null
          date_updated?: string | null
          id?: number
          name?: string
          preview_image_url?: string | null
          props_schema?: Json | null
        }
        Relationships: []
      }
      cms_templates: {
        Row: {
          date_created: string | null
          date_updated: string | null
          id: number
          layout: Json | null
          name: string
        }
        Insert: {
          date_created?: string | null
          date_updated?: string | null
          id?: number
          layout?: Json | null
          name: string
        }
        Update: {
          date_created?: string | null
          date_updated?: string | null
          id?: number
          layout?: Json | null
          name?: string
        }
        Relationships: []
      }
      collection_followers: {
        Row: {
          collection_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_followers_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_products: {
        Row: {
          added_at: string | null
          collection_id: string
          display_order: number | null
          id: string
          product_id: string
        }
        Insert: {
          added_at?: string | null
          collection_id: string
          display_order?: number | null
          id?: string
          product_id: string
        }
        Update: {
          added_at?: string | null
          collection_id?: string
          display_order?: number | null
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          curator_id: string
          description: string | null
          follower_count: number | null
          id: string
          is_public: boolean | null
          name: string
          product_count: number | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          curator_id: string
          description?: string | null
          follower_count?: number | null
          id?: string
          is_public?: boolean | null
          name: string
          product_count?: number | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          curator_id?: string
          description?: string | null
          follower_count?: number | null
          id?: string
          is_public?: boolean | null
          name?: string
          product_count?: number | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comment: {
        Row: {
          content: string | null
          created_at: string
          id: string
          parent_comment_id: string | null
          parent_discussion_id: string | null
          product_id: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          parent_discussion_id?: string | null
          product_id: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          parent_discussion_id?: string | null
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_discussion_id_fkey"
            columns: ["parent_discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_comment_id: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_post"
            referencedColumns: ["id"]
          },
        ]
      }
      community_events: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: string
          location: string | null
          organizer_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          location?: string | null
          organizer_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          location?: string | null
          organizer_id?: string | null
          title?: string
        }
        Relationships: []
      }
      community_post: {
        Row: {
          app_id: string | null
          comments: number | null
          content: string
          created_at: string | null
          id: string
          likes: number | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          app_id?: string | null
          comments?: number | null
          content: string
          created_at?: string | null
          id?: string
          likes?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          app_id?: string | null
          comments?: number | null
          content?: string
          created_at?: string | null
          id?: string
          likes?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      comparison_item: {
        Row: {
          added_at: string | null
          id: string
          product_id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          product_id: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          product_id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comparison_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          consent_given: boolean
          consent_timestamp: string
          id: string
          ip_address: string | null
          participant_id: string
          project_id: string
          user_agent: string | null
        }
        Insert: {
          consent_given?: boolean
          consent_timestamp?: string
          id?: string
          ip_address?: string | null
          participant_id: string
          project_id: string
          user_agent?: string | null
        }
        Update: {
          consent_given?: boolean
          consent_timestamp?: string
          id?: string
          ip_address?: string | null
          participant_id?: string
          project_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      content_blocker_bypasses: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          expires_at: string
          id: string
          reason: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          expires_at: string
          id?: string
          reason: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          expires_at?: string
          id?: string
          reason?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      content_blocker_settings: {
        Row: {
          block_custom_domains: boolean | null
          block_images: boolean | null
          block_level: string | null
          block_news_articles: boolean | null
          block_shopping: boolean | null
          block_social_posts: boolean | null
          block_videos: boolean | null
          bypass_duration: number | null
          bypass_expires_at: string | null
          created_at: string | null
          daily_report: boolean | null
          enabled: boolean | null
          id: string
          last_block_reset: string | null
          show_blocked_count: boolean | null
          total_blocks_all_time: number | null
          total_blocks_today: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          block_custom_domains?: boolean | null
          block_images?: boolean | null
          block_level?: string | null
          block_news_articles?: boolean | null
          block_shopping?: boolean | null
          block_social_posts?: boolean | null
          block_videos?: boolean | null
          bypass_duration?: number | null
          bypass_expires_at?: string | null
          created_at?: string | null
          daily_report?: boolean | null
          enabled?: boolean | null
          id?: string
          last_block_reset?: string | null
          show_blocked_count?: boolean | null
          total_blocks_all_time?: number | null
          total_blocks_today?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          block_custom_domains?: boolean | null
          block_images?: boolean | null
          block_level?: string | null
          block_news_articles?: boolean | null
          block_shopping?: boolean | null
          block_social_posts?: boolean | null
          block_videos?: boolean | null
          bypass_duration?: number | null
          bypass_expires_at?: string | null
          created_at?: string | null
          daily_report?: boolean | null
          enabled?: boolean | null
          id?: string
          last_block_reset?: string | null
          show_blocked_count?: boolean | null
          total_blocks_all_time?: number | null
          total_blocks_today?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      content_blocker_stats: {
        Row: {
          blocked_at: string | null
          bypass_used: boolean | null
          category: string
          created_at: string | null
          domain: string
          id: string
          severity: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          blocked_at?: string | null
          bypass_used?: boolean | null
          category: string
          created_at?: string | null
          domain: string
          id?: string
          severity?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          blocked_at?: string | null
          bypass_used?: boolean | null
          category?: string
          created_at?: string | null
          domain?: string
          id?: string
          severity?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversation: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string | null
          participant_1_id: string
          participant_2_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          participant_1_id: string
          participant_2_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          participant_1_id?: string
          participant_2_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "subscription_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_message: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_message_read_status: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          message_id: string
          read_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_id: string
          read_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_id?: string
          read_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_starter: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string | null
          id: string
          sort_order: number | null
          text: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          id?: string
          sort_order?: number | null
          text: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          id?: string
          sort_order?: number | null
          text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coping_strategy: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          strategy_type: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          strategy_type?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          strategy_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      craving_logs: {
        Row: {
          coping_mechanism: string | null
          coping_strategy_id: string | null
          created_at: string | null
          id: string
          intensity: number
          timestamp: string
          trigger: string | null
          trigger_id: string | null
          user_id: string | null
        }
        Insert: {
          coping_mechanism?: string | null
          coping_strategy_id?: string | null
          created_at?: string | null
          id?: string
          intensity: number
          timestamp?: string
          trigger?: string | null
          trigger_id?: string | null
          user_id?: string | null
        }
        Update: {
          coping_mechanism?: string | null
          coping_strategy_id?: string | null
          created_at?: string | null
          id?: string
          intensity?: number
          timestamp?: string
          trigger?: string | null
          trigger_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "craving_logs_coping_strategy_id_fkey"
            columns: ["coping_strategy_id"]
            isOneToOne: false
            referencedRelation: "coping_strategy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "craving_logs_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "trigger_item"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_products: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_check_ins: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          blood_sugar: number | null
          created_at: string | null
          date: string
          energy_level: number | null
          exercise_minutes: number | null
          focus_level: number | null
          heart_rate: number | null
          id: string
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          medication_taken: boolean | null
          mood: string | null
          oxygen_saturation: number | null
          sleep_hours: number | null
          temperature: number | null
          user_id: string | null
          water_intake: number | null
          weight: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_sugar?: number | null
          created_at?: string | null
          date: string
          energy_level?: number | null
          exercise_minutes?: number | null
          focus_level?: number | null
          heart_rate?: number | null
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          medication_taken?: boolean | null
          mood?: string | null
          oxygen_saturation?: number | null
          sleep_hours?: number | null
          temperature?: number | null
          user_id?: string | null
          water_intake?: number | null
          weight?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_sugar?: number | null
          created_at?: string | null
          date?: string
          energy_level?: number | null
          exercise_minutes?: number | null
          focus_level?: number | null
          heart_rate?: number | null
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          medication_taken?: boolean | null
          mood?: string | null
          oxygen_saturation?: number | null
          sleep_hours?: number | null
          temperature?: number | null
          user_id?: string | null
          water_intake?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          cigarettes_smoked: number | null
          coping_strategy: string | null
          craving_trigger: string | null
          cravings_intensity: number
          created_at: string | null
          daily_notes: string | null
          date: string
          energy_level: number
          id: string
          journal_entry: string | null
          mood: number
          nicotine_trigger: string | null
          product_type: string | null
          sleep_hours: number | null
          sleep_quality: number
          stayed_smoke_free: boolean | null
          stress_level: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cigarettes_smoked?: number | null
          coping_strategy?: string | null
          craving_trigger?: string | null
          cravings_intensity?: number
          created_at?: string | null
          daily_notes?: string | null
          date: string
          energy_level: number
          id?: string
          journal_entry?: string | null
          mood: number
          nicotine_trigger?: string | null
          product_type?: string | null
          sleep_hours?: number | null
          sleep_quality: number
          stayed_smoke_free?: boolean | null
          stress_level: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cigarettes_smoked?: number | null
          coping_strategy?: string | null
          craving_trigger?: string | null
          cravings_intensity?: number
          created_at?: string | null
          daily_notes?: string | null
          date?: string
          energy_level?: number
          id?: string
          journal_entry?: string | null
          mood?: number
          nicotine_trigger?: string | null
          product_type?: string | null
          sleep_hours?: number | null
          sleep_quality?: number
          stayed_smoke_free?: boolean | null
          stress_level?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_planner_items: {
        Row: {
          created_at: string
          date: string
          description: string | null
          end_time: string | null
          event_id: string | null
          id: string
          is_completed: boolean
          start_time: string | null
          task_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          end_time?: string | null
          event_id?: string | null
          id?: string
          is_completed?: boolean
          start_time?: string | null
          task_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          end_time?: string | null
          event_id?: string | null
          id?: string
          is_completed?: boolean
          start_time?: string | null
          task_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_plans: {
        Row: {
          created_at: string
          date: string
          id: string
          routine_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          routine_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          routine_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_plans_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_pledges: {
        Row: {
          created_at: string | null
          date: string
          evening_completed: boolean | null
          evening_review: string | null
          id: string
          morning_completed: boolean | null
          morning_pledge: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          evening_completed?: boolean | null
          evening_review?: string | null
          id?: string
          morning_completed?: boolean | null
          morning_pledge?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          evening_completed?: boolean | null
          evening_review?: string | null
          id?: string
          morning_completed?: boolean | null
          morning_pledge?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      deal: {
        Row: {
          created_at: string | null
          deal_description: string | null
          deal_title: string
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          promo_code: string | null
          terms_conditions: string | null
          updated_at: string | null
          valid_until: string | null
          vendor_id: string | null
          vendor_name: string | null
        }
        Insert: {
          created_at?: string | null
          deal_description?: string | null
          deal_title: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          promo_code?: string | null
          terms_conditions?: string | null
          updated_at?: string | null
          valid_until?: string | null
          vendor_id?: string | null
          vendor_name?: string | null
        }
        Update: {
          created_at?: string | null
          deal_description?: string | null
          deal_title?: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          promo_code?: string | null
          terms_conditions?: string | null
          updated_at?: string | null
          valid_until?: string | null
          vendor_id?: string | null
          vendor_name?: string | null
        }
        Relationships: []
      }
      deprecated_nicotine_logs: {
        Row: {
          coping_mechanism: string | null
          craving_intensity: number
          craving_trigger: string | null
          created_at: string
          date: string
          energy: number
          focus: number
          id: string
          journal: string | null
          mood: number
          nicotine_entries_data: Json | null
          product_type: string | null
          quantity: number | null
          sleep_hours: number
          sleep_quality: number
          used_nicotine: boolean
          user_id: string
        }
        Insert: {
          coping_mechanism?: string | null
          craving_intensity: number
          craving_trigger?: string | null
          created_at?: string
          date: string
          energy: number
          focus: number
          id?: string
          journal?: string | null
          mood: number
          nicotine_entries_data?: Json | null
          product_type?: string | null
          quantity?: number | null
          sleep_hours: number
          sleep_quality: number
          used_nicotine: boolean
          user_id: string
        }
        Update: {
          coping_mechanism?: string | null
          craving_intensity?: number
          craving_trigger?: string | null
          created_at?: string
          date?: string
          energy?: number
          focus?: number
          id?: string
          journal?: string | null
          mood?: number
          nicotine_entries_data?: Json | null
          product_type?: string | null
          quantity?: number | null
          sleep_hours?: number
          sleep_quality?: number
          used_nicotine?: boolean
          user_id?: string
        }
        Relationships: []
      }
      deprecated_nicotine_product_costs: {
        Row: {
          cost_per_unit: number
          created_at: string
          id: string
          product_type: string
          unit_name: string
          user_id: string
        }
        Insert: {
          cost_per_unit: number
          created_at?: string
          id?: string
          product_type: string
          unit_name: string
          user_id: string
        }
        Update: {
          cost_per_unit?: number
          created_at?: string
          id?: string
          product_type?: string
          unit_name?: string
          user_id?: string
        }
        Relationships: []
      }
      deprecated_smokeless_products: {
        Row: {
          average_rating: number | null
          brand: string
          chemical_of_concern: Json | null
          created_at: string | null
          description: string
          flavor: string
          gum_health_guide: string | null
          gum_health_rating: number | null
          id: string
          image_url: string | null
          name: string
          nicotine_strength: number
          price_range: string
          review_count: number | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          average_rating?: number | null
          brand: string
          chemical_of_concern?: Json | null
          created_at?: string | null
          description: string
          flavor: string
          gum_health_guide?: string | null
          gum_health_rating?: number | null
          id?: string
          image_url?: string | null
          name: string
          nicotine_strength: number
          price_range: string
          review_count?: number | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          average_rating?: number | null
          brand?: string
          chemical_of_concern?: Json | null
          created_at?: string | null
          description?: string
          flavor?: string
          gum_health_guide?: string | null
          gum_health_rating?: number | null
          id?: string
          image_url?: string | null
          name?: string
          nicotine_strength?: number
          price_range?: string
          review_count?: number | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: []
      }
      direct_message: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      directus_access: {
        Row: {
          id: string
          policy: string
          role: string | null
          sort: number | null
          user: string | null
        }
        Insert: {
          id: string
          policy: string
          role?: string | null
          sort?: number | null
          user?: string | null
        }
        Update: {
          id?: string
          policy?: string
          role?: string | null
          sort?: number | null
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_access_policy_foreign"
            columns: ["policy"]
            isOneToOne: false
            referencedRelation: "directus_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_access_role_foreign"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "directus_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_access_user_foreign"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_activity: {
        Row: {
          action: string
          collection: string
          id: number
          ip: string | null
          item: string
          origin: string | null
          timestamp: string
          user: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          collection: string
          id?: number
          ip?: string | null
          item: string
          origin?: string | null
          timestamp?: string
          user?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          collection?: string
          id?: number
          ip?: string | null
          item?: string
          origin?: string | null
          timestamp?: string
          user?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      directus_collections: {
        Row: {
          accountability: string | null
          archive_app_filter: boolean
          archive_field: string | null
          archive_value: string | null
          collapse: string
          collection: string
          color: string | null
          display_template: string | null
          group: string | null
          hidden: boolean
          icon: string | null
          item_duplication_fields: Json | null
          note: string | null
          preview_url: string | null
          singleton: boolean
          sort: number | null
          sort_field: string | null
          translations: Json | null
          unarchive_value: string | null
          versioning: boolean
        }
        Insert: {
          accountability?: string | null
          archive_app_filter?: boolean
          archive_field?: string | null
          archive_value?: string | null
          collapse?: string
          collection: string
          color?: string | null
          display_template?: string | null
          group?: string | null
          hidden?: boolean
          icon?: string | null
          item_duplication_fields?: Json | null
          note?: string | null
          preview_url?: string | null
          singleton?: boolean
          sort?: number | null
          sort_field?: string | null
          translations?: Json | null
          unarchive_value?: string | null
          versioning?: boolean
        }
        Update: {
          accountability?: string | null
          archive_app_filter?: boolean
          archive_field?: string | null
          archive_value?: string | null
          collapse?: string
          collection?: string
          color?: string | null
          display_template?: string | null
          group?: string | null
          hidden?: boolean
          icon?: string | null
          item_duplication_fields?: Json | null
          note?: string | null
          preview_url?: string | null
          singleton?: boolean
          sort?: number | null
          sort_field?: string | null
          translations?: Json | null
          unarchive_value?: string | null
          versioning?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "directus_collections_group_foreign"
            columns: ["group"]
            isOneToOne: false
            referencedRelation: "directus_collections"
            referencedColumns: ["collection"]
          },
        ]
      }
      directus_comments: {
        Row: {
          collection: string
          comment: string
          date_created: string | null
          date_updated: string | null
          id: string
          item: string
          user_created: string | null
          user_updated: string | null
        }
        Insert: {
          collection: string
          comment: string
          date_created?: string | null
          date_updated?: string | null
          id: string
          item: string
          user_created?: string | null
          user_updated?: string | null
        }
        Update: {
          collection?: string
          comment?: string
          date_created?: string | null
          date_updated?: string | null
          id?: string
          item?: string
          user_created?: string | null
          user_updated?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_comments_user_created_foreign"
            columns: ["user_created"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_comments_user_updated_foreign"
            columns: ["user_updated"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_dashboards: {
        Row: {
          color: string | null
          date_created: string | null
          icon: string
          id: string
          name: string
          note: string | null
          user_created: string | null
        }
        Insert: {
          color?: string | null
          date_created?: string | null
          icon?: string
          id: string
          name: string
          note?: string | null
          user_created?: string | null
        }
        Update: {
          color?: string | null
          date_created?: string | null
          icon?: string
          id?: string
          name?: string
          note?: string | null
          user_created?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_dashboards_user_created_foreign"
            columns: ["user_created"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_extensions: {
        Row: {
          bundle: string | null
          enabled: boolean
          folder: string
          id: string
          source: string
        }
        Insert: {
          bundle?: string | null
          enabled?: boolean
          folder: string
          id: string
          source: string
        }
        Update: {
          bundle?: string | null
          enabled?: boolean
          folder?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      directus_fields: {
        Row: {
          collection: string
          conditions: Json | null
          display: string | null
          display_options: Json | null
          field: string
          group: string | null
          hidden: boolean
          id: number
          interface: string | null
          note: string | null
          options: Json | null
          readonly: boolean
          required: boolean | null
          sort: number | null
          special: string | null
          translations: Json | null
          validation: Json | null
          validation_message: string | null
          width: string | null
        }
        Insert: {
          collection: string
          conditions?: Json | null
          display?: string | null
          display_options?: Json | null
          field: string
          group?: string | null
          hidden?: boolean
          id?: number
          interface?: string | null
          note?: string | null
          options?: Json | null
          readonly?: boolean
          required?: boolean | null
          sort?: number | null
          special?: string | null
          translations?: Json | null
          validation?: Json | null
          validation_message?: string | null
          width?: string | null
        }
        Update: {
          collection?: string
          conditions?: Json | null
          display?: string | null
          display_options?: Json | null
          field?: string
          group?: string | null
          hidden?: boolean
          id?: number
          interface?: string | null
          note?: string | null
          options?: Json | null
          readonly?: boolean
          required?: boolean | null
          sort?: number | null
          special?: string | null
          translations?: Json | null
          validation?: Json | null
          validation_message?: string | null
          width?: string | null
        }
        Relationships: []
      }
      directus_files: {
        Row: {
          charset: string | null
          created_on: string
          description: string | null
          duration: number | null
          embed: string | null
          filename_disk: string | null
          filename_download: string
          filesize: number | null
          focal_point_x: number | null
          focal_point_y: number | null
          folder: string | null
          height: number | null
          id: string
          location: string | null
          metadata: Json | null
          modified_by: string | null
          modified_on: string
          storage: string
          tags: string | null
          title: string | null
          tus_data: Json | null
          tus_id: string | null
          type: string | null
          uploaded_by: string | null
          uploaded_on: string | null
          width: number | null
        }
        Insert: {
          charset?: string | null
          created_on?: string
          description?: string | null
          duration?: number | null
          embed?: string | null
          filename_disk?: string | null
          filename_download: string
          filesize?: number | null
          focal_point_x?: number | null
          focal_point_y?: number | null
          folder?: string | null
          height?: number | null
          id: string
          location?: string | null
          metadata?: Json | null
          modified_by?: string | null
          modified_on?: string
          storage: string
          tags?: string | null
          title?: string | null
          tus_data?: Json | null
          tus_id?: string | null
          type?: string | null
          uploaded_by?: string | null
          uploaded_on?: string | null
          width?: number | null
        }
        Update: {
          charset?: string | null
          created_on?: string
          description?: string | null
          duration?: number | null
          embed?: string | null
          filename_disk?: string | null
          filename_download?: string
          filesize?: number | null
          focal_point_x?: number | null
          focal_point_y?: number | null
          folder?: string | null
          height?: number | null
          id?: string
          location?: string | null
          metadata?: Json | null
          modified_by?: string | null
          modified_on?: string
          storage?: string
          tags?: string | null
          title?: string | null
          tus_data?: Json | null
          tus_id?: string | null
          type?: string | null
          uploaded_by?: string | null
          uploaded_on?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_files_folder_foreign"
            columns: ["folder"]
            isOneToOne: false
            referencedRelation: "directus_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_files_modified_by_foreign"
            columns: ["modified_by"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_files_uploaded_by_foreign"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_flows: {
        Row: {
          accountability: string | null
          color: string | null
          date_created: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          operation: string | null
          options: Json | null
          status: string
          trigger: string | null
          user_created: string | null
        }
        Insert: {
          accountability?: string | null
          color?: string | null
          date_created?: string | null
          description?: string | null
          icon?: string | null
          id: string
          name: string
          operation?: string | null
          options?: Json | null
          status?: string
          trigger?: string | null
          user_created?: string | null
        }
        Update: {
          accountability?: string | null
          color?: string | null
          date_created?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          operation?: string | null
          options?: Json | null
          status?: string
          trigger?: string | null
          user_created?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_flows_user_created_foreign"
            columns: ["user_created"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_folders: {
        Row: {
          id: string
          name: string
          parent: string | null
        }
        Insert: {
          id: string
          name: string
          parent?: string | null
        }
        Update: {
          id?: string
          name?: string
          parent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_folders_parent_foreign"
            columns: ["parent"]
            isOneToOne: false
            referencedRelation: "directus_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_migrations: {
        Row: {
          name: string
          timestamp: string | null
          version: string
        }
        Insert: {
          name: string
          timestamp?: string | null
          version: string
        }
        Update: {
          name?: string
          timestamp?: string | null
          version?: string
        }
        Relationships: []
      }
      directus_notifications: {
        Row: {
          collection: string | null
          id: number
          item: string | null
          message: string | null
          recipient: string
          sender: string | null
          status: string | null
          subject: string
          timestamp: string | null
        }
        Insert: {
          collection?: string | null
          id?: number
          item?: string | null
          message?: string | null
          recipient: string
          sender?: string | null
          status?: string | null
          subject: string
          timestamp?: string | null
        }
        Update: {
          collection?: string | null
          id?: number
          item?: string | null
          message?: string | null
          recipient?: string
          sender?: string | null
          status?: string | null
          subject?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_notifications_recipient_foreign"
            columns: ["recipient"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_notifications_sender_foreign"
            columns: ["sender"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_operations: {
        Row: {
          date_created: string | null
          flow: string
          id: string
          key: string
          name: string | null
          options: Json | null
          position_x: number
          position_y: number
          reject: string | null
          resolve: string | null
          type: string
          user_created: string | null
        }
        Insert: {
          date_created?: string | null
          flow: string
          id: string
          key: string
          name?: string | null
          options?: Json | null
          position_x: number
          position_y: number
          reject?: string | null
          resolve?: string | null
          type: string
          user_created?: string | null
        }
        Update: {
          date_created?: string | null
          flow?: string
          id?: string
          key?: string
          name?: string | null
          options?: Json | null
          position_x?: number
          position_y?: number
          reject?: string | null
          resolve?: string | null
          type?: string
          user_created?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_operations_flow_foreign"
            columns: ["flow"]
            isOneToOne: false
            referencedRelation: "directus_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_operations_reject_foreign"
            columns: ["reject"]
            isOneToOne: true
            referencedRelation: "directus_operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_operations_resolve_foreign"
            columns: ["resolve"]
            isOneToOne: true
            referencedRelation: "directus_operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_operations_user_created_foreign"
            columns: ["user_created"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_panels: {
        Row: {
          color: string | null
          dashboard: string
          date_created: string | null
          height: number
          icon: string | null
          id: string
          name: string | null
          note: string | null
          options: Json | null
          position_x: number
          position_y: number
          show_header: boolean
          type: string
          user_created: string | null
          width: number
        }
        Insert: {
          color?: string | null
          dashboard: string
          date_created?: string | null
          height: number
          icon?: string | null
          id: string
          name?: string | null
          note?: string | null
          options?: Json | null
          position_x: number
          position_y: number
          show_header?: boolean
          type: string
          user_created?: string | null
          width: number
        }
        Update: {
          color?: string | null
          dashboard?: string
          date_created?: string | null
          height?: number
          icon?: string | null
          id?: string
          name?: string | null
          note?: string | null
          options?: Json | null
          position_x?: number
          position_y?: number
          show_header?: boolean
          type?: string
          user_created?: string | null
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "directus_panels_dashboard_foreign"
            columns: ["dashboard"]
            isOneToOne: false
            referencedRelation: "directus_dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_panels_user_created_foreign"
            columns: ["user_created"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_permissions: {
        Row: {
          action: string
          collection: string
          fields: string | null
          id: number
          permissions: Json | null
          policy: string
          presets: Json | null
          validation: Json | null
        }
        Insert: {
          action: string
          collection: string
          fields?: string | null
          id?: number
          permissions?: Json | null
          policy: string
          presets?: Json | null
          validation?: Json | null
        }
        Update: {
          action?: string
          collection?: string
          fields?: string | null
          id?: number
          permissions?: Json | null
          policy?: string
          presets?: Json | null
          validation?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_permissions_policy_foreign"
            columns: ["policy"]
            isOneToOne: false
            referencedRelation: "directus_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_policies: {
        Row: {
          admin_access: boolean
          app_access: boolean
          description: string | null
          enforce_tfa: boolean
          icon: string
          id: string
          ip_access: string | null
          name: string
        }
        Insert: {
          admin_access?: boolean
          app_access?: boolean
          description?: string | null
          enforce_tfa?: boolean
          icon?: string
          id: string
          ip_access?: string | null
          name: string
        }
        Update: {
          admin_access?: boolean
          app_access?: boolean
          description?: string | null
          enforce_tfa?: boolean
          icon?: string
          id?: string
          ip_access?: string | null
          name?: string
        }
        Relationships: []
      }
      directus_presets: {
        Row: {
          bookmark: string | null
          collection: string | null
          color: string | null
          filter: Json | null
          icon: string | null
          id: number
          layout: string | null
          layout_options: Json | null
          layout_query: Json | null
          refresh_interval: number | null
          role: string | null
          search: string | null
          user: string | null
        }
        Insert: {
          bookmark?: string | null
          collection?: string | null
          color?: string | null
          filter?: Json | null
          icon?: string | null
          id?: number
          layout?: string | null
          layout_options?: Json | null
          layout_query?: Json | null
          refresh_interval?: number | null
          role?: string | null
          search?: string | null
          user?: string | null
        }
        Update: {
          bookmark?: string | null
          collection?: string | null
          color?: string | null
          filter?: Json | null
          icon?: string | null
          id?: number
          layout?: string | null
          layout_options?: Json | null
          layout_query?: Json | null
          refresh_interval?: number | null
          role?: string | null
          search?: string | null
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_presets_role_foreign"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "directus_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_presets_user_foreign"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_relations: {
        Row: {
          id: number
          junction_field: string | null
          many_collection: string
          many_field: string
          one_allowed_collections: string | null
          one_collection: string | null
          one_collection_field: string | null
          one_deselect_action: string
          one_field: string | null
          sort_field: string | null
        }
        Insert: {
          id?: number
          junction_field?: string | null
          many_collection: string
          many_field: string
          one_allowed_collections?: string | null
          one_collection?: string | null
          one_collection_field?: string | null
          one_deselect_action?: string
          one_field?: string | null
          sort_field?: string | null
        }
        Update: {
          id?: number
          junction_field?: string | null
          many_collection?: string
          many_field?: string
          one_allowed_collections?: string | null
          one_collection?: string | null
          one_collection_field?: string | null
          one_deselect_action?: string
          one_field?: string | null
          sort_field?: string | null
        }
        Relationships: []
      }
      directus_revisions: {
        Row: {
          activity: number
          collection: string
          data: Json | null
          delta: Json | null
          id: number
          item: string
          parent: number | null
          version: string | null
        }
        Insert: {
          activity: number
          collection: string
          data?: Json | null
          delta?: Json | null
          id?: number
          item: string
          parent?: number | null
          version?: string | null
        }
        Update: {
          activity?: number
          collection?: string
          data?: Json | null
          delta?: Json | null
          id?: number
          item?: string
          parent?: number | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_revisions_activity_foreign"
            columns: ["activity"]
            isOneToOne: false
            referencedRelation: "directus_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_revisions_parent_foreign"
            columns: ["parent"]
            isOneToOne: false
            referencedRelation: "directus_revisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_revisions_version_foreign"
            columns: ["version"]
            isOneToOne: false
            referencedRelation: "directus_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_roles: {
        Row: {
          description: string | null
          icon: string
          id: string
          name: string
          parent: string | null
        }
        Insert: {
          description?: string | null
          icon?: string
          id: string
          name: string
          parent?: string | null
        }
        Update: {
          description?: string | null
          icon?: string
          id?: string
          name?: string
          parent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_roles_parent_foreign"
            columns: ["parent"]
            isOneToOne: false
            referencedRelation: "directus_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_sessions: {
        Row: {
          expires: string
          ip: string | null
          next_token: string | null
          origin: string | null
          share: string | null
          token: string
          user: string | null
          user_agent: string | null
        }
        Insert: {
          expires: string
          ip?: string | null
          next_token?: string | null
          origin?: string | null
          share?: string | null
          token: string
          user?: string | null
          user_agent?: string | null
        }
        Update: {
          expires?: string
          ip?: string | null
          next_token?: string | null
          origin?: string | null
          share?: string | null
          token?: string
          user?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_sessions_share_foreign"
            columns: ["share"]
            isOneToOne: false
            referencedRelation: "directus_shares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_sessions_user_foreign"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_settings: {
        Row: {
          auth_login_attempts: number | null
          auth_password_policy: string | null
          basemaps: Json | null
          custom_aspect_ratios: Json | null
          custom_css: string | null
          default_appearance: string
          default_language: string
          default_theme_dark: string | null
          default_theme_light: string | null
          id: number
          mapbox_key: string | null
          module_bar: Json | null
          project_color: string
          project_descriptor: string | null
          project_logo: string | null
          project_name: string
          project_url: string | null
          public_background: string | null
          public_favicon: string | null
          public_foreground: string | null
          public_note: string | null
          public_registration: boolean
          public_registration_email_filter: Json | null
          public_registration_role: string | null
          public_registration_verify_email: boolean
          report_bug_url: string | null
          report_error_url: string | null
          report_feature_url: string | null
          storage_asset_presets: Json | null
          storage_asset_transform: string | null
          storage_default_folder: string | null
          theme_dark_overrides: Json | null
          theme_light_overrides: Json | null
          visual_editor_urls: Json | null
        }
        Insert: {
          auth_login_attempts?: number | null
          auth_password_policy?: string | null
          basemaps?: Json | null
          custom_aspect_ratios?: Json | null
          custom_css?: string | null
          default_appearance?: string
          default_language?: string
          default_theme_dark?: string | null
          default_theme_light?: string | null
          id?: number
          mapbox_key?: string | null
          module_bar?: Json | null
          project_color?: string
          project_descriptor?: string | null
          project_logo?: string | null
          project_name?: string
          project_url?: string | null
          public_background?: string | null
          public_favicon?: string | null
          public_foreground?: string | null
          public_note?: string | null
          public_registration?: boolean
          public_registration_email_filter?: Json | null
          public_registration_role?: string | null
          public_registration_verify_email?: boolean
          report_bug_url?: string | null
          report_error_url?: string | null
          report_feature_url?: string | null
          storage_asset_presets?: Json | null
          storage_asset_transform?: string | null
          storage_default_folder?: string | null
          theme_dark_overrides?: Json | null
          theme_light_overrides?: Json | null
          visual_editor_urls?: Json | null
        }
        Update: {
          auth_login_attempts?: number | null
          auth_password_policy?: string | null
          basemaps?: Json | null
          custom_aspect_ratios?: Json | null
          custom_css?: string | null
          default_appearance?: string
          default_language?: string
          default_theme_dark?: string | null
          default_theme_light?: string | null
          id?: number
          mapbox_key?: string | null
          module_bar?: Json | null
          project_color?: string
          project_descriptor?: string | null
          project_logo?: string | null
          project_name?: string
          project_url?: string | null
          public_background?: string | null
          public_favicon?: string | null
          public_foreground?: string | null
          public_note?: string | null
          public_registration?: boolean
          public_registration_email_filter?: Json | null
          public_registration_role?: string | null
          public_registration_verify_email?: boolean
          report_bug_url?: string | null
          report_error_url?: string | null
          report_feature_url?: string | null
          storage_asset_presets?: Json | null
          storage_asset_transform?: string | null
          storage_default_folder?: string | null
          theme_dark_overrides?: Json | null
          theme_light_overrides?: Json | null
          visual_editor_urls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_settings_project_logo_foreign"
            columns: ["project_logo"]
            isOneToOne: false
            referencedRelation: "directus_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_settings_public_background_foreign"
            columns: ["public_background"]
            isOneToOne: false
            referencedRelation: "directus_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_settings_public_favicon_foreign"
            columns: ["public_favicon"]
            isOneToOne: false
            referencedRelation: "directus_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_settings_public_foreground_foreign"
            columns: ["public_foreground"]
            isOneToOne: false
            referencedRelation: "directus_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_settings_public_registration_role_foreign"
            columns: ["public_registration_role"]
            isOneToOne: false
            referencedRelation: "directus_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_settings_storage_default_folder_foreign"
            columns: ["storage_default_folder"]
            isOneToOne: false
            referencedRelation: "directus_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_shares: {
        Row: {
          collection: string
          date_created: string | null
          date_end: string | null
          date_start: string | null
          id: string
          item: string
          max_uses: number | null
          name: string | null
          password: string | null
          role: string | null
          times_used: number | null
          user_created: string | null
        }
        Insert: {
          collection: string
          date_created?: string | null
          date_end?: string | null
          date_start?: string | null
          id: string
          item: string
          max_uses?: number | null
          name?: string | null
          password?: string | null
          role?: string | null
          times_used?: number | null
          user_created?: string | null
        }
        Update: {
          collection?: string
          date_created?: string | null
          date_end?: string | null
          date_start?: string | null
          id?: string
          item?: string
          max_uses?: number | null
          name?: string | null
          password?: string | null
          role?: string | null
          times_used?: number | null
          user_created?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_shares_collection_foreign"
            columns: ["collection"]
            isOneToOne: false
            referencedRelation: "directus_collections"
            referencedColumns: ["collection"]
          },
          {
            foreignKeyName: "directus_shares_role_foreign"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "directus_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_shares_user_created_foreign"
            columns: ["user_created"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_translations: {
        Row: {
          id: string
          key: string
          language: string
          value: string
        }
        Insert: {
          id: string
          key: string
          language: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          language?: string
          value?: string
        }
        Relationships: []
      }
      directus_users: {
        Row: {
          appearance: string | null
          auth_data: Json | null
          avatar: string | null
          description: string | null
          email: string | null
          email_notifications: boolean | null
          external_identifier: string | null
          first_name: string | null
          id: string
          language: string | null
          last_access: string | null
          last_name: string | null
          last_page: string | null
          location: string | null
          password: string | null
          provider: string
          role: string | null
          status: string
          tags: Json | null
          tfa_secret: string | null
          theme_dark: string | null
          theme_dark_overrides: Json | null
          theme_light: string | null
          theme_light_overrides: Json | null
          title: string | null
          token: string | null
        }
        Insert: {
          appearance?: string | null
          auth_data?: Json | null
          avatar?: string | null
          description?: string | null
          email?: string | null
          email_notifications?: boolean | null
          external_identifier?: string | null
          first_name?: string | null
          id: string
          language?: string | null
          last_access?: string | null
          last_name?: string | null
          last_page?: string | null
          location?: string | null
          password?: string | null
          provider?: string
          role?: string | null
          status?: string
          tags?: Json | null
          tfa_secret?: string | null
          theme_dark?: string | null
          theme_dark_overrides?: Json | null
          theme_light?: string | null
          theme_light_overrides?: Json | null
          title?: string | null
          token?: string | null
        }
        Update: {
          appearance?: string | null
          auth_data?: Json | null
          avatar?: string | null
          description?: string | null
          email?: string | null
          email_notifications?: boolean | null
          external_identifier?: string | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_access?: string | null
          last_name?: string | null
          last_page?: string | null
          location?: string | null
          password?: string | null
          provider?: string
          role?: string | null
          status?: string
          tags?: Json | null
          tfa_secret?: string | null
          theme_dark?: string | null
          theme_dark_overrides?: Json | null
          theme_light?: string | null
          theme_light_overrides?: Json | null
          title?: string | null
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_users_role_foreign"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "directus_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_versions: {
        Row: {
          collection: string
          date_created: string | null
          date_updated: string | null
          delta: Json | null
          hash: string | null
          id: string
          item: string
          key: string
          name: string | null
          user_created: string | null
          user_updated: string | null
        }
        Insert: {
          collection: string
          date_created?: string | null
          date_updated?: string | null
          delta?: Json | null
          hash?: string | null
          id: string
          item: string
          key: string
          name?: string | null
          user_created?: string | null
          user_updated?: string | null
        }
        Update: {
          collection?: string
          date_created?: string | null
          date_updated?: string | null
          delta?: Json | null
          hash?: string | null
          id?: string
          item?: string
          key?: string
          name?: string | null
          user_created?: string | null
          user_updated?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_versions_collection_foreign"
            columns: ["collection"]
            isOneToOne: false
            referencedRelation: "directus_collections"
            referencedColumns: ["collection"]
          },
          {
            foreignKeyName: "directus_versions_user_created_foreign"
            columns: ["user_created"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_versions_user_updated_foreign"
            columns: ["user_updated"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_webhooks: {
        Row: {
          actions: string
          collections: string
          data: boolean
          headers: Json | null
          id: number
          method: string
          migrated_flow: string | null
          name: string
          status: string
          url: string
          was_active_before_deprecation: boolean
        }
        Insert: {
          actions: string
          collections: string
          data?: boolean
          headers?: Json | null
          id?: number
          method?: string
          migrated_flow?: string | null
          name: string
          status?: string
          url: string
          was_active_before_deprecation?: boolean
        }
        Update: {
          actions?: string
          collections?: string
          data?: boolean
          headers?: Json | null
          id?: number
          method?: string
          migrated_flow?: string | null
          name?: string
          status?: string
          url?: string
          was_active_before_deprecation?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "directus_webhooks_migrated_flow_foreign"
            columns: ["migrated_flow"]
            isOneToOne: false
            referencedRelation: "directus_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_votes: {
        Row: {
          created_at: string
          discussion_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discussion_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discussion_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_votes_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          author_id: string
          category_id: string
          content: string
          created_at: string
          id: string
          title: string
        }
        Insert: {
          author_id: string
          category_id: string
          content: string
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          author_id?: string
          category_id?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          booking_id: string | null
          created_at: string | null
          description: string
          evidence: Json | null
          id: string
          payment_id: string | null
          provider_id: string | null
          resolution: string | null
          resolution_date: string | null
          status: string | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          description: string
          evidence?: Json | null
          id?: string
          payment_id?: string | null
          provider_id?: string | null
          resolution?: string | null
          resolution_date?: string | null
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          description?: string
          evidence?: Json | null
          id?: string
          payment_id?: string | null
          provider_id?: string | null
          resolution?: string | null
          resolution_date?: string | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "care_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      drawing_notes: {
        Row: {
          created_at: string
          drawing_data: Json | null
          id: string
          team_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          drawing_data?: Json | null
          id?: string
          team_id?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          drawing_data?: Json | null
          id?: string
          team_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drawing_notes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          error: string | null
          id: string
          recipient: string
          sent_at: string | null
          status: string | null
          subject: string
          type: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          error?: string | null
          id?: string
          recipient: string
          sent_at?: string | null
          status?: string | null
          subject: string
          type?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          error?: string | null
          id?: string
          recipient?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          type?: string | null
        }
        Relationships: []
      }
      emergency_alert: {
        Row: {
          contacts_notified: string | null
          created_at: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          message: string | null
          notification_results: Json | null
          user_id: string
        }
        Insert: {
          contacts_notified?: string | null
          created_at?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          message?: string | null
          notification_results?: Json | null
          user_id: string
        }
        Update: {
          contacts_notified?: string | null
          created_at?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          message?: string | null
          notification_results?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      energy_plans: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          created_at: string | null
          dnd_settings: Json | null
          id: string
          participant_email: string | null
          participant_number: string | null
          profile_data: Json | null
          project_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dnd_settings?: Json | null
          id?: string
          participant_email?: string | null
          participant_number?: string | null
          profile_data?: Json | null
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dnd_settings?: Json | null
          id?: string
          participant_email?: string | null
          participant_number?: string | null
          profile_data?: Json | null
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_logs: {
        Row: {
          activity_type: string
          calories_burned: number | null
          duration_minutes: number | null
          exercise_type: string
          id: string
          intensity: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          activity_type: string
          calories_burned?: number | null
          duration_minutes?: number | null
          exercise_type: string
          id?: string
          intensity?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          calories_burned?: number | null
          duration_minutes?: number | null
          exercise_type?: string
          id?: string
          intensity?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      exercise_routines: {
        Row: {
          created_at: string
          exercises: Json
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exercises?: Json
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          exercises?: Json
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          benefits: string[] | null
          calories: number
          category: string | null
          created_at: string | null
          description: string
          duration: string
          id: string
          instructions: string[] | null
          intensity: string
          title: string
          updated_at: string | null
        }
        Insert: {
          benefits?: string[] | null
          calories: number
          category?: string | null
          created_at?: string | null
          description: string
          duration: string
          id?: string
          instructions?: string[] | null
          intensity: string
          title: string
          updated_at?: string | null
        }
        Update: {
          benefits?: string[] | null
          calories?: number
          category?: string | null
          created_at?: string | null
          description?: string
          duration?: string
          id?: string
          instructions?: string[] | null
          intensity?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fella_control_achievement_definitions: {
        Row: {
          category: string
          created_at: string
          criteria: Json | null
          description: string
          icon_name: string | null
          id: string
          is_active: boolean
          points: number
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          criteria?: Json | null
          description: string
          icon_name?: string | null
          id: string
          is_active?: boolean
          points?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          criteria?: Json | null
          description?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean
          points?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      fella_control_activity_points_log: {
        Row: {
          activity_id: string | null
          activity_name: string | null
          activity_type: string
          created_at: string
          id: string
          points_earned: number
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          activity_name?: string | null
          activity_type: string
          created_at?: string
          id?: string
          points_earned: number
          user_id: string
        }
        Update: {
          activity_id?: string | null
          activity_name?: string | null
          activity_type?: string
          created_at?: string
          id?: string
          points_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      fella_control_alcohol_logs: {
        Row: {
          alternative_activity_considered: string | null
          craving_intensity: number | null
          craving_trigger: string | null
          created_at: string
          date: string
          drink_entries_data: Json | null
          energy: number | null
          energy_level: number | null
          focus: number | null
          focus_level: number | null
          id: string
          journal_summary: string | null
          mood: number | null
          mood_notes: string | null
          reason_for_drinking: string | null
          sleep_hours: number | null
          sleep_quality: number | null
          stress_level: number | null
          used_alcohol: boolean
          user_id: string
        }
        Insert: {
          alternative_activity_considered?: string | null
          craving_intensity?: number | null
          craving_trigger?: string | null
          created_at?: string
          date: string
          drink_entries_data?: Json | null
          energy?: number | null
          energy_level?: number | null
          focus?: number | null
          focus_level?: number | null
          id?: string
          journal_summary?: string | null
          mood?: number | null
          mood_notes?: string | null
          reason_for_drinking?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          used_alcohol: boolean
          user_id: string
        }
        Update: {
          alternative_activity_considered?: string | null
          craving_intensity?: number | null
          craving_trigger?: string | null
          created_at?: string
          date?: string
          drink_entries_data?: Json | null
          energy?: number | null
          energy_level?: number | null
          focus?: number | null
          focus_level?: number | null
          id?: string
          journal_summary?: string | null
          mood?: number | null
          mood_notes?: string | null
          reason_for_drinking?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          used_alcohol?: boolean
          user_id?: string
        }
        Relationships: []
      }
      fella_control_badges: {
        Row: {
          category: string | null
          created_at: string
          criteria: Json | null
          description: string
          id: string
          image_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          criteria?: Json | null
          description: string
          id: string
          image_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          criteria?: Json | null
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      fella_control_claimed_rewards: {
        Row: {
          claimed_at: string
          created_at: string
          id: string
          notes: string | null
          points_redeemed: number
          reward_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          claimed_at?: string
          created_at?: string
          id?: string
          notes?: string | null
          points_redeemed: number
          reward_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          claimed_at?: string
          created_at?: string
          id?: string
          notes?: string | null
          points_redeemed?: number
          reward_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_control_claimed_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "fella_control_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_control_community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          parent_post_id: string | null
          title: string
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          parent_post_id?: string | null
          title: string
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          parent_post_id?: string | null
          title?: string
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_control_community_posts_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "fella_control_community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_control_community_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "fella_control_community_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_control_community_topics: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      fella_control_coping_strategies: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fella_control_craving_logs: {
        Row: {
          coping_strategy_id: string | null
          coping_strategy_used: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          intensity: number
          location: string | null
          log_date: string | null
          notes: string | null
          timestamp: string
          trigger_description: string | null
          trigger_id: string | null
          user_id: string
        }
        Insert: {
          coping_strategy_id?: string | null
          coping_strategy_used?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          intensity: number
          location?: string | null
          log_date?: string | null
          notes?: string | null
          timestamp?: string
          trigger_description?: string | null
          trigger_id?: string | null
          user_id: string
        }
        Update: {
          coping_strategy_id?: string | null
          coping_strategy_used?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          intensity?: number
          location?: string | null
          log_date?: string | null
          notes?: string | null
          timestamp?: string
          trigger_description?: string | null
          trigger_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fella_control_drink_logs: {
        Row: {
          created_at: string
          date: string
          drink_type: string
          drinking_setting: string | null
          id: string
          notes: string | null
          units: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          drink_type: string
          drinking_setting?: string | null
          id?: string
          notes?: string | null
          units: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          drink_type?: string
          drinking_setting?: string | null
          id?: string
          notes?: string | null
          units?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_control_health_metrics: {
        Row: {
          created_at: string
          date: string
          energy_level: number | null
          focus_level: number | null
          id: string
          mood: number | null
          notes: string | null
          sleep_hours: number | null
          sleep_quality: number | null
          stress_level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          energy_level?: number | null
          focus_level?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          energy_level?: number | null
          focus_level?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_control_journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          mood_rating: number | null
          tags: Json | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mood_rating?: number | null
          tags?: Json | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mood_rating?: number | null
          tags?: Json | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_control_local_resources: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          geom: unknown
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          resource_type: string | null
          state: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          geom?: unknown
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          resource_type?: string | null
          state?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          geom?: unknown
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          resource_type?: string | null
          state?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      fella_control_medication_reminders: {
        Row: {
          created_at: string
          dosage: string | null
          end_date: string | null
          frequency: string
          id: string
          medication_name: string
          reminder_time: string
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          medication_name: string
          reminder_time: string
          start_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          medication_name?: string
          reminder_time?: string
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_control_meditation_logs: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          session_type: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes: number
          id?: string
          notes?: string | null
          session_type?: string | null
          timestamp: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          session_type?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_control_notification_preferences: {
        Row: {
          badge_unlock_notifications: boolean | null
          community_notifications: boolean | null
          created_at: string | null
          fella_chat_notifications: boolean | null
          id: string
          milestone_notifications: boolean | null
          motivational_quote_notifications: boolean | null
          reminder_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badge_unlock_notifications?: boolean | null
          community_notifications?: boolean | null
          created_at?: string | null
          fella_chat_notifications?: boolean | null
          id?: string
          milestone_notifications?: boolean | null
          motivational_quote_notifications?: boolean | null
          reminder_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badge_unlock_notifications?: boolean | null
          community_notifications?: boolean | null
          created_at?: string | null
          fella_chat_notifications?: boolean | null
          id?: string
          milestone_notifications?: boolean | null
          motivational_quote_notifications?: boolean | null
          reminder_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fella_control_post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_control_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "fella_control_community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_control_push_tokens: {
        Row: {
          created_at: string | null
          id: string
          platform: string | null
          token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform?: string | null
          token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string | null
          token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fella_control_quotes: {
        Row: {
          author: string | null
          created_at: string
          id: number
          quote_text: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          id?: number
          quote_text: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          created_at?: string
          id?: number
          quote_text?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      fella_control_relapses: {
        Row: {
          coping_strategy_attempted_id: string | null
          created_at: string
          feelings_after: string | null
          feelings_before: string | null
          id: number
          learned: string | null
          reported_at: string
          situation: string | null
          trigger: string | null
          trigger_id: string | null
          user_id: string
        }
        Insert: {
          coping_strategy_attempted_id?: string | null
          created_at?: string
          feelings_after?: string | null
          feelings_before?: string | null
          id?: number
          learned?: string | null
          reported_at?: string
          situation?: string | null
          trigger?: string | null
          trigger_id?: string | null
          user_id: string
        }
        Update: {
          coping_strategy_attempted_id?: string | null
          created_at?: string
          feelings_after?: string | null
          feelings_before?: string | null
          id?: number
          learned?: string | null
          reported_at?: string
          situation?: string | null
          trigger?: string | null
          trigger_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relapses_coping_strategy_attempted_id_fkey"
            columns: ["coping_strategy_attempted_id"]
            isOneToOne: false
            referencedRelation: "coping_strategy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relapses_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "trigger_item"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_control_reminders: {
        Row: {
          created_at: string
          dosage: string | null
          end_date: string | null
          frequency: string
          id: string
          medication_name: string
          reminder_time: string
          reminder_type: string
          start_date: string
          support_activity: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          medication_name: string
          reminder_time: string
          reminder_type?: string
          start_date: string
          support_activity?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          medication_name?: string
          reminder_time?: string
          reminder_type?: string
          start_date?: string
          support_activity?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fella_control_reply_likes: {
        Row: {
          created_at: string
          id: string
          reply_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reply_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reply_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_control_reply_likes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "fella_control_community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_control_rewards: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          points_required: number
          reward_category: string | null
          unlock_condition: Json | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          points_required?: number
          reward_category?: string | null
          unlock_condition?: Json | null
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          points_required?: number
          reward_category?: string | null
          unlock_condition?: Json | null
        }
        Relationships: []
      }
      fella_control_scheduled_notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_active: boolean
          notification_id: string
          schedule_time: string
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_active?: boolean
          notification_id: string
          schedule_time: string
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_active?: boolean
          notification_id?: string
          schedule_time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_control_step_rewards: {
        Row: {
          created_at: string
          date: string
          id: string
          points_earned: number
          steps: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          points_earned: number
          steps: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          points_earned?: number
          steps?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_control_success_stories: {
        Row: {
          created_at: string
          id: string
          is_anonymous: boolean
          story_content: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_anonymous?: boolean
          story_content: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_anonymous?: boolean
          story_content?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_control_success_story_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          parent_comment_id: string | null
          story_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          parent_comment_id?: string | null
          story_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          parent_comment_id?: string | null
          story_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_control_success_story_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "fella_control_success_story_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_control_success_story_comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "fella_control_success_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_control_success_story_likes: {
        Row: {
          created_at: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_control_success_story_likes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "fella_control_success_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_control_support_requests: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      fella_control_triggers: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fella_control_user_achievements: {
        Row: {
          achieved_at: string
          achievement_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          achieved_at?: string
          achievement_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          achieved_at?: string
          achievement_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_control_user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "fella_control_achievement_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_control_user_badges: {
        Row: {
          badge_id: string
          created_at: string
          earned_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          created_at?: string
          earned_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          created_at?: string
          earned_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_control_user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "fella_control_badges"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_control_user_gamification_stats: {
        Row: {
          created_at: string
          current_level: number
          current_points: number
          current_streak: number
          last_streak_check_date: string | null
          last_streak_updated_at: string | null
          longest_streak: number
          tool_usage_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_points?: number
          current_streak?: number
          last_streak_check_date?: string | null
          last_streak_updated_at?: string | null
          longest_streak?: number
          tool_usage_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          current_points?: number
          current_streak?: number
          last_streak_check_date?: string | null
          last_streak_updated_at?: string | null
          longest_streak?: number
          tool_usage_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_control_user_goal_details: {
        Row: {
          created_at: string
          fella_control_cost_per_drink: number | null
          fella_control_product_type: string | null
          fella_control_reduction_target_percent: number | null
          id: string
          method_details: Json | null
          moderation_start_date: string | null
          typical_daily_porn_hours: number | null
          updated_at: string
          user_goal_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fella_control_cost_per_drink?: number | null
          fella_control_product_type?: string | null
          fella_control_reduction_target_percent?: number | null
          id?: string
          method_details?: Json | null
          moderation_start_date?: string | null
          typical_daily_porn_hours?: number | null
          updated_at?: string
          user_goal_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          fella_control_cost_per_drink?: number | null
          fella_control_product_type?: string | null
          fella_control_reduction_target_percent?: number | null
          id?: string
          method_details?: Json | null
          moderation_start_date?: string | null
          typical_daily_porn_hours?: number | null
          updated_at?: string
          user_goal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_control_user_goal_details_user_goal_id_fkey"
            columns: ["user_goal_id"]
            isOneToOne: false
            referencedRelation: "user_goal"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_control_user_goals: {
        Row: {
          created_at: string
          daily_step_goal: number | null
          fella_control_cost_per_drink: number | null
          fella_control_product_type: string | null
          fella_control_reduction_target_percent: number | null
          fella_control_typical_daily_drinks: number | null
          goal_type: string
          id: string
          method: string | null
          method_details: Json | null
          moderation_start_date: string | null
          motivation: string | null
          quit_date: string | null
          status: string | null
          timeline_days: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_step_goal?: number | null
          fella_control_cost_per_drink?: number | null
          fella_control_product_type?: string | null
          fella_control_reduction_target_percent?: number | null
          fella_control_typical_daily_drinks?: number | null
          goal_type: string
          id?: string
          method?: string | null
          method_details?: Json | null
          moderation_start_date?: string | null
          motivation?: string | null
          quit_date?: string | null
          status?: string | null
          timeline_days?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_step_goal?: number | null
          fella_control_cost_per_drink?: number | null
          fella_control_product_type?: string | null
          fella_control_reduction_target_percent?: number | null
          fella_control_typical_daily_drinks?: number | null
          goal_type?: string
          id?: string
          method?: string | null
          method_details?: Json | null
          moderation_start_date?: string | null
          motivation?: string | null
          quit_date?: string | null
          status?: string | null
          timeline_days?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_control_user_preferences: {
        Row: {
          ai_gentleness_preference: number | null
          arePushNotificationsEnabled: boolean | null
          cost_per_drink_unit: number | null
          created_at: string
          dashboard_widgets: Json | null
          id: string
          notifications: Json | null
          preferred_ai_salutation: string | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_gentleness_preference?: number | null
          arePushNotificationsEnabled?: boolean | null
          cost_per_drink_unit?: number | null
          created_at?: string
          dashboard_widgets?: Json | null
          id?: string
          notifications?: Json | null
          preferred_ai_salutation?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_gentleness_preference?: number | null
          arePushNotificationsEnabled?: boolean | null
          cost_per_drink_unit?: number | null
          created_at?: string
          dashboard_widgets?: Json | null
          id?: string
          notifications?: Json | null
          preferred_ai_salutation?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_control_user_trigger_strategy_map: {
        Row: {
          created_at: string | null
          id: string
          strategy_id: string
          trigger_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          strategy_id: string
          trigger_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          strategy_id?: string
          trigger_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_control_user_trigger_strategy_map_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "fella_control_coping_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_control_user_trigger_strategy_map_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "fella_control_triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_fresh_activity_logs: {
        Row: {
          activity_type: string
          calories_burned: number | null
          created_at: string
          duration_minutes: number
          id: string
          intensity: number | null
          notes: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          calories_burned?: number | null
          created_at?: string
          duration_minutes: number
          id?: string
          intensity?: number | null
          notes?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          calories_burned?: number | null
          created_at?: string
          duration_minutes?: number
          id?: string
          intensity?: number | null
          notes?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fella_fresh_activity_points_log: {
        Row: {
          activity_type: string
          id: string
          metadata: Json | null
          occurred_at: string
          points_earned: number
          user_id: string
        }
        Insert: {
          activity_type: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          points_earned: number
          user_id: string
        }
        Update: {
          activity_type?: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          points_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      fella_fresh_claimed_rewards: {
        Row: {
          claimed_at: string
          created_at: string
          id: string
          notes: string | null
          points_redeemed: number
          reward_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          claimed_at?: string
          created_at?: string
          id?: string
          notes?: string | null
          points_redeemed: number
          reward_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          claimed_at?: string
          created_at?: string
          id?: string
          notes?: string | null
          points_redeemed?: number
          reward_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_fresh_claimed_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "fella_fresh_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_fresh_community_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          story_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          story_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          story_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fella_fresh_community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "fella_fresh_forum_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_fresh_community_likes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "fella_fresh_success_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_fresh_community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          parent_post_id: string | null
          title: string | null
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          parent_post_id?: string | null
          title?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          parent_post_id?: string | null
          title?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_fresh_community_posts_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "fella_fresh_community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_fresh_community_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "fella_fresh_community_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_fresh_community_topics: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          post_count: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          post_count?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          post_count?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fella_fresh_coping_mechanism_logs: {
        Row: {
          created_at: string
          duration_minutes: number | null
          effectiveness_rating: number | null
          id: string
          mechanism_used: string
          notes: string | null
          timestamp: string
          trigger_event: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          effectiveness_rating?: number | null
          id?: string
          mechanism_used: string
          notes?: string | null
          timestamp?: string
          trigger_event?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          effectiveness_rating?: number | null
          id?: string
          mechanism_used?: string
          notes?: string | null
          timestamp?: string
          trigger_event?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fella_fresh_coping_strategies: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          strategy_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          strategy_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          strategy_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_fresh_craving_logs: {
        Row: {
          coping_mechanism: string | null
          coping_strategy_id: string | null
          created_at: string
          id: string
          intensity: number
          timestamp: string
          trigger: string | null
          trigger_id: string | null
          user_id: string | null
        }
        Insert: {
          coping_mechanism?: string | null
          coping_strategy_id?: string | null
          created_at?: string
          id?: string
          intensity: number
          timestamp?: string
          trigger?: string | null
          trigger_id?: string | null
          user_id?: string | null
        }
        Update: {
          coping_mechanism?: string | null
          coping_strategy_id?: string | null
          created_at?: string
          id?: string
          intensity?: number
          timestamp?: string
          trigger?: string | null
          trigger_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fella_fresh_craving_logs_coping_strategy_id_fkey"
            columns: ["coping_strategy_id"]
            isOneToOne: false
            referencedRelation: "coping_strategy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_fresh_craving_logs_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "trigger_item"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_fresh_custom_products: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_fresh_daily_wellness_logs: {
        Row: {
          created_at: string
          energy_level: number | null
          id: string
          logged_at: string
          mood: number | null
          notes: string | null
          sleep_hours: number | null
          sleep_quality: number | null
          stress_level: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          energy_level?: number | null
          id?: string
          logged_at?: string
          mood?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          energy_level?: number | null
          id?: string
          logged_at?: string
          mood?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          user_id?: string
        }
        Relationships: []
      }
      fella_fresh_educational_content_progress: {
        Row: {
          completed_at: string | null
          content_id: string
          content_type: string
          created_at: string
          id: string
          last_accessed_at: string
          notes: string | null
          progress_percentage: number | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          last_accessed_at?: string
          notes?: string | null
          progress_percentage?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          last_accessed_at?: string
          notes?: string | null
          progress_percentage?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fella_fresh_forum_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fella_fresh_forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "fella_fresh_forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_fresh_forum_replies: {
        Row: {
          comment_id: string | null
          content: string
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          comment_id?: string | null
          content: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          comment_id?: string | null
          content?: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fella_fresh_forum_replies_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "fella_fresh_forum_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_fresh_forum_threads: {
        Row: {
          content: string
          created_at: string
          id: string
          like_count: number
          reply_count: number
          title: string
          topic_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          like_count?: number
          reply_count?: number
          title: string
          topic_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          like_count?: number
          reply_count?: number
          title?: string
          topic_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fella_fresh_forum_threads_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "fella_fresh_community_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_fresh_gratitude_journal_entries: {
        Row: {
          created_at: string
          entry_date: string
          entry_text: string
          id: string
          tags: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entry_date: string
          entry_text: string
          id?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entry_date?: string
          entry_text?: string
          id?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fella_fresh_health_metrics: {
        Row: {
          created_at: string
          date: string
          emotion_tags: string[] | null
          energy_level: number | null
          factors: string[] | null
          focus_level: number | null
          id: string
          meditation_minutes: number | null
          mood: number | null
          notes: string | null
          sleep_hours: number | null
          sleep_quality: number | null
          stress_level: number | null
          symptoms: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          emotion_tags?: string[] | null
          energy_level?: number | null
          factors?: string[] | null
          focus_level?: number | null
          id?: string
          meditation_minutes?: number | null
          mood?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          symptoms?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          emotion_tags?: string[] | null
          energy_level?: number | null
          factors?: string[] | null
          focus_level?: number | null
          id?: string
          meditation_minutes?: number | null
          mood?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          symptoms?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_fresh_hydration_logs: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          user_id: string | null
          water_intake_ml: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          user_id?: string | null
          water_intake_ml: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          user_id?: string | null
          water_intake_ml?: number
        }
        Relationships: []
      }
      fella_fresh_meditation_logs: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          meditation_type: string | null
          notes: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration_minutes: number
          id?: string
          meditation_type?: string | null
          notes?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          meditation_type?: string | null
          notes?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fella_fresh_mood_logs: {
        Row: {
          created_at: string
          id: string
          mood_rating: number
          notes: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          mood_rating: number
          notes?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          mood_rating?: number
          notes?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fella_fresh_nicotine_logs: {
        Row: {
          coping_strategy_id: string | null
          craving_intensity: number | null
          craving_trigger_id: string | null
          created_at: string
          custom_coping_strategy_description: string | null
          custom_product_name: string | null
          custom_trigger_description: string | null
          id: string
          logged_at: string
          mood_after: number | null
          mood_before: number | null
          notes: string | null
          product_type: string | null
          quantity: number | null
          unit: string | null
          user_id: string
        }
        Insert: {
          coping_strategy_id?: string | null
          craving_intensity?: number | null
          craving_trigger_id?: string | null
          created_at?: string
          custom_coping_strategy_description?: string | null
          custom_product_name?: string | null
          custom_trigger_description?: string | null
          id?: string
          logged_at?: string
          mood_after?: number | null
          mood_before?: number | null
          notes?: string | null
          product_type?: string | null
          quantity?: number | null
          unit?: string | null
          user_id: string
        }
        Update: {
          coping_strategy_id?: string | null
          craving_intensity?: number | null
          craving_trigger_id?: string | null
          created_at?: string
          custom_coping_strategy_description?: string | null
          custom_product_name?: string | null
          custom_trigger_description?: string | null
          id?: string
          logged_at?: string
          mood_after?: number | null
          mood_before?: number | null
          notes?: string | null
          product_type?: string | null
          quantity?: number | null
          unit?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_fresh_nicotine_logs_coping_strategy_id_fkey"
            columns: ["coping_strategy_id"]
            isOneToOne: false
            referencedRelation: "fella_fresh_coping_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_fresh_nicotine_logs_craving_trigger_id_fkey"
            columns: ["craving_trigger_id"]
            isOneToOne: false
            referencedRelation: "fella_fresh_triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_fresh_physical_activity_logs: {
        Row: {
          activity_type: string
          calories_burned: number | null
          created_at: string
          distance_km: number | null
          duration_minutes: number | null
          id: string
          intensity: string | null
          notes: string | null
          steps: number | null
          timestamp: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          calories_burned?: number | null
          created_at?: string
          distance_km?: number | null
          duration_minutes?: number | null
          id?: string
          intensity?: string | null
          notes?: string | null
          steps?: number | null
          timestamp?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          calories_burned?: number | null
          created_at?: string
          distance_km?: number | null
          duration_minutes?: number | null
          id?: string
          intensity?: string | null
          notes?: string | null
          steps?: number | null
          timestamp?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fella_fresh_post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_fresh_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "fella_fresh_community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_fresh_reflections: {
        Row: {
          content: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_fresh_rewards: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          points_required: number
          reward_category: string | null
          unlock_condition: Json | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          points_required: number
          reward_category?: string | null
          unlock_condition?: Json | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          points_required?: number
          reward_category?: string | null
          unlock_condition?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      fella_fresh_sleep_logs: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          sleep_duration_hours: number
          sleep_quality: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          sleep_duration_hours: number
          sleep_quality: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          sleep_duration_hours?: number
          sleep_quality?: number
          user_id?: string | null
        }
        Relationships: []
      }
      fella_fresh_social_support_interactions: {
        Row: {
          contact_person_nickname: string | null
          created_at: string
          duration_minutes: number | null
          feeling_after: string | null
          feeling_before: string | null
          id: string
          interaction_type: string
          notes: string | null
          platform: string | null
          timestamp: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contact_person_nickname?: string | null
          created_at?: string
          duration_minutes?: number | null
          feeling_after?: string | null
          feeling_before?: string | null
          id?: string
          interaction_type: string
          notes?: string | null
          platform?: string | null
          timestamp?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contact_person_nickname?: string | null
          created_at?: string
          duration_minutes?: number | null
          feeling_after?: string | null
          feeling_before?: string | null
          id?: string
          interaction_type?: string
          notes?: string | null
          platform?: string | null
          timestamp?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fella_fresh_step_rewards: {
        Row: {
          created_at: string
          id: string
          points_earned: number
          reward_id: string | null
          steps_required: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_earned: number
          reward_id?: string | null
          steps_required: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          points_earned?: number
          reward_id?: string | null
          steps_required?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_fresh_step_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "fella_fresh_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_fresh_success_stories: {
        Row: {
          comment_count: number
          created_at: string
          id: string
          is_anonymous: boolean
          like_count: number
          story_content: string
          title: string
          user_id: string | null
        }
        Insert: {
          comment_count?: number
          created_at?: string
          id?: string
          is_anonymous?: boolean
          like_count?: number
          story_content: string
          title: string
          user_id?: string | null
        }
        Update: {
          comment_count?: number
          created_at?: string
          id?: string
          is_anonymous?: boolean
          like_count?: number
          story_content?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fella_fresh_triggers: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          trigger_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          trigger_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          trigger_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_fresh_user_gamification_stats: {
        Row: {
          achievements_unlocked: number
          created_at: string
          current_points: number
          id: string
          last_activity_at: string | null
          learning_modules_completed: number
          points_redeemed: number
          tools_used_count: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements_unlocked?: number
          created_at?: string
          current_points?: number
          id?: string
          last_activity_at?: string | null
          learning_modules_completed?: number
          points_redeemed?: number
          tools_used_count?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements_unlocked?: number
          created_at?: string
          current_points?: number
          id?: string
          last_activity_at?: string | null
          learning_modules_completed?: number
          points_redeemed?: number
          tools_used_count?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_fresh_user_trigger_strategy_map: {
        Row: {
          created_at: string
          effectiveness_rating: number | null
          id: string
          notes: string | null
          strategy_id: string
          trigger_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          notes?: string | null
          strategy_id: string
          trigger_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          notes?: string | null
          strategy_id?: string
          trigger_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_fresh_user_trigger_strategy_map_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "fella_fresh_coping_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_fresh_user_trigger_strategy_map_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "fella_fresh_triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_note_calendar_events: {
        Row: {
          all_day: boolean | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          location: string | null
          start_time: string
          title: string
          user_id: string | null
        }
        Insert: {
          all_day?: boolean | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          start_time: string
          title: string
          user_id?: string | null
        }
        Update: {
          all_day?: boolean | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          start_time?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fella_note_drawings: {
        Row: {
          created_at: string
          drawing_content: Json | null
          id: string
          team_id: string | null
          thumbnail_svg: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          drawing_content?: Json | null
          id?: string
          team_id?: string | null
          thumbnail_svg?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          drawing_content?: Json | null
          id?: string
          team_id?: string | null
          thumbnail_svg?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_note_drawings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_note_habits: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          frequency: string | null
          id: string
          name: string
          start_date: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          name: string
          start_date?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          name?: string
          start_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fella_note_journal_entries: {
        Row: {
          content: Json | null
          created_at: string
          date: string
          id: string
          mood: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          date: string
          id?: string
          mood?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          date?: string
          id?: string
          mood?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_note_memory_palaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_note_mind_map_edges: {
        Row: {
          created_at: string
          id: string
          label: string | null
          map_id: string
          source_node_id: string
          target_node_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          map_id: string
          source_node_id: string
          target_node_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          map_id?: string
          source_node_id?: string
          target_node_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_note_mind_map_edges_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "fella_note_mind_maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_note_mind_map_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "fella_note_mind_map_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_note_mind_map_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "fella_note_mind_map_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_note_mind_map_nodes: {
        Row: {
          color: string | null
          content: string | null
          created_at: string
          id: string
          label: string
          map_id: string
          parent_id: string | null
          updated_at: string
          user_id: string
          x_position: number
          y_position: number
        }
        Insert: {
          color?: string | null
          content?: string | null
          created_at?: string
          id?: string
          label: string
          map_id: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
          x_position: number
          y_position: number
        }
        Update: {
          color?: string | null
          content?: string | null
          created_at?: string
          id?: string
          label?: string
          map_id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
          x_position?: number
          y_position?: number
        }
        Relationships: [
          {
            foreignKeyName: "fella_note_mind_map_nodes_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "fella_note_mind_maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_note_mind_map_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "fella_note_mind_map_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_note_mind_maps: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          team_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          team_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_note_mind_maps_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_note_note_tags: {
        Row: {
          created_at: string
          note_id: string
          tag_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          note_id: string
          tag_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          note_id?: string
          tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_note_note_tags_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "fella_note_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_note_note_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "fella_note_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_note_note_templates: {
        Row: {
          category: string | null
          content: Json
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          tags: string[] | null
          thumbnail_url: string | null
          times_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          tags?: string[] | null
          thumbnail_url?: string | null
          times_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          times_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_note_notebooks: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_notebook_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_notebook_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_notebook_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_note_notebooks_parent_notebook_id_fkey"
            columns: ["parent_notebook_id"]
            isOneToOne: false
            referencedRelation: "fella_note_notebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_note_notes: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          notebook_id: string | null
          team_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          notebook_id?: string | null
          team_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          notebook_id?: string | null
          team_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_note_notes_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "fella_note_notebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_note_notes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_note_palace_items: {
        Row: {
          content_text: string | null
          created_at: string
          id: string
          linked_note_id: string | null
          name: string
          room_id: string
          updated_at: string
          user_id: string
          x_coord: number | null
          y_coord: number | null
        }
        Insert: {
          content_text?: string | null
          created_at?: string
          id?: string
          linked_note_id?: string | null
          name: string
          room_id: string
          updated_at?: string
          user_id: string
          x_coord?: number | null
          y_coord?: number | null
        }
        Update: {
          content_text?: string | null
          created_at?: string
          id?: string
          linked_note_id?: string | null
          name?: string
          room_id?: string
          updated_at?: string
          user_id?: string
          x_coord?: number | null
          y_coord?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fella_note_palace_items_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "fella_note_palace_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_note_palace_rooms: {
        Row: {
          background_image_url: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          order_index: number
          palace_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          background_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          order_index?: number
          palace_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          background_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          palace_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_note_palace_rooms_palace_id_fkey"
            columns: ["palace_id"]
            isOneToOne: false
            referencedRelation: "fella_note_memory_palaces"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_note_projects: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          team_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          team_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_note_projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_note_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_note_task_tags: {
        Row: {
          created_at: string
          tag_id: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          tag_id: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          tag_id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_note_task_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "fella_note_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_note_task_tags_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "fella_note_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_note_tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_complete: boolean
          parent_task_id: string | null
          priority: string
          project_id: string | null
          status: string
          status_order_index: number | null
          subtask_order: number | null
          team_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_complete?: boolean
          parent_task_id?: string | null
          priority?: string
          project_id?: string | null
          status?: string
          status_order_index?: number | null
          subtask_order?: number | null
          team_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_complete?: boolean
          parent_task_id?: string | null
          priority?: string
          project_id?: string | null
          status?: string
          status_order_index?: number | null
          subtask_order?: number | null
          team_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_note_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "fella_note_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_note_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "fella_note_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_note_tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_quit_claimed_rewards: {
        Row: {
          claimed_at: string
          created_at: string
          id: string
          points_redeemed: number
          reward_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          created_at?: string
          id?: string
          points_redeemed: number
          reward_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          created_at?: string
          id?: string
          points_redeemed?: number
          reward_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_quit_claimed_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "fella_quit_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_quit_coping_strategies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      fella_quit_craving_logs: {
        Row: {
          coping_strategy_id: string | null
          created_at: string
          id: string
          intensity: number
          other_trigger: string | null
          timestamp: string
          trigger_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coping_strategy_id?: string | null
          created_at?: string
          id?: string
          intensity: number
          other_trigger?: string | null
          timestamp?: string
          trigger_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coping_strategy_id?: string | null
          created_at?: string
          id?: string
          intensity?: number
          other_trigger?: string | null
          timestamp?: string
          trigger_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_quit_craving_logs_coping_strategy_id_fkey"
            columns: ["coping_strategy_id"]
            isOneToOne: false
            referencedRelation: "fella_quit_coping_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_quit_craving_logs_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "fella_quit_triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_quit_custom_habits: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_quit_daily_check_ins: {
        Row: {
          created_at: string
          date: string
          energy_level: number | null
          focus_level: number | null
          id: string
          mood: number | null
          sleep_hours: number | null
          sleep_quality: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          energy_level?: number | null
          focus_level?: number | null
          id?: string
          mood?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          energy_level?: number | null
          focus_level?: number | null
          id?: string
          mood?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_quit_journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_quit_learning_modules: {
        Row: {
          category: string | null
          content: Json | null
          created_at: string
          description: string | null
          estimated_duration_minutes: number | null
          id: string
          is_published: boolean | null
          order_index: number | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content?: Json | null
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: Json | null
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      fella_quit_mindfulness_reminders: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          time: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          time: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          time?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_quit_mood_entries: {
        Row: {
          created_at: string | null
          id: string
          mood: number
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mood: number
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mood?: number
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fella_quit_push_tokens: {
        Row: {
          created_at: string | null
          id: string
          platform: string | null
          token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform?: string | null
          token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string | null
          token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fella_quit_rewards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          points_required: number
          reward_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          points_required?: number
          reward_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          points_required?: number
          reward_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      fella_quit_support_resources: {
        Row: {
          accessibility_info: string | null
          added_by: string | null
          address: string | null
          city: string | null
          contact_info: Json | null
          cost_details: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          is_online_resource: boolean | null
          languages_spoken: string[] | null
          last_verified_at: string | null
          latitude: number | null
          location: unknown
          longitude: number | null
          name: string
          operating_hours: Json | null
          postal_code: string | null
          resource_type: string | null
          specialties: string[] | null
          state_province: string | null
          target_audience: string | null
          verified: boolean | null
        }
        Insert: {
          accessibility_info?: string | null
          added_by?: string | null
          address?: string | null
          city?: string | null
          contact_info?: Json | null
          cost_details?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_online_resource?: boolean | null
          languages_spoken?: string[] | null
          last_verified_at?: string | null
          latitude?: number | null
          location?: unknown
          longitude?: number | null
          name: string
          operating_hours?: Json | null
          postal_code?: string | null
          resource_type?: string | null
          specialties?: string[] | null
          state_province?: string | null
          target_audience?: string | null
          verified?: boolean | null
        }
        Update: {
          accessibility_info?: string | null
          added_by?: string | null
          address?: string | null
          city?: string | null
          contact_info?: Json | null
          cost_details?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_online_resource?: boolean | null
          languages_spoken?: string[] | null
          last_verified_at?: string | null
          latitude?: number | null
          location?: unknown
          longitude?: number | null
          name?: string
          operating_hours?: Json | null
          postal_code?: string | null
          resource_type?: string | null
          specialties?: string[] | null
          state_province?: string | null
          target_audience?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      fella_quit_testimonial_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          parent_comment_id: string | null
          testimonial_id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          parent_comment_id?: string | null
          testimonial_id: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          parent_comment_id?: string | null
          testimonial_id?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fella_quit_testimonial_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "fella_quit_testimonial_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fella_quit_testimonial_comments_testimonial_id_fkey"
            columns: ["testimonial_id"]
            isOneToOne: false
            referencedRelation: "fella_quit_testimonials"
            referencedColumns: ["id"]
          },
        ]
      }
      fella_quit_testimonials: {
        Row: {
          app_tag: string | null
          author: string
          created_at: string
          id: number
          is_approved: boolean
          quote: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          app_tag?: string | null
          author: string
          created_at?: string
          id?: number
          is_approved?: boolean
          quote: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          app_tag?: string | null
          author?: string
          created_at?: string
          id?: number
          is_approved?: boolean
          quote?: string
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fella_quit_triggers: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_quit_user_points: {
        Row: {
          created_at: string
          id: string
          points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fella_quotes: {
        Row: {
          author: string | null
          created_at: string
          id: number
          quote_text: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          id?: number
          quote_text: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          created_at?: string
          id?: number
          quote_text?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          barcode: string | null
          calcium_mg: number | null
          calories: number
          carbs_g: number
          created_at: string
          fat_g: number
          fiber_g: number | null
          food_name: string
          id: string
          image_url: string | null
          iron_mg: number | null
          log_date: string
          meal_type: string
          notes: string | null
          potassium_mg: number | null
          protein_g: number
          serving_size: number
          serving_unit: string
          sodium_mg: number | null
          sugar_g: number | null
          user_id: string
          vitaminA_mcg: number | null
          vitaminC_mg: number | null
          vitaminD_mcg: number | null
        }
        Insert: {
          barcode?: string | null
          calcium_mg?: number | null
          calories: number
          carbs_g: number
          created_at?: string
          fat_g: number
          fiber_g?: number | null
          food_name: string
          id?: string
          image_url?: string | null
          iron_mg?: number | null
          log_date: string
          meal_type: string
          notes?: string | null
          potassium_mg?: number | null
          protein_g: number
          serving_size: number
          serving_unit: string
          sodium_mg?: number | null
          sugar_g?: number | null
          user_id: string
          vitaminA_mcg?: number | null
          vitaminC_mg?: number | null
          vitaminD_mcg?: number | null
        }
        Update: {
          barcode?: string | null
          calcium_mg?: number | null
          calories?: number
          carbs_g?: number
          created_at?: string
          fat_g?: number
          fiber_g?: number | null
          food_name?: string
          id?: string
          image_url?: string | null
          iron_mg?: number | null
          log_date?: string
          meal_type?: string
          notes?: string | null
          potassium_mg?: number | null
          protein_g?: number
          serving_size?: number
          serving_unit?: string
          sodium_mg?: number | null
          sugar_g?: number | null
          user_id?: string
          vitaminA_mcg?: number | null
          vitaminC_mg?: number | null
          vitaminD_mcg?: number | null
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_post_upvotes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_post_upvotes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_post_upvotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          app_forum: boolean
          category: string | null
          content: string
          created_at: string
          id: string
          parent_id: string | null
          parent_post_id: string | null
          pinned: boolean | null
          post_type: string
          product_id: string | null
          tags: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          app_forum?: boolean
          category?: string | null
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          parent_post_id?: string | null
          pinned?: boolean | null
          post_type?: string
          product_id?: string | null
          tags?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          app_forum?: boolean
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          parent_post_id?: string | null
          pinned?: boolean | null
          post_type?: string
          product_id?: string | null
          tags?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_forum_posts_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_answer: boolean | null
          parent_reply_id: string | null
          post_id: string | null
          updated_at: string | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_answer?: boolean | null
          parent_reply_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_answer?: boolean | null
          parent_reply_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_parent_reply_id_fkey"
            columns: ["parent_reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forums: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      freshcoin_balances: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          total_earned: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      freshcoin_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      game_scores: {
        Row: {
          created_at: string
          game_name: string
          id: string
          level: number | null
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          game_name: string
          id?: string
          level?: number | null
          score: number
          user_id: string
        }
        Update: {
          created_at?: string
          game_name?: string
          id?: string
          level?: number | null
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      goal: {
        Row: {
          cost_per_unit: number | null
          created_at: string | null
          daily_usage: number | null
          goal_type: string
          id: string
          method: string
          motivation: string | null
          product_type: string | null
          quit_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cost_per_unit?: number | null
          created_at?: string | null
          daily_usage?: number | null
          goal_type: string
          id?: string
          method: string
          motivation?: string | null
          product_type?: string | null
          quit_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cost_per_unit?: number | null
          created_at?: string | null
          daily_usage?: number | null
          goal_type?: string
          id?: string
          method?: string
          motivation?: string | null
          product_type?: string | null
          quit_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      goal_milestones: {
        Row: {
          achieved: boolean | null
          achieved_at: string | null
          created_at: string | null
          description: string | null
          goal_id: string
          id: string
          target_value: number | null
          title: string
        }
        Insert: {
          achieved?: boolean | null
          achieved_at?: string | null
          created_at?: string | null
          description?: string | null
          goal_id: string
          id?: string
          target_value?: number | null
          title: string
        }
        Update: {
          achieved?: boolean | null
          achieved_at?: string | null
          created_at?: string | null
          description?: string | null
          goal_id?: string
          id?: string
          target_value?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goal"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_progress: {
        Row: {
          created_at: string | null
          date: string
          goal_id: string
          id: string
          notes: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          date: string
          goal_id: string
          id?: string
          notes?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          date?: string
          goal_id?: string
          id?: string
          notes?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goal"
            referencedColumns: ["id"]
          },
        ]
      }
      group_member_categories: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_member_categories_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          member_category_id: string | null
          read_by: string[] | null
          role: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          member_category_id?: string | null
          read_by?: string[] | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          member_category_id?: string | null
          read_by?: string[] | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_member_category_id_fkey"
            columns: ["member_category_id"]
            isOneToOne: false
            referencedRelation: "group_member_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      group_message: {
        Row: {
          attachments: Json | null
          care_recipient_id: string | null
          content: string
          created_at: string
          deleted_at: string | null
          group_id: string
          id: string
          is_edited: boolean | null
          media_url: string | null
          message_type: string | null
          parent_message_id: string | null
          reactions: Json | null
          read_by: string[] | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          care_recipient_id?: string | null
          content: string
          created_at?: string
          deleted_at?: string | null
          group_id: string
          id?: string
          is_edited?: boolean | null
          media_url?: string | null
          message_type?: string | null
          parent_message_id?: string | null
          reactions?: Json | null
          read_by?: string[] | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          care_recipient_id?: string | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          group_id?: string
          id?: string
          is_edited?: boolean | null
          media_url?: string | null
          message_type?: string | null
          parent_message_id?: string | null
          reactions?: Json | null
          read_by?: string[] | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "group_message"
            referencedColumns: ["id"]
          },
        ]
      }
      group_posts: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          completed_at: string | null
          completed_by: string | null
          content: string
          created_at: string | null
          due_date: string | null
          group_id: string
          id: string
          is_pinned: boolean | null
          post_type: string
          priority: string | null
          reactions: Json | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          completed_at?: string | null
          completed_by?: string | null
          content: string
          created_at?: string | null
          due_date?: string | null
          group_id: string
          id?: string
          is_pinned?: boolean | null
          post_type: string
          priority?: string | null
          reactions?: Json | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          completed_at?: string | null
          completed_by?: string | null
          content?: string
          created_at?: string | null
          due_date?: string | null
          group_id?: string
          id?: string
          is_pinned?: boolean | null
          post_type?: string
          priority?: string | null
          reactions?: Json | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "group_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_group"
            referencedColumns: ["id"]
          },
        ]
      }
      group_requests: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          group_id: string | null
          id: string
          request_type: string | null
          requester_id: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          group_id?: string | null
          id?: string
          request_type?: string | null
          requester_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          group_id?: string | null
          id?: string
          request_type?: string | null
          requester_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_group"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          care_recipient_profile_id: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean
          location: string | null
          name: string
          settings: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          care_recipient_profile_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          location?: string | null
          name: string
          settings?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          care_recipient_profile_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          location?: string | null
          name?: string
          settings?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      habit: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          end_date: string | null
          frequency_details: Json | null
          frequency_type: string
          icon: string | null
          id: string
          name: string
          reminder_time: string | null
          start_date: string
          target_unit: string | null
          target_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          frequency_details?: Json | null
          frequency_type: string
          icon?: string | null
          id?: string
          name: string
          reminder_time?: string | null
          start_date?: string
          target_unit?: string | null
          target_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          frequency_details?: Json | null
          frequency_type?: string
          icon?: string | null
          id?: string
          name?: string
          reminder_time?: string | null
          start_date?: string
          target_unit?: string | null
          target_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      habit_completion: {
        Row: {
          completed_at: string
          created_at: string
          habit_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          completed_at: string
          created_at?: string
          habit_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          habit_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          completed_value: number | null
          created_at: string
          habit_id: string
          id: string
          is_completed: boolean
          log_date: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_value?: number | null
          created_at?: string
          habit_id: string
          id?: string
          is_completed?: boolean
          log_date: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_value?: number | null
          created_at?: string
          habit_id?: string
          id?: string
          is_completed?: boolean
          log_date?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habit"
            referencedColumns: ["id"]
          },
        ]
      }
      health_metric: {
        Row: {
          created_at: string | null
          date: string
          emotion_tags: string[] | null
          energy_level: number | null
          factors: string[] | null
          focus_level: number | null
          id: string
          meditation_minutes: number | null
          mood: number | null
          notes: string | null
          sleep_hours: number | null
          sleep_quality: number | null
          stress_level: number | null
          symptoms: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          emotion_tags?: string[] | null
          energy_level?: number | null
          factors?: string[] | null
          focus_level?: number | null
          id?: string
          meditation_minutes?: number | null
          mood?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          symptoms?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          emotion_tags?: string[] | null
          energy_level?: number | null
          factors?: string[] | null
          focus_level?: number | null
          id?: string
          meditation_minutes?: number | null
          mood?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          symptoms?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      health_milestones: {
        Row: {
          created_at: string | null
          days_milestone: number
          description: string | null
          icon_name: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_milestone: number
          description?: string | null
          icon_name?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_milestone?: number
          description?: string | null
          icon_name?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hfh_availability_calendar: {
        Row: {
          created_at: string | null
          current_bookings: number | null
          date: string
          end_time: string | null
          helper_id: string | null
          id: string
          is_available: boolean | null
          max_bookings: number | null
          notes: string | null
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_bookings?: number | null
          date: string
          end_time?: string | null
          helper_id?: string | null
          id?: string
          is_available?: boolean | null
          max_bookings?: number | null
          notes?: string | null
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_bookings?: number | null
          date?: string
          end_time?: string | null
          helper_id?: string | null
          id?: string
          is_available?: boolean | null
          max_bookings?: number | null
          notes?: string | null
          start_time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hfh_availability_exceptions: {
        Row: {
          created_at: string | null
          exception_date: string
          helper_id: string
          id: string
          is_available: boolean | null
          reason: string | null
        }
        Insert: {
          created_at?: string | null
          exception_date: string
          helper_id: string
          id?: string
          is_available?: boolean | null
          reason?: string | null
        }
        Update: {
          created_at?: string | null
          exception_date?: string
          helper_id?: string
          id?: string
          is_available?: boolean | null
          reason?: string | null
        }
        Relationships: []
      }
      hfh_buyer_requests: {
        Row: {
          attachments: Json | null
          budget_max: number | null
          budget_min: number | null
          category: string | null
          client_id: string | null
          created_at: string | null
          delivery_time: number | null
          description: string
          expires_at: string | null
          id: string
          offers_received: number | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          budget_max?: number | null
          budget_min?: number | null
          category?: string | null
          client_id?: string | null
          created_at?: string | null
          delivery_time?: number | null
          description: string
          expires_at?: string | null
          id?: string
          offers_received?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          budget_max?: number | null
          budget_min?: number | null
          category?: string | null
          client_id?: string | null
          created_at?: string | null
          delivery_time?: number | null
          description?: string
          expires_at?: string | null
          id?: string
          offers_received?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hfh_contracts: {
        Row: {
          client_id: string | null
          contract_type: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          helper_id: string | null
          id: string
          job_id: string | null
          proposal_id: string | null
          rate: number
          start_date: string | null
          status: string | null
          title: string
          total_earned: number | null
          total_hours: number | null
          updated_at: string | null
          weekly_limit: number | null
        }
        Insert: {
          client_id?: string | null
          contract_type?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          helper_id?: string | null
          id?: string
          job_id?: string | null
          proposal_id?: string | null
          rate: number
          start_date?: string | null
          status?: string | null
          title: string
          total_earned?: number | null
          total_hours?: number | null
          updated_at?: string | null
          weekly_limit?: number | null
        }
        Update: {
          client_id?: string | null
          contract_type?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          helper_id?: string | null
          id?: string
          job_id?: string | null
          proposal_id?: string | null
          rate?: number
          start_date?: string | null
          status?: string | null
          title?: string
          total_earned?: number | null
          total_hours?: number | null
          updated_at?: string | null
          weekly_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hfh_contracts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "hfh_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hfh_contracts_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "hfh_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      hfh_conversations: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          is_archived: boolean | null
          job_id: string | null
          last_message: string | null
          last_message_at: string | null
          order_id: string | null
          participant_1_id: string | null
          participant_1_unread: number | null
          participant_2_id: string | null
          participant_2_unread: number | null
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          job_id?: string | null
          last_message?: string | null
          last_message_at?: string | null
          order_id?: string | null
          participant_1_id?: string | null
          participant_1_unread?: number | null
          participant_2_id?: string | null
          participant_2_unread?: number | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          job_id?: string | null
          last_message?: string | null
          last_message_at?: string | null
          order_id?: string | null
          participant_1_id?: string | null
          participant_1_unread?: number | null
          participant_2_id?: string | null
          participant_2_unread?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hfh_custom_offers: {
        Row: {
          booking_id: string | null
          client_id: string
          created_at: string | null
          deliverables: string[] | null
          description: string | null
          helper_id: string
          id: string
          offer_type: string | null
          order_id: string | null
          price: number
          scope: string | null
          status: string | null
          timeline: string | null
          title: string
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          booking_id?: string | null
          client_id: string
          created_at?: string | null
          deliverables?: string[] | null
          description?: string | null
          helper_id: string
          id?: string
          offer_type?: string | null
          order_id?: string | null
          price: number
          scope?: string | null
          status?: string | null
          timeline?: string | null
          title: string
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          booking_id?: string | null
          client_id?: string
          created_at?: string | null
          deliverables?: string[] | null
          description?: string | null
          helper_id?: string
          id?: string
          offer_type?: string | null
          order_id?: string | null
          price?: number
          scope?: string | null
          status?: string | null
          timeline?: string | null
          title?: string
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      hfh_email_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          error: string | null
          from_email: string | null
          html_content: string | null
          id: string
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          subject: string
          template_data: Json | null
          template_id: string | null
          text_content: string | null
          to_email: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          error?: string | null
          from_email?: string | null
          html_content?: string | null
          id?: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_data?: Json | null
          template_id?: string | null
          text_content?: string | null
          to_email: string
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          error?: string | null
          from_email?: string | null
          html_content?: string | null
          id?: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_data?: Json | null
          template_id?: string | null
          text_content?: string | null
          to_email?: string
        }
        Relationships: []
      }
      hfh_escrow: {
        Row: {
          amount: number
          booking_id: string | null
          contract_id: string | null
          created_at: string | null
          id: string
          milestone_id: string | null
          order_id: string | null
          release_date: string | null
          released_to: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          id?: string
          milestone_id?: string | null
          order_id?: string | null
          release_date?: string | null
          released_to?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          id?: string
          milestone_id?: string | null
          order_id?: string | null
          release_date?: string | null
          released_to?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hfh_gig_orders: {
        Row: {
          buyer_id: string | null
          buyer_rating: number | null
          buyer_review: string | null
          created_at: string | null
          delivery_date: string | null
          gig_id: string | null
          id: string
          package_type: string
          price: number
          quantity: number | null
          requirements: string | null
          seller_id: string | null
          seller_rating: number | null
          seller_review: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id?: string | null
          buyer_rating?: number | null
          buyer_review?: string | null
          created_at?: string | null
          delivery_date?: string | null
          gig_id?: string | null
          id?: string
          package_type: string
          price: number
          quantity?: number | null
          requirements?: string | null
          seller_id?: string | null
          seller_rating?: number | null
          seller_review?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string | null
          buyer_rating?: number | null
          buyer_review?: string | null
          created_at?: string | null
          delivery_date?: string | null
          gig_id?: string | null
          id?: string
          package_type?: string
          price?: number
          quantity?: number | null
          requirements?: string | null
          seller_id?: string | null
          seller_rating?: number | null
          seller_review?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hfh_gig_orders_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "hfh_gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      hfh_gigs: {
        Row: {
          basic_delivery_days: number | null
          basic_description: string | null
          basic_features: string[] | null
          category: string
          created_at: string | null
          description: string
          helper_id: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          orders_count: number | null
          premium_delivery_days: number | null
          premium_description: string | null
          premium_features: string[] | null
          price_basic: number
          price_premium: number | null
          price_standard: number | null
          rating: number | null
          response_time_hours: number | null
          standard_delivery_days: number | null
          standard_description: string | null
          standard_features: string[] | null
          status: string | null
          subcategory: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
          video_url: string | null
          views: number | null
        }
        Insert: {
          basic_delivery_days?: number | null
          basic_description?: string | null
          basic_features?: string[] | null
          category: string
          created_at?: string | null
          description: string
          helper_id?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          orders_count?: number | null
          premium_delivery_days?: number | null
          premium_description?: string | null
          premium_features?: string[] | null
          price_basic?: number
          price_premium?: number | null
          price_standard?: number | null
          rating?: number | null
          response_time_hours?: number | null
          standard_delivery_days?: number | null
          standard_description?: string | null
          standard_features?: string[] | null
          status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
          views?: number | null
        }
        Update: {
          basic_delivery_days?: number | null
          basic_description?: string | null
          basic_features?: string[] | null
          category?: string
          created_at?: string | null
          description?: string
          helper_id?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          orders_count?: number | null
          premium_delivery_days?: number | null
          premium_description?: string | null
          premium_features?: string[] | null
          price_basic?: number
          price_premium?: number | null
          price_standard?: number | null
          rating?: number | null
          response_time_hours?: number | null
          standard_delivery_days?: number | null
          standard_description?: string | null
          standard_features?: string[] | null
          status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
          views?: number | null
        }
        Relationships: []
      }
      hfh_helper_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          helper_id: string
          id: string
          is_available: boolean | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          helper_id: string
          id?: string
          is_available?: boolean | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          helper_id?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hfh_helper_status: {
        Row: {
          auto_accept_bookings: boolean | null
          avg_response_time: number | null
          created_at: string | null
          current_status: string | null
          helper_id: string | null
          id: string
          is_online: boolean | null
          job_success_score: number | null
          last_seen: string | null
          response_rate: number | null
          total_jobs_completed: number | null
          updated_at: string | null
          vacation_ends_at: string | null
          vacation_mode: boolean | null
        }
        Insert: {
          auto_accept_bookings?: boolean | null
          avg_response_time?: number | null
          created_at?: string | null
          current_status?: string | null
          helper_id?: string | null
          id?: string
          is_online?: boolean | null
          job_success_score?: number | null
          last_seen?: string | null
          response_rate?: number | null
          total_jobs_completed?: number | null
          updated_at?: string | null
          vacation_ends_at?: string | null
          vacation_mode?: boolean | null
        }
        Update: {
          auto_accept_bookings?: boolean | null
          avg_response_time?: number | null
          created_at?: string | null
          current_status?: string | null
          helper_id?: string | null
          id?: string
          is_online?: boolean | null
          job_success_score?: number | null
          last_seen?: string | null
          response_rate?: number | null
          total_jobs_completed?: number | null
          updated_at?: string | null
          vacation_ends_at?: string | null
          vacation_mode?: boolean | null
        }
        Relationships: []
      }
      hfh_jobs: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          budget_type: string | null
          category: string
          client_id: string | null
          created_at: string | null
          deadline: string | null
          description: string
          duration: string | null
          experience_level: string | null
          hours_per_week: number | null
          id: string
          location: string | null
          location_type: string | null
          proposals_count: number | null
          skills_required: string[] | null
          status: string | null
          subcategory: string | null
          title: string
          updated_at: string | null
          urgency: string | null
          views: number | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: string | null
          category: string
          client_id?: string | null
          created_at?: string | null
          deadline?: string | null
          description: string
          duration?: string | null
          experience_level?: string | null
          hours_per_week?: number | null
          id?: string
          location?: string | null
          location_type?: string | null
          proposals_count?: number | null
          skills_required?: string[] | null
          status?: string | null
          subcategory?: string | null
          title: string
          updated_at?: string | null
          urgency?: string | null
          views?: number | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: string | null
          category?: string
          client_id?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string
          duration?: string | null
          experience_level?: string | null
          hours_per_week?: number | null
          id?: string
          location?: string | null
          location_type?: string | null
          proposals_count?: number | null
          skills_required?: string[] | null
          status?: string | null
          subcategory?: string | null
          title?: string
          updated_at?: string | null
          urgency?: string | null
          views?: number | null
        }
        Relationships: []
      }
      hfh_portfolio_items: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          helper_id: string
          id: string
          is_featured: boolean | null
          media_type: string
          media_url: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          helper_id: string
          id?: string
          is_featured?: boolean | null
          media_type: string
          media_url: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          helper_id?: string
          id?: string
          is_featured?: boolean | null
          media_type?: string
          media_url?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hfh_profile_views: {
        Row: {
          created_at: string | null
          helper_id: string
          id: string
          viewer_id: string | null
          viewer_ip: string | null
        }
        Insert: {
          created_at?: string | null
          helper_id: string
          id?: string
          viewer_id?: string | null
          viewer_ip?: string | null
        }
        Update: {
          created_at?: string | null
          helper_id?: string
          id?: string
          viewer_id?: string | null
          viewer_ip?: string | null
        }
        Relationships: []
      }
      hfh_proposals: {
        Row: {
          attachments: string[] | null
          bid_amount: number
          bid_type: string | null
          cover_letter: string
          created_at: string | null
          estimated_duration: string | null
          helper_id: string | null
          id: string
          job_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: string[] | null
          bid_amount: number
          bid_type?: string | null
          cover_letter: string
          created_at?: string | null
          estimated_duration?: string | null
          helper_id?: string | null
          id?: string
          job_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: string[] | null
          bid_amount?: number
          bid_type?: string | null
          cover_letter?: string
          created_at?: string | null
          estimated_duration?: string | null
          helper_id?: string | null
          id?: string
          job_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hfh_proposals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "hfh_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      hfh_push_subscriptions: {
        Row: {
          auth: string
          browser: string | null
          created_at: string | null
          device_type: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          last_used: string | null
          p256dh: string
          user_id: string | null
        }
        Insert: {
          auth: string
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          last_used?: string | null
          p256dh: string
          user_id?: string | null
        }
        Update: {
          auth?: string
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          last_used?: string | null
          p256dh?: string
          user_id?: string | null
        }
        Relationships: []
      }
      hfh_recommended_matches: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          helper_id: string | null
          id: string
          is_dismissed: boolean | null
          match_reasons: Json | null
          match_score: number | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          helper_id?: string | null
          id?: string
          is_dismissed?: boolean | null
          match_reasons?: Json | null
          match_score?: number | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          helper_id?: string | null
          id?: string
          is_dismissed?: boolean | null
          match_reasons?: Json | null
          match_score?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      hfh_recurring_bookings: {
        Row: {
          client_id: string
          created_at: string | null
          day_of_week: number | null
          duration_hours: number
          end_date: string | null
          frequency: string
          helper_id: string
          hourly_rate: number
          id: string
          is_active: boolean | null
          location: string | null
          service_type: string
          start_date: string
          time_slot: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          day_of_week?: number | null
          duration_hours?: number
          end_date?: string | null
          frequency: string
          helper_id: string
          hourly_rate: number
          id?: string
          is_active?: boolean | null
          location?: string | null
          service_type: string
          start_date: string
          time_slot: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          day_of_week?: number | null
          duration_hours?: number
          end_date?: string | null
          frequency?: string
          helper_id?: string
          hourly_rate?: number
          id?: string
          is_active?: boolean | null
          location?: string | null
          service_type?: string
          start_date?: string
          time_slot?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hfh_search_history: {
        Row: {
          clicked_results: Json | null
          created_at: string | null
          id: string
          results_count: number | null
          search_filters: Json | null
          search_query: string | null
          user_id: string | null
        }
        Insert: {
          clicked_results?: Json | null
          created_at?: string | null
          id?: string
          results_count?: number | null
          search_filters?: Json | null
          search_query?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_results?: Json | null
          created_at?: string | null
          id?: string
          results_count?: number | null
          search_filters?: Json | null
          search_query?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      hfh_search_rankings: {
        Row: {
          click_count: number | null
          conversion_count: number | null
          created_at: string | null
          helper_id: string | null
          id: string
          relevance_score: number | null
          search_term: string | null
          updated_at: string | null
        }
        Insert: {
          click_count?: number | null
          conversion_count?: number | null
          created_at?: string | null
          helper_id?: string | null
          id?: string
          relevance_score?: number | null
          search_term?: string | null
          updated_at?: string | null
        }
        Update: {
          click_count?: number | null
          conversion_count?: number | null
          created_at?: string | null
          helper_id?: string | null
          id?: string
          relevance_score?: number | null
          search_term?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hfh_service_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "hfh_service_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "hfh_service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      hfh_skills_tests: {
        Row: {
          certificate_url: string | null
          created_at: string | null
          expires_at: string | null
          helper_id: string | null
          id: string
          max_score: number | null
          percentile: number | null
          score: number | null
          skill_name: string
          test_provider: string | null
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          certificate_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          helper_id?: string | null
          id?: string
          max_score?: number | null
          percentile?: number | null
          score?: number | null
          skill_name: string
          test_provider?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          certificate_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          helper_id?: string | null
          id?: string
          max_score?: number | null
          percentile?: number | null
          score?: number | null
          skill_name?: string
          test_provider?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      hfh_sms_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          error: string | null
          id: string
          message: string
          provider: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          to_phone: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          error?: string | null
          id?: string
          message: string
          provider?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          to_phone: string
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          error?: string | null
          id?: string
          message?: string
          provider?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          to_phone?: string
        }
        Relationships: []
      }
      hfh_work_diary: {
        Row: {
          activity_level: number | null
          contract_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          helper_id: string | null
          id: string
          screenshots: string[] | null
          start_time: string
          status: string | null
        }
        Insert: {
          activity_level?: number | null
          contract_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          helper_id?: string | null
          id?: string
          screenshots?: string[] | null
          start_time: string
          status?: string | null
        }
        Update: {
          activity_level?: number | null
          contract_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          helper_id?: string | null
          id?: string
          screenshots?: string[] | null
          start_time?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hfh_work_diary_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "hfh_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      hunt_participations: {
        Row: {
          hunt_id: string
          id: string
          joined_at: string | null
          rank: number | null
          score: number | null
          user_id: string
        }
        Insert: {
          hunt_id: string
          id?: string
          joined_at?: string | null
          rank?: number | null
          score?: number | null
          user_id: string
        }
        Update: {
          hunt_id?: string
          id?: string
          joined_at?: string | null
          rank?: number | null
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunt_participations_hunt_id_fkey"
            columns: ["hunt_id"]
            isOneToOne: false
            referencedRelation: "hunts"
            referencedColumns: ["id"]
          },
        ]
      }
      huntcoin_step_corrections: {
        Row: {
          corrected_steps: number
          created_at: string | null
          date: string
          id: string
          original_steps: number | null
          user_id: string
        }
        Insert: {
          corrected_steps: number
          created_at?: string | null
          date: string
          id?: string
          original_steps?: number | null
          user_id: string
        }
        Update: {
          corrected_steps?: number
          created_at?: string | null
          date?: string
          id?: string
          original_steps?: number | null
          user_id?: string
        }
        Relationships: []
      }
      huntcoin_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          type: string
          wallet_id: string | null
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          type: string
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "huntcoin_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "huntcoin_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      huntcoin_wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          is_trial_active: boolean | null
          signup_bonus_claimed: boolean | null
          signup_bonus_expires_at: string | null
          total_earned: number | null
          total_spent: number | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          is_trial_active?: boolean | null
          signup_bonus_claimed?: boolean | null
          signup_bonus_expires_at?: string | null
          total_earned?: number | null
          total_spent?: number | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          is_trial_active?: boolean | null
          signup_bonus_claimed?: boolean | null
          signup_bonus_expires_at?: string | null
          total_earned?: number | null
          total_spent?: number | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      hunts: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          name: string
          prize_pool: number | null
          start_date: string
          status: string | null
          updated_at: string | null
          winner_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          name: string
          prize_pool?: number | null
          start_date: string
          status?: string | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          prize_pool?: number | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Relationships: []
      }
      hydration_logs: {
        Row: {
          amount_ml: number
          created_at: string | null
          id: string
          intake_type: string | null
          timestamp: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string | null
          id?: string
          intake_type?: string | null
          timestamp?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string | null
          id?: string
          intake_type?: string | null
          timestamp?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string | null
          currency: string | null
          due_at: string | null
          id: string
          invoice_number: string
          issued_at: string | null
          paid_at: string | null
          payment_id: string | null
          platform_fee: number
          status: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          due_at?: string | null
          id?: string
          invoice_number: string
          issued_at?: string | null
          paid_at?: string | null
          payment_id?: string | null
          platform_fee: number
          status?: string | null
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          due_at?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string | null
          paid_at?: string | null
          payment_id?: string | null
          platform_fee?: number
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          applicants_count: number | null
          created_at: string | null
          description: string | null
          family_name: string | null
          id: string
          job_type: string | null
          location: string | null
          pay_rate: number | null
          pay_type: string | null
          posted_by: string | null
          posted_date: string | null
          requirements: string[] | null
          schedule: string | null
          status: string | null
          title: string
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          applicants_count?: number | null
          created_at?: string | null
          description?: string | null
          family_name?: string | null
          id?: string
          job_type?: string | null
          location?: string | null
          pay_rate?: number | null
          pay_type?: string | null
          posted_by?: string | null
          posted_date?: string | null
          requirements?: string[] | null
          schedule?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          applicants_count?: number | null
          created_at?: string | null
          description?: string | null
          family_name?: string | null
          id?: string
          job_type?: string | null
          location?: string | null
          pay_rate?: number | null
          pay_type?: string | null
          posted_by?: string | null
          posted_date?: string | null
          requirements?: string[] | null
          schedule?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          urgency?: string | null
        }
        Relationships: []
      }
      job_services: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          job_id: string
          service_category_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          job_id: string
          service_category_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          job_id?: string
          service_category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_services_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_services_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          benefits: string[] | null
          created_at: string | null
          description: string | null
          id: string
          is_urgent: boolean | null
          location: string | null
          posted_by: string | null
          requirements: string[] | null
          salary_range: string | null
          status: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_urgent?: boolean | null
          location?: string | null
          posted_by?: string | null
          requirements?: string[] | null
          salary_range?: string | null
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          benefits?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_urgent?: boolean | null
          location?: string | null
          posted_by?: string | null
          requirements?: string[] | null
          salary_range?: string | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      journal_entry: {
        Row: {
          content: string
          created_at: string
          id: string
          mood: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
          word_count: number | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mood?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
          word_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mood?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
          word_count?: number | null
        }
        Relationships: []
      }
      kanban_board_members: {
        Row: {
          board_id: string
          invited_at: string
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          board_id: string
          invited_at?: string
          joined_at?: string | null
          role: string
          user_id: string
        }
        Update: {
          board_id?: string
          invited_at?: string
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_board_members_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "kanban_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_boards: {
        Row: {
          column_order: string[] | null
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          column_order?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          column_order?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_boards_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_cards: {
        Row: {
          assignee_ids: string[] | null
          attachments: Json | null
          board_id: string | null
          column_id: string
          content: string
          cover_image_url: string | null
          created_at: string
          creator_id: string | null
          description: string | null
          due_date: string | null
          id: string
          position: number
          priority: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          assignee_ids?: string[] | null
          attachments?: Json | null
          board_id?: string | null
          column_id: string
          content: string
          cover_image_url?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          priority?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          assignee_ids?: string[] | null
          attachments?: Json | null
          board_id?: string | null
          column_id?: string
          content?: string
          cover_image_url?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          priority?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_cards_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "kanban_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_cards_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "kanban_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_columns: {
        Row: {
          board_id: string
          card_order: string[] | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          board_id: string
          card_order?: string[] | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          board_id?: string
          card_order?: string[] | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_columns_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "kanban_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_tasks: {
        Row: {
          assignee_ids: string[] | null
          attachments: Json | null
          board_id: string
          column_id: string
          content: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          position: number
          priority: string | null
          tags: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assignee_ids?: string[] | null
          attachments?: Json | null
          board_id: string
          column_id: string
          content: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          position: number
          priority?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assignee_ids?: string[] | null
          attachments?: Json | null
          board_id?: string
          column_id?: string
          content?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          priority?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_tasks_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "kanban_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_tasks_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "kanban_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_category: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      learning_content: {
        Row: {
          category: string
          content_text: string | null
          content_type: string
          content_url: string | null
          created_at: string | null
          description: string
          difficulty: string
          duration_minutes: number
          id: string
          is_featured: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content_text?: string | null
          content_type: string
          content_url?: string | null
          created_at?: string | null
          description: string
          difficulty: string
          duration_minutes?: number
          id?: string
          is_featured?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content_text?: string | null
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          description?: string
          difficulty?: string
          duration_minutes?: number
          id?: string
          is_featured?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      learning_module: {
        Row: {
          category: string | null
          content: Json | null
          created_at: string
          description: string | null
          estimated_duration_minutes: number | null
          id: string
          is_published: boolean
          order_index: number | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content?: Json | null
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_published?: boolean
          order_index?: number | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: Json | null
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_published?: boolean
          order_index?: number | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      level_thresholds: {
        Row: {
          created_at: string
          level: number
          points_required: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          level: number
          points_required: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          level?: number
          points_required?: number
          updated_at?: string
        }
        Relationships: []
      }
      lifetime_deals: {
        Row: {
          created_at: string | null
          current_sales: number | null
          discount_percentage: number
          end_date: string | null
          id: string
          is_active: boolean | null
          lifetime_price: number
          max_sales: number | null
          original_price: number
          product_id: string | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_sales?: number | null
          discount_percentage: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          lifetime_price: number
          max_sales?: number | null
          original_price: number
          product_id?: string | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_sales?: number | null
          discount_percentage?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          lifetime_price?: number
          max_sales?: number | null
          original_price?: number
          product_id?: string | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lifetime_deals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      location: {
        Row: {
          accuracy: number | null
          created_at: string
          id: string
          latitude: number
          longitude: number
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          user_id: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          user_id?: string
        }
        Relationships: []
      }
      location_requests: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          message: string | null
          requester_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string | null
          requester_id: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string | null
          requester_id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      log_tabs: {
        Row: {
          created_at: string | null
          display_order: number
          icon_name: string
          id: string
          label: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          icon_name: string
          id: string
          label: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          icon_name?: string
          id?: string
          label?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      medication: {
        Row: {
          cared_one_id: string | null
          created_at: string | null
          dosage: string | null
          frequency: string | null
          id: string
          name: string
          notes: string | null
          time_of_day: string | null
        }
        Insert: {
          cared_one_id?: string | null
          created_at?: string | null
          dosage?: string | null
          frequency?: string | null
          id?: string
          name: string
          notes?: string | null
          time_of_day?: string | null
        }
        Update: {
          cared_one_id?: string | null
          created_at?: string | null
          dosage?: string | null
          frequency?: string | null
          id?: string
          name?: string
          notes?: string | null
          time_of_day?: string | null
        }
        Relationships: []
      }
      medicine_details: {
        Row: {
          created_at: string | null
          created_by: string
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          instructions: string | null
          medicine_name: string
          notes: string | null
          prescriber: string | null
          refills_remaining: number | null
          schedule_times: string[] | null
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          medicine_name: string
          notes?: string | null
          prescriber?: string | null
          refills_remaining?: number | null
          schedule_times?: string[] | null
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          medicine_name?: string
          notes?: string | null
          prescriber?: string | null
          refills_remaining?: number | null
          schedule_times?: string[] | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medicine_intake_logs: {
        Row: {
          actual_time: string | null
          created_at: string | null
          id: string
          medicine_id: string | null
          notes: string | null
          scheduled_time: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          actual_time?: string | null
          created_at?: string | null
          id?: string
          medicine_id?: string | null
          notes?: string | null
          scheduled_time?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          actual_time?: string | null
          created_at?: string | null
          id?: string
          medicine_id?: string | null
          notes?: string | null
          scheduled_time?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      medicine_reminder: {
        Row: {
          created_at: string | null
          id: string
          medicine_id: string | null
          notes: string | null
          reminder_date: string
          reminder_time: string
          status: string | null
          taken_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          medicine_id?: string | null
          notes?: string | null
          reminder_date: string
          reminder_time: string
          status?: string | null
          taken_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          medicine_id?: string | null
          notes?: string | null
          reminder_date?: string
          reminder_time?: string
          status?: string | null
          taken_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      medicine_schedules: {
        Row: {
          cared_one_id: string
          created_at: string | null
          custom_time: string | null
          dosage: string | null
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean | null
          medicine_name: string
          notes: string | null
          start_date: string | null
          time_slot: string
          updated_at: string | null
          user_id: string
          week_days: Json | null
        }
        Insert: {
          cared_one_id: string
          created_at?: string | null
          custom_time?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          medicine_name: string
          notes?: string | null
          start_date?: string | null
          time_slot: string
          updated_at?: string | null
          user_id: string
          week_days?: Json | null
        }
        Update: {
          cared_one_id?: string
          created_at?: string | null
          custom_time?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          medicine_name?: string
          notes?: string | null
          start_date?: string | null
          time_slot?: string
          updated_at?: string | null
          user_id?: string
          week_days?: Json | null
        }
        Relationships: []
      }
      meditation: {
        Row: {
          audio_url: string
          category: string
          created_at: string
          description: string
          duration_seconds: number
          featured: boolean | null
          id: string
          image_url: string | null
          level: string
          popularity: number | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          audio_url: string
          category: string
          created_at?: string
          description: string
          duration_seconds: number
          featured?: boolean | null
          id?: string
          image_url?: string | null
          level: string
          popularity?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          category?: string
          created_at?: string
          description?: string
          duration_seconds?: number
          featured?: boolean | null
          id?: string
          image_url?: string | null
          level?: string
          popularity?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      meditation_library: {
        Row: {
          audio_url: string | null
          category: string
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          duration: number
          id: string
          instructor: string | null
          play_count: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          audio_url?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration: number
          id?: string
          instructor?: string | null
          play_count?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          audio_url?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration?: number
          id?: string
          instructor?: string | null
          play_count?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      meditation_session: {
        Row: {
          completed_at: string
          created_at: string
          duration: number
          id: string
          notes: string | null
          session_type: string
          user_id: string
        }
        Insert: {
          completed_at: string
          created_at?: string
          duration: number
          id?: string
          notes?: string | null
          session_type: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          duration?: number
          id?: string
          notes?: string | null
          session_type?: string
          user_id?: string
        }
        Relationships: []
      }
      meditation_track: {
        Row: {
          audio_url: string
          created_at: string
          description: string | null
          duration: number | null
          id: string
          title: string
          type: string | null
        }
        Insert: {
          audio_url: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          title: string
          type?: string | null
        }
        Update: {
          audio_url?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      memory_palaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          message_type: string | null
          read_at: string | null
          sender_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          read_at?: string | null
          sender_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          read_at?: string | null
          sender_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_map_edges: {
        Row: {
          created_at: string
          id: string
          label: string | null
          map_id: string
          source_node_id: string
          target_node_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          map_id: string
          source_node_id: string
          target_node_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          map_id?: string
          source_node_id?: string
          target_node_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mind_map_edges_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "mind_maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mind_map_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "mind_map_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mind_map_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "mind_map_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_map_nodes: {
        Row: {
          color: string | null
          content: string | null
          created_at: string
          height: number | null
          id: string
          map_id: string
          parent_id: string | null
          position_x: number | null
          position_y: number | null
          updated_at: string
          user_id: string
          width: number | null
        }
        Insert: {
          color?: string | null
          content?: string | null
          created_at?: string
          height?: number | null
          id?: string
          map_id: string
          parent_id?: string | null
          position_x?: number | null
          position_y?: number | null
          updated_at?: string
          user_id: string
          width?: number | null
        }
        Update: {
          color?: string | null
          content?: string | null
          created_at?: string
          height?: number | null
          id?: string
          map_id?: string
          parent_id?: string | null
          position_x?: number | null
          position_y?: number | null
          updated_at?: string
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mind_map_nodes_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "mind_maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mind_map_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "mind_map_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_maps: {
        Row: {
          created_at: string
          id: string
          name: string
          team_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          team_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mind_maps_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      mindfulness_moment_reminders: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          time: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          time: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          time?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mood_entry: {
        Row: {
          created_at: string
          id: string
          mood: string
          notes: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood: string
          notes?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mood?: string
          notes?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_logs: {
        Row: {
          created_at: string
          energy_level: number | null
          factors: Json | null
          focus_level: number | null
          id: string
          mood_score: number | null
          notes: string | null
          session_id: string | null
          stress_level: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          energy_level?: number | null
          factors?: Json | null
          focus_level?: number | null
          id?: string
          mood_score?: number | null
          notes?: string | null
          session_id?: string | null
          stress_level?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          energy_level?: number | null
          factors?: Json | null
          focus_level?: number | null
          id?: string
          mood_score?: number | null
          notes?: string | null
          session_id?: string | null
          stress_level?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mood_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "breathing_session"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_tracker: {
        Row: {
          cravings_level: number | null
          created_at: string | null
          date: string | null
          energy_level: number | null
          id: string
          mood: string | null
          notes: string | null
          stress_level: number | null
          user_id: string | null
        }
        Insert: {
          cravings_level?: number | null
          created_at?: string | null
          date?: string | null
          energy_level?: number | null
          id?: string
          mood?: string | null
          notes?: string | null
          stress_level?: number | null
          user_id?: string | null
        }
        Update: {
          cravings_level?: number | null
          created_at?: string | null
          date?: string | null
          energy_level?: number | null
          id?: string
          mood?: string | null
          notes?: string | null
          stress_level?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      motivation_streaks: {
        Row: {
          count: number | null
          created_at: string | null
          id: string
          last_updated: string | null
          streak_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          streak_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          streak_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      motivational_message: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          message: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          message: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          message?: string
        }
        Relationships: []
      }
      motivational_quotes: {
        Row: {
          author: string | null
          created_at: string
          id: string
          quote: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          id?: string
          quote: string
        }
        Update: {
          author?: string | null
          created_at?: string
          id?: string
          quote?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          preferences: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      nicotine_usage_logs: {
        Row: {
          brand: string | null
          craving_intensity: number
          created_at: string
          duration_minutes: number | null
          flavor: string | null
          id: string
          location: string | null
          logged_at: string
          nicotine_strength: string | null
          notes: string | null
          product_type: string
          quantity: number
          satisfaction_level: number
          trigger: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          craving_intensity?: number
          created_at?: string
          duration_minutes?: number | null
          flavor?: string | null
          id?: string
          location?: string | null
          logged_at?: string
          nicotine_strength?: string | null
          notes?: string | null
          product_type: string
          quantity?: number
          satisfaction_level?: number
          trigger?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          craving_intensity?: number
          created_at?: string
          duration_minutes?: number | null
          flavor?: string | null
          id?: string
          location?: string | null
          logged_at?: string
          nicotine_strength?: string | null
          notes?: string | null
          product_type?: string
          quantity?: number
          satisfaction_level?: number
          trigger?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nicotine_use_logs: {
        Row: {
          amount: number | null
          created_at: string
          date: string
          id: string
          notes: string | null
          product_type: string | null
          used_nicotine: boolean | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          product_type?: string | null
          used_nicotine?: boolean | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          product_type?: string | null
          used_nicotine?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      note_tags: {
        Row: {
          created_at: string
          note_id: string
          tag_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          note_id: string
          tag_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          note_id?: string
          tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_tags_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_templates: {
        Row: {
          category: string | null
          content_json: Json
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          tags: string[] | null
          times_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content_json: Json
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          tags?: string[] | null
          times_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content_json?: Json
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          tags?: string[] | null
          times_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notebooks: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_notebook_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_notebook_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_notebook_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebooks_parent_notebook_id_fkey"
            columns: ["parent_notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          notebook_id: string | null
          sort_order: number | null
          team_id: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          notebook_id?: string | null
          sort_order?: number | null
          team_id?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          notebook_id?: string | null
          sort_order?: number | null
          team_id?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      notification: {
        Row: {
          action_url: string | null
          created_at: string | null
          icon: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          achievement_notifications: boolean | null
          created_at: string | null
          daily_digest: boolean | null
          enable_email: boolean | null
          enable_push: boolean | null
          progress_updates: boolean | null
          streak_reminders: boolean | null
          tool_suggestions: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievement_notifications?: boolean | null
          created_at?: string | null
          daily_digest?: boolean | null
          enable_email?: boolean | null
          enable_push?: boolean | null
          progress_updates?: boolean | null
          streak_reminders?: boolean | null
          tool_suggestions?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievement_notifications?: boolean | null
          created_at?: string | null
          daily_digest?: boolean | null
          enable_email?: boolean | null
          enable_push?: boolean | null
          progress_updates?: boolean | null
          streak_reminders?: boolean | null
          tool_suggestions?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nrt_products: {
        Row: {
          active_ingredient: string | null
          best_for: string | null
          brand: string | null
          category: string
          certification_agency: string | null
          certification_date: string | null
          certification_number: string | null
          cons: string[] | null
          created_at: string | null
          description: string | null
          duration: string | null
          effectiveness_rating: number | null
          fda_approved: boolean | null
          id: number
          is_active: boolean | null
          name: string
          price_range: string | null
          pros: string[] | null
          review_count: number | null
          side_effects: string[] | null
          strength: string | null
          success_rate: number | null
          type: string
          updated_at: string | null
          user_rating: number | null
          where_to_buy: string[] | null
        }
        Insert: {
          active_ingredient?: string | null
          best_for?: string | null
          brand?: string | null
          category: string
          certification_agency?: string | null
          certification_date?: string | null
          certification_number?: string | null
          cons?: string[] | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          effectiveness_rating?: number | null
          fda_approved?: boolean | null
          id?: number
          is_active?: boolean | null
          name: string
          price_range?: string | null
          pros?: string[] | null
          review_count?: number | null
          side_effects?: string[] | null
          strength?: string | null
          success_rate?: number | null
          type: string
          updated_at?: string | null
          user_rating?: number | null
          where_to_buy?: string[] | null
        }
        Update: {
          active_ingredient?: string | null
          best_for?: string | null
          brand?: string | null
          category?: string
          certification_agency?: string | null
          certification_date?: string | null
          certification_number?: string | null
          cons?: string[] | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          effectiveness_rating?: number | null
          fda_approved?: boolean | null
          id?: number
          is_active?: boolean | null
          name?: string
          price_range?: string | null
          pros?: string[] | null
          review_count?: number | null
          side_effects?: string[] | null
          strength?: string | null
          success_rate?: number | null
          type?: string
          updated_at?: string | null
          user_rating?: number | null
          where_to_buy?: string[] | null
        }
        Relationships: []
      }
      nrt_reminders: {
        Row: {
          created_at: string
          custom_notes: string | null
          custom_nrt_name: string | null
          end_date: string | null
          frequency_type: string
          id: string
          interval_days: number | null
          is_active: boolean
          nrt_type: string
          reminder_time: string
          specific_days: Json | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_notes?: string | null
          custom_nrt_name?: string | null
          end_date?: string | null
          frequency_type: string
          id?: string
          interval_days?: number | null
          is_active?: boolean
          nrt_type: string
          reminder_time: string
          specific_days?: Json | null
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_notes?: string | null
          custom_nrt_name?: string | null
          end_date?: string | null
          frequency_type?: string
          id?: string
          interval_days?: number | null
          is_active?: boolean
          nrt_type?: string
          reminder_time?: string
          specific_days?: Json | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nutrition_goals: {
        Row: {
          calories_goal: number | null
          carbs_goal_g: number | null
          created_at: string
          fat_goal_g: number | null
          fiber_goal_g: number | null
          id: string
          is_active: boolean
          protein_goal_g: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calories_goal?: number | null
          carbs_goal_g?: number | null
          created_at?: string
          fat_goal_g?: number | null
          fiber_goal_g?: number | null
          id?: string
          is_active?: boolean
          protein_goal_g?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calories_goal?: number | null
          carbs_goal_g?: number | null
          created_at?: string
          fat_goal_g?: number | null
          fiber_goal_g?: number | null
          id?: string
          is_active?: boolean
          protein_goal_g?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order: {
        Row: {
          created_at: string | null
          id: string
          promo_code: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          promo_code?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          promo_code?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_history: {
        Row: {
          created_at: string | null
          id: string
          items: Json
          order_number: string
          shipping_address: Json | null
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          items: Json
          order_number: string
          shipping_address?: Json | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          items?: Json
          order_number?: string
          shipping_address?: Json | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_item: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price: number
          product_id?: string | null
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          plan: string | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          plan?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          plan?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      package_services: {
        Row: {
          created_at: string | null
          id: string
          package_id: string
          service_category_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          package_id: string
          service_category_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          package_id?: string
          service_category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_services_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_services_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string
          id: string
          layout: Json
          meta: Json
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          layout?: Json
          meta?: Json
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          layout?: Json
          meta?: Json
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      palace_edges: {
        Row: {
          created_at: string
          id: string
          label: string | null
          palace_id: string
          source_node_id: string
          target_node_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          palace_id: string
          source_node_id: string
          target_node_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          palace_id?: string
          source_node_id?: string
          target_node_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "palace_edges_palace_id_fkey"
            columns: ["palace_id"]
            isOneToOne: false
            referencedRelation: "memory_palaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "palace_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "palace_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "palace_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "palace_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      palace_items: {
        Row: {
          content_text: string | null
          created_at: string
          id: string
          linked_note_id: string | null
          name: string
          room_id: string
          updated_at: string
          x_coord: number | null
          y_coord: number | null
        }
        Insert: {
          content_text?: string | null
          created_at?: string
          id?: string
          linked_note_id?: string | null
          name: string
          room_id: string
          updated_at?: string
          x_coord?: number | null
          y_coord?: number | null
        }
        Update: {
          content_text?: string | null
          created_at?: string
          id?: string
          linked_note_id?: string | null
          name?: string
          room_id?: string
          updated_at?: string
          x_coord?: number | null
          y_coord?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "palace_items_linked_note_id_fkey"
            columns: ["linked_note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "palace_items_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "palace_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      palace_nodes: {
        Row: {
          color: string | null
          content: Json | null
          created_at: string
          height: number
          id: string
          palace_id: string
          position_x: number
          position_y: number
          type: Database["public"]["Enums"]["palace_node_type"]
          updated_at: string
          user_id: string
          width: number
        }
        Insert: {
          color?: string | null
          content?: Json | null
          created_at?: string
          height?: number
          id?: string
          palace_id: string
          position_x?: number
          position_y?: number
          type: Database["public"]["Enums"]["palace_node_type"]
          updated_at?: string
          user_id: string
          width?: number
        }
        Update: {
          color?: string | null
          content?: Json | null
          created_at?: string
          height?: number
          id?: string
          palace_id?: string
          position_x?: number
          position_y?: number
          type?: Database["public"]["Enums"]["palace_node_type"]
          updated_at?: string
          user_id?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "palace_nodes_palace_id_fkey"
            columns: ["palace_id"]
            isOneToOne: false
            referencedRelation: "memory_palaces"
            referencedColumns: ["id"]
          },
        ]
      }
      palace_rooms: {
        Row: {
          background_image_url: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          order_index: number
          palace_id: string
          updated_at: string
        }
        Insert: {
          background_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          order_index?: number
          palace_id: string
          updated_at?: string
        }
        Update: {
          background_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          palace_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "palace_rooms_palace_id_fkey"
            columns: ["palace_id"]
            isOneToOne: false
            referencedRelation: "memory_palaces"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_medicines: {
        Row: {
          created_at: string | null
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          name: string
          notes: string | null
          reminder_enabled: boolean | null
          start_date: string
          time_slots: string[]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dosage: string
          end_date?: string | null
          frequency?: string
          id?: string
          name: string
          notes?: string | null
          reminder_enabled?: boolean | null
          start_date?: string
          time_slots?: string[]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          name?: string
          notes?: string | null
          reminder_enabled?: boolean | null
          start_date?: string
          time_slots?: string[]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_escrow: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          currency: string | null
          hold_until: string | null
          id: string
          metadata: Json | null
          paid_at: string | null
          payment_id: string | null
          provider_id: string | null
          release_date: string | null
          release_reason: string | null
          released_at: string | null
          status: string | null
          stripe_transfer_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          hold_until?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_id?: string | null
          provider_id?: string | null
          release_date?: string | null
          release_reason?: string | null
          released_at?: string | null
          status?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          hold_until?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_id?: string | null
          provider_id?: string | null
          release_date?: string | null
          release_reason?: string | null
          released_at?: string | null
          status?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_escrow_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_escrow_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_holder_name: string | null
          card_last4: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          stripe_payment_method_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_holder_name?: string | null
          card_last4?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_holder_name?: string | null
          card_last4?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          payment_intent_id: string | null
          payment_method: string
          payment_status: string | null
          payment_type: string | null
          platform_fee: number | null
          processed_at: string | null
          provider_amount: number | null
          provider_id: string
          refund_amount: number | null
          refund_id: string | null
          status: string | null
          tip_amount: number | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_method: string
          payment_status?: string | null
          payment_type?: string | null
          platform_fee?: number | null
          processed_at?: string | null
          provider_amount?: number | null
          provider_id: string
          refund_amount?: number | null
          refund_id?: string | null
          status?: string | null
          tip_amount?: number | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_method?: string
          payment_status?: string | null
          payment_type?: string | null
          platform_fee?: number | null
          processed_at?: string | null
          provider_amount?: number | null
          provider_id?: string
          refund_amount?: number | null
          refund_id?: string | null
          status?: string | null
          tip_amount?: number | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "care_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_verifications: {
        Row: {
          attempts_count: number | null
          country_code: string | null
          created_at: string | null
          expires_at: string
          id: string
          last_attempt_at: string | null
          phone_number: string
          user_id: string | null
          verification_code: string
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          attempts_count?: number | null
          country_code?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          last_attempt_at?: string | null
          phone_number: string
          user_id?: string | null
          verification_code: string
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          attempts_count?: number | null
          country_code?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          last_attempt_at?: string | null
          phone_number?: string
          user_id?: string | null
          verification_code?: string
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      plan_daily_tasks: {
        Row: {
          created_at: string | null
          day_number: number
          freshcoin_reward: number | null
          id: string
          is_required: boolean | null
          linked_feature: string | null
          method_id: string | null
          phase_id: string | null
          sort_order: number | null
          task_action: string | null
          task_description: string | null
          task_title: string
          task_type: string | null
        }
        Insert: {
          created_at?: string | null
          day_number: number
          freshcoin_reward?: number | null
          id?: string
          is_required?: boolean | null
          linked_feature?: string | null
          method_id?: string | null
          phase_id?: string | null
          sort_order?: number | null
          task_action?: string | null
          task_description?: string | null
          task_title: string
          task_type?: string | null
        }
        Update: {
          created_at?: string | null
          day_number?: number
          freshcoin_reward?: number | null
          id?: string
          is_required?: boolean | null
          linked_feature?: string | null
          method_id?: string | null
          phase_id?: string | null
          sort_order?: number | null
          task_action?: string | null
          task_description?: string | null
          task_title?: string
          task_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_daily_tasks_method_id_fkey"
            columns: ["method_id"]
            isOneToOne: false
            referencedRelation: "quit_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_daily_tasks_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "plan_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_phases: {
        Row: {
          created_at: string | null
          duration_days: number
          end_day: number
          goals: string[] | null
          id: string
          method_id: string | null
          milestone_reward_coins: number | null
          phase_description: string | null
          phase_name: string
          phase_number: number
          start_day: number
          tips: string[] | null
          warnings: string[] | null
        }
        Insert: {
          created_at?: string | null
          duration_days: number
          end_day: number
          goals?: string[] | null
          id?: string
          method_id?: string | null
          milestone_reward_coins?: number | null
          phase_description?: string | null
          phase_name: string
          phase_number: number
          start_day: number
          tips?: string[] | null
          warnings?: string[] | null
        }
        Update: {
          created_at?: string | null
          duration_days?: number
          end_day?: number
          goals?: string[] | null
          id?: string
          method_id?: string | null
          milestone_reward_coins?: number | null
          phase_description?: string | null
          phase_name?: string
          phase_number?: number
          start_day?: number
          tips?: string[] | null
          warnings?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_phases_method_id_fkey"
            columns: ["method_id"]
            isOneToOne: false
            referencedRelation: "quit_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_config: {
        Row: {
          created_at: string | null
          data_type: string
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          data_type?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          data_type?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      platforms: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          display_order: number | null
          icon_url: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_it_notes: {
        Row: {
          color: string | null
          content: string | null
          created_at: string
          height: number | null
          id: string
          position_x: number | null
          position_y: number | null
          updated_at: string
          user_id: string
          width: number | null
        }
        Insert: {
          color?: string | null
          content?: string | null
          created_at?: string
          height?: number | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          updated_at?: string
          user_id: string
          width?: number | null
        }
        Update: {
          color?: string | null
          content?: string | null
          created_at?: string
          height?: number | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          updated_at?: string
          user_id?: string
          width?: number | null
        }
        Relationships: []
      }
      post_like: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          thread_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          thread_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          thread_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alert: {
        Row: {
          alert_type: string | null
          created_at: string | null
          current_price: number | null
          id: string
          is_active: boolean | null
          product_id: string
          target_price: number | null
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          alert_type?: string | null
          created_at?: string | null
          current_price?: number | null
          id?: string
          is_active?: boolean | null
          product_id: string
          target_price?: number | null
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string | null
          created_at?: string | null
          current_price?: number | null
          id?: string
          is_active?: boolean | null
          product_id?: string
          target_price?: number | null
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "smokeless_products"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          id: string
          price: number
          product_id: string
          recorded_at: string | null
          sale_price: number | null
          shipping_cost: number | null
          shop_id: string
        }
        Insert: {
          id?: string
          price: number
          product_id: string
          recorded_at?: string | null
          sale_price?: number | null
          shipping_cost?: number | null
          shop_id: string
        }
        Update: {
          id?: string
          price?: number
          product_id?: string
          recorded_at?: string | null
          sale_price?: number | null
          shipping_cost?: number | null
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shop"
            referencedColumns: ["id"]
          },
        ]
      }
      product: {
        Row: {
          affiliate_commission_rate: number | null
          affiliate_enabled: boolean | null
          affiliate_percentage: number | null
          category_id: string | null
          company_detail: string | null
          compare_to: string | null
          created_at: string
          current_price: number | null
          deal_ends_at: string | null
          deal_type: string | null
          description: string | null
          gallery_urls: string[] | null
          has_free_tier: boolean | null
          huntcoin_discount_percentage: number | null
          huntcoin_enabled: boolean | null
          id: string
          is_coming_soon: boolean | null
          is_limited_quantity: boolean | null
          is_promoted: boolean | null
          launch_date: string | null
          lifetime_access: boolean | null
          logo_url: string | null
          money_back_guarantee_days: number | null
          name: string
          original_price: number | null
          owner_id: string
          pricing_model: string | null
          pricing_type: string | null
          product_number: number
          promotion_clicks: number | null
          promotion_ends_at: string | null
          rating_average: number | null
          rating_count: number | null
          refund_conditions: string | null
          slug: string
          sold_through_us: boolean | null
          specific_attributes: Json | null
          status: string | null
          stock_quantity: number | null
          tagline: string | null
          vote_count: number | null
          website_url: string | null
        }
        Insert: {
          affiliate_commission_rate?: number | null
          affiliate_enabled?: boolean | null
          affiliate_percentage?: number | null
          category_id?: string | null
          company_detail?: string | null
          compare_to?: string | null
          created_at?: string
          current_price?: number | null
          deal_ends_at?: string | null
          deal_type?: string | null
          description?: string | null
          gallery_urls?: string[] | null
          has_free_tier?: boolean | null
          huntcoin_discount_percentage?: number | null
          huntcoin_enabled?: boolean | null
          id?: string
          is_coming_soon?: boolean | null
          is_limited_quantity?: boolean | null
          is_promoted?: boolean | null
          launch_date?: string | null
          lifetime_access?: boolean | null
          logo_url?: string | null
          money_back_guarantee_days?: number | null
          name: string
          original_price?: number | null
          owner_id: string
          pricing_model?: string | null
          pricing_type?: string | null
          product_number?: number
          promotion_clicks?: number | null
          promotion_ends_at?: string | null
          rating_average?: number | null
          rating_count?: number | null
          refund_conditions?: string | null
          slug: string
          sold_through_us?: boolean | null
          specific_attributes?: Json | null
          status?: string | null
          stock_quantity?: number | null
          tagline?: string | null
          vote_count?: number | null
          website_url?: string | null
        }
        Update: {
          affiliate_commission_rate?: number | null
          affiliate_enabled?: boolean | null
          affiliate_percentage?: number | null
          category_id?: string | null
          company_detail?: string | null
          compare_to?: string | null
          created_at?: string
          current_price?: number | null
          deal_ends_at?: string | null
          deal_type?: string | null
          description?: string | null
          gallery_urls?: string[] | null
          has_free_tier?: boolean | null
          huntcoin_discount_percentage?: number | null
          huntcoin_enabled?: boolean | null
          id?: string
          is_coming_soon?: boolean | null
          is_limited_quantity?: boolean | null
          is_promoted?: boolean | null
          launch_date?: string | null
          lifetime_access?: boolean | null
          logo_url?: string | null
          money_back_guarantee_days?: number | null
          name?: string
          original_price?: number | null
          owner_id?: string
          pricing_model?: string | null
          pricing_type?: string | null
          product_number?: number
          promotion_clicks?: number | null
          promotion_ends_at?: string | null
          rating_average?: number | null
          rating_count?: number | null
          refund_conditions?: string | null
          slug?: string
          sold_through_us?: boolean | null
          specific_attributes?: Json | null
          status?: string | null
          stock_quantity?: number | null
          tagline?: string | null
          vote_count?: number | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_alternatives: {
        Row: {
          alternative_product_id: string | null
          created_at: string | null
          id: string
          product_id: string | null
          reason: string | null
        }
        Insert: {
          alternative_product_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          reason?: string | null
        }
        Update: {
          alternative_product_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_alternatives_alternative_product_id_fkey"
            columns: ["alternative_product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_alternatives_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_awards: {
        Row: {
          created_at: string | null
          date_received: string | null
          description: string | null
          icon_url: string | null
          id: string
          issuer: string | null
          product_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          date_received?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          issuer?: string | null
          product_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          date_received?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          issuer?: string | null
          product_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_awards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_check_in: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          mood: number | null
          notes: string | null
          photo_url: string | null
          product_id: string
          rating: number
          serving_context: string | null
          user_id: string
          would_recommend: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: string | null
          mood?: number | null
          notes?: string | null
          photo_url?: string | null
          product_id: string
          rating: number
          serving_context?: string | null
          user_id: string
          would_recommend?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          mood?: number | null
          notes?: string | null
          photo_url?: string | null
          product_id?: string
          rating?: number
          serving_context?: string | null
          user_id?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "product_check_ins_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "smokeless_products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_edited: boolean | null
          parent_id: string | null
          product_id: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          parent_id?: string | null
          product_id: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          parent_id?: string | null
          product_id?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_comments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_comparisons: {
        Row: {
          created_at: string | null
          id: string
          product_ids: string[]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_ids: string[]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_ids?: string[]
          user_id?: string | null
        }
        Relationships: []
      }
      product_con: {
        Row: {
          content: string
          created_at: string | null
          id: string
          product_id: string
          updated_at: string | null
          user_id: string
          vote_count: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          product_id: string
          updated_at?: string | null
          user_id: string
          vote_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          product_id?: string
          updated_at?: string | null
          user_id?: string
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_con_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_con_vote: {
        Row: {
          con_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          con_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          con_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_con_vote_con_id_fkey"
            columns: ["con_id"]
            isOneToOne: false
            referencedRelation: "product_con"
            referencedColumns: ["id"]
          },
        ]
      }
      product_deals: {
        Row: {
          created_at: string | null
          deal_expires_at: string | null
          deal_terms: string | null
          deal_type: Json | null
          discount_percentage: number | null
          discounted_price: number | null
          id: string
          is_active: boolean | null
          max_redemptions: number | null
          original_price: number | null
          product_id: string
          redemptions_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deal_expires_at?: string | null
          deal_terms?: string | null
          deal_type?: Json | null
          discount_percentage?: number | null
          discounted_price?: number | null
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          original_price?: number | null
          product_id: string
          redemptions_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deal_expires_at?: string | null
          deal_terms?: string | null
          deal_type?: Json | null
          discount_percentage?: number | null
          discounted_price?: number | null
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          original_price?: number | null
          product_id?: string
          redemptions_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_deals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_edit_suggestions: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          current_value: string | null
          field_name: string
          id: string
          product_id: string
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          suggested_value: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          current_value?: string | null
          field_name: string
          id?: string
          product_id: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          suggested_value: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          current_value?: string | null
          field_name?: string
          id?: string
          product_id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          suggested_value?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_edit_suggestions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_follows: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_follows_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_image: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
          source: string | null
          status: string | null
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
          source?: string | null
          status?: string | null
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
          source?: string | null
          status?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_makers: {
        Row: {
          product_id: string
          user_id: string
        }
        Insert: {
          product_id: string
          user_id: string
        }
        Update: {
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_makers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_pro: {
        Row: {
          content: string
          created_at: string | null
          id: string
          product_id: string
          updated_at: string | null
          user_id: string
          vote_count: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          product_id: string
          updated_at?: string | null
          user_id: string
          vote_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          product_id?: string
          updated_at?: string | null
          user_id?: string
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_pro_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_pro_vote: {
        Row: {
          created_at: string | null
          id: string
          pro_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pro_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pro_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_pro_vote_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "product_pro"
            referencedColumns: ["id"]
          },
        ]
      }
      product_purchases: {
        Row: {
          created_at: string | null
          currency: string | null
          expires_at: string | null
          id: string
          is_first_purchase: boolean | null
          metadata: Json | null
          payment_id: string | null
          payment_method: string | null
          price_paid: number
          product_id: string | null
          purchase_type: string
          status: string
          stripe_session_id: string | null
          subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          is_first_purchase?: boolean | null
          metadata?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          price_paid: number
          product_id?: string | null
          purchase_type: string
          status?: string
          stripe_session_id?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          is_first_purchase?: boolean | null
          metadata?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          price_paid?: number
          product_id?: string | null
          purchase_type?: string
          status?: string
          stripe_session_id?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_report: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          message: string
          product_id: string
          resolved_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          message: string
          product_id: string
          resolved_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          message?: string
          product_id?: string
          resolved_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          created_at: string | null
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          product_id: string
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          product_id: string
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          product_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_shops: {
        Row: {
          created_at: string | null
          currency: string | null
          current_price: number | null
          id: string
          is_available: boolean | null
          last_verified: string | null
          original_price: number | null
          product_id: string | null
          shop_id: string | null
          shop_product_url: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          current_price?: number | null
          id?: string
          is_available?: boolean | null
          last_verified?: string | null
          original_price?: number | null
          product_id?: string | null
          shop_id?: string | null
          shop_product_url: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          current_price?: number | null
          id?: string
          is_available?: boolean | null
          last_verified?: string | null
          original_price?: number | null
          product_id?: string | null
          shop_id?: string | null
          shop_product_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_shops_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_shops_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shop"
            referencedColumns: ["id"]
          },
        ]
      }
      product_stores: {
        Row: {
          affiliate_url: string | null
          created_at: string | null
          delivery_days_temp: number | null
          id: string
          in_stock_temp: boolean | null
          is_available: boolean | null
          is_available_temp: boolean | null
          last_updated: string | null
          price: number
          price_per_unit_temp: number | null
          price_range_temp: string | null
          price_temp: number | null
          product_id: string | null
          sale_price: number | null
          sale_price_temp: number | null
          shipping_cost_temp: number | null
          stock_quantity: number | null
          store_id: string | null
          store_name_temp: string | null
          url_temp: string | null
        }
        Insert: {
          affiliate_url?: string | null
          created_at?: string | null
          delivery_days_temp?: number | null
          id?: string
          in_stock_temp?: boolean | null
          is_available?: boolean | null
          is_available_temp?: boolean | null
          last_updated?: string | null
          price: number
          price_per_unit_temp?: number | null
          price_range_temp?: string | null
          price_temp?: number | null
          product_id?: string | null
          sale_price?: number | null
          sale_price_temp?: number | null
          shipping_cost_temp?: number | null
          stock_quantity?: number | null
          store_id?: string | null
          store_name_temp?: string | null
          url_temp?: string | null
        }
        Update: {
          affiliate_url?: string | null
          created_at?: string | null
          delivery_days_temp?: number | null
          id?: string
          in_stock_temp?: boolean | null
          is_available?: boolean | null
          is_available_temp?: boolean | null
          last_updated?: string | null
          price?: number
          price_per_unit_temp?: number | null
          price_range_temp?: string | null
          price_temp?: number | null
          product_id?: string | null
          sale_price?: number | null
          sale_price_temp?: number | null
          shipping_cost_temp?: number | null
          stock_quantity?: number | null
          store_id?: string | null
          store_name_temp?: string | null
          url_temp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_stores_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "smokeless_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_stores_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_submission: {
        Row: {
          brand_name: string
          category: string | null
          created_at: string | null
          description: string | null
          flavor_category: string | null
          id: string
          image_url: string | null
          product_name: string
          product_url: string | null
          status: string | null
          strength_mg: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          brand_name: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          flavor_category?: string | null
          id?: string
          image_url?: string | null
          product_name: string
          product_url?: string | null
          status?: string | null
          strength_mg?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          brand_name?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          flavor_category?: string | null
          id?: string
          image_url?: string | null
          product_name?: string
          product_url?: string | null
          status?: string | null
          strength_mg?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      product_tags: {
        Row: {
          product_id: string
          tag_id: string
        }
        Insert: {
          product_id: string
          tag_id: string
        }
        Update: {
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      product_team: {
        Row: {
          created_at: string | null
          id: string
          permissions: Json | null
          product_id: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          product_id?: string | null
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          product_id?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_team_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_team_members: {
        Row: {
          id: string
          joined_at: string | null
          product_id: string
          role: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          product_id: string
          role?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          product_id?: string
          role?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_team_members_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_votes: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_votes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          availability_schedule: Json | null
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          data_sharing: boolean | null
          default_nrt_product_id: string | null
          dementia_stage: string | null
          email: string
          email_reminders: boolean | null
          freshcoin_balance: number | null
          freshcoin_last_quit_sync: string | null
          freshcoin_last_step_sync: string | null
          freshcoin_lifetime_earned: number | null
          freshcoin_quit_streak: number | null
          freshcoin_steps_streak: number | null
          freshcoin_total_spent: number | null
          full_name: string | null
          github: string | null
          has_provider_profile: boolean | null
          id: string
          is_admin: boolean | null
          is_care_provider: boolean | null
          is_cared_one: boolean | null
          is_verified: boolean | null
          language: string | null
          linked_primary_caregiver_code: string | null
          linkedin: string | null
          location: string | null
          notifications_enabled: boolean | null
          phone: string | null
          primary_service_id: string | null
          privacy_mode: boolean | null
          provider_display_name: string | null
          provider_id: string | null
          role: string | null
          theme: string | null
          timezone: string | null
          twitter: string | null
          updated_at: string | null
          user_name: string | null
          username: string | null
          website: string | null
          years_of_experience: number | null
        }
        Insert: {
          availability_schedule?: Json | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          data_sharing?: boolean | null
          default_nrt_product_id?: string | null
          dementia_stage?: string | null
          email: string
          email_reminders?: boolean | null
          freshcoin_balance?: number | null
          freshcoin_last_quit_sync?: string | null
          freshcoin_last_step_sync?: string | null
          freshcoin_lifetime_earned?: number | null
          freshcoin_quit_streak?: number | null
          freshcoin_steps_streak?: number | null
          freshcoin_total_spent?: number | null
          full_name?: string | null
          github?: string | null
          has_provider_profile?: boolean | null
          id: string
          is_admin?: boolean | null
          is_care_provider?: boolean | null
          is_cared_one?: boolean | null
          is_verified?: boolean | null
          language?: string | null
          linked_primary_caregiver_code?: string | null
          linkedin?: string | null
          location?: string | null
          notifications_enabled?: boolean | null
          phone?: string | null
          primary_service_id?: string | null
          privacy_mode?: boolean | null
          provider_display_name?: string | null
          provider_id?: string | null
          role?: string | null
          theme?: string | null
          timezone?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_name?: string | null
          username?: string | null
          website?: string | null
          years_of_experience?: number | null
        }
        Update: {
          availability_schedule?: Json | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          data_sharing?: boolean | null
          default_nrt_product_id?: string | null
          dementia_stage?: string | null
          email?: string
          email_reminders?: boolean | null
          freshcoin_balance?: number | null
          freshcoin_last_quit_sync?: string | null
          freshcoin_last_step_sync?: string | null
          freshcoin_lifetime_earned?: number | null
          freshcoin_quit_streak?: number | null
          freshcoin_steps_streak?: number | null
          freshcoin_total_spent?: number | null
          full_name?: string | null
          github?: string | null
          has_provider_profile?: boolean | null
          id?: string
          is_admin?: boolean | null
          is_care_provider?: boolean | null
          is_cared_one?: boolean | null
          is_verified?: boolean | null
          language?: string | null
          linked_primary_caregiver_code?: string | null
          linkedin?: string | null
          location?: string | null
          notifications_enabled?: boolean | null
          phone?: string | null
          primary_service_id?: string | null
          privacy_mode?: boolean | null
          provider_display_name?: string | null
          provider_id?: string | null
          role?: string | null
          theme?: string | null
          timezone?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_name?: string | null
          username?: string | null
          website?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_primary_service_id_fkey"
            columns: ["primary_service_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "care_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      program_steps: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          meditation_id: string | null
          program_id: string
          step_number: number
          technique_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          meditation_id?: string | null
          program_id: string
          step_number: number
          technique_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          meditation_id?: string | null
          program_id?: string
          step_number?: number
          technique_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_steps_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_steps_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_steps_technique_id_fkey"
            columns: ["technique_id"]
            isOneToOne: false
            referencedRelation: "breathing_technique"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string | null
          description: string | null
          duration_weeks: number | null
          id: string
          image_url: string | null
          is_published: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          name?: string
        }
        Relationships: []
      }
      progress_entry: {
        Row: {
          cigarettes_avoided: number | null
          coping_strategies_used: string[] | null
          craving_intensity: number
          created_at: string | null
          date: string
          energy_level: number
          goal_id: string
          id: string
          money_saved: number | null
          mood_rating: number
          notes: string | null
          status: string
          stress_level: number
          triggers_encountered: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cigarettes_avoided?: number | null
          coping_strategies_used?: string[] | null
          craving_intensity: number
          created_at?: string | null
          date: string
          energy_level: number
          goal_id: string
          id?: string
          money_saved?: number | null
          mood_rating: number
          notes?: string | null
          status: string
          stress_level: number
          triggers_encountered?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cigarettes_avoided?: number | null
          coping_strategies_used?: string[] | null
          craving_intensity?: number
          created_at?: string | null
          date?: string
          energy_level?: number
          goal_id?: string
          id?: string
          money_saved?: number | null
          mood_rating?: number
          notes?: string | null
          status?: string
          stress_level?: number
          triggers_encountered?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_entries_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goal"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_photo: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          latitude: number | null
          longitude: number | null
          photo_id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          latitude?: number | null
          longitude?: number | null
          photo_id: string
          timestamp: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          latitude?: number | null
          longitude?: number | null
          photo_id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      progress_tracker: {
        Row: {
          cigarettes_avoided: number | null
          created_at: string | null
          days_smoke_free: number | null
          health_improvements: Json | null
          id: string
          milestones: Json | null
          money_saved: number | null
          quit_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cigarettes_avoided?: number | null
          created_at?: string | null
          days_smoke_free?: number | null
          health_improvements?: Json | null
          id?: string
          milestones?: Json | null
          money_saved?: number | null
          quit_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cigarettes_avoided?: number | null
          created_at?: string | null
          days_smoke_free?: number | null
          health_improvements?: Json | null
          id?: string
          milestones?: Json | null
          money_saved?: number | null
          quit_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          team_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          team_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_code: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          minimum_purchase: number | null
          product_id: string | null
          store_id: string | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          minimum_purchase?: number | null
          product_id?: string | null
          store_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          minimum_purchase?: number | null
          product_id?: string | null
          store_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_codes_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "shop"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_bookings: {
        Row: {
          clicks: number | null
          created_at: string | null
          end_date: string
          id: string
          impressions: number | null
          is_active: boolean | null
          payment_status: string
          position: number | null
          price_paid: number
          product_id: string
          slot_id: string | null
          start_date: string
          stripe_payment_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          clicks?: number | null
          created_at?: string | null
          end_date: string
          id?: string
          impressions?: number | null
          is_active?: boolean | null
          payment_status?: string
          position?: number | null
          price_paid: number
          product_id: string
          slot_id?: string | null
          start_date: string
          stripe_payment_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          clicks?: number | null
          created_at?: string | null
          end_date?: string
          id?: string
          impressions?: number | null
          is_active?: boolean | null
          payment_status?: string
          position?: number | null
          price_paid?: number
          product_id?: string
          slot_id?: string | null
          start_date?: string
          stripe_payment_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_bookings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "promotion_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_pricing: {
        Row: {
          created_at: string | null
          daily_price: number
          features: Json | null
          id: string
          monthly_discount: number | null
          position_range: string
          tier: string
          updated_at: string | null
          weekly_discount: number | null
        }
        Insert: {
          created_at?: string | null
          daily_price: number
          features?: Json | null
          id?: string
          monthly_discount?: number | null
          position_range: string
          tier: string
          updated_at?: string | null
          weekly_discount?: number | null
        }
        Update: {
          created_at?: string | null
          daily_price?: number
          features?: Json | null
          id?: string
          monthly_discount?: number | null
          position_range?: string
          tier?: string
          updated_at?: string | null
          weekly_discount?: number | null
        }
        Relationships: []
      }
      promotion_slots: {
        Row: {
          base_price: number
          created_at: string | null
          id: string
          is_available: boolean | null
          position: number
          price_tier: string
          slot_date: string
          updated_at: string | null
        }
        Insert: {
          base_price: number
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          position: number
          price_tier: string
          slot_date: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          position?: number
          price_tier?: string
          slot_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      provider_availability: {
        Row: {
          allowed_service_types: string[] | null
          buffer_minutes: number | null
          created_at: string | null
          custom_hourly_rate: number | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          max_bookings_per_slot: number | null
          provider_id: string
          slot_duration_minutes: number | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          allowed_service_types?: string[] | null
          buffer_minutes?: number | null
          created_at?: string | null
          custom_hourly_rate?: number | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          max_bookings_per_slot?: number | null
          provider_id: string
          slot_duration_minutes?: number | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          allowed_service_types?: string[] | null
          buffer_minutes?: number | null
          created_at?: string | null
          custom_hourly_rate?: number | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          max_bookings_per_slot?: number | null
          provider_id?: string
          slot_duration_minutes?: number | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_availability_overrides: {
        Row: {
          all_day: boolean | null
          created_at: string | null
          custom_end_time: string | null
          custom_start_time: string | null
          id: string
          override_date: string
          override_type: string
          provider_id: string
          reason: string | null
          updated_at: string | null
        }
        Insert: {
          all_day?: boolean | null
          created_at?: string | null
          custom_end_time?: string | null
          custom_start_time?: string | null
          id?: string
          override_date: string
          override_type?: string
          provider_id: string
          reason?: string | null
          updated_at?: string | null
        }
        Update: {
          all_day?: boolean | null
          created_at?: string | null
          custom_end_time?: string | null
          custom_start_time?: string | null
          id?: string
          override_date?: string
          override_type?: string
          provider_id?: string
          reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_availability_overrides_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_availability_settings: {
        Row: {
          advance_booking_days: number | null
          auto_accept_returning_clients: boolean | null
          auto_accept_verified_clients: boolean | null
          created_at: string | null
          default_buffer_minutes: number | null
          default_slot_duration_minutes: number | null
          id: string
          instant_book_enabled: boolean | null
          instant_book_max_hours: number | null
          lunch_break_enabled: boolean | null
          lunch_break_end: string | null
          lunch_break_start: string | null
          max_daily_hours: number | null
          minimum_notice_hours: number | null
          provider_id: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          advance_booking_days?: number | null
          auto_accept_returning_clients?: boolean | null
          auto_accept_verified_clients?: boolean | null
          created_at?: string | null
          default_buffer_minutes?: number | null
          default_slot_duration_minutes?: number | null
          id?: string
          instant_book_enabled?: boolean | null
          instant_book_max_hours?: number | null
          lunch_break_enabled?: boolean | null
          lunch_break_end?: string | null
          lunch_break_start?: string | null
          max_daily_hours?: number | null
          minimum_notice_hours?: number | null
          provider_id: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          advance_booking_days?: number | null
          auto_accept_returning_clients?: boolean | null
          auto_accept_verified_clients?: boolean | null
          created_at?: string | null
          default_buffer_minutes?: number | null
          default_slot_duration_minutes?: number | null
          id?: string
          instant_book_enabled?: boolean | null
          instant_book_max_hours?: number | null
          lunch_break_enabled?: boolean | null
          lunch_break_end?: string | null
          lunch_break_start?: string | null
          max_daily_hours?: number | null
          minimum_notice_hours?: number | null
          provider_id?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_availability_settings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_earnings: {
        Row: {
          amount: number
          available_date: string | null
          booking_id: string | null
          commission_amount: number | null
          commission_rate: number | null
          created_at: string | null
          currency: string | null
          id: string
          net_amount: number | null
          paid_date: string | null
          payout_id: string | null
          provider_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          available_date?: string | null
          booking_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          net_amount?: number | null
          paid_date?: string | null
          payout_id?: string | null
          provider_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          available_date?: string | null
          booking_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          net_amount?: number | null
          paid_date?: string | null
          payout_id?: string | null
          provider_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_earnings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_earnings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "care_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_payouts: {
        Row: {
          amount: number
          bank_account_last4: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          failure_reason: string | null
          id: string
          net_amount: number | null
          payout_date: string | null
          payout_method: string | null
          processing_fee: number | null
          provider_id: string | null
          status: string | null
          stripe_payout_id: string | null
          stripe_transfer_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          bank_account_last4?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          failure_reason?: string | null
          id?: string
          net_amount?: number | null
          payout_date?: string | null
          payout_method?: string | null
          processing_fee?: number | null
          provider_id?: string | null
          status?: string | null
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bank_account_last4?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          failure_reason?: string | null
          id?: string
          net_amount?: number | null
          payout_date?: string | null
          payout_method?: string | null
          processing_fee?: number | null
          provider_id?: string | null
          status?: string | null
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_payouts_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "care_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_recurring_schedule: {
        Row: {
          created_at: string | null
          days_of_week: number[]
          end_time: string
          id: string
          provider_id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_of_week: number[]
          end_time: string
          id?: string
          provider_id: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_of_week?: number[]
          end_time?: string
          id?: string
          provider_id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      provider_references: {
        Row: {
          completed_at: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          provider_id: string
          relationship: string
          requested_by: string | null
          response: Json | null
          sent_at: string | null
          status: string | null
          updated_at: string | null
          verification_token: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          provider_id: string
          relationship: string
          requested_by?: string | null
          response?: Json | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
          verification_token?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          provider_id?: string
          relationship?: string
          requested_by?: string | null
          response?: Json | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
          verification_token?: string | null
        }
        Relationships: []
      }
      provider_reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          provider_id: string | null
          rating: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          provider_id?: string | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          provider_id?: string | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "care_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_services: {
        Row: {
          created_at: string | null
          custom_rate: number | null
          id: string
          is_primary: boolean | null
          provider_id: string
          service_category_id: string
        }
        Insert: {
          created_at?: string | null
          custom_rate?: number | null
          id?: string
          is_primary?: boolean | null
          provider_id: string
          service_category_id: string
        }
        Update: {
          created_at?: string | null
          custom_rate?: number | null
          id?: string
          is_primary?: boolean | null
          provider_id?: string
          service_category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_services_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_verification_levels: {
        Row: {
          additional_info: Json | null
          created_at: string | null
          expiry_date: string | null
          id: string
          provider_id: string | null
          updated_at: string | null
          verification_date: string | null
          verification_method: string | null
          verification_provider: string | null
          verification_reference: string | null
          verification_status: string | null
          verification_type: string
        }
        Insert: {
          additional_info?: Json | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          provider_id?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verification_method?: string | null
          verification_provider?: string | null
          verification_reference?: string | null
          verification_status?: string | null
          verification_type: string
        }
        Update: {
          additional_info?: Json | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          provider_id?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verification_method?: string | null
          verification_provider?: string | null
          verification_reference?: string | null
          verification_status?: string | null
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_verification_levels_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "care_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_verifications: {
        Row: {
          created_at: string | null
          documents: string[] | null
          expires_at: string | null
          id: string
          provider_id: string
          status: string
          submitted_at: string | null
          updated_at: string | null
          verification_type: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          documents?: string[] | null
          expires_at?: string | null
          id?: string
          provider_id: string
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          verification_type: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          documents?: string[] | null
          expires_at?: string | null
          id?: string
          provider_id?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          verification_type?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          affiliate_commission: number | null
          buyer_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          is_first_purchase: boolean | null
          listing_id: string | null
          purchase_price: number
          seller_id: string | null
          status: string | null
        }
        Insert: {
          affiliate_commission?: number | null
          buyer_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_first_purchase?: boolean | null
          listing_id?: string | null
          purchase_price: number
          seller_id?: string | null
          status?: string | null
        }
        Update: {
          affiliate_commission?: number | null
          buyer_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_first_purchase?: boolean | null
          listing_id?: string | null
          purchase_price?: number
          seller_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "subscription_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string | null
          id: string
          platform: string | null
          token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform?: string | null
          token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string | null
          token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      question_options: {
        Row: {
          created_at: string | null
          id: string
          is_other: boolean | null
          option_text: string
          option_value: string | null
          order_index: number | null
          question_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_other?: boolean | null
          option_text: string
          option_value?: string | null
          order_index?: number | null
          question_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_other?: boolean | null
          option_text?: string
          option_value?: string | null
          order_index?: number | null
          question_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quit_method: {
        Row: {
          best_for: string[]
          considerations: string[]
          created_at: string | null
          description: string
          difficulty: string
          id: number
          is_active: boolean | null
          name: string
          sort_order: number | null
          success_rate_max: number
          success_rate_min: number
          timeframe: string
          updated_at: string | null
        }
        Insert: {
          best_for: string[]
          considerations: string[]
          created_at?: string | null
          description: string
          difficulty: string
          id?: number
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          success_rate_max: number
          success_rate_min: number
          timeframe: string
          updated_at?: string | null
        }
        Update: {
          best_for?: string[]
          considerations?: string[]
          created_at?: string | null
          description?: string
          difficulty?: string
          id?: number
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          success_rate_max?: number
          success_rate_min?: number
          timeframe?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quit_methods: {
        Row: {
          best_for: string[] | null
          color_theme: string | null
          combines_well_with: string[] | null
          considerations: string[] | null
          created_at: string | null
          difficulty: string | null
          full_description: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          not_recommended_for: string[] | null
          requires_nrt: boolean | null
          requires_prescription: boolean | null
          scientific_basis: string | null
          short_description: string | null
          slug: string
          sort_order: number | null
          success_rate_max: number | null
          success_rate_min: number | null
          timeframe: string | null
          total_days: number | null
          total_phases: number | null
          updated_at: string | null
        }
        Insert: {
          best_for?: string[] | null
          color_theme?: string | null
          combines_well_with?: string[] | null
          considerations?: string[] | null
          created_at?: string | null
          difficulty?: string | null
          full_description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          not_recommended_for?: string[] | null
          requires_nrt?: boolean | null
          requires_prescription?: boolean | null
          scientific_basis?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number | null
          success_rate_max?: number | null
          success_rate_min?: number | null
          timeframe?: string | null
          total_days?: number | null
          total_phases?: number | null
          updated_at?: string | null
        }
        Update: {
          best_for?: string[] | null
          color_theme?: string | null
          combines_well_with?: string[] | null
          considerations?: string[] | null
          created_at?: string | null
          difficulty?: string | null
          full_description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          not_recommended_for?: string[] | null
          requires_nrt?: boolean | null
          requires_prescription?: boolean | null
          scientific_basis?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number | null
          success_rate_max?: number | null
          success_rate_min?: number | null
          timeframe?: string | null
          total_days?: number | null
          total_phases?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          author: string | null
          id: string
          text: string
        }
        Insert: {
          author?: string | null
          id?: string
          text: string
        }
        Update: {
          author?: string | null
          id?: string
          text?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          reaction_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          reaction_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          reaction_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      recovery_milestones: {
        Row: {
          achieved_at: string | null
          days_since_quit: number | null
          health_improvements: string[] | null
          id: string
          milestone_type: string
          notes: string | null
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          days_since_quit?: number | null
          health_improvements?: string[] | null
          id?: string
          milestone_type: string
          notes?: string | null
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          days_since_quit?: number | null
          health_improvements?: string[] | null
          id?: string
          milestone_type?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      recurring_bookings: {
        Row: {
          created_at: string | null
          days_of_week: number[] | null
          duration_hours: number
          end_date: string | null
          frequency: string | null
          hourly_rate: number | null
          id: string
          last_generated_date: string | null
          location: string | null
          next_occurrence_date: string | null
          notes: string | null
          provider_id: string | null
          service_type: string | null
          start_date: string
          start_time: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          days_of_week?: number[] | null
          duration_hours: number
          end_date?: string | null
          frequency?: string | null
          hourly_rate?: number | null
          id?: string
          last_generated_date?: string | null
          location?: string | null
          next_occurrence_date?: string | null
          notes?: string | null
          provider_id?: string | null
          service_type?: string | null
          start_date: string
          start_time: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          days_of_week?: number[] | null
          duration_hours?: number
          end_date?: string | null
          frequency?: string | null
          hourly_rate?: number | null
          id?: string
          last_generated_date?: string | null
          location?: string | null
          next_occurrence_date?: string | null
          notes?: string | null
          provider_id?: string | null
          service_type?: string | null
          start_date?: string
          start_time?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "care_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      reddit_account: {
        Row: {
          client_id: string
          client_secret: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_frozen: boolean | null
          last_used_at: string | null
          password: string
          updated_at: string | null
          username: string
        }
        Insert: {
          client_id: string
          client_secret: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_frozen?: boolean | null
          last_used_at?: string | null
          password: string
          updated_at?: string | null
          username: string
        }
        Update: {
          client_id?: string
          client_secret?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_frozen?: boolean | null
          last_used_at?: string | null
          password?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      reddit_reply_template: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          template: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          template: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          template?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reddit_scan_queue: {
        Row: {
          author: string
          content: string | null
          created_at: string | null
          id: string
          post_url: string
          posted_at: string
          posted_to_reddit: boolean | null
          posted_to_site: boolean | null
          product_id: string | null
          reddit_account_id: string | null
          reddit_comment_id: string | null
          reddit_post_id: string
          reddit_reply_template: string | null
          rejected: boolean | null
          scanned_at: string | null
          status: string | null
          subreddit: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author: string
          content?: string | null
          created_at?: string | null
          id?: string
          post_url: string
          posted_at: string
          posted_to_reddit?: boolean | null
          posted_to_site?: boolean | null
          product_id?: string | null
          reddit_account_id?: string | null
          reddit_comment_id?: string | null
          reddit_post_id: string
          reddit_reply_template?: string | null
          rejected?: boolean | null
          scanned_at?: string | null
          status?: string | null
          subreddit: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string
          content?: string | null
          created_at?: string | null
          id?: string
          post_url?: string
          posted_at?: string
          posted_to_reddit?: boolean | null
          posted_to_site?: boolean | null
          product_id?: string | null
          reddit_account_id?: string | null
          reddit_comment_id?: string | null
          reddit_post_id?: string
          reddit_reply_template?: string | null
          rejected?: boolean | null
          scanned_at?: string | null
          status?: string | null
          subreddit?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reddit_scan_queue_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reddit_scan_queue_reddit_account_id_fkey"
            columns: ["reddit_account_id"]
            isOneToOne: false
            referencedRelation: "reddit_account"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_requests: {
        Row: {
          created_at: string | null
          id: string
          provider_id: string
          requested_by: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          provider_id: string
          requested_by: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          provider_id?: string
          requested_by?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      relaxation_sessions: {
        Row: {
          created_at: string | null
          duration_seconds: number
          id: string
          stopped_sounds: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_seconds: number
          id?: string
          stopped_sounds?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number
          id?: string
          stopped_sounds?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      research_projects: {
        Row: {
          ai_enabled: boolean | null
          auto_advance: boolean | null
          compensation: string | null
          compensation_amount: number | null
          compensation_type: string | null
          consent_form: Json | null
          consent_form_text: string | null
          consent_form_url: string | null
          consent_required: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          disable_backtracking: boolean | null
          id: string
          max_participants: number | null
          notification_enabled: boolean | null
          notification_settings: Json | null
          organization_id: string | null
          participant_count: number | null
          project_type: string | null
          questions: Json | null
          randomize_questions: boolean | null
          recruitment_criteria: Json | null
          researcher_id: string | null
          settings: Json | null
          show_progress_bar: boolean | null
          status: string | null
          study_duration: number | null
          survey_code: string | null
          survey_frequency: string | null
          title: string
          updated_at: string | null
          voice_enabled: boolean | null
        }
        Insert: {
          ai_enabled?: boolean | null
          auto_advance?: boolean | null
          compensation?: string | null
          compensation_amount?: number | null
          compensation_type?: string | null
          consent_form?: Json | null
          consent_form_text?: string | null
          consent_form_url?: string | null
          consent_required?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          disable_backtracking?: boolean | null
          id?: string
          max_participants?: number | null
          notification_enabled?: boolean | null
          notification_settings?: Json | null
          organization_id?: string | null
          participant_count?: number | null
          project_type?: string | null
          questions?: Json | null
          randomize_questions?: boolean | null
          recruitment_criteria?: Json | null
          researcher_id?: string | null
          settings?: Json | null
          show_progress_bar?: boolean | null
          status?: string | null
          study_duration?: number | null
          survey_code?: string | null
          survey_frequency?: string | null
          title: string
          updated_at?: string | null
          voice_enabled?: boolean | null
        }
        Update: {
          ai_enabled?: boolean | null
          auto_advance?: boolean | null
          compensation?: string | null
          compensation_amount?: number | null
          compensation_type?: string | null
          consent_form?: Json | null
          consent_form_text?: string | null
          consent_form_url?: string | null
          consent_required?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          disable_backtracking?: boolean | null
          id?: string
          max_participants?: number | null
          notification_enabled?: boolean | null
          notification_settings?: Json | null
          organization_id?: string | null
          participant_count?: number | null
          project_type?: string | null
          questions?: Json | null
          randomize_questions?: boolean | null
          recruitment_criteria?: Json | null
          researcher_id?: string | null
          settings?: Json | null
          show_progress_bar?: boolean | null
          status?: string | null
          study_duration?: number | null
          survey_code?: string | null
          survey_frequency?: string | null
          title?: string
          updated_at?: string | null
          voice_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "research_projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_projects_researcher_id_fkey"
            columns: ["researcher_id"]
            isOneToOne: false
            referencedRelation: "researchers"
            referencedColumns: ["id"]
          },
        ]
      }
      researchers: {
        Row: {
          created_at: string | null
          email: string | null
          email_notifications: boolean | null
          first_name: string | null
          id: string
          last_name: string | null
          organization_id: string | null
          response_alerts: boolean | null
          role: string | null
          updated_at: string | null
          user_id: string | null
          weekly_digest: boolean | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          email_notifications?: boolean | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string | null
          response_alerts?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
          weekly_digest?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          email_notifications?: boolean | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string | null
          response_alerts?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
          weekly_digest?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "researchers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      review: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          helpful_count: number | null
          id: string
          is_verified_visit: boolean | null
          rating: number
          response_by: string | null
          response_date: string | null
          response_text: string | null
          review_text: string | null
          title: string | null
          updated_at: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          helpful_count?: number | null
          id?: string
          is_verified_visit?: boolean | null
          rating: number
          response_by?: string | null
          response_date?: string | null
          response_text?: string | null
          review_text?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          helpful_count?: number | null
          id?: string
          is_verified_visit?: boolean | null
          rating?: number
          response_by?: string | null
          response_date?: string | null
          response_text?: string | null
          review_text?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      review_helpful_votes: {
        Row: {
          created_at: string | null
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "review"
            referencedColumns: ["id"]
          },
        ]
      }
      review_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          display_order: number | null
          id: string
          photo_url: string
          review_id: string | null
          user_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          photo_url: string
          review_id?: string | null
          user_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          photo_url?: string
          review_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_photos_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "review"
            referencedColumns: ["id"]
          },
        ]
      }
      review_votes: {
        Row: {
          created_at: string | null
          id: string
          review_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "review"
            referencedColumns: ["id"]
          },
        ]
      }
      reward: {
        Row: {
          active: boolean
          created_at: string
          description: string
          id: string
          name: string
          points_required: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description: string
          id?: string
          name: string
          points_required: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          name?: string
          points_required?: number
        }
        Relationships: []
      }
      rewards_catalog: {
        Row: {
          cost: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          cost: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          cost?: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      routine_activities: {
        Row: {
          activity_order: number
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          name: string
          routine_id: string
          user_id: string
        }
        Insert: {
          activity_order: number
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name: string
          routine_id: string
          user_id: string
        }
        Update: {
          activity_order?: number
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name?: string
          routine_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_activities_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      safe_zones: {
        Row: {
          created_at: string
          id: string
          latitude: number
          longitude: number
          name: string
          radius: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          name: string
          radius: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          radius?: number
          user_id?: string
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          id: string
          item_id: string
          item_type: string
          notes: string | null
          saved_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          item_id: string
          item_type: string
          notes?: string | null
          saved_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          item_id?: string
          item_type?: string
          notes?: string | null
          saved_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_product: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_providers: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          provider_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          provider_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          provider_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_providers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "care_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_search: {
        Row: {
          created_at: string | null
          frequency: string | null
          id: string
          last_notified_at: string | null
          name: string
          notification_enabled: boolean | null
          search_criteria: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          frequency?: string | null
          id?: string
          last_notified_at?: string | null
          name: string
          notification_enabled?: boolean | null
          search_criteria: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          frequency?: string | null
          id?: string
          last_notified_at?: string | null
          name?: string
          notification_enabled?: boolean | null
          search_criteria?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      saved_stores: {
        Row: {
          created_at: string | null
          id: string
          store_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          store_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          store_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      seller_payouts: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          notes: string | null
          payment_method: string | null
          processed_at: string | null
          seller_id: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          processed_at?: string | null
          seller_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          processed_at?: string | null
          seller_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
        }
        Relationships: []
      }
      service_agreements: {
        Row: {
          cancellation_policy: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          hourly_rate: number | null
          id: string
          payment_terms: string | null
          provider_id: string | null
          provider_signed_at: string | null
          signed_by_provider: boolean | null
          signed_by_user: boolean | null
          start_date: string
          status: string | null
          terms: string
          title: string
          updated_at: string | null
          user_id: string | null
          user_signed_at: string | null
          weekly_hours: number | null
        }
        Insert: {
          cancellation_policy?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          hourly_rate?: number | null
          id?: string
          payment_terms?: string | null
          provider_id?: string | null
          provider_signed_at?: string | null
          signed_by_provider?: boolean | null
          signed_by_user?: boolean | null
          start_date: string
          status?: string | null
          terms: string
          title: string
          updated_at?: string | null
          user_id?: string | null
          user_signed_at?: string | null
          weekly_hours?: number | null
        }
        Update: {
          cancellation_policy?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          hourly_rate?: number | null
          id?: string
          payment_terms?: string | null
          provider_id?: string | null
          provider_signed_at?: string | null
          signed_by_provider?: boolean | null
          signed_by_user?: boolean | null
          start_date?: string
          status?: string | null
          terms?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
          user_signed_at?: string | null
          weekly_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_agreements_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "care_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          base_rate_max: number | null
          base_rate_min: number | null
          created_at: string | null
          description: string | null
          display_order: number | null
          estimated_duration_max: number | null
          estimated_duration_min: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_bookable: boolean | null
          is_job_type: boolean | null
          is_recurring_eligible: boolean | null
          is_urgent_eligible: boolean | null
          name: string
          parent_id: string | null
          requires_background_check: boolean | null
          requires_certification: boolean | null
          requires_equipment: boolean | null
          requires_vehicle: boolean | null
          slug: string
          special_requirements: string[] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          base_rate_max?: number | null
          base_rate_min?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          estimated_duration_max?: number | null
          estimated_duration_min?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_bookable?: boolean | null
          is_job_type?: boolean | null
          is_recurring_eligible?: boolean | null
          is_urgent_eligible?: boolean | null
          name: string
          parent_id?: string | null
          requires_background_check?: boolean | null
          requires_certification?: boolean | null
          requires_equipment?: boolean | null
          requires_vehicle?: boolean | null
          slug: string
          special_requirements?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          base_rate_max?: number | null
          base_rate_min?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          estimated_duration_max?: number | null
          estimated_duration_min?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_bookable?: boolean | null
          is_job_type?: boolean | null
          is_recurring_eligible?: boolean | null
          is_urgent_eligible?: boolean | null
          name?: string
          parent_id?: string | null
          requires_background_check?: boolean | null
          requires_certification?: boolean | null
          requires_equipment?: boolean | null
          requires_vehicle?: boolean | null
          slug?: string
          special_requirements?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      service_packages: {
        Row: {
          created_at: string | null
          description: string | null
          duration_hours: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      service_provider_ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          review_text: string | null
          service_provider_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          service_provider_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          service_provider_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_participants: {
        Row: {
          created_at: string | null
          id: string
          joined_at: string | null
          session_id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          session_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          session_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shop: {
        Row: {
          created_at: string | null
          description: string | null
          domain: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          domain: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      shop_owner: {
        Row: {
          business_address: string | null
          business_email: string | null
          business_name: string
          business_phone: string | null
          commission_rate: number | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          total_revenue: number | null
          total_sales: number | null
          updated_at: string | null
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          business_address?: string | null
          business_email?: string | null
          business_name: string
          business_phone?: string | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          total_revenue?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          business_address?: string | null
          business_email?: string | null
          business_name?: string
          business_phone?: string | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          total_revenue?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: []
      }
      shop_pricing: {
        Row: {
          created_at: string | null
          currency: string | null
          current_price: number | null
          deal_expiry: string | null
          deal_type: string | null
          discount_percentage: number | null
          id: string
          is_limited_quantity: boolean | null
          is_limited_time: boolean | null
          original_price: number | null
          product_shop_id: string | null
          stock_available: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          current_price?: number | null
          deal_expiry?: string | null
          deal_type?: string | null
          discount_percentage?: number | null
          id?: string
          is_limited_quantity?: boolean | null
          is_limited_time?: boolean | null
          original_price?: number | null
          product_shop_id?: string | null
          stock_available?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          current_price?: number | null
          deal_expiry?: string | null
          deal_type?: string | null
          discount_percentage?: number | null
          id?: string
          is_limited_quantity?: boolean | null
          is_limited_time?: boolean | null
          original_price?: number | null
          product_shop_id?: string | null
          stock_available?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_pricing_product_shop_id_fkey"
            columns: ["product_shop_id"]
            isOneToOne: false
            referencedRelation: "product_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_carts: {
        Row: {
          created_at: string | null
          id: string
          session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sleep_diary_entries: {
        Row: {
          created_at: string
          dreams_notes: string | null
          entry_date: string
          id: string
          post_sleep_feelings: string | null
          pre_sleep_thoughts: string | null
          sleep_duration_hours: number | null
          sleep_quality: number | null
          time_to_bed: string | null
          time_woken_up: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dreams_notes?: string | null
          entry_date?: string
          id?: string
          post_sleep_feelings?: string | null
          pre_sleep_thoughts?: string | null
          sleep_duration_hours?: number | null
          sleep_quality?: number | null
          time_to_bed?: string | null
          time_woken_up?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dreams_notes?: string | null
          entry_date?: string
          id?: string
          post_sleep_feelings?: string | null
          pre_sleep_thoughts?: string | null
          sleep_duration_hours?: number | null
          sleep_quality?: number | null
          time_to_bed?: string | null
          time_woken_up?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sleep_entries: {
        Row: {
          awakenings: number | null
          bedtime: string
          created_at: string
          entry_date: string
          id: string
          notes: string | null
          sleep_duration_minutes: number | null
          sleep_quality: string
          time_to_fall_alleep_minutes: number | null
          user_id: string
          wake_up_time: string
        }
        Insert: {
          awakenings?: number | null
          bedtime: string
          created_at?: string
          entry_date: string
          id?: string
          notes?: string | null
          sleep_duration_minutes?: number | null
          sleep_quality: string
          time_to_fall_alleep_minutes?: number | null
          user_id: string
          wake_up_time: string
        }
        Update: {
          awakenings?: number | null
          bedtime?: string
          created_at?: string
          entry_date?: string
          id?: string
          notes?: string | null
          sleep_duration_minutes?: number | null
          sleep_quality?: string
          time_to_fall_alleep_minutes?: number | null
          user_id?: string
          wake_up_time?: string
        }
        Relationships: []
      }
      sleep_logs: {
        Row: {
          alcohol_drinks: number | null
          awake_sleep_percentage: number | null
          bed_time: string
          caffeine_mg: number | null
          created_at: string | null
          date: string
          deep_sleep_percentage: number | null
          end_time: string | null
          exercise_minutes: number | null
          id: string
          is_night_shift_sleep: boolean | null
          light_sleep_percentage: number | null
          mood_rating: number | null
          night_wakings: number | null
          notes: string | null
          pre_sleep_notes: string | null
          quality_score: number | null
          recovery_score: number | null
          rem_sleep_percentage: number | null
          room_brightness: number | null
          room_noise_level: number | null
          room_temperature: number | null
          screen_time_minutes: number | null
          sleep_disruptions: string[] | null
          sleep_duration_minutes: number
          sleep_efficiency: number | null
          sleep_factors: string[] | null
          sleep_quality: number
          start_time: string | null
          stress_level: number | null
          time_to_fall_asleep: number | null
          total_sleep_cycles: number | null
          updated_at: string | null
          user_id: string | null
          wake_time: string
        }
        Insert: {
          alcohol_drinks?: number | null
          awake_sleep_percentage?: number | null
          bed_time: string
          caffeine_mg?: number | null
          created_at?: string | null
          date: string
          deep_sleep_percentage?: number | null
          end_time?: string | null
          exercise_minutes?: number | null
          id?: string
          is_night_shift_sleep?: boolean | null
          light_sleep_percentage?: number | null
          mood_rating?: number | null
          night_wakings?: number | null
          notes?: string | null
          pre_sleep_notes?: string | null
          quality_score?: number | null
          recovery_score?: number | null
          rem_sleep_percentage?: number | null
          room_brightness?: number | null
          room_noise_level?: number | null
          room_temperature?: number | null
          screen_time_minutes?: number | null
          sleep_disruptions?: string[] | null
          sleep_duration_minutes: number
          sleep_efficiency?: number | null
          sleep_factors?: string[] | null
          sleep_quality: number
          start_time?: string | null
          stress_level?: number | null
          time_to_fall_asleep?: number | null
          total_sleep_cycles?: number | null
          updated_at?: string | null
          user_id?: string | null
          wake_time: string
        }
        Update: {
          alcohol_drinks?: number | null
          awake_sleep_percentage?: number | null
          bed_time?: string
          caffeine_mg?: number | null
          created_at?: string | null
          date?: string
          deep_sleep_percentage?: number | null
          end_time?: string | null
          exercise_minutes?: number | null
          id?: string
          is_night_shift_sleep?: boolean | null
          light_sleep_percentage?: number | null
          mood_rating?: number | null
          night_wakings?: number | null
          notes?: string | null
          pre_sleep_notes?: string | null
          quality_score?: number | null
          recovery_score?: number | null
          rem_sleep_percentage?: number | null
          room_brightness?: number | null
          room_noise_level?: number | null
          room_temperature?: number | null
          screen_time_minutes?: number | null
          sleep_disruptions?: string[] | null
          sleep_duration_minutes?: number
          sleep_efficiency?: number | null
          sleep_factors?: string[] | null
          sleep_quality?: number
          start_time?: string | null
          stress_level?: number | null
          time_to_fall_asleep?: number | null
          total_sleep_cycles?: number | null
          updated_at?: string | null
          user_id?: string | null
          wake_time?: string
        }
        Relationships: []
      }
      sleep_quality_metrics: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          hours: number
          id: string
          label: string
          quality: string
          updated_at: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          description?: string | null
          hours: number
          id?: string
          label: string
          quality: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          hours?: number
          id?: string
          label?: string
          quality?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sleep_tips: {
        Row: {
          created_at: string | null
          description: string
          display_order: number | null
          icon_type: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          display_order?: number | null
          icon_type?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          display_order?: number | null
          icon_type?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      smokeless_product_reviews: {
        Row: {
          created_at: string | null
          id: string
          is_verified_purchase: boolean | null
          moderation_status:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          product_id: string
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          moderation_status?:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          product_id: string
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          moderation_status?:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          product_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smokeless_product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "deprecated_smokeless_products"
            referencedColumns: ["id"]
          },
        ]
      }
      smokeless_products: {
        Row: {
          brand: string
          brand_temp: string | null
          category_id: string | null
          certification_date_temp: string | null
          certification_number_temp: string | null
          certified_institute_temp: string | null
          country_of_origin: string | null
          created_at: string | null
          description: string | null
          description_temp: string | null
          expert_notes_chemicals: string | null
          expert_notes_gum_health: string | null
          fda_nrt_temp: boolean | null
          flavors: string[] | null
          flavors_temp: string | null
          id: string
          image_url: string | null
          image_url_temp: string | null
          ingredients: string | null
          is_verified: boolean | null
          manufacturer: string | null
          market_region: string | null
          name: string
          name_temp: string | null
          nicotine_form_temp: string | null
          nicotine_strengths: Json | null
          nrt_certified_temp: boolean | null
          numbers_per_pack_temp: number | null
          pack_format_temp: string | null
          pouch_format_temp: string | null
          price: number | null
          product_form_temp: string | null
          strength_category_temp: string | null
          strength_mg_temp: number | null
          tags: string[] | null
          tags_temp: string | null
          updated_at: string | null
          user_rating_avg: number | null
          user_rating_count: number | null
          vendor_id_temp: string | null
        }
        Insert: {
          brand: string
          brand_temp?: string | null
          category_id?: string | null
          certification_date_temp?: string | null
          certification_number_temp?: string | null
          certified_institute_temp?: string | null
          country_of_origin?: string | null
          created_at?: string | null
          description?: string | null
          description_temp?: string | null
          expert_notes_chemicals?: string | null
          expert_notes_gum_health?: string | null
          fda_nrt_temp?: boolean | null
          flavors?: string[] | null
          flavors_temp?: string | null
          id?: string
          image_url?: string | null
          image_url_temp?: string | null
          ingredients?: string | null
          is_verified?: boolean | null
          manufacturer?: string | null
          market_region?: string | null
          name: string
          name_temp?: string | null
          nicotine_form_temp?: string | null
          nicotine_strengths?: Json | null
          nrt_certified_temp?: boolean | null
          numbers_per_pack_temp?: number | null
          pack_format_temp?: string | null
          pouch_format_temp?: string | null
          price?: number | null
          product_form_temp?: string | null
          strength_category_temp?: string | null
          strength_mg_temp?: number | null
          tags?: string[] | null
          tags_temp?: string | null
          updated_at?: string | null
          user_rating_avg?: number | null
          user_rating_count?: number | null
          vendor_id_temp?: string | null
        }
        Update: {
          brand?: string
          brand_temp?: string | null
          category_id?: string | null
          certification_date_temp?: string | null
          certification_number_temp?: string | null
          certified_institute_temp?: string | null
          country_of_origin?: string | null
          created_at?: string | null
          description?: string | null
          description_temp?: string | null
          expert_notes_chemicals?: string | null
          expert_notes_gum_health?: string | null
          fda_nrt_temp?: boolean | null
          flavors?: string[] | null
          flavors_temp?: string | null
          id?: string
          image_url?: string | null
          image_url_temp?: string | null
          ingredients?: string | null
          is_verified?: boolean | null
          manufacturer?: string | null
          market_region?: string | null
          name?: string
          name_temp?: string | null
          nicotine_form_temp?: string | null
          nicotine_strengths?: Json | null
          nrt_certified_temp?: boolean | null
          numbers_per_pack_temp?: number | null
          pack_format_temp?: string | null
          pouch_format_temp?: string | null
          price?: number | null
          product_form_temp?: string | null
          strength_category_temp?: string | null
          strength_mg_temp?: number | null
          tags?: string[] | null
          tags_temp?: string | null
          updated_at?: string | null
          user_rating_avg?: number | null
          user_rating_count?: number | null
          vendor_id_temp?: string | null
        }
        Relationships: []
      }
      sms_notifications: {
        Row: {
          created_at: string | null
          error: string | null
          id: string
          message: string
          recipient: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          id?: string
          message: string
          recipient: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error?: string | null
          id?: string
          message?: string
          recipient?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      social_post_reactions_test: {
        Row: {
          another_col: string | null
          social_post_id: string
        }
        Insert: {
          another_col?: string | null
          social_post_id: string
        }
        Update: {
          another_col?: string | null
          social_post_id?: string
        }
        Relationships: []
      }
      social_shares: {
        Row: {
          created_at: string | null
          id: string
          platform: string
          share_type: string
          share_url: string | null
          target_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform: string
          share_type: string
          share_url?: string | null
          target_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string
          share_type?: string
          share_url?: string | null
          target_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      step_logs: {
        Row: {
          created_at: string | null
          date: string
          goal: number | null
          id: string
          steps: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          goal?: number | null
          id?: string
          steps?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          goal?: number | null
          id?: string
          steps?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      step_rewards: {
        Row: {
          created_at: string
          date: string
          id: string
          points_earned: number
          steps: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          points_earned: number
          steps: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          points_earned?: number
          steps?: number
          user_id?: string
        }
        Relationships: []
      }
      store_prices: {
        Row: {
          created_at: string | null
          id: string
          is_available: boolean | null
          last_updated: string | null
          price: number
          product_id: string | null
          sale_price: number | null
          store_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          last_updated?: string | null
          price: number
          product_id?: string | null
          sale_price?: number | null
          store_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          last_updated?: string | null
          price?: number
          product_id?: string | null
          sale_price?: number | null
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "smokeless_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_prices_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_reviews: {
        Row: {
          created_at: string | null
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          rating: number
          review_text: string
          reviewer_name: string | null
          store_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          rating: number
          review_text: string
          reviewer_name?: string | null
          store_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          rating?: number
          review_text?: string
          reviewer_name?: string | null
          store_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stores: {
        Row: {
          additional_info_temp: string | null
          address: string
          address_temp: string | null
          admin_notes_temp: string | null
          brand: string | null
          business_license_temp: string | null
          chain: string | null
          city: string
          city_temp: string | null
          claim_admin_notes_temp: string | null
          claim_date_temp: string | null
          claim_notes_temp: string | null
          claim_reviewed_by_temp: string | null
          claim_reviewed_date_temp: string | null
          claim_status_temp: string | null
          claim_verification_info_temp: string | null
          claimed_by_temp: string | null
          contact_person_temp: string | null
          contact_role_temp: string | null
          country: string | null
          country_temp: string | null
          created_at: string | null
          delivery_days_max_temp: number | null
          delivery_days_min_temp: number | null
          description_temp: string | null
          drive_through: boolean | null
          id: string
          internal_or_external: string | null
          internal_or_external_temp: string | null
          is_active_temp: boolean | null
          latitude: number | null
          latitude_temp: number | null
          longitude: number | null
          longitude_temp: number | null
          name: string
          name_temp: string | null
          nrt_brands_carried: Json | null
          nrt_brands_carried_temp: string[] | null
          online: boolean | null
          online_or_physical: string | null
          online_or_physical_temp: string | null
          onlinestore_type: string | null
          onlinestore_type_temp: string | null
          original_owner_verified_temp: boolean | null
          parking_available: boolean | null
          pharmacy_available: boolean | null
          phone: string | null
          phone_temp: string | null
          physicalstore_type: string | null
          physicalstore_type_temp: string | null
          prescription_required: boolean | null
          rating: number | null
          review_count: number | null
          reviewed_by_temp: string | null
          reviewed_date_temp: string | null
          shipping_info_temp: string | null
          shipping_regions_temp: string[] | null
          sold_through_us: boolean | null
          sold_through_us_temp: boolean | null
          state: string
          state_temp: string | null
          store_hours: Json | null
          submission_date_temp: string | null
          submission_status_temp: string | null
          submitted_by_temp: string | null
          tax_id_temp: string | null
          updated_at: string | null
          verified: boolean | null
          website: string | null
          website_temp: string | null
          wheelchair_accessible: boolean | null
          years_in_business_temp: string | null
          zip_code: string
          zip_code_temp: string | null
        }
        Insert: {
          additional_info_temp?: string | null
          address: string
          address_temp?: string | null
          admin_notes_temp?: string | null
          brand?: string | null
          business_license_temp?: string | null
          chain?: string | null
          city: string
          city_temp?: string | null
          claim_admin_notes_temp?: string | null
          claim_date_temp?: string | null
          claim_notes_temp?: string | null
          claim_reviewed_by_temp?: string | null
          claim_reviewed_date_temp?: string | null
          claim_status_temp?: string | null
          claim_verification_info_temp?: string | null
          claimed_by_temp?: string | null
          contact_person_temp?: string | null
          contact_role_temp?: string | null
          country?: string | null
          country_temp?: string | null
          created_at?: string | null
          delivery_days_max_temp?: number | null
          delivery_days_min_temp?: number | null
          description_temp?: string | null
          drive_through?: boolean | null
          id: string
          internal_or_external?: string | null
          internal_or_external_temp?: string | null
          is_active_temp?: boolean | null
          latitude?: number | null
          latitude_temp?: number | null
          longitude?: number | null
          longitude_temp?: number | null
          name: string
          name_temp?: string | null
          nrt_brands_carried?: Json | null
          nrt_brands_carried_temp?: string[] | null
          online?: boolean | null
          online_or_physical?: string | null
          online_or_physical_temp?: string | null
          onlinestore_type?: string | null
          onlinestore_type_temp?: string | null
          original_owner_verified_temp?: boolean | null
          parking_available?: boolean | null
          pharmacy_available?: boolean | null
          phone?: string | null
          phone_temp?: string | null
          physicalstore_type?: string | null
          physicalstore_type_temp?: string | null
          prescription_required?: boolean | null
          rating?: number | null
          review_count?: number | null
          reviewed_by_temp?: string | null
          reviewed_date_temp?: string | null
          shipping_info_temp?: string | null
          shipping_regions_temp?: string[] | null
          sold_through_us?: boolean | null
          sold_through_us_temp?: boolean | null
          state: string
          state_temp?: string | null
          store_hours?: Json | null
          submission_date_temp?: string | null
          submission_status_temp?: string | null
          submitted_by_temp?: string | null
          tax_id_temp?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
          website_temp?: string | null
          wheelchair_accessible?: boolean | null
          years_in_business_temp?: string | null
          zip_code: string
          zip_code_temp?: string | null
        }
        Update: {
          additional_info_temp?: string | null
          address?: string
          address_temp?: string | null
          admin_notes_temp?: string | null
          brand?: string | null
          business_license_temp?: string | null
          chain?: string | null
          city?: string
          city_temp?: string | null
          claim_admin_notes_temp?: string | null
          claim_date_temp?: string | null
          claim_notes_temp?: string | null
          claim_reviewed_by_temp?: string | null
          claim_reviewed_date_temp?: string | null
          claim_status_temp?: string | null
          claim_verification_info_temp?: string | null
          claimed_by_temp?: string | null
          contact_person_temp?: string | null
          contact_role_temp?: string | null
          country?: string | null
          country_temp?: string | null
          created_at?: string | null
          delivery_days_max_temp?: number | null
          delivery_days_min_temp?: number | null
          description_temp?: string | null
          drive_through?: boolean | null
          id?: string
          internal_or_external?: string | null
          internal_or_external_temp?: string | null
          is_active_temp?: boolean | null
          latitude?: number | null
          latitude_temp?: number | null
          longitude?: number | null
          longitude_temp?: number | null
          name?: string
          name_temp?: string | null
          nrt_brands_carried?: Json | null
          nrt_brands_carried_temp?: string[] | null
          online?: boolean | null
          online_or_physical?: string | null
          online_or_physical_temp?: string | null
          onlinestore_type?: string | null
          onlinestore_type_temp?: string | null
          original_owner_verified_temp?: boolean | null
          parking_available?: boolean | null
          pharmacy_available?: boolean | null
          phone?: string | null
          phone_temp?: string | null
          physicalstore_type?: string | null
          physicalstore_type_temp?: string | null
          prescription_required?: boolean | null
          rating?: number | null
          review_count?: number | null
          reviewed_by_temp?: string | null
          reviewed_date_temp?: string | null
          shipping_info_temp?: string | null
          shipping_regions_temp?: string[] | null
          sold_through_us?: boolean | null
          sold_through_us_temp?: boolean | null
          state?: string
          state_temp?: string | null
          store_hours?: Json | null
          submission_date_temp?: string | null
          submission_status_temp?: string | null
          submitted_by_temp?: string | null
          tax_id_temp?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
          website_temp?: string | null
          wheelchair_accessible?: boolean | null
          years_in_business_temp?: string | null
          zip_code?: string
          zip_code_temp?: string | null
        }
        Relationships: []
      }
      study_collaborators: {
        Row: {
          created_at: string | null
          id: string
          role: string
          study_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          study_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          study_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      study_documents: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          file_type: string | null
          file_url: string | null
          id: string
          study_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          study_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          study_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      study_notes: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          last_edited_by: string | null
          study_id: string
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          last_edited_by?: string | null
          study_id: string
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          last_edited_by?: string | null
          study_id?: string
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      study_questions: {
        Row: {
          answer: string | null
          answered_by: string | null
          asked_by: string | null
          created_at: string | null
          id: string
          question: string
          status: string | null
          study_id: string
        }
        Insert: {
          answer?: string | null
          answered_by?: string | null
          asked_by?: string | null
          created_at?: string | null
          id?: string
          question: string
          status?: string | null
          study_id: string
        }
        Update: {
          answer?: string | null
          answered_by?: string | null
          asked_by?: string | null
          created_at?: string | null
          id?: string
          question?: string
          status?: string | null
          study_id?: string
        }
        Relationships: []
      }
      study_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          study_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          study_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          study_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_listings: {
        Row: {
          asking_price: number | null
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          months_remaining: number
          original_price: number
          sale_price: number
          service_id: string | null
          service_name: string
          service_type: string
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          asking_price?: number | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          months_remaining: number
          original_price: number
          sale_price: number
          service_id?: string | null
          service_name: string
          service_type: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          asking_price?: number | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          months_remaining?: number
          original_price?: number
          sale_price?: number
          service_id?: string | null
          service_name?: string
          service_type?: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_listings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "ai_service"
            referencedColumns: ["id"]
          },
        ]
      }
      substance_logs: {
        Row: {
          created_at: string
          id: string
          location: string | null
          mood_after: number | null
          mood_before: number | null
          notes: string | null
          plan_id: string | null
          quantity: number | null
          social_context: string | null
          substance_type: string
          unit_of_measure: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          mood_after?: number | null
          mood_before?: number | null
          notes?: string | null
          plan_id?: string | null
          quantity?: number | null
          social_context?: string | null
          substance_type: string
          unit_of_measure?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          mood_after?: number | null
          mood_before?: number | null
          notes?: string | null
          plan_id?: string | null
          quantity?: number | null
          social_context?: string | null
          substance_type?: string
          unit_of_measure?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "substance_logs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "tapering_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      success_story: {
        Row: {
          created_at: string
          id: string
          is_anonymous: boolean
          story_content: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_anonymous?: boolean
          story_content: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_anonymous?: boolean
          story_content?: string
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      success_story_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_comment_id: string | null
          story_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          story_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          story_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "success_story_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "success_story_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "success_story_comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "success_story"
            referencedColumns: ["id"]
          },
        ]
      }
      success_story_likes: {
        Row: {
          created_at: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "success_story_likes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "success_story"
            referencedColumns: ["id"]
          },
        ]
      }
      support_articles: {
        Row: {
          category: string
          content: string
          created_at: string | null
          helpful_count: number | null
          id: string
          read_time: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          read_time?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          read_time?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      support_faqs: {
        Row: {
          answer: string
          category: string
          created_at: string | null
          helpful_count: number | null
          id: string
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      survey_instances: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          created_at: string | null
          enrollment_id: string | null
          id: string
          project_id: string | null
          scheduled_start_time: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          project_id?: string | null
          scheduled_start_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          project_id?: string | null
          scheduled_start_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_instances_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_instances_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_questions: {
        Row: {
          ai_config: Json | null
          allow_ai_assist: boolean | null
          allow_none: boolean | null
          allow_other: boolean | null
          allow_voice: boolean | null
          created_at: string | null
          id: string
          logic_rules: Json | null
          options: Json | null
          order_index: number | null
          piping_config: Json | null
          project_id: string | null
          question_config: Json | null
          question_description: string | null
          question_text: string
          question_type: string
          required: boolean | null
          response_required: string | null
          scoring_config: Json | null
          section_name: string | null
          validation_rules: Json | null
        }
        Insert: {
          ai_config?: Json | null
          allow_ai_assist?: boolean | null
          allow_none?: boolean | null
          allow_other?: boolean | null
          allow_voice?: boolean | null
          created_at?: string | null
          id?: string
          logic_rules?: Json | null
          options?: Json | null
          order_index?: number | null
          piping_config?: Json | null
          project_id?: string | null
          question_config?: Json | null
          question_description?: string | null
          question_text: string
          question_type: string
          required?: boolean | null
          response_required?: string | null
          scoring_config?: Json | null
          section_name?: string | null
          validation_rules?: Json | null
        }
        Update: {
          ai_config?: Json | null
          allow_ai_assist?: boolean | null
          allow_none?: boolean | null
          allow_other?: boolean | null
          allow_voice?: boolean | null
          created_at?: string | null
          id?: string
          logic_rules?: Json | null
          options?: Json | null
          order_index?: number | null
          piping_config?: Json | null
          project_id?: string | null
          question_config?: Json | null
          question_description?: string | null
          question_text?: string
          question_type?: string
          required?: boolean | null
          response_required?: string | null
          scoring_config?: Json | null
          section_name?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          answer_array: string[] | null
          answer_json: Json | null
          answer_number: number | null
          answer_text: string | null
          created_at: string | null
          enrollment_id: string | null
          id: string
          instance_id: string | null
          project_id: string | null
          question_id: string | null
        }
        Insert: {
          answer_array?: string[] | null
          answer_json?: Json | null
          answer_number?: number | null
          answer_text?: string | null
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          instance_id?: string | null
          project_id?: string | null
          question_id?: string | null
        }
        Update: {
          answer_array?: string[] | null
          answer_json?: Json | null
          answer_number?: number | null
          answer_text?: string | null
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          instance_id?: string | null
          project_id?: string | null
          question_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "survey_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      tapering_plans: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          reduction_schedule: Json | null
          start_date: string
          starting_dose: number
          substance: string
          target_date: string
          target_dose: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          reduction_schedule?: Json | null
          start_date: string
          starting_dose: number
          substance: string
          target_date: string
          target_dose: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          reduction_schedule?: Json | null
          start_date?: string
          starting_dose?: number
          substance?: string
          target_date?: string
          target_dose?: number
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          list_id: string | null
          priority: number | null
          status_order_index: number
          subtasks: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          list_id?: string | null
          priority?: number | null
          status_order_index?: number
          subtasks?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          list_id?: string | null
          priority?: number | null
          status_order_index?: number
          subtasks?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["team_member_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["team_member_role"]
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["team_member_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          app_name: string | null
          author: string
          created_at: string
          id: string
          quote: string
          title: string | null
        }
        Insert: {
          app_name?: string | null
          author: string
          created_at?: string
          id?: string
          quote: string
          title?: string | null
        }
        Update: {
          app_name?: string | null
          author?: string
          created_at?: string
          id?: string
          quote?: string
          title?: string | null
        }
        Relationships: []
      }
      thought_challenges: {
        Row: {
          balanced_thought: string
          cognitive_distortion: string
          created_at: string | null
          evidence_against: string | null
          evidence_for: string | null
          id: string
          mood_after: number
          mood_before: number
          negative_thought: string
          user_id: string
        }
        Insert: {
          balanced_thought: string
          cognitive_distortion: string
          created_at?: string | null
          evidence_against?: string | null
          evidence_for?: string | null
          id?: string
          mood_after: number
          mood_before: number
          negative_thought: string
          user_id: string
        }
        Update: {
          balanced_thought?: string
          cognitive_distortion?: string
          created_at?: string | null
          evidence_against?: string | null
          evidence_for?: string | null
          id?: string
          mood_after?: number
          mood_before?: number
          negative_thought?: string
          user_id?: string
        }
        Relationships: []
      }
      threads: {
        Row: {
          author_id: string | null
          created_at: string | null
          forum_id: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          created_at?: string | null
          forum_id?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          created_at?: string | null
          forum_id?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "threads_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          created_at: string
          details: string | null
          due_date: string | null
          id: string
          is_completed: boolean
          parent_id: string | null
          priority: number
          sort_order: number | null
          tags: string[] | null
          task: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          parent_id?: string | null
          priority?: number
          sort_order?: number | null
          tags?: string[] | null
          task: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          parent_id?: string | null
          priority?: number
          sort_order?: number | null
          tags?: string[] | null
          task?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "todos_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "todos"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          buyer_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          listing_id: string | null
          notes: string | null
          payment_intent_id: string | null
          payment_status: string | null
          refunded_at: string | null
          seller_id: string | null
          transfer_status: string | null
        }
        Insert: {
          amount: number
          buyer_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          notes?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          refunded_at?: string | null
          seller_id?: string | null
          transfer_status?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          notes?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          refunded_at?: string | null
          seller_id?: string | null
          transfer_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "subscription_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      trigger_item: {
        Row: {
          category: string | null
          coping_strategy: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          trigger_type: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          coping_strategy?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          trigger_type?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          coping_strategy?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          trigger_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trigger_patterns: {
        Row: {
          created_at: string | null
          id: string
          location_patterns: string[] | null
          time_patterns: Json | null
          trigger_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location_patterns?: string[] | null
          time_patterns?: Json | null
          trigger_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location_patterns?: string[] | null
          time_patterns?: Json | null
          trigger_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievement: {
        Row: {
          achievement_id: string | null
          created_at: string | null
          earned_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          created_at?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          created_at?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievement_progress: {
        Row: {
          achievement_id: string
          created_at: string | null
          progress: number
          unlocked: boolean
          unlocked_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          progress?: number
          unlocked?: boolean
          unlocked_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          progress?: number
          unlocked?: boolean
          unlocked_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_ai_preferences: {
        Row: {
          id: string
          user_id: string
        }
        Insert: {
          id?: string
          user_id: string
        }
        Update: {
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badge: {
        Row: {
          badge_description: string | null
          badge_icon: string | null
          badge_name: string | null
          badge_slug: string | null
          badge_type: string | null
          earned_at: string | null
          id: string
          is_completed: boolean | null
          progress_current: number | null
          progress_target: number | null
          user_id: string | null
        }
        Insert: {
          badge_description?: string | null
          badge_icon?: string | null
          badge_name?: string | null
          badge_slug?: string | null
          badge_type?: string | null
          earned_at?: string | null
          id?: string
          is_completed?: boolean | null
          progress_current?: number | null
          progress_target?: number | null
          user_id?: string | null
        }
        Update: {
          badge_description?: string | null
          badge_icon?: string | null
          badge_name?: string | null
          badge_slug?: string | null
          badge_type?: string | null
          earned_at?: string | null
          id?: string
          is_completed?: boolean | null
          progress_current?: number | null
          progress_target?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_blocked_urls: {
        Row: {
          created_at: string
          id: string
          url_pattern: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          url_pattern: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          url_pattern?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_content_preferences: {
        Row: {
          age_verified: boolean | null
          created_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age_verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age_verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_custom_techniques: {
        Row: {
          created_at: string
          exhale_duration: number
          hold1_duration: number
          hold2_duration: number
          id: string
          inhale_duration: number
          name: string
          rounds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exhale_duration: number
          hold1_duration: number
          hold2_duration: number
          id?: string
          inhale_duration: number
          name: string
          rounds: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exhale_duration?: number
          hold1_duration?: number
          hold2_duration?: number
          id?: string
          inhale_duration?: number
          name?: string
          rounds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_daily_task_completions: {
        Row: {
          completed_at: string | null
          completion_date: string
          id: string
          mood_after: number | null
          mood_before: number | null
          notes: string | null
          progress_id: string | null
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completion_date: string
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          notes?: string | null
          progress_id?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completion_date?: string
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          notes?: string | null
          progress_id?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_task_completions_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "user_plan_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_daily_task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "plan_daily_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_device: {
        Row: {
          created_at: string | null
          device_name: string | null
          fcm_token: string
          id: string
          is_active: boolean | null
          platform: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_name?: string | null
          fcm_token: string
          id?: string
          is_active?: boolean | null
          platform: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_name?: string | null
          fcm_token?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_favorite: {
        Row: {
          created_at: string | null
          id: string
          technique_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          technique_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          technique_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_favorite_meditations: {
        Row: {
          created_at: string
          meditation_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          meditation_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          meditation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_meditations_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditation"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Relationships: []
      }
      user_gamification_stats: {
        Row: {
          created_at: string
          current_level: number
          current_points: number
          current_streak: number
          last_streak_check_date: string | null
          longest_streak: number
          tool_usage_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_points?: number
          current_streak?: number
          last_streak_check_date?: string | null
          longest_streak?: number
          tool_usage_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          current_points?: number
          current_streak?: number
          last_streak_check_date?: string | null
          longest_streak?: number
          tool_usage_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goal: {
        Row: {
          ai_personalized: boolean | null
          cost_per_unit: number | null
          created_at: string
          daily_step_goal: number | null
          fella_control_cost_per_drink: number | null
          fella_control_product_type: string | null
          fella_control_reduction_target_percent: number | null
          fella_control_typical_daily_drinks: number | null
          goal_type: string
          id: string
          method: string
          method_details: Json | null
          moderation_start_date: string | null
          motivation: string | null
          plan_content: string | null
          plan_generated_at: string | null
          plan_method_id: string | null
          product_type: string | null
          quit_date: string | null
          reduction_target_percent: number | null
          status: string
          timeline_days: number | null
          title: string | null
          typical_daily_usage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_personalized?: boolean | null
          cost_per_unit?: number | null
          created_at?: string
          daily_step_goal?: number | null
          fella_control_cost_per_drink?: number | null
          fella_control_product_type?: string | null
          fella_control_reduction_target_percent?: number | null
          fella_control_typical_daily_drinks?: number | null
          goal_type: string
          id?: string
          method: string
          method_details?: Json | null
          moderation_start_date?: string | null
          motivation?: string | null
          plan_content?: string | null
          plan_generated_at?: string | null
          plan_method_id?: string | null
          product_type?: string | null
          quit_date?: string | null
          reduction_target_percent?: number | null
          status?: string
          timeline_days?: number | null
          title?: string | null
          typical_daily_usage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_personalized?: boolean | null
          cost_per_unit?: number | null
          created_at?: string
          daily_step_goal?: number | null
          fella_control_cost_per_drink?: number | null
          fella_control_product_type?: string | null
          fella_control_reduction_target_percent?: number | null
          fella_control_typical_daily_drinks?: number | null
          goal_type?: string
          id?: string
          method?: string
          method_details?: Json | null
          moderation_start_date?: string | null
          motivation?: string | null
          plan_content?: string | null
          plan_generated_at?: string | null
          plan_method_id?: string | null
          product_type?: string | null
          quit_date?: string | null
          reduction_target_percent?: number | null
          status?: string
          timeline_days?: number | null
          title?: string | null
          typical_daily_usage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_goal_plan_method_id_fkey"
            columns: ["plan_method_id"]
            isOneToOne: false
            referencedRelation: "quit_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      user_group_activity_status: {
        Row: {
          created_at: string
          group_id: string
          id: string
          last_viewed_calendar_at: string | null
          last_viewed_contacts_at: string | null
          last_viewed_dashboard_at: string | null
          last_viewed_discussion_at: string | null
          last_viewed_files_at: string | null
          last_viewed_medications_at: string | null
          last_viewed_members_at: string | null
          last_viewed_notes_at: string | null
          last_viewed_support_at: string | null
          last_viewed_tasks_at: string | null
          last_viewed_updates_at: string | null
          last_viewed_well_wishes_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          last_viewed_calendar_at?: string | null
          last_viewed_contacts_at?: string | null
          last_viewed_dashboard_at?: string | null
          last_viewed_discussion_at?: string | null
          last_viewed_files_at?: string | null
          last_viewed_medications_at?: string | null
          last_viewed_members_at?: string | null
          last_viewed_notes_at?: string | null
          last_viewed_support_at?: string | null
          last_viewed_tasks_at?: string | null
          last_viewed_updates_at?: string | null
          last_viewed_well_wishes_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          last_viewed_calendar_at?: string | null
          last_viewed_contacts_at?: string | null
          last_viewed_dashboard_at?: string | null
          last_viewed_discussion_at?: string | null
          last_viewed_files_at?: string | null
          last_viewed_medications_at?: string | null
          last_viewed_members_at?: string | null
          last_viewed_notes_at?: string | null
          last_viewed_support_at?: string | null
          last_viewed_tasks_at?: string | null
          last_viewed_updates_at?: string | null
          last_viewed_well_wishes_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_learning_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          module_id: string
          progress_percentage: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id: string
          progress_percentage?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id?: string
          progress_percentage?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_module"
            referencedColumns: ["id"]
          },
        ]
      }
      user_marketplace_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string
          id: string
          rating: number | null
          total_purchases: number | null
          total_sales: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name: string
          id?: string
          rating?: number | null
          total_purchases?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          rating?: number | null
          total_purchases?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_plan_progress: {
        Row: {
          actual_quit_date: string | null
          created_at: string | null
          current_day: number | null
          current_phase: number | null
          expected_quit_date: string | null
          goal_id: string | null
          id: string
          last_active_date: string | null
          method_id: string | null
          notes: string | null
          plan_start_date: string
          status: string | null
          streak_days: number | null
          total_coins_earned: number | null
          total_tasks_completed: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actual_quit_date?: string | null
          created_at?: string | null
          current_day?: number | null
          current_phase?: number | null
          expected_quit_date?: string | null
          goal_id?: string | null
          id?: string
          last_active_date?: string | null
          method_id?: string | null
          notes?: string | null
          plan_start_date: string
          status?: string | null
          streak_days?: number | null
          total_coins_earned?: number | null
          total_tasks_completed?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actual_quit_date?: string | null
          created_at?: string | null
          current_day?: number | null
          current_phase?: number | null
          expected_quit_date?: string | null
          goal_id?: string | null
          id?: string
          last_active_date?: string | null
          method_id?: string | null
          notes?: string | null
          plan_start_date?: string
          status?: string | null
          streak_days?: number | null
          total_coins_earned?: number | null
          total_tasks_completed?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_plan_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_plan_progress_method_id_fkey"
            columns: ["method_id"]
            isOneToOne: false
            referencedRelation: "quit_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      user_point: {
        Row: {
          current_points: number | null
          last_updated: string | null
          user_id: string
        }
        Insert: {
          current_points?: number | null
          last_updated?: string | null
          user_id: string
        }
        Update: {
          current_points?: number | null
          last_updated?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preference: {
        Row: {
          ai_gentleness_preference: number | null
          allow_data_collection: boolean | null
          created_at: string | null
          dashboard_widgets: string[] | null
          data_units: string | null
          enable_animations: boolean | null
          enable_sounds: boolean | null
          id: string
          language: string | null
          notification_cravings: boolean | null
          notification_logs: boolean | null
          notification_milestones: boolean | null
          preferred_ai_salutation: string | null
          share_activity: boolean | null
          show_online_status: boolean | null
          show_profile: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_gentleness_preference?: number | null
          allow_data_collection?: boolean | null
          created_at?: string | null
          dashboard_widgets?: string[] | null
          data_units?: string | null
          enable_animations?: boolean | null
          enable_sounds?: boolean | null
          id?: string
          language?: string | null
          notification_cravings?: boolean | null
          notification_logs?: boolean | null
          notification_milestones?: boolean | null
          preferred_ai_salutation?: string | null
          share_activity?: boolean | null
          show_online_status?: boolean | null
          show_profile?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_gentleness_preference?: number | null
          allow_data_collection?: boolean | null
          created_at?: string | null
          dashboard_widgets?: string[] | null
          data_units?: string | null
          enable_animations?: boolean | null
          enable_sounds?: boolean | null
          id?: string
          language?: string | null
          notification_cravings?: boolean | null
          notification_logs?: boolean | null
          notification_milestones?: boolean | null
          preferred_ai_salutation?: string | null
          share_activity?: boolean | null
          show_online_status?: boolean | null
          show_profile?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_product_list_items: {
        Row: {
          added_at: string | null
          display_order: number | null
          id: string
          list_id: string
          notes: string | null
          product_id: string
        }
        Insert: {
          added_at?: string | null
          display_order?: number | null
          id?: string
          list_id: string
          notes?: string | null
          product_id: string
        }
        Update: {
          added_at?: string | null
          display_order?: number | null
          id?: string
          list_id?: string
          notes?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_product_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "user_product_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_product_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      user_product_lists: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          list_type: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          list_type?: string | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          list_type?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profile_settings: {
        Row: {
          ai_gentleness: number | null
          ai_gentleness_preference_fella_quit: number | null
          ai_salutation: string | null
          ai_salutation_fella_quit: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_gentleness?: number | null
          ai_gentleness_preference_fella_quit?: number | null
          ai_salutation?: string | null
          ai_salutation_fella_quit?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_gentleness?: number | null
          ai_gentleness_preference_fella_quit?: number | null
          ai_salutation?: string | null
          ai_salutation_fella_quit?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          ai_gentleness: number | null
          ai_nickname: string | null
          ai_user_nickname: string | null
          ai_user_title: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          emergency_contact: string | null
          full_name: string | null
          id: string
          is_caregiver: boolean | null
          is_checkiner: boolean | null
          is_companion: boolean | null
          is_professional: boolean | null
          linked_primary_caregiver_id: string | null
          location: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          phone: string | null
          pomodoro_focus_duration: number | null
          pomodoro_long_break_duration: number | null
          pomodoro_short_break_duration: number | null
          professional_details: Json | null
          pronouns: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          ai_gentleness?: number | null
          ai_nickname?: string | null
          ai_user_nickname?: string | null
          ai_user_title?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          id: string
          is_caregiver?: boolean | null
          is_checkiner?: boolean | null
          is_companion?: boolean | null
          is_professional?: boolean | null
          linked_primary_caregiver_id?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          pomodoro_focus_duration?: number | null
          pomodoro_long_break_duration?: number | null
          pomodoro_short_break_duration?: number | null
          professional_details?: Json | null
          pronouns?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          ai_gentleness?: number | null
          ai_nickname?: string | null
          ai_user_nickname?: string | null
          ai_user_title?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          id?: string
          is_caregiver?: boolean | null
          is_checkiner?: boolean | null
          is_companion?: boolean | null
          is_professional?: boolean | null
          linked_primary_caregiver_id?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          pomodoro_focus_duration?: number | null
          pomodoro_long_break_duration?: number | null
          pomodoro_short_break_duration?: number | null
          professional_details?: Json | null
          pronouns?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_linked_primary_caregiver_id_fkey"
            columns: ["linked_primary_caregiver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_program_progress: {
        Row: {
          completed_at: string | null
          last_completed_step_number: number
          program_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["program_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          last_completed_step_number?: number
          program_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          last_completed_step_number?: number
          program_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_program_progress_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          created_at: string | null
          id: string
          quit_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          quit_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          quit_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_reward: {
        Row: {
          id: string
          redeemed_at: string | null
          reward_id: string
          user_id: string
        }
        Insert: {
          id?: string
          redeemed_at?: string | null
          reward_id: string
          user_id: string
        }
        Update: {
          id?: string
          redeemed_at?: string | null
          reward_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      user_setting: {
        Row: {
          ai_gentleness: number | null
          ai_greeting_name: string | null
          created_at: string
          daily_alcohol_goal_g: number | null
          daily_caffeine_goal_mg: number | null
          daily_calories_goal: number | null
          daily_water_goal_ml: number | null
          data_sharing: boolean | null
          email_reminders: boolean | null
          language: string | null
          notifications_enabled: boolean | null
          privacy_mode: boolean | null
          theme: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_gentleness?: number | null
          ai_greeting_name?: string | null
          created_at?: string
          daily_alcohol_goal_g?: number | null
          daily_caffeine_goal_mg?: number | null
          daily_calories_goal?: number | null
          daily_water_goal_ml?: number | null
          data_sharing?: boolean | null
          email_reminders?: boolean | null
          language?: string | null
          notifications_enabled?: boolean | null
          privacy_mode?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_gentleness?: number | null
          ai_greeting_name?: string | null
          created_at?: string
          daily_alcohol_goal_g?: number | null
          daily_caffeine_goal_mg?: number | null
          daily_calories_goal?: number | null
          daily_water_goal_ml?: number | null
          data_sharing?: boolean | null
          email_reminders?: boolean | null
          language?: string | null
          notifications_enabled?: boolean | null
          privacy_mode?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_slip_logs: {
        Row: {
          created_at: string
          date: string
          id: string
          slip_up_entries: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          slip_up_entries?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          slip_up_entries?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_strategies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_tasks: {
        Row: {
          actual_minutes: number | null
          category: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_minutes: number | null
          id: string
          is_complete: boolean | null
          parent_task_id: string | null
          priority: string
          project_id: string | null
          status: string
          status_order_index: number
          subtask_order: number | null
          team_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_minutes?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_minutes?: number | null
          id?: string
          is_complete?: boolean | null
          parent_task_id?: string | null
          priority?: string
          project_id?: string | null
          status?: string
          status_order_index?: number
          subtask_order?: number | null
          team_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_minutes?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_minutes?: number | null
          id?: string
          is_complete?: boolean | null
          parent_task_id?: string | null
          priority?: string
          project_id?: string | null
          status?: string
          status_order_index?: number
          subtask_order?: number | null
          team_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "user_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tool_usages: {
        Row: {
          created_at: string
          id: number
          metadata: Json | null
          tool_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          metadata?: Json | null
          tool_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          metadata?: Json | null
          tool_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_trigger_strategy_map: {
        Row: {
          created_at: string
          effectiveness_rating: number | null
          id: string
          notes: string | null
          strategy_id: string
          trigger_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          notes?: string | null
          strategy_id: string
          trigger_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          notes?: string | null
          strategy_id?: string
          trigger_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_trigger_strategy_map_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "coping_strategy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_trigger_strategy_map_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "trigger_item"
            referencedColumns: ["id"]
          },
        ]
      }
      user_triggers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_wearable_devices: {
        Row: {
          battery_level: number | null
          created_at: string | null
          device_id: string
          device_name: string
          device_type: string
          id: string
          is_connected: boolean | null
          last_sync: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          battery_level?: number | null
          created_at?: string | null
          device_id: string
          device_name: string
          device_type: string
          id?: string
          is_connected?: boolean | null
          last_sync?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          battery_level?: number | null
          created_at?: string | null
          device_id?: string
          device_name?: string
          device_type?: string
          id?: string
          is_connected?: boolean | null
          last_sync?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_wishlists: {
        Row: {
          added_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          availability: Json | null
          avatar_url: string | null
          background_checked: boolean | null
          bio: string | null
          certifications: string[] | null
          created_at: string | null
          email: string
          experience_years: number | null
          full_name: string
          hourly_rate: number | null
          id: string
          location: string | null
          phone: string | null
          rating: number | null
          role: string
          specialties: string[] | null
          total_reviews: number | null
          updated_at: string | null
          username: string | null
          verified: boolean | null
        }
        Insert: {
          availability?: Json | null
          avatar_url?: string | null
          background_checked?: boolean | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          email: string
          experience_years?: number | null
          full_name: string
          hourly_rate?: number | null
          id: string
          location?: string | null
          phone?: string | null
          rating?: number | null
          role: string
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          username?: string | null
          verified?: boolean | null
        }
        Update: {
          availability?: Json | null
          avatar_url?: string | null
          background_checked?: boolean | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          email?: string
          experience_years?: number | null
          full_name?: string
          hourly_rate?: number | null
          id?: string
          location?: string | null
          phone?: string | null
          rating?: number | null
          role?: string
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          username?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      vendor_huntcoin_settings: {
        Row: {
          accepts_huntcoin: boolean | null
          created_at: string | null
          huntcoin_discount_percentage: number | null
          id: string
          updated_at: string | null
          vendor_user_id: string | null
        }
        Insert: {
          accepts_huntcoin?: boolean | null
          created_at?: string | null
          huntcoin_discount_percentage?: number | null
          id?: string
          updated_at?: string | null
          vendor_user_id?: string | null
        }
        Update: {
          accepts_huntcoin?: boolean | null
          created_at?: string | null
          huntcoin_discount_percentage?: number | null
          id?: string
          updated_at?: string | null
          vendor_user_id?: string | null
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          document_type: string
          document_url: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          document_type: string
          document_url: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          document_type?: string
          document_url?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          uploaded_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      verification_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      verification_status: {
        Row: {
          address_verified: boolean | null
          created_at: string | null
          email_verified: boolean | null
          id: string
          identity_verified: boolean | null
          overall_status: string
          phone_number: string | null
          phone_verified: boolean | null
          trust_score: number
          updated_at: string | null
          user_id: string | null
          verification_level: number
          verification_notes: string | null
        }
        Insert: {
          address_verified?: boolean | null
          created_at?: string | null
          email_verified?: boolean | null
          id?: string
          identity_verified?: boolean | null
          overall_status?: string
          phone_number?: string | null
          phone_verified?: boolean | null
          trust_score?: number
          updated_at?: string | null
          user_id?: string | null
          verification_level?: number
          verification_notes?: string | null
        }
        Update: {
          address_verified?: boolean | null
          created_at?: string | null
          email_verified?: boolean | null
          id?: string
          identity_verified?: boolean | null
          overall_status?: string
          phone_number?: string | null
          phone_verified?: boolean | null
          trust_score?: number
          updated_at?: string | null
          user_id?: string | null
          verification_level?: number
          verification_notes?: string | null
        }
        Relationships: []
      }
      web_tools: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          published: boolean | null
          route: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          published?: boolean | null
          route: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          published?: boolean | null
          route?: string
          updated_at?: string
        }
        Relationships: []
      }
      well_wishes: {
        Row: {
          author_id: string | null
          created_at: string | null
          group_id: string | null
          id: string
          is_public: boolean | null
          message: string
          recipient_id: string | null
        }
        Insert: {
          author_id?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_public?: boolean | null
          message: string
          recipient_id?: string | null
        }
        Update: {
          author_id?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_public?: boolean | null
          message?: string
          recipient_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "well_wishes_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_group"
            referencedColumns: ["id"]
          },
        ]
      }
      wellness_check_in: {
        Row: {
          craving_intensity: number | null
          created_at: string | null
          id: string
          mood_score: number | null
          trigger_encountered: boolean | null
          user_id: string
        }
        Insert: {
          craving_intensity?: number | null
          created_at?: string | null
          id?: string
          mood_score?: number | null
          trigger_encountered?: boolean | null
          user_id: string
        }
        Update: {
          craving_intensity?: number | null
          created_at?: string | null
          id?: string
          mood_score?: number | null
          trigger_encountered?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          added_at: string | null
          id: string
          notes: string | null
          priority: number | null
          product_id: string | null
          wishlist_id: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          product_id?: string | null
          wishlist_id?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          product_id?: string | null
          wishlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          is_public: boolean | null
          name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      withdrawal_symptoms: {
        Row: {
          coping_methods: string[] | null
          created_at: string | null
          duration_hours: number | null
          id: string
          intensity: number
          notes: string | null
          symptom_type: string
          user_id: string
        }
        Insert: {
          coping_methods?: string[] | null
          created_at?: string | null
          duration_hours?: number | null
          id?: string
          intensity: number
          notes?: string | null
          symptom_type: string
          user_id: string
        }
        Update: {
          coping_methods?: string[] | null
          created_at?: string | null
          duration_hours?: number | null
          id?: string
          intensity?: number
          notes?: string | null
          symptom_type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      daily_craving_analysis: {
        Row: {
          avg_intensity: number | null
          coping_mechanisms: string[] | null
          date: string | null
          triggers: string[] | null
          user_id: string | null
        }
        Relationships: []
      }
      daily_holistic_metrics: {
        Row: {
          avg_energy: number | null
          avg_focus: number | null
          avg_mood: number | null
          avg_sleep_hours: number | null
          avg_sleep_quality: number | null
          date: string | null
          user_id: string | null
        }
        Relationships: []
      }
      deprecated_daily_nicotine_use_view: {
        Row: {
          date: string | null
          product_type: string | null
          total_quantity: number | null
          user_id: string | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      __cc_singularize_identifier: { Args: { ident: string }; Returns: string }
      __cc_singularize_token: { Args: { tok: string }; Returns: string }
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      accept_care_group_invitation: {
        Args: { p_invitation_token: string }
        Returns: undefined
      }
      add_calendar_event: { Args: { p_event: Json }; Returns: Json }
      add_social_post_comment: {
        Args: { p_author_id: string; p_content: string; p_post_id: string }
        Returns: undefined
      }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      are_users_in_same_care_group: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
      }
      assign_selected_group_tasks: {
        Args: {
          assignee_user_ids: string[]
          p_group_id: string
          task_ids: string[]
        }
        Returns: undefined
      }
      auto_approve_pending_products: { Args: never; Returns: undefined }
      award_points: {
        Args: { p_points_amount: number; p_user_id: string }
        Returns: undefined
      }
      batch_update_products: {
        Args: { product_ids: string[]; updates: Json }
        Returns: undefined
      }
      calculate_next_due_date: {
        Args: { current_due_date: string; recurrence_pattern: Json }
        Returns: string
      }
      can_access_shared_content: {
        Args: {
          p_content_group_id: string
          p_content_shared_to_category_ids: string[]
          p_content_shared_to_individual_ids: string[]
          p_user_id: string
        }
        Returns: boolean
      }
      check_and_award_streak_achievements: {
        Args: { p_current_streak: number; p_user_id: string }
        Returns: undefined
      }
      check_payment_access: { Args: { p_payment_id: string }; Returns: boolean }
      check_users_share_care_group: {
        Args: { p_user_id_1: string; p_user_id_2: string }
        Returns: boolean
      }
      claim_fella_control_database_reward: {
        Args: {
          p_points_to_deduct: number
          p_reward_id: string
          p_user_id: string
        }
        Returns: {
          claimed_at: string
          created_at: string
          id: string
          notes: string | null
          points_redeemed: number
          reward_id: string | null
          status: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "fella_control_claimed_rewards"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_fella_control_tangible_reward: {
        Args: {
          p_points_to_deduct: number
          p_reward_id: string
          p_user_id: string
        }
        Returns: {
          claimed_at: string
          id: string
          points_redeemed: number
          reward_id: string
          status: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "claimed_reward"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      claim_reward: {
        Args: { reward_id_param: string; user_id_param: string }
        Returns: {
          claimed_reward_id: string
          message: string
          success: boolean
        }[]
      }
      clear_ad_blocking_stats: { Args: never; Returns: undefined }
      create_announcement: {
        Args: {
          p_author_id: string
          p_content: string
          p_group_id: string
          p_is_pinned: boolean
          p_title: string
          p_visible_to_category_ids: string[]
        }
        Returns: undefined
      }
      create_product: {
        Args: {
          p_category_id: string
          p_description: string
          p_gallery_urls: string[]
          p_is_coming_soon: boolean
          p_launch_date: string
          p_logo_url: string
          p_maker_comment: string
          p_makers: string[]
          p_name: string
          p_owner_id: string
          p_pricing_model: string
          p_specific_attributes: Json
          p_tagline: string
          p_tags: string[]
          p_website_url: string
        }
        Returns: {
          category_id: string
          created_at: string
          description: string
          gallery_urls: string[]
          id: string
          is_coming_soon: boolean
          launch_date: string
          logo_url: string
          name: string
          owner_id: string
          pricing_model: string
          slug: string
          specific_attributes: Json
          status: string
          tagline: string
          website_url: string
        }[]
      }
      decrement_helpful_votes: {
        Args: { review_id: string }
        Returns: undefined
      }
      delete_announcement: { Args: { p_id: string }; Returns: undefined }
      delete_comment: { Args: { comment_id: string }; Returns: undefined }
      delete_fella_control_craving_logs_by_date: {
        Args: { p_log_date: string; p_user_id: string }
        Returns: undefined
      }
      delete_group_message: {
        Args: { p_id: string; p_user_id: string }
        Returns: undefined
      }
      delete_social_post_comment: { Args: { p_id: string }; Returns: undefined }
      delete_user_account: { Args: { p_user_id: string }; Returns: undefined }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      earth: { Args: never; Returns: number }
      enablelongtransactions: { Args: never; Returns: string }
      ensure_update_updated_at_column_exists: {
        Args: never
        Returns: undefined
      }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      feature_product_and_notify: {
        Args: { p_admin_user_id: string; p_product_id: string }
        Returns: undefined
      }
      fella_control_check_and_award_streak_achievements: {
        Args: { p_current_streak: number; p_user_id: string }
        Returns: {
          awarded_achievement_id: string
          awarded_description: string
          awarded_name: string
          awarded_points: number
        }[]
      }
      fella_control_get_user_streak: {
        Args: { p_user_id: string }
        Returns: {
          current_streak: number
          longest_streak: number
        }[]
      }
      fella_control_increment_user_points: {
        Args: { points_to_add: number; user_id_param: string }
        Returns: undefined
      }
      fella_control_update_user_streak: {
        Args: { p_user_id: string }
        Returns: number
      }
      generate_affiliate_code: { Args: never; Returns: string }
      generate_next_recurring_task: {
        Args: { task_id: string }
        Returns: undefined
      }
      generate_next_recurring_tasks: { Args: never; Returns: undefined }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_admin_dashboard_stats: { Args: never; Returns: Json }
      get_all_care_group_categories: {
        Args: never
        Returns: {
          description: string
          id: string
          name: string
        }[]
      }
      get_all_distinct_attributes_for_provider_type: {
        Args: { p_provider_type: string }
        Returns: {
          accepted_insurance: string[]
          care_recipient_cognitive_status: string[]
          care_recipient_communication_abilities: string[]
          care_recipient_medical_conditions: string[]
          care_recipient_mobility_status: string[]
          care_recipient_symptoms: string[]
          interests: string[]
          languages: string[]
          specialties: string[]
        }[]
      }
      get_all_distinct_attributes_proxy: {
        Args: { p_provider_type: string }
        Returns: Json
      }
      get_all_users_for_admin: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_admin: boolean
          role: string
        }[]
      }
      get_approved_products_direct: {
        Args: never
        Returns: {
          comment_count: number
          created_at: string
          current_price: number
          description: string
          gallery_image_urls: string[]
          id: string
          is_featured: boolean
          launch_date: string
          lifetime_access: boolean
          logo_url: string
          name: string
          original_price: number
          pricing_model: string
          pricing_type: string
          slug: string
          status: string
          tagline: string
          thumbnail_url: string
          updated_at: string
          user_id: string
          views_count: number
          vote_count: number
          website_url: string
        }[]
      }
      get_care_group_calendar_events: {
        Args: {
          group_id_param: string
          month_param: number
          recipient_id_param: string
          year_param: number
        }
        Returns: {
          events: Json
        }[]
      }
      get_caregivers: {
        Args: never
        Returns: {
          availability_summary: string
          average_rating: number
          bio: string
          contact_email: string
          contact_phone: string
          full_name: string
          has_dementia_experience: boolean
          hourly_rate: number
          id: string
          is_cpr_certified: boolean
          is_first_aid_certified: boolean
          is_verified: boolean
          location: string
          profile_picture_url: string
          provider_type: string
          reviews_count: number
          specialties: string[]
          user_id: string
          willing_to_light_housekeep: boolean
          willing_to_meal_prep: boolean
          years_of_experience: number
        }[]
      }
      get_collection_details: {
        Args: { p_collection_id: string; p_current_user_id: string }
        Returns: Json
      }
      get_collections: {
        Args: { p_filter?: string; p_user_id?: string }
        Returns: {
          cover_image_url: string
          created_at: string
          curator: Json
          description: string
          followers_count: number
          id: string
          is_public: boolean
          name: string
          products_count: number
          updated_at: string
          user_id: string
        }[]
      }
      get_companions: {
        Args: never
        Returns: {
          availability_summary: string
          average_rating: number
          bio: string
          contact_email: string
          contact_phone: string
          full_name: string
          has_dementia_experience: boolean
          hourly_rate: number
          id: string
          is_cpr_certified: boolean
          is_first_aid_certified: boolean
          is_verified: boolean
          location: string
          profile_picture_url: string
          provider_type: string
          reviews_count: number
          specialties: string[]
          user_id: string
          willing_to_light_housekeep: boolean
          willing_to_meal_prep: boolean
          years_of_experience: number
        }[]
      }
      get_conversation_by_exact_participants: {
        Args: { p_participant_ids: string[] }
        Returns: {
          conversation_id: string
        }[]
      }
      get_dashboard_stats: { Args: { p_user_id: string }; Returns: Json }
      get_direct_messages_for_conversation: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_user_id1: string
          p_user_id2: string
        }
        Returns: {
          attachments: Json
          created_at: string
          id: string
          message_content: string
          read_at: string
          receiver_id: string
          sender_id: string
          updated_at: string
        }[]
      }
      get_discussion_by_id: {
        Args: { p_discussion_id: string; p_user_id?: string }
        Returns: {
          category_slug: string
          content: string
          created_at: string
          has_voted: boolean
          id: string
          reply_count: number
          title: string
          upvotes: number
          user_avatar: string
          user_id: string
          user_name: string
        }[]
      }
      get_discussions_with_details: {
        Args: {
          p_category_slug: string
          p_page: number
          p_per_page: number
          p_user_id: string
        }
        Returns: {
          author: Json
          category: Json
          comment_count: number
          created_at: string
          id: string
          title: string
          user_voted: boolean
          vote_count: number
        }[]
      }
      get_distinct_languages_for_provider_type: {
        Args: { p_provider_type: string }
        Returns: {
          language: string
        }[]
      }
      get_distinct_provider_attributes: {
        Args: { p_column_name: string; p_provider_type: string }
        Returns: {
          attribute: string
        }[]
      }
      get_facility_dashboard_stats: {
        Args: { p_user_id: string }
        Returns: {
          maintenance_requests: number
          pending_applications: number
          total_facilities: number
          upcoming_bookings: number
        }[]
      }
      get_fella_control_nearby_resources: {
        Args: { lat: number; lng: number; radius: number }
        Returns: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          geom: unknown
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          resource_type: string | null
          state: string | null
          website: string | null
          zip_code: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "fella_control_local_resources"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_fella_control_random_quote: {
        Args: never
        Returns: {
          author: string
          id: number
          quote_text: string
        }[]
      }
      get_fella_quit_nearby_support_resources: {
        Args: {
          limit_count?: number
          resource_types_filter?: string[]
          search_radius_meters?: number
          specialties_filter?: string[]
          user_latitude: number
          user_longitude: number
        }
        Returns: {
          accessibility_info: string
          added_by: string
          address: string
          city: string
          contact_info: Json
          cost_details: string
          country: string
          created_at: string
          description: string
          distance_meters: number
          id: string
          is_online_resource: boolean
          languages_spoken: string[]
          last_verified_at: string
          latitude: number
          location: unknown
          longitude: number
          name: string
          operating_hours: Json
          postal_code: string
          resource_type: string
          specialties: string[]
          state_province: string
          target_audience: string
          verified: boolean
        }[]
      }
      get_gig_by_id: {
        Args: { gig_id: string }
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "hfh_gig"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_gig_json: { Args: { gig_id: string }; Returns: Json }
      get_group_dashboard_data: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: {
          all_care_recipients: Json
          care_recipient_status: Json
          due_tasks: Json
          group_description: string
          group_name: string
          pending_join_request_count: number
          primary_care_recipient_details: Json
          total_members_count: number
          upcoming_checkin_configs: Json
          upcoming_events: Json
        }[]
      }
      get_group_messages: {
        Args: { p_group_id: string; p_page_num: number; p_page_size: number }
        Returns: {
          content: string
          created_at: string
          group_id: string
          id: string
          mentioned_user_ids: string[]
          parent_id: string
          profiles: Json
          updated_at: string
          user_id: string
        }[]
      }
      get_latest_conversation_messages: {
        Args: { user_id: string }
        Returns: {
          conversation_id: string
          latest_message_content: string
          latest_message_created_at: string
        }[]
      }
      get_learning_module_by_id: {
        Args: { module_id: string }
        Returns: {
          category: string
          content: Json
          created_at: string
          description: string
          estimated_duration_minutes: number
          id: string
          is_published: boolean
          order_index: number
          slug: string
          title: string
          updated_at: string
        }[]
      }
      get_learning_module_by_slug: {
        Args: { module_slug: string }
        Returns: {
          category: string
          content: Json
          created_at: string
          description: string
          estimated_duration_minutes: number
          id: string
          is_published: boolean
          order_index: number
          slug: string
          title: string
          updated_at: string
        }[]
      }
      get_learning_modules: {
        Args: never
        Returns: {
          category: string
          content: Json
          created_at: string
          description: string
          estimated_duration_minutes: number
          id: string
          is_published: boolean
          order_index: number
          slug: string
          title: string
          updated_at: string
        }[]
      }
      get_learning_modules_by_category: {
        Args: { module_category: string }
        Returns: {
          category: string
          content: Json
          created_at: string
          description: string
          estimated_duration_minutes: number
          id: string
          is_published: boolean
          order_index: number
          slug: string
          title: string
          updated_at: string
        }[]
      }
      get_license_pool_stats: {
        Args: { p_product_id: string; p_tier_name?: string }
        Returns: {
          assigned_licenses: number
          available_licenses: number
          revoked_licenses: number
          total_licenses: number
        }[]
      }
      get_meal_timing_analytics: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: Json
      }
      get_member_role_in_group: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: string
      }
      get_nearby_provider_ids: {
        Args: {
          search_lat: number
          search_lon: number
          search_radius_miles: number
        }
        Returns: {
          provider_id: string
        }[]
      }
      get_new_groups_per_day: {
        Args: never
        Returns: {
          count: number
          day: string
        }[]
      }
      get_new_users_per_day: {
        Args: never
        Returns: {
          count: number
          day: string
        }[]
      }
      get_notifications: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          data: Json
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }[]
      }
      get_nrt_products: {
        Args: never
        Returns: {
          brand: string
          category: string
          certification_agency: string
          cons: string[]
          created_at: string
          description: string
          dosage: string
          effectiveness: string
          fda_approved: boolean
          id: string
          name: string
          price: number
          pros: string[]
          rating: string
          reviews: number
          updated_at: string
        }[]
      }
      get_or_create_tags: { Args: { p_tag_names: string[] }; Returns: string[] }
      get_pal_connector_dashboard_stats: {
        Args: { p_user_id: string }
        Returns: {
          community_engagements: number
          connected_users: number
          open_support_requests: number
          resources_shared: number
        }[]
      }
      get_personalized_recommendations: {
        Args: { limit_count?: number; user_id_param: string }
        Returns: {
          helper_id: string
          match_reasons: Json
          match_score: number
        }[]
      }
      get_platform_config: {
        Args: never
        Returns: {
          data_type: string
          key: string
          value: string
        }[]
      }
      get_popular_specialties: {
        Args: never
        Returns: {
          count: number
          specialty: string
        }[]
      }
      get_popular_specialties_simple: { Args: never; Returns: string[] }
      get_product_by_slug_productivity_hunt: {
        Args: { product_slug: string }
        Returns: {
          id: string
        }[]
      }
      get_product_comments_with_votes: {
        Args: { p_product_id: string; p_user_id?: string }
        Returns: {
          content: string
          created_at: string
          has_voted: boolean
          id: string
          parent_id: string
          product_id: string
          upvotes: number
          user_avatar: string
          user_id: string
          user_name: string
        }[]
      }
      get_product_huntcoin_settings: {
        Args: { product_id: string }
        Returns: {
          huntcoin_discount_percentage: number
          huntcoin_enabled: boolean
          id: string
          sold_through_us: boolean
        }[]
      }
      get_product_page_details: {
        Args: { p_product_id: string; p_user_id?: string }
        Returns: {
          collections: Json
          comments: Json
          product_details: Json
        }[]
      }
      get_products_with_details:
        | {
            Args: {
              in_category_id?: string
              p_filter: string
              p_limit?: number
              p_offset?: number
              p_product_id?: string
              p_search_query?: string
              p_tag_name?: string
              p_user_id?: string
            }
            Returns: {
              category_data: Json
              comment_count: number
              created_at: string
              description: string
              gallery_image_urls: string[]
              hunter_data: Json
              id: string
              is_coming_soon: boolean
              is_featured: boolean
              launch_date: string
              logo_url: string
              makers_data: Json
              name: string
              pricing_model: string
              slug: string
              specific_attributes: Json
              status: string
              tagline: string
              tags_data: Json
              user_id: string
              user_voted: boolean
              vote_count: number
              website_url: string
            }[]
          }
        | {
            Args: {
              p_category_id: string
              p_filter: string
              p_search_query: string
              p_user_id: string
            }
            Returns: {
              j: Json
            }[]
          }
      get_professionals: {
        Args: never
        Returns: {
          accepted_insurance_plans: string[]
          additional_attributes: Json
          availability: Json
          availability_status: string
          availability_summary: string
          average_rating: number
          bio: string
          can_provide_transport: boolean
          certifications: string[]
          comfortable_with_pets: boolean
          contact_email: string
          contact_phone: string
          created_at: string
          facility_services: string[]
          full_name: string
          has_24_7_nursing: boolean
          has_dementia_care_unit: boolean
          has_dementia_experience: boolean
          hourly_rate: number
          id: string
          is_cpr_certified: boolean
          is_first_aid_certified: boolean
          is_non_smoker: boolean
          is_pet_friendly: boolean
          is_private: boolean
          is_verified: boolean
          location: string
          media_urls: string[]
          meeting_preference: string
          offers_private_rooms: boolean
          offers_telehealth: boolean
          profile_image: string
          profile_picture_url: string
          provider_type: string
          reviews_count: number
          specialties: string[]
          updated_at: string
          user_id: string
          website_url: string
          willing_to_light_housekeep: boolean
          willing_to_meal_prep: boolean
          years_experience: number
          years_of_experience: number
        }[]
      }
      get_provider_display_name: {
        Args: { p: Database["public"]["Tables"]["profile"]["Row"] }
        Returns: string
      }
      get_public_care_groups_with_membership: {
        Args: {
          p_category_filter?: string
          p_page?: number
          p_page_size?: number
          p_search_query?: string
          p_sort_by?: string
          p_sort_order?: string
          p_user_id: string
        }
        Returns: {
          avatar_url: string
          care_recipient_avatar_url: string
          care_recipient_name: string
          cover_image_url: string
          description: string
          id: string
          is_member: boolean
          last_activity: string
          members_count: number
          name: string
          privacy_setting: string
          role_in_group: Database["public"]["Enums"]["care_group_member_role"]
        }[]
      }
      get_random_quote: {
        Args: never
        Returns: {
          author: string | null
          created_at: string
          id: number
          quote_text: string
          tags: string[] | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "fella_quotes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_relevant_care_notes_for_ai: {
        Args: {
          p_care_group_id: string
          p_care_recipient_id: string
          p_limit?: number
          p_query: string
          p_user_id: string
        }
        Returns: {
          category: Database["public"]["Enums"]["care_note_category"]
          content: string
          created_at: string
          id: string
          note_type: Database["public"]["Enums"]["care_note_type"]
          relevance_score: number
          tags: string[]
          title: string
        }[]
      }
      get_reward_history: {
        Args: { user_id_param: string }
        Returns: {
          date: string
          id: string
          name: string
          points: number
          steps: number
          type: string
        }[]
      }
      get_unread_message_counts_for_user: {
        Args: { p_conversation_ids: string[]; p_user_id: string }
        Returns: {
          conversation_id: string
          unread_count: number
        }[]
      }
      get_user_care_groups_count: {
        Args: {
          category_filter?: string
          role_filter?: string
          search_query?: string
          user_id_param: string
        }
        Returns: number
      }
      get_user_care_groups_count_rpc: {
        Args: {
          category_filter_param: string
          role_filter_param: string
          search_query_param: string
          user_id_param: string
        }
        Returns: number
      }
      get_user_category_ids_for_group: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: string[]
      }
      get_user_dashboard_data: { Args: { p_user_id: string }; Returns: Json }
      get_user_dashboard_data_v2: {
        Args: { p_user_id: string; p_user_role: string }
        Returns: Json
      }
      get_user_direct_message_conversations: {
        Args: { p_user_id: string }
        Returns: {
          conversation_partner_id: string
          conversation_partner_username: string
          last_message_at: string
          last_message_content: string
          unread_count: number
        }[]
      }
      get_user_permissions_for_group: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: {
          is_owner: boolean
          role: Database["public"]["Enums"]["care_group_member_role"]
        }[]
      }
      get_user_profile_by_id: { Args: { p_user_id: string }; Returns: Json }
      get_user_role_in_group: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: string
      }
      get_user_settings: {
        Args: { user_id_input: string }
        Returns: {
          ai_gentleness: number
          ai_user_nickname: string
          avatar_url: string
          background_music_volume: number
          current_streak: number
          daily_practice_reminder_time: string
          full_name: string
          id: string
          last_active_streak: number
          longest_streak: number
          onboarding_completed: boolean
          selected_theme: string
          sound_effects_enabled: boolean
          updated_at: string
          username: string
          website: string
        }[]
      }
      get_user_streak: { Args: { p_user_id: string }; Returns: number }
      get_user_upvoted_products: {
        Args: { p_current_user_id?: string; p_user_id: string }
        Returns: {
          category: Json
          category_id: string
          comments_count: number
          created_at: string
          description: string
          fts: unknown
          gallery_urls: string[]
          id: string
          is_coming_soon: boolean
          is_featured: boolean
          launch_date: string
          logo_url: string
          maker: Json
          maker_comment: string
          maker_id: string
          name: string
          pricing_model: string
          status: string
          tagline: string
          updated_at: string
          user_voted: boolean
          views_count: number
          votes_count: number
          website_url: string
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      handle_exercise_log: {
        Args: { p_exercise_data: Json; p_operation?: string; p_user_id: string }
        Returns: Json
      }
      handle_food_log: {
        Args: { p_food_data: Json; p_operation?: string; p_user_id: string }
        Returns: Json
      }
      handle_mention_notifications: {
        Args: {
          p_actor_id: string
          p_content: string
          p_content_preview_template?: string
          p_group_id: string
          p_notification_type: string
          p_resource_id: string
        }
        Returns: undefined
      }
      has_care_group_role: {
        Args: { p_group_id: string; p_role_name: string; p_user_id: string }
        Returns: boolean
      }
      increment_affiliate_earnings: {
        Args: { amount: number; user_id: string }
        Returns: undefined
      }
      increment_campaign_stats: {
        Args: {
          campaign_id: string
          clicks?: number
          cost?: number
          impressions?: number
        }
        Returns: undefined
      }
      increment_fella_note_template_usage: {
        Args: { template_id_input: string }
        Returns: {
          category: string | null
          content: Json
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          tags: string[] | null
          thumbnail_url: string | null
          times_used: number
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "fella_note_note_templates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      increment_helpful_votes: {
        Args: { review_id: string }
        Returns: undefined
      }
      increment_post_views: { Args: { post_id: string }; Returns: undefined }
      increment_product_visit_count: {
        Args: { product_id: string }
        Returns: undefined
      }
      increment_promotion_impressions: {
        Args: { booking_id: string }
        Returns: undefined
      }
      increment_publisher_earnings: {
        Args: { amount: number; publisher_id: string }
        Returns: undefined
      }
      increment_template_usage: {
        Args: { template_id_input: string }
        Returns: {
          category: string | null
          content_json: Json
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          tags: string[] | null
          times_used: number
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "note_templates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      increment_user_points: {
        Args: { points_to_add: number; user_id_param: string }
        Returns: undefined
      }
      increment_version: { Args: { row_id: string }; Returns: number }
      increment_view_count: {
        Args: { p_discussion_id: string }
        Returns: undefined
      }
      is_active_group_member: {
        Args: { group_id_to_check: string; user_id_to_check: string }
        Returns: boolean
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_admin_of_group: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: boolean
      }
      is_admin_of_task_group: {
        Args: { p_task_id: string; p_user_id: string }
        Returns: boolean
      }
      is_care_group_admin: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: boolean
      }
      is_care_group_admin_or_owner: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: boolean
      }
      is_care_group_creator: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: boolean
      }
      is_care_group_member: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: boolean
      }
      is_care_group_public: { Args: { p_group_id: string }; Returns: boolean }
      is_conversation_participant: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: boolean
      }
      is_group_admin_or_creator: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: boolean
      }
      is_group_admin_or_owner: {
        Args: { group_id_to_check: string; user_id_to_check: string }
        Returns: boolean
      }
      is_group_creator: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: boolean
      }
      is_member_of_any_of_my_subgroups: {
        Args: { p_target_subgroup_ids: string[]; p_user_id: string }
        Returns: boolean
      }
      is_member_of_group: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: boolean
      }
      is_member_of_task_group: {
        Args: { p_task_id: string; p_user_id: string }
        Returns: boolean
      }
      is_subgroup_admin: {
        Args: { subgroup_id_check: string; user_id_check: string }
        Returns: boolean
      }
      is_subgroup_member: {
        Args: { p_subgroup_id: string; p_user_id: string }
        Returns: boolean
      }
      is_user_in_member_categories: {
        Args: {
          p_category_ids: string[]
          p_group_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      join_care_group: {
        Args: {
          group_id: string
          join_message?: string
          requesting_profile_id: string
          requesting_user_id: string
        }
        Returns: {
          message: string
          status_text: string
        }[]
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      mark_conversation_messages_as_read: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: undefined
      }
      mark_direct_messages_as_read: {
        Args: { p_receiver_id: string; p_sender_id: string }
        Returns: undefined
      }
      mark_group_messages_as_read: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: undefined
      }
      moderate_review: {
        Args: { p_notes?: string; p_review_id: string; p_status: string }
        Returns: undefined
      }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      record_step_count: {
        Args: { date_param: string; steps_param: number; user_id_param: string }
        Returns: {
          id: string
          points_awarded: number
          steps: number
        }[]
      }
      redeem_reward: {
        Args: { p_cost: number; p_reward_id: string; p_user_id: string }
        Returns: undefined
      }
      reset_unread_count: {
        Args: { conv_id: string; user_id: string }
        Returns: undefined
      }
      search_caregivers_with_details:
        | {
            Args: { page_limit?: number; page_offset?: number }
            Returns: {
              auto_confirm_bookings: boolean
              auto_confirm_conditions: Json
              availability_json: Json
              background_check_completed: boolean
              background_check_status: boolean
              bio: string
              created_at: string
              hourly_rate: number
              id: string
              profiles: Json
              user_id: string
              years_of_experience: number
            }[]
          }
        | {
            Args: {
              has_check?: boolean
              max_rate?: number
              min_exp?: number
              min_rate?: number
              page_limit?: number
              page_offset?: number
              search_term?: string
              sort_asc?: boolean
              sort_by_param?: string
            }
            Returns: {
              auto_confirm_bookings: boolean
              auto_confirm_conditions: Json
              availability_json: Json
              background_check_completed: boolean
              background_check_status: boolean
              bio: string
              created_at: string
              hourly_rate: number
              id: string
              profiles: Json
              user_id: string
              years_of_experience: number
            }[]
          }
        | {
            Args: {
              has_check?: boolean
              max_rate?: number
              min_exp?: number
              min_rate?: number
              p_available_on_days?: string[]
              p_service_ids?: number[]
              page_limit?: number
              page_offset?: number
              search_term?: string
              sort_asc?: boolean
              sort_by_param?: string
            }
            Returns: {
              auto_confirm_bookings: boolean
              auto_confirm_conditions: Json
              availability_json: Json
              background_check_completed: boolean
              background_check_status: boolean
              bio: string
              created_at: string
              hourly_rate: number
              id: string
              profiles: Json
              user_id: string
              years_of_experience: number
            }[]
          }
      search_discussions: {
        Args: { p_search_term: string }
        Returns: {
          category: Json
          category_id: string
          comments_count: number
          content: string
          created_at: string
          id: string
          title: string
          upvotes_count: number
          user: Json
          user_id: string
        }[]
      }
      search_helpers: {
        Args: {
          availability_filter?: string
          gender_filter?: string
          language_filter?: string
          limit_count?: number
          max_distance_km?: number
          max_price?: number
          min_rating?: number
          offset_count?: number
          search_query?: string
          services_filter?: string[]
          skills_filter?: string[]
          sort_by?: string
          user_location?: unknown
        }
        Returns: {
          availability_status: string
          background_check_status: string
          bio: string
          distance_km: number
          helper_id: string
          hourly_rate: number
          location: string
          match_score: number
          name: string
          profile_image_url: string
          rating: number
          services: Json
          skills: Json
          total_reviews: number
          verified: boolean
        }[]
      }
      search_service_providers_by_distance: {
        Args: {
          page_limit?: number
          page_offset?: number
          search_latitude: number
          search_longitude: number
          search_radius_meters: number
        }
        Returns: {
          distance_meters: number
          id: string
          total_records: number
        }[]
      }
      search_service_providers_proxy: {
        Args: {
          p_current_user_id: string
          p_is_verified: boolean
          p_languages: string[]
          p_latitude: number
          p_longitude: number
          p_max_price: number
          p_min_rating: number
          p_page_number: number
          p_page_size: number
          p_provider_type: string
          p_radius_km: number
          p_search_term: string
          p_sort_by: string
          p_sort_direction: string
          p_specialties: string[]
        }
        Returns: {
          avatar_url: string
          average_rating: number
          bio: string
          city: string
          country: string
          distance_km: number
          full_name: string
          hourly_rate: number
          id: string
          is_favorite: boolean
          is_verified: boolean
          languages: string[]
          provider_type: string
          review_count: number
          specialties: Json
          total_count: number
          user_id: string
        }[]
      }
      send_group_message: {
        Args: { p_content: string; p_group_id: string; p_user_id: string }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      slugify: { Args: { v_text: string }; Returns: string }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      suggest_care_note_augmentation: {
        Args: {
          p_care_group_id: string
          p_care_recipient_id: string
          p_fragmented_tip: string
        }
        Returns: Json
      }
      trigger_medication_reminders: { Args: never; Returns: undefined }
      unaccent: { Args: { "": string }; Returns: string }
      unlockrows: { Args: { "": string }; Returns: number }
      update_announcement: {
        Args: {
          p_content: string
          p_id: string
          p_is_pinned: boolean
          p_title: string
          p_visible_to_category_ids: string[]
        }
        Returns: undefined
      }
      update_group_message: {
        Args: { p_content: string; p_id: string; p_user_id: string }
        Returns: Json
      }
      update_product_status_and_notify: {
        Args: {
          p_admin_user_id: string
          p_new_status: string
          p_product_id: string
        }
        Returns: undefined
      }
      update_service_provider_ratings_and_count: {
        Args: { provider_id_param: string }
        Returns: undefined
      }
      update_social_post_comment: {
        Args: { p_content: string; p_id: string }
        Returns: undefined
      }
      update_user_settings: {
        Args: { p_settings: Json; p_user_id: string }
        Returns: undefined
      }
      update_verification_level: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      audit_log_operation_type: "INSERT" | "UPDATE" | "DELETE"
      availability_status: "available" | "busy" | "offline"
      availability_type: "recurring" | "specific_date" | "unavailable"
      booking_status:
        | "pending_confirmation"
        | "confirmed"
        | "cancelled_by_user"
        | "cancelled_by_professional"
        | "completed"
        | "rescheduled"
        | "no_show"
        | "propose_new_time"
        | "reschedule_proposed_provider"
        | "pending_reschedule_confirmation"
      booking_status_companion:
        | "pending"
        | "confirmed"
        | "cancelled_by_user"
        | "cancelled_by_companion"
        | "completed"
        | "no_show_user"
        | "no_show_companion"
      booking_status_enum:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "rescheduled"
      business_type: "retail" | "online" | "hybrid"
      care_group_member_role:
        | "admin"
        | "member"
        | "editor"
        | "viewer"
        | "owner"
        | "coordinator"
        | "professional"
      care_group_role: "owner" | "admin" | "coordinator" | "member" | "viewer"
      care_note_category:
        | "Communication"
        | "Mobility"
        | "Nutrition"
        | "Medication"
        | "Personal Care"
        | "Safety"
        | "Engagement"
        | "Behavioral"
        | "Medical Appointment"
        | "Daily Routine"
        | "Other"
      care_note_type:
        | "General Note"
        | "Care Tip"
        | "Accompany Tip"
        | "Avoid List Item"
        | "Life Story Snippet"
        | "Medical Information"
        | "Emergency Protocol"
        | "Behavioral Insight"
        | "Topic Card"
        | "Reminiscence Material"
      care_note_visibility:
        | "Group"
        | "SpecificMembers"
        | "OnlyMe"
        | "SpecificCategories"
      care_plan_visibility: "group" | "categories" | "members" | "admins_only"
      caregiver_type:
        | "companion"
        | "professional"
        | "nurse"
        | "therapist"
        | "aide"
        | "specialist"
      checkin_booking_status:
        | "pending_approval"
        | "confirmed"
        | "declined_by_professional"
        | "cancelled_by_requester"
        | "completed"
        | "missed"
      checkin_booking_type: "message" | "phone" | "in_person"
      checkin_frequency:
        | "once"
        | "daily"
        | "weekly"
        | "bi-weekly"
        | "monthly"
        | "custom"
      checkin_log_status:
        | "pending"
        | "completed"
        | "missed"
        | "failed"
        | "cancelled"
        | "in_progress"
        | "completed_shift"
      checkin_method:
        | "message"
        | "phone"
        | "in_person"
        | "ai_text"
        | "ai_speech"
        | "form"
        | "unknown"
        | "in_person_visit"
        | "phone_call"
        | "video_call"
        | "manual_log"
      checkin_schedule_status:
        | "active"
        | "paused"
        | "completed"
        | "cancelled"
        | "missed"
        | "active_shift"
        | "completed_shift"
      checkin_service_type: "message" | "phone" | "in_person"
      checkin_status:
        | "scheduled"
        | "pending_response"
        | "in_progress"
        | "completed"
        | "missed"
        | "cancelled"
      checkin_type: "manual_log" | "scheduled_prompt" | "ai_chat"
      checkin_type_enum:
        | "message"
        | "phone_call"
        | "in_person"
        | "ai_text"
        | "ai_speech"
      event_category_enum:
        | "appointment"
        | "medication"
        | "activity"
        | "visit"
        | "exercise"
        | "meal"
        | "social_gathering"
        | "therapy_session"
        | "personal_care"
        | "respite_care"
        | "group_meeting"
        | "education_workshop"
        | "volunteer_activity"
        | "important_deadline"
        | "other"
      event_rsvp_status: "going" | "not_going" | "maybe" | "invited"
      group_role: "owner" | "admin" | "moderator" | "member" | "cared_one"
      moderation_status: "pending" | "approved" | "rejected"
      note_visibility_type:
        | "group"
        | "member_categories"
        | "members"
        | "public_in_group"
      notification_type:
        | "booking_request"
        | "booking_confirmed"
        | "group_invite"
        | "message"
        | "task_assigned"
        | "reminder"
      palace_node_type: "text" | "image" | "link"
      payment_status: "unpaid" | "processing" | "paid" | "failed"
      program_status: "not_started" | "in_progress" | "completed"
      reaction_emoji: "👍" | "❤️" | "😂" | "😢" | "😠" | "😮"
      report_reason_category:
        | "spam"
        | "harassment"
        | "hate_speech"
        | "misinformation"
        | "inappropriate_content"
        | "impersonation"
        | "privacy_violation"
        | "other"
      report_status:
        | "pending_review"
        | "under_review"
        | "resolved_content_removed"
        | "resolved_user_action_taken"
        | "resolved_no_action_needed"
        | "resolved_report_dismissed"
      reported_content_type:
        | "care_group_update"
        | "profile"
        | "group_message"
        | "comment"
      review_entity_type: "product" | "store"
      service_offering_type:
        | "consultation"
        | "assessment"
        | "therapy_session"
        | "care_planning"
        | "medication_review"
        | "insurance_guidance"
        | "legal_assistance"
        | "care_coordination"
        | "family_support"
        | "remote_monitoring"
        | "personal_care"
        | "meal_preparation"
        | "light_housekeeping"
        | "transportation"
        | "companionship"
        | "mobility_assistance"
        | "specialized_care_adhd"
        | "specialized_care_autism"
        | "specialized_care_dementia"
        | "overnight_care"
        | "respite_care"
        | "other"
      service_provider_type:
        | "professional"
        | "caregiver"
        | "companion"
        | "checkiner"
        | "care_checkiner"
        | "pal_connector"
        | "care-checkiner"
      social_post_visibility_enum:
        | "group"
        | "categories"
        | "members"
        | "public_if_group_is_public"
      subgroup_member_role: "admin" | "member" | "viewer"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "on_hold"
      task_visibility_enum:
        | "group"
        | "members"
        | "categories"
        | "private"
        | "public"
        | "public_if_group_is_public"
      team_member_role: "admin" | "member" | "editor" | "viewer"
      user_role:
        | "user"
        | "admin"
        | "caregiver"
        | "companion"
        | "care_checkiner"
        | "professional"
        | "care_recipient"
        | "facility_admin"
        | "pal_connector"
        | "care_advisor"
        | "insurance_advisor"
        | "care_lawyer"
        | "checkin_person"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
      audit_log_operation_type: ["INSERT", "UPDATE", "DELETE"],
      availability_status: ["available", "busy", "offline"],
      availability_type: ["recurring", "specific_date", "unavailable"],
      booking_status: [
        "pending_confirmation",
        "confirmed",
        "cancelled_by_user",
        "cancelled_by_professional",
        "completed",
        "rescheduled",
        "no_show",
        "propose_new_time",
        "reschedule_proposed_provider",
        "pending_reschedule_confirmation",
      ],
      booking_status_companion: [
        "pending",
        "confirmed",
        "cancelled_by_user",
        "cancelled_by_companion",
        "completed",
        "no_show_user",
        "no_show_companion",
      ],
      booking_status_enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "rescheduled",
      ],
      business_type: ["retail", "online", "hybrid"],
      care_group_member_role: [
        "admin",
        "member",
        "editor",
        "viewer",
        "owner",
        "coordinator",
        "professional",
      ],
      care_group_role: ["owner", "admin", "coordinator", "member", "viewer"],
      care_note_category: [
        "Communication",
        "Mobility",
        "Nutrition",
        "Medication",
        "Personal Care",
        "Safety",
        "Engagement",
        "Behavioral",
        "Medical Appointment",
        "Daily Routine",
        "Other",
      ],
      care_note_type: [
        "General Note",
        "Care Tip",
        "Accompany Tip",
        "Avoid List Item",
        "Life Story Snippet",
        "Medical Information",
        "Emergency Protocol",
        "Behavioral Insight",
        "Topic Card",
        "Reminiscence Material",
      ],
      care_note_visibility: [
        "Group",
        "SpecificMembers",
        "OnlyMe",
        "SpecificCategories",
      ],
      care_plan_visibility: ["group", "categories", "members", "admins_only"],
      caregiver_type: [
        "companion",
        "professional",
        "nurse",
        "therapist",
        "aide",
        "specialist",
      ],
      checkin_booking_status: [
        "pending_approval",
        "confirmed",
        "declined_by_professional",
        "cancelled_by_requester",
        "completed",
        "missed",
      ],
      checkin_booking_type: ["message", "phone", "in_person"],
      checkin_frequency: [
        "once",
        "daily",
        "weekly",
        "bi-weekly",
        "monthly",
        "custom",
      ],
      checkin_log_status: [
        "pending",
        "completed",
        "missed",
        "failed",
        "cancelled",
        "in_progress",
        "completed_shift",
      ],
      checkin_method: [
        "message",
        "phone",
        "in_person",
        "ai_text",
        "ai_speech",
        "form",
        "unknown",
        "in_person_visit",
        "phone_call",
        "video_call",
        "manual_log",
      ],
      checkin_schedule_status: [
        "active",
        "paused",
        "completed",
        "cancelled",
        "missed",
        "active_shift",
        "completed_shift",
      ],
      checkin_service_type: ["message", "phone", "in_person"],
      checkin_status: [
        "scheduled",
        "pending_response",
        "in_progress",
        "completed",
        "missed",
        "cancelled",
      ],
      checkin_type: ["manual_log", "scheduled_prompt", "ai_chat"],
      checkin_type_enum: [
        "message",
        "phone_call",
        "in_person",
        "ai_text",
        "ai_speech",
      ],
      event_category_enum: [
        "appointment",
        "medication",
        "activity",
        "visit",
        "exercise",
        "meal",
        "social_gathering",
        "therapy_session",
        "personal_care",
        "respite_care",
        "group_meeting",
        "education_workshop",
        "volunteer_activity",
        "important_deadline",
        "other",
      ],
      event_rsvp_status: ["going", "not_going", "maybe", "invited"],
      group_role: ["owner", "admin", "moderator", "member", "cared_one"],
      moderation_status: ["pending", "approved", "rejected"],
      note_visibility_type: [
        "group",
        "member_categories",
        "members",
        "public_in_group",
      ],
      notification_type: [
        "booking_request",
        "booking_confirmed",
        "group_invite",
        "message",
        "task_assigned",
        "reminder",
      ],
      palace_node_type: ["text", "image", "link"],
      payment_status: ["unpaid", "processing", "paid", "failed"],
      program_status: ["not_started", "in_progress", "completed"],
      reaction_emoji: ["👍", "❤️", "😂", "😢", "😠", "😮"],
      report_reason_category: [
        "spam",
        "harassment",
        "hate_speech",
        "misinformation",
        "inappropriate_content",
        "impersonation",
        "privacy_violation",
        "other",
      ],
      report_status: [
        "pending_review",
        "under_review",
        "resolved_content_removed",
        "resolved_user_action_taken",
        "resolved_no_action_needed",
        "resolved_report_dismissed",
      ],
      reported_content_type: [
        "care_group_update",
        "profile",
        "group_message",
        "comment",
      ],
      review_entity_type: ["product", "store"],
      service_offering_type: [
        "consultation",
        "assessment",
        "therapy_session",
        "care_planning",
        "medication_review",
        "insurance_guidance",
        "legal_assistance",
        "care_coordination",
        "family_support",
        "remote_monitoring",
        "personal_care",
        "meal_preparation",
        "light_housekeeping",
        "transportation",
        "companionship",
        "mobility_assistance",
        "specialized_care_adhd",
        "specialized_care_autism",
        "specialized_care_dementia",
        "overnight_care",
        "respite_care",
        "other",
      ],
      service_provider_type: [
        "professional",
        "caregiver",
        "companion",
        "checkiner",
        "care_checkiner",
        "pal_connector",
        "care-checkiner",
      ],
      social_post_visibility_enum: [
        "group",
        "categories",
        "members",
        "public_if_group_is_public",
      ],
      subgroup_member_role: ["admin", "member", "viewer"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: [
        "pending",
        "in_progress",
        "completed",
        "cancelled",
        "on_hold",
      ],
      task_visibility_enum: [
        "group",
        "members",
        "categories",
        "private",
        "public",
        "public_if_group_is_public",
      ],
      team_member_role: ["admin", "member", "editor", "viewer"],
      user_role: [
        "user",
        "admin",
        "caregiver",
        "companion",
        "care_checkiner",
        "professional",
        "care_recipient",
        "facility_admin",
        "pal_connector",
        "care_advisor",
        "insurance_advisor",
        "care_lawyer",
        "checkin_person",
      ],
    },
  },
} as const
