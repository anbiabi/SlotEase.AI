/*
  # Performance Optimization
  
  1. Additional indexes for complex queries
  2. Partial indexes for filtered queries
  3. Composite indexes for multi-column searches
  4. Database configuration optimizations
*/

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY idx_appointments_org_date_status 
    ON appointments(organization_id, appointment_date, status);

CREATE INDEX CONCURRENTLY idx_appointments_user_date_status 
    ON appointments(user_id, appointment_date, status);

CREATE INDEX CONCURRENTLY idx_appointments_service_date_time 
    ON appointments(service_id, appointment_date, start_time);

-- Partial indexes for active records only
CREATE INDEX CONCURRENTLY idx_organizations_active_type 
    ON organizations(type, location) WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_services_active_category 
    ON services(organization_id, category) WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_user_profiles_active_org 
    ON user_profiles(organization_id, role) WHERE is_active = true;

-- Indexes for queue management
CREATE INDEX CONCURRENTLY idx_queues_org_service_date_position 
    ON queues(organization_id, service_id, queue_date, position);

CREATE INDEX CONCURRENTLY idx_queues_waiting_status 
    ON queues(organization_id, service_id, queue_date) 
    WHERE status = 'waiting';

-- Indexes for notifications
CREATE INDEX CONCURRENTLY idx_notifications_pending_scheduled 
    ON notifications(scheduled_for) 
    WHERE status = 'pending';

CREATE INDEX CONCURRENTLY idx_notifications_user_unread 
    ON notifications(user_id, created_at) 
    WHERE read_at IS NULL;

-- Indexes for analytics queries
CREATE INDEX CONCURRENTLY idx_analytics_org_type_date 
    ON analytics_events(organization_id, event_type, occurred_at);

CREATE INDEX CONCURRENTLY idx_analytics_user_date 
    ON analytics_events(user_id, occurred_at);

-- Indexes for feedback and ratings
CREATE INDEX CONCURRENTLY idx_feedback_org_rating_public 
    ON feedback(organization_id, overall_rating) 
    WHERE is_public = true;

CREATE INDEX CONCURRENTLY idx_feedback_service_rating 
    ON feedback(service_id, overall_rating, created_at);

-- GIN indexes for JSONB columns
CREATE INDEX CONCURRENTLY idx_organizations_settings 
    ON organizations USING GIN(settings);

CREATE INDEX CONCURRENTLY idx_user_profiles_preferences 
    ON user_profiles USING GIN(notification_preferences);

CREATE INDEX CONCURRENTLY idx_analytics_event_data 
    ON analytics_events USING GIN(event_data);

-- Text search indexes
CREATE INDEX CONCURRENTLY idx_organizations_name_search 
    ON organizations USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE INDEX CONCURRENTLY idx_services_name_search 
    ON services USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Function-based indexes for common calculations
CREATE INDEX CONCURRENTLY idx_appointments_duration_calc 
    ON appointments((EXTRACT(EPOCH FROM (end_time - start_time)) / 60));

-- Covering indexes for read-heavy queries
CREATE INDEX CONCURRENTLY idx_appointments_list_covering 
    ON appointments(user_id, appointment_date, start_time) 
    INCLUDE (service_id, status, duration_minutes, notes);

CREATE INDEX CONCURRENTLY idx_services_list_covering 
    ON services(organization_id, is_active) 
    INCLUDE (name, description, duration_minutes, price);

-- Optimize table statistics
ANALYZE organizations;
ANALYZE services;
ANALYZE user_profiles;
ANALYZE appointments;
ANALYZE queues;
ANALYZE notifications;
ANALYZE analytics_events;
ANALYZE feedback;

-- Create function to update table statistics
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS void AS $$
BEGIN
    ANALYZE organizations;
    ANALYZE services;
    ANALYZE user_profiles;
    ANALYZE appointments;
    ANALYZE queues;
    ANALYZE notifications;
    ANALYZE analytics_events;
    ANALYZE feedback;
END;
$$ LANGUAGE plpgsql;

-- Schedule statistics update (runs every 6 hours)
SELECT cron.schedule('update-statistics', '0 */6 * * *', 'SELECT update_table_statistics();');

-- Connection pooling configuration (add to supabase config)
-- These would be set in the Supabase dashboard or via SQL
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Reload configuration
SELECT pg_reload_conf();