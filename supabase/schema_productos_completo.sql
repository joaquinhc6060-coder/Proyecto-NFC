-- =========================================================================
-- ESQUEMA INTEGRAL MULTIPRODUCTO PARA FINDME (SUPABASE)
-- Abarca: 1. Mascotas | 2. Kids (Pulseras) | 3. Restaurantes & VIP | 4. Contactos/Leads
-- Idempotente (Seguro para ejecutar múltiples veces sin romper datos existentes)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- ACTUALIZACIÓN DE TABLA BASE DE HARDWARE NFC (Soporte multiproducto)
-- -------------------------------------------------------------------------
ALTER TABLE public.placas_nfc 
  ADD COLUMN IF NOT EXISTS categoria VARCHAR(30) DEFAULT 'mascota', -- 'mascota', 'kid', 'restaurante', 'vip'
  ADD COLUMN IF NOT EXISTS nombre_asignado VARCHAR(100);

-- =========================================================================
-- 1. TABLA: KIDS_PROFILES (Pulseras inteligentes de silicona para niños)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.kids_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  placa_id UUID UNIQUE REFERENCES public.placas_nfc(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_nino VARCHAR(80) NOT NULL,
  edad VARCHAR(20),
  foto_url TEXT,
  tipo_sangre VARCHAR(10),
  alergias_condiciones TEXT[] DEFAULT '{}',
  mensaje_auxilio TEXT DEFAULT 'Si me encuentras perdido, por favor llama de inmediato a mis padres o avisa a seguridad.',
  
  -- Contactos de emergencia primario y secundario (Mamá / Papá / Tutor)
  contacto_principal_nombre VARCHAR(80) NOT NULL,
  contacto_principal_telefono VARCHAR(40) NOT NULL,
  contacto_principal_whatsapp VARCHAR(40),
  contacto_secundario_nombre VARCHAR(80),
  contacto_secundario_telefono VARCHAR(40),
  
  estado_alerta VARCHAR(20) DEFAULT 'safe', -- 'safe' | 'lost' (Extraviado/Urgente)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 2. TABLA: RESTAURANT_MESAS (Peanas NFC de mesa para gastronomía)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.restaurant_mesas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  placa_id UUID UNIQUE REFERENCES public.placas_nfc(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_local VARCHAR(100) NOT NULL,
  numero_mesa VARCHAR(20) NOT NULL,
  url_carta_digital TEXT NOT NULL,       -- Link al menú PDF, Notion o carta web
  wifi_ssid VARCHAR(80),                 -- Red Wi-Fi del restaurante
  wifi_password VARCHAR(80),             -- Clave Wi-Fi para conexión por toque
  url_reviews_google TEXT,               -- Enlace directo para dejar reseña en Google Maps
  instagram_local VARCHAR(80),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 3. TABLA: TARJETAS_VIP_FIDELIZACION (Tarjetas metálicas VIP para clientes)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.tarjetas_vip (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  placa_id UUID UNIQUE REFERENCES public.placas_nfc(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_cliente VARCHAR(100) NOT NULL,
  email_cliente VARCHAR(120),
  nombre_local VARCHAR(100) NOT NULL,
  nivel_vip VARCHAR(30) DEFAULT 'Black VIP', -- 'Silver', 'Gold', 'Black VIP'
  puntos_acumulados INTEGER DEFAULT 0,
  beneficios_activos TEXT[] DEFAULT '{"15% de descuento en carta", "Cóctel de bienvenida de cortesía", "Mesa prioritaria sin reserva previa"}',
  estado VARCHAR(20) DEFAULT 'activa',       -- 'activa', 'pausada', 'vencida'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 4. TABLA: CONTACTOS (Bandeja de entrada de Leads & Cotizaciones B2B)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.contactos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(150) NOT NULL,
  producto_interes VARCHAR(50) DEFAULT 'animales', -- 'animales', 'kids', 'restaurantes', 'distribuidor'
  mensaje TEXT,
  telefono VARCHAR(50),
  origen VARCHAR(50) DEFAULT 'web_contacto',
  leido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- =========================================================================

ALTER TABLE public.kids_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarjetas_vip ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contactos ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- Políticas Kids (Lectura pública para rescate, edición privada para padres)
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Lectura pública de perfil de niño al escanear" ON public.kids_profiles;
CREATE POLICY "Lectura pública de perfil de niño al escanear"
  ON public.kids_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Padres pueden gestionar perfil de sus hijos" ON public.kids_profiles;
CREATE POLICY "Padres pueden gestionar perfil de sus hijos"
  ON public.kids_profiles FOR ALL USING (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- Políticas Restaurantes (Clientes de la mesa leen carta/wifi, dueño edita)
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Clientes de la mesa leen carta y wifi al tocar peana" ON public.restaurant_mesas;
CREATE POLICY "Clientes de la mesa leen carta y wifi al tocar peana"
  ON public.restaurant_mesas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Restaurante administra sus propias mesas" ON public.restaurant_mesas;
CREATE POLICY "Restaurante administra sus propias mesas"
  ON public.restaurant_mesas FOR ALL USING (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- Políticas VIP (Cliente y mesero validan beneficios, local administra)
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Validación pública de tarjeta VIP al toque" ON public.tarjetas_vip;
CREATE POLICY "Validación pública de tarjeta VIP al toque"
  ON public.tarjetas_vip FOR SELECT USING (true);

DROP POLICY IF EXISTS "Local administra tarjetas VIP" ON public.tarjetas_vip;
CREATE POLICY "Local administra tarjetas VIP"
  ON public.tarjetas_vip FOR ALL USING (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- Políticas Contactos (Cualquier visitante puede enviar mensaje, admin lee)
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Cualquier visitante puede enviar mensaje de contacto" ON public.contactos;
CREATE POLICY "Cualquier visitante puede enviar mensaje de contacto"
  ON public.contactos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Solo usuarios autenticados pueden ver leads de contacto" ON public.contactos;
CREATE POLICY "Solo usuarios autenticados pueden ver leads de contacto"
  ON public.contactos FOR SELECT USING (auth.role() = 'authenticated');

-- =========================================================================
-- DISPOSITIVOS SEMILLA DE PRUEBA (Para validar de inmediato)
-- =========================================================================

-- Pulsera de Martina (Kids)
INSERT INTO public.placas_nfc (codigo_publico, codigo_pin, tipo_chip, categoria, estado)
VALUES ('KIDS-7741-CL', '1234', 'NTAG213 Silicona Sumergible', 'kid', 'activa')
ON CONFLICT (codigo_publico) DO NOTHING;

-- Peana Mesa 4 (Restaurante)
INSERT INTO public.placas_nfc (codigo_publico, codigo_pin, tipo_chip, categoria, estado)
VALUES ('REST-004-VIP', '1234', 'NTAG213 Acrílico Anti-líquidos', 'restaurante', 'activa')
ON CONFLICT (codigo_publico) DO NOTHING;

-- Tarjeta VIP Fidelización
INSERT INTO public.placas_nfc (codigo_publico, codigo_pin, tipo_chip, categoria, estado)
VALUES ('VIP-GOLD-99', '1234', 'NTAG216 Tarjeta Metálica CNC', 'vip', 'activa')
ON CONFLICT (codigo_publico) DO NOTHING;
