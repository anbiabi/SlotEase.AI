# Supabase Setup Instructions

## Option 1: Local Development (Recommended for Testing)

### Prerequisites
- Docker Desktop installed and running
- Node.js 16+ installed

### Steps
1. **Start Supabase locally**:
   ```bash
   npx supabase start
   ```

2. **Get your local credentials**:
   ```bash
   npx supabase status
   ```
   Copy the `anon key` from the output.

3. **Create environment file**:
   Create `.env` in project root:
   ```env
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_ANON_KEY=your-copied-anon-key
   ```

4. **Verify connection**:
   ```bash
   npm run dev
   ```
   Check browser console for "Supabase connection initialized successfully"

## Option 2: Cloud Production Setup

### Steps
1. **Create Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Apply database schema**:
   - Go to SQL Editor in Supabase dashboard
   - Run the migration files in order:
     1. `supabase/migrations/20250627104649_jade_ember.sql`
     2. `supabase/migrations/20250627104736_floral_haze.sql`
     3. `supabase/migrations/20250627104756_silent_recipe.sql`
     4. `supabase/migrations/20250627104826_throbbing_flame.sql`
     5. `supabase/migrations/20250627104918_hidden_frost.sql`

3. **Configure environment**:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-project-anon-key
   ```

## Verification Steps

1. **Check connection status**:
   - Look for green "connected" indicator in top-left corner (dev mode)
   - No console errors related to Supabase

2. **Test AI integration**:
   - Make a test booking
   - Check browser console for AI processing logs
   - Verify data in Supabase `ai_service_requests` table

3. **Verify database**:
   - Check that all tables exist in Supabase dashboard
   - Confirm RLS policies are active
   - Test basic CRUD operations

## Troubleshooting

### Common Issues
1. **Docker not running**: Start Docker Desktop
2. **Port conflicts**: Stop other services on ports 54321-54324
3. **Permission errors**: Run with appropriate permissions
4. **Network issues**: Check firewall settings

### Debug Commands
```bash
# Check Supabase status
npx supabase status

# View logs
npx supabase logs

# Reset local database
npx supabase db reset

# Stop Supabase
npx supabase stop
```