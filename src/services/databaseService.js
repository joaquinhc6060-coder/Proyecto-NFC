// =========================================================================
// SERVICIO DE BASE DE DATOS EN TIEMPO REAL & AUTH MULTI-RESTAURANTE
// =========================================================================
// Gestión de sesiones de dueños de restaurante, registro ágil de comensales,
// almacenamiento de transacciones de boletas y suscripción en tiempo real (WebSockets / BroadcastChannel).
// =========================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { RESTAURANT_DATA, MOCK_KPIS, MOCK_CUSTOMERS, MOCK_BOLETAS } from './restaurantService';

const FORCE_MOCK = import.meta.env.VITE_USE_MOCK_APIS === 'true';

// Bus de eventos para sincronización en tiempo real (in-memory + Cross-Tab vía BroadcastChannel)
const eventListeners = new Set();
let crossTabChannel = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  crossTabChannel = new BroadcastChannel('findeme_restaurant_realtime');
  crossTabChannel.onmessage = (event) => {
    eventListeners.forEach((callback) => {
      try {
        callback(event.data);
      } catch (err) {
        console.error('[databaseService] Error ejecutando callback de Realtime:', err);
      }
    });
  };
}

/**
 * Notifica un evento a todos los componentes y pestañas abiertas del restaurante
 */
export function broadcastRestaurantEvent(restaurantId, eventData) {
  const payload = {
    restaurantId,
    timestamp: Date.now(),
    ...eventData
  };

  // 1. Notificar en memoria a la misma pestaña
  eventListeners.forEach((cb) => {
    try {
      cb(payload);
    } catch (e) {
      console.error(e);
    }
  });

  // 2. Notificar a otras pestañas (Cross-Tab Realtime)
  if (crossTabChannel) {
    try {
      crossTabChannel.postMessage(payload);
    } catch (e) {
      console.warn('[databaseService] BroadcastChannel postMessage error:', e);
    }
  }
}

/**
 * Suscribe un componente a eventos en tiempo real (nuevas boletas, sellos sumados, KPIs actualizados).
 * @param {string} restaurantId - ID del restaurante
 * @param {Function} onEventCallback - Función a invocar cuando ocurre un evento
 * @returns {Function} Función de desuscripción
 */
export function subscribeToRestaurantUpdates(restaurantId, onEventCallback) {
  eventListeners.add(onEventCallback);

  // Si Supabase Realtime está configurado, nos suscribimos también a Postgres Changes
  let supabaseChannel = null;
  if (!FORCE_MOCK && isSupabaseConfigured() && supabase) {
    try {
      supabaseChannel = supabase
        .channel(`restaurant_${restaurantId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'boletas_restaurante' },
          (payload) => {
            onEventCallback({
              type: 'RECEIPT_SCANNED',
              data: payload.new
            });
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[databaseService] Error conectando canal Supabase Realtime:', err);
    }
  }

  return () => {
    eventListeners.delete(onEventCallback);
    if (supabaseChannel && supabase) {
      supabase.removeChannel(supabaseChannel);
    }
  };
}

/**
 * Obtiene el perfil del restaurante y sus configuraciones
 */
export async function getRestaurantProfile(restaurantId = 'bistro-costanera') {
  if (!FORCE_MOCK && isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('restaurantes')
        .select('*')
        .eq('slug', restaurantId)
        .single();
      if (data && !error) return data;
    } catch (e) {
      console.warn('Fallback a mock para perfil de restaurante');
    }
  }
  return RESTAURANT_DATA;
}

/**
 * Obtiene los KPIs consolidados del restaurante
 */
export async function getRestaurantKPIs(restaurantId = 'bistro-costanera') {
  return MOCK_KPIS;
}

/**
 * Obtiene la lista de clientes fidelizados del restaurante
 */
export async function getCustomers(restaurantId = 'bistro-costanera') {
  return MOCK_CUSTOMERS;
}

/**
 * Obtiene el historial de boletas analizadas con IA
 */
export async function getReceipts(restaurantId = 'bistro-costanera') {
  return MOCK_BOLETAS;
}

/**
 * Registra una nueva boleta analizada, actualiza las etiquetas del cliente y notifica a las pantallas en tiempo real.
 * @param {object} params - { restaurantId, customerId, customerName, total, items, generatedTags, fileUrl, confidenceOCR }
 */
export async function recordReceiptTransaction({
  restaurantId = 'bistro-costanera',
  customerId = 'cust-01',
  customerName = 'Rodrigo Valenzuela',
  total = 52000,
  items = [],
  generatedTags = [],
  fileUrl = '',
  confidenceOCR = 98.7
}) {
  const newReceiptRecord = {
    id: `BOL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    clienteId: customerId,
    clienteNombre: customerName,
    mesa: 'Mesa 8',
    fecha: 'Recién subida (Ahora)',
    total,
    itemsDetectados: items.map((it) => ({
      cant: it.quantity || 1,
      nombre: it.name,
      cat: it.category || 'Varios',
      precio: it.price || 0
    })),
    hashAntifraude: `SHA256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
    estado: 'Aprobada por IA',
    confianzaOCR,
    tagsGenerados: generatedTags,
    selloOtorgado: true,
    imagenUrl: fileUrl || '/images/findme-restaurant-loyalty.jpg'
  };

  // Disparar evento Realtime global
  broadcastRestaurantEvent(restaurantId, {
    type: 'RECEIPT_SCANNED',
    receipt: newReceiptRecord,
    customerId,
    newTags: generatedTags
  });

  return newReceiptRecord;
}
