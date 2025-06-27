/*
  # Initial Database Schema for SlotEase Platform
  
  1. Core Tables
    - organizations (service providers)
    - services (offered by organizations)
    - users (customers and staff)
    - appointments (bookings)
    - queues (real-time queue management)
    - locations (geographic data)
    - notifications (communication)
    
  2. Security
    - Enable RLS on all tables
    - Create appropriate policies
    - Set up role-based access control
    
  3. Performance
    - Strategic indexing
    - Partitioning for large tables
    - Materialized views for analytics
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create custom types
CREATE TYPE organization_type AS ENUM ('hospital', 'clinic', 'bank', 'government', 'immigration', 'dmv', 'other');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE booking_channel AS ENUM ('web', 'mobile', 'phone', 'sms', 'walk_in');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE notification_type AS ENUM ('sms', 'email', 'push', 'in_app');
CREATE TYPE user_role AS ENUM ('customer', 'staff', 'admin', 'super_admin');

-- Organizations table (service providers)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type organization_type NOT NULL,
    description TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    website VARCHAR(500),
    
    -- Address information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'US',
    
    -- Geographic data for location-based queries
    location GEOGRAPHY(POINT, 4326),
    
    -- Configuration
    timezone VARCHAR(50) DEFAULT 'UTC',
    business_hours JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Services offered by organizations
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    
    -- Service configuration
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price DECIMAL(10,2),
    max_advance_booking_days INTEGER DEFAULT 30,
    min_advance_booking_hours INTEGER DEFAULT 1,
    
    -- Capacity and scheduling
    max_concurrent_appointments INTEGER DEFAULT 1,
    buffer_time_minutes INTEGER DEFAULT 0,
    allow_walk_in BOOLEAN DEFAULT true,
    requires_preparation BOOLEAN DEFAULT false,
    
    -- Priority and availability
    priority priority_level DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Extended user profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    
    -- Preferences
    preferred_language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{"sms": true, "email": true, "push": true}',
    
    -- Accessibility
    accessibility_needs TEXT[],
    
    -- Role and permissions
    role user_role DEFAULT 'customer',
    organization_id UUID REFERENCES organizations(id),
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Appointments table (partitioned by date for performance)
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    service_id UUID NOT NULL REFERENCES services(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Scheduling
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    
    -- Status and tracking
    status appointment_status DEFAULT 'scheduled',
    booking_channel booking_channel DEFAULT 'web',
    priority priority_level DEFAULT 'medium',
    
    -- Queue management
    queue_position INTEGER,
    estimated_wait_minutes INTEGER,
    check_in_time TIMESTAMPTZ,
    service_start_time TIMESTAMPTZ,
    service_end_time TIMESTAMPTZ,
    
    -- Additional information
    notes TEXT,
    internal_notes TEXT,
    cancellation_reason TEXT,
    
    -- Contact information (for guest bookings)
    guest_name VARCHAR(255),
    guest_phone VARCHAR(20),
    guest_email VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
) PARTITION BY RANGE (appointment_date);

-- Create partitions for appointments (current year + next year)
CREATE TABLE appointments_2024 PARTITION OF appointments
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE appointments_2025 PARTITION OF appointments
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Queue management table
CREATE TABLE queues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    service_id UUID NOT NULL REFERENCES services(id),
    appointment_id UUID REFERENCES appointments(id),
    
    -- Queue information
    queue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    position INTEGER NOT NULL,
    estimated_wait_minutes INTEGER,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'waiting',
    called_at TIMESTAMPTZ,
    served_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Real-time updates
    last_updated TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(organization_id, service_id, queue_date, position)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    organization_id UUID REFERENCES organizations(id),
    appointment_id UUID REFERENCES appointments(id),
    
    -- Notification details
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Delivery information
    recipient_phone VARCHAR(20),
    recipient_email VARCHAR(255),
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    
    -- Scheduling
    scheduled_for TIMESTAMPTZ DEFAULT now(),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Partition key for performance
    created_date DATE GENERATED ALWAYS AS (created_at::date) STORED
) PARTITION BY RANGE (created_date);

-- Create notification partitions
CREATE TABLE notifications_2024 PARTITION OF notifications
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE notifications_2025 PARTITION OF notifications
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Analytics and reporting table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES auth.users(id),
    
    -- Event details
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    
    -- Context
    session_id UUID,
    user_agent TEXT,
    ip_address INET,
    
    -- Timestamp
    occurred_at TIMESTAMPTZ DEFAULT now(),
    
    -- Partition key
    event_date DATE GENERATED ALWAYS AS (occurred_at::date) STORED
) PARTITION BY RANGE (event_date);

-- Create analytics partitions
CREATE TABLE analytics_events_2024 PARTITION OF analytics_events
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE analytics_events_2025 PARTITION OF analytics_events
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Feedback and ratings
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    service_id UUID REFERENCES services(id),
    appointment_id UUID REFERENCES appointments(id),
    user_id UUID REFERENCES auth.users(id),
    
    -- Rating (1-5 scale)
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    wait_time_rating INTEGER CHECK (wait_time_rating >= 1 AND wait_time_rating <= 5),
    service_quality_rating INTEGER CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
    staff_rating INTEGER CHECK (staff_rating >= 1 AND staff_rating <= 5),
    
    -- Comments
    comment TEXT,
    
    -- Metadata
    is_verified BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- System configuration
CREATE TABLE system_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
-- Organizations
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_location ON organizations USING GIST(location);
CREATE INDEX idx_organizations_active ON organizations(is_active) WHERE is_active = true;

-- Services
CREATE INDEX idx_services_organization ON services(organization_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active) WHERE is_active = true;

-- User profiles
CREATE INDEX idx_user_profiles_organization ON user_profiles(organization_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_phone ON user_profiles(phone);

-- Appointments (with partial indexes for performance)
CREATE INDEX idx_appointments_organization_date ON appointments(organization_id, appointment_date);
CREATE INDEX idx_appointments_service_date ON appointments(service_id, appointment_date);
CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, start_time);
CREATE INDEX idx_appointments_upcoming ON appointments(appointment_date, start_time) 
    WHERE status IN ('scheduled', 'confirmed');

-- Queues
CREATE INDEX idx_queues_organization_service_date ON queues(organization_id, service_id, queue_date);
CREATE INDEX idx_queues_position ON queues(organization_id, service_id, queue_date, position);
CREATE INDEX idx_queues_status ON queues(status);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_notifications_type ON notifications(type);

-- Analytics
CREATE INDEX idx_analytics_organization_date ON analytics_events(organization_id, event_date);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);

-- Feedback
CREATE INDEX idx_feedback_organization ON feedback(organization_id);
CREATE INDEX idx_feedback_service ON feedback(service_id);
CREATE INDEX idx_feedback_rating ON feedback(overall_rating);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system configuration
INSERT INTO system_config (key, value, description) VALUES
('max_appointments_per_user', '{"default": 5, "premium": 10}', 'Maximum appointments per user'),
('booking_window_days', '{"default": 30, "premium": 90}', 'How far in advance users can book'),
('cancellation_window_hours', '{"default": 24, "urgent": 2}', 'Minimum hours before appointment to cancel'),
('queue_refresh_interval', '{"seconds": 30}', 'How often to refresh queue positions'),
('notification_settings', '{"reminder_hours": [24, 2], "retry_attempts": 3}', 'Notification configuration');