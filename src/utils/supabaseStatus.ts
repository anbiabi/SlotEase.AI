/**
 * Utility to check and display Supabase integration status
 */

export interface SupabaseStatus {
  isConfigured: boolean;
  isConnected: boolean;
  missingEnvVars: string[];
  databaseReady: boolean;
  authEnabled: boolean;
  edgeFunctionsReady: boolean;
  errors: string[];
}

export async function checkSupabaseStatus(): Promise<SupabaseStatus> {
  const status: SupabaseStatus = {
    isConfigured: false,
    isConnected: false,
    missingEnvVars: [],
    databaseReady: false,
    authEnabled: false,
    edgeFunctionsReady: false,
    errors: []
  };

  // Check environment variables
  const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    status.missingEnvVars = missingVars;
    status.errors.push(`Missing environment variables: ${missingVars.join(', ')}`);
    return status;
  }

  status.isConfigured = true;

  try {
    // Dynamic import to avoid issues if Supabase isn't configured
    const { supabase } = await import('../lib/supabase');
    
    // Test basic connection
    const { error: connectionError } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);

    if (connectionError && connectionError.code !== 'PGRST116') {
      status.errors.push(`Database connection failed: ${connectionError.message}`);
      return status;
    }

    status.isConnected = true;
    status.databaseReady = true;

    // Test auth
    const { data: authData, error: authError } = await supabase.auth.getSession();
    status.authEnabled = !authError;

    // Test edge functions (optional)
    try {
      const { error: functionError } = await supabase.functions.invoke('appointment-management', {
        body: { test: true }
      });
      status.edgeFunctionsReady = !functionError;
    } catch {
      // Edge functions might not be deployed, that's okay
      status.edgeFunctionsReady = false;
    }

  } catch (error) {
    status.errors.push(`Supabase initialization failed: ${error.message}`);
  }

  return status;
}

export function getSetupInstructions(status: SupabaseStatus): string {
  if (!status.isConfigured) {
    return `
Please set up your environment variables:

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

  if (!status.isConnected) {
    return `
Supabase is configured but not connected. Please:

1. Ensure Supabase is running (for local development):
   npx supabase start

2. Check your environment variables are correct
3. Verify network connectivity
4. Check the browser console for detailed error messages
    `;
  }

  return 'Supabase is properly configured and connected!';
}