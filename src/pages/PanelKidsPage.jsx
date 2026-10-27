import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PanelKidsPage() {
  const [status, setStatus] = useState('safe'); // 'safe' | 'alert'
  const [toastMessage, setToastMessage] = useState('');

  const [kidData, setKidData] = useState({
    name: 'Martina Morales',
    age: '6 años',
    wristbandId: 'KIDS-7712-CL',
    chipType: 'NTAG213 Grado Médico (IP68)',
    school: 'Colegio San Ignacio, Santiago',
    medicalAlert: 'Asma leve / Alérgica a mariscos y frutos secos',
    parent1: { name: 'Patricia Morales (Mamá)', phone: '+56 9 8765 4321', relationship: 'Madre' },
    parent2: { name: 'Carlos Morales (Papá)', phone: '+56 9 7654 3210', relationship: 'Padre' },
    lastLocation: 'Parque Bicentenario, Vitacura (Hace 12 min)',
    batterySignal: 'NFC Pasivo (Sin Batería · Vida Útil +10 Años)'
  });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleToggleStatus = () => {
    const nextStatus = status === 'safe' ? 'alert' : 'safe';
    setStatus(nextStatus);
    triggerToast(
      nextStatus === 'alert'
        ? '⚠️ ALERTA ACTIVADA: Quien escanee la pulsera verá aviso prioritario de búsqueda y llamada a emergencias.'
        : '✓ Estado Seguro restablecido con éxito.'
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white py-10 px-4 sm:px-6 relative selection:bg-orange-brand selection:text-white">
      {/* Luces de fondo ambient */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-teal-brand/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-brand/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-[1100px] w-full mx-auto relative z-10 space-y-6">
        
        {/* Cabecera del Panel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/[0.08] gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-brand animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-teal-brand">
                PANEL DE SEGURIDAD · VIGIO KIDS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Pulsera Inteligente <span className="text-orange-brand">{kidData.name}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-muted-light transition-colors"
            >
              Cerrar Sesión ↗
            </Link>
            <Link
              to="/"
              className="px-4 py-2 rounded-full bg-orange-brand hover:bg-orange-hover text-white text-xs font-bold transition-all shadow-md shadow-orange-brand/20"
            >
              ← Volver al Portal
            </Link>
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-teal-brand/20 border border-teal-brand/40 text-teal-300 text-xs font-mono animate-fadeIn flex items-center gap-2">
            <span>🛡️</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Tarjeta de Estado & Dispositivo */}
          <div className="p-6 rounded-3xl bg-[#121316] border border-white/[0.08] space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-muted-dim">Dispositivo NFC</span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-brand/10 text-teal-brand border border-teal-brand/20 text-[10px] font-mono">
                {kidData.wristbandId}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-2">
              <span className="text-4xl block">🧒</span>
              <h3 className="text-lg font-black text-white">{kidData.name}</h3>
              <p className="text-xs text-muted-light font-mono">{kidData.age} · {kidData.school}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-muted-dim">Chip Hardware:</span>
                <span className="text-white font-mono">{kidData.chipType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-muted-dim">Última Zona:</span>
                <span className="text-white font-mono">{kidData.lastLocation}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-muted-dim">Autonomía:</span>
                <span className="text-emerald-400 font-mono">100% Pasivo (Sin Batería)</span>
              </div>
            </div>

            {/* Switch de Alerta */}
            <div className={`p-4 rounded-2xl border transition-colors ${
              status === 'safe'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300 animate-pulse'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  {status === 'safe' ? '• Estado: Seguro' : '🚨 Estado: Extravío / Alerta Activa'}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90 mb-3">
                {status === 'safe'
                  ? 'La pulsera funciona normalmente mostrando contacto de los padres al acercar un teléfono.'
                  : 'Al escanear la pulsera, saltará una alarma sonora y se solicitará compartir ubicación GPS inmediata a WhatsApp.'}
              </p>
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-transform active:scale-95 ${
                  status === 'safe'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-black'
                }`}
              >
                {status === 'safe' ? 'Activar Modo Extravío Urgente' : 'Marcar a Salvo (Normal)'}
              </button>
            </div>
          </div>

          {/* Información Médica y Padres */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Contactos de Emergencia */}
            <div className="p-6 rounded-3xl bg-[#121316] border border-white/[0.08] space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📞</span>
                <span>Contactos de Emergencia Inmediata</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono text-muted-dim uppercase block">Contacto Primario</span>
                  <strong className="text-sm text-white block">{kidData.parent1.name}</strong>
                  <span className="text-xs font-mono text-teal-brand block">{kidData.parent1.phone}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono text-muted-dim uppercase block">Contacto Secundario</span>
                  <strong className="text-sm text-white block">{kidData.parent2.name}</strong>
                  <span className="text-xs font-mono text-teal-brand block">{kidData.parent2.phone}</span>
                </div>
              </div>
            </div>

            {/* Ficha Médica de Urgencia */}
            <div className="p-6 rounded-3xl bg-[#121316] border border-white/[0.08] space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>🩺</span>
                <span>Advertencias Médicas & Protocolo</span>
              </h3>

              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-200/90 leading-relaxed font-mono">
                ⚠️ <strong>ALERGIAS:</strong> {kidData.medicalAlert}
              </div>

              <p className="text-xs text-muted-light font-light leading-relaxed">
                Esta ficha médica se despliega en cualquier teléfono iPhone o Android sin requerir clave para que personal de primeros auxilios, profesores o quien encuentre al menor actúe de inmediato con conocimiento clínico.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
