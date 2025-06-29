import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
      case 'GET':
        if (path[0] === 'organization' && path[1] && path[2] === 'dashboard') {
          return await getOrganizationDashboard(path[1], url.searchParams, supabaseClient)
        } else if (path[0] === 'organization' && path[1] && path[2] === 'performance') {
          return await getPerformanceMetrics(path[1], url.searchParams, supabaseClient)
        } else if (path[0] === 'organization' && path[1] && path[2] === 'trends') {
          return await getTrendAnalysis(path[1], url.searchParams, supabaseClient)
        } else if (path[0] === 'service' && path[1] && path[2] === 'analytics') {
          return await getServiceAnalytics(path[1], url.searchParams, supabaseClient)
        }
        break

      case 'POST':
        if (path[0] === 'event') {
          return await trackEvent(req, supabaseClient)
        } else if (path[0] === 'report') {
          return await generateReport(req, supabaseClient)
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

async function getOrganizationDashboard(organizationId: string, searchParams: URLSearchParams, supabase: any) {
  const period = searchParams.get('period') || '30d'
  const startDate = getStartDate(period)

  // Get organization stats
  const { data: orgStats, error: orgError } = await supabase
    .from('organization_stats')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (orgError) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch organization stats' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get recent appointments
  const { data: recentAppointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      start_time,
      status,
      booking_channel,
      services(name),
      user_profiles(full_name)
    `)
    .eq('organization_id', organizationId)
    .gte('appointment_date', startDate)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get daily metrics
  const { data: dailyMetrics, error: metricsError } = await supabase
    .from('daily_appointment_metrics')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('appointment_date', startDate)
    .order('appointment_date')

  // Get queue performance
  const { data: queueMetrics, error: queueError } = await supabase
    .from('queue_performance')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('queue_date', startDate)

  // Calculate key metrics
  const totalAppointments = dailyMetrics?.reduce((sum, day) => sum + day.total_appointments, 0) || 0
  const completedAppointments = dailyMetrics?.reduce((sum, day) => sum + day.completed, 0) || 0
  const noShows = dailyMetrics?.reduce((sum, day) => sum + day.no_shows, 0) || 0
  const avgWaitTime = queueMetrics?.reduce((sum, day) => sum + (day.avg_estimated_wait || 0), 0) / (queueMetrics?.length || 1)

  const dashboard = {
    organization: orgStats,
    metrics: {
      totalAppointments,
      completedAppointments,
      completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(1) : 0,
      noShowRate: totalAppointments > 0 ? (noShows / totalAppointments * 100).toFixed(1) : 0,
      avgWaitTime: avgWaitTime?.toFixed(1) || 0
    },
    recentAppointments,
    dailyTrends: dailyMetrics,
    queuePerformance: queueMetrics
  }

  return new Response(
    JSON.stringify(dashboard),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getPerformanceMetrics(organizationId: string, searchParams: URLSearchParams, supabase: any) {
  const period = searchParams.get('period') || '30d'
  const startDate = getStartDate(period)

  // Service performance
  const { data: servicePerformance, error: serviceError } = await supabase
    .from('service_performance')
    .select('*')
    .eq('organization_id', organizationId)

  // Booking channel analysis
  const { data: channelData, error: channelError } = await supabase
    .from('daily_appointment_metrics')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('appointment_date', startDate)

  const channelTotals = channelData?.reduce((acc, day) => {
    acc.web += day.web_bookings || 0
    acc.mobile += day.mobile_bookings || 0
    acc.phone += day.phone_bookings || 0
    acc.walkIn += day.walk_in_bookings || 0
    return acc
  }, { web: 0, mobile: 0, phone: 0, walkIn: 0 })

  // Peak hours analysis
  const { data: hourlyData, error: hourlyError } = await supabase
    .from('appointments')
    .select('start_time')
    .eq('organization_id', organizationId)
    .gte('appointment_date', startDate)

  const hourlyDistribution = hourlyData?.reduce((acc, appointment) => {
    const hour = parseInt(appointment.start_time.split(':')[0])
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {})

  // Staff utilization (if staff data available)
  const { data: utilizationData, error: utilizationError } = await supabase
    .rpc('calculate_staff_utilization', {
      org_id: organizationId,
      start_date: startDate,
      end_date: new Date().toISOString().split('T')[0]
    })

  const performance = {
    services: servicePerformance,
    bookingChannels: channelTotals,
    peakHours: hourlyDistribution,
    staffUtilization: utilizationData
  }

  return new Response(
    JSON.stringify(performance),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getTrendAnalysis(organizationId: string, searchParams: URLSearchParams, supabase: any) {
  const period = searchParams.get('period') || '90d'
  const startDate = getStartDate(period)

  // Weekly trends
  const { data: weeklyTrends, error: weeklyError } = await supabase
    .rpc('get_weekly_trends', {
      org_id: organizationId,
      start_date: startDate
    })

  // Monthly comparisons
  const { data: monthlyComparison, error: monthlyError } = await supabase
    .rpc('get_monthly_comparison', {
      org_id: organizationId,
      months_back: 6
    })

  // Seasonal patterns
  const { data: seasonalData, error: seasonalError } = await supabase
    .from('daily_appointment_metrics')
    .select('appointment_date, total_appointments')
    .eq('organization_id', organizationId)
    .gte('appointment_date', getStartDate('365d'))
    .order('appointment_date')

  // Growth metrics
  const { data: growthMetrics, error: growthError } = await supabase
    .rpc('calculate_growth_metrics', {
      org_id: organizationId,
      period: period
    })

  const trends = {
    weekly: weeklyTrends,
    monthly: monthlyComparison,
    seasonal: seasonalData,
    growth: growthMetrics
  }

  return new Response(
    JSON.stringify(trends),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getServiceAnalytics(serviceId: string, searchParams: URLSearchParams, supabase: any) {
  const period = searchParams.get('period') || '30d'
  const startDate = getStartDate(period)

  // Service performance
  const { data: servicePerf, error: perfError } = await supabase
    .from('service_performance')
    .select('*')
    .eq('id', serviceId)
    .single()

  // Daily service metrics
  const { data: dailyMetrics, error: dailyError } = await supabase
    .from('daily_appointment_metrics')
    .select('*')
    .eq('service_id', serviceId)
    .gte('appointment_date', startDate)
    .order('appointment_date')

  // Customer feedback
  const { data: feedback, error: feedbackError } = await supabase
    .from('feedback')
    .select('*')
    .eq('service_id', serviceId)
    .gte('created_at', startDate)
    .order('created_at', { ascending: false })

  // Utilization rates
  const { data: utilization, error: utilizationError } = await supabase
    .rpc('calculate_service_utilization', {
      service_id: serviceId,
      start_date: startDate
    })

  const analytics = {
    performance: servicePerf,
    dailyMetrics,
    feedback,
    utilization
  }

  return new Response(
    JSON.stringify(analytics),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function trackEvent(req: Request, supabase: any) {
  const eventData = await req.json()

  if (!eventData.event_type) {
    return new Response(
      JSON.stringify({ error: 'Missing event_type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: event, error } = await supabase
    .from('analytics_events')
    .insert({
      organization_id: eventData.organization_id,
      user_id: eventData.user_id,
      event_type: eventData.event_type,
      event_data: eventData.event_data || {},
      session_id: eventData.session_id,
      user_agent: eventData.user_agent,
      ip_address: eventData.ip_address
    })
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to track event' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, eventId: event.id }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function generateReport(req: Request, supabase: any) {
  const reportRequest = await req.json()

  if (!reportRequest.organization_id || !reportRequest.report_type) {
    return new Response(
      JSON.stringify({ error: 'Missing organization_id or report_type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { organization_id, report_type, start_date, end_date, filters } = reportRequest

  let reportData = {}

  switch (report_type) {
    case 'appointment_summary':
      reportData = await generateAppointmentSummary(organization_id, start_date, end_date, supabase)
      break
    case 'service_performance':
      reportData = await generateServicePerformanceReport(organization_id, start_date, end_date, supabase)
      break
    case 'customer_satisfaction':
      reportData = await generateCustomerSatisfactionReport(organization_id, start_date, end_date, supabase)
      break
    case 'operational_efficiency':
      reportData = await generateOperationalEfficiencyReport(organization_id, start_date, end_date, supabase)
      break
    default:
      return new Response(
        JSON.stringify({ error: 'Invalid report type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }

  return new Response(
    JSON.stringify({
      report_type,
      organization_id,
      generated_at: new Date().toISOString(),
      data: reportData
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function getStartDate(period: string): string {
  const now = new Date()
  const days = parseInt(period.replace('d', ''))
  const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
  return startDate.toISOString().split('T')[0]
}

async function generateAppointmentSummary(organizationId: string, startDate: string, endDate: string, supabase: any) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      status,
      booking_channel,
      duration_minutes,
      services(name, category)
    `)
    .eq('organization_id', organizationId)
    .gte('appointment_date', startDate)
    .lte('appointment_date', endDate)

  if (error) throw error

  const summary = {
    total_appointments: data.length,
    by_status: data.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1
      return acc
    }, {}),
    by_channel: data.reduce((acc, apt) => {
      acc[apt.booking_channel] = (acc[apt.booking_channel] || 0) + 1
      return acc
    }, {}),
    by_service: data.reduce((acc, apt) => {
      const serviceName = apt.services?.name || 'Unknown'
      acc[serviceName] = (acc[serviceName] || 0) + 1
      return acc
    }, {}),
    total_duration_hours: data.reduce((sum, apt) => sum + (apt.duration_minutes || 0), 0) / 60
  }

  return summary
}

async function generateServicePerformanceReport(organizationId: string, startDate: string, endDate: string, supabase: any) {
  const { data, error } = await supabase
    .from('service_performance')
    .select('*')
    .eq('organization_id', organizationId)

  if (error) throw error

  return {
    services: data,
    top_performing: data.sort((a, b) => b.completion_rate - a.completion_rate).slice(0, 5),
    needs_improvement: data.filter(s => s.completion_rate < 80 || s.average_rating < 3.5)
  }
}

async function generateCustomerSatisfactionReport(organizationId: string, startDate: string, endDate: string, supabase: any) {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  if (error) throw error

  const avgRating = data.reduce((sum, f) => sum + f.overall_rating, 0) / data.length
  const ratingDistribution = data.reduce((acc, f) => {
    acc[f.overall_rating] = (acc[f.overall_rating] || 0) + 1
    return acc
  }, {})

  return {
    total_reviews: data.length,
    average_rating: avgRating.toFixed(2),
    rating_distribution: ratingDistribution,
    recent_comments: data.filter(f => f.comment).slice(0, 10).map(f => ({
      rating: f.overall_rating,
      comment: f.comment,
      created_at: f.created_at
    }))
  }
}

async function generateOperationalEfficiencyReport(organizationId: string, startDate: string, endDate: string, supabase: any) {
  const { data: queueData, error: queueError } = await supabase
    .from('queue_performance')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('queue_date', startDate)
    .lte('queue_date', endDate)

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('daily_appointment_metrics')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('appointment_date', startDate)
    .lte('appointment_date', endDate)

  if (queueError || appointmentError) throw queueError || appointmentError

  const avgWaitTime = queueData.reduce((sum, q) => sum + (q.avg_estimated_wait || 0), 0) / queueData.length
  const avgServiceTime = queueData.reduce((sum, q) => sum + (q.avg_service_time || 0), 0) / queueData.length
  const utilizationRate = appointmentData.reduce((sum, a) => sum + a.total_appointments, 0) / (appointmentData.length * 8 * 4) // Assuming 8 hours, 4 slots per hour

  return {
    average_wait_time_minutes: avgWaitTime.toFixed(1),
    average_service_time_minutes: avgServiceTime.toFixed(1),
    utilization_rate_percent: (utilizationRate * 100).toFixed(1),
    peak_efficiency_hours: queueData.reduce((acc, q) => {
      const hour = new Date(q.queue_date).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {}),
    recommendations: generateEfficiencyRecommendations(avgWaitTime, avgServiceTime, utilizationRate)
  }
}

function generateEfficiencyRecommendations(waitTime: number, serviceTime: number, utilization: number) {
  const recommendations = []

  if (waitTime > 30) {
    recommendations.push('Consider adding more service capacity during peak hours')
  }
  if (serviceTime > 45) {
    recommendations.push('Review service processes to reduce average service time')
  }
  if (utilization < 0.6) {
    recommendations.push('Optimize scheduling to improve resource utilization')
  }
  if (utilization > 0.9) {
    recommendations.push('Consider expanding capacity to handle demand')
  }

  return recommendations
}