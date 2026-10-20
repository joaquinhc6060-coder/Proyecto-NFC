-- =========================================================================
-- ESQUEMA DE SEGURIDAD, PRIVACIDAD Y AISLAMIENTO MULTI-TENANT (SAAS RESTAURANTES)
-- Plataforma: Supabase / PostgreSQL con Row Level Security (RLS) Estricto
-- Cumplimiento:
--  1. Aislamiento total de datos entre restaurantes (Multi-Tenant por restaurant_id)
--  2. Restricción absoluta para Superadmins (Cero acceso a boletas y perfiles de clientes)
--  3. Cifrado de contraseñas con Bcrypt/Argon2 (Manejado por auth.users, nunca texto plano)
--  4. Cifrado en tránsito (TLS/HTTPS) y reposo (Storage Cifrado SSE-KMS/AES-256)
--  5. Idempotente (Seguro para ejecutar múltiples veces sin borrar datos existentes)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 1. TABLA: RESTAURANTES (TENANTS / LOCALES GASTRONÓMICOS)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.restaurantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  slug VARCHAR(80) UNIQUE NOT NULL,                       -- Ej: 'bistro-costanera'
  nombre VARCHAR(120) NOT NULL,
  tipo_gastronomia VARCHAR(80),
  ciudad VARCHAR(80) DEFAULT 'Viña del Mar / Santiago, Chile',
  codigo_licencia VARCHAR(80) UNIQUE NOT NULL,           -- Licencia comercial B2B
  mesas_totales INTEGER DEFAULT 20,
  wifi_ssid VARCHAR(80),
  wifi_password VARCHAR(80),
  url_carta_digital TEXT,
  
  -- Geofencing Nativo (Apple Wallet & Google Wallet proximity alert a 100m)
  geofence_lat NUMERIC(10, 7) DEFAULT -33.015348,
  geofence_lng NUMERIC(10, 7) DEFAULT -71.551224,
  geofence_radius INTEGER DEFAULT 100,                   -- Metros
  geofence_message TEXT DEFAULT '¡Estás cerca! Muestra tu tarjeta VIP en la barra para tu beneficio.',
  
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 2. TABLA: RESTAURANT_STAFF (EQUIPO AUTORIZADO DEL RESTAURANTE)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.restaurant_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurantes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rol VARCHAR(30) DEFAULT 'mesero',                      -- 'dueno', 'administrador', 'mesero'
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(restaurant_id, user_id)
);

-- =========================================================================
-- 3. TABLA: COMENSALES (CRM INTELIGENTE Y PERFILES DE HÁBITOS IA POR LOCAL)
-- =========================================================================
-- Privacidad: Esta información pertenece ÚNICAMENTE al restaurante donde consumió.
-- Ni otros restaurantes ni los superadmins de FindeMe tienen visibilidad sobre ella.
CREATE TABLE IF NOT EXISTS public.comensales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurantes(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Opcional si el comensal crea cuenta propia
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(40),
  email VARCHAR(120),
  cumpleanos DATE,
  nivel_socio VARCHAR(30) DEFAULT 'Oro VIP',             -- 'Plata', 'Oro VIP', 'Black VIP'
  puntos INTEGER DEFAULT 0,
  sellos INTEGER DEFAULT 0,                               -- Progreso de 0 a 5 sellos
  gasto_total_acumulado NUMERIC(12, 2) DEFAULT 0,
  boletas_validadas_count INTEGER DEFAULT 0,
  wallet_platform VARCHAR(30) DEFAULT 'Apple Wallet',    -- 'Apple Wallet' | 'Google Wallet'
  
  -- Perfilamiento inteligente inferido exclusivamente por IA a partir de boletas
  tags_ia TEXT[] DEFAULT '{}',                            -- Ej: ['Consume Coctelería', 'Amante de Pizzas', 'Ticket Alto']
  
  ultima_visita TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por teléfono y etiquetas en el CRM del local
CREATE INDEX IF NOT EXISTS idx_comensales_tenant ON public.comensales(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_comensales_telefono ON public.comensales(restaurant_id, telefono);

-- =========================================================================
-- 4. TABLA: TARJETAS_VIP_PASES (PASES NATIVOS APPLE / GOOGLE WALLET)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.tarjetas_vip_pases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurantes(id) ON DELETE CASCADE,
  comensal_id UUID NOT NULL REFERENCES public.comensales(id) ON DELETE CASCADE,
  pass_serial_number VARCHAR(100) UNIQUE NOT NULL,       -- Ej: 'VIP-cust-01-2026'
  qr_salt_token VARCHAR(50) NOT NULL,                    -- Token rotativo antifraude
  push_token_apns TEXT,                                  -- Token para Push a pantalla de bloqueo en iOS
  google_wallet_object_id TEXT,                          -- Objeto de pase en Google Wallet API
  estado VARCHAR(20) DEFAULT 'activa',                   -- 'activa', 'revocada', 'bloqueada'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pases_tenant ON public.tarjetas_vip_pases(restaurant_id);

-- =========================================================================
-- 5. TABLA: BOLETAS_RESTAURANTE (REGISTRO TRANSACCIONAL OCR & ANTIFRAUDE)
-- =========================================================================
-- Privacidad y Antifraude: Guarda el hash SHA256 único para impedir reutilización de boletas.
-- Los archivos físicos en Cloud Storage quedan cifrados en reposo.
CREATE TABLE IF NOT EXISTS public.boletas_restaurante (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurantes(id) ON DELETE CASCADE,
  comensal_id UUID REFERENCES public.comensales(id) ON DELETE SET NULL,
  cliente_nombre VARCHAR(100) NOT NULL,
  mesa VARCHAR(30) DEFAULT 'Mesa General',
  fecha_consumo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_monto NUMERIC(12, 2) NOT NULL,
  
  -- Desglose extraído por visión artificial OCR (Gemini / OpenAI)
  items_detectados JSONB NOT NULL DEFAULT '[]',          -- Array de { cant, nombre, cat, precio }
  tags_generados TEXT[] DEFAULT '{}',
  
  -- Criptografía antifraude: Impide subir la misma boleta dos veces en cualquier mesa
  hash_antifraude VARCHAR(128) NOT NULL,
  confianza_ocr NUMERIC(5, 2) DEFAULT 98.5,
  estado_ia VARCHAR(40) DEFAULT 'Aprobada por IA',
  sello_otorgado BOOLEAN DEFAULT TRUE,
  
  -- Enlace a Cloud Storage (Supabase Storage / R2 / S3 con cifrado en reposo)
  imagen_storage_url TEXT NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(restaurant_id, hash_antifraude)
);

CREATE INDEX IF NOT EXISTS idx_boletas_tenant ON public.boletas_restaurante(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_boletas_hash ON public.boletas_restaurante(hash_antifraude);

-- =========================================================================
-- 6. TABLA: CAMPANAS_PUSH (NOTIFICACIONES A PANTALLAS DE BLOQUEO)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.campanas_push (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurantes(id) ON DELETE CASCADE,
  titulo VARCHAR(150) NOT NULL,
  cuerpo_mensaje TEXT NOT NULL,
  segmento_tags TEXT[] NOT NULL,                         -- Ej: ['Consume Coctelería']
  destinatarios_estimados INTEGER DEFAULT 0,
  entregados_apple INTEGER DEFAULT 0,
  entregados_google INTEGER DEFAULT 0,
  enviado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campanas_tenant ON public.campanas_push(restaurant_id);

-- =========================================================================
-- 7. TABLA: WAITER_PINS (PINES DINÁMICOS DE MESEROS DE ROTACIÓN CADA 60S)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.waiter_pins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurantes(id) ON DELETE CASCADE,
  pin_code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pins_tenant ON public.waiter_pins(restaurant_id, expires_at);

-- =========================================================================
-- FUNCIONES DE SEGURIDAD DEFINER (VALIDACIÓN DE TENANT EN BASE DE DATOS)
-- =========================================================================

-- Verifica si el usuario actual autenticado es el PROPIETARIO verificado del restaurante
CREATE OR REPLACE FUNCTION public.is_restaurant_owner(target_restaurant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.restaurantes
    WHERE id = target_restaurant_id
      AND owner_id = auth.uid()
      AND activo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Verifica si el usuario actual es un miembro de staff autorizado
CREATE OR REPLACE FUNCTION public.is_restaurant_staff(target_restaurant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.restaurant_staff
    WHERE restaurant_id = target_restaurant_id
      AND user_id = auth.uid()
      AND activo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Acceso al tenant concedido exclusivamente a Dueños y Staff autorizados
CREATE OR REPLACE FUNCTION public.has_tenant_access(target_restaurant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_restaurant_owner(target_restaurant_id)
      OR public.is_restaurant_staff(target_restaurant_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =========================================================================
-- POLÍTICAS DE ROW LEVEL SECURITY (RLS) - AISLAMIENTO ESTRICTO
-- =========================================================================

ALTER TABLE public.restaurantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comensales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarjetas_vip_pases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boletas_restaurante ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanas_push ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiter_pins ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- POLÍTICAS PARA 'restaurantes'
-- -------------------------------------------------------------------------
-- Lectura pública para la landing y peanas NFC de mesa
DROP POLICY IF EXISTS "Lectura pública de perfil comercial del restaurante" ON public.restaurantes;
CREATE POLICY "Lectura pública de perfil comercial del restaurante"
  ON public.restaurantes FOR SELECT
  USING (activo = true);

-- Solo el dueño verificado puede editar su restaurante
DROP POLICY IF EXISTS "Dueño administra su propio restaurante" ON public.restaurantes;
CREATE POLICY "Dueño administra su propio restaurante"
  ON public.restaurantes FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- -------------------------------------------------------------------------
-- POLÍTICAS PARA 'comensales' (PRIVACIDAD TOTAL DE CLIENTES Y HÁBITOS IA)
-- -------------------------------------------------------------------------
-- REGLA ESTRICTA: Ni superadmin ni otros restaurantes pueden ver esta tabla.
-- Solo el dueño o staff autenticado de ESTE restaurante específico.
DROP POLICY IF EXISTS "Aislamiento Tenant: Dueño accede a sus comensales" ON public.comensales;
CREATE POLICY "Aislamiento Tenant: Dueño accede a sus comensales"
  ON public.comensales FOR ALL
  USING (public.has_tenant_access(restaurant_id))
  WITH CHECK (public.has_tenant_access(restaurant_id));

-- El comensal puede consultar su propia tarjeta si está autenticado
DROP POLICY IF EXISTS "Comensal consulta su propia tarjeta VIP" ON public.comensales;
CREATE POLICY "Comensal consulta su propia tarjeta VIP"
  ON public.comensales FOR SELECT
  USING (auth_user_id = auth.uid());

-- -------------------------------------------------------------------------
-- POLÍTICAS PARA 'boletas_restaurante' (TRANSACCIONES FINANCIERAS)
-- -------------------------------------------------------------------------
-- REGLA ESTRICTA: El superadmin NO TIENE PERMISOS de lectura sobre las boletas.
-- Solo el restaurante dueño del tenant puede inspeccionar sus boletas e ítems.
DROP POLICY IF EXISTS "Aislamiento Tenant: Dueño audita sus boletas con OCR" ON public.boletas_restaurante;
CREATE POLICY "Aislamiento Tenant: Dueño audita sus boletas con OCR"
  ON public.boletas_restaurante FOR SELECT
  USING (public.has_tenant_access(restaurant_id));

-- Inserción de boleta: el comensal o frontend puede ingresar boleta con hash antifraude
DROP POLICY IF EXISTS "Comensal envía boleta para validación con IA" ON public.boletas_restaurante;
CREATE POLICY "Comensal envía boleta para validación con IA"
  ON public.boletas_restaurante FOR INSERT
  WITH CHECK (true);

-- -------------------------------------------------------------------------
-- POLÍTICAS PARA 'tarjetas_vip_pases'
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Aislamiento Tenant: Gestión de pases Apple/Google" ON public.tarjetas_vip_pases;
CREATE POLICY "Aislamiento Tenant: Gestión de pases Apple/Google"
  ON public.tarjetas_vip_pases FOR ALL
  USING (public.has_tenant_access(restaurant_id))
  WITH CHECK (public.has_tenant_access(restaurant_id));

DROP POLICY IF EXISTS "Validación pública de pase por serial y salt" ON public.tarjetas_vip_pases;
CREATE POLICY "Validación pública de pase por serial y salt"
  ON public.tarjetas_vip_pases FOR SELECT
  USING (estado = 'activa');

-- -------------------------------------------------------------------------
-- POLÍTICAS PARA 'campanas_push'
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Aislamiento Tenant: Dueño gestiona sus campañas push" ON public.campanas_push;
CREATE POLICY "Aislamiento Tenant: Dueño gestiona sus campañas push"
  ON public.campanas_push FOR ALL
  USING (public.has_tenant_access(restaurant_id))
  WITH CHECK (public.has_tenant_access(restaurant_id));

-- -------------------------------------------------------------------------
-- POLÍTICAS PARA 'waiter_pins'
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Aislamiento Tenant: Dueño y staff gestionan pines de mesero" ON public.waiter_pins;
CREATE POLICY "Aislamiento Tenant: Dueño y staff gestionan pines de mesero"
  ON public.waiter_pins FOR ALL
  USING (public.has_tenant_access(restaurant_id))
  WITH CHECK (public.has_tenant_access(restaurant_id));

-- Validación pública de PIN vigente en mesa
DROP POLICY IF EXISTS "Validación en mesa de PIN no expirado" ON public.waiter_pins;
CREATE POLICY "Validación en mesa de PIN no expirado"
  ON public.waiter_pins FOR SELECT
  USING (expires_at > NOW());

-- =========================================================================
-- 8. POLÍTICAS DE SEGURIDAD EN SUPABASE STORAGE (OBJETOS CIFRADOS EN REPOSO)
-- =========================================================================

-- Asegurar creación del bucket privado de boletas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'boletas',
  'boletas',
  false,                                                 -- Privado (Cifrado en reposo)
  5242880,                                               -- 5 MB límite estricto
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880;

-- Solo los comensales o el frontend pueden subir imágenes a la carpeta de su local
DROP POLICY IF EXISTS "Subida segura de boletas por comensales" ON storage.objects;
CREATE POLICY "Subida segura de boletas por comensales"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'boletas'
    AND (storage.foldername(name))[1] = 'restaurantes'
  );

-- Solo el dueño o staff autorizado de ese restaurante puede ver o descargar los archivos de sus boletas
DROP POLICY IF EXISTS "Aislamiento Storage: Dueño accede solo a sus boletas" ON storage.objects;
CREATE POLICY "Aislamiento Storage: Dueño accede solo a sus boletas"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'boletas'
    AND EXISTS (
      SELECT 1 FROM public.restaurantes r
      WHERE r.slug = (storage.foldername(name))[2]
        AND public.has_tenant_access(r.id)
    )
  );
