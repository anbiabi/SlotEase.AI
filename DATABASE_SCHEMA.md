# SlotEase Location-Based System Database Schema

## Core Location Tables

### `coordinates`
```sql
CREATE TABLE coordinates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(8, 2),
    altitude DECIMAL(8, 2),
    altitude_accuracy DECIMAL(8, 2),
    heading DECIMAL(5, 2),
    speed DECIMAL(8, 2),
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_coordinates_lat_lng ON coordinates (latitude, longitude);
CREATE INDEX idx_coordinates_timestamp ON coordinates (timestamp);
```

### `time_zones`
```sql
CREATE TABLE time_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time_zone VARCHAR(100) NOT NULL,
    offset_minutes INTEGER NOT NULL,
    abbreviation VARCHAR(10),
    is_dst BOOLEAN DEFAULT false,
    utc_offset VARCHAR(10),
    coordinates_id UUID REFERENCES coordinates(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_time_zones_zone ON time_zones (time_zone);
```

## Public Services Tables

### `public_services`
```sql
CREATE TABLE public_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    coordinates_id UUID REFERENCES coordinates(id),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    contact_website VARCHAR(500),
    rating_average DECIMAL(3, 2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    accessibility_wheelchair BOOLEAN DEFAULT false,
    accessibility_hearing BOOLEAN DEFAULT false,
    accessibility_visual BOOLEAN DEFAULT false,
    accessibility_sign_language BOOLEAN DEFAULT false,
    accessibility_elevator BOOLEAN DEFAULT false,
    accessibility_parking BOOLEAN DEFAULT false,
    accessibility_transport BOOLEAN DEFAULT false,
    last_updated TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_public_services_type ON public_services (type);
CREATE INDEX idx_public_services_category ON public_services (category);
CREATE INDEX idx_public_services_coordinates ON public_services (coordinates_id);
```

### `service_addresses`
```sql
CREATE TABLE service_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public_services(id) ON DELETE CASCADE,
    street VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    formatted_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_service_addresses_service ON service_addresses (service_id);
```

### `service_operating_hours`
```sql
CREATE TABLE service_operating_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public_services(id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL,
    open_time TIME,
    close_time TIME,
    is_open BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_operating_hours_service ON service_operating_hours (service_id);
```

