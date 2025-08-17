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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      allergens: {
        Row: {
          created_at: string | null
          icon: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          city_id: number | null
          created_at: string | null
          entity_id: number | null
          entity_type: string | null
          event_type: string
          id: string
          properties: Json | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          city_id?: number | null
          created_at?: string | null
          entity_id?: number | null
          entity_type?: string | null
          event_type: string
          id?: string
          properties?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          city_id?: number | null
          created_at?: string | null
          entity_id?: number | null
          entity_type?: string | null
          event_type?: string
          id?: string
          properties?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      app_config: {
        Row: {
          category: string
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: number
          is_public: boolean | null
          updated_at: string | null
        }
        Insert: {
          category: string
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: number
          is_public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: number
          is_public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_public: boolean
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_public?: boolean
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      cities: {
        Row: {
          city_type: string | null
          created_at: string | null
          id: number
          is_capital: boolean | null
          latitude: number
          longitude: number
          municipality_id: number | null
          name: string
          population: number | null
          province_id: number
        }
        Insert: {
          city_type?: string | null
          created_at?: string | null
          id?: number
          is_capital?: boolean | null
          latitude: number
          longitude: number
          municipality_id?: number | null
          name: string
          population?: number | null
          province_id: number
        }
        Update: {
          city_type?: string | null
          created_at?: string | null
          id?: number
          is_capital?: boolean | null
          latitude?: number
          longitude?: number
          municipality_id?: number | null
          name?: string
          population?: number | null
          province_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "cities_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cities_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_metrics: {
        Row: {
          avg_rating: number | null
          avg_ticket_amount: number | null
          city_id: number | null
          created_at: string | null
          cuisine_type_id: number | null
          id: number
          market_share_percentage: number | null
          metric_date: string
          new_restaurants: number | null
          price_range: Database["public"]["Enums"]["price_range"] | null
          total_restaurants: number | null
        }
        Insert: {
          avg_rating?: number | null
          avg_ticket_amount?: number | null
          city_id?: number | null
          created_at?: string | null
          cuisine_type_id?: number | null
          id?: number
          market_share_percentage?: number | null
          metric_date: string
          new_restaurants?: number | null
          price_range?: Database["public"]["Enums"]["price_range"] | null
          total_restaurants?: number | null
        }
        Update: {
          avg_rating?: number | null
          avg_ticket_amount?: number | null
          city_id?: number | null
          created_at?: string | null
          cuisine_type_id?: number | null
          id?: number
          market_share_percentage?: number | null
          metric_date?: string
          new_restaurants?: number | null
          price_range?: Database["public"]["Enums"]["price_range"] | null
          total_restaurants?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_metrics_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_metrics_cuisine_type_id_fkey"
            columns: ["cuisine_type_id"]
            isOneToOne: false
            referencedRelation: "cuisine_types"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      cuisine_types: {
        Row: {
          banner_url: string | null
          created_at: string | null
          icon: string | null
          icon_emoji: string | null
          icon_url: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          icon?: string | null
          icon_emoji?: string | null
          icon_url?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          icon?: string | null
          icon_emoji?: string | null
          icon_url?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          created_at: string | null
          id: number
          name: string
          symbol: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: number
          name: string
          symbol: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: number
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      diet_types: {
        Row: {
          category: string
          created_at: string | null
          icon: string | null
          id: number
          max_percentage: number
          min_percentage: number
          name: string
          slug: string
        }
        Insert: {
          category?: string
          created_at?: string | null
          icon?: string | null
          id?: number
          max_percentage?: number
          min_percentage?: number
          name: string
          slug: string
        }
        Update: {
          category?: string
          created_at?: string | null
          icon?: string | null
          id?: number
          max_percentage?: number
          min_percentage?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      dish_categories: {
        Row: {
          created_at: string | null
          display_order: number | null
          icon: string | null
          icon_url: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          icon_url?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          icon_url?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      dish_metrics: {
        Row: {
          added_to_ticket_count: number | null
          created_at: string | null
          dish_id: number
          id: number
          metric_date: string
          shared_count: number | null
          views_count: number | null
        }
        Insert: {
          added_to_ticket_count?: number | null
          created_at?: string | null
          dish_id: number
          id?: number
          metric_date: string
          shared_count?: number | null
          views_count?: number | null
        }
        Update: {
          added_to_ticket_count?: number | null
          created_at?: string | null
          dish_id?: number
          id?: number
          metric_date?: string
          shared_count?: number | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dish_metrics_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dish_metrics_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dish_metrics_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "v_dishes_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      dish_variants: {
        Row: {
          created_at: string | null
          dish_id: number
          display_order: number | null
          id: number
          is_default: boolean | null
          name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          dish_id: number
          display_order?: number | null
          id?: number
          is_default?: boolean | null
          name: string
          price: number
        }
        Update: {
          created_at?: string | null
          dish_id?: number
          display_order?: number | null
          id?: number
          is_default?: boolean | null
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "dish_variants_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dish_variants_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dish_variants_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "v_dishes_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      dishes: {
        Row: {
          allergens: Json | null
          base_price: number
          category_id: number
          created_at: string | null
          custom_tags: Json | null
          deleted_at: string | null
          description: string | null
          diet_types: Json | null
          favorites_count: number | null
          favorites_count_week: number | null
          id: number
          image_alt: string | null
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_gluten_free: boolean | null
          is_healthy: boolean | null
          is_lactose_free: boolean | null
          is_vegan: boolean | null
          is_vegetarian: boolean | null
          name: string
          preparation_time_minutes: number | null
          restaurant_id: number
          section_id: number
          spice_level: number | null
          updated_at: string | null
        }
        Insert: {
          allergens?: Json | null
          base_price: number
          category_id: number
          created_at?: string | null
          custom_tags?: Json | null
          deleted_at?: string | null
          description?: string | null
          diet_types?: Json | null
          favorites_count?: number | null
          favorites_count_week?: number | null
          id?: number
          image_alt?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_gluten_free?: boolean | null
          is_healthy?: boolean | null
          is_lactose_free?: boolean | null
          is_vegan?: boolean | null
          is_vegetarian?: boolean | null
          name: string
          preparation_time_minutes?: number | null
          restaurant_id: number
          section_id: number
          spice_level?: number | null
          updated_at?: string | null
        }
        Update: {
          allergens?: Json | null
          base_price?: number
          category_id?: number
          created_at?: string | null
          custom_tags?: Json | null
          deleted_at?: string | null
          description?: string | null
          diet_types?: Json | null
          favorites_count?: number | null
          favorites_count_week?: number | null
          id?: number
          image_alt?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_gluten_free?: boolean | null
          is_healthy?: boolean | null
          is_lactose_free?: boolean | null
          is_vegan?: boolean | null
          is_vegetarian?: boolean | null
          name?: string
          preparation_time_minutes?: number | null
          restaurant_id?: number
          section_id?: number
          spice_level?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dishes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "dish_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "menu_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      distance_ranges: {
        Row: {
          created_at: string | null
          display_order: number | null
          display_text: string
          distance_km: number
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          display_text: string
          distance_km: number
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          display_text?: string
          distance_km?: number
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      districts: {
        Row: {
          city_id: number
          created_at: string | null
          description: string | null
          district_type: string | null
          id: number
          is_famous: boolean | null
          latitude: number
          longitude: number
          name: string
          postal_codes: Json | null
        }
        Insert: {
          city_id: number
          created_at?: string | null
          description?: string | null
          district_type?: string | null
          id?: number
          is_famous?: boolean | null
          latitude: number
          longitude: number
          name: string
          postal_codes?: Json | null
        }
        Update: {
          city_id?: number
          created_at?: string | null
          description?: string | null
          district_type?: string | null
          id?: number
          is_famous?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          postal_codes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "districts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_metrics: {
        Row: {
          avg_time_on_page_seconds: number | null
          bounce_rate: number | null
          calls_clicks: number | null
          clicks_count: number | null
          created_at: string | null
          directions_clicks: number | null
          entity_id: number
          entity_type: string
          id: number
          metric_date: string
          reservation_clicks: number | null
          saves_count: number | null
          shares_count: number | null
          view_to_action_rate: number | null
          views_count: number | null
          website_clicks: number | null
        }
        Insert: {
          avg_time_on_page_seconds?: number | null
          bounce_rate?: number | null
          calls_clicks?: number | null
          clicks_count?: number | null
          created_at?: string | null
          directions_clicks?: number | null
          entity_id: number
          entity_type: string
          id?: number
          metric_date: string
          reservation_clicks?: number | null
          saves_count?: number | null
          shares_count?: number | null
          view_to_action_rate?: number | null
          views_count?: number | null
          website_clicks?: number | null
        }
        Update: {
          avg_time_on_page_seconds?: number | null
          bounce_rate?: number | null
          calls_clicks?: number | null
          clicks_count?: number | null
          created_at?: string | null
          directions_clicks?: number | null
          entity_id?: number
          entity_type?: string
          id?: number
          metric_date?: string
          reservation_clicks?: number | null
          saves_count?: number | null
          shares_count?: number | null
          view_to_action_rate?: number | null
          views_count?: number | null
          website_clicks?: number | null
        }
        Relationships: []
      }
      establishment_types: {
        Row: {
          created_at: string | null
          icon: string | null
          icon_url: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          icon_url?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          icon_url?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          age_restriction: Database["public"]["Enums"]["age_restriction"] | null
          available_seats: number | null
          category: string
          contact_for_reservations: string | null
          created_at: string | null
          deleted_at: string | null
          description: string
          dress_code: Database["public"]["Enums"]["dress_code"] | null
          end_time: string | null
          entry_price: number | null
          event_date: string
          favorites_count: number | null
          favorites_count_week: number | null
          id: number
          image_alt: string | null
          image_url: string | null
          is_active: boolean | null
          is_free: boolean | null
          name: string
          requires_reservation: boolean | null
          restaurant_id: number
          start_time: string
          tags: Json | null
          updated_at: string | null
          venue: string | null
          whats_included: string | null
        }
        Insert: {
          age_restriction?:
            | Database["public"]["Enums"]["age_restriction"]
            | null
          available_seats?: number | null
          category: string
          contact_for_reservations?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description: string
          dress_code?: Database["public"]["Enums"]["dress_code"] | null
          end_time?: string | null
          entry_price?: number | null
          event_date: string
          favorites_count?: number | null
          favorites_count_week?: number | null
          id?: number
          image_alt?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_free?: boolean | null
          name: string
          requires_reservation?: boolean | null
          restaurant_id: number
          start_time: string
          tags?: Json | null
          updated_at?: string | null
          venue?: string | null
          whats_included?: string | null
        }
        Update: {
          age_restriction?:
            | Database["public"]["Enums"]["age_restriction"]
            | null
          available_seats?: number | null
          category?: string
          contact_for_reservations?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string
          dress_code?: Database["public"]["Enums"]["dress_code"] | null
          end_time?: string | null
          entry_price?: number | null
          event_date?: string
          favorites_count?: number | null
          favorites_count_week?: number | null
          id?: number
          image_alt?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_free?: boolean | null
          name?: string
          requires_reservation?: boolean | null
          restaurant_id?: number
          start_time?: string
          tags?: Json | null
          updated_at?: string | null
          venue?: string | null
          whats_included?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      food_types: {
        Row: {
          created_at: string | null
          display_order: number | null
          icon: string | null
          icon_url: string | null
          id: number
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          icon_url?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          icon_url?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      fraud_alerts: {
        Row: {
          alert_data: Json
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          investigated_at: string | null
          investigated_by: string | null
          resolution_notes: string | null
          rule_id: number | null
          severity_level: number
          status: string | null
        }
        Insert: {
          alert_data: Json
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          investigated_at?: string | null
          investigated_by?: string | null
          resolution_notes?: string | null
          rule_id?: number | null
          severity_level: number
          status?: string | null
        }
        Update: {
          alert_data?: Json
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          investigated_at?: string | null
          investigated_by?: string | null
          resolution_notes?: string | null
          rule_id?: number | null
          severity_level?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_alerts_investigated_by_fkey"
            columns: ["investigated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_alerts_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "fraud_detection_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_detection_rules: {
        Row: {
          auto_action: string | null
          condition_query: string
          created_at: string | null
          id: number
          is_active: boolean | null
          rule_name: string
          rule_type: string
          severity_level: number
        }
        Insert: {
          auto_action?: string | null
          condition_query: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          rule_name: string
          rule_type: string
          severity_level: number
        }
        Update: {
          auto_action?: string | null
          condition_query?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          rule_name?: string
          rule_type?: string
          severity_level?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string | null
          due_date: string
          id: number
          invoice_date: string
          invoice_number: string
          paid_at: string | null
          payment_method: string | null
          restaurant_id: number
          status: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number
          tax_amount: number
          tax_rate: number
          total: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          due_date: string
          id?: number
          invoice_date: string
          invoice_number: string
          paid_at?: string | null
          payment_method?: string | null
          restaurant_id: number
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number
          tax_amount: number
          tax_rate?: number
          total: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          due_date?: string
          id?: number
          invoice_date?: string
          invoice_number?: string
          paid_at?: string | null
          payment_method?: string | null
          restaurant_id?: number
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          created_at: string | null
          flag_url: string | null
          id: number
          is_active: boolean | null
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          flag_url?: string | null
          id?: number
          is_active?: boolean | null
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          flag_url?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      location_metrics: {
        Row: {
          avg_search_radius_km: number | null
          city_id: number | null
          created_at: string | null
          district_id: number | null
          id: number
          metric_date: string
          peak_hours: Json | null
          popular_cuisines: Json | null
          restaurants_viewed: number | null
          searches_in_area: number | null
          tickets_created: number | null
        }
        Insert: {
          avg_search_radius_km?: number | null
          city_id?: number | null
          created_at?: string | null
          district_id?: number | null
          id?: number
          metric_date: string
          peak_hours?: Json | null
          popular_cuisines?: Json | null
          restaurants_viewed?: number | null
          searches_in_area?: number | null
          tickets_created?: number | null
        }
        Update: {
          avg_search_radius_km?: number | null
          city_id?: number | null
          created_at?: string | null
          district_id?: number | null
          id?: number
          metric_date?: string
          peak_hours?: Json | null
          popular_cuisines?: Json | null
          restaurants_viewed?: number | null
          searches_in_area?: number | null
          tickets_created?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "location_metrics_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_metrics_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_metrics_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "famous_areas_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_sections: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          display_order: number | null
          id: number
          is_active: boolean | null
          name: string
          restaurant_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: number
          is_active?: boolean | null
          name: string
          restaurant_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: number
          is_active?: boolean | null
          name?: string
          restaurant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_sections_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_sections_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_sections_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_sections_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_sections_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      municipalities: {
        Row: {
          code: string | null
          created_at: string | null
          id: number
          latitude: number
          longitude: number
          name: string
          population: number | null
          province_id: number
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          id?: number
          latitude: number
          longitude: number
          name: string
          population?: number | null
          province_id: number
        }
        Update: {
          code?: string | null
          created_at?: string | null
          id?: number
          latitude?: number
          longitude?: number
          name?: string
          population?: number | null
          province_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "municipalities_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      peak_hours_metrics: {
        Row: {
          created_at: string | null
          hour_of_day: number
          id: number
          menu_views: number | null
          metric_date: string
          profile_views: number | null
          restaurant_id: number | null
          tickets_created: number | null
          tickets_saved: number | null
          view_to_ticket_rate: number | null
        }
        Insert: {
          created_at?: string | null
          hour_of_day: number
          id?: number
          menu_views?: number | null
          metric_date: string
          profile_views?: number | null
          restaurant_id?: number | null
          tickets_created?: number | null
          tickets_saved?: number | null
          view_to_ticket_rate?: number | null
        }
        Update: {
          created_at?: string | null
          hour_of_day?: number
          id?: number
          menu_views?: number | null
          metric_date?: string
          profile_views?: number | null
          restaurant_id?: number | null
          tickets_created?: number | null
          tickets_saved?: number | null
          view_to_ticket_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "peak_hours_metrics_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peak_hours_metrics_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peak_hours_metrics_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peak_hours_metrics_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peak_hours_metrics_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_configs: {
        Row: {
          base_url: string | null
          category: string
          created_at: string | null
          display_order: number | null
          icon: string | null
          icon_color: string | null
          icon_name: string
          id: number
          is_active: boolean | null
          platform_key: string
          platform_name: string
          url_pattern: string | null
        }
        Insert: {
          base_url?: string | null
          category: string
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          icon_color?: string | null
          icon_name: string
          id?: number
          is_active?: boolean | null
          platform_key: string
          platform_name: string
          url_pattern?: string | null
        }
        Update: {
          base_url?: string | null
          category?: string
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          icon_color?: string | null
          icon_name?: string
          id?: number
          is_active?: boolean | null
          platform_key?: string
          platform_name?: string
          url_pattern?: string | null
        }
        Relationships: []
      }
      points_of_interest: {
        Row: {
          city_id: number | null
          created_at: string | null
          description: string | null
          district_id: number | null
          id: number
          importance_level: number | null
          is_active: boolean | null
          latitude: number
          longitude: number
          name: string
          radius_meters: number | null
          type: string
        }
        Insert: {
          city_id?: number | null
          created_at?: string | null
          description?: string | null
          district_id?: number | null
          id?: number
          importance_level?: number | null
          is_active?: boolean | null
          latitude: number
          longitude: number
          name: string
          radius_meters?: number | null
          type: string
        }
        Update: {
          city_id?: number | null
          created_at?: string | null
          description?: string | null
          district_id?: number | null
          id?: number
          importance_level?: number | null
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          radius_meters?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_of_interest_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_of_interest_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_of_interest_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "famous_areas_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      popularity_counters: {
        Row: {
          entity_id: number
          entity_type: string
          last_updated: string | null
          saves_count: number | null
          saves_count_month: number | null
          saves_count_week: number | null
          trending_score: number | null
          views_count_month: number | null
          views_count_today: number | null
          views_count_week: number | null
        }
        Insert: {
          entity_id: number
          entity_type: string
          last_updated?: string | null
          saves_count?: number | null
          saves_count_month?: number | null
          saves_count_week?: number | null
          trending_score?: number | null
          views_count_month?: number | null
          views_count_today?: number | null
          views_count_week?: number | null
        }
        Update: {
          entity_id?: number
          entity_type?: string
          last_updated?: string | null
          saves_count?: number | null
          saves_count_month?: number | null
          saves_count_week?: number | null
          trending_score?: number | null
          views_count_month?: number | null
          views_count_today?: number | null
          views_count_week?: number | null
        }
        Relationships: []
      }
      price_ranges: {
        Row: {
          created_at: string | null
          display_order: number | null
          display_text: string
          icon: string | null
          id: number
          is_active: boolean | null
          max_price: number | null
          min_price: number | null
          name: string
          value: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          display_text: string
          icon?: string | null
          id?: number
          is_active?: boolean | null
          max_price?: number | null
          min_price?: number | null
          name: string
          value: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          display_text?: string
          icon?: string | null
          id?: number
          is_active?: boolean | null
          max_price?: number | null
          min_price?: number | null
          name?: string
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          applicable_dishes: Json | null
          applicable_sections: Json | null
          applies_to_entire_menu: boolean | null
          available_days: Json | null
          conditions: string | null
          created_at: string | null
          deleted_at: string | null
          description: string
          discount_label: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number | null
          end_time: string | null
          id: number
          is_active: boolean | null
          max_people: number | null
          min_people: number | null
          promo_code: string | null
          restaurant_id: number
          start_time: string | null
          title: string
          updated_at: string | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          applicable_dishes?: Json | null
          applicable_sections?: Json | null
          applies_to_entire_menu?: boolean | null
          available_days?: Json | null
          conditions?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description: string
          discount_label?: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value?: number | null
          end_time?: string | null
          id?: number
          is_active?: boolean | null
          max_people?: number | null
          min_people?: number | null
          promo_code?: string | null
          restaurant_id: number
          start_time?: string | null
          title: string
          updated_at?: string | null
          valid_from: string
          valid_until: string
        }
        Update: {
          applicable_dishes?: Json | null
          applicable_sections?: Json | null
          applies_to_entire_menu?: boolean | null
          available_days?: Json | null
          conditions?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string
          discount_label?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number | null
          end_time?: string | null
          id?: number
          is_active?: boolean | null
          max_people?: number | null
          min_people?: number | null
          promo_code?: string | null
          restaurant_id?: number
          start_time?: string | null
          title?: string
          updated_at?: string | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      provinces: {
        Row: {
          code: string | null
          country_id: number
          created_at: string | null
          id: number
          name: string
          region_id: number | null
        }
        Insert: {
          code?: string | null
          country_id: number
          created_at?: string | null
          id?: number
          name: string
          region_id?: number | null
        }
        Update: {
          code?: string | null
          country_id?: number
          created_at?: string | null
          id?: number
          name?: string
          region_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "provinces_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provinces_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      rating_options: {
        Row: {
          created_at: string | null
          display_order: number | null
          display_text: string
          icon: string | null
          id: number
          is_active: boolean | null
          min_rating: number
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          display_text: string
          icon?: string | null
          id?: number
          is_active?: boolean | null
          min_rating: number
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          display_text?: string
          icon?: string | null
          id?: number
          is_active?: boolean | null
          min_rating?: number
        }
        Relationships: []
      }
      regions: {
        Row: {
          code: string | null
          country_id: number
          created_at: string | null
          id: number
          latitude: number | null
          longitude: number | null
          name: string
          type: string | null
        }
        Insert: {
          code?: string | null
          country_id: number
          created_at?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name: string
          type?: string | null
        }
        Update: {
          code?: string | null
          country_id?: number
          created_at?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regions_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          description: string | null
          entity_id: number
          entity_type: string
          id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string | null
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["report_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          entity_id: number
          entity_type: string
          id?: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          entity_id?: number
          entity_type?: string
          id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_cuisines: {
        Row: {
          created_at: string | null
          cuisine_type_id: number
          is_primary: boolean | null
          restaurant_id: number
        }
        Insert: {
          created_at?: string | null
          cuisine_type_id: number
          is_primary?: boolean | null
          restaurant_id: number
        }
        Update: {
          created_at?: string | null
          cuisine_type_id?: number
          is_primary?: boolean | null
          restaurant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_cuisines_cuisine_type_id_fkey"
            columns: ["cuisine_type_id"]
            isOneToOne: false
            referencedRelation: "cuisine_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_cuisines_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_cuisines_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_cuisines_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_cuisines_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_cuisines_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_diet_stats: {
        Row: {
          glutenfree_pct: number | null
          glutenfree_total: number | null
          healthy_pct: number | null
          healthy_total: number | null
          items_total: number | null
          restaurant_id: number
          updated_at: string | null
          vegan_pct: number | null
          vegan_total: number | null
          vegetarian_pct: number | null
          vegetarian_total: number | null
        }
        Insert: {
          glutenfree_pct?: number | null
          glutenfree_total?: number | null
          healthy_pct?: number | null
          healthy_total?: number | null
          items_total?: number | null
          restaurant_id: number
          updated_at?: string | null
          vegan_pct?: number | null
          vegan_total?: number | null
          vegetarian_pct?: number | null
          vegetarian_total?: number | null
        }
        Update: {
          glutenfree_pct?: number | null
          glutenfree_total?: number | null
          healthy_pct?: number | null
          healthy_total?: number | null
          items_total?: number | null
          restaurant_id?: number
          updated_at?: string | null
          vegan_pct?: number | null
          vegan_total?: number | null
          vegetarian_pct?: number | null
          vegetarian_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_diet_stats_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_diet_stats_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_diet_stats_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_diet_stats_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_diet_stats_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_gallery: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string | null
          display_order: number | null
          id: number
          image_url: string
          restaurant_id: number
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: number
          image_url: string
          restaurant_id: number
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: number
          image_url?: string
          restaurant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_gallery_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_gallery_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_gallery_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_gallery_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_gallery_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_metrics: {
        Row: {
          avg_ticket_amount: number | null
          calls_clicks: number | null
          created_at: string | null
          directions_clicks: number | null
          dish_clicks: number | null
          id: number
          menu_views: number | null
          metric_date: string
          profile_views: number | null
          profile_views_month: number | null
          profile_views_today: number | null
          profile_views_total: number | null
          profile_views_week: number | null
          restaurant_id: number
          saves_count: number | null
          shares_count: number | null
          tickets_created: number | null
          total_ticket_amount: number | null
          updated_at: string | null
          website_clicks: number | null
        }
        Insert: {
          avg_ticket_amount?: number | null
          calls_clicks?: number | null
          created_at?: string | null
          directions_clicks?: number | null
          dish_clicks?: number | null
          id?: number
          menu_views?: number | null
          metric_date: string
          profile_views?: number | null
          profile_views_month?: number | null
          profile_views_today?: number | null
          profile_views_total?: number | null
          profile_views_week?: number | null
          restaurant_id: number
          saves_count?: number | null
          shares_count?: number | null
          tickets_created?: number | null
          total_ticket_amount?: number | null
          updated_at?: string | null
          website_clicks?: number | null
        }
        Update: {
          avg_ticket_amount?: number | null
          calls_clicks?: number | null
          created_at?: string | null
          directions_clicks?: number | null
          dish_clicks?: number | null
          id?: number
          menu_views?: number | null
          metric_date?: string
          profile_views?: number | null
          profile_views_month?: number | null
          profile_views_today?: number | null
          profile_views_total?: number | null
          profile_views_week?: number | null
          restaurant_id?: number
          saves_count?: number | null
          shares_count?: number | null
          tickets_created?: number | null
          total_ticket_amount?: number | null
          updated_at?: string | null
          website_clicks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_metrics_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_metrics_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_metrics_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_metrics_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_metrics_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_poi_proximity: {
        Row: {
          created_at: string | null
          distance_meters: number
          poi_id: number
          restaurant_id: number
        }
        Insert: {
          created_at?: string | null
          distance_meters: number
          poi_id: number
          restaurant_id: number
        }
        Update: {
          created_at?: string | null
          distance_meters?: number
          poi_id?: number
          restaurant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_poi_proximity_poi_id_fkey"
            columns: ["poi_id"]
            isOneToOne: false
            referencedRelation: "points_of_interest"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_poi_proximity_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_poi_proximity_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_poi_proximity_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_poi_proximity_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_poi_proximity_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_rating_cache: {
        Row: {
          created_at: string | null
          last_sync: string | null
          rating: number | null
          rating_count: number | null
          restaurant_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          last_sync?: string | null
          rating?: number | null
          rating_count?: number | null
          restaurant_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          last_sync?: string | null
          rating?: number | null
          rating_count?: number | null
          restaurant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_rating_cache_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_rating_cache_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_rating_cache_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_rating_cache_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_rating_cache_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_schedules: {
        Row: {
          closing_time: string
          created_at: string | null
          day_of_week: number
          id: number
          is_closed: boolean | null
          opening_time: string
          restaurant_id: number
        }
        Insert: {
          closing_time: string
          created_at?: string | null
          day_of_week: number
          id?: number
          is_closed?: boolean | null
          opening_time: string
          restaurant_id: number
        }
        Update: {
          closing_time?: string
          created_at?: string | null
          day_of_week?: number
          id?: number
          is_closed?: boolean | null
          opening_time?: string
          restaurant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_schedules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_schedules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_schedules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_schedules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_schedules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_services: {
        Row: {
          created_at: string | null
          restaurant_id: number
          service_id: number
        }
        Insert: {
          created_at?: string | null
          restaurant_id: number
          service_id: number
        }
        Update: {
          created_at?: string | null
          restaurant_id?: number
          service_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_services_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_services_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_services_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_services_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_services_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_by_category"
            referencedColumns: ["service_id"]
          },
        ]
      }
      restaurant_special_schedules: {
        Row: {
          closing_time: string | null
          created_at: string | null
          date: string
          id: number
          is_closed: boolean | null
          opening_time: string | null
          reason: string | null
          restaurant_id: number
        }
        Insert: {
          closing_time?: string | null
          created_at?: string | null
          date: string
          id?: number
          is_closed?: boolean | null
          opening_time?: string | null
          reason?: string | null
          restaurant_id: number
        }
        Update: {
          closing_time?: string | null
          created_at?: string | null
          date?: string
          id?: number
          is_closed?: boolean | null
          opening_time?: string | null
          reason?: string | null
          restaurant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_special_schedules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_special_schedules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_special_schedules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_special_schedules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_special_schedules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string
          city_id: number
          claimed_at: string | null
          cover_image_url: string | null
          created_at: string | null
          deleted_at: string | null
          delivery_links: Json | null
          description: string | null
          diet_certification_verified: boolean | null
          district_id: number | null
          email: string | null
          establishment_type_id: number
          favorites_count: number | null
          favorites_count_month: number | null
          favorites_count_week: number | null
          gallery_images: string | null
          gallery_urls: Json | null
          geom: unknown | null
          google_place_id: string | null
          google_rating: number | null
          google_rating_count: number | null
          google_rating_updated_at: string | null
          id: number
          is_active: boolean | null
          is_claimed: boolean | null
          is_published: boolean | null
          is_verified: boolean | null
          latitude: number
          location_tags: Json | null
          logo_url: string | null
          longitude: number
          meta_description: string | null
          meta_title: string | null
          municipality_id: number | null
          name: string
          nearest_poi_ids: Json | null
          owner_id: string | null
          phone: string | null
          postal_code: string | null
          price_range: Database["public"]["Enums"]["price_range"] | null
          profile_views_count: number | null
          published_at: string | null
          reservation_link: string | null
          slug: string
          social_links: Json | null
          specializes_in_diet: number | null
          subscription_expires_at: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          trial_ends_at: string | null
          updated_at: string | null
          verified_at: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address: string
          city_id: number
          claimed_at?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          delivery_links?: Json | null
          description?: string | null
          diet_certification_verified?: boolean | null
          district_id?: number | null
          email?: string | null
          establishment_type_id: number
          favorites_count?: number | null
          favorites_count_month?: number | null
          favorites_count_week?: number | null
          gallery_images?: string | null
          gallery_urls?: Json | null
          geom?: unknown | null
          google_place_id?: string | null
          google_rating?: number | null
          google_rating_count?: number | null
          google_rating_updated_at?: string | null
          id?: number
          is_active?: boolean | null
          is_claimed?: boolean | null
          is_published?: boolean | null
          is_verified?: boolean | null
          latitude: number
          location_tags?: Json | null
          logo_url?: string | null
          longitude: number
          meta_description?: string | null
          meta_title?: string | null
          municipality_id?: number | null
          name: string
          nearest_poi_ids?: Json | null
          owner_id?: string | null
          phone?: string | null
          postal_code?: string | null
          price_range?: Database["public"]["Enums"]["price_range"] | null
          profile_views_count?: number | null
          published_at?: string | null
          reservation_link?: string | null
          slug: string
          social_links?: Json | null
          specializes_in_diet?: number | null
          subscription_expires_at?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          trial_ends_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string
          city_id?: number
          claimed_at?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          delivery_links?: Json | null
          description?: string | null
          diet_certification_verified?: boolean | null
          district_id?: number | null
          email?: string | null
          establishment_type_id?: number
          favorites_count?: number | null
          favorites_count_month?: number | null
          favorites_count_week?: number | null
          gallery_images?: string | null
          gallery_urls?: Json | null
          geom?: unknown | null
          google_place_id?: string | null
          google_rating?: number | null
          google_rating_count?: number | null
          google_rating_updated_at?: string | null
          id?: number
          is_active?: boolean | null
          is_claimed?: boolean | null
          is_published?: boolean | null
          is_verified?: boolean | null
          latitude?: number
          location_tags?: Json | null
          logo_url?: string | null
          longitude?: number
          meta_description?: string | null
          meta_title?: string | null
          municipality_id?: number | null
          name?: string
          nearest_poi_ids?: Json | null
          owner_id?: string | null
          phone?: string | null
          postal_code?: string | null
          price_range?: Database["public"]["Enums"]["price_range"] | null
          profile_views_count?: number | null
          published_at?: string | null
          reservation_link?: string | null
          slug?: string
          social_links?: Json | null
          specializes_in_diet?: number | null
          subscription_expires_at?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          trial_ends_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "famous_areas_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_establishment_type_id_fkey"
            columns: ["establishment_type_id"]
            isOneToOne: false
            referencedRelation: "establishment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_specializes_in_diet_fkey"
            columns: ["specializes_in_diet"]
            isOneToOne: false
            referencedRelation: "diet_types"
            referencedColumns: ["id"]
          },
        ]
      }
      search_metrics: {
        Row: {
          avg_results_per_search: number | null
          created_at: string | null
          id: number
          metric_date: string
          most_used_filters: Json | null
          search_conversion_rate: number | null
          search_to_menu_clicks: number | null
          search_to_profile_clicks: number | null
          searches_no_results: number | null
          searches_with_results: number | null
          top_search_terms: Json | null
          total_searches: number | null
          unique_searchers: number | null
        }
        Insert: {
          avg_results_per_search?: number | null
          created_at?: string | null
          id?: number
          metric_date: string
          most_used_filters?: Json | null
          search_conversion_rate?: number | null
          search_to_menu_clicks?: number | null
          search_to_profile_clicks?: number | null
          searches_no_results?: number | null
          searches_with_results?: number | null
          top_search_terms?: Json | null
          total_searches?: number | null
          unique_searchers?: number | null
        }
        Update: {
          avg_results_per_search?: number | null
          created_at?: string | null
          id?: number
          metric_date?: string
          most_used_filters?: Json | null
          search_conversion_rate?: number | null
          search_to_menu_clicks?: number | null
          search_to_profile_clicks?: number | null
          searches_no_results?: number | null
          searches_with_results?: number | null
          top_search_terms?: Json | null
          total_searches?: number | null
          unique_searchers?: number | null
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category_id: number
          created_at: string | null
          icon: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          category_id: number
          created_at?: string | null
          icon?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          category_id?: number
          created_at?: string | null
          icon?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
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
      spice_levels: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: number
          level: number
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: number
          level: number
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: number
          level?: number
          name?: string
        }
        Relationships: []
      }
      suspicious_patterns: {
        Row: {
          confidence_score: number
          first_detected: string | null
          id: string
          last_seen: string | null
          occurrences: number | null
          pattern_data: Json
          pattern_type: string
          status: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          confidence_score: number
          first_detected?: string | null
          id?: string
          last_seen?: string | null
          occurrences?: number | null
          pattern_data: Json
          pattern_type: string
          status?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          confidence_score?: number
          first_detected?: string | null
          id?: string
          last_seen?: string | null
          occurrences?: number | null
          pattern_data?: Json
          pattern_type?: string
          status?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      ticket_items: {
        Row: {
          created_at: string | null
          dish_id: number
          dish_name: string
          id: string
          quantity: number
          subtotal: number
          ticket_id: string
          unit_price: number
          updated_at: string | null
          variant_id: number | null
        }
        Insert: {
          created_at?: string | null
          dish_id: number
          dish_name: string
          id?: string
          quantity?: number
          subtotal: number
          ticket_id: string
          unit_price: number
          updated_at?: string | null
          variant_id?: number | null
        }
        Update: {
          created_at?: string | null
          dish_id?: number
          dish_name?: string
          id?: string
          quantity?: number
          subtotal?: number
          ticket_id?: string
          unit_price?: number
          updated_at?: string | null
          variant_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_items_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_items_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_items_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "v_dishes_with_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_items_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "ticket_simulations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_items_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "dish_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_simulations: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          diner_names: Json | null
          diners_count: number | null
          expires_at: string | null
          id: string
          is_favorite: boolean | null
          is_saved: boolean | null
          last_accessed_at: string | null
          restaurant_id: number
          saved_name: string | null
          subtotal: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          diner_names?: Json | null
          diners_count?: number | null
          expires_at?: string | null
          id?: string
          is_favorite?: boolean | null
          is_saved?: boolean | null
          last_accessed_at?: string | null
          restaurant_id: number
          saved_name?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          diner_names?: Json | null
          diners_count?: number | null
          expires_at?: string | null
          id?: string
          is_favorite?: boolean | null
          is_saved?: boolean | null
          last_accessed_at?: string | null
          restaurant_id?: number
          saved_name?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_simulations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_simulations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_simulations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_simulations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_simulations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_simulations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      time_ranges: {
        Row: {
          created_at: string | null
          display_order: number | null
          display_text: string
          end_time: string
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          start_time: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          display_text: string
          end_time: string
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          start_time: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          display_text?: string
          end_time?: string
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          start_time?: string
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          created_at: string | null
          display_order: number | null
          display_text: string
          end_time: string
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          start_time: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          display_text: string
          end_time: string
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          start_time: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          display_text?: string
          end_time?: string
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          start_time?: string
        }
        Relationships: []
      }
      user_auth_providers: {
        Row: {
          created_at: string | null
          id: string
          provider: Database["public"]["Enums"]["auth_provider"]
          provider_data: Json | null
          provider_email: string | null
          provider_user_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          provider: Database["public"]["Enums"]["auth_provider"]
          provider_data?: Json | null
          provider_email?: string | null
          provider_user_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          provider?: Database["public"]["Enums"]["auth_provider"]
          provider_data?: Json | null
          provider_email?: string | null
          provider_user_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_auth_providers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cohorts: {
        Row: {
          avg_sessions_per_user: number | null
          avg_tickets_per_user: number | null
          cohort_month: string
          created_at: string | null
          id: number
          period_number: number
          retention_rate: number
          users_in_cohort: number
          users_returned: number
        }
        Insert: {
          avg_sessions_per_user?: number | null
          avg_tickets_per_user?: number | null
          cohort_month: string
          created_at?: string | null
          id?: number
          period_number: number
          retention_rate: number
          users_in_cohort: number
          users_returned: number
        }
        Update: {
          avg_sessions_per_user?: number | null
          avg_tickets_per_user?: number | null
          cohort_month?: string
          created_at?: string | null
          id?: number
          period_number?: number
          retention_rate?: number
          users_in_cohort?: number
          users_returned?: number
        }
        Relationships: []
      }
      user_devices: {
        Row: {
          created_at: string | null
          device_name: string | null
          device_token: string
          device_type: Database["public"]["Enums"]["device_type"]
          id: string
          is_active: boolean | null
          last_used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_name?: string | null
          device_token: string
          device_type: Database["public"]["Enums"]["device_type"]
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_name?: string | null
          device_token?: string
          device_type?: Database["public"]["Enums"]["device_type"]
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          id: number
          restaurant_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          restaurant_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          restaurant_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      user_metrics: {
        Row: {
          avg_pages_per_session: number | null
          avg_session_duration_minutes: number | null
          created_at: string | null
          daily_active_users: number | null
          id: number
          metric_date: string
          monthly_active_users: number | null
          new_signups: number | null
          retention_day_1: number | null
          retention_day_30: number | null
          retention_day_7: number | null
          signup_conversion_rate: number | null
          ticket_conversion_rate: number | null
          total_signups: number | null
        }
        Insert: {
          avg_pages_per_session?: number | null
          avg_session_duration_minutes?: number | null
          created_at?: string | null
          daily_active_users?: number | null
          id?: number
          metric_date: string
          monthly_active_users?: number | null
          new_signups?: number | null
          retention_day_1?: number | null
          retention_day_30?: number | null
          retention_day_7?: number | null
          signup_conversion_rate?: number | null
          ticket_conversion_rate?: number | null
          total_signups?: number | null
        }
        Update: {
          avg_pages_per_session?: number | null
          avg_session_duration_minutes?: number | null
          created_at?: string | null
          daily_active_users?: number | null
          id?: number
          metric_date?: string
          monthly_active_users?: number | null
          new_signups?: number | null
          retention_day_1?: number | null
          retention_day_30?: number | null
          retention_day_7?: number | null
          signup_conversion_rate?: number | null
          ticket_conversion_rate?: number | null
          total_signups?: number | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          allergens: Json | null
          created_at: string | null
          dietary_preferences: Json | null
          email_notifications: boolean | null
          marketing_emails: boolean | null
          push_notifications: boolean | null
          search_radius_km: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allergens?: Json | null
          created_at?: string | null
          dietary_preferences?: Json | null
          email_notifications?: boolean | null
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          search_radius_km?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allergens?: Json | null
          created_at?: string | null
          dietary_preferences?: Json | null
          email_notifications?: boolean | null
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          search_radius_km?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_saved_dishes: {
        Row: {
          dish_id: number
          is_active: boolean | null
          restaurant_id: number
          saved_at: string | null
          saved_from: string | null
          unsaved_at: string | null
          user_id: string
        }
        Insert: {
          dish_id: number
          is_active?: boolean | null
          restaurant_id: number
          saved_at?: string | null
          saved_from?: string | null
          unsaved_at?: string | null
          user_id: string
        }
        Update: {
          dish_id?: number
          is_active?: boolean | null
          restaurant_id?: number
          saved_at?: string | null
          saved_from?: string | null
          unsaved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_saved_dishes_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_dishes_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_dishes_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "v_dishes_with_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_dishes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_saved_events: {
        Row: {
          event_id: number
          is_active: boolean | null
          restaurant_id: number
          saved_at: string | null
          saved_from: string | null
          unsaved_at: string | null
          user_id: string
        }
        Insert: {
          event_id: number
          is_active?: boolean | null
          restaurant_id: number
          saved_at?: string | null
          saved_from?: string | null
          unsaved_at?: string | null
          user_id: string
        }
        Update: {
          event_id?: number
          is_active?: boolean | null
          restaurant_id?: number
          saved_at?: string | null
          saved_from?: string | null
          unsaved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_saved_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_saved_restaurants: {
        Row: {
          is_active: boolean | null
          restaurant_id: number
          saved_at: string | null
          saved_from: string | null
          unsaved_at: string | null
          user_id: string
        }
        Insert: {
          is_active?: boolean | null
          restaurant_id: number
          saved_at?: string | null
          saved_from?: string | null
          unsaved_at?: string | null
          user_id: string
        }
        Update: {
          is_active?: boolean | null
          restaurant_id?: number
          saved_at?: string | null
          saved_from?: string | null
          unsaved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_saved_restaurants_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_restaurants_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_restaurants_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_restaurants_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_restaurants_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_restaurants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_search_history: {
        Row: {
          filters_applied: Json | null
          id: string
          results_count: number | null
          search_query: string
          search_type: string | null
          searched_at: string | null
          user_id: string | null
        }
        Insert: {
          filters_applied?: Json | null
          id?: string
          results_count?: number | null
          search_query: string
          search_type?: string | null
          searched_at?: string | null
          user_id?: string | null
        }
        Update: {
          filters_applied?: Json | null
          id?: string
          results_count?: number | null
          search_query?: string
          search_type?: string | null
          searched_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_search_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          actions_taken: number | null
          city_id: number | null
          device_type: Database["public"]["Enums"]["device_type"] | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          ip_address: unknown | null
          is_suspicious: boolean | null
          pages_viewed: number | null
          session_id: string
          started_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          actions_taken?: number | null
          city_id?: number | null
          device_type?: Database["public"]["Enums"]["device_type"] | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_suspicious?: boolean | null
          pages_viewed?: number | null
          session_id: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          actions_taken?: number | null
          city_id?: number | null
          device_type?: Database["public"]["Enums"]["device_type"] | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_suspicious?: boolean | null
          pages_viewed?: number | null
          session_id?: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          default_location_address: string | null
          default_location_lat: number | null
          default_location_lng: number | null
          deleted_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          login_count: number | null
          phone: string | null
          phone_verified: boolean | null
          preferences: Json
          preferred_currency_id: number | null
          preferred_language_id: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          default_location_address?: string | null
          default_location_lat?: number | null
          default_location_lng?: number | null
          deleted_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          login_count?: number | null
          phone?: string | null
          phone_verified?: boolean | null
          preferences?: Json
          preferred_currency_id?: number | null
          preferred_language_id?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          default_location_address?: string | null
          default_location_lat?: number | null
          default_location_lng?: number | null
          deleted_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          login_count?: number | null
          phone?: string | null
          phone_verified?: boolean | null
          preferences?: Json
          preferred_currency_id?: number | null
          preferred_language_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_preferred_currency_id_fkey"
            columns: ["preferred_currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_preferred_language_id_fkey"
            columns: ["preferred_language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_fraud_alerts: {
        Row: {
          alert_data: Json | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string | null
          investigated_at: string | null
          investigated_by: string | null
          investigated_by_name: string | null
          resolution_notes: string | null
          rule_id: number | null
          rule_name: string | null
          rule_severity: number | null
          severity_level: number | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_alerts_investigated_by_fkey"
            columns: ["investigated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_alerts_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "fraud_detection_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_summary: {
        Row: {
          diet_name: string | null
          diet_type: string | null
          dishes_count: number | null
          restaurants_count: number | null
        }
        Relationships: []
      }
      dishes_full: {
        Row: {
          allergens: Json | null
          base_price: number | null
          category_id: number | null
          category_name: string | null
          created_at: string | null
          custom_tags: Json | null
          deleted_at: string | null
          description: string | null
          diet_types: Json | null
          id: number | null
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string | null
          preparation_time_minutes: number | null
          restaurant_id: number | null
          restaurant_name: string | null
          restaurant_slug: string | null
          section_id: number | null
          section_name: string | null
          spice_level: number | null
          updated_at: string | null
          variants: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "dishes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "dish_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "menu_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      famous_areas_summary: {
        Row: {
          city_name: string | null
          description: string | null
          district_type: string | null
          id: number | null
          name: string | null
          points_of_interest: string[] | null
          restaurants_count: number | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      most_favorited_items: {
        Row: {
          id: number | null
          image_url: string | null
          name: string | null
          slug: string | null
          total_favorites: number | null
          type: string | null
          week_favorites: number | null
        }
        Relationships: []
      }
      restaurant_stats: {
        Row: {
          avg_ticket_value: number | null
          google_rating: number | null
          google_rating_count: number | null
          id: number | null
          name: string | null
          saves_count: number | null
          slug: string | null
          total_menu_views: number | null
          total_profile_views: number | null
          total_tickets: number | null
        }
        Relationships: []
      }
      restaurants_full: {
        Row: {
          address: string | null
          city_id: number | null
          city_name: string | null
          claimed_at: string | null
          country_name: string | null
          cover_image_url: string | null
          created_at: string | null
          cuisine_types: string[] | null
          deleted_at: string | null
          delivery_links: Json | null
          description: string | null
          dishes_count: number | null
          district_id: number | null
          district_name: string | null
          email: string | null
          establishment_type_id: number | null
          establishment_type_name: string | null
          gallery_urls: Json | null
          google_place_id: string | null
          google_rating: number | null
          google_rating_count: number | null
          google_rating_updated_at: string | null
          id: number | null
          is_active: boolean | null
          is_claimed: boolean | null
          is_published: boolean | null
          is_verified: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          meta_description: string | null
          meta_title: string | null
          name: string | null
          owner_id: string | null
          phone: string | null
          postal_code: string | null
          price_range: Database["public"]["Enums"]["price_range"] | null
          province_name: string | null
          published_at: string | null
          reservation_link: string | null
          sections_count: number | null
          services: string[] | null
          slug: string | null
          social_links: Json | null
          subscription_expires_at: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          trial_ends_at: string | null
          updated_at: string | null
          verified_at: string | null
          website: string | null
          whatsapp: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "famous_areas_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_establishment_type_id_fkey"
            columns: ["establishment_type_id"]
            isOneToOne: false
            referencedRelation: "establishment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants_with_counters: {
        Row: {
          address: string | null
          city_id: number | null
          claimed_at: string | null
          cover_image_url: string | null
          created_at: string | null
          deleted_at: string | null
          delivery_links: Json | null
          description: string | null
          diet_certification_verified: boolean | null
          district_id: number | null
          email: string | null
          establishment_type_id: number | null
          gallery_urls: Json | null
          google_place_id: string | null
          google_rating: number | null
          google_rating_count: number | null
          google_rating_updated_at: string | null
          id: number | null
          is_active: boolean | null
          is_claimed: boolean | null
          is_published: boolean | null
          is_verified: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          meta_description: string | null
          meta_title: string | null
          name: string | null
          owner_id: string | null
          phone: string | null
          postal_code: string | null
          price_range: Database["public"]["Enums"]["price_range"] | null
          published_at: string | null
          reservation_link: string | null
          saves_this_week: number | null
          slug: string | null
          social_links: Json | null
          specializes_in_diet: number | null
          subscription_expires_at: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          total_saves: number | null
          trending_score: number | null
          trial_ends_at: string | null
          updated_at: string | null
          verified_at: string | null
          views_today: number | null
          website: string | null
          whatsapp: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "famous_areas_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_establishment_type_id_fkey"
            columns: ["establishment_type_id"]
            isOneToOne: false
            referencedRelation: "establishment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_specializes_in_diet_fkey"
            columns: ["specializes_in_diet"]
            isOneToOne: false
            referencedRelation: "diet_types"
            referencedColumns: ["id"]
          },
        ]
      }
      services_by_category: {
        Row: {
          category_name: string | null
          category_order: number | null
          category_slug: string | null
          service_icon: string | null
          service_id: number | null
          service_name: string | null
          service_slug: string | null
        }
        Relationships: []
      }
      tickets_summary: {
        Row: {
          code: string | null
          created_at: string | null
          created_by: string | null
          diner_names: Json | null
          diners_count: number | null
          expires_at: string | null
          id: string | null
          is_favorite: boolean | null
          is_saved: boolean | null
          items_count: number | null
          last_accessed_at: string | null
          per_person_amount: number | null
          restaurant_id: number | null
          restaurant_name: string | null
          restaurant_slug: string | null
          saved_name: string | null
          subtotal: number | null
          total: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_simulations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_simulations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_simulations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_simulations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_simulations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_simulations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      v_dishes_with_images: {
        Row: {
          allergens: Json | null
          base_price: number | null
          category_id: number | null
          created_at: string | null
          custom_tags: Json | null
          deleted_at: string | null
          description: string | null
          diet_types: Json | null
          display_image: string | null
          id: number | null
          image_alt: string | null
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_gluten_free: boolean | null
          is_healthy: boolean | null
          is_lactose_free: boolean | null
          is_vegan: boolean | null
          is_vegetarian: boolean | null
          name: string | null
          preparation_time_minutes: number | null
          restaurant_id: number | null
          restaurant_name: string | null
          restaurant_slug: string | null
          section_id: number | null
          spice_level: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dishes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "dish_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "menu_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      v_restaurant_galleries: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string | null
          display_order: number | null
          id: number | null
          image_url: string | null
          restaurant_id: number | null
          restaurant_name: string | null
          restaurant_slug: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_gallery_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_gallery_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_gallery_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_gallery_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_with_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_gallery_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "v_restaurants_with_images"
            referencedColumns: ["id"]
          },
        ]
      }
      v_restaurants_with_images: {
        Row: {
          address: string | null
          city_id: number | null
          claimed_at: string | null
          cover_image_url: string | null
          created_at: string | null
          delivery_links: Json | null
          description: string | null
          diet_certification_verified: boolean | null
          district_id: number | null
          email: string | null
          establishment_type_id: number | null
          gallery_count: number | null
          gallery_images: string | null
          gallery_urls: Json | null
          google_place_id: string | null
          google_rating: number | null
          google_rating_count: number | null
          google_rating_updated_at: string | null
          id: number | null
          is_active: boolean | null
          is_claimed: boolean | null
          is_published: boolean | null
          is_verified: boolean | null
          latitude: number | null
          location_tags: Json | null
          logo_url: string | null
          longitude: number | null
          main_image: string | null
          meta_description: string | null
          meta_title: string | null
          municipality_id: number | null
          name: string | null
          nearest_poi_ids: Json | null
          owner_id: string | null
          phone: string | null
          postal_code: string | null
          price_range: Database["public"]["Enums"]["price_range"] | null
          published_at: string | null
          reservation_link: string | null
          slug: string | null
          social_links: Json | null
          specializes_in_diet: number | null
          subscription_expires_at: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          trial_ends_at: string | null
          updated_at: string | null
          verified_at: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          city_id?: number | null
          claimed_at?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          delivery_links?: Json | null
          description?: string | null
          diet_certification_verified?: boolean | null
          district_id?: number | null
          email?: string | null
          establishment_type_id?: number | null
          gallery_count?: never
          gallery_images?: string | null
          gallery_urls?: Json | null
          google_place_id?: string | null
          google_rating?: number | null
          google_rating_count?: number | null
          google_rating_updated_at?: string | null
          id?: number | null
          is_active?: boolean | null
          is_claimed?: boolean | null
          is_published?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location_tags?: Json | null
          logo_url?: string | null
          longitude?: number | null
          main_image?: never
          meta_description?: string | null
          meta_title?: string | null
          municipality_id?: number | null
          name?: string | null
          nearest_poi_ids?: Json | null
          owner_id?: string | null
          phone?: string | null
          postal_code?: string | null
          price_range?: Database["public"]["Enums"]["price_range"] | null
          published_at?: string | null
          reservation_link?: string | null
          slug?: string | null
          social_links?: Json | null
          specializes_in_diet?: number | null
          subscription_expires_at?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          trial_ends_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          city_id?: number | null
          claimed_at?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          delivery_links?: Json | null
          description?: string | null
          diet_certification_verified?: boolean | null
          district_id?: number | null
          email?: string | null
          establishment_type_id?: number | null
          gallery_count?: never
          gallery_images?: string | null
          gallery_urls?: Json | null
          google_place_id?: string | null
          google_rating?: number | null
          google_rating_count?: number | null
          google_rating_updated_at?: string | null
          id?: number | null
          is_active?: boolean | null
          is_claimed?: boolean | null
          is_published?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location_tags?: Json | null
          logo_url?: string | null
          longitude?: number | null
          main_image?: never
          meta_description?: string | null
          meta_title?: string | null
          municipality_id?: number | null
          name?: string | null
          nearest_poi_ids?: Json | null
          owner_id?: string | null
          phone?: string | null
          postal_code?: string | null
          price_range?: Database["public"]["Enums"]["price_range"] | null
          published_at?: string | null
          reservation_link?: string | null
          slug?: string | null
          social_links?: Json | null
          specializes_in_diet?: number | null
          subscription_expires_at?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          trial_ends_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "famous_areas_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_establishment_type_id_fkey"
            columns: ["establishment_type_id"]
            isOneToOne: false
            referencedRelation: "establishment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_specializes_in_diet_fkey"
            columns: ["specializes_in_diet"]
            isOneToOne: false
            referencedRelation: "diet_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
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
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
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
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
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
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
        Returns: string
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      cleanup_rating_cache: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
          | { column_name: string; schema_name: string; table_name: string }
          | { column_name: string; table_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      fast_restaurant_autocomplete: {
        Args: { max_results?: number; search_query: string }
        Returns: {
          id: number
          name: string
          similarity_score: number
          slug: string
        }[]
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
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
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
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
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
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
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
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
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      get_stale_rating_cache: {
        Args: Record<PropertyKey, never>
        Returns: {
          days_old: number
          last_sync: string
          restaurant_id: number
        }[]
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: string
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
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
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      recalc_diet_stats: {
        Args: { restaurant_id_param: number }
        Returns: undefined
      }
      search_dishes_fulltext: {
        Args: { max_results?: number; search_query: string }
        Returns: {
          base_price: number
          category_name: string
          description: string
          id: number
          image_url: string
          name: string
          restaurant_id: number
          restaurant_name: string
          restaurant_slug: string
          ts_rank: number
        }[]
      }
      search_feed: {
        Args: {
          p_cuisines?: number[]
          p_diet?: string
          p_diet_pct_min?: number
          p_est_types?: number[]
          p_lat?: number
          p_limit?: number
          p_lon?: number
          p_max_km?: number
          p_min_rating?: number
          p_price_bands?: string[]
          p_q?: string
        }
        Returns: {
          cover_image_url: string
          cuisine_types: string[]
          description: string
          diet_pct: number
          distance_km: number
          establishment_type: string
          favorites_count: number
          id: number
          logo_url: string
          name: string
          price_range: string
          rating: number
          rating_count: number
          services: string[]
          slug: string
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
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
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
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
      st_3dperimeter: {
        Args: { "": unknown }
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
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { format?: string; geom: unknown }
        Returns: string
      }
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
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; rel?: number }
          | { geom: unknown; maxdecimaldigits?: number; rel?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
          | {
              geom: unknown
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
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; options?: string; radius: number }
          | { geom: unknown; quadsegs: number; radius: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
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
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
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
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
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
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { dm?: number; dx: number; dy: number; dz?: number; geom: unknown }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
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
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
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
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { font?: Json; letters: string }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
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
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
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
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
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
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
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
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
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
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { from_proj: string; geom: unknown; to_proj: string }
          | { from_proj: string; geom: unknown; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
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
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      sync_restaurant_rating_cache: {
        Args: { restaurant_id_param?: number }
        Returns: undefined
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      track_profile_view: {
        Args: { restaurant_id_param: number }
        Returns: undefined
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
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
      age_restriction:
        | "all_ages"
        | "over_16"
        | "over_18"
        | "over_21"
        | "family_only"
      app_role: "admin" | "moderator" | "user"
      auth_provider: "google" | "apple" | "email"
      device_type: "ios" | "android" | "web"
      discount_type: "percentage" | "fixed" | "two_for_one"
      dress_code:
        | "casual"
        | "smart_casual"
        | "formal"
        | "elegant"
        | "themed"
        | "free"
      invoice_status: "pending" | "paid" | "overdue" | "cancelled"
      notification_type: "promotion" | "event" | "system" | "marketing"
      price_range: "€" | "€€" | "€€€" | "€€€€"
      report_reason: "inappropriate" | "spam" | "fake" | "copyright"
      report_status: "pending" | "reviewed" | "resolved" | "dismissed"
      subscription_plan: "free" | "premium"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
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
      age_restriction: [
        "all_ages",
        "over_16",
        "over_18",
        "over_21",
        "family_only",
      ],
      app_role: ["admin", "moderator", "user"],
      auth_provider: ["google", "apple", "email"],
      device_type: ["ios", "android", "web"],
      discount_type: ["percentage", "fixed", "two_for_one"],
      dress_code: [
        "casual",
        "smart_casual",
        "formal",
        "elegant",
        "themed",
        "free",
      ],
      invoice_status: ["pending", "paid", "overdue", "cancelled"],
      notification_type: ["promotion", "event", "system", "marketing"],
      price_range: ["€", "€€", "€€€", "€€€€"],
      report_reason: ["inappropriate", "spam", "fake", "copyright"],
      report_status: ["pending", "reviewed", "resolved", "dismissed"],
      subscription_plan: ["free", "premium"],
    },
  },
} as const
