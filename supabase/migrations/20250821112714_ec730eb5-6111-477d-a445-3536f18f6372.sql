-- =============================================
-- ANALYTICS SYSTEM MIGRATION (Part 2 - Indexes and RLS)
-- =============================================

-- 4. CREATE INDEXES
CREATE INDEX idx_visits_type_target ON page_visits(page_type, target_id);
CREATE INDEX idx_visits_session ON page_visits(session_id);
CREATE INDEX idx_visits_created_at ON page_visits(created_at);

CREATE INDEX idx_interactions_type ON user_interactions(interaction_type);
CREATE INDEX idx_interactions_target ON user_interactions(target_type, target_id);
CREATE INDEX idx_interactions_session ON user_interactions(session_id);
CREATE INDEX idx_interactions_created_at ON user_interactions(created_at);

CREATE INDEX idx_search_query ON search_analytics(search_query);
CREATE INDEX idx_search_location ON search_analytics(location_query);
CREATE INDEX idx_search_cuisines ON search_analytics USING GIN(cuisine_types);
CREATE INDEX idx_search_created_at ON search_analytics(created_at);

CREATE INDEX idx_favorites_target ON favorites_analytics(target_type, target_id);
CREATE INDEX idx_favorites_user ON favorites_analytics(user_id);
CREATE INDEX idx_favorites_created_at ON favorites_analytics(created_at);

CREATE INDEX idx_cart_dish ON cart_analytics(dish_id);
CREATE INDEX idx_cart_restaurant ON cart_analytics(restaurant_id);
CREATE INDEX idx_cart_session ON cart_analytics(session_id);
CREATE INDEX idx_cart_created_at ON cart_analytics(created_at);

CREATE INDEX idx_registration_method ON user_registration_analytics(registration_method);
CREATE INDEX idx_registration_source ON user_registration_analytics(registration_source);
CREATE INDEX idx_registration_created_at ON user_registration_analytics(created_at);

CREATE INDEX idx_session_user ON session_analytics(user_id);
CREATE INDEX idx_session_duration ON session_analytics(duration_seconds);
CREATE INDEX idx_session_start_time ON session_analytics(start_time);

CREATE INDEX idx_logs_user ON activity_logs(user_id);
CREATE INDEX idx_logs_restaurant ON activity_logs(restaurant_id);
CREATE INDEX idx_logs_type ON activity_logs(log_type);
CREATE INDEX idx_logs_created_at ON activity_logs(created_at);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE restaurant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_registration_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES

-- Restaurant Users: Solo los usuarios relacionados pueden ver/editar
CREATE POLICY "Users can view restaurant_users they are related to" 
ON restaurant_users FOR SELECT 
USING (user_id = auth.uid() OR restaurant_id IN (
    SELECT restaurant_id FROM restaurant_users WHERE user_id = auth.uid()
));

CREATE POLICY "Restaurant owners can manage users" 
ON restaurant_users FOR ALL 
USING (restaurant_id IN (
    SELECT restaurant_id FROM restaurant_users 
    WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
));

-- Analytics tables: Solo admins y sistema pueden insertar
CREATE POLICY "System can insert page visits" 
ON page_visits FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view own page visits" 
ON page_visits FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert user interactions" 
ON user_interactions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view own interactions" 
ON user_interactions FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert search analytics" 
ON search_analytics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view own search analytics" 
ON search_analytics FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert favorites analytics" 
ON favorites_analytics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view own favorites analytics" 
ON favorites_analytics FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert cart analytics" 
ON cart_analytics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view own cart analytics" 
ON cart_analytics FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert registration analytics" 
ON user_registration_analytics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view own registration analytics" 
ON user_registration_analytics FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert session analytics" 
ON session_analytics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update session analytics" 
ON session_analytics FOR UPDATE 
USING (true);

CREATE POLICY "Users can view own session analytics" 
ON session_analytics FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert activity logs" 
ON activity_logs FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view own activity logs" 
ON activity_logs FOR SELECT 
USING (user_id = auth.uid());