export async function adminApi(action, payload = {}) {
  const response = await fetch('/api/vigio-admin', {
    method: 'POST', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-Vigio-Request': 'admin' },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await response.json().catch(() => ({ error: 'El servidor del panel no está disponible. Usa npm run dev o el despliegue Vercel.' }));
  if (!response.ok) throw Object.assign(new Error(data.error || 'No se pudo completar la solicitud.'), { status: response.status });
  return data;
}
