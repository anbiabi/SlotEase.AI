/*
  # Materialized Views for Performance
  
  Create materialized views for complex queries and analytics:
  1. Organization statistics
  2. Service performance metrics
  3. User activity summaries
  4. Queue analytics
*/

-- Organization statistics view
CREATE MATERIALIZED VIEW organization_stats AS
SELECT 
    o.id,
    o.name,
    o.type,
    COUNT(DISTINCT s.id) as total_services,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed') as completed_appointments,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'no_show') as no_show_appointments,
    ROUND(
        COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed')::numeric / 
        NULLIF(COUNT(DISTINCT a.id), 0) * 100, 2
    ) as completion_rate,
    ROUND(
        COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'no_show')::numeric / 
        NULLIF(COUNT(DISTINCT a.id), 0) * 100, 2
    ) as no_show_rate,
    ROUND(AVG(f.overall_rating), 2) as average_rating,
    COUNT(DISTINCT f.id) as total_reviews,
    ROUND(AVG(
        EXTRACT(EPOCH FROM (a.service_end_time - a.service_start_time)) / 60
    ), 2) as average_service_duration_minutes,
    MAX(a.updated_at) as last_activity
FROM organizations o
LEFT JOIN services s ON o.id = s.organization_id AND s.is_active = true
LEFT JOIN appointments a ON o.id = a.organization_id 
    AND a.appointment_date >= CURRENT_DATE - INTERVAL '90 days'
LEFT JOIN feedback f ON o.id = f.organization_id 
    AND f.created_at >= CURRENT_DATE - INTERVAL '90 days'
WHERE o.is_active = true
GROUP BY o.id, o.name, o.type;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX idx_organization_stats_id ON organization_stats(id);

-- Service performance view
CREATE MATERIALIZED VIEW service_performance AS
SELECT 
    s.id,
    s.name,
    s.organization_id,
    o.name as organization_name,
    s.category,
    COUNT(a.id) as total_bookings,
    COUNT(a.id) FILTER (WHERE a.status = 'completed') as completed_bookings,
    COUNT(a.id) FILTER (WHERE a.status = 'no_show') as no_show_bookings,
    COUNT(a.id) FILTER (WHERE a.status = 'cancelled') as cancelled_bookings,
    ROUND(
        COUNT(a.id) FILTER (WHERE a.status = 'completed')::numeric / 
        NULLIF(COUNT(a.id), 0) * 100, 2
    ) as completion_rate,
    ROUND(AVG(f.overall_rating), 2) as average_rating,
    COUNT(f.id) as review_count,
    ROUND(AVG(a.estimated_wait_minutes), 2) as average_wait_time,
    ROUND(AVG(
        EXTRACT(EPOCH FROM (a.service_end_time - a.service_start_time)) / 60
    ), 2) as average_duration_minutes,
    -- Peak hours analysis
    MODE() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM a.start_time)) as peak_hour,
    -- Booking channel distribution
    COUNT(a.id) FILTER (WHERE a.booking_channel = 'web') as web_bookings,
    COUNT(a.id) FILTER (WHERE a.booking_channel = 'mobile') as mobile_bookings,
    COUNT(a.id) FILTER (WHERE a.booking_channel = 'phone') as phone_bookings,
    COUNT(a.id) FILTER (WHERE a.booking_channel = 'walk_in') as walk_in_bookings
FROM services s
JOIN organizations o ON s.organization_id = o.id
LEFT JOIN appointments a ON s.id = a.service_id 
    AND a.appointment_date >= CURRENT_DATE - INTERVAL '90 days'
LEFT JOIN feedback f ON s.id = f.service_id 
    AND f.created_at >= CURRENT_DATE - INTERVAL '90 days'
WHERE s.is_active = true AND o.is_active = true
GROUP BY s.id, s.name, s.organization_id, o.name, s.category;

CREATE UNIQUE INDEX idx_service_performance_id ON service_performance(id);

