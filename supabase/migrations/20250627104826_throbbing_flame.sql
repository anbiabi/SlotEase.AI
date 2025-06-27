/*
  # Database Functions and Triggers
  
  1. Business logic functions
  2. Automated triggers
  3. Queue management
  4. Notification handling
  5. Analytics tracking
*/

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
    earth_radius CONSTANT DOUBLE PRECISION := 6371000; -- Earth radius in meters
    dlat DOUBLE PRECISION;
    dlon DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    
    a := sin(dlat/2) * sin(dlat/2) + 
         cos(radians(lat1)) * cos(radians(lat2)) * 
         sin(dlon/2) * sin(dlon/2);
    
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to find nearby organizations
CREATE OR REPLACE FUNCTION find_nearby_organizations(
    user_lat DOUBLE PRECISION,
    user_lon DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 10000,
    org_type organization_type DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    type organization_type,
    distance_meters DOUBLE PRECISION,
    location GEOGRAPHY
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.name,
        o.type,
        ST_Distance(
            o.location,
            ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
        ) as distance_meters,
        o.location
    FROM organizations o
    WHERE 
        o.is_active = true
        AND o.location IS NOT NULL
        AND ST_DWithin(
            o.location,
            ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
            radius_meters
        )
        AND (org_type IS NULL OR o.type = org_type)
    ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

-- Function to get available time slots
CREATE OR REPLACE FUNCTION get_available_slots(
    p_service_id UUID,
    p_date DATE,
    p_duration_minutes INTEGER DEFAULT NULL
) RETURNS TABLE (
    slot_time TIME,
    available_capacity INTEGER
) AS $$
DECLARE
    service_duration INTEGER;
    business_start TIME := '09:00';
    business_end TIME := '17:00';
    slot_interval INTERVAL := '30 minutes';
    current_slot TIME;
BEGIN
    -- Get service duration
    SELECT duration_minutes INTO service_duration
    FROM services 
    WHERE id = p_service_id;
    
    IF service_duration IS NULL THEN
        RETURN;
    END IF;
    
    -- Use provided duration or service default
    service_duration := COALESCE(p_duration_minutes, service_duration);
    
    -- Generate time slots
    current_slot := business_start;
    
    WHILE current_slot + (service_duration || ' minutes')::INTERVAL <= business_end LOOP
        -- Check availability for this slot
        WITH slot_bookings AS (
            SELECT COUNT(*) as booked_count
            FROM appointments a
            WHERE 
                a.service_id = p_service_id
                AND a.appointment_date = p_date
                AND a.start_time <= current_slot
                AND a.end_time > current_slot
                AND a.status IN ('scheduled', 'confirmed', 'in_progress')
        ),
        service_capacity AS (
            SELECT max_concurrent_appointments
            FROM services
            WHERE id = p_service_id
        )
        SELECT 
            current_slot,
            GREATEST(0, sc.max_concurrent_appointments - sb.booked_count)
        INTO slot_time, available_capacity
        FROM slot_bookings sb, service_capacity sc;
        
        -- Only return slots with availability
        IF available_capacity > 0 THEN
            RETURN NEXT;
        END IF;
        
        current_slot := current_slot + slot_interval;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to manage queue positions
CREATE OR REPLACE FUNCTION update_queue_positions(
    p_organization_id UUID,
    p_service_id UUID,
    p_queue_date DATE DEFAULT CURRENT_DATE
) RETURNS void AS $$
BEGIN
    -- Reorder queue positions to eliminate gaps
    WITH ordered_queue AS (
        SELECT 
            id,
            ROW_NUMBER() OVER (ORDER BY position, created_at) as new_position
        FROM queues
        WHERE 
            organization_id = p_organization_id
            AND service_id = p_service_id
            AND queue_date = p_queue_date
            AND status = 'waiting'
    )
    UPDATE queues
    SET position = oq.new_position
    FROM ordered_queue oq
    WHERE queues.id = oq.id;
    
    -- Update estimated wait times
    UPDATE queues
    SET 
        estimated_wait_minutes = (position - 1) * 15, -- Assume 15 min per person
        last_updated = now()
    WHERE 
        organization_id = p_organization_id
        AND service_id = p_service_id
        AND queue_date = p_queue_date
        AND status = 'waiting';
END;
$$ LANGUAGE plpgsql;

-- Function to create appointment with queue entry
CREATE OR REPLACE FUNCTION create_appointment_with_queue(
    p_organization_id UUID,
    p_service_id UUID,
    p_user_id UUID,
    p_appointment_date DATE,
    p_start_time TIME,
    p_duration_minutes INTEGER,
    p_booking_channel booking_channel DEFAULT 'web',
    p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    appointment_id UUID;
    queue_position INTEGER;
BEGIN
    -- Create the appointment
    INSERT INTO appointments (
        organization_id,
        service_id,
        user_id,
        appointment_date,
        start_time,
        end_time,
        duration_minutes,
        booking_channel,
        notes,
        status
    ) VALUES (
        p_organization_id,
        p_service_id,
        p_user_id,
        p_appointment_date,
        p_start_time,
        p_start_time + (p_duration_minutes || ' minutes')::INTERVAL,
        p_duration_minutes,
        p_booking_channel,
        p_notes,
        'scheduled'
    ) RETURNING id INTO appointment_id;
    
    -- Add to queue if appointment is today
    IF p_appointment_date = CURRENT_DATE THEN
        -- Get next queue position
        SELECT COALESCE(MAX(position), 0) + 1
        INTO queue_position
        FROM queues
        WHERE 
            organization_id = p_organization_id
            AND service_id = p_service_id
            AND queue_date = p_appointment_date;
        
        -- Insert into queue
        INSERT INTO queues (
            organization_id,
            service_id,
            appointment_id,
            queue_date,
            position,
            estimated_wait_minutes
        ) VALUES (
            p_organization_id,
            p_service_id,
            appointment_id,
            p_appointment_date,
            queue_position,
            (queue_position - 1) * 15
        );
    END IF;
    
    RETURN appointment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to send notification
CREATE OR REPLACE FUNCTION send_notification(
    p_user_id UUID,
    p_type notification_type,
    p_title VARCHAR(255),
    p_message TEXT,
    p_organization_id UUID DEFAULT NULL,
    p_appointment_id UUID DEFAULT NULL,
    p_scheduled_for TIMESTAMPTZ DEFAULT now()
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
    user_phone VARCHAR(20);
    user_email VARCHAR(255);
BEGIN
    -- Get user contact information
    SELECT phone, email INTO user_phone, user_email
    FROM user_profiles
    WHERE id = p_user_id;
    
    -- Create notification
    INSERT INTO notifications (
        user_id,
        organization_id,
        appointment_id,
        type,
        title,
        message,
        recipient_phone,
        recipient_email,
        scheduled_for
    ) VALUES (
        p_user_id,
        p_organization_id,
        p_appointment_id,
        p_type,
        p_title,
        p_message,
        user_phone,
        user_email,
        p_scheduled_for
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create user profile
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Trigger to update queue when appointment status changes
CREATE OR REPLACE FUNCTION handle_appointment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If appointment is completed or cancelled, remove from queue
    IF NEW.status IN ('completed', 'cancelled', 'no_show') AND OLD.status NOT IN ('completed', 'cancelled', 'no_show') THEN
        UPDATE queues
        SET 
            status = NEW.status,
            completed_at = CASE WHEN NEW.status = 'completed' THEN now() ELSE NULL END
        WHERE appointment_id = NEW.id;
        
        -- Update queue positions for remaining appointments
        PERFORM update_queue_positions(NEW.organization_id, NEW.service_id, NEW.appointment_date);
    END IF;
    
    -- If appointment is confirmed and it's today, ensure queue entry exists
    IF NEW.status = 'confirmed' AND NEW.appointment_date = CURRENT_DATE THEN
        INSERT INTO queues (
            organization_id,
            service_id,
            appointment_id,
            queue_date,
            position,
            estimated_wait_minutes
        )
        SELECT 
            NEW.organization_id,
            NEW.service_id,
            NEW.id,
            NEW.appointment_date,
            COALESCE(MAX(position), 0) + 1,
            COALESCE(MAX(position), 0) * 15
        FROM queues
        WHERE 
            organization_id = NEW.organization_id
            AND service_id = NEW.service_id
            AND queue_date = NEW.appointment_date
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointment_status_change
    AFTER UPDATE OF status ON appointments
    FOR EACH ROW EXECUTE FUNCTION handle_appointment_status_change();

-- Trigger to send automatic notifications
CREATE OR REPLACE FUNCTION send_appointment_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Send confirmation notification for new appointments
    IF TG_OP = 'INSERT' THEN
        PERFORM send_notification(
            NEW.user_id,
            'sms',
            'Appointment Confirmed',
            'Your appointment has been confirmed for ' || NEW.appointment_date || ' at ' || NEW.start_time,
            NEW.organization_id,
            NEW.id
        );
    END IF;
    
    -- Send status change notifications
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        CASE NEW.status
            WHEN 'confirmed' THEN
                PERFORM send_notification(
                    NEW.user_id,
                    'sms',
                    'Appointment Confirmed',
                    'Your appointment has been confirmed for ' || NEW.appointment_date || ' at ' || NEW.start_time,
                    NEW.organization_id,
                    NEW.id
                );
            WHEN 'cancelled' THEN
                PERFORM send_notification(
                    NEW.user_id,
                    'sms',
                    'Appointment Cancelled',
                    'Your appointment for ' || NEW.appointment_date || ' at ' || NEW.start_time || ' has been cancelled.',
                    NEW.organization_id,
                    NEW.id
                );
            ELSE
                -- No notification for other status changes
        END CASE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointment_notifications
    AFTER INSERT OR UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION send_appointment_notifications();

-- Trigger to log analytics events
CREATE OR REPLACE FUNCTION log_analytics_event()
RETURNS TRIGGER AS $$
DECLARE
    event_type VARCHAR(50);
    event_data JSONB;
BEGIN
    -- Determine event type based on operation
    IF TG_OP = 'INSERT' THEN
        event_type := TG_TABLE_NAME || '_created';
        event_data := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        event_type := TG_TABLE_NAME || '_updated';
        event_data := jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW),
            'changed_fields', (
                SELECT jsonb_object_agg(key, value)
                FROM jsonb_each(to_jsonb(NEW))
                WHERE to_jsonb(OLD) ->> key IS DISTINCT FROM value::text
            )
        );
    ELSIF TG_OP = 'DELETE' THEN
        event_type := TG_TABLE_NAME || '_deleted';
        event_data := to_jsonb(OLD);
    END IF;
    
    -- Insert analytics event
    INSERT INTO analytics_events (
        organization_id,
        user_id,
        event_type,
        event_data
    ) VALUES (
        COALESCE(NEW.organization_id, OLD.organization_id),
        COALESCE(NEW.user_id, OLD.user_id, NEW.created_by, OLD.created_by),
        event_type,
        event_data
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add analytics triggers to key tables
CREATE TRIGGER appointments_analytics
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION log_analytics_event();

CREATE TRIGGER feedback_analytics
    AFTER INSERT OR UPDATE OR DELETE ON feedback
    FOR EACH ROW EXECUTE FUNCTION log_analytics_event();

-- Function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete old notifications (older than 1 year)
    DELETE FROM notifications 
    WHERE created_at < now() - INTERVAL '1 year';
    
    -- Delete old analytics events (older than 2 years)
    DELETE FROM analytics_events 
    WHERE occurred_at < now() - INTERVAL '2 years';
    
    -- Delete old queue entries (older than 30 days)
    DELETE FROM queues 
    WHERE queue_date < CURRENT_DATE - INTERVAL '30 days';
    
    -- Archive old appointments (older than 5 years) - in production, move to archive table
    -- For now, just delete very old cancelled/no-show appointments
    DELETE FROM appointments 
    WHERE 
        appointment_date < CURRENT_DATE - INTERVAL '5 years'
        AND status IN ('cancelled', 'no_show');
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job (runs daily at 2 AM)
SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_data();');