import React, { useState } from 'react';

export default function RestaurantSection() {
  const [activeTab, setActiveTab] = useState('mesa'); // 'mesa' | 'tarjeta'
  const [points, setPoints] = useState(350);
  const [stamps, setStamps] = useState(4);
  const [toastMsg, setToastMsg] = useState('');

  const handleAddStamp = () => {
    if (stamps < 5) {
      setStamps(stamps + 1);
      setPoints(points + 50);
      setToastMsg('¡Sello digital sumado! +50 puntos en tu tarjeta VIP.');
    } else {
      setToastMsg('¡Felicidades! Completaste tus sellos. Tienes 1 consumición gratis.');
    }
  };

  return (
    <section 
      id="restaurantes" 
      className="py-24 lg:py-36 bg-[#07080a] text-white relative overflow-hidden border-t border-b border-white/5"
    >
      {/* Background ambient glow */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-orange-brand/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-brand/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] leading-[1.05] uppercase">
            Experiencia en mesa y fidelización. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-light to-orange-brand">
              Un toque, clientes cautivos.
            </span>
          </h2>

          <p className="text-muted-light text-base sm:text-xl font-light mt-4 max-w-2xl leading-relaxed">
            Elimina los códigos QR impresos que no leen con poca luz y reemplaza los cartones de sellos por tarjetas inteligentes contactless de alta gama.
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Column 1: Commercial Product Photograph */}
          <div className="relative rounded-[36px] overflow-hidden border border-white/10 shadow-2xl group">
            <img 
              src="/images/findme-restaurant-loyalty.jpg" 
              alt="Peana NFC para mesas de restaurante y tarjeta VIP de fidelización FindeMe" 
              className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            
            {/* Overlay spec badges */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs font-mono">
              <span className="bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-orange-brand font-semibold">
                ✓ Acrílico Mate & Metal Titanio
              </span>
              <span className="bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-white/90">
                100% Sin Contacto
              </span>
            </div>
          </div>

          {/* Column 2: Dual Interactive Simulator (Mesa vs Tarjeta VIP) */}
          <div className="space-y-6">
            
            {/* Mode Switcher Pills */}
            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 max-w-md">
              <button
                type="button"
                onClick={() => { setActiveTab('mesa'); setToastMsg(''); }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'mesa'
                    ? 'bg-orange-brand text-white shadow-md'
                    : 'text-muted-light hover:text-white'
                }`}
              >
                🍽️ Peana de Mesa NFC
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('tarjeta'); setToastMsg(''); }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'tarjeta'
                    ? 'bg-teal-brand text-ink font-black shadow-md'
                    : 'text-muted-light hover:text-white'
                }`}
              >
                💳 Tarjeta VIP Loyalty
              </button>
            </div>

            {/* Simulated Display Card */}
            <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-b from-white/[0.05] to-black/60 border border-white/10 backdrop-blur-xl shadow-2xl">
              
              {/* TAB 1: PEANA DE MESA */}
              {activeTab === 'mesa' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <span className="text-xs font-mono text-orange-brand uppercase tracking-wider block">
                        Mesa 14 · Salón Principal
                      </span>
                      <h3 className="text-lg font-black text-white">Bistró & Cocktails</h3>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      ● Señal NFC Activa
                    </span>
                  </div>

                  <p className="text-xs text-muted-light leading-relaxed">
                    Al apoyar el teléfono sobre la peana en la mesa, el cliente interactúa de forma inmediata sin descargar apps:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setToastMsg('📲 Menú Digital: Abriendo la carta interactiva con fotos, alérgenos y precios en el navegador.')}
                      className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
                    >
                      <span className="text-xl block mb-1">📖</span>
                      <strong className="text-xs text-white block">Carta Digital</strong>
                      <span className="text-[10px] text-muted-dim">Menú y cócteles</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setToastMsg('📶 Wi-Fi Conectado: Red privada de clientes configurada automáticamente sin escribir claves.')}
                      className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
                    >
                      <span className="text-xl block mb-1">📶</span>
                      <strong className="text-xs text-white block">Wi-Fi 1-Tap</strong>
                      <span className="text-[10px] text-muted-dim">Conexión directa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setToastMsg('⭐ Google Maps: Redirigiendo a la ficha de reseñas con 5 estrellas preparadas para publicar.')}
                      className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
                    >
                      <span className="text-xl block mb-1">⭐</span>
                      <strong className="text-xs text-white block">Reseña Google</strong>
                      <span className="text-[10px] text-muted-dim">5 estrellas directas</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: TARJETA VIP DE FIDELIZACIÓN */}
              {activeTab === 'tarjeta' && (
                <div className="space-y-4">
                  {/* Metal Card Visual */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1c1f27] via-[#242833] to-[#12141a] border border-white/20 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-xs font-bold text-teal-brand uppercase tracking-widest">
                        FINDEME VIP LOYALTY
                      </span>
                      <span className="text-lg">💳</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-dim uppercase font-mono block">Socio VIP Nivel Oro</span>
                      <h4 className="text-lg font-black text-white">Rodrigo Valenzuela</h4>
                      <span className="text-xs font-mono text-teal-brand">{points} Puntos Acumulados</span>
                    </div>

                    {/* Stamp progress bar */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-muted-light font-mono text-[10px]">Sellos: {stamps} / 5</span>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                              s <= stamps ? 'bg-teal-brand text-ink font-bold' : 'bg-white/10 text-white/30'
                            }`}
                          >
                            ✓
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddStamp}
                      className="flex-1 py-3 px-4 rounded-xl bg-teal-brand hover:brightness-105 text-ink font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>⚡</span> Simular Tap del Mesero (+Sello)
                    </button>
                  </div>
                </div>
              )}

              {/* Toast Feedback */}
              {toastMsg && (
                <div className="mt-4 p-3 rounded-xl bg-white/10 border border-teal-brand/30 text-teal-brand text-xs font-mono flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-brand animate-ping" />
                  <span>{toastMsg}</span>
                </div>
              )}

            </div>

            {/* Bullet features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="font-bold text-white block mb-0.5">Sin papel ni sellos</span>
                <span className="text-muted-dim">El cliente nunca pierde sus puntos y la marca proyecta prestigio moderno.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="font-bold text-orange-brand block mb-0.5">Control de Clientes</span>
                <span className="text-muted-dim">Métricas de recurrencia en tiempo real integrables con tu sistema POS.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
