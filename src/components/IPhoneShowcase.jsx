import React, { useState, useEffect } from 'react';

export default function IPhoneShowcase() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const features = [
    {
      id: 0,
      step: '01',
      title: 'Lectura Instantánea',
      tagline: 'Cualquier teléfono moderno lee la placa en 0.2 segundos sin instalar aplicaciones.',
      badge: 'NFC Pasivo NTAG213',
      icon: '⚡',
      screenTag: 'NFC detectado · 0.2s',
      screenColor: 'from-teal-brand/30 to-transparent border-teal-brand/50 text-teal-brand',
    },
    {
      id: 1,
      step: '02',
      title: 'Ficha Médica de Urgencia',
      tagline: 'Alergias severas, medicación y contacto del veterinario visibles de inmediato.',
      badge: 'Alerta Veterinaria 24/7',
      icon: '🩺',
      screenTag: 'Ficha médica en vivo',
      screenColor: 'from-orange-brand/30 to-transparent border-orange-brand/50 text-orange-brand',
    },
    {
      id: 2,
      step: '03',
      title: 'Punto de Encuentro GPS',
      tagline: 'El rescatista envía sus coordenadas directamente a tu WhatsApp con un toque.',
      badge: 'Geolocalización Inmediata',
      icon: '📍',
      screenTag: 'GPS sincronizado con WhatsApp',
      screenColor: 'from-emerald-500/30 to-transparent border-emerald-500/50 text-emerald-400',
    },
  ];

  // Auto-cycle through the 3 features smoothly every 4.5s unless paused by user interaction
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, features.length]);

  return (
    <section 
      id="ecosistema"
      className="relative w-full py-20 lg:py-32 bg-[#07080a] text-white overflow-hidden border-t border-b border-white/5"
    >
      {/* Background Volumetric Ambient Lighting */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-r from-teal-brand/10 via-orange-brand/10 to-transparent rounded-full blur-[160px] pointer-events-none" 
      />

      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center relative z-10">
        
        {/* Left Column: Responsive Photorealistic iPhone 16 Pro Showcase */}
        <div className="flex flex-col items-center justify-center order-2 lg:order-1">
          <div className="relative w-[280px] sm:w-[340px] lg:w-[380px] aspect-[9/16] transition-all duration-700 ease-out group">
            
            {/* Real photorealistic iPhone 16 Pro studio render */}
            <img 
              src="/images/iphone-16-pro-front.jpg" 
              alt="iPhone 16 Pro Max mostrando perfil Vigio" 
              className="w-full h-full object-contain rounded-[48px] drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
            />

            {/* Glowing active screen ring */}
            <div className="absolute inset-0 rounded-[48px] ring-1 ring-white/20 pointer-events-none" />

            {/* Dynamic floating pill displaying current active step */}
            <div className="absolute top-14 inset-x-8 flex justify-center pointer-events-none">
              <div 
                key={activeFeature}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-xl border bg-gradient-to-b shadow-xl animate-fadeIn ${features[activeFeature].screenColor}`}
              >
                <span>{features[activeFeature].icon} {features[activeFeature].screenTag}</span>
              </div>
            </div>
          </div>

          {/* Quick tab dots on mobile for tactile feedback */}
          <div className="flex items-center gap-2 mt-6 lg:hidden">
            {features.map((feat, idx) => (
              <button
                key={feat.id}
                type="button"
                onClick={() => {
                  setActiveFeature(idx);
                  setIsPaused(true);
                }}
                aria-label={`Ver paso ${feat.step}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeFeature === idx 
                    ? 'w-8 bg-orange-brand shadow-lg shadow-orange-brand/30' 
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Dynamic Feature Storytelling (Tap to switch) */}
        <div className="space-y-8 order-1 lg:order-2">
          
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] leading-[1.05] uppercase">
              Diseñado para el <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-light to-orange-brand">
                Momento Crítico.
              </span>
            </h2>
          </div>

          {/* Interactive Stepper Feature Cards */}
          <div className="space-y-4">
            {features.map((feat, idx) => {
              const isActive = activeFeature === idx;
              return (
                <div 
                  key={feat.id}
                  onClick={() => {
                    setActiveFeature(idx);
                    setIsPaused(true);
                  }}
                  className={`p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md cursor-pointer select-none text-left relative overflow-hidden ${
                    isActive 
                      ? 'bg-white/10 border-teal-brand/60 shadow-xl shadow-teal-brand/10 scale-[1.01]' 
                      : 'bg-white/[0.02] border-white/5 opacity-50 hover:opacity-80 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Subtle active progress bar */}
                  {isActive && !isPaused && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-brand to-orange-brand animate-growWidth" style={{ animationDuration: '4.5s' }} />
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-teal-brand font-bold tracking-widest uppercase flex items-center gap-2">
                      <span className="text-sm">{feat.icon}</span>
                      <span>{feat.step} · {feat.badge}</span>
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-teal-brand animate-pulse" />
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white mb-1">
                    {feat.title}
                  </h3>

                  <p className="text-muted-light text-sm sm:text-base leading-relaxed">
                    {feat.tagline}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Minimalist interactive helper note */}
          <div className="flex items-center gap-2.5 text-xs text-muted-dim font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-brand" />
            <span>Toca cualquier paso para explorar su respuesta instantánea</span>
          </div>

        </div>

      </div>
    </section>
  );
}
