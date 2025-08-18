
-- Crear enum para niveles de verificación
CREATE TYPE verification_level AS ENUM ('basic', 'standard', 'premium');

-- Crear enum para estados de verificación
CREATE TYPE verification_status AS ENUM ('pending', 'in_review', 'verified', 'rejected', 'disputed', 'suspended');

-- Crear enum para tipos de documentos
CREATE TYPE document_type AS ENUM ('business_license', 'tax_certificate', 'identity_document', 'property_deed', 'rental_agreement', 'menu_photos', 'interior_photos', 'other');

-- Modificar tabla restaurants para agregar campos de verificación
ALTER TABLE restaurants 
ADD COLUMN verification_level verification_level DEFAULT 'basic',
ADD COLUMN verification_status verification_status DEFAULT 'pending',
ADD COLUMN verification_score integer DEFAULT 0 CHECK (verification_score >= 0 AND verification_score <= 100),
ADD COLUMN verification_requested_at timestamp with time zone,
ADD COLUMN verification_completed_at timestamp with time zone,
ADD COLUMN verification_notes text,
ADD COLUMN verified_by uuid REFERENCES auth.users(id),
ADD COLUMN last_verification_update timestamp with time zone DEFAULT CURRENT_TIMESTAMP;

-- Crear tabla para solicitudes de verificación
CREATE TABLE restaurant_verification_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id integer NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    requester_id uuid NOT NULL REFERENCES auth.users(id),
    requested_level verification_level NOT NULL,
    current_status verification_status DEFAULT 'pending',
    business_name character varying(255) NOT NULL,
    business_type character varying(100),
    contact_phone character varying(20),
    contact_email character varying(255),
    business_address text,
    additional_info text,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    reviewed_by uuid REFERENCES auth.users(id),
    reviewed_at timestamp with time zone
);

-- Crear tabla para documentos de verificación
CREATE TABLE verification_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_request_id uuid NOT NULL REFERENCES restaurant_verification_requests(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    file_name character varying(255) NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    mime_type character varying(100),
    is_verified boolean DEFAULT false,
    verified_by uuid REFERENCES auth.users(id),
    verified_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla para disputas de verificación
CREATE TABLE verification_disputes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id integer NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    primary_claimant_id uuid NOT NULL REFERENCES auth.users(id),
    dispute_reason text NOT NULL,
    status character varying(50) DEFAULT 'open',
    evidence_summary text,
    resolution_notes text,
    resolved_by uuid REFERENCES auth.users(id),
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla para reclamantes adicionales en disputas
CREATE TABLE dispute_claimants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id uuid NOT NULL REFERENCES verification_disputes(id) ON DELETE CASCADE,
    claimant_id uuid NOT NULL REFERENCES auth.users(id),
    claim_evidence text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(dispute_id, claimant_id)
);

-- Crear tabla de auditoría para verificaciones
CREATE TABLE verification_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id integer NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    verification_request_id uuid REFERENCES restaurant_verification_requests(id),
    action_type character varying(100) NOT NULL,
    old_status verification_status,
    new_status verification_status,
    old_level verification_level,
    new_level verification_level,
    performed_by uuid REFERENCES auth.users(id),
    details jsonb DEFAULT '{}',
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_restaurants_verification_status ON restaurants(verification_status);
CREATE INDEX idx_restaurants_verification_level ON restaurants(verification_level);
CREATE INDEX idx_restaurants_verification_score ON restaurants(verification_score DESC);
CREATE INDEX idx_verification_requests_status ON restaurant_verification_requests(current_status);
CREATE INDEX idx_verification_requests_restaurant ON restaurant_verification_requests(restaurant_id);
CREATE INDEX idx_verification_requests_requester ON restaurant_verification_requests(requester_id);
CREATE INDEX idx_verification_documents_request ON verification_documents(verification_request_id);
CREATE INDEX idx_verification_disputes_restaurant ON verification_disputes(restaurant_id);
CREATE INDEX idx_verification_disputes_status ON verification_disputes(status);
CREATE INDEX idx_verification_audit_restaurant ON verification_audit_log(restaurant_id);
CREATE INDEX idx_verification_audit_created ON verification_audit_log(created_at DESC);

-- Crear función para actualizar timestamp de última actualización
CREATE OR REPLACE FUNCTION update_verification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_verification_update = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar timestamp automáticamente
CREATE TRIGGER update_restaurant_verification_timestamp
    BEFORE UPDATE ON restaurants
    FOR EACH ROW
    WHEN (OLD.verification_status IS DISTINCT FROM NEW.verification_status OR 
          OLD.verification_level IS DISTINCT FROM NEW.verification_level OR
          OLD.verification_score IS DISTINCT FROM NEW.verification_score)
    EXECUTE FUNCTION update_verification_timestamp();

