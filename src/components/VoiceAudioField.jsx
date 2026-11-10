import React, { useEffect, useRef, useState } from 'react';
import { MAX_AUDIO_SECONDS, validateAudio } from '../lib/activationUtils';

export default function VoiceAudioField({ id = 'voice-audio', currentUrl = '', onSelected, onRemove, disabled = false }) {
  const recorder = useRef(null);
  const stream = useRef(null);
  const timer = useRef(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [preview, setPreview] = useState(currentUrl);
  const [error, setError] = useState('');

  useEffect(() => { if (!recording) setPreview(currentUrl); }, [currentUrl, recording]);
  useEffect(() => () => {
    clearInterval(timer.current);
    stream.current?.getTracks().forEach(track => track.stop());
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
  }, [preview]);

  const setFilePreview = file => {
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  const stop = () => recorder.current?.state === 'recording' && recorder.current.stop();
  const choose = event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const message = validateAudio(file);
    if (message) { setError(message); return; }
    setError(''); setFilePreview(file); onSelected(file);
  };
  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('Tu navegador no permite grabar. Puedes subir un archivo de audio.'); return;
    }
    try {
      setError('');
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      const chunks = [];
      const active = new MediaRecorder(media, { mimeType, audioBitsPerSecond: 32000 });
      recorder.current = active;
      active.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      active.onstop = () => {
        clearInterval(timer.current); setRecording(false); media.getTracks().forEach(track => track.stop());
        const file = new File([new Blob(chunks, { type: active.mimeType || 'audio/webm' })], 'mensaje-de-voz.webm', { type: active.mimeType || 'audio/webm' });
        const message = validateAudio(file);
        if (message) { setError(message); return; }
        setFilePreview(file); onSelected(file);
      };
      setSeconds(0); setRecording(true); active.start(250);
      timer.current = setInterval(() => setSeconds(value => {
        if (value + 1 >= MAX_AUDIO_SECONDS) { stop(); return MAX_AUDIO_SECONDS; }
        return value + 1;
      }), 1000);
    } catch {
      setError('No pudimos usar el micrófono. Revisa el permiso o sube un archivo de audio.');
    }
  };
  const remove = () => {
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(''); setError(''); onRemove?.();
  };

  return <section className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
    <div><h3 className="font-bold">Audio de voz <span className="text-zinc-500">(opcional)</span></h3><p className="mt-1 text-xs text-zinc-400">Graba hasta 30 segundos o sube WEBM, OGG, M4A o MP3 de máximo 1 MB.</p></div>
    {error && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={recording ? stop : start} disabled={disabled} className="rounded-xl bg-white/10 px-4 py-3 text-sm font-bold disabled:opacity-50">{recording ? `Detener (${seconds}s)` : 'Grabar mensaje'}</button>
      <label htmlFor={id} className="cursor-pointer rounded-xl border border-white/15 px-4 py-3 text-sm font-bold">Subir audio</label>
      <input id={id} type="file" accept="audio/webm,audio/ogg,audio/mp4,audio/mpeg,.webm,.ogg,.m4a,.mp3" className="sr-only" onChange={choose} disabled={disabled || recording} />
      {preview && <button type="button" onClick={remove} disabled={disabled || recording} className="rounded-xl px-3 py-3 text-sm text-red-300 underline disabled:opacity-50">Eliminar audio</button>}
    </div>
    {preview && <audio controls src={preview} className="w-full" />}
  </section>;
}
