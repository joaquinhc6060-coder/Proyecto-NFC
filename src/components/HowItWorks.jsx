import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      num: 1,
      title: "Configura el perfil",
      desc: "Completa los datos de tu mascota y elige qué se muestra y cómo te contactan.",
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16d1b0" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 20h4l11-11-4-4L4 16v4z" />
          <path d="M13 7l4 4" />
        </svg>
      )
    },
    {
      num: 2,
      title: "Coloca la placa",
      desc: "Cuélgala del collar. Es ligera, resistente al agua y no requiere baterías ni mantenimiento.",
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16d1b0" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="13" r="6" />
          <path d="M12 7V3M9 3h6" />
        </svg>
      )
    },
    {
      num: 3,
      title: "Alguien la escanea",
      desc: "Acerca su teléfono compatible, ve el perfil al instante y te contacta por los medios que habilitaste.",
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16d1b0" strokeWidth="1.8" strokeLinecap="round">
          <rect x="7" y="3" width="10" height="18" rx="2" />
          <path d="M20 8a5 5 0 0 1 0 8" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* SECCIÓN: SI SE PIERDE */}
      <section id="si-se-pierde" className="py-20 md:py-24 bg-cream">
        <div className="max-w-[1120px] w-[calc(100%-40px)] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black leading-[1.1] tracking-[-0.03em] text-ink">
              Si se pierde, su información ayuda a que vuelva a casa
            </h2>
            <p className="text-muted text-lg mt-4 leading-relaxed">
              Quien encuentre a tu mascota solo necesita acercar su teléfono a la placa NFC. Se abre su perfil en el navegador, sin descargar ninguna aplicación ni registrarse.
            </p>
            <div className="mt-6 p-4 border-l-4 border-orange-brand bg-orange-tint rounded-r-xl text-ink text-sm sm:text-base">
              <strong>Importante:</strong> Funciona si el teléfono es compatible con NFC y la función está activada. Prácticamente cualquier smartphone moderno lo soporta de fábrica.
            </div>
          </div>

          <div 
            className="bg-ink rounded-[22px] p-8 sm:p-12 flex items-center justify-center min-h-[300px] shadow-xl border border-white/5"
            role="img" 
            aria-label="Representación gráfica de un smartphone escaneando una placa NFC"
          >
            <svg className="w-full max-w-[280px]" viewBox="0 0 260 220" fill="none" aria-hidden="true">
              {/* Phone outline */}
              <rect x="30" y="20" width="84" height="170" rx="14" stroke="#ffffff" strokeWidth="3" />
              <rect x="62" y="28" width="20" height="4" rx="2" fill="#ffffff" opacity="0.4" />
              {/* Signal waves from phone */}
              <path d="M130 70a30 30 0 0 1 0 60M148 55a50 50 0 0 1 0 90" stroke="#16d1b0" strokeWidth="4" strokeLinecap="round" />
              {/* NFC Tag */}
              <circle cx="200" cy="100" r="42" fill="#0b0c10" stroke="#ff5a2e" strokeWidth="4" />
              <path d="M188 88a14 14 0 0 1 0 24M198 81a24 24 0 0 1 0 38" stroke="#16d1b0" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* SECCIÓN: CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-20 md:py-24 bg-ink text-white">
        <div className="max-w-[1120px] w-[calc(100%-40px)] mx-auto">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black leading-[1.1] tracking-[-0.03em]">
              Tres pasos, sin complicaciones
            </h2>
            <p className="text-muted-light text-lg mt-3">
              Del perfil inicial al reencuentro seguro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
            {steps.map((step) => (
              <div 
                key={step.num} 
                className="relative bg-ink-secondary rounded-[22px] p-8 border border-white/5 shadow-lg flex flex-col justify-between pt-10"
              >
                {/* Step badge */}
                <span className="absolute -top-4 left-6 w-10 h-10 rounded-full bg-orange-brand text-white font-black flex items-center justify-center text-lg shadow-md shadow-orange-brand/30">
                  {step.num}
                </span>

                <div className="mb-6">
                  <div className="p-3 bg-white/5 rounded-2xl w-fit mb-5">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2.5 text-white">
                    {step.title}
                  </h3>
                  <p className="text-muted-light leading-relaxed text-sm sm:text-base">
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

