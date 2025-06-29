import { supabase } from '../lib/supabase';
import { logError } from '../utils/logError';

export class SupabaseService {
  private static instance: SupabaseService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  /**
   * Initialize Supabase connection and verify environment
   */
  async initialize(): Promise<boolean> {
    try {
      // Test connection
      const { error } = await supabase
        .from('ai_service_requests')
        .select('count')
        .limit(1);

      if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist"
        logError(error, 'SupabaseService: Connection test failed');
        return false;
      }

      this.isInitialized = true;
      console.log('Supabase connection initialized successfully');
      return true;
    } catch (error) {
      logError(error, 'SupabaseService: Failed to initialize');
      return false;
    }
  }

  /**
   * Check if Supabase is properly configured
   */
  async checkConfiguration(): Promise<{
    isConfigured: boolean;
    missingEnvVars: string[];
    connectionStatus: 'connected' | 'disconnected' | 'error';
  }> {
    const missingEnvVars: string[] = [];
    
    if (!import.meta.env.VITE_SUPABASE_URL) {
      missingEnvVars.push('VITE_SUPABASE_URL');
    }
    
    if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
      missingEnvVars.push('VITE_SUPABASE_ANON_KEY');
    }

    if (missingEnvVars.length > 0) {
      return {
        isConfigured: false,
        missingEnvVars,
        connectionStatus: 'disconnected'
      };
    }

    try {
      const isConnected = await this.initialize();
      return {
        isConfigured: true,
        missingEnvVars: [],
        connectionStatus: isConnected ? 'connected' : 'error'
      };
    } catch (error) {
      logError(error, 'SupabaseService: Configuration check failed');
      return {
        isConfigured: true,
        missingEnvVars: [],
        connectionStatus: 'error'
      };
    }
  }

  /**
   * Get environment setup instructions
   */
  getEnvironmentSetupInstructions(): string {
    return `
To set up Supabase environment variables:

1. Create a .env file in your project root
2. Add the following variables:

For local development:
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key

For production:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

3. Start Supabase locally:
   npx supabase start

4. Get your local anon key:
   npx supabase status
    `;
  }

  /**
   * Get the Supabase client instance
   */
  getClient() {
    return supabase;
  }

  /**
   * Check if the service is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const supabaseService = SupabaseService.getInstance(); 