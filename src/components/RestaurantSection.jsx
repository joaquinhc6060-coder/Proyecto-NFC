import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function RestaurantSection() {
  const [activeTab, setActiveTab] = useState('tarjeta'); // 'mesa' | 'tarjeta'
  const [points, setPoints] = useState(450);
  const [stamps, setStamps] = useState(4);
  const [toastMsg, setToastMsg] = useState('');
  const [isScanningSim, setIsScanningSim] = useState(false);

  const handleAddStamp = () => {
    if (stamps < 5) {
      setStamps(stamps + 1);
      setPoints(points + 50);
      setToastMsg('¡Sello digital sumado! +50 puntos en tu tarjeta VIP.');
    } else {
      setToastMsg('¡Felicidades! Completaste tus sellos. Tienes 1 consumición gratis.');
    }
  };

  const handleSimulateAIScan = () => {
    setIsScanningSim(true);
    setToastMsg('🤖 Escaneando boleta con IA: Detectando productos y verificando antifraude...');
    setTimeout(() => {
      setIsScanningSim(false);
      if (stamps < 5) {
        setStamps((prev) => Math.min(prev + 1, 5));
        setPoints((prev) => prev + 50);
      }
      setToastMsg('✓ Boleta validada por IA: 2x Pizzas Artesanales + 2x Cócteles Autor (+1 Sello acreditado).');
    }, 1400);
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
        
        {/* Top Header & SaaS Direct Access Button */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] leading-[1.05] uppercase">
              Experiencia en mesa y fidelización. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-light to-orange-brand">
                Un toque, clientes cautivos.
              </span>
            </h2>

            <p className="text-muted-light text-base sm:text-xl font-light mt-4 max-w-2xl leading-relaxed">
              Pases nativos en Apple & Google Wallet sin apps, lectura automática de boletas con Inteligencia Artificial y marketing automatizado para el restaurante.
            </p>
          </div>

          {/* BOTÓN DESTACADO: ACCESO CLIENTES / DASHBOARD RESTAURANTE */}
          <div className="shrink-0">
            <Link
              to="/dashboard-restaurante"
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-gradient-to-r from-orange-brand/20 via-orange-brand/10 to-transparent hover:from-orange-brand/30 border border-orange-brand/40 text-white font-mono text-xs font-bold transition-all shadow-[0_0_25px_rgba(255,90,38,0.25)] group hover:scale-[1.02]"
            >
              <span className="w-7 h-7 rounded-full bg-orange-brand text-ink flex items-center justify-center text-sm font-black shadow-md">
                👤
              </span>
              <span className="tracking-wide">Acceso Clientes / Dashboard Restaurante</span>
              <span className="text-orange-brand group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
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
                ✓ Apple & Google Wallet Native
              </span>
              <span className="bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-white/90">
                100% Sin Descargar Apps
              </span>
            </div>
          </div>

          {/* Column 2: Dual Interactive Simulator (Mesa vs Tarjeta VIP) */}
          <div className="space-y-6">
            
            {/* Mode Switcher Pills */}
            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 max-w-md">
              <button
                type="button"
                onClick={() => { setActiveTab('tarjeta'); setToastMsg(''); }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'tarjeta'
                    ? 'bg-teal-brand text-ink font-black shadow-md'
                    : 'text-muted-light hover:text-white'
                }`}
              >
                💳 Tarjeta VIP Loyalty (Wallet)
              </button>
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

              {/* TAB 2: TARJETA VIP DE FIDELIZACIÓN (CON BOTONES APPLE/GOOGLE WALLET Y SUBIDA DE BOLETA IA) */}
              {activeTab === 'tarjeta' && (
                <div className="space-y-4">
                  {/* Metal Card Visual */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1c1f27] via-[#242833] to-[#12141a] border border-white/20 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-teal-brand uppercase tracking-widest">
                        FINDEME VIP LOYALTY
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        ● Pase Nativo
                      </span>
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
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                              s <= stamps ? 'bg-gradient-to-br from-[#10B981] to-[#00E599] text-black font-black shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/10 text-white/30'
                            }`}
                          >
                            ✓
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 1. BOTONES OFICIALES SIMULADOS: APPLE WALLET & GOOGLE WALLET */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setToastMsg('🍏 Apple Wallet: Pase .pkpass generado. Notificaciones y Geofencing activos en tu iPhone.')}
                      className="py-2.5 px-3 rounded-xl bg-black hover:bg-neutral-900 border border-white/20 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                    >
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 170 170">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.84-10.4-12.22-22.37-16.14-35.91-3.92-13.54-5.88-26.17-5.88-37.89 0-14.7 3.59-26.69 10.77-35.96 7.18-9.27 16.29-14.01 27.33-14.22 4.48 0 9.8 1.25 15.96 3.75 6.16 2.5 10.15 3.78 11.96 3.84 1.55 0 5.69-1.33 12.42-3.99 6.73-2.66 12.06-3.87 16-3.63 11.85.87 21.09 5.38 27.72 13.53-10.36 6.31-15.43 14.92-15.22 25.83.21 8.59 3.48 15.82 9.8 21.69 6.32 5.87 13.82 9.29 22.5 10.26-1.96 5.87-4.35 11.69-7.18 17.47zM119.22 31.84c0-7.39 2.66-14.46 7.98-21.21 5.32-6.75 11.96-10.63 19.92-11.63.22 1.3.33 2.5.33 3.6 0 7.39-2.77 14.57-8.31 21.54-5.54 6.97-12.16 10.87-19.86 11.7-.06-1.3-.06-2.63-.06-4z"/>
                      </svg>
                      <span>Añadir a Apple Wallet</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setToastMsg('💳 Google Wallet: Pase añadido en Android. Notificaciones geográficas sincronizadas.')}
                      className="py-2.5 px-3 rounded-xl bg-black hover:bg-neutral-900 border border-white/20 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                    >
                      <span className="text-sm">💳</span>
                      <span>Guardar en Google Wallet</span>
                    </button>
                  </div>

                  {/* 2. BOTÓN DE ACCIÓN: SUBIR BOLETA PARA SUMAR SELLO (IA) */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSimulateAIScan}
                      disabled={isScanningSim}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-brand to-[#FF6D3B] hover:brightness-110 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,90,38,0.3)] active:scale-95"
                    >
                      <span>🧾</span>
                      <span>{isScanningSim ? 'Procesando con IA...' : 'Subir Boleta para Sumar Sello (IA)'}</span>
                    </button>

                    <Link
                      to="/restaurante/bistro-costanera/mi-tarjeta"
                      className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-mono text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Ver Vista Móvil</span>
                      <span>↗</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Toast Feedback */}
              {toastMsg && (
                <div className="mt-4 p-3 rounded-xl bg-white/10 border border-teal-brand/30 text-teal-brand text-xs font-mono flex items-center gap-2 animate-fadeIn">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-brand animate-ping" />
                  <span>{toastMsg}</span>
                </div>
              )}

            </div>

            {/* Bullet features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="font-bold text-white block mb-0.5">Pases Nativos & Push</span>
                <span className="text-muted-dim">Notificaciones a la pantalla de bloqueo y alertas por cercanía georreferenciadas.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="font-bold text-orange-brand block mb-0.5">Perfilamiento IA por Boletas</span>
                <span className="text-muted-dim">Aprende automáticamente qué consumen tus clientes para enviar ofertas hiper-personalizadas.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