-- Crear función para registrar cambios en el audit log
CREATE OR REPLACE FUNCTION log_verification_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo registrar si hay cambios en campos de verificación
    IF (OLD.verification_status IS DISTINCT FROM NEW.verification_status OR 
        OLD.verification_level IS DISTINCT FROM NEW.verification_level) THEN
        
        INSERT INTO verification_audit_log (
            restaurant_id,
            action_type,
            old_status,
            new_status,
            old_level,
            new_level,
            performed_by,
            details
        ) VALUES (
            NEW.id,
            'status_change',
            OLD.verification_status,
            NEW.verification_status,
            OLD.verification_level,
            NEW.verification_level,
            auth.uid(),
            jsonb_build_object(
                'old_score', OLD.verification_score,
                'new_score', NEW.verification_score
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para audit log
CREATE TRIGGER log_restaurant_verification_changes
    AFTER UPDATE ON restaurants
    FOR EACH ROW
    EXECUTE FUNCTION log_verification_changes();

-- Crear función para calcular score de verificación automático
CREATE OR REPLACE FUNCTION calculate_verification_score(restaurant_id_param integer)
RETURNS integer AS $$
DECLARE
    score integer := 0;
    restaurant_record RECORD;
BEGIN
    -- Obtener datos del restaurante
    SELECT * INTO restaurant_record 
    FROM restaurants 
    WHERE id = restaurant_id_param;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Puntuación por datos básicos completos
    IF restaurant_record.name IS NOT NULL AND LENGTH(restaurant_record.name) > 0 THEN
        score := score + 10;
    END IF;
    
    IF restaurant_record.description IS NOT NULL AND LENGTH(restaurant_record.description) > 20 THEN
        score := score + 10;
    END IF;
    
    IF restaurant_record.phone IS NOT NULL AND LENGTH(restaurant_record.phone) > 0 THEN
        score := score + 10;
    END IF;
    
    IF restaurant_record.email IS NOT NULL AND LENGTH(restaurant_record.email) > 0 THEN
        score := score + 10;
    END IF;
    
    IF restaurant_record.address IS NOT NULL AND LENGTH(restaurant_record.address) > 0 THEN
        score := score + 10;
    END IF;
    
    IF restaurant_record.latitude IS NOT NULL AND restaurant_record.longitude IS NOT NULL THEN
        score := score + 10;
    END IF;
    
    -- Puntuación por medios
    IF restaurant_record.cover_image_url IS NOT NULL THEN
        score := score + 10;
    END IF;
    
    IF restaurant_record.logo_url IS NOT NULL THEN
        score := score + 5;
    END IF;
    
    -- Puntuación por contenido del menú
    IF EXISTS(SELECT 1 FROM menu_sections WHERE restaurant_id = restaurant_id_param AND is_active = true) THEN
        score := score + 15;
    END IF;
    
    IF EXISTS(SELECT 1 FROM dishes WHERE restaurant_id = restaurant_id_param AND is_active = true) THEN
        score := score + 10;
    END IF;
    
    RETURN LEAST(score, 100); -- Máximo 100 puntos
END;
$$ LANGUAGE plpgsql;

-- Crear políticas RLS para las nuevas tablas
ALTER TABLE restaurant_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_claimants ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas para restaurant_verification_requests
CREATE POLICY "Users can view their own verification requests" 
ON restaurant_verification_requests FOR SELECT 
USING (requester_id = auth.uid());

CREATE POLICY "Users can create verification requests" 
ON restaurant_verification_requests FOR INSERT 
WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update their own pending requests" 
ON restaurant_verification_requests FOR UPDATE 
USING (requester_id = auth.uid() AND current_status = 'pending');

-- Políticas para verification_documents
CREATE POLICY "Users can view documents of their requests" 
ON verification_documents FOR SELECT 
USING (EXISTS(
    SELECT 1 FROM restaurant_verification_requests 
    WHERE id = verification_request_id AND requester_id = auth.uid()
));

CREATE POLICY "Users can upload documents to their requests" 
ON verification_documents FOR INSERT 
WITH CHECK (EXISTS(
    SELECT 1 FROM restaurant_verification_requests 
    WHERE id = verification_request_id AND requester_id = auth.uid()
));

-- Políticas para verification_disputes
CREATE POLICY "Users can view disputes they're involved in" 
ON verification_disputes FOR SELECT 
USING (primary_claimant_id = auth.uid() OR EXISTS(
    SELECT 1 FROM dispute_claimants 
    WHERE dispute_id = id AND claimant_id = auth.uid()
));

CREATE POLICY "Users can create disputes" 
ON verification_disputes FOR INSERT 
WITH CHECK (primary_claimant_id = auth.uid());

-- Políticas para dispute_claimants
CREATE POLICY "Users can view claimants of disputes they're involved in" 
ON dispute_claimants FOR SELECT 
USING (claimant_id = auth.uid() OR EXISTS(
    SELECT 1 FROM verification_disputes 
    WHERE id = dispute_id AND primary_claimant_id = auth.uid()
));

CREATE POLICY "Users can add themselves as claimants" 
ON dispute_claimants FOR INSERT 
WITH CHECK (claimant_id = auth.uid());

-- Políticas para verification_audit_log (solo lectura para admins)
CREATE POLICY "Only system can write audit logs" 
ON verification_audit_log FOR INSERT 
WITH CHECK (true);

CREATE POLICY "No direct access to audit logs" 
ON verification_audit_log FOR SELECT 
USING (false);
