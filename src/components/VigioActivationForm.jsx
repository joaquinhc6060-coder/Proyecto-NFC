import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { PHOTO_BUCKET, deleteVoiceAudio, preparePhoto, uploadVoiceAudio } from '../lib/activationUtils';
import { useAuth } from '../contexts/AuthContext';
import VoiceAudioField from './VoiceAudioField';

const input = 'w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white';
const names = { mascota: 'Mascota', persona: 'Persona', objeto: 'Objeto o equipaje' };
const normal = value => {
  const digits = String(value || '').replace(/\D/g, '');
  const local = digits.startsWith('56') ? digits.slice(2) : digits;
  return /^9\d{8}$/.test(local) ? '+56' + local : '';
};

export default function VigioActivationForm({ token }) {
  const nav = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [tipo, setTipo] = useState('');
  const [foto, setFoto] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [d, setD] = useState({ nombre:'', raza:'', color:'', descripcion:'', temperamento:'', ubicacion:'', alergias:'', grupo_sanguineo:'', condiciones:'', instrucciones:'', identificador:'', mensaje_retorno:'', ciudad_origen:'', contacto_principal_nombre:'', telefono_principal:'', contacto_alternativo_nombre:'', telefono_alternativo:'', comentario:'' });
  const [audioPreview, setAudioPreview] = useState('');
  useEffect(() => {
    if (!audioFile) { setAudioPreview(''); return undefined; }
    const url = URL.createObjectURL(audioFile);
    setAudioPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [audioFile]);

  const change = event => setD(previous => ({ ...previous, [event.target.name]: event.target.value }));
  const field = (key, label) => <div><label className="mb-2 block text-xs text-zinc-400">{label}</label><input name={key} value={d[key]} onChange={change} className={input} /></div>;
  const choosePhoto = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try { setError(''); setFoto(await preparePhoto(file)); } catch (cause) { setError(cause.message); } finally { event.target.value = ''; }
  };
  const save = async () => {
    setBusy(true); setError('');
    let uploadedAudioUrl = '';
    try {
      const pin = sessionStorage.getItem('vigio_pending_pin_' + token) || '';
      let foto_url = '';
      if (foto) {
        const blob = await (await fetch(foto)).blob();
        const path = user.id + '/' + crypto.randomUUID() + '.jpg';
        const result = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: 'image/jpeg' });
        if (result.error) throw result.error;
        foto_url = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
      }
      const audio_url = audioFile ? await uploadVoiceAudio(supabase, user.id, audioFile) : '';
      uploadedAudioUrl = audio_url;
      const payload = Object.fromEntries(Object.entries({ ...d, tipo, foto_url, audio_url, telefono_principal: normal(d.telefono_principal), telefono_alternativo: normal(d.telefono_alternativo) }).filter(([, value]) => value));
      const result = await supabase.rpc('vigio_activar_placa', { p_token: token, p_pin: pin, p_perfil: payload });
      if (result.error || !result.data?.ok) throw new Error(result.error?.message || result.data?.error || 'No se pudo activar');
      nav('/panel');
    } catch (cause) {
      if (uploadedAudioUrl) {
        try { await deleteVoiceAudio(supabase, uploadedAudioUrl, user.id); } catch { /* La activación falló; no ocultamos el error original. */ }
      }
      setError(cause.message);
    } finally { setBusy(false); }
  };
  const entries = Object.entries(d).filter(([, value]) => value);

  return <div className="min-h-screen bg-[#07080a] p-4 py-12 text-white"><div className="mx-auto max-w-lg space-y-6"><div className="text-center"><h1 className="text-2xl font-black">Activa tu <span className="text-orange-brand">Vigio</span></h1><p className="text-sm text-zinc-400">Paso {step} de 3</p></div><div className="rounded-[32px] border border-white/10 bg-[#121316] p-6">
    {error && <p className="mb-4 rounded-xl bg-red-500/10 p-3 text-red-300">{error}</p>}
    {step === 1 && <div className="space-y-3"><h2 className="text-xl font-bold">¿Qué deseas proteger?</h2>{Object.entries(names).map(([key, label]) => <button key={key} onClick={() => { setTipo(key); setStep(2); }} className="block w-full rounded-2xl border border-white/10 p-5 text-left text-lg font-bold">{key === 'mascota' ? '🐾' : key === 'persona' ? '🧍' : '🧳'} {label}</button>)}</div>}
    {step === 2 && <form onSubmit={event => { event.preventDefault(); setStep(3); }} className="space-y-4"><div className="flex justify-between"><h2 className="text-xl font-bold">Datos de {names[tipo]}</h2><button type="button" onClick={() => setStep(1)} className="text-orange-brand">Cambiar</button></div>
      {tipo === 'mascota' && <>{field('nombre','Nombre de la mascota')}{field('raza','Raza')}{field('color','Color')}{field('descripcion','Descripción')}{field('temperamento','Temperamento')}{field('ubicacion','Ubicación habitual')}{field('alergias','Necesidades médicas o alergias')}</>}
      {tipo === 'persona' && <>{field('nombre','Nombre completo')}{field('grupo_sanguineo','Grupo sanguíneo')}{field('alergias','Alergias críticas')}{field('condiciones','Condiciones médicas')}{field('instrucciones','Instrucciones especiales')}</>}
      {tipo === 'objeto' && <>{field('identificador','Identificador del objeto')}{field('mensaje_retorno','Mensaje de retorno')}{field('ciudad_origen','Dirección o ciudad de origen')}</>}
      <h3 className="pt-3 font-bold">Contactos</h3>{field('contacto_principal_nombre','Contacto principal: nombre')}{field('telefono_principal','Contacto principal: teléfono')}{field('contacto_alternativo_nombre','Contacto alternativo (opcional): nombre')}{field('telefono_alternativo','Contacto alternativo (opcional): teléfono')}
      <div><label className="mb-2 block text-xs text-zinc-400">Foto (opcional)</label><input id="foto" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={choosePhoto}/><label htmlFor="foto" className="inline-block cursor-pointer rounded-xl bg-white/10 px-4 py-3 font-bold">{foto ? 'Cambiar foto' : 'Elegir archivo'}</label>{foto && <div className="mt-3 flex items-center gap-4"><img src={foto} alt="Vista previa" className="h-24 w-24 rounded-xl object-cover"/><button type="button" onClick={() => setFoto('')} className="text-red-300 underline">Eliminar foto</button></div>}</div>
      <VoiceAudioField currentUrl="" onSelected={setAudioFile} onRemove={() => setAudioFile(null)} />
      <div><label className="mb-2 block text-xs text-zinc-400">Comentario</label><textarea name="comentario" value={d.comentario} onChange={change} className={input + ' min-h-24'} maxLength={500}/></div><button className="w-full rounded-xl bg-orange-brand p-4 font-bold">Resumen →</button>
    </form>}
    {step === 3 && <div className="space-y-5"><h2 className="text-xl font-bold">Así se verá tu perfil público</h2><div className="max-h-[60vh] overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-5">{foto && <img src={foto} alt="Vista previa" className="mb-4 h-40 w-full rounded-xl object-cover"/>}<h3 className="text-xl font-bold">{d.nombre || d.identificador || names[tipo]}</h3>{audioPreview && <audio controls src={audioPreview} className="mt-4 w-full" />}{entries.map(([key, value]) => <div key={key} className="mt-3 border-b border-white/10 pb-2"><p className="text-xs text-zinc-500">{key.replaceAll('_',' ')}</p><p>{value}</p></div>)}</div><div className="flex gap-3"><button onClick={() => setStep(2)} className="rounded-xl border border-white/15 px-4 py-3">Volver a editar</button><button onClick={() => setConfirm(true)} className="flex-1 rounded-xl bg-orange-brand py-3 font-bold">Confirmar y activar placa</button></div>{confirm && <div className="rounded-xl bg-black/30 p-4"><p>¿Confirmas los datos?</p><button onClick={save} disabled={busy} className="mt-3 rounded-xl bg-orange-brand px-4 py-3 font-bold">{busy ? 'Activando…' : 'Confirmar'}</button></div>}</div>}
  </div></div></div>;
}