-- Daily appointment metrics
CREATE MATERIALIZED VIEW daily_appointment_metrics AS
SELECT 
    appointment_date,
    organization_id,
    service_id,
    COUNT(*) as total_appointments,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'no_show') as no_shows,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
    COUNT(*) FILTER (WHERE booking_channel = 'web') as web_bookings,
    COUNT(*) FILTER (WHERE booking_channel = 'mobile') as mobile_bookings,
    COUNT(*) FILTER (WHERE booking_channel = 'phone') as phone_bookings,
    COUNT(*) FILTER (WHERE booking_channel = 'walk_in') as walk_in_bookings,
    ROUND(AVG(estimated_wait_minutes), 2) as avg_wait_time,
    ROUND(AVG(
        EXTRACT(EPOCH FROM (service_end_time - service_start_time)) / 60
    ), 2) as avg_service_duration
FROM appointments
WHERE appointment_date >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY appointment_date, organization_id, service_id;

CREATE UNIQUE INDEX idx_daily_metrics_unique 
    ON daily_appointment_metrics(appointment_date, organization_id, service_id);

-- Queue performance metrics
CREATE MATERIALIZED VIEW queue_performance AS
SELECT 
    q.organization_id,
    q.service_id,
    s.name as service_name,
    q.queue_date,
    COUNT(*) as total_queue_entries,
    COUNT(*) FILTER (WHERE q.status = 'completed') as completed_services,
    ROUND(AVG(q.estimated_wait_minutes), 2) as avg_estimated_wait,
    ROUND(AVG(
        EXTRACT(EPOCH FROM (q.served_at - q.called_at)) / 60
    ), 2) as avg_actual_wait,
    ROUND(AVG(
        EXTRACT(EPOCH FROM (q.completed_at - q.served_at)) / 60
    ), 2) as avg_service_time,
    MAX(position) as max_queue_length,
    ROUND(AVG(position), 2) as avg_queue_position
FROM queues q
JOIN services s ON q.service_id = s.id
WHERE q.queue_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY q.organization_id, q.service_id, s.name, q.queue_date;

CREATE UNIQUE INDEX idx_queue_performance_unique 
    ON queue_performance(organization_id, service_id, queue_date);

-- User activity summary
CREATE MATERIALIZED VIEW user_activity_summary AS
SELECT 
    up.id as user_id,
    up.full_name,
    up.role,
    up.organization_id,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed') as completed_appointments,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'no_show') as no_show_appointments,
    COUNT(DISTINCT f.id) as feedback_given,
    ROUND(AVG(f.overall_rating), 2) as average_rating_given,
    MAX(a.created_at) as last_appointment_date,
    up.last_login_at,
    -- Booking preferences
    MODE() WITHIN GROUP (ORDER BY a.booking_channel) as preferred_booking_channel,
    MODE() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM a.start_time)) as preferred_time_slot,
    -- Loyalty metrics
    CASE 
        WHEN COUNT(DISTINCT a.id) >= 10 THEN 'high'
        WHEN COUNT(DISTINCT a.id) >= 5 THEN 'medium'
        ELSE 'low'
    END as loyalty_level
FROM user_profiles up
LEFT JOIN appointments a ON up.id = a.user_id 
    AND a.appointment_date >= CURRENT_DATE - INTERVAL '365 days'
LEFT JOIN feedback f ON up.id = f.user_id 
    AND f.created_at >= CURRENT_DATE - INTERVAL '365 days'
WHERE up.is_active = true
GROUP BY up.id, up.full_name, up.role, up.organization_id, up.last_login_at;

CREATE UNIQUE INDEX idx_user_activity_summary_id ON user_activity_summary(user_id);

-- Create function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY organization_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY service_performance;
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_appointment_metrics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY queue_performance;
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_activity_summary;
END;
$$ LANGUAGE plpgsql;

-- Schedule materialized view refresh (requires pg_cron extension)
-- Refresh every hour during business hours
SELECT cron.schedule('refresh-materialized-views', '0 6-22 * * *', 'SELECT refresh_all_materialized_views();');