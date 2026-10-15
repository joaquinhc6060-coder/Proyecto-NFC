import React, { useState } from 'react';

export default function Hero() {
  const [tagHovered, setTagHovered] = useState(false);

  return (
    <section 
      id="inicio"
      className="relative overflow-hidden bg-ink text-white"
      style={{
        backgroundImage: `
          radial-gradient(900px 500px at 80% 20%, rgba(255, 90, 46, 0.22), transparent 60%),
          radial-gradient(700px 500px at 10% 90%, rgba(22, 209, 176, 0.15), transparent 60%)
        `
      }}
    >
      <div className="max-w-[1120px] w-[calc(100%-40px)] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center py-16 md:py-24">
        {/* Left Column: Text & CTAs */}
        <div className="z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-brand/10 border border-teal-brand/30 text-teal-brand font-bold tracking-[0.1em] uppercase text-xs mb-5">
            <span className="w-2 h-2 rounded-full bg-teal-brand animate-pulse" />
            Placa NFC inteligente para mascotas
          </div>

          <h1 className="text-[2.6rem] sm:text-[3.5rem] lg:text-[4.3rem] font-black leading-[1.03] tracking-[-0.035em]">
            Que volver a casa sea <em className="not-italic text-orange-brand">cuestión de un toque.</em>
          </h1>

          <p className="text-muted-light text-lg sm:text-xl mt-6 mb-8 max-w-[34em] leading-relaxed">
            NexoPet es una placa para el collar. Quien encuentre a tu mascota acerca su teléfono y ve su perfil al instante con la información que tú decidas compartir y formas seguras de avisarte.
          </p>

          <div className="flex flex-wrap gap-3.5">
            <a 
              href="#contacto" 
              className="inline-flex items-center justify-center font-bold px-7 py-3.5 rounded-full bg-orange-brand text-white hover:bg-orange-hover hover:-translate-y-0.5 transition-all shadow-lg shadow-orange-brand/25"
            >
              Quiero conocer la placa
            </a>
            <a 
              href="#demo" 
              className="inline-flex items-center justify-center font-bold px-7 py-3.5 rounded-full border-2 border-white/60 text-white hover:bg-white/10 hover:border-white hover:-translate-y-0.5 transition-all"
            >
              Ver la demostración
            </a>
          </div>

          <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/10 text-xs sm:text-sm text-muted-light">
            <div className="flex items-center gap-2">
              <span className="text-teal-brand font-bold text-base">✓</span>
              <span>Sin baterías</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-teal-brand font-bold text-base">✓</span>
              <span>100% Resistente al agua</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-teal-brand font-bold text-base">✓</span>
              <span>Sin apps para quien lo encuentra</span>
            </div>
          </div>
        </div>

        {/* Right Column: Real Dog with Smart NFC Collar Prototype */}
        <div className="relative max-w-[460px] lg:max-w-[500px] w-full mx-auto order-first lg:order-last">
          {/* Ambient luminous glow behind dog */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-orange-brand/25 via-teal-brand/20 to-orange-light/20 blur-3xl opacity-80 pointer-events-none" />

          {/* Interactive Hero Card Container */}
          <div className="relative rounded-[36px] bg-gradient-to-b from-white/10 via-white/[0.04] to-black/40 p-4 sm:p-6 border border-white/15 shadow-2xl backdrop-blur-sm">
            
            {/* Top Product Tag Pill */}
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/90 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-brand animate-ping" />
                Prototipo NexoPet en uso real
              </span>
              <span className="text-xs text-muted-dim font-medium">
                Edición Collar Clásico
              </span>
            </div>

            {/* Main Dog Photo Frame */}
            <div className="relative aspect-square w-full rounded-[28px] overflow-hidden bg-gradient-to-b from-[#212530] to-[#12141a] flex items-center justify-center group">
              
              {/* Studio soft spotlight behind dog's head */}
              <div className="absolute top-[18%] left-[50%] -translate-x-1/2 w-[60%] aspect-square rounded-full bg-radial from-orange-brand/20 to-transparent blur-xl pointer-events-none" />

              {/* The Real Dog Image provided by User */}
              <img 
                src="/images/perro-hero.png" 
                alt="Perro con placa inteligente NFC NexoPet en su collar" 
                className="w-full h-full object-contain object-bottom scale-[1.03] transition-transform duration-700 group-hover:scale-[1.05] drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
              />

              {/* NFC Signal Waves Emitting from the Collar Tag */}
              <div 
                className="absolute top-[36.5%] left-[45.4%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              >
                <span className="absolute -inset-4 rounded-full border-2 border-teal-brand/40 animate-ping" style={{ animationDuration: '2.4s' }} />
                <span className="absolute -inset-8 rounded-full border border-teal-brand/20 animate-ping" style={{ animationDuration: '3.2s' }} />
              </div>

              {/* Realistic 3D Smart NFC Tag Prototype Hanging on Collar */}
              <div 
                className="absolute top-[36.5%] left-[45.4%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-transform duration-300 hover:scale-125"
                onMouseEnter={() => setTagHovered(true)}
                onMouseLeave={() => setTagHovered(false)}
                onClick={() => setTagHovered(!tagHovered)}
                role="button"
                tabIndex={0}
                aria-label="Placa NFC inteligente de NexoPet en el collar"
              >
                {/* Metallic Split Ring Connector to Collar */}
                <div className="relative mx-auto w-3.5 h-3.5 -mb-1 rounded-full border-[2.2px] border-[#d4d8e0] shadow-[0_2px_4px_rgba(0,0,0,0.6)] z-10"
                  style={{
                    background: 'linear-gradient(135deg, #e2e8f0 0%, #475569 50%, #f8fafc 100%)'
                  }}
                />

                {/* Tag Disc Body */}
                <div 
                  className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center p-[2.5px] shadow-[0_8px_20px_rgba(0,0,0,0.85),0_2px_6px_rgba(0,0,0,0.6)] border border-white/60"
                  style={{
                    background: 'radial-gradient(circle at 35% 25%, #4b5262 0%, #1a1c23 60%, #0d0e12 100%)'
                  }}
                >
                  {/* Subtle Orange Accent Ring */}
                  <div className="w-full h-full rounded-full border-[1.5px] border-orange-brand/90 p-[1.5px] flex items-center justify-center shadow-inner">
                    {/* Inner Dark Matte Face Plate */}
                    <div className="w-full h-full rounded-full bg-[#12141a] flex items-center justify-center shadow-inner">
                      {/* Laser-Etched Glowing Teal NFC Waves */}
                      <svg 
                        className="w-5 h-5 text-teal-brand filter drop-shadow-[0_0_4px_rgba(22,209,176,0.9)]" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeLinecap="round"
                      >
                        <path d="M5 9a9 9 0 0 1 0 6" />
                        <path d="M9 6.5a13 13 0 0 1 0 11" />
                        <path d="M13 4a17 17 0 0 1 0 16" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Soft shadow cast by tag onto dog's fur */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full bg-black/50 blur-[2px] pointer-events-none -z-10" />
              </div>

              {/* Floating Callout Pointer to the Tag */}
              <div 
                className="absolute top-[28%] right-[6%] z-30 max-w-[190px] bg-ink/90 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl shadow-xl transition-all duration-300 hover:border-teal-brand/60"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
                  <span className="text-[11px] font-black uppercase tracking-wide text-white">Placa NexoPet</span>
                </div>
                <p className="text-[10px] text-muted-dim leading-tight">
                  Lectura instantánea sin contacto por cualquier celular.
                </p>
                <div className="mt-1.5 text-[9px] font-bold text-orange-brand flex items-center gap-1">
                  <span>Acercar para escanear →</span>
                </div>
              </div>

              {/* Bottom Subtle Overlay for Grounding */}
              <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-[#12141a] via-[#12141a]/60 to-transparent pointer-events-none" />
            </div>

            {/* Bottom Caption */}
            <div className="mt-3.5 flex items-center justify-between text-xs text-muted-dim px-2">
              <span className="font-semibold text-white/90">
                Ajuste liviano y ergonómico
              </span>
              <span className="text-teal-brand font-bold">
                14g · Aleación reforzada
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
