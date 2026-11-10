export const PHOTO_BUCKET = 'vigio-mascotas';
export const AUDIO_BUCKET = 'vigio-audios';
export const MAX_AUDIO_BYTES = 1024 * 1024;
export const MAX_AUDIO_SECONDS = 30;
export const DRAFT_TTL = 30 * 60 * 1000;
export const normalizeEmail = email => String(email || '').trim().toLowerCase();
export function validateEmailPair(email, confirmation) {
  const clean = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return 'Ingresa un correo electrónico válido.';
  if (clean !== normalizeEmail(confirmation)) return 'Los correos electrónicos deben ser iguales.';
  return '';
}
export function validatePhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Elige una foto JPG, PNG o WEBP.';
  if (file.size > 10 * 1024 * 1024) return 'La foto debe pesar menos de 10 MB.';
  return '';
}
export function validateAudio(file) {
  if (!file) return 'Elige un archivo de audio.';
  const type = String(file.type || '').toLowerCase().split(';')[0];
  if (!['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg'].includes(type)) return 'Elige un audio WEBM, OGG, M4A o MP3.';
  if (file.size > MAX_AUDIO_BYTES) return 'El audio debe pesar menos de 1 MB.';
  return '';
}
export function audioExtension(file) {
  const type = String(file?.type || '').toLowerCase().split(';')[0];
  if (type === 'audio/ogg') return 'ogg';
  if (type === 'audio/mp4') return 'm4a';
  if (type === 'audio/mpeg') return 'mp3';
  return 'webm';
}
export async function uploadVoiceAudio(client, userId, file) {
  const error = validateAudio(file);
  if (error) throw new Error(error);
  const path = `${userId}/audio-${crypto.randomUUID()}.${audioExtension(file)}`;
  const result = await client.storage.from(AUDIO_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (result.error) throw new Error('No se pudo guardar el audio. Intenta nuevamente.');
  return client.storage.from(AUDIO_BUCKET).getPublicUrl(path).data.publicUrl;
}
export function voicePathFromUrl(url) {
  try {
    const marker = `/storage/v1/object/public/${AUDIO_BUCKET}/`;
    const index = String(url || '').indexOf(marker);
    return index >= 0 ? decodeURIComponent(String(url).slice(index + marker.length)) : '';
  } catch { return ''; }
}
export async function deleteVoiceAudio(client, url, userId) {
  const path = voicePathFromUrl(url);
  if (!path || !path.startsWith(`${userId}/`)) return;
  const { error } = await client.storage.from(AUDIO_BUCKET).remove([path]);
  if (error) throw new Error('No se pudo eliminar el audio anterior.');
}
const fields = ['nombre', 'categoria', 'raza_o_modelo', 'foto_url', 'mensaje_auxilio', 'alergias', 'cuidados_especiales', 'edad', 'comentarios_adicionales', 'tipo_sanguineo', 'enfermedades_condicion', 'nacionalidad', 'destino', 'nombre_contacto', 'telefono_contacto', 'whatsapp_contacto', 'ciudad', 'email', 'emailConfirm'];
export function activationDraft({ formData, pin, photo, step }, now = Date.now()) {
  return { expires: now + DRAFT_TTL, pin, photo, step,
    formData: Object.fromEntries(fields.map(key => [key, String(formData[key] || '').slice(0, 10000)])) };
}
export function parseActivationDraft(value, now = Date.now()) {
  try {
    const data = JSON.parse(value);
    if (!data || !Number.isFinite(data.expires) || data.expires <= now || data.expires > now + DRAFT_TTL || !/^[0-9]{6}$/.test(data.pin) || ![1, 2].includes(data.step)) return null;
    if (data.photo && (!/^data:image\/jpeg;base64,/.test(data.photo) || data.photo.length > 1500000)) return null;
    return activationDraft({ ...data, formData: data.formData || {} }, data.expires - DRAFT_TTL);
  } catch { return null; }
}
export async function preparePhoto(file) {
  const error = validatePhoto(file);
  if (error) throw new Error(error);
  const url = URL.createObjectURL(file);
  try {
    const picture = await new Promise((resolve, reject) => {
      const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error('No se pudo leer la foto. Elige otra imagen.')); img.src = url;
    });
    const scale = Math.min(1, 1200 / Math.max(picture.naturalWidth, picture.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(picture.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(picture.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(picture, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('image/jpeg', 0.78);
    if (data.length > 1500000) throw new Error('Elige una foto más pequeña.');
    return data;
  } finally { URL.revokeObjectURL(url); }
}
