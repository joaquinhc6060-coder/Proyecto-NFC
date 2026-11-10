import React, { useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { saveOwnedProfile } from '../lib/accountData';
import { PHOTO_BUCKET, preparePhoto, uploadVoiceAudio, deleteVoiceAudio } from '../lib/activationUtils';
import { useAuth } from '../contexts/AuthContext';
import VoiceAudioField from './VoiceAudioField';
export const profileFields = [['nombre','Nombre',100],['raza_o_modelo','Raza / tipo',100],['nombre_contacto','Nombre del contacto',100],['telefono_contacto','Teléfono',20],['whatsapp_contacto','WhatsApp con código de país',20],['ciudad','Ciudad / comuna',100],['alergias','Alergias',3000],['cuidados_especiales','Cuidados especiales',3000],['mensaje_auxilio','Mensaje de emergencia',3000]];
export default function OwnedProfileEditor({ product, onSaved, onCancel }) {
  const { user } = useAuth();
  const [form,setForm] = useState({...product.perfil,estado_alerta:product.perfil.estado_alerta || 'safe'});
  const [photo,setPhoto] = useState('');
  const [audioFile,setAudioFile] = useState(null);
  const [removeAudio,setRemoveAudio] = useState(false);
  const [preparing,setPreparing] = useState(false);
  const [saving,setSaving] = useState(false);const [confirming,setConfirming]=useState(false);
  const [error,setError] = useState('');
  const lock = useRef(false);
  const choosePhoto = async e => {
    const file=e.target.files?.[0]; if(!file)return;
    setPreparing(true); setError('');
    try {setPhoto(await preparePhoto(file));} catch(err){setError(err.message);}
    finally {setPreparing(false);e.target.value='';}
  };
  const save = async e => {
    e.preventDefault(); if(lock.current||preparing)return;
    if(!confirming){setConfirming(true);return;}
    lock.current=true;setSaving(true);setError('');
    let uploadedAudioUrl = '';
    try {
      const update={...form};
      if(photo){
        const path=user.id+'/'+crypto.randomUUID()+'.jpg';
        const blob=await(await fetch(photo)).blob();
        const {error}=await supabase.storage.from(PHOTO_BUCKET).upload(path,blob,{contentType:'image/jpeg'});
        if(error)throw new Error('No se pudo guardar la foto.');
        update.foto_url=supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
      }
      const previousAudio = form.audio_url || form.mensaje_voz_url || '';
      if(audioFile) {
        update.audio_url = await uploadVoiceAudio(supabase, user.id, audioFile);
        uploadedAudioUrl = update.audio_url;
      }
      if(removeAudio) update.audio_url = '';
      await saveOwnedProfile(supabase,product.id,update);
      if((audioFile || removeAudio) && previousAudio) await deleteVoiceAudio(supabase, previousAudio, user.id);
      await onSaved();
    } catch(err){
      if (uploadedAudioUrl) {
        try { await deleteVoiceAudio(supabase, uploadedAudioUrl, user.id); } catch { /* Conserva el error de guardado original. */ }
      }
      setError(err.message);
    }
    finally {lock.current=false;setSaving(false);}
  };
  return <form onSubmit={save} className="space-y-4">
    {error&&<p role="alert" className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2">{profileFields.map(([key,label,maxLength])=><div key={key} className={maxLength>100?'sm:col-span-2':''}>
      <label htmlFor={'profile-'+key} className="mb-2 block text-xs text-zinc-400">{label}</label>
      <input id={'profile-'+key} value={form[key]||''} onChange={e=>setForm(prev=>({...prev,[key]:e.target.value}))} maxLength={maxLength} required={['nombre','nombre_contacto','telefono_contacto'].includes(key)} disabled={saving} className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm" />
    </div>)}</div>
    <div><label htmlFor="profile-alert" className="mb-2 block text-xs text-zinc-400">Estado de alerta</label><select id="profile-alert" value={form.estado_alerta} onChange={e=>setForm(prev=>({...prev,estado_alerta:e.target.value}))} disabled={saving} className="w-full rounded-xl border border-white/10 bg-black p-3 text-sm"><option value="safe">A salvo</option><option value="lost">Extravío / necesita ayuda</option></select></div>
    <div><label htmlFor="profile-photo" className="mb-2 block text-xs text-zinc-400">Cambiar foto</label><input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} disabled={saving||preparing} className="w-full text-xs" />{preparing&&<p role="status" className="text-xs text-zinc-400">Preparando foto…</p>}{photo&&<img src={photo} alt="Nueva foto" className="mt-3 h-28 w-28 rounded-2xl object-cover" />}</div>
    <VoiceAudioField id={'profile-audio-'+product.id} currentUrl={removeAudio ? '' : (form.audio_url || form.mensaje_voz_url || '')} onSelected={file => { setAudioFile(file); setRemoveAudio(false); }} onRemove={() => { setAudioFile(null); setRemoveAudio(true); }} disabled={saving} />
    {confirming&&<div role="dialog" aria-modal="true" className="rounded-2xl border border-white/10 bg-black/30 p-4"><p className="text-sm">¿Confirmas los cambios en este perfil?</p><div className="mt-3 flex gap-3"><button type="button" onClick={()=>save({preventDefault(){}})} disabled={saving||preparing} className="rounded-xl bg-orange-brand px-4 py-2 text-sm font-bold">{saving?'Guardando…':'Confirmar'}</button><button type="button" onClick={()=>setConfirming(false)} disabled={saving} className="rounded-xl border border-white/15 px-4 py-2 text-sm">Cancelar</button></div></div>}
    <div className="flex gap-3"><button disabled={saving||preparing} className="rounded-xl bg-orange-brand px-5 py-3 font-bold disabled:opacity-50">Guardar cambios</button><button type="button" onClick={onCancel} disabled={saving||preparing} className="rounded-xl border border-white/15 px-5 py-3">Cancelar</button></div>
  </form>;
}
