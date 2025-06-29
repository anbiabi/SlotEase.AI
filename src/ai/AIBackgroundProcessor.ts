import { getMistralChatCompletion } from '../utils/MistralService';
import { supabase } from '../lib/supabase';
import { logError } from '../utils/logError';

// This module runs in the background and does NOT affect the main workflow
// It can be called after any booking or user interaction
// Results are stored in Supabase for future analysis, suggestions, or gradual workflow migration

// Example interface for a booking event
export interface BookingEvent {
  userId: string;
  serviceType: string;
  date: string;
  time: string;
  specialRequirements?: string;
  contactInfo: { phone: string; email: string };
  channel: 'manual' | 'chat' | 'voice' | 'video' | 'web';
}

/**
 * Process a booking event with AI for multiple background tasks:
 * 1. Generate appointment reminders and follow-ups
 * 2. Analyze booking patterns and provide insights
 * 3. Create appointment documentation and summaries
 * 4. Analyze feedback and suggest optimizations
 * 
 * All results are stored in Supabase for future use and analysis.
 */
export async function processBookingWithAI(event: BookingEvent) {
  const startTime = Date.now();
  
  try {
    // 1. Reminders/follow-ups
    const reminderPrompt = [
      { role: 'system', content: 'You are an appointment assistant. Generate a friendly reminder message for the following appointment.' },
      { role: 'user', content: `Service: ${event.serviceType}, Date: ${event.date}, Time: ${event.time}, User: ${event.contactInfo.email}` }
    ];

    // 2. Analytics/booking pattern analysis
    const analyticsPrompt = [
      { role: 'system', content: 'You are an analytics engine. Analyze this booking pattern and provide insights for optimization.' },
      { role: 'user', content: `Service: ${event.serviceType}, Channel: ${event.channel}, Time: ${event.time}, Date: ${event.date}` }
    ];

    // 3. Documentation generation
    const documentationPrompt = [
      { role: 'system', content: 'You are a documentation specialist. Create a concise appointment summary for record-keeping.' },
      { role: 'user', content: `Service: ${event.serviceType}, Date: ${event.date}, Time: ${event.time}, Requirements: ${event.specialRequirements || 'None'}` }
    ];

    // 4. Feedback analysis
    const feedbackPrompt = [
      { role: 'system', content: 'You are a customer experience analyst. Suggest improvements based on this booking interaction.' },
      { role: 'user', content: `Service: ${event.serviceType}, Channel: ${event.channel}, User: ${event.contactInfo.email}` }
    ];

    // Process all AI tasks in parallel
    const [reminderResult, analyticsResult, documentationResult, feedbackResult] = await Promise.allSettled([
      getMistralChatCompletion(reminderPrompt),
      getMistralChatCompletion(analyticsPrompt),
      getMistralChatCompletion(analyticsPrompt),
      getMistralChatCompletion(feedbackPrompt)
    ]);

    const processingTime = Date.now() - startTime;

    // Store results in Supabase
    const aiRequestData = {
      service_id: null, // Will be updated when service ID is available
      user_id: event.userId,
      request_type: 'booking_processing',
      request_data: {
        event,
        prompts: {
          reminder: reminderPrompt,
          analytics: analyticsPrompt,
          documentation: documentationPrompt,
          feedback: feedbackPrompt
        }
      },
      priority: 'medium',
      status: 'completed',
      response_data: {
        reminder: reminderResult.status === 'fulfilled' ? reminderResult.value : null,
        analytics: analyticsResult.status === 'fulfilled' ? analyticsResult.value : null,
        documentation: documentationResult.status === 'fulfilled' ? documentationResult.value : null,
        feedback: feedbackResult.status === 'fulfilled' ? feedbackResult.value : null,
        errors: [
          reminderResult.status === 'rejected' ? reminderResult.reason : null,
          analyticsResult.status === 'rejected' ? analyticsResult.reason : null,
          documentationResult.status === 'rejected' ? documentationResult.reason : null,
          feedbackResult.status === 'rejected' ? feedbackResult.reason : null
        ].filter(Boolean)
      },
      processing_time_ms: processingTime
    };

    const { data, error } = await supabase
      .from('ai_service_requests')
      .insert(aiRequestData)
      .select()
      .single();

    if (error) {
      logError(error, 'AIBackgroundProcessor: Failed to store AI results');
      throw error;
    }

    console.log('AI background processing completed successfully:', {
      requestId: data.id,
      processingTime: `${processingTime}ms`,
      resultsCount: Object.keys(aiRequestData.response_data).length
    });

    return data;

  } catch (error) {
    logError(error, 'AIBackgroundProcessor: Failed to process booking with AI');
    
    // Store error in Supabase for debugging
    try {
      await supabase
        .from('ai_service_requests')
        .insert({
          service_id: null,
          user_id: event.userId,
          request_type: 'booking_processing',
          request_data: { event },
          priority: 'medium',
          status: 'error',
          response_data: { error: error.message },
          processing_time_ms: Date.now() - startTime
        });
    } catch (dbError) {
      logError(dbError, 'AIBackgroundProcessor: Failed to store error in database');
    }
    
    throw error;
  }
}

/**
 * Retrieve AI processing results for a specific booking or user
 */
export async function getAIResults(userId: string, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('ai_service_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logError(error, 'AIBackgroundProcessor: Failed to retrieve AI results');
      throw error;
    }

    return data;
  } catch (error) {
    logError(error, 'AIBackgroundProcessor: Failed to get AI results');
    throw error;
  }
}

/**
 * Get analytics insights from stored AI results
 */
export async function getAnalyticsInsights(serviceId?: string) {
  try {
    let query = supabase
      .from('ai_service_requests')
      .select('*')
      .eq('request_type', 'booking_processing')
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      logError(error, 'AIBackgroundProcessor: Failed to retrieve analytics insights');
      throw error;
    }

    return data;
  } catch (error) {
    logError(error, 'AIBackgroundProcessor: Failed to get analytics insights');
    throw error;
  }
}

// Integration points:
// - Call processBookingWithAI(event) after every booking
// - Extend for feedback analysis after feedback is received
// - All outputs are available for automation, reporting, or admin review
// - Documented for continuous consultation and future migration 