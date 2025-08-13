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
          icon_emoji: string | null
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
          icon_emoji?: string | null
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
          icon_emoji?: string | null
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
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
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
