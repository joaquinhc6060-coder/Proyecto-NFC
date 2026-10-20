-- =========================================================================
-- SEED DE DATOS INICIALES: RESTAURANTE DEMO (BISTRÓ & COCKTAILS COSTANERA)
-- Plataforma: Supabase / PostgreSQL con Row Level Security (RLS)
-- Carga:
--   1. Usuario Propietario en auth.users (si no existe)
--   2. Tenant Restaurante ('bistro-costanera' con licencia BISTRO-VIP-2026)
--   3. Peanas NFC de Mesa (placas_nfc y restaurant_mesas)
--   4. 6 Clientes con Perfilamiento de Hábitos IA en public.comensales
--   5. Pases nativos Apple & Google Wallet en public.tarjetas_vip_pases
--   6. Boletas analizadas por IA con Hashes SHA256 en public.boletas_restaurante
--   7. Campaña Push histórica en public.campanas_push
--   8. PIN Dinámico de mesero en public.waiter_pins
-- Idempotente: Seguro para ejecutar múltiples veces sin duplicar registros.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------------------
-- 0. ASEGURAR COLUMNAS EN TABLA BASE DE HARDWARE NFC (placas_nfc)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.placas_nfc (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_publico VARCHAR(50) UNIQUE NOT NULL,
  codigo_pin VARCHAR(20),
  tipo_chip VARCHAR(80) DEFAULT 'NTAG213 High-Frequency (13.56 MHz)',
  categoria VARCHAR(30) DEFAULT 'mascota',
  nombre_asignado VARCHAR(100),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  estado VARCHAR(20) DEFAULT 'disponible',
  fecha_activacion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.placas_nfc 
  ADD COLUMN IF NOT EXISTS categoria VARCHAR(30) DEFAULT 'mascota',
  ADD COLUMN IF NOT EXISTS nombre_asignado VARCHAR(100);

DO $$
DECLARE
  v_owner_id UUID;
  v_restaurant_id UUID;
  v_cust_1 UUID;
  v_cust_2 UUID;
  v_cust_3 UUID;
  v_cust_4 UUID;
  v_cust_5 UUID;
  v_cust_6 UUID;
  v_placa_m4 UUID;
  v_placa_m8 UUID;
  v_placa_m14 UUID;
  v_placa_b2 UUID;
BEGIN

  -- -------------------------------------------------------------------------
  -- 1. IDENTIFICAR O CREAR EL USUARIO PROPIETARIO EN auth.users
  -- -------------------------------------------------------------------------
  SELECT id INTO v_owner_id FROM auth.users WHERE email = 'gerencia@bistrocostanera.cl' LIMIT 1;

  IF v_owner_id IS NULL THEN
    -- Si ya hay algún usuario registrado en Supabase, asociarlo como dueño
    SELECT id INTO v_owner_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  END IF;

  IF v_owner_id IS NULL THEN
    -- Si auth.users está completamente vacío, crear el usuario con clave encriptada (Bcrypt)
    v_owner_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_owner_id,
      'authenticated',
      'authenticated',
      'gerencia@bistrocostanera.cl',
      crypt('Bistro2026!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"nombre_completo":"Carlos Henríquez","role":"restaurant_owner","restaurant_name":"Bistró & Cocktails Costanera"}',
      NOW(),
      NOW()
    );
  END IF;

  -- -------------------------------------------------------------------------
  -- 2. INSERTAR RESTAURANTE (TENANT SAAS)
  -- -------------------------------------------------------------------------
  INSERT INTO public.restaurantes (
    owner_id,
    slug,
    nombre,
    tipo_gastronomia,
    ciudad,
    codigo_licencia,
    mesas_totales,
    wifi_ssid,
    wifi_password,
    url_carta_digital,
    geofence_lat,
    geofence_lng,
    geofence_radius,
    geofence_message,
    activo
  ) VALUES (
    v_owner_id,
    'bistro-costanera',
    'Bistró & Cocktails Costanera',
    'Gastronomía & Coctelería de Autor',
    'Viña del Mar / Santiago, Chile',
    'BISTRO-VIP-2026',
    28,
    'Bistro_Clientes_VIP',
    'BistroVip2026',
    'https://findeme.cl/menu/bistro-costanera',
    -33.015348,
    -71.551224,
    100,
    '¡Estás a menos de 100m de Bistró Costanera! Muestra tu tarjeta VIP en la Wallet y recibe un cóctel de bienvenida con tu cena.',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    codigo_licencia = EXCLUDED.codigo_licencia,
    mesas_totales = EXCLUDED.mesas_totales,
    wifi_ssid = EXCLUDED.wifi_ssid,
    wifi_password = EXCLUDED.wifi_password,
    geofence_radius = EXCLUDED.geofence_radius
  RETURNING id INTO v_restaurant_id;

  -- Asegurar membresía de Staff
  INSERT INTO public.restaurant_staff (restaurant_id, user_id, rol, activo)
  VALUES (v_restaurant_id, v_owner_id, 'dueno', true)
  ON CONFLICT (restaurant_id, user_id) DO NOTHING;

  -- -------------------------------------------------------------------------
  -- 3. INSERTAR PEANAS NFC FÍSICAS DE MESA (HARDWARE)
  -- -------------------------------------------------------------------------
  -- Mesa 4
  INSERT INTO public.placas_nfc (codigo_publico, codigo_pin, tipo_chip, categoria, estado)
  VALUES ('REST-004-VIP', '1234', 'NTAG213 Acrílico Anti-líquidos', 'restaurante', 'activa')
  ON CONFLICT (codigo_publico) DO UPDATE SET estado = 'activa'
  RETURNING id INTO v_placa_m4;

  -- Mesa 8 (Terraza)
  INSERT INTO public.placas_nfc (codigo_publico, codigo_pin, tipo_chip, categoria, estado)
  VALUES ('REST-008-VIP', '1234', 'NTAG213 Acrílico Anti-líquidos', 'restaurante', 'activa')
  ON CONFLICT (codigo_publico) DO UPDATE SET estado = 'activa'
  RETURNING id INTO v_placa_m8;

  -- Mesa 14 (Principal)
  INSERT INTO public.placas_nfc (codigo_publico, codigo_pin, tipo_chip, categoria, estado)
  VALUES ('REST-014-VIP', '1234', 'NTAG213 Acrílico Anti-líquidos', 'restaurante', 'activa')
  ON CONFLICT (codigo_publico) DO UPDATE SET estado = 'activa'
  RETURNING id INTO v_placa_m14;

  -- Barra 2
  INSERT INTO public.placas_nfc (codigo_publico, codigo_pin, tipo_chip, categoria, estado)
  VALUES ('REST-002-BAR', '1234', 'NTAG213 Acrílico Anti-líquidos', 'restaurante', 'activa')
  ON CONFLICT (codigo_publico) DO UPDATE SET estado = 'activa'
  RETURNING id INTO v_placa_b2;

  -- Vincular a restaurant_mesas si la tabla existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'restaurant_mesas') THEN
    INSERT INTO public.restaurant_mesas (placa_id, user_id, nombre_local, numero_mesa, url_carta_digital, wifi_ssid, wifi_password)
    VALUES 
      (v_placa_m4, v_owner_id, 'Bistró Costanera', 'Mesa 4', 'https://findeme.cl/menu/bistro-costanera', 'Bistro_Clientes_VIP', 'BistroVip2026'),
      (v_placa_m8, v_owner_id, 'Bistró Costanera', 'Mesa 8 (Terraza)', 'https://findeme.cl/menu/bistro-costanera', 'Bistro_Clientes_VIP', 'BistroVip2026'),
      (v_placa_m14, v_owner_id, 'Bistró Costanera', 'Mesa 14', 'https://findeme.cl/menu/bistro-costanera', 'Bistro_Clientes_VIP', 'BistroVip2026'),
      (v_placa_b2, v_owner_id, 'Bistró Costanera', 'Mesa Barra 2', 'https://findeme.cl/menu/bistro-costanera', 'Bistro_Clientes_VIP', 'BistroVip2026')
    ON CONFLICT (placa_id) DO NOTHING;
  END IF;

  -- -------------------------------------------------------------------------
  -- 4. INSERTAR CLIENTES / COMENSALES (CRM INTELIGENTE CON ETIQUETAS IA)
  -- -------------------------------------------------------------------------
  
  -- Cliente 1: Rodrigo Valenzuela
  SELECT id INTO v_cust_1 FROM public.comensales WHERE restaurant_id = v_restaurant_id AND email = 'rodrigo.valenzuela@gmail.com' LIMIT 1;
  IF v_cust_1 IS NULL THEN
    INSERT INTO public.comensales (
      restaurant_id, nombre, telefono, email, nivel_socio, puntos, sellos, gasto_total_acumulado, boletas_validadas_count, wallet_platform, tags_ia, ultima_visita
    ) VALUES (
      v_restaurant_id,
      'Rodrigo Valenzuela',
      '+56 9 8451 9201',
      'rodrigo.valenzuela@gmail.com',
      'Oro VIP',
      450,
      4,
      342000,
      8,
      'Apple Wallet',
      ARRAY['Consume Coctelería', 'Amante de Pizzas', 'Cliente VIP Viernes', 'Ticket Alto'],
      NOW() - INTERVAL '45 minutes'
    ) RETURNING id INTO v_cust_1;
  ELSE
    UPDATE public.comensales SET
      nombre = 'Rodrigo Valenzuela',
      telefono = '+56 9 8451 9201',
      nivel_socio = 'Oro VIP',
      puntos = 450,
      sellos = 4,
      gasto_total_acumulado = 342000,
      boletas_validadas_count = 8,
      wallet_platform = 'Apple Wallet',
      tags_ia = ARRAY['Consume Coctelería', 'Amante de Pizzas', 'Cliente VIP Viernes', 'Ticket Alto'],
      ultima_visita = NOW() - INTERVAL '45 minutes'
    WHERE id = v_cust_1;
  END IF;

  -- Cliente 2: Carolina Henríquez
  SELECT id INTO v_cust_2 FROM public.comensales WHERE restaurant_id = v_restaurant_id AND email = 'carolina.h@outlook.com' LIMIT 1;
  IF v_cust_2 IS NULL THEN
    INSERT INTO public.comensales (
      restaurant_id, nombre, telefono, email, nivel_socio, puntos, sellos, gasto_total_acumulado, boletas_validadas_count, wallet_platform, tags_ia, ultima_visita
    ) VALUES (
      v_restaurant_id,
      'Carolina Henríquez',
      '+56 9 7122 3490',
      'carolina.h@outlook.com',
      'Black VIP',
      820,
      5,
      580000,
      14,
      'Apple Wallet',
      ARRAY['Consume Coctelería', 'Ticket Alto', 'Cena Pareja / Romántica'],
      NOW() - INTERVAL '1 day'
    ) RETURNING id INTO v_cust_2;
  ELSE
    UPDATE public.comensales SET
      nombre = 'Carolina Henríquez',
      telefono = '+56 9 7122 3490',
      nivel_socio = 'Black VIP',
      puntos = 820,
      sellos = 5,
      gasto_total_acumulado = 580000,
      boletas_validadas_count = 14,
      wallet_platform = 'Apple Wallet',
      tags_ia = ARRAY['Consume Coctelería', 'Ticket Alto', 'Cena Pareja / Romántica'],
      ultima_visita = NOW() - INTERVAL '1 day'
    WHERE id = v_cust_2;
  END IF;

  -- Cliente 3: Matías Silva & Familia
  SELECT id INTO v_cust_3 FROM public.comensales WHERE restaurant_id = v_restaurant_id AND email = 'matias.silva.cl@gmail.com' LIMIT 1;
  IF v_cust_3 IS NULL THEN
    INSERT INTO public.comensales (
      restaurant_id, nombre, telefono, email, nivel_socio, puntos, sellos, gasto_total_acumulado, boletas_validadas_count, wallet_platform, tags_ia, ultima_visita
    ) VALUES (
      v_restaurant_id,
      'Matías Silva & Familia',
      '+56 9 6554 1109',
      'matias.silva.cl@gmail.com',
      'Plata',
      210,
      2,
      198000,
      4,
      'Google Wallet',
      ARRAY['Perfil Familiar / Sin Alcohol', 'Menú Infantil', 'Cliente Domingo Almuerzo'],
      NOW() - INTERVAL '3 days'
    ) RETURNING id INTO v_cust_3;
  ELSE
    UPDATE public.comensales SET
      nombre = 'Matías Silva & Familia',
      telefono = '+56 9 6554 1109',
      nivel_socio = 'Plata',
      puntos = 210,
      sellos = 2,
      gasto_total_acumulado = 198000,
      boletas_validadas_count = 4,
      wallet_platform = 'Google Wallet',
      tags_ia = ARRAY['Perfil Familiar / Sin Alcohol', 'Menú Infantil', 'Cliente Domingo Almuerzo'],
      ultima_visita = NOW() - INTERVAL '3 days'
    WHERE id = v_cust_3;
  END IF;

  -- Cliente 4: Ignacio Morales
  SELECT id INTO v_cust_4 FROM public.comensales WHERE restaurant_id = v_restaurant_id AND email = 'ignacio.morales@empresa.cl' LIMIT 1;
  IF v_cust_4 IS NULL THEN
    INSERT INTO public.comensales (
      restaurant_id, nombre, telefono, email, nivel_socio, puntos, sellos, gasto_total_acumulado, boletas_validadas_count, wallet_platform, tags_ia, ultima_visita
    ) VALUES (
      v_restaurant_id,
      'Ignacio Morales',
      '+56 9 9234 5678',
      'ignacio.morales@empresa.cl',
      'Oro VIP',
      390,
      3,
      275000,
      6,
      'Google Wallet',
      ARRAY['Consume Coctelería', 'After Office', 'Amante de Hamburguesas'],
      NOW() - INTERVAL '5 days'
    ) RETURNING id INTO v_cust_4;
  ELSE
    UPDATE public.comensales SET
      nombre = 'Ignacio Morales',
      telefono = '+56 9 9234 5678',
      nivel_socio = 'Oro VIP',
      puntos = 390,
      sellos = 3,
      gasto_total_acumulado = 275000,
      boletas_validadas_count = 6,
      wallet_platform = 'Google Wallet',
      tags_ia = ARRAY['Consume Coctelería', 'After Office', 'Amante de Hamburguesas'],
      ultima_visita = NOW() - INTERVAL '5 days'
    WHERE id = v_cust_4;
  END IF;

  -- Cliente 5: Francisca Vial
  SELECT id INTO v_cust_5 FROM public.comensales WHERE restaurant_id = v_restaurant_id AND email = 'fran.vial@uandes.cl' LIMIT 1;
  IF v_cust_5 IS NULL THEN
    INSERT INTO public.comensales (
      restaurant_id, nombre, telefono, email, nivel_socio, puntos, sellos, gasto_total_acumulado, boletas_validadas_count, wallet_platform, tags_ia, ultima_visita
    ) VALUES (
      v_restaurant_id,
      'Francisca Vial',
      '+56 9 8871 0023',
      'fran.vial@uandes.cl',
      'Plata',
      150,
      1,
      96000,
      2,
      'Apple Wallet',
      ARRAY['Amante de Pizzas', 'Vegetariano / Plant Based'],
      NOW() - INTERVAL '8 days'
    ) RETURNING id INTO v_cust_5;
  ELSE
    UPDATE public.comensales SET
      nombre = 'Francisca Vial',
      telefono = '+56 9 8871 0023',
      nivel_socio = 'Plata',
      puntos = 150,
      sellos = 1,
      gasto_total_acumulado = 96000,
      boletas_validadas_count = 2,
      wallet_platform = 'Apple Wallet',
      tags_ia = ARRAY['Amante de Pizzas', 'Vegetariano / Plant Based'],
      ultima_visita = NOW() - INTERVAL '8 days'
    WHERE id = v_cust_5;
  END IF;

  -- Cliente 6: Sebastián Lagos
  SELECT id INTO v_cust_6 FROM public.comensales WHERE restaurant_id = v_restaurant_id AND email = 's.lagos@inversiones.cl' LIMIT 1;
  IF v_cust_6 IS NULL THEN
    INSERT INTO public.comensales (
      restaurant_id, nombre, telefono, email, nivel_socio, puntos, sellos, gasto_total_acumulado, boletas_validadas_count, wallet_platform, tags_ia, ultima_visita
    ) VALUES (
      v_restaurant_id,
      'Sebastián Lagos',
      '+56 9 7789 4432',
      's.lagos@inversiones.cl',
      'Black VIP',
      940,
      5,
      720000,
      18,
      'Apple Wallet',
      ARRAY['Ticket Alto', 'Consume Coctelería', 'Almuerzo Ejecutivo'],
      NOW() - INTERVAL '2 days'
    ) RETURNING id INTO v_cust_6;
  ELSE
    UPDATE public.comensales SET
      nombre = 'Sebastián Lagos',
      telefono = '+56 9 7789 4432',
      nivel_socio = 'Black VIP',
      puntos = 940,
      sellos = 5,
      gasto_total_acumulado = 720000,
      boletas_validadas_count = 18,
      wallet_platform = 'Apple Wallet',
      tags_ia = ARRAY['Ticket Alto', 'Consume Coctelería', 'Almuerzo Ejecutivo'],
      ultima_visita = NOW() - INTERVAL '2 days'
    WHERE id = v_cust_6;
  END IF;

  -- -------------------------------------------------------------------------
  -- 5. INSERTAR PASES DIGITALES EN WALLETS (APPLE / GOOGLE)
  -- -------------------------------------------------------------------------
  INSERT INTO public.tarjetas_vip_pases (restaurant_id, comensal_id, pass_serial_number, qr_salt_token, estado)
  VALUES
    (v_restaurant_id, v_cust_1, 'VIP-ROD-9824', '7F9B-2026', 'activa'),
    (v_restaurant_id, v_cust_2, 'VIP-CARO-1144', '3C2A-2026', 'activa'),
    (v_restaurant_id, v_cust_3, 'VIP-MAT-5591', '8D4E-2026', 'activa'),
    (v_restaurant_id, v_cust_4, 'VIP-IGN-3382', '5F1B-2026', 'activa'),
    (v_restaurant_id, v_cust_5, 'VIP-FRAN-7701', '9A2D-2026', 'activa'),
    (v_restaurant_id, v_cust_6, 'VIP-SEBA-4490', '1B7C-2026', 'activa')
  ON CONFLICT (pass_serial_number) DO NOTHING;

  -- -------------------------------------------------------------------------
  -- 6. INSERTAR BOLETAS ANALIZADAS CON IA & HASHEADO SHA256 ANTIFRAUDE
  -- -------------------------------------------------------------------------
  
  -- Boleta 1 (Rodrigo)
  INSERT INTO public.boletas_restaurante (
    restaurant_id, comensal_id, cliente_nombre, mesa, total_monto, items_detectados, tags_generados, hash_antifraude, confianza_ocr, estado_ia, sello_otorgado, imagen_storage_url
  ) VALUES (
    v_restaurant_id,
    v_cust_1,
    'Rodrigo Valenzuela',
    'Mesa 14',
    68500,
    '[
      {"cant": 2, "nombre": "Pizza Napolitana Trufada", "cat": "Pizzas", "precio": 32000},
      {"cant": 3, "nombre": "Negroni de Autor Premium", "cat": "Coctelería", "precio": 28500},
      {"cant": 1, "nombre": "Tiramisú Tradicional", "cat": "Postres", "precio": 8000}
    ]'::jsonb,
    ARRAY['Consume Coctelería', 'Amante de Pizzas', 'Ticket Alto'],
    'SHA256:7f9b8c2d1e0a4f569a1b2c3d4e5f6a7b',
    98.4,
    'Aprobada por IA',
    true,
    '/images/findme-restaurant-loyalty.jpg'
  )
  ON CONFLICT (restaurant_id, hash_antifraude) DO NOTHING;

  -- Boleta 2 (Matías Familia)
  INSERT INTO public.boletas_restaurante (
    restaurant_id, comensal_id, cliente_nombre, mesa, total_monto, items_detectados, tags_generados, hash_antifraude, confianza_ocr, estado_ia, sello_otorgado, imagen_storage_url
  ) VALUES (
    v_restaurant_id,
    v_cust_3,
    'Matías Silva',
    'Mesa 6 (Terraza)',
    58000,
    '[
      {"cant": 2, "nombre": "Menú Infantil Mini Burgers", "cat": "Infantil", "precio": 18000},
      {"cant": 2, "nombre": "Jugos Naturales Mango", "cat": "Sin Alcohol", "precio": 8000},
      {"cant": 2, "nombre": "Ravioles Ricotta & Espinaca", "cat": "Pastas", "precio": 28000},
      {"cant": 1, "nombre": "Agua Puyehue con gas", "cat": "Sin Alcohol", "precio": 4000}
    ]'::jsonb,
    ARRAY['Perfil Familiar / Sin Alcohol', 'Menú Infantil'],
    'SHA256:3a1b4c9e8d7f2a019b8c7d6e5f4a3b2c',
    99.1,
    'Aprobada por IA',
    true,
    '/images/findme-restaurant-loyalty.jpg'
  )
  ON CONFLICT (restaurant_id, hash_antifraude) DO NOTHING;

  -- Boleta 3 (Ignacio)
  INSERT INTO public.boletas_restaurante (
    restaurant_id, comensal_id, cliente_nombre, mesa, total_monto, items_detectados, tags_generados, hash_antifraude, confianza_ocr, estado_ia, sello_otorgado, imagen_storage_url
  ) VALUES (
    v_restaurant_id,
    v_cust_4,
    'Ignacio Morales',
    'Mesa Barra 2',
    47500,
    '[
      {"cant": 2, "nombre": "Hamburguesa Doble Smash", "cat": "Hamburguesas", "precio": 21000},
      {"cant": 4, "nombre": "Cerveza Kross IPA 500cc", "cat": "Coctelería/Cerveza", "precio": 22000},
      {"cant": 1, "nombre": "Papas Rústicas", "cat": "Snacks", "precio": 4500}
    ]'::jsonb,
    ARRAY['Consume Coctelería', 'After Office'],
    'SHA256:9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f',
    96.8,
    'Aprobada por IA',
    true,
    '/images/findme-restaurant-loyalty.jpg'
  )
  ON CONFLICT (restaurant_id, hash_antifraude) DO NOTHING;

  -- Boleta 4 (Carolina)
  INSERT INTO public.boletas_restaurante (
    restaurant_id, comensal_id, cliente_nombre, mesa, total_monto, items_detectados, tags_generados, hash_antifraude, confianza_ocr, estado_ia, sello_otorgado, imagen_storage_url
  ) VALUES (
    v_restaurant_id,
    v_cust_2,
    'Carolina Henríquez',
    'Mesa 8',
    89000,
    '[
      {"cant": 1, "nombre": "Filete al Vino Tinto", "cat": "Carnes", "precio": 32000},
      {"cant": 1, "nombre": "Risotto Setas", "cat": "Pastas", "precio": 24000},
      {"cant": 2, "nombre": "Aperol Spritz", "cat": "Coctelería", "precio": 15000},
      {"cant": 1, "nombre": "Botella Cabernet Sauvignon", "cat": "Alcohol", "precio": 18000}
    ]'::jsonb,
    ARRAY['Consume Coctelería', 'Ticket Alto', 'Cena Pareja / Romántica'],
    'SHA256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    98.9,
    'Aprobada por IA',
    true,
    '/images/findme-restaurant-loyalty.jpg'
  )
  ON CONFLICT (restaurant_id, hash_antifraude) DO NOTHING;

  -- -------------------------------------------------------------------------
  -- 7. INSERTAR CAMPAÑA PUSH HISTÓRICA A PANTALLA DE BLOQUEO
  -- -------------------------------------------------------------------------
  IF NOT EXISTS (SELECT 1 FROM public.campanas_push WHERE restaurant_id = v_restaurant_id AND titulo LIKE '%2x1 en Cócteles%') THEN
    INSERT INTO public.campanas_push (
      restaurant_id, titulo, cuerpo_mensaje, segmento_tags, destinatarios_estimados, entregados_apple, entregados_google, enviado_por
    ) VALUES (
      v_restaurant_id,
      '🍸 2x1 en Cócteles de Autor este Jueves',
      'Muestra tu tarjeta VIP en la barra después de las 20:00 hrs y disfruta de la nueva carta de autor.',
      ARRAY['Consume Coctelería'],
      340,
      211,
      129,
      v_owner_id
    );
  END IF;

  -- -------------------------------------------------------------------------
  -- 8. INSERTAR PIN DINÁMICO DE MESERO VIGENTE
  -- -------------------------------------------------------------------------
  DELETE FROM public.waiter_pins WHERE restaurant_id = v_restaurant_id;
  INSERT INTO public.waiter_pins (
    restaurant_id, pin_code, expires_at
  ) VALUES (
    v_restaurant_id,
    '7842',
    NOW() + INTERVAL '2 hours'
  );

  RAISE NOTICE 'Seed cargado exitosamente para el restaurante: Bistró & Cocktails Costanera (ID: %)', v_restaurant_id;

END $$;
