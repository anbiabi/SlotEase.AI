# Supabase Cloud Instance Setup Guide

## Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign in with GitHub (recommended) or email

2. **Create New Project**
   - Click "New Project"
   - Choose your organization (or create one)
   - Fill in project details:
     - **Name**: `SlotEase Production` (or your preferred name)
     - **Database Password**: Generate a strong password (save this!)
     - **Region**: Choose closest to your users
     - **Pricing Plan**: Start with Free tier (can upgrade later)

3. **Wait for Project Creation**
   - This takes 2-3 minutes
   - You'll see a progress indicator

## Step 2: Get Your Project Credentials

Once your project is ready:

1. **Navigate to Settings**
   - Click "Settings" in the left sidebar
   - Go to "API" section

2. **Copy Your Credentials**
   ```
   Project URL: https://[your-project-ref].supabase.co
   Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Save These Securely**
   - You'll need the Project URL and Anon Key for your app
   - Keep the Service Role Key secure (for server-side operations)

## Step 3: Apply Database Schema

1. **Go to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

2. **Run Migration Files in Order**
   
   **Migration 1: Core Schema**
   - Copy content from `supabase/migrations/20250627104649_jade_ember.sql`
   - Paste into SQL Editor
   - Click "Run" (bottom right)
   - Wait for "Success" message

   **Migration 2: Security Policies**
   - Copy content from `supabase/migrations/20250627104736_floral_haze.sql`
   - Paste into new query
   - Click "Run"

   **Migration 3: Materialized Views**
   - Copy content from `supabase/migrations/20250627104756_silent_recipe.sql`
   - Paste into new query
   - Click "Run"

   **Migration 4: Functions & Triggers**
   - Copy content from `supabase/migrations/20250627104826_throbbing_flame.sql`
   - Paste into new query
   - Click "Run"

   **Migration 5: Performance Optimization**
   - Copy content from `supabase/migrations/20250627104918_hidden_frost.sql`
   - Paste into new query
   - Click "Run"

3. **Verify Schema**
   - Go to "Table Editor"
   - You should see 9 tables: organizations, services, user_profiles, appointments, queues, notifications, analytics_events, feedback, system_config

## Step 4: Configure Authentication

1. **Go to Authentication Settings**
   - Click "Authentication" in sidebar
   - Go to "Settings" tab

2. **Configure Auth Settings**
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add your production domain when ready
   - **Email Confirmations**: Disabled (for easier testing)
   - **Enable email signup**: Enabled

3. **Optional: Configure Email Templates**
   - Customize confirmation and reset email templates
   - Add your branding

## Step 5: Deploy Edge Functions (Optional)

1. **Install Supabase CLI** (if not already installed)
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link Your Project**
   ```bash
   supabase link --project-ref [your-project-ref]
   ```

4. **Deploy Functions**
   ```bash
   supabase functions deploy appointment-management
   supabase functions deploy notification-service
   supabase functions deploy analytics-service
   ```

## Step 6: Configure Environment Variables

Create or update your `.env` file:

```env
# Supabase Configuration (Production)
VITE_SUPABASE_URL=https://[your-project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# AI Integration (if using)
MISTRAL_API_KEY=your-mistral-api-key
MISTRAL_API_URL=https://api.mistral.ai/v1/chat/completions
```

## Step 7: Test Your Setup

1. **Start Your Application**
   ```bash
   npm run dev
   ```

2. **Check Status Indicator**
   - Look for green "Connected" status in top-left corner
   - Click it to see detailed status

3. **Test Basic Operations**
   - Try creating a user account
   - Test the booking flow
   - Check if data appears in Supabase dashboard

## Step 8: Production Deployment

When ready for production:

1. **Update Environment Variables**
   - Add your production domain to Supabase Auth settings
   - Update CORS settings if needed

2. **Configure Custom Domain** (Optional)
   - Go to Settings > Custom Domains
   - Add your domain and follow verification steps

3. **Set Up Monitoring**
   - Enable database logs
   - Set up alerts for errors
   - Monitor API usage

## Security Checklist

- ✅ Row Level Security enabled on all tables
- ✅ Anon key has limited permissions
- ✅ Service role key kept secure
- ✅ Auth policies configured
- ✅ CORS settings configured
- ✅ Environment variables secured

## Troubleshooting

### Common Issues

1. **Migration Errors**
   - Check for syntax errors in SQL
   - Ensure migrations run in correct order
   - Check Supabase logs for details

2. **Connection Issues**
   - Verify environment variables
   - Check network connectivity
   - Ensure project is not paused

3. **Auth Issues**
   - Check Site URL configuration
   - Verify email settings
   - Check RLS policies

### Getting Help

- Supabase Documentation: [docs.supabase.com](https://docs.supabase.com)
- Community Discord: [discord.supabase.com](https://discord.supabase.com)
- GitHub Issues: [github.com/supabase/supabase](https://github.com/supabase/supabase)

## Next Steps

After successful setup:
1. Test all application features
2. Set up monitoring and alerts
3. Configure backup strategies
4. Plan for scaling as needed
5. Set up CI/CD for future deployments