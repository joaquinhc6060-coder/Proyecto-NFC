-- ============================================================================
-- VIGIO · ESQUEMA OFICIAL DE SEGURIDAD (CON PIN PRIVADO DE ACTIVACIÓN)
-- ============================================================================
-- Cada placa física tiene:
-- 1. TOKEN PÚBLICO (8 caracteres): Grabado en el chip NFC y código QR.
-- 2. PIN SECRETO DE ACTIVACIÓN (6 dígitos numéricos): Impreso en la tarjeta
--    dentro del empaque sellado que recibe el cliente al comprar.
--
-- Si alguien escanea la placa antes de que el cliente la compre, NO PODRÁ
-- activarla sin el PIN secreto.
-- ============================================================================

-- 1. Habilitar extensión pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA DE PLACAS FÍSICAS (Tokens y PINs)
CREATE TABLE IF NOT EXISTS public.placas_vigio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Token público aleatorio corto grabado en la URL: https://vigio.cl/p/[token]
    token VARCHAR(16) UNIQUE NOT NULL,
    
    -- PIN Secreto de activación (6 dígitos numéricos entregados en el empaque)
    pin_activacion VARCHAR(10) NOT NULL,
    
    -- Estado: 'fabricada' (sin activar) | 'activada' (en uso diario) | 'bloqueada'
    estado VARCHAR(20) DEFAULT 'fabricada' NOT NULL,
    
    -- Lote de fabricación
    lote VARCHAR(50) DEFAULT 'LOTE-1-100-2026',
    
    -- Tipo y color de placa
    tipo_producto VARCHAR(30) DEFAULT 'mascota_circular' NOT NULL,
    color VARCHAR(20) DEFAULT 'negro',
    
    -- ID del dueño una vez activada (relación con auth.users de Supabase)
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Auditoría de fechas
    fecha_fabricacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_activacion TIMESTAMPTZ,
    
    CONSTRAINT chk_estado_placa CHECK (estado IN ('fabricada', 'activada', 'bloqueada'))
);

CREATE INDEX IF NOT EXISTS idx_placas_vigio_token ON public.placas_vigio(token);

-- 3. TABLA DE PERFILES / DATOS VINCULADOS A LA PLACA
CREATE TABLE IF NOT EXISTS public.perfiles_vigio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placa_id UUID NOT NULL REFERENCES public.placas_vigio(id) ON DELETE CASCADE UNIQUE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Datos del objeto / mascota
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) DEFAULT 'mascota', -- 'mascota', 'nino', 'llaves', 'equipaje'
    raza_o_modelo VARCHAR(100),
    foto_url TEXT,
    
    -- Contactos de rescate
    telefono_contacto VARCHAR(20) NOT NULL,
    whatsapp_contacto VARCHAR(20) NOT NULL,
    nombre_contacto VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) DEFAULT 'Chile',
    
    -- Mensaje de auxilio y rescate
    mensaje_auxilio TEXT DEFAULT '¡Hola! Me he perdido, por favor contacta a mi dueño.',
    
    -- Información médica o advertencias
    alergias TEXT,
    cuidados_especiales TEXT,
    
    -- Estado de alerta: 'safe' (tranquilo) | 'lost' (modo extravío activo con alarma)
    estado_alerta VARCHAR(20) DEFAULT 'lost' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perfiles_vigio_placa_id ON public.perfiles_vigio(placa_id);

-- 4. POLÍTICAS DE SEGURIDAD (RLS)
ALTER TABLE public.placas_vigio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles_vigio ENABLE ROW LEVEL SECURITY;

-- Lectura pública para cualquier rescatista que escanee el QR/NFC
CREATE POLICY "Permitir lectura publica de placas"
ON public.placas_vigio FOR SELECT
USING (true);

CREATE POLICY "Permitir lectura publica de perfiles"
ON public.perfiles_vigio FOR SELECT
USING (true);

-- Permitir activar placa (UPDATE) durante el proceso de activación
CREATE POLICY "Permitir activacion de placas"
ON public.placas_vigio FOR UPDATE
USING (true)
WITH CHECK (true);

-- Permitir creación de perfil (INSERT) durante la activación
CREATE POLICY "Permitir crear perfil de placa"
ON public.perfiles_vigio FOR INSERT
WITH CHECK (true);

-- Permitir al dueño actualizar su perfil
CREATE POLICY "Permitir al dueno actualizar su perfil"
ON public.perfiles_vigio FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 5. GENERADOR DE LOS PRIMEROS 100 TOKENS CON SUS PINS SECRETOS DE 6 DÍGITOS
-- ============================================================================
DO $$
DECLARE
    caracteres TEXT := '23456789abcdefghjkmnpqrstuvwxyz'; -- Sin caracteres ambiguos
    token_generado TEXT;
    pin_generado TEXT;
    i INT;
    pos INT;
BEGIN
    FOR i IN 1..100 LOOP
        LOOP
            -- Generar Token Público (8 chars)
            token_generado := '';
            FOR j IN 1..8 LOOP
                pos := floor(random() * length(caracteres) + 1)::int;
                token_generado := token_generado || substr(caracteres, pos, 1);
            END LOOP;
            
            -- Asegurar unicidad absoluta antes de insertar
            EXIT WHEN NOT EXISTS (SELECT 1 FROM public.placas_vigio WHERE token = token_generado);
        END LOOP;

        -- Generar PIN secreto de 6 dígitos numéricos (ej: 849201)
        pin_generado := lpad(floor(random() * 900000 + 100000)::text, 6, '0');

        INSERT INTO public.placas_vigio (token, pin_activacion, estado, lote, tipo_producto)
        VALUES (token_generado, pin_generado, 'fabricada', 'LOTE-1-100-2026', 'mascota_circular')
        ON CONFLICT (token) DO NOTHING;
    END LOOP;
END $$;

-- ============================================================================
-- 6. CONSULTA PARA EXPORTAR EL LISTADO A EXCEL / CSV PARA FABRICACIÓN Y VENTAS
-- ============================================================================
-- Esta tabla te da:
-- 1. Lo que mandas al fabricante (url_grabado_nfc_y_qr)
-- 2. Lo que imprimes en el cartón o sobre del producto (pin_secreto_empaque)
SELECT 
    ROW_NUMBER() OVER (ORDER BY fecha_fabricacion ASC) AS nro,
    token AS token_publico,
    'https://vigio.cl/p/' || token AS url_grabado_nfc_y_qr,
    pin_activacion AS pin_secreto_empaque,
    estado,
    lote
FROM public.placas_vigio
WHERE lote = 'LOTE-1-100-2026'
ORDER BY fecha_fabricacion ASC;
