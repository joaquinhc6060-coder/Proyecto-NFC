import React, { useState, useEffect } from 'react';

export default function DemoScanner() {
  // viewMode: 'idle' | 'profile' | 'call' | 'whatsapp'
  const [viewMode, setViewMode] = useState('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Call timer simulation
  useEffect(() => {
    let timer;
    if (viewMode === 'call') {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [viewMode]);

  const handleScan = () => {
    setViewMode('profile');
    setStatusMsg('¡Placa escaneada! Visualizando la Ficha de Rescate de Luna.');
  };

  const handleStartCall = () => {
    setViewMode('call');
    setStatusMsg('Llamada en curso: simulando comunicación directa con el dueño.');
  };

  const handleStartWhatsapp = () => {
    setViewMode('whatsapp');
    setStatusMsg('Chat en curso: simulando conversación segura por WhatsApp.');
  };

  const handleBackToProfile = () => {
    setViewMode('profile');
    setStatusMsg('Has regresado a la Ficha de Rescate.');
  };

  const handleReset = () => {
    setViewMode('idle');
    setStatusMsg('');
    setCallDuration(0);
  };

  const formatCallTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <section id="demo" className="py-20 md:py-28 bg-[#0c0d12] text-white border-t border-b border-white/10 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-96 h-96 bg-teal-brand/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-orange-brand/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1160px] w-[calc(100%-40px)] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-brand/15 border border-orange-brand/30 text-orange-brand font-bold text-xs uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-orange-brand animate-ping" />
            Simulador Interactivo
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black leading-[1.1] tracking-[-0.03em] text-white">
            Pruébalo tú mismo
          </h2>
          <p className="text-muted-light text-base sm:text-lg mt-3 leading-relaxed">
            Experimenta exactamente lo que ve quien escanea la placa de tu mascota: ficha médica, llamada simulada al dueño y chat seguro de WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_auto] gap-12 lg:gap-16 items-center">
          
          {/* Controls & Interactive Test Modes */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 p-5 sm:p-6 rounded-2xl text-sm sm:text-base text-muted-dim leading-relaxed backdrop-blur-sm">
              <strong className="text-white block mb-1">Simulación interactiva en tiempo real:</strong>
              Puedes pulsar los botones del teléfono o usar los accesos directos de abajo para alternar entre el escaneo, la llamada en vivo y el chat de WhatsApp.
            </div>

            {/* Quick-switch buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleScan}
                className={`font-bold px-5 py-3 rounded-full text-sm transition-all flex items-center gap-2 shadow-md ${
                  viewMode === 'profile'
                    ? 'bg-orange-brand text-white shadow-orange-brand/25 scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span>📱</span> Simular Escaneo
              </button>

              <button
                type="button"
                onClick={handleStartCall}
                className={`font-bold px-5 py-3 rounded-full text-sm transition-all flex items-center gap-2 shadow-md ${
                  viewMode === 'call'
                    ? 'bg-emerald-500 text-white shadow-emerald-500/25 scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span>📞</span> Simular Llamada
              </button>

              <button
                type="button"
                onClick={handleStartWhatsapp}
                className={`font-bold px-5 py-3 rounded-full text-sm transition-all flex items-center gap-2 shadow-md ${
                  viewMode === 'whatsapp'
                    ? 'bg-[#25D366] text-ink shadow-[#25D366]/25 scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span>💬</span> Simular WhatsApp
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="font-bold px-5 py-3 rounded-full border border-white/30 text-muted-light hover:text-white hover:border-white transition-all text-sm"
              >
                🔄 Reiniciar
              </button>
            </div>

            {/* Status Feedback */}
            <div className="min-h-[2.5rem] flex items-center">
              {statusMsg && (
                <p className="text-teal-brand font-semibold text-sm flex items-center gap-2 bg-teal-brand/10 border border-teal-brand/30 px-4 py-2 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
                  {statusMsg}
                </p>
              )}
            </div>

            {/* Feature Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="font-bold text-white text-xs block mb-0.5">📞 Llamada Inmediata</span>
                <span className="text-xs text-muted-light">Conecta al rescatista con tu número en un solo toque, sin intermediarios.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="font-bold text-teal-brand text-xs block mb-0.5">💬 WhatsApp con Ubicación</span>
                <span className="text-xs text-muted-light">Genera un mensaje predefinido con coordenadas para que sepas dónde está tu mascota.</span>
              </div>
            </div>
          </div>

          {/* Phone Frame (Realistic iPhone Style) */}
          <div className="mx-auto w-[310px] sm:w-[325px] h-[610px] rounded-[50px] bg-gradient-to-b from-[#2e313c] via-[#1a1c23] to-[#0c0d12] p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-white/20 relative">
            
            {/* Inner Screen */}
            <div className="w-full h-full rounded-[40px] bg-[#12141a] relative overflow-hidden text-white flex flex-col border border-white/10 shadow-inner">
              
              {/* Dynamic Island / Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full bg-black z-40 flex items-center justify-between px-3">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
              </div>

              {/* -----------------------------------------------------------------
                  STATE 0: IDLE (Waiting to scan)
                 ----------------------------------------------------------------- */}
              {viewMode === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center p-7 bg-[#0c0d12] text-white z-20">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-2 border-teal-brand/60 animate-ping absolute inset-0" />
                    <div className="w-24 h-24 rounded-full bg-teal-brand/15 border-2 border-teal-brand flex items-center justify-center relative shadow-lg shadow-teal-brand/20">
                      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#16d1b0" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 9a9 9 0 0 1 0 6M9 6.5a13 13 0 0 1 0 11M13 4a17 17 0 0 1 0 16" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <strong className="text-lg font-bold block text-white">Acerca el celular a la placa</strong>
                    <p className="text-muted-light text-xs mt-1.5 leading-relaxed">
                      Toca el botón “Simular escaneo” para ver cómo responde la placa NFC al instante.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleScan}
                    className="font-bold px-6 py-2.5 rounded-full bg-orange-brand text-white hover:bg-orange-hover transition-all text-xs shadow-md shadow-orange-brand/20"
                  >
                    Escanear ahora
                  </button>
                </div>
              )}

              {/* -----------------------------------------------------------------
                  STATE 1: SCANNED PROFILE (Luna's rescue card)
                 ----------------------------------------------------------------- */}
              {viewMode === 'profile' && (
                <div className="h-full overflow-y-auto px-4 pt-11 pb-5 flex flex-col justify-between bg-[#fbf6ee] text-[#12141a]">
                  <div>
                    {/* Top Tag & Status */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="inline-block bg-orange-brand text-white text-[10px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-full uppercase">
                        Placa FindMe Verificada
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Activa
                      </span>
                    </div>

                    {/* Dog Photo & Name */}
                    <div className="flex items-center gap-3.5 bg-white p-2.5 rounded-2xl border border-black/5 shadow-sm">
                      <img 
                        src="/images/luna-perfil.jpg" 
                        alt="Luna Golden Retriever" 
                        className="w-14 h-14 rounded-full object-cover border-2 border-orange-brand shadow-sm shrink-0" 
                      />
                      <div>
                        <h3 className="text-xl font-black text-ink leading-none">Luna</h3>
                        <span className="text-muted text-xs font-semibold block mt-0.5">Golden Retriever · 3 años</span>
                        <span className="text-[10px] text-teal-brand font-mono font-bold bg-teal-brand/10 px-1.5 py-0.5 rounded">
                          NFC ID: FINDME-9824
                        </span>
                      </div>
                    </div>

                    {/* Pet Info Fields */}
                    <dl className="grid gap-2 mt-3 text-xs">
                      <div className="bg-white rounded-xl p-2.5 px-3 shadow-sm border border-black/5">
                        <dt className="text-[9px] font-bold uppercase tracking-wider text-muted">Alergias / Salud</dt>
                        <dd className="text-xs font-bold text-red-600 mt-0.5">Alérgica a Penicilina · Solo comida especial</dd>
                      </div>
                      <div className="bg-white rounded-xl p-2.5 px-3 shadow-sm border border-black/5">
                        <dt className="text-[9px] font-bold uppercase tracking-wider text-muted">Mensaje de la familia</dt>
                        <dd className="text-xs font-medium text-ink mt-0.5 leading-snug">
                          “Soy muy dócil y amistosa. ¡Gracias por cuidarme y ayudarme a volver con Patricia!”
                        </dd>
                      </div>
                      <div className="bg-white rounded-xl p-2.5 px-3 shadow-sm border border-black/5">
                        <dt className="text-[9px] font-bold uppercase tracking-wider text-muted">Dueña registrada</dt>
                        <dd className="text-xs font-semibold text-ink mt-0.5">Patricia Morales · Providencia</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Action CTA Buttons (Triggers Fake Call & Fake WhatsApp) */}
                  <div className="flex flex-col gap-2 pt-3">
                    <button
                      type="button"
                      onClick={handleStartCall}
                      className="w-full font-bold py-3 px-4 rounded-xl bg-ink text-white text-xs hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                    >
                      <span>📞</span> Llamar al dueño directo
                    </button>
                    <button
                      type="button"
                      onClick={handleStartWhatsapp}
                      className="w-full font-bold py-3 px-4 rounded-xl bg-[#25D366] text-ink text-xs hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-sm font-black active:scale-[0.98]"
                    >
                      <span>💬</span> Enviar mensaje por WhatsApp
                    </button>
                  </div>
                </div>
              )}

              {/* -----------------------------------------------------------------
                  STATE 2: SIMULATED PHONE CALL ("Llamando al dueño...")
                 ----------------------------------------------------------------- */}
              {viewMode === 'call' && (
                <div className="h-full flex flex-col justify-between p-6 pt-12 pb-8 bg-gradient-to-b from-[#181a24] via-[#0f1017] to-[#07080a] text-white">
                  
                  {/* Call Header */}
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-brand/15 text-teal-brand text-[9px] font-bold uppercase tracking-wider mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-brand animate-ping" />
                      FindMe · Contacto de Emergencia
                    </span>
                    <h3 className="text-2xl font-black text-white mt-1">Patricia Morales</h3>
                    <p className="text-xs text-muted-light mt-0.5 font-medium">+56 9 8765 4321</p>
                    
                    {/* Dynamic Call Status */}
                    <div className="mt-2 text-xs font-semibold">
                      {callDuration < 2 ? (
                        <span className="text-teal-brand animate-pulse flex items-center justify-center gap-1.5">
                          <span>📞</span> Llamando al dueño...
                        </span>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Conectado · {formatCallTime(callDuration - 1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pulsing Avatar */}
                  <div className="relative my-auto flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full border-2 border-emerald-400/40 animate-ping absolute" />
                    <div className="w-28 h-28 rounded-full border border-white/20 p-1.5 relative bg-white/5 backdrop-blur-md">
                      <img 
                        src="/images/luna-perfil.jpg" 
                        alt="Patricia y Luna" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Simulated Audio Frequency Equalizer */}
                  {callDuration >= 2 && (
                    <div className="flex items-center justify-center gap-1 h-5 mb-4">
                      <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3" />
                      <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-5" style={{ animationDelay: '100ms' }} />
                      <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2" style={{ animationDelay: '200ms' }} />
                      <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-4" style={{ animationDelay: '300ms' }} />
                      <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3" style={{ animationDelay: '150ms' }} />
                    </div>
                  )}

                  {/* In-Call Phone Control Buttons */}
                  <div className="grid grid-cols-3 gap-3 max-w-[220px] mx-auto text-[10px] text-center mb-6">
                    <button 
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                        isMuted ? 'bg-white text-ink' : 'bg-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      <span>{isMuted ? '🔇' : '🎙️'}</span>
                      <span className="text-[9px]">{isMuted ? 'Silenciado' : 'Silenciar'}</span>
                    </button>

                    <button 
                      type="button"
                      className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white flex flex-col items-center gap-1 transition-all"
                    >
                      <span>🔢</span>
                      <span className="text-[9px]">Teclado</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                      className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                        isSpeakerOn ? 'bg-teal-brand text-ink font-bold' : 'bg-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      <span>🔊</span>
                      <span className="text-[9px]">Altavoz</span>
                    </button>
                  </div>

                  {/* Hang Up Action Button */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={handleBackToProfile}
                      className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-all"
                      title="Finalizar llamada"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="rotate-[135deg]">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </button>
                    <span className="text-[10px] text-muted-light font-medium">Finalizar llamada y volver</span>
                  </div>

                </div>
              )}

              {/* -----------------------------------------------------------------
                  STATE 3: SIMULATED WHATSAPP CHAT
                 ----------------------------------------------------------------- */}
              {viewMode === 'whatsapp' && (
                <div className="h-full flex flex-col justify-between bg-[#0b141a] text-white">
                  
                  {/* WhatsApp Header */}
                  <div className="pt-8 px-3 pb-2.5 bg-[#202c33] flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleBackToProfile}
                        className="text-teal-brand font-bold text-lg hover:opacity-80 p-1 -ml-1"
                        title="Volver"
                      >
                        ←
                      </button>
                      <div className="relative">
                        <img 
                          src="/images/luna-perfil.jpg" 
                          alt="Patricia" 
                          className="w-8 h-8 rounded-full object-cover border border-emerald-500"
                        />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#202c33] absolute -bottom-0.5 -right-0.5" />
                      </div>
                      <div className="leading-tight">
                        <h4 className="font-bold text-xs text-white">Patricia Morales</h4>
                        <span className="text-[9px] text-emerald-400 font-medium">en línea</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-light text-xs">
                      <span>📹</span>
                      <span>📞</span>
                    </div>
                  </div>

                  {/* Chat Bubbles Container */}
                  <div className="flex-1 p-3 space-y-2.5 overflow-y-auto text-[11px] bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:12px_12px]">
                    
                    {/* Date Pill */}
                    <div className="text-center my-1">
                      <span className="bg-[#182229] text-[9px] text-muted-dim px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                        Hoy
                      </span>
                    </div>

                    {/* Rescuer Message Bubble (Outgoing) */}
                    <div className="flex justify-end">
                      <div className="bg-[#005c4b] text-white p-2.5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm leading-relaxed">
                        <p>
                          ¡Hola Patricia! Acabo de escanear la placa <strong>FindMe</strong> de <strong>Luna</strong> en Providencia. Ella está bien y segura conmigo 🐾
                        </p>
                        <span className="text-[8px] text-white/70 block text-right mt-1">14:24 ✓✓</span>
                      </div>
                    </div>

                    {/* Rescuer Location Card Bubble */}
                    <div className="flex justify-end">
                      <div className="bg-[#005c4b] text-white p-2.5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm space-y-1">
                        <div className="flex items-center gap-1.5 text-teal-brand font-bold text-[10px]">
                          <span>📍</span> Ubicación enviada
                        </div>
                        <p className="text-[10px] text-white/90">
                          Parque Providencia, Santiago
                        </p>
                        <div className="bg-black/30 p-1.5 rounded-lg text-[9px] text-teal-brand font-mono">
                          GPS Rescatista · Ver en Maps
                        </div>
                        <span className="text-[8px] text-white/70 block text-right">14:24 ✓✓</span>
                      </div>
                    </div>

                    {/* Patricia's Answer (Incoming) */}
                    <div className="flex justify-start">
                      <div className="bg-[#202c33] text-white p-2.5 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm leading-relaxed">
                        <p>
                          ¡Dios mío qué alivio! 😭 Muchísimas gracias por avisarme. Estoy a 5 minutos en auto, voy en camino de inmediato.
                        </p>
                        <span className="text-[8px] text-muted-dim block text-right mt-1">14:25</span>
                      </div>
                    </div>

                    {/* Patricia's Second Answer */}
                    <div className="flex justify-start">
                      <div className="bg-[#202c33] text-white p-2.5 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm leading-relaxed">
                        <p>
                          Por favor no le des comida porque como viste en su ficha es alérgica a ciertos alimentos 🙏
                        </p>
                        <span className="text-[8px] text-muted-dim block text-right mt-1">14:25</span>
                      </div>
                    </div>

                  </div>

                  {/* Simulated Input Bar */}
                  <div className="p-2 bg-[#202c33] flex items-center gap-2 border-t border-white/5">
                    <span className="text-muted-dim text-sm pl-1">😊</span>
                    <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-[10px] text-muted-light">
                      Escribe un mensaje...
                    </div>
                    <span className="text-muted-dim text-xs">📎</span>
                    <div className="w-7 h-7 rounded-full bg-[#00a884] text-ink flex items-center justify-center text-xs font-bold">
                      🎙️
                    </div>
                  </div>

                  {/* Back to Profile Floating Bar */}
                  <button
                    type="button"
                    onClick={handleBackToProfile}
                    className="w-full py-2 bg-ink text-teal-brand text-[10px] font-bold text-center hover:bg-black transition-colors border-t border-white/10"
                  >
                    ← Volver a la Ficha de Rescate
                  </button>

                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
