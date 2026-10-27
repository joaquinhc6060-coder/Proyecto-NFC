// =========================================================================
// SERVICIO DE CANAL DE RESPALDO: META WHATSAPP CLOUD API & RESEND EMAIL
// =========================================================================
// Para comensales que aún no agregan su pase a Apple Wallet o Google Wallet,
// se envía el enlace de activación o promociones directamente por WhatsApp o Correo.
// =========================================================================

const WHATSAPP_TOKEN = import.meta.env.VITE_WHATSAPP_API_TOKEN || '';
const WHATSAPP_PHONE_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '';
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || '';
const RESEND_FROM_EMAIL = import.meta.env.VITE_RESEND_FROM_EMAIL || 'vip@vigio.cl';
const FORCE_MOCK = import.meta.env.VITE_USE_MOCK_APIS === 'true';

export const isWhatsAppConfigured = () => {
  return !FORCE_MOCK && Boolean(WHATSAPP_TOKEN && WHATSAPP_PHONE_ID && !WHATSAPP_TOKEN.includes('tu-whatsapp'));
};

export const isResendConfigured = () => {
  return !FORCE_MOCK && Boolean(RESEND_API_KEY && !RESEND_API_KEY.includes('tu-api-key'));
};

/**
 * Envía una notificación por WhatsApp o Correo a clientes que no usan Wallet.
 * @param {object} params
 * @param {object} params.customer - { id, nombre, telefono, email, walletPlatform }
 * @param {string} params.channel - 'whatsapp' | 'email' | 'auto'
 * @param {string} params.messageTitle - Título de la notificación
 * @param {string} params.messageBody - Cuerpo del mensaje
 * @param {string} params.passUrl - Enlace a la tarjeta digital
 * @returns {Promise<object>} Reporte de despacho
 */
export async function sendFallbackNotification({
  customer,
  channel = 'auto',
  messageTitle = 'Tu tarjeta VIP Vigio',
  messageBody = 'Accede a tus sellos y beneficios exclusivos.',
  passUrl = 'https://vigio.cl/restaurante/mi-tarjeta'
}) {
  const chosenChannel = channel === 'auto'
    ? (customer.telefono ? 'whatsapp' : 'email')
    : channel;

  // 1. Canal WhatsApp Cloud API
  if (chosenChannel === 'whatsapp') {
    if (isWhatsAppConfigured()) {
      try {
        const cleanPhone = (customer.telefono || '').replace(/[^0-9]/g, '');
        const response = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'text',
            text: {
              body: `*${messageTitle}*\n\nHola ${customer.nombre},\n${messageBody}\n\n👉 Accede a tu tarjeta aquí: ${passUrl}`
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            channel: 'WhatsApp Cloud API',
            recipient: customer.telefono,
            messageId: data?.messages?.[0]?.id,
            isMock: false
          };
        }
      } catch (err) {
        console.warn('[fallbackNotificationService] Error enviando WhatsApp real:', err);
      }
    }

    // Fallback Mock para WhatsApp
    await new Promise((r) => setTimeout(r, 600));
    return {
      success: true,
      channel: 'WhatsApp Cloud API (Simulado)',
      recipient: customer.telefono || '+56 9 8451 9201',
      previewMessage: `[WhatsApp] *${messageTitle}* - ${messageBody}`,
      sentAt: new Date().toLocaleTimeString('es-CL'),
      isMock: true
    };
  }

  // 2. Canal Email vía Resend
  if (chosenChannel === 'email') {
    if (isResendConfigured()) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: RESEND_FROM_EMAIL,
            to: customer.email,
            subject: messageTitle,
            html: `
              <div style="font-family: sans-serif; background: #0A0A0B; color: #FFF; padding: 24px; border-radius: 12px;">
                <h2 style="color: #FF5A26;">${messageTitle}</h2>
                <p>Hola <strong>${customer.nombre}</strong>,</p>
                <p style="color: #9CA3AF;">${messageBody}</p>
                <a href="${passUrl}" style="display: inline-block; background: #FF5A26; color: #FFF; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold; margin-top: 16px;">
                  Abrir mi Tarjeta VIP
                </a>
              </div>
            `
          })
        });

        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            channel: 'Resend Email',
            recipient: customer.email,
            id: data.id,
            isMock: false
          };
        }
      } catch (err) {
        console.warn('[fallbackNotificationService] Error enviando correo Resend real:', err);
      }
    }

    // Fallback Mock para Correo
    await new Promise((r) => setTimeout(r, 600));
    return {
      success: true,
      channel: 'Resend Email (Simulado)',
      recipient: customer.email || 'cliente@ejemplo.com',
      previewSubject: messageTitle,
      sentAt: new Date().toLocaleTimeString('es-CL'),
      isMock: true
    };
  }

  return { success: false, error: 'Canal no soportado' };
}
