/*
  # Row Level Security Policies
  
  Comprehensive RLS policies for all tables ensuring:
  1. Data isolation between organizations
  2. User privacy and access control
  3. Role-based permissions
  4. Secure multi-tenancy
*/

-- Organizations policies
CREATE POLICY "Organizations are viewable by everyone" ON organizations
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their organization" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Organization admins can update their organization" ON organizations
    FOR UPDATE USING (
        id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Super admins can insert organizations" ON organizations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Services policies
CREATE POLICY "Services are viewable by everyone" ON services
    FOR SELECT USING (
        is_active = true AND 
        organization_id IN (
            SELECT id FROM organizations WHERE is_active = true
        )
    );

CREATE POLICY "Organization staff can manage their services" ON services
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('staff', 'admin', 'super_admin')
        )
    );

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Organization staff can view profiles in their org" ON user_profiles
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('staff', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can manage user roles in their organization" ON user_profiles
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Appointments policies
CREATE POLICY "Users can view their own appointments" ON appointments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own appointments" ON appointments
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        -- Check appointment limits
        (
            SELECT COUNT(*) FROM appointments 
            WHERE user_id = auth.uid() 
            AND status IN ('scheduled', 'confirmed')
            AND appointment_date >= CURRENT_DATE
        ) < (
            SELECT COALESCE(
                (system_config.value->>'default')::integer, 5
            ) FROM system_config WHERE key = 'max_appointments_per_user'
        )
    );

CREATE POLICY "Users can update their own appointments" ON appointments
    FOR UPDATE USING (
        user_id = auth.uid() AND
        status IN ('scheduled', 'confirmed') AND
        appointment_date > CURRENT_DATE
    );

CREATE POLICY "Organization staff can view appointments for their org" ON appointments
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('staff', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Organization staff can manage appointments for their org" ON appointments
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('staff', 'admin', 'super_admin')
        )
    );

-- Queues policies
CREATE POLICY "Users can view queue for their appointments" ON queues
    FOR SELECT USING (
        appointment_id IN (
            SELECT id FROM appointments WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Organization staff can manage queues for their org" ON queues
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('staff', 'admin', 'super_admin')
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Organization staff can view notifications for their org" ON notifications
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('staff', 'admin', 'super_admin')
        )
    );

-- Analytics policies
CREATE POLICY "Organization staff can view analytics for their org" ON analytics_events
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('staff', 'admin', 'super_admin')
        )
    );

CREATE POLICY "System can insert analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- Feedback policies
CREATE POLICY "Public feedback is viewable by everyone" ON feedback
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own feedback" ON feedback
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create feedback for their appointments" ON feedback
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        appointment_id IN (
            SELECT id FROM appointments 
            WHERE user_id = auth.uid() AND status = 'completed'
        )
    );

CREATE POLICY "Organization staff can view feedback for their org" ON feedback
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('staff', 'admin', 'super_admin')
        )
    );

-- System config policies
CREATE POLICY "Everyone can view system config" ON system_config
    FOR SELECT USING (true);

CREATE POLICY "Only super admins can modify system config" ON system_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );