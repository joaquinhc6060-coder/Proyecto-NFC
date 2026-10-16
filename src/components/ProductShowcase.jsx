import React, { useState, useEffect } from 'react';

export default function ProductShowcase() {
  const [activeDevice, setActiveDevice] = useState(2); // Center device (Ficha de Rescate) by default
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const devices = [
    {
      id: 0,
      tabTitle: 'Panel del Dueño',
      badge: 'Control Total',
      title: 'Gestión en la Nube',
      subtitle: 'Historial de lecturas y control de estados',
      screenType: 'dashboard',
      gradient: 'from-[#1c1f27] to-[#12141a]',
      content: {
        header: 'Mis Mascotas',
        status: 'Placa NTAG213 Activa',
        reads: '14 lecturas este mes',
        plateId: 'FINDME-9824-CL'
      }
    },
    {
      id: 1,
      tabTitle: 'Punto de Encuentro',
      badge: 'Ubicación Inmediata',
      title: 'Punto de Escaneo',
      subtitle: 'Ubicación enviada directamente a tu WhatsApp',
      screenType: 'map',
      gradient: 'from-[#0d1f1c] to-[#0b1016]',
      content: {
        location: 'Parque Providencia, Santiago',
        coordinates: '-33.4372, -70.6506',
        distance: 'A 350 metros de ti',
        time: 'Detectado hace 2 min'
      }
    },
    {
      id: 2,
      tabTitle: 'Ficha de Rescate NFC',
      badge: 'Escaneo Instantáneo',
      title: 'Un Toque para Volver',
      subtitle: 'Lo que ve quien escanea la placa en su celular',
      screenType: 'profile',
      gradient: 'from-[#2a1b14] to-[#12141a]',
      content: {
        name: 'Luna',
        breed: 'Golden Retriever · 3 años',
        photo: '/images/luna-perfil.jpg',
        emergency: 'Muy dócil y sociable'
      }
    },
    {
      id: 3,
      tabTitle: 'Ficha Médica & Alergias',
      badge: 'Salud y Cuidados',
      title: 'Atención Veterinaria',
      subtitle: 'Indicaciones críticas ante emergencias',
      screenType: 'medical',
      gradient: 'from-[#122328] to-[#0c141a]',
      content: {
        allergies: ['Penicilina', 'Amoxicilina'],
        food: ['Chocolate', 'Uvas', 'Cebolla'],
        vet: 'Clínica Providencia (24/7)'
      }
    },
    {
      id: 4,
      tabTitle: 'Alerta Push en tu Celular',
      badge: 'Notificación Inmediata',
      title: 'Aviso al Dueño',
      subtitle: 'Notificación con el punto de encuentro en tu teléfono',
      screenType: 'notification',
      gradient: 'from-[#1e1726] to-[#100d16]',
      content: {
        msg: '¡Tu placa NFC acaba de ser leída!',
        sub: 'Alguien acercó su celular al collar de Luna en Parque Providencia.',
        time: 'Ahora'
      }
    }
  ];

  // Optional subtle auto-rotation if user hasn't interacted
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveDevice((prev) => (prev + 1) % devices.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, devices.length]);

  return (
    <section id="ecosistema" className="py-24 md:py-32 bg-[#0c0d12] text-white relative overflow-hidden border-t border-b border-white/10">
      
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-gradient-to-r from-orange-brand/15 via-teal-brand/15 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-teal-brand/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1240px] w-[calc(100%-40px)] mx-auto relative z-10">
        
        {/* Section Header with High-Impact Typography (Inspired by Fi Tracking) */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-brand/10 border border-teal-brand/30 text-teal-brand font-bold tracking-[0.12em] uppercase text-xs mb-4">
            <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
            Experiencia FindMe Mobile
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] leading-[1.08] text-white">
            Un ecosistema inteligente. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-light to-orange-brand">
              Tranquilidad total.
            </span>
          </h2>

          <p className="text-muted-light text-base sm:text-xl mt-5 max-w-2xl mx-auto leading-relaxed">
            Ubicación compartida al escanear, perfil médico, contacto seguro por WhatsApp y panel en la nube. Todo sin apps obligatorias para quien lo encuentra.
          </p>

          {/* Interactive Feature Pills (Tabs) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8">
            {devices.map((device) => {
              const isActive = activeDevice === device.id;
              return (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => {
                    setActiveDevice(device.id);
                    setIsAutoPlaying(false);
                  }}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 border ${
                    isActive
                      ? 'bg-orange-brand border-orange-brand text-white shadow-lg shadow-orange-brand/25 scale-105'
                      : 'bg-white/5 border-white/10 text-muted-dim hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-teal-brand'}`} />
                  {device.tabTitle}
                </button>
              );
            })}
          </div>
        </div>

        {/* -------------------------------------------------------------
            THE 5-PHONE PERSPECTIVE FAN SHOWCASE (THE CORE FI EXPERIENCE)
           ------------------------------------------------------------- */}
        <div 
          className="relative min-h-[580px] sm:min-h-[640px] flex items-center justify-center perspective-[1400px] py-10"
          onMouseEnter={() => setIsAutoPlaying(false)}
        >
          <div className="relative w-full max-w-[1050px] h-[540px] sm:h-[580px] flex items-center justify-center">
            
            {devices.map((device, index) => {
              // Calculate horizontal offset, 3D rotation, and scale relative to active device
              const offset = index - activeDevice;
              const absOffset = Math.abs(offset);
              const zIndex = 30 - absOffset * 5;
              
              // Dynamic CSS 3D transforms
              const translateX = offset * 180; // Distance between phones
              const rotateY = offset * -14;     // Fan angle
              const scale = 1 - absOffset * 0.08;
              const opacity = absOffset > 2 ? 0.35 : 1 - absOffset * 0.15;
              const translateY = absOffset * 15;

              return (
                <div
                  key={device.id}
                  onClick={() => {
                    setActiveDevice(device.id);
                    setIsAutoPlaying(false);
                  }}
                  className="absolute cursor-pointer transition-all duration-700 ease-out"
                  style={{
                    transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale}) rotateY(${rotateY}deg)`,
                    zIndex: zIndex,
                    opacity: opacity,
                  }}
                >
                  {/* Phone Bezel Frame (iPhone 16 Pro Style) */}
                  <div className={`w-[260px] sm:w-[280px] h-[520px] sm:h-[550px] rounded-[44px] p-3 bg-gradient-to-b from-[#2a2d36] via-[#15171e] to-[#0a0b0e] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ${
                    activeDevice === device.id ? 'ring-teal-brand/70 shadow-teal-brand/15' : 'ring-white/10'
                  } transition-all duration-500`}>
                    
                    {/* Inner Screen */}
                    <div className={`w-full h-full rounded-[34px] overflow-hidden bg-gradient-to-b ${device.gradient} text-white flex flex-col relative border border-white/10`}>
                      
                      {/* Dynamic Island Notch */}
                      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full bg-black z-30 flex items-center justify-end pr-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-brand animate-ping" />
                      </div>

                      {/* Top App Status Header */}
                      <div className="pt-7 px-4 pb-2 flex items-center justify-between text-[10px] text-muted-dim font-medium border-b border-white/5">
                        <span className="font-bold text-white flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16d1b0" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M5 9a9 9 0 0 1 0 6M9 6.5a13 13 0 0 1 0 11M13 4a17 17 0 0 1 0 16" />
                          </svg>
                          FindMe
                        </span>
                        <span className="text-teal-brand font-semibold text-[9px] bg-teal-brand/15 px-1.5 py-0.5 rounded-full">
                          {device.badge}
                        </span>
                      </div>

                      {/* SCREEN 0: DASHBOARD / MI NFC */}
                      {device.screenType === 'dashboard' && (
                        <div className="p-4 flex-1 flex flex-col justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2.5 mb-3">
                              <div className="w-10 h-10 rounded-full bg-orange-brand/20 border border-orange-brand text-orange-brand flex items-center justify-center font-bold text-sm">
                                L
                              </div>
                              <div>
                                <h4 className="font-extrabold text-white text-sm">Placa de Luna</h4>
                                <span className="text-[10px] text-teal-brand font-mono">{device.content.plateId}</span>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 mb-2">
                              <span className="text-[9px] uppercase font-bold text-muted-light block">Estado de la placa</span>
                              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                🟢 Segura en Casa
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                              <span className="text-[9px] uppercase font-bold text-muted-light block">Telemetría NFC</span>
                              <p className="text-white font-semibold text-xs mt-0.5">14 escaneos registrados</p>
                              <span className="text-[9px] text-muted-dim">Chip NTAG213 High Frequency</span>
                            </div>
                          </div>

                          <div className="w-full py-2.5 rounded-xl bg-orange-brand/20 border border-orange-brand/50 text-orange-brand font-bold text-center text-xs">
                            Modo Alerta: Desactivado
                          </div>
                        </div>
                      )}

                      {/* SCREEN 1: UBICACION DEL ESCANEO */}
                      {device.screenType === 'map' && (
                        <div className="relative flex-1 flex flex-col justify-between p-3.5">
                          {/* Grid Map Background Mockup */}
                          <div className="absolute inset-0 bg-[#0a1518] overflow-hidden opacity-90">
                            {/* SVG Simulated Streets and Park */}
                            <svg className="w-full h-full opacity-40" viewBox="0 0 200 300">
                              <path d="M-20 80 Q 80 120 220 70" stroke="#16d1b0" strokeWidth="6" fill="none" />
                              <path d="M30 0 L 150 300" stroke="#5d6370" strokeWidth="4" fill="none" />
                              <circle cx="110" cy="140" r="45" fill="#16d1b0" fillOpacity="0.15" />
                              <path d="M 80 120 Q 110 140 140 130" stroke="#ff5a2e" strokeWidth="3" strokeDasharray="4 2" fill="none" />
                            </svg>

                            {/* Glowing Location Signal Rings */}
                            <div className="absolute top-[44%] left-[52%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                              <span className="absolute -inset-4 rounded-full border-2 border-teal-brand animate-ping opacity-75" />
                              <span className="w-4 h-4 rounded-full bg-teal-brand border-2 border-white block shadow-lg shadow-teal-brand" />
                            </div>
                          </div>

                          {/* Top Location Pill */}
                          <div className="relative z-10 bg-ink/90 backdrop-blur-md p-2 rounded-xl border border-white/15 text-[10px]">
                            <span className="text-teal-brand font-bold uppercase block text-[8px]">Ubicación Compartida</span>
                            <span className="text-white font-semibold">Parque Providencia, Santiago</span>
                          </div>

                          {/* Bottom Card */}
                          <div className="relative z-10 bg-ink/95 backdrop-blur-md p-3 rounded-2xl border border-white/15 space-y-1.5">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-muted-light font-medium">Distancia estimada:</span>
                              <span className="text-teal-brand font-bold">350 metros</span>
                            </div>
                            <div className="w-full py-2 rounded-xl bg-teal-brand text-ink font-bold text-center text-[11px] shadow-sm">
                              Abrir en Google Maps →
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SCREEN 2: FICHA DE RESCATE (THE CORE USER SCREEN) */}
                      {device.screenType === 'profile' && (
                        <div className="flex-1 flex flex-col bg-[#f4ebe1] text-[#12141a] overflow-hidden">
                          {/* Dog Photo */}
                          <div className="relative aspect-[16/11] w-full overflow-hidden bg-cream-secondary">
                            <img 
                              src={device.content.photo} 
                              alt="Luna" 
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1.5 right-2 bg-ink/80 text-white text-[8px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                              FindMe NFC
                            </span>
                          </div>

                          {/* Profile Data */}
                          <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between text-left">
                            <div>
                              <h4 className="text-xl font-black text-ink leading-tight">Luna</h4>
                              <p className="text-xs text-muted font-medium">Golden Retriever · 3 años</p>
                              <p className="text-[10px] text-ink/80 mt-1 line-clamp-2 leading-snug">
                                Muy cariñosa y dócil. Tiene una mancha blanca en el pecho.
                              </p>
                            </div>

                            {/* Contact Action Buttons */}
                            <div className="space-y-1.5 pt-1">
                              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                <div className="py-2 bg-white rounded-lg text-center font-bold border border-black/10 shadow-sm">
                                  📞 Llamar
                                </div>
                                <div className="py-2 bg-[#25D366]/20 text-[#128C7E] rounded-lg text-center font-bold border border-[#25D366]/30">
                                  💬 WhatsApp
                                </div>
                              </div>
                              <div className="w-full py-2 rounded-lg bg-[#a69683] text-white text-[10px] font-bold text-center">
                                📍 Enviar mi ubicación al dueño
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SCREEN 3: FICHA MÉDICA */}
                      {device.screenType === 'medical' && (
                        <div className="p-4 flex-1 flex flex-col justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2 mb-3 text-red-400 font-bold text-[11px]">
                              <span>⚠️</span> Alertas Médicas Severas
                            </div>

                            <div className="space-y-2">
                              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                                <span className="text-[9px] uppercase font-bold text-red-300 block">Alergias a Medicamentos</span>
                                <span className="font-semibold text-white text-[11px]">Penicilina, Amoxicilina</span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <span className="text-[9px] uppercase font-bold text-amber-300 block">Alimentos Prohibidos</span>
                                <span className="font-semibold text-white text-[11px]">Chocolate, Uvas, Cebolla</span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-[9px] uppercase font-bold text-muted-light block">Veterinario de Cabecera</span>
                                <span className="font-semibold text-white text-[11px]">Dr. Soto (+56 9 1122 3344)</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-2 bg-teal-brand/10 border border-teal-brand/30 rounded-xl text-center text-[10px] text-teal-brand font-bold">
                            ✓ Historial sincronizado con Supabase
                          </div>
                        </div>
                      )}

                      {/* SCREEN 4: NOTIFICACIÓN PUSH */}
                      {device.screenType === 'notification' && (
                        <div className="p-4 flex-1 flex flex-col justify-center text-xs">
                          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 shadow-2xl backdrop-blur-md space-y-2">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-extrabold text-teal-brand flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
                                FindMe Notificación
                              </span>
                              <span className="text-muted-light text-[9px]">Ahora</span>
                            </div>

                            <p className="text-white font-bold text-xs leading-snug">
                              ¡Tu placa NFC acaba de ser leída!
                            </p>
                            <p className="text-muted-dim text-[10px] leading-relaxed">
                              Alguien acercó su teléfono a la placa de Luna cerca de Providencia. Toca para ver las coordenadas en el mapa.
                            </p>

                            <div className="pt-1 flex gap-2">
                              <span className="text-[10px] font-bold text-orange-brand">Ver ubicación en vivo →</span>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </div>

        {/* Feature Highlights Grid Below Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl bg-[#14161f] border border-white/10 hover:border-teal-brand/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-brand/15 text-teal-brand flex items-center justify-center font-bold text-lg mb-3">
              ⚡
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Sin descargas para quien lo encuentra</h4>
            <p className="text-sm text-muted-light leading-relaxed">
              Cualquier smartphone moderno (iOS o Android) abre el perfil instantáneamente al acercarlo a la placa.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#14161f] border border-white/10 hover:border-orange-brand/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-orange-brand/15 text-orange-brand flex items-center justify-center font-bold text-lg mb-3">
              📍
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Ubicación con 1 toque</h4>
            <p className="text-sm text-muted-light leading-relaxed">
              Quien encuentra a tu mascota puede compartirte su ubicación exacta por WhatsApp en segundos.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#14161f] border border-white/10 hover:border-teal-brand/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-brand/15 text-teal-brand flex items-center justify-center font-bold text-lg mb-3">
              🛡️
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Modo Alerta y Privacidad Total</h4>
            <p className="text-sm text-muted-light leading-relaxed">
              Tú decides qué datos mostrar y puedes activar una alarma roja en la placa en caso de extravío.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
