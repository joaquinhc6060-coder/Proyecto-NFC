-- =========================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS SUPABASE PARA FINDME (PLACAS NFC)
-- Versión Idempotente (Segura para ejecutar múltiples veces sin errores)
-- =========================================================================

-- Habilitar extensión UUID si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: PROFILES (Extensión del usuario autenticado en Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  telefono TEXT,
  whatsapp TEXT,
  instagram TEXT,
  ciudad TEXT DEFAULT 'Santiago, Chile',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente cuando un usuario se registra con Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre_completo, telefono, whatsapp, instagram)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', 'Dueño FindMe'),
    NEW.raw_user_meta_data->>'telefono',
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.raw_user_meta_data->>'instagram'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. TABLA: PLACAS NFC (Control del hardware físico)
CREATE TABLE IF NOT EXISTS public.placas_nfc (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_publico VARCHAR(50) UNIQUE NOT NULL, -- Ej: FINDME-9824-CL
  codigo_pin VARCHAR(20),                     -- PIN secreto de activación
  tipo_chip VARCHAR(80) DEFAULT 'NTAG213 High-Frequency (13.56 MHz)',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  estado VARCHAR(20) DEFAULT 'disponible',    -- 'disponible', 'activa', 'bloqueada'
  fecha_activacion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA: MASCOTAS (Perfil asociado a la placa NFC)
CREATE TABLE IF NOT EXISTS public.mascotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  placa_id UUID UNIQUE REFERENCES public.placas_nfc(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(80) NOT NULL,
  especie VARCHAR(50) DEFAULT 'Perro',
  raza VARCHAR(100),
  edad VARCHAR(30),
  foto_url TEXT,
  acerca_de TEXT,
  alergias_medicamentos TEXT[] DEFAULT '{}',
  alergias_alimentos TEXT[] DEFAULT '{}',
  estado_alerta VARCHAR(20) DEFAULT 'safe', -- 'safe' (Segura) | 'lost' (Extraviada)
  mostrar_telefono BOOLEAN DEFAULT TRUE,
  mostrar_whatsapp BOOLEAN DEFAULT TRUE,
  mostrar_correo BOOLEAN DEFAULT TRUE,
  mostrar_ubicacion_gps BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA: ESCANEOS Y TELEMETRÍA GPS
CREATE TABLE IF NOT EXISTS public.escaneos_gps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mascota_id UUID REFERENCES public.mascotas(id) ON DELETE CASCADE,
  placa_id UUID REFERENCES public.placas_nfc(id) ON DELETE CASCADE,
  latitud NUMERIC(10, 7),
  longitud NUMERIC(10, 7),
  dispositivo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- Permite lectura pública al escanear, pero solo el dueño puede editar.
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placas_nfc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mascotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escaneos_gps ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- Políticas para 'profiles'
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Dueño puede ver su propio perfil" ON public.profiles;
CREATE POLICY "Dueño puede ver su propio perfil" 
  ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Dueño puede actualizar su propio perfil" ON public.profiles;
CREATE POLICY "Dueño puede actualizar su propio perfil" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- -------------------------------------------------------------------------
-- Políticas para 'placas_nfc'
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Cualquiera puede consultar placas para validar lectura NFC" ON public.placas_nfc;
CREATE POLICY "Cualquiera puede consultar placas para validar lectura NFC" 
  ON public.placas_nfc FOR SELECT USING (true);

DROP POLICY IF EXISTS "Dueño puede vincular su placa" ON public.placas_nfc;
CREATE POLICY "Dueño puede vincular su placa" 
  ON public.placas_nfc FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- -------------------------------------------------------------------------
-- Políticas para 'mascotas'
-- -------------------------------------------------------------------------
-- LECTURA PÚBLICA: Quien escanea la placa NFC en la calle debe ver la información
DROP POLICY IF EXISTS "Perfil de mascota visible públicamente al escanear" ON public.mascotas;
CREATE POLICY "Perfil de mascota visible públicamente al escanear" 
  ON public.mascotas FOR SELECT USING (true);

-- EDICIÓN PRIVADA: Solo el dueño autenticado puede modificar los datos
DROP POLICY IF EXISTS "Dueño puede crear su mascota" ON public.mascotas;
CREATE POLICY "Dueño puede crear su mascota" 
  ON public.mascotas FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Dueño puede editar su mascota" ON public.mascotas;
CREATE POLICY "Dueño puede editar su mascota" 
  ON public.mascotas FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Dueño puede eliminar su mascota" ON public.mascotas;
CREATE POLICY "Dueño puede eliminar su mascota" 
  ON public.mascotas FOR DELETE USING (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- Políticas para 'escaneos_gps'
-- -------------------------------------------------------------------------
-- Cualquiera que encuentre a la mascota puede registrar un escaneo/ubicación
DROP POLICY IF EXISTS "Cualquiera puede registrar un escaneo GPS" ON public.escaneos_gps;
CREATE POLICY "Cualquiera puede registrar un escaneo GPS" 
  ON public.escaneos_gps FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Dueño de la mascota puede ver el historial de escaneos" ON public.escaneos_gps;
CREATE POLICY "Dueño de la mascota puede ver el historial de escaneos" 
  ON public.escaneos_gps FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.mascotas WHERE mascotas.id = escaneos_gps.mascota_id AND mascotas.user_id = auth.uid()
  ));

-- =========================================================================
-- DATOS SEMILLA DE EJEMPLO (LUNA)
-- Para que puedas probar el sistema de inmediato con datos reales
-- =========================================================================

-- 1. Insertar una placa de demostración si no existe
INSERT INTO public.placas_nfc (codigo_publico, codigo_pin, estado)
VALUES ('FINDME-9824-CL', '1234', 'activa')
ON CONFLICT (codigo_publico) DO NOTHING;
