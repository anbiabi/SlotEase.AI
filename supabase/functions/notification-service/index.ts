import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface NotificationRequest {
  userId: string
  type: 'sms' | 'email' | 'push' | 'in_app'
  title: string
  message: string
  organizationId?: string
  appointmentId?: string
  scheduledFor?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const url = new URL(req.url)
    const path = url.pathname.split('/').filter(Boolean)

    switch (req.method) {
      case 'POST':
        if (path[0] === 'send') {
          return await sendNotification(req, supabaseClient)
        } else if (path[0] === 'send-bulk') {
          return await sendBulkNotifications(req, supabaseClient)
        } else if (path[0] === 'process-pending') {
          return await processPendingNotifications(supabaseClient)
        }
        break

      case 'GET':
        if (path[0] === 'user' && path[1]) {
          return await getUserNotifications(path[1], url.searchParams, supabaseClient)
        } else if (path[0] === 'pending') {
          return await getPendingNotifications(supabaseClient)
        }
        break

      case 'PUT':
        if (path[0] === 'mark-read' && path[1]) {
          return await markNotificationRead(path[1], supabaseClient)
        }
        break
    }

    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendNotification(req: Request, supabase: any) {
  const notificationData: NotificationRequest = await req.json()

  if (!notificationData.userId || !notificationData.type || 
      !notificationData.title || !notificationData.message) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get user contact information
  const { data: userProfile, error: userError } = await supabase
    .from('user_profiles')
    .select('phone, email, notification_preferences')
    .eq('id', notificationData.userId)
    .single()

  if (userError || !userProfile) {
    return new Response(
      JSON.stringify({ error: 'User not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check user preferences
  const preferences = userProfile.notification_preferences || {}
  if (!preferences[notificationData.type]) {
    return new Response(
      JSON.stringify({ error: 'User has disabled this notification type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Create notification record
  const { data: notification, error: createError } = await supabase
    .from('notifications')
    .insert({
      user_id: notificationData.userId,
      organization_id: notificationData.organizationId,
      appointment_id: notificationData.appointmentId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      recipient_phone: userProfile.phone,
      recipient_email: userProfile.email,
      scheduled_for: notificationData.scheduledFor || new Date().toISOString(),
      status: 'pending'
    })
    .select()
    .single()

  if (createError) {
    return new Response(
      JSON.stringify({ error: 'Failed to create notification' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Send immediately if not scheduled for later
  if (!notificationData.scheduledFor || new Date(notificationData.scheduledFor) <= new Date()) {
    await processNotification(notification, supabase)
  }

  return new Response(
    JSON.stringify({ success: true, notificationId: notification.id }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function sendBulkNotifications(req: Request, supabase: any) {
  const { notifications } = await req.json()

  if (!Array.isArray(notifications) || notifications.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Invalid notifications array' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const results = []
  
  for (const notificationData of notifications) {
    try {
      // Get user contact information
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('phone, email, notification_preferences')
        .eq('id', notificationData.userId)
        .single()

      if (!userProfile) {
        results.push({ userId: notificationData.userId, error: 'User not found' })
        continue
      }

      // Check user preferences
      const preferences = userProfile.notification_preferences || {}
      if (!preferences[notificationData.type]) {
        results.push({ userId: notificationData.userId, error: 'Notification type disabled' })
        continue
      }

      // Create notification record
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notificationData.userId,
          organization_id: notificationData.organizationId,
          appointment_id: notificationData.appointmentId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          recipient_phone: userProfile.phone,
          recipient_email: userProfile.email,
          scheduled_for: notificationData.scheduledFor || new Date().toISOString(),
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        results.push({ userId: notificationData.userId, error: 'Failed to create notification' })
        continue
      }

      results.push({ userId: notificationData.userId, notificationId: notification.id, success: true })

      // Send immediately if not scheduled
      if (!notificationData.scheduledFor || new Date(notificationData.scheduledFor) <= new Date()) {
        await processNotification(notification, supabase)
      }

    } catch (error) {
      results.push({ userId: notificationData.userId, error: error.message })
    }
  }

  return new Response(
    JSON.stringify({ results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function processPendingNotifications(supabase: any) {
  // Get pending notifications that are due
  const { data: pendingNotifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .limit(100)

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch pending notifications' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const results = []
  
  for (const notification of pendingNotifications) {
    try {
      await processNotification(notification, supabase)
      results.push({ notificationId: notification.id, success: true })
    } catch (error) {
      results.push({ notificationId: notification.id, error: error.message })
    }
  }

  return new Response(
    JSON.stringify({ processed: results.length, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function processNotification(notification: any, supabase: any) {
  try {
    let success = false
    let errorMessage = null

    switch (notification.type) {
      case 'sms':
        success = await sendSMS(notification)
        break
      case 'email':
        success = await sendEmail(notification)
        break
      case 'push':
        success = await sendPushNotification(notification)
        break
      case 'in_app':
        success = true // In-app notifications are just database records
        break
    }

    // Update notification status
    await supabase
      .from('notifications')
      .update({
        status: success ? 'sent' : 'failed',
        sent_at: success ? new Date().toISOString() : null,
        delivered_at: success ? new Date().toISOString() : null
      })
      .eq('id', notification.id)

  } catch (error) {
    console.error('Error processing notification:', error)
    
    await supabase
      .from('notifications')
      .update({
        status: 'failed',
        sent_at: null
      })
      .eq('id', notification.id)
  }
}

async function sendSMS(notification: any): Promise<boolean> {
  // Integration with SMS service (Twilio, AWS SNS, etc.)
  // This is a placeholder - implement with your preferred SMS provider
  
  if (!notification.recipient_phone) {
    return false
  }

  try {
    // Example Twilio integration
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.log('SMS service not configured')
      return false
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioPhoneNumber,
          To: notification.recipient_phone,
          Body: `${notification.title}\n\n${notification.message}`
        })
      }
    )

    return response.ok
  } catch (error) {
    console.error('SMS sending failed:', error)
    return false
  }
}

async function sendEmail(notification: any): Promise<boolean> {
  // Integration with email service (SendGrid, AWS SES, etc.)
  // This is a placeholder - implement with your preferred email provider
  
  if (!notification.recipient_email) {
    return false
  }

  try {
    // Example SendGrid integration
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@slotease.com'

    if (!sendGridApiKey) {
      console.log('Email service not configured')
      return false
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: notification.recipient_email }],
          subject: notification.title
        }],
        from: { email: fromEmail, name: 'SlotEase' },
        content: [{
          type: 'text/plain',
          value: notification.message
        }]
      })
    })

    return response.ok
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

async function sendPushNotification(notification: any): Promise<boolean> {
  // Integration with push notification service (Firebase, OneSignal, etc.)
  // This is a placeholder - implement with your preferred push service
  
  try {
    // Example Firebase Cloud Messaging integration
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY')
    
    if (!fcmServerKey) {
      console.log('Push notification service not configured')
      return false
    }

    // You would need to store FCM tokens for users
    // This is a simplified example
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${fcmServerKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '/topics/user_' + notification.user_id, // or specific device token
        notification: {
          title: notification.title,
          body: notification.message
        }
      })
    })

    return response.ok
  } catch (error) {
    console.error('Push notification sending failed:', error)
    return false
  }
}

async function getUserNotifications(userId: string, searchParams: URLSearchParams, supabase: any) {
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')
  const type = searchParams.get('type')
  const unreadOnly = searchParams.get('unread') === 'true'

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) {
    query = query.eq('type', type)
  }

  if (unreadOnly) {
    query = query.is('read_at', null)
  }

  const { data: notifications, error } = await query

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch notifications' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ notifications }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function markNotificationRead(notificationId: string, supabase: any) {
  const { data: notification, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to mark notification as read' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, notification }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getPendingNotifications(supabase: any) {
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .order('scheduled_for')
    .limit(100)

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch pending notifications' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ notifications }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}