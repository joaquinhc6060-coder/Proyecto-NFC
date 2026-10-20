import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

export default function AnimalsDivision() {
  const divisionRef = useRef(null);

  const animalTypes = [
    { emoji: '🐕', name: 'Perros (Referencia Principal)', desc: 'Resistencia a tirones, barro, inmersión en agua y juego rudo.' },
    { emoji: '🐈', name: 'Gatos y Felinos', desc: 'Placas compactas y ultraligeras que no incomodan en saltos y paseos.' },
    { emoji: '🐾', name: 'Cualquier Mascota', desc: 'Conejos, animales de rescate o refugios que requieran identificación inmediata.' }
  ];

  return (
    <section 
      id="animales" 
      ref={divisionRef}
      className="py-24 lg:py-36 bg-[#07080a] text-white relative overflow-hidden border-t border-b border-white/5"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-orange-brand/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] leading-[1.05] uppercase">
            Protección activa para cualquier animal. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-light to-orange-brand">
              Perros, gatos y compañeros de vida.
            </span>
          </h2>

          <p className="text-muted-light text-base sm:text-xl font-light mt-4 max-w-2xl leading-relaxed">
            Aunque nuestra referencia principal y caso de éxito es la perrita Luna (Golden Retriever), las placas FindeMe están calibradas para colocarse en el collar de cualquier mascota o animal de compañía.
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
          
          {/* Column 1: Info and Animal Species Cards */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {animalTypes.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-orange-brand/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-3xl block mb-2">{item.emoji}</span>
                    <h3 className="font-bold text-white text-sm mb-1">{item.name}</h3>
                    <p className="text-xs text-muted-dim leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-b from-white/[0.05] to-black/60 border border-white/10 backdrop-blur-md space-y-4">
              <span className="text-xs font-mono text-orange-brand uppercase tracking-wider block">
                Ficha Médica y Reencuentro Universal
              </span>
              <h3 className="text-2xl font-black text-white leading-tight">
                La información correcta en el momento justo salva vidas.
              </h3>
              <p className="text-sm text-muted-light leading-relaxed">
                Quien encuentre a tu animal solo acerca su teléfono a la placa circular y accede al instante al contacto telefónico, chat de WhatsApp con envío de coordenadas y advertencias vitales de alergias severas o medicación diaria.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <a 
                  href="#demo"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-brand hover:bg-orange-hover text-white text-xs font-bold transition-all shadow-md shadow-orange-brand/20"
                >
                  <span>📱</span> Probar el Simulador de Escaneo
                </a>
                <Link 
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/10"
                >
                  <span>⚙️</span> Abrir Panel del Dueño
                </Link>
              </div>
            </div>
          </div>

          {/* Column 2: Photorealistic iPhone with Luna's Profile */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-[300px] sm:w-[350px] aspect-[9/16] drop-shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
              <img 
                src="/images/iphone-16-pro-front.jpg" 
                alt="FindeMe Animales - Perfil de Luna en iPhone 16 Pro" 
                className="w-full h-full object-contain rounded-[44px]"
              />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/80 border border-orange-brand/40 backdrop-blur-xl px-4 py-1.5 rounded-full text-[11px] font-mono text-orange-brand whitespace-nowrap shadow-xl">
                Luna · Golden Retriever (Caso Referencia)
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

