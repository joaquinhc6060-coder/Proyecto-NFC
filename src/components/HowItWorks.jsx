import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: "Configura el perfil en la nube",
      desc: "Completa los datos de tu mascota en 2 minutos: fotos, alergias, teléfono de WhatsApp y contacto de emergencia.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16d1b0" strokeWidth="2.2" strokeLinecap="round">
          <path d="M4 20h4l11-11-4-4L4 16v4z" />
          <path d="M13 7l4 4" />
        </svg>
      )
    },
    {
      num: '02',
      title: "Coloca la placa en el collar",
      desc: "Fabricada con chip NTAG213 ultraligero y 100% resistente al agua. No usa baterías ni requiere recargas nunca.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff5a2e" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="12" cy="13" r="6" />
          <path d="M12 7V3M9 3h6" />
        </svg>
      )
    },
    {
      num: '03',
      title: "Un toque para el reencuentro",
      desc: "Quien la encuentre solo acerca su celular. El perfil se abre al instante en el navegador y puede compartirte su ubicación por WhatsApp.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16d1b0" strokeWidth="2.2" strokeLinecap="round">
          <rect x="7" y="3" width="10" height="18" rx="2" />
          <path d="M20 8a5 5 0 0 1 0 8" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* SECCIÓN: SI SE PIERDE (HIGH CONTRAST SLEEK HERO CALLOUT) */}
      <section id="si-se-pierde" className="py-24 md:py-28 bg-[#0f1118] text-white relative overflow-hidden border-b border-white/5">
        <div className="max-w-[1160px] w-[calc(100%-40px)] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-brand/10 border border-orange-brand/30 text-orange-brand font-bold tracking-[0.1em] uppercase text-xs mb-4">
              <span>⚡</span> Recuperación Inmediata
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.85rem] font-black leading-[1.08] tracking-[-0.035em] text-white">
              Si se pierde, la información adecuada <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-light to-orange-brand">salva su vida.</span>
            </h2>

            <p className="text-muted-light text-base sm:text-lg mt-5 leading-relaxed">
              Quien encuentre a tu mascota no necesita descargar aplicaciones ni registrarse. Solo acerca su teléfono a la placa FindMe y accede a su ficha médica, alergias severas y botón directo a tu WhatsApp.
            </p>

            <div className="mt-8 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm flex items-start gap-3.5">
              <span className="w-8 h-8 rounded-xl bg-teal-brand/15 text-teal-brand flex items-center justify-center shrink-0 font-bold text-sm">
                ✓
              </span>
              <p className="text-xs sm:text-sm text-muted-dim leading-relaxed">
                <strong className="text-white">Compatibilidad Universal:</strong> Funciona con cualquier smartphone con NFC activo (Apple iPhone y el 99% de los modelos Android actuales de fábrica).
              </p>
            </div>
          </div>

          {/* Interactive Illustrated Scan Representation */}
          <div 
            className="relative rounded-[32px] p-8 sm:p-12 bg-gradient-to-b from-white/[0.05] to-black/40 border border-white/10 shadow-2xl backdrop-blur-md flex items-center justify-center min-h-[340px]"
            role="img" 
            aria-label="Representación gráfica de un smartphone escaneando una placa NFC"
          >
            {/* Glowing background halo */}
            <div className="absolute inset-0 bg-radial from-teal-brand/15 via-transparent to-transparent blur-2xl pointer-events-none" />

            <div className="relative flex items-center justify-center gap-6 sm:gap-10">
              
              {/* Phone Mockup Frame */}
              <div className="w-[120px] sm:w-[140px] h-[220px] sm:h-[250px] rounded-[30px] border-2 border-white/40 bg-ink p-2 shadow-2xl relative flex flex-col justify-between">
                <div className="w-8 h-2 rounded-full bg-black mx-auto" />
                
                {/* Phone screen preview */}
                <div className="w-full h-[160px] rounded-2xl bg-cream p-2 text-ink flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-full bg-orange-brand text-white flex items-center justify-center font-bold text-xs mb-1">
                    L
                  </div>
                  <span className="font-extrabold text-[11px] text-ink block leading-none">Luna</span>
                  <span className="text-[8px] text-muted block mb-1">Golden Retriever</span>
                  <div className="w-full py-1 rounded-md bg-teal-brand text-ink text-[7px] font-bold">
                    Llamar al Dueño
                  </div>
                </div>

                <div className="w-10 h-1 rounded-full bg-white/20 mx-auto" />
              </div>

              {/* NFC Transmission Signal Waves */}
              <div className="flex flex-col items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-brand animate-ping" />
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16d1b0" strokeWidth="2.5" strokeLinecap="round" className="opacity-90">
                  <path d="M6 9a9 9 0 0 1 0 6M10 6.5a13 13 0 0 1 0 11M14 4a17 17 0 0 1 0 16" />
                </svg>
                <span className="text-[9px] font-mono text-teal-brand tracking-widest uppercase">NFC Link</span>
              </div>

              {/* 3D Smart Tag Pendant */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#2a2d36] to-[#0d0e12] p-2.5 shadow-2xl border border-white/30 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-orange-brand/80 p-2 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-ink flex items-center justify-center text-teal-brand">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 9a9 9 0 0 1 0 6M9 6.5a13 13 0 0 1 0 11M13 4a17 17 0 0 1 0 16" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN: CÓMO FUNCIONA (3 PASOS MINIMALISTAS) */}
      <section id="como-funciona" className="py-24 md:py-32 bg-[#0c0d12] text-white relative">
        <div className="max-w-[1160px] w-[calc(100%-40px)] mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-teal-brand text-xs font-bold uppercase tracking-[0.15em] block mb-2">
              Flujo Simple y Directo
            </span>
            <h2 className="text-3xl sm:text-5xl font-black leading-[1.08] tracking-[-0.035em]">
              Tres pasos, cero fricción.
            </h2>
            <p className="text-muted-light text-base sm:text-lg mt-4">
              Desde la configuración en la nube hasta el reencuentro seguro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div 
                key={step.num} 
                className="group relative bg-[#13151e] hover:bg-[#171a25] rounded-[28px] p-8 border border-white/10 hover:border-teal-brand/50 shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Step Top Indicator */}
                <div className="flex items-center justify-between mb-8">
                  <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <span className="font-mono text-2xl font-black text-white/20 group-hover:text-teal-brand transition-colors">
                    {step.num}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-teal-brand transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-light leading-relaxed text-sm sm:text-[15px]">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
