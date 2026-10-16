import React, { useState } from 'react';

export default function KidsSection() {
  const [activeTab, setActiveTab] = useState('simulador');

  return (
    <section 
      id="ninos" 
      className="py-24 lg:py-36 bg-[#07080a] text-white relative overflow-hidden border-t border-b border-white/5"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-teal-brand/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-brand/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] leading-[1.05] uppercase">
            Seguridad activa en la muñeca. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-light to-orange-brand">
              Tranquilidad en cada paso.
            </span>
          </h2>

          <p className="text-muted-light text-base sm:text-xl font-light mt-4 max-w-2xl leading-relaxed">
            Pulseras inteligentes de silicona hipoalergénica con microchip NFC pasivo. Diseñadas para playas, centros comerciales, parques de diversiones y salidas escolares.
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Column 1: High-Resolution Lifestyle Photography */}
          <div className="relative rounded-[36px] overflow-hidden border border-white/10 shadow-2xl group">
            <img 
              src="/images/findme-kids-wristband.jpg" 
              alt="Niña en el parque usando pulsera inteligente NFC FindeMe Kids" 
              className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            
            {/* Overlay spec badges */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs font-mono">
              <span className="bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-teal-brand">
                ✓ Silicona Grado Médico IP68
              </span>
              <span className="bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-white/90">
                100% Sumergible en Agua
              </span>
            </div>
          </div>

          {/* Column 2: Simulated Interactive Kids Rescue Card */}
          <div className="space-y-6">
            
            {/* Interactive Preview Container */}
            <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-b from-white/[0.05] to-black/60 border border-white/10 backdrop-blur-xl shadow-2xl">
              
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <span className="text-xs font-mono text-teal-brand uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-brand animate-pulse" />
                  Simulación de Ficha Infantil
                </span>
                <span className="text-[10px] font-mono text-muted-dim bg-white/5 px-2.5 py-0.5 rounded-full">
                  NFC ID: KIDS-4109
                </span>
              </div>

              {/* Child Profile Card Mockup */}
              <div className="bg-[#12141a] p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-brand/20 to-orange-brand/20 border border-teal-brand/40 flex items-center justify-center text-2xl font-bold text-white shadow-inner">
                    👧
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Martina González</h3>
                    <span className="text-xs text-muted-light font-medium block">5 años · Providencia, Santiago</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">🟢 Pulsera Vinculada Activa</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-muted-dim text-[9px] uppercase block">Grupo Sanguíneo</span>
                    <span className="text-white font-bold">A Positivo (A+)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                    <span className="text-red-300 text-[9px] uppercase block">Alergia Severa</span>
                    <span className="text-red-400 font-bold">Maní / Frutos Secos</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-muted-light leading-relaxed">
                  “Martina suele ponerse tímida si se pierde. Por favor llama de inmediato a sus padres o comparte tu ubicación por WhatsApp.”
                </div>

                {/* Direct Action Buttons for Kids */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => alert('Simulación: Llamando inmediatamente al teléfono de la Mamá de Martina (+56 9 9876 5432).')}
                    className="py-3 px-3 rounded-xl bg-orange-brand hover:bg-orange-hover text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-md shadow-orange-brand/20"
                  >
                    <span>📞</span> Llamar a Mamá
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('Simulación: Llamando inmediatamente al teléfono del Papá de Martina (+56 9 8765 4321).')}
                    className="py-3 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <span>📞</span> Llamar a Papá
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Simulación: Compartiendo ubicación GPS en tiempo real con ambos padres vía WhatsApp.')}
                  className="w-full py-2.5 rounded-xl bg-[#25D366] hover:brightness-105 text-ink font-black text-xs transition-all text-center flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>💬</span> Enviar Ubicación GPS por WhatsApp
                </button>
              </div>

            </div>

            {/* 3 Core Benefits Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-teal-brand font-bold text-sm block mb-1">0 Baterías</span>
                <span className="text-xs text-muted-dim leading-snug">Sin circuitos activos que requieran recargas.</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-orange-brand font-bold text-sm block mb-1">Sin Cuotas</span>
                <span className="text-xs text-muted-dim leading-snug">Un solo pago para siempre, sin suscripciones.</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-emerald-400 font-bold text-sm block mb-1">Universal</span>
                <span className="text-xs text-muted-dim leading-snug">Compatible con 100% de smartphones modernos.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
