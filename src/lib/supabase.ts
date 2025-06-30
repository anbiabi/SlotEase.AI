import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript support
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          type: string;
          description: string | null;
          email: string;
          phone: string | null;
          website: string | null;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string;
          location: unknown | null;
          timezone: string;
          business_hours: Record<string, unknown>;
          settings: Record<string, unknown>;
          is_active: boolean;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
      };
      services: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          category: string | null;
          duration_minutes: number;
          price: number | null;
          max_advance_booking_days: number | null;
          min_advance_booking_hours: number | null;
          max_concurrent_appointments: number;
          buffer_time_minutes: number;
          allow_walk_in: boolean;
          requires_preparation: boolean;
          priority: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          date_of_birth: string | null;
          preferred_language: string;
          timezone: string;
          notification_preferences: Record<string, unknown>;
          accessibility_needs: string[] | null;
          role: string;
          organization_id: string | null;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          organization_id: string;
          service_id: string;
          user_id: string;
          appointment_date: string;
          start_time: string;
          end_time: string;
          duration_minutes: number;
          status: string;
          booking_channel: string;
          priority: string;
          queue_position: number | null;
          estimated_wait_minutes: number | null;
          check_in_time: string | null;
          service_start_time: string | null;
          service_end_time: string | null;
          notes: string | null;
          internal_notes: string | null;
          cancellation_reason: string | null;
          guest_name: string | null;
          guest_phone: string | null;
          guest_email: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
      };
      queues: {
        Row: {
          id: string;
          organization_id: string;
          service_id: string;
          appointment_id: string | null;
          queue_date: string;
          position: number;
          estimated_wait_minutes: number | null;
          status: string;
          called_at: string | null;
          served_at: string | null;
          completed_at: string | null;
          last_updated: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string | null;
          appointment_id: string | null;
          type: string;
          title: string;
          message: string;
          recipient_phone: string | null;
          recipient_email: string | null;
          status: string;
          sent_at: string | null;
          delivered_at: string | null;
          read_at: string | null;
          scheduled_for: string;
          created_at: string;
          created_date: string;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          organization_id: string | null;
          user_id: string | null;
          event_type: string;
          event_data: Record<string, unknown> | null;
          session_id: string | null;
          user_agent: string | null;
          ip_address: string | null;
          occurred_at: string;
          event_date: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          organization_id: string;
          service_id: string | null;
          appointment_id: string | null;
          user_id: string | null;
          overall_rating: number | null;
          wait_time_rating: number | null;
          service_quality_rating: number | null;
          staff_rating: number | null;
          comment: string | null;
          is_verified: boolean;
          is_public: boolean;
          created_at: string;
        };
      };
      ai_service_requests: {
        Row: {
          id: string;
          service_id: string | null;
          user_id: string | null;
          request_type: string;
          request_data: Record<string, unknown>;
          priority: string;
          status: string;
          response_data: Record<string, unknown>;
          processing_time_ms: number | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}