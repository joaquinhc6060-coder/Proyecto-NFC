import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

export default function BrandHero() {
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const ctaRef = useRef(null);
  const floatingBadgesRef = useRef(null);
  const pillarsRef = useRef(null);

  const productPillars = [
    {
      id: 'mascotas',
      icon: '🐾',
      name: 'FindeMe Mascotas',
      kicker: 'RESCATE & GEOLOCALIZACIÓN',
      target: '/mascotas',
      summary: 'Ficha médica de urgencia, historial veterinario y envío de ubicación GPS en tiempo real por WhatsApp al escanear la placa. Máxima protección para perros y gatos.',
      image: '/images/cinematic-sunset-dog.jpg',
      badgeColor: 'border-orange-brand/30 text-orange-brand bg-orange-brand/10',
      hoverBorder: 'hover:border-orange-brand/50',
      glowColor: 'from-orange-brand/20 via-orange-brand/5 to-transparent',
      features: [
        '📍 Geolocalización GPS por WhatsApp',
        '🏥 Ficha veterinaria y alergias críticas',
        '💧 Acrílico blindado 100% sumergible IP68'
      ],
      ctaText: 'Ver FindeMe Mascotas'
    },
    {
      id: 'kids',
      icon: '🧒',
      name: 'FindeMe Kids',
      kicker: 'TRANQUILIDAD EN LA MUÑECA',
      target: '/kids',
      summary: 'Pulseras inteligentes de silicona hipoalergénica con llamadas de emergencia instantáneas a papá y mamá. Diseñadas para playas, centros comerciales y parques.',
      image: '/images/findme-kids-wristband.jpg',
      badgeColor: 'border-teal-brand/30 text-teal-brand bg-teal-brand/10',
      hoverBorder: 'hover:border-teal-brand/50',
      glowColor: 'from-teal-brand/20 via-teal-brand/5 to-transparent',
      features: [
        '📞 Botones de llamada directa a padres',
        '⚠️ Alergias severas y grupo sanguíneo',
        '🛡️ Silicona médica impermeable sin batería'
      ],
      ctaText: 'Ver FindeMe Kids'
    },
    {
      id: 'restaurantes',
      icon: '🍽️',
      name: 'FindeMe Restaurantes',
      kicker: 'SAAS GASTRONÓMICO + IA',
      target: '/restaurantes',
      summary: 'Fidelización automatizada con IA: pases nativos en Apple y Google Wallet sin descargar apps, lectura OCR de boletas y peanas NFC de mesa con carta y Wi-Fi en 1 toque.',
      image: '/images/findme-restaurant-loyalty.jpg',
      badgeColor: 'border-amber-400/30 text-amber-300 bg-amber-400/10',
      hoverBorder: 'hover:border-amber-400/50',
      glowColor: 'from-amber-400/20 via-amber-400/5 to-transparent',
      features: [
        '📲 Tarjeta VIP nativa en Apple / Google Wallet',
        '🤖 Lectura de boletas con IA y sello antifraude',
        '🛎️ Peanas NFC con carta digital y clave Wi-Fi'
      ],
      ctaText: 'Ver Planes de Restaurantes'
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(textRef.current?.children || [], {
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 1.0,
      })
      .from(ctaRef.current?.children || [], {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
      }, '-=0.5')
      .from(floatingBadgesRef.current?.children || [], {
        scale: 0.85,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
      }, '-=0.6')
      .from(pillarsRef.current?.children || [], {
        y: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
      }, '-=0.3');

    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleScrollToEcosistema = (e) => {
    e.preventDefault();
    const elem = document.getElementById('ecosistema-pilares');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={heroRef}
      id="inicio"
      className="relative overflow-hidden bg-[#07080a] text-white flex flex-col justify-center pt-20 pb-28 border-b border-white/5"
    >
      {/* =========================================================================
          FONDO TECNOLÓGICO DINÁMICO & ONDAS ELECTROMAGNÉTICAS NFC
          ========================================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Luces ambientales envolventes (Teal + Orange Neón) */}
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-teal-brand/15 rounded-full blur-[180px]" />
        <div className="absolute top-1/3 -right-20 w-[550px] h-[550px] bg-orange-brand/15 rounded-full blur-[180px]" />
        <div className="absolute -bottom-20 left-1/3 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[160px]" />

        {/* Cyber Grid y Malla de Frecuencia */}
        <div 
          className="absolute inset-0 opacity-[0.035]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)`,
            backgroundSize: '36px 36px'
          }} 
        />

        {/* Ondas Concéntricas NFC (13.56 MHz Radio Frequency Simulation) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] flex items-center justify-center opacity-25">
          <div className="w-[850px] h-[850px] rounded-full border border-teal-brand/20 animate-[ping_7s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <div className="w-[650px] h-[650px] rounded-full border border-orange-brand/20 animate-[ping_5s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <div className="w-[450px] h-[450px] rounded-full border border-white/10 animate-[ping_3.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
        </div>

        {/* Gradientes de fusión suave superior e inferior */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#07080a] to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#07080a] to-transparent" />
      </div>

      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto relative z-20 flex flex-col items-center text-center">
        
        {/* =========================================================================
            1. ENCABEZADO PRINCIPAL (COPYWRITING UNIVERSAL)
            ========================================================================= */}
        <div ref={textRef} className="max-w-4xl space-y-5 mb-8">
          
          {/* Kicker Badge Tecnológico */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-inner">
            <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
            <span className="text-xs font-mono uppercase tracking-widest text-teal-brand font-bold">
              Ecosistema Inteligente NFC · Cero Apps
            </span>
          </div>

          {/* TÍTULO PRINCIPAL H1 (Universal: Dos líneas, bold con acento en la última palabra) */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.06] tracking-[-0.035em] text-white">
            Conecta tu mundo físico <br />
            a un solo{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-brand via-orange-light to-teal-brand drop-shadow-[0_4px_24px_rgba(255,90,38,0.4)]">
              toque.
            </span>
          </h1>

          {/* SUBTÍTULO DESCRIPTIVO MULTIPRODUCTO */}
          <p className="text-muted-light text-base sm:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            Tecnología NFC y gestión inteligente para proteger a quienes amas y potenciar tu negocio local en segundos. Sin aplicaciones, sin fricción.
          </p>

        </div>

        {/* =========================================================================
            BADGES FLOTANTES DE VISTA PREVIA (LOS 3 MUNDOS EN CONTACTO)
            ========================================================================= */}
        <div 
          ref={floatingBadgesRef}
          className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-10 max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-orange-brand/30 text-xs font-mono text-white/90 backdrop-blur-md shadow-lg">
            <span>🐾</span>
            <span className="text-orange-brand font-bold">Mascotas:</span> GPS Inmediato WhatsApp
          </span>

          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-teal-brand/30 text-xs font-mono text-white/90 backdrop-blur-md shadow-lg">
            <span>🧒</span>
            <span className="text-teal-brand font-bold">Kids:</span> Pulsera Silicona Médica
          </span>

          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-amber-400/30 text-xs font-mono text-white/90 backdrop-blur-md shadow-lg">
            <span>🍽️</span>
            <span className="text-amber-300 font-bold">Restaurantes:</span> Apple & Google Wallet
          </span>
        </div>

        {/* =========================================================================
            BOTONES DE LLAMADA A LA ACCIÓN (CTA EQUILIBRADOS)
            ========================================================================= */}
        <div 
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-8"
        >
          {/* Botón Principal: Explorar Ecosistema */}
          <a
            href="#ecosistema-pilares"
            onClick={handleScrollToEcosistema}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-brand to-orange-hover hover:brightness-110 text-white font-extrabold text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_4px_24px_rgba(255,90,38,0.35)] hover:shadow-[0_6px_30px_rgba(255,90,38,0.5)] active:scale-95 flex items-center justify-center gap-2.5"
          >
            <span>⚡ Explorar Ecosistema</span>
            <span>↓</span>
          </a>

          {/* Botón Secundario: Ver Planes de Restaurantes */}
          <Link
            to="/restaurantes"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 hover:border-amber-400/50 text-white font-bold text-sm uppercase tracking-wider transition-all duration-300 backdrop-blur-xl flex items-center justify-center gap-2.5 active:scale-95 group"
          >
            <span>🍽️ Ver Planes de Restaurantes</span>
            <span className="text-amber-300 group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          {/* Botón Terciario: Activar Dispositivo */}
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-transparent hover:bg-white/[0.04] text-muted-light hover:text-white font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
          >
            <span>🔑 Activar Dispositivo</span>
          </Link>
        </div>

        {/* Micro Indicadores de Confianza */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-muted-dim pt-2 border-t border-white/5 max-w-xl">
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">✓</span> Cero Apps para descargar
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">✓</span> Microchip NTAG213 Pasivo
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">✓</span> 100% iPhone & Android
          </span>
        </div>

        {/* =========================================================================
            3. GRID DE TRES PILARES (MASCOTAS, KIDS, RESTAURANTES)
            ========================================================================= */}
        <div 
          id="ecosistema-pilares" 
          className="w-full max-w-6xl mt-24 pt-16 border-t border-white/10 text-left"
        >
          {/* Título de Sección de los 3 Pilares */}
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-teal-brand font-bold block mb-2">
              Arquitectura de Hardware & Software
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Tres soluciones integrales. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-muted-light">
                Impulsadas por la misma tecnología.
              </span>
            </h2>
          </div>

          {/* Grid de 3 Tarjetas de Alto Contraste */}
          <div 
            ref={pillarsRef}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {productPillars.map((pillar) => (
              <div
                key={pillar.id}
                className={`group relative rounded-[32px] bg-gradient-to-b from-white/[0.05] via-black/70 to-black border border-white/10 ${pillar.hoverBorder} transition-all duration-500 overflow-hidden shadow-2xl flex flex-col justify-between hover:-translate-y-1.5`}
              >
                {/* Glow ambiental interno en hover */}
                <div className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b ${pillar.glowColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div>
                  {/* Imagen Hero de la tarjeta */}
                  <div className="relative h-48 w-full overflow-hidden bg-neutral-900 border-b border-white/10">
                    <img 
                      src={pillar.image} 
                      alt={pillar.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    {/* Badge superior dentro de la foto */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider backdrop-blur-md border ${pillar.badgeColor}`}>
                        {pillar.kicker}
                      </span>
                      <span className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-lg shadow-lg">
                        {pillar.icon}
                      </span>
                    </div>

                    {/* Nombre del pilar al pie de la foto */}
                    <div className="absolute bottom-3 left-5 right-5">
                      <h3 className="text-xl font-black text-white tracking-tight">
                        {pillar.name}
                      </h3>
                    </div>
                  </div>

                  {/* Cuerpo de la tarjeta */}
                  <div className="p-6 space-y-4">
                    <p className="text-muted-light text-xs sm:text-sm leading-relaxed font-light">
                      {pillar.summary}
                    </p>

                    {/* Lista de características clave */}
                    <ul className="space-y-2 pt-2 border-t border-white/5 text-xs font-mono text-white/80">
                      {pillar.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-teal-brand font-bold">›</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer de la tarjeta con Botón de Navegación Dedicado */}
                <div className="p-6 pt-0">
                  <Link
                    to={pillar.target}
                    className="w-full py-3.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 group-hover:border-white/25 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-between group-hover:bg-gradient-to-r group-hover:from-white/10 group-hover:to-white/5 active:scale-95"
                  >
                    <span>{pillar.ctaText}</span>
                    <span className="text-teal-brand group-hover:translate-x-1 transition-transform font-bold text-sm">
                      →
                    </span>
                  </Link>
                </div>

              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