### `service_breaks`
```sql
CREATE TABLE service_breaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operating_hours_id UUID REFERENCES service_operating_hours(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### `service_features`
```sql
CREATE TABLE service_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public_services(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_service_features_service ON service_features (service_id);
```

## Availability & Status Tables

### `service_availability`
```sql
CREATE TABLE service_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public_services(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    current_capacity INTEGER DEFAULT 0,
    max_capacity INTEGER DEFAULT 100,
    estimated_wait_time INTEGER DEFAULT 0,
    next_available_slot TIMESTAMPTZ,
    queue_length INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_availability_service ON service_availability (service_id);
CREATE INDEX idx_availability_status ON service_availability (status);
CREATE INDEX idx_availability_updated ON service_availability (last_updated);
```

## Connection & Integration Tables

### `connection_protocols`
```sql
CREATE TABLE connection_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public_services(id) ON DELETE CASCADE,
    endpoint VARCHAR(500) NOT NULL,
    auth_method VARCHAR(20) NOT NULL,
    client_id VARCHAR(255),
    client_secret_encrypted TEXT,
    api_key_encrypted TEXT,
    token_encrypted TEXT,
    timeout_ms INTEGER DEFAULT 30000,
    retry_attempts INTEGER DEFAULT 3,
    rate_limit_requests INTEGER DEFAULT 100,
    rate_limit_window INTEGER DEFAULT 60,
    connection_state VARCHAR(20) DEFAULT 'pending',
    error_count INTEGER DEFAULT 0,
    last_connection TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_protocols_service ON connection_protocols (service_id);
CREATE INDEX idx_protocols_state ON connection_protocols (connection_state);
```

### `connection_logs`
```sql
CREATE TABLE connection_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public_services(id),
    timestamp TIMESTAMPTZ DEFAULT now(),
    log_type VARCHAR(20) NOT NULL,
    method VARCHAR(10),
    endpoint VARCHAR(500),
    status_code INTEGER,
    response_time_ms INTEGER,
    error_message TEXT,
    request_data JSONB,
    response_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_connection_logs_service ON connection_logs (service_id);
CREATE INDEX idx_connection_logs_timestamp ON connection_logs (timestamp);
CREATE INDEX idx_connection_logs_type ON connection_logs (log_type);
```

## AI Integration Tables

### `ai_service_requests`
```sql
CREATE TABLE ai_service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public_services(id),
    user_id UUID,
    request_type VARCHAR(20) NOT NULL,
    request_data JSONB,
    priority VARCHAR(10) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    response_data JSONB,
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_requests_service ON ai_service_requests (service_id);
CREATE INDEX idx_ai_requests_user ON ai_service_requests (user_id);
CREATE INDEX idx_ai_requests_status ON ai_service_requests (status);
CREATE INDEX idx_ai_requests_type ON ai_service_requests (request_type);
```

### `service_feedback`
```sql
CREATE TABLE service_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public_services(id) ON DELETE CASCADE,
    user_id UUID,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    wait_time_rating INTEGER CHECK (wait_time_rating >= 1 AND wait_time_rating <= 5),
    service_quality_rating INTEGER CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
    accessibility_rating INTEGER CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
    staff_rating INTEGER CHECK (staff_rating >= 1 AND staff_rating <= 5),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_feedback_service ON service_feedback (service_id);
CREATE INDEX idx_feedback_rating ON service_feedback (rating);
CREATE INDEX idx_feedback_verified ON service_feedback (is_verified);
```

## Geofencing Tables

### `geofence_areas`
```sql
CREATE TABLE geofence_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    center_coordinates_id UUID REFERENCES coordinates(id),
    radius_meters INTEGER NOT NULL,
    area_type VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_geofence_type ON geofence_areas (area_type);
CREATE INDEX idx_geofence_active ON geofence_areas (is_active);
```

### `geofence_triggers`
```sql
CREATE TABLE geofence_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    geofence_id UUID REFERENCES geofence_areas(id) ON DELETE CASCADE,
    event_type VARCHAR(10) NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    conditions JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_triggers_geofence ON geofence_triggers (geofence_id);
CREATE INDEX idx_triggers_event ON geofence_triggers (event_type);
```

## User Location History

### `user_locations`
```sql
CREATE TABLE user_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    coordinates_id UUID REFERENCES coordinates(id),
    accuracy_meters DECIMAL(8, 2),
    session_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_locations_user ON user_locations (user_id);
CREATE INDEX idx_user_locations_session ON user_locations (session_id);
CREATE INDEX idx_user_locations_created ON user_locations (created_at);
```

### `location_permissions`
```sql
CREATE TABLE location_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    permission_state VARCHAR(10) NOT NULL,
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_permissions_user ON location_permissions (user_id);
CREATE INDEX idx_permissions_state ON location_permissions (permission_state);
```

## Views for Common Queries

### `nearby_services_view`
```sql
CREATE VIEW nearby_services_view AS
SELECT 
    ps.*,
    c.latitude,
    c.longitude,
    sa.formatted_address,
    sa.city,
    sa.state,
    sa.country,
    av.status as availability_status,
    av.estimated_wait_time,
    av.queue_length,
    av.current_capacity,
    av.max_capacity
FROM public_services ps
JOIN coordinates c ON ps.coordinates_id = c.id
LEFT JOIN service_addresses sa ON ps.id = sa.service_id
LEFT JOIN service_availability av ON ps.id = av.service_id;
```

### `service_ratings_view`
```sql
CREATE VIEW service_ratings_view AS
SELECT 
    service_id,
    COUNT(*) as total_reviews,
    AVG(rating) as average_rating,
    AVG(wait_time_rating) as avg_wait_time_rating,
    AVG(service_quality_rating) as avg_quality_rating,
    AVG(accessibility_rating) as avg_accessibility_rating,
    AVG(staff_rating) as avg_staff_rating
FROM service_feedback
WHERE is_verified = true
GROUP BY service_id;
```

## Functions for Distance Calculation

### `calculate_distance` Function
```sql
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL(10,8),
    lon1 DECIMAL(11,8),
    lat2 DECIMAL(10,8),
    lon2 DECIMAL(11,8)
) RETURNS DECIMAL(10,2) AS $$
DECLARE
    earth_radius CONSTANT DECIMAL := 6371000; -- Earth radius in meters
    dlat DECIMAL;
    dlon DECIMAL;
    a DECIMAL;
    c DECIMAL;
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
```

## Row Level Security Policies

### Enable RLS on sensitive tables
```sql
ALTER TABLE connection_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_permissions ENABLE ROW LEVEL SECURITY;

-- Example policies
CREATE POLICY "Users can only see their own location data"
    ON user_locations
    FOR ALL
    TO authenticated
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can only see their own AI requests"
    ON ai_service_requests
    FOR ALL
    TO authenticated
    USING (auth.uid()::text = user_id::text);
```

This schema provides a comprehensive foundation for the location-based system with proper indexing, relationships, and security measures.