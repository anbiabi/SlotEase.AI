# SlotEase.AI Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Docker Desktop** (for local Supabase development)
3. **Mistral API Key** (for AI integration)

## Environment Setup

### 1. Create Environment File

Create a `.env` file in your project root with the following variables:

```env
# Mistral AI Configuration
MISTRAL_API_KEY=your-mistral-api-key-here
MISTRAL_API_URL=https://api.mistral.ai/v1/chat/completions

# Supabase Configuration (Local Development)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key

# For Production (replace with your actual Supabase project)
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### 2. Install Dependencies

```bash
npm install
```

## Supabase Setup

### Option A: Local Development (Recommended)

1. **Install Docker Desktop**
   - Download from [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Start Docker Desktop

2. **Start Supabase Locally**
   ```bash
   npx supabase start
   ```

3. **Get Local Anon Key**
   ```bash
   npx supabase status
   ```
   Copy the `anon` key to your `.env` file.

4. **Apply Database Schema**
   ```bash
   npx supabase db push
   ```

### Option B: Cloud Supabase

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key

2. **Update Environment Variables**
   - Replace the local URLs with your cloud project URLs

3. **Apply Database Schema**
   - Use the SQL from `DATABASE_SCHEMA.md` in the Supabase SQL editor

## AI Integration Setup

### 1. Get Mistral API Key

1. **Sign up for Mistral AI**
   - Visit [mistral.ai](https://mistral.ai)
   - Create an account and get your API key

2. **Add to Environment**
   - Add your API key to the `.env` file

### 2. Test AI Integration

The AI integration is already configured to run in the background. Every booking will automatically:

- Generate appointment reminders
- Analyze booking patterns
- Create documentation
- Provide feedback insights

## Running the Application

### 1. Start Development Server

```bash
npm run dev
```

### 2. Verify Setup

1. **Check Supabase Connection**
   - Open browser console
   - Look for "Supabase connection initialized successfully"

2. **Test AI Processing**
   - Make a booking through the app
   - Check browser console for AI processing logs
   - Verify data is stored in Supabase

## Troubleshooting

### Docker Issues

If you get Docker connection errors:

1. **Ensure Docker Desktop is running**
2. **Restart Docker Desktop**
3. **Try alternative Supabase setup:**
   ```bash
   npx supabase stop
   npx supabase start
   ```

### Environment Variables

If environment variables aren't loading:

1. **Restart the development server**
2. **Check variable names start with `VITE_`**
3. **Verify `.env` file is in project root**

### AI Integration Issues

If AI processing fails:

1. **Verify Mistral API key is correct**
2. **Check API key has sufficient credits**
3. **Review browser console for error messages**

## Production Deployment

### 1. Environment Variables

Update your `.env` file with production values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
MISTRAL_API_KEY=your-production-mistral-key
```

### 2. Build Application

```bash
npm run build
```

### 3. Deploy

Deploy the `dist` folder to your hosting provider.

## Architecture Overview

### AI Background Processing

- **Location**: `src/ai/AIBackgroundProcessor.ts`
- **Purpose**: Processes bookings with AI in the background
- **Storage**: Results stored in Supabase `ai_service_requests` table
- **Integration**: Called automatically after each booking

### Supabase Integration

- **Client**: `src/lib/supabase.ts`
- **Service**: `src/services/SupabaseService.ts`
- **Tables**: See `DATABASE_SCHEMA.md` for complete schema

### Mistral AI Service

- **Location**: `src/utils/MistralService.ts`
- **Model**: `mistral-tiny` (default)
- **Features**: Rate limiting, caching, error handling

## Monitoring and Analytics

### AI Results Access

```typescript
import { getAIResults, getAnalyticsInsights } from '../ai/AIBackgroundProcessor';

// Get AI results for a user
const results = await getAIResults('user-id');

// Get analytics insights
const insights = await getAnalyticsInsights('service-id');
```

### Supabase Dashboard

- **Local**: http://127.0.0.1:54323
- **Cloud**: Your Supabase project dashboard

## Support

For issues or questions:

1. Check the browser console for error messages
2. Review the `AUDIT_REPORT.md` for technical details
3. Check Supabase logs in the dashboard
4. Verify environment variables are correctly set 