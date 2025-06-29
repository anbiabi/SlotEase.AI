import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface AppointmentRequest {
  organizationId: string
  serviceId: string
  userId: string
  appointmentDate: string
  startTime: string
  durationMinutes: number
  bookingChannel?: string
  notes?: string
  guestInfo?: {
    name: string
    phone: string
    email?: string
  }
}

interface QueueUpdateRequest {
  appointmentId: string
  action: 'check_in' | 'call_next' | 'complete' | 'no_show'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const url = new URL(req.url)
    const path = url.pathname.split('/').filter(Boolean)

    // Route handling
    switch (req.method) {
      case 'POST':
        if (path[0] === 'appointments') {
          return await createAppointment(req, supabaseClient)
        } else if (path[0] === 'queue' && path[1] === 'update') {
          return await updateQueue(req, supabaseClient)
        }
        break

      case 'GET':
        if (path[0] === 'appointments' && path[1]) {
          return await getAppointment(path[1], supabaseClient)
        } else if (path[0] === 'available-slots') {
          return await getAvailableSlots(url.searchParams, supabaseClient)
        } else if (path[0] === 'queue' && path[1]) {
          return await getQueueStatus(path[1], path[2], supabaseClient)
        }
        break

      case 'PUT':
        if (path[0] === 'appointments' && path[1]) {
          return await updateAppointment(path[1], req, supabaseClient)
        }
        break

      case 'DELETE':
        if (path[0] === 'appointments' && path[1]) {
          return await cancelAppointment(path[1], req, supabaseClient)
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

async function createAppointment(req: Request, supabase: any) {
  const appointmentData: AppointmentRequest = await req.json()

  // Validate required fields
  if (!appointmentData.organizationId || !appointmentData.serviceId || 
      !appointmentData.appointmentDate || !appointmentData.startTime) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check service availability
  const { data: availableSlots, error: slotsError } = await supabase
    .rpc('get_available_slots', {
      p_service_id: appointmentData.serviceId,
      p_date: appointmentData.appointmentDate,
      p_duration_minutes: appointmentData.durationMinutes
    })

  if (slotsError) {
    return new Response(
      JSON.stringify({ error: 'Failed to check availability' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const requestedSlot = availableSlots?.find(
    (slot: any) => slot.slot_time === appointmentData.startTime
  )

  if (!requestedSlot || requestedSlot.available_capacity === 0) {
    return new Response(
      JSON.stringify({ error: 'Time slot not available' }),
      { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Create appointment using database function
  const { data: appointmentId, error: createError } = await supabase
    .rpc('create_appointment_with_queue', {
      p_organization_id: appointmentData.organizationId,
      p_service_id: appointmentData.serviceId,
      p_user_id: appointmentData.userId,
      p_appointment_date: appointmentData.appointmentDate,
      p_start_time: appointmentData.startTime,
      p_duration_minutes: appointmentData.durationMinutes,
      p_booking_channel: appointmentData.bookingChannel || 'web',
      p_notes: appointmentData.notes
    })

  if (createError) {
    return new Response(
      JSON.stringify({ error: 'Failed to create appointment' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Update appointment with guest info if provided
  if (appointmentData.guestInfo) {
    await supabase
      .from('appointments')
      .update({
        guest_name: appointmentData.guestInfo.name,
        guest_phone: appointmentData.guestInfo.phone,
        guest_email: appointmentData.guestInfo.email
      })
      .eq('id', appointmentId)
  }

  // Get the created appointment details
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select(`
      *,
      organizations(name, phone),
      services(name, duration_minutes),
      queues(position, estimated_wait_minutes)
    `)
    .eq('id', appointmentId)
    .single()

  if (fetchError) {
    return new Response(
      JSON.stringify({ error: 'Appointment created but failed to fetch details' }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      appointment,
      confirmationCode: `SE${appointmentId.slice(-6).toUpperCase()}`
    }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getAvailableSlots(searchParams: URLSearchParams, supabase: any) {
  const serviceId = searchParams.get('serviceId')
  const date = searchParams.get('date')
  const duration = searchParams.get('duration')

  if (!serviceId || !date) {
    return new Response(
      JSON.stringify({ error: 'Missing serviceId or date parameter' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: slots, error } = await supabase
    .rpc('get_available_slots', {
      p_service_id: serviceId,
      p_date: date,
      p_duration_minutes: duration ? parseInt(duration) : null
    })

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch available slots' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ slots }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getQueueStatus(organizationId: string, serviceId: string, supabase: any) {
  const { data: queue, error } = await supabase
    .from('queues')
    .select(`
      *,
      appointments(
        id,
        start_time,
        user_id,
        guest_name,
        services(name)
      )
    `)
    .eq('organization_id', organizationId)
    .eq('service_id', serviceId)
    .eq('queue_date', new Date().toISOString().split('T')[0])
    .eq('status', 'waiting')
    .order('position')

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch queue status' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ queue }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateQueue(req: Request, supabase: any) {
  const updateData: QueueUpdateRequest = await req.json()

  if (!updateData.appointmentId || !updateData.action) {
    return new Response(
      JSON.stringify({ error: 'Missing appointmentId or action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let updateFields: any = {}
  let appointmentStatus: string | null = null

  switch (updateData.action) {
    case 'check_in':
      updateFields = { status: 'checked_in', called_at: new Date().toISOString() }
      appointmentStatus = 'confirmed'
      break
    case 'call_next':
      updateFields = { status: 'called', called_at: new Date().toISOString() }
      break
    case 'complete':
      updateFields = { 
        status: 'completed', 
        served_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      }
      appointmentStatus = 'completed'
      break
    case 'no_show':
      updateFields = { status: 'no_show' }
      appointmentStatus = 'no_show'
      break
  }

  // Update queue entry
  const { error: queueError } = await supabase
    .from('queues')
    .update(updateFields)
    .eq('appointment_id', updateData.appointmentId)

  if (queueError) {
    return new Response(
      JSON.stringify({ error: 'Failed to update queue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Update appointment status if needed
  if (appointmentStatus) {
    const { error: appointmentError } = await supabase
      .from('appointments')
      .update({ status: appointmentStatus })
      .eq('id', updateData.appointmentId)

    if (appointmentError) {
      console.error('Failed to update appointment status:', appointmentError)
    }
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getAppointment(appointmentId: string, supabase: any) {
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      *,
      organizations(name, phone, address_line1, city, state),
      services(name, description, duration_minutes),
      queues(position, estimated_wait_minutes, status)
    `)
    .eq('id', appointmentId)
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Appointment not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ appointment }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateAppointment(appointmentId: string, req: Request, supabase: any) {
  const updateData = await req.json()

  // Only allow certain fields to be updated
  const allowedFields = ['notes', 'start_time', 'end_time', 'duration_minutes']
  const filteredData = Object.keys(updateData)
    .filter(key => allowedFields.includes(key))
    .reduce((obj: any, key) => {
      obj[key] = updateData[key]
      return obj
    }, {})

  if (Object.keys(filteredData).length === 0) {
    return new Response(
      JSON.stringify({ error: 'No valid fields to update' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: appointment, error } = await supabase
    .from('appointments')
    .update(filteredData)
    .eq('id', appointmentId)
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to update appointment' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ appointment }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function cancelAppointment(appointmentId: string, req: Request, supabase: any) {
  const { reason } = await req.json()

  const { data: appointment, error } = await supabase
    .from('appointments')
    .update({ 
      status: 'cancelled',
      cancellation_reason: reason 
    })
    .eq('id', appointmentId)
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to cancel appointment' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, appointment }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}