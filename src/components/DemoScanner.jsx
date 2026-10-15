import React, { useState } from 'react';

export default function DemoScanner() {
  const [isScanned, setIsScanned] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const handleScan = () => {
    setIsScanned(true);
    setStatusMsg('Simulación: así se vería el perfil tras un escaneo. No se leyó ninguna placa real.');
    setToastMsg('');
  };

  const handleReset = () => {
    setIsScanned(false);
    setStatusMsg('');
    setToastMsg('');
  };

  const handleActionClick = (msg) => {
    setToastMsg(msg);
  };

  return (
    <section id="demo" className="py-20 md:py-24 bg-ink text-white">
      <div className="max-w-[1120px] w-[calc(100%-40px)] mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black leading-[1.1] tracking-[-0.03em]">
          Pruébalo tú mismo
        </h2>
        <p className="text-muted-light text-lg mt-3">
          Así vería el perfil en el navegador quien escanee la placa de tu mascota.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center mt-12">
          {/* Controls & Explanation */}
          <div className="max-w-xl">
            <div className="bg-white/10 border border-white/10 p-5 rounded-2xl text-sm sm:text-base text-muted-dim leading-relaxed">
              <strong className="text-white">Esto es una simulación visual.</strong> El sitio no lee ninguna placa NFC real y todos los datos del ejemplo son ficticios.
            </div>

            <div className="flex flex-wrap gap-3.5 mt-6">
              <button
                type="button"
                onClick={handleScan}
                className="font-bold px-6 py-3.5 rounded-full bg-orange-brand text-white hover:bg-orange-hover hover:-translate-y-0.5 transition-all shadow-md active:translate-y-0"
              >
                Simular escaneo
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="font-bold px-6 py-3.5 rounded-full border-2 border-white/40 text-white hover:border-white hover:bg-white/10 transition-all"
              >
                Reiniciar
              </button>
            </div>

            <p 
              className="mt-4 text-teal-brand font-semibold text-sm sm:text-base min-h-[1.5em] transition-opacity" 
              role="status" 
              aria-live="polite"
            >
              {statusMsg}
            </p>
          </div>

          {/* Phone Frame */}
          <div className="mx-auto w-[300px] h-[580px] rounded-[48px] bg-black p-3.5 shadow-2xl ring-2 ring-white/10 relative">
            {/* Screen */}
            <div className="w-full h-full rounded-[38px] bg-cream relative overflow-hidden text-ink flex flex-col">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full bg-black z-30 flex items-center justify-end pr-3">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-brand/80 animate-ping" />
              </div>

              {/* IDLE STATE */}
              <div 
                className={`absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-7 bg-ink text-white transition-opacity duration-500 z-10 ${
                  isScanned ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
                aria-hidden={isScanned}
              >
                <div className="w-[92px] h-[92px] rounded-full border-2 border-teal-brand animate-pulse-ring flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16d1b0" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 8a8 8 0 0 1 0 8M10 5.5a12 12 0 0 1 0 13M14 3a16 16 0 0 1 0 18" />
                  </svg>
                </div>
                <strong className="text-lg">Acerca el teléfono a la placa</strong>
                <p className="text-muted-light text-sm">
                  Pulsa el botón “Simular escaneo” para ver el perfil de muestra.
                </p>
              </div>

              {/* SCANNED PROFILE STATE */}
              <div 
                className={`h-full overflow-y-auto px-5 pt-12 pb-6 flex flex-col transition-all duration-500 transform ${
                  isScanned ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
                }`}
                aria-label="Perfil de ejemplo"
              >
                <div>
                  <span className="inline-block bg-orange-brand text-white text-[0.68rem] font-extrabold tracking-wider px-2.5 py-0.5 rounded-full uppercase">
                    Ejemplo ficticio
                  </span>
                </div>

                {/* Pet Head Header */}
                <div className="flex items-center gap-3.5 my-3.5">
                  <div className="w-16 h-16 rounded-full bg-orange-brand flex items-center justify-center text-white shrink-0 shadow-sm" aria-hidden="true">
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="currentColor">
                      <ellipse cx="7" cy="9" rx="2.2" ry="3" />
                      <ellipse cx="17" cy="9" rx="2.2" ry="3" />
                      <circle cx="12" cy="14" r="5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black leading-none text-ink">Luna</h3>
                    <span className="text-muted text-xs font-medium">Perfil de muestra verificado</span>
                  </div>
                </div>

                {/* Pet Information Fields */}
                <dl className="grid gap-2.5 mb-4">
                  <div className="bg-white rounded-xl p-2.5 px-3.5 shadow-sm border border-black/5">
                    <dt className="text-[0.68rem] font-bold uppercase tracking-wider text-muted">Nombre</dt>
                    <dd className="text-sm font-semibold text-ink">Luna</dd>
                  </div>
                  <div className="bg-white rounded-xl p-2.5 px-3.5 shadow-sm border border-black/5">
                    <dt className="text-[0.68rem] font-bold uppercase tracking-wider text-muted">Especie</dt>
                    <dd className="text-sm font-semibold text-ink">Perro (Golden Retriever)</dd>
                  </div>
                  <div className="bg-white rounded-xl p-2.5 px-3.5 shadow-sm border border-black/5">
                    <dt className="text-[0.68rem] font-bold uppercase tracking-wider text-muted">Indicación médica</dt>
                    <dd className="text-sm font-semibold text-ink">Requiere medicación diaria por alergia</dd>
                  </div>
                  <div className="bg-white rounded-xl p-2.5 px-3.5 shadow-sm border border-black/5">
                    <dt className="text-[0.68rem] font-bold uppercase tracking-wider text-muted">Mensaje de la familia</dt>
                    <dd className="text-sm font-semibold text-ink">“Soy muy amistosa. ¡Muchas gracias por cuidarme y ayudarme a volver!”</dd>
                  </div>
                </dl>

                {/* Action CTA Buttons inside simulated phone */}
                <div className="flex flex-col gap-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => handleActionClick('📞 Botón de muestra: aquí se iniciaría la llamada directa al dueño.')}
                    className="w-full font-bold py-3 px-4 rounded-xl bg-ink text-white text-sm hover:bg-black transition-colors"
                  >
                    Llamar al dueño (ejemplo)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleActionClick('💬 Botón de muestra: aquí se abriría un chat seguro de WhatsApp/SMS.')}
                    className="w-full font-bold py-3 px-4 rounded-xl bg-teal-brand text-ink text-sm hover:brightness-105 transition-all"
                  >
                    Enviar mensaje (ejemplo)
                  </button>
                </div>

                {/* Toast Message */}
                <p 
                  className="text-xs text-center text-muted font-medium mt-3 min-h-[2.5em] px-2" 
                  role="status" 
                  aria-live="polite"
                >
                  {toastMsg}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

