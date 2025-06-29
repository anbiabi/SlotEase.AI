import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript support
export interface Database {
  public: {
    Tables: {
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
        Insert: {
          id?: string;
          service_id?: string | null;
          user_id?: string | null;
          request_type: string;
          request_data?: Record<string, unknown>;
          priority?: string;
          status?: string;
          response_data?: Record<string, unknown>;
          processing_time_ms?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string | null;
          user_id?: string | null;
          request_type?: string;
          request_data?: Record<string, unknown>;
          priority?: string;
          status?: string;
          response_data?: Record<string, unknown>;
          processing_time_ms?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 