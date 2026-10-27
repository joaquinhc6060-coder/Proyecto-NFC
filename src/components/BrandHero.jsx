import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

export default function BrandHero() {
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const pillarsRef = useRef(null);

  const productLines = [
    {
      id: 'animales',
      icon: '🐾',
      name: 'Vigio Mascotas',
      target: '/mascotas',
      tagline: 'Ficha médica de urgencia y geolocalización GPS en tiempo real por WhatsApp. Máxima protección para perros y gatos.',
      badge: 'Rescate & GPS',
      accent: 'border-orange-brand/40 text-orange-brand bg-orange-brand/10',
    },
    {
      id: 'ninos',
      icon: '👶',
      name: 'Vigio Kids',
      target: '/kids',
      tagline: 'Seguridad infantil y llamadas de emergencia instantáneas a papá y mamá. Pulseras sumergibles sin batería ni apps.',
      badge: 'Seguridad Infantil',
      accent: 'border-teal-brand/40 text-teal-brand bg-teal-brand/10',
    },
    {
      id: 'restaurantes',
      icon: '🍽️',
      name: 'Vigio Restaurantes',
      target: '/restaurantes',
      tagline: 'Fidelización con IA: pases nativos en Apple y Google Wallet, lectura de boletas y peanas NFC para mesas.',
      badge: 'SaaS & Fidelización IA',
      accent: 'border-amber-400/40 text-amber-300 bg-amber-400/10',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(textRef.current?.children || [], {
        y: 25,
        opacity: 0,
        stagger: 0.08,
        duration: 0.55,
      }).from(pillarsRef.current?.children || [], {
        y: 25,
        opacity: 0,
        stagger: 0.08,
        duration: 0.55,
      }, '-=0.25');

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={heroRef}
      id="inicio"
      className="relative overflow-hidden bg-black text-white min-h-[92vh] flex flex-col justify-center pt-24 pb-20 border-b border-white/5"
    >
      {/* 1. Full-Bleed Cinematic Background Video (Conectando los 3 Mundos: Mascotas, Kids y Restaurantes) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          src="/videos/findeme-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-center opacity-100 scale-100"
        />
        {/* Subtle top gradient to ensure navbar readability */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />
        
        {/* Full subtle contrast overlay for crisp text readability across all video frames */}
        <div className="absolute inset-0 bg-black/45 pointer-events-none" />

        {/* Subtle bottom gradient to blend smoothly into the section below */}
        <div className="absolute bottom-0 inset-x-0 h-80 bg-gradient-to-t from-[#07080a] via-[#07080a]/80 to-transparent pointer-events-none" />
      </div>

      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto relative z-20 flex flex-col items-center text-center">
        
        {/* Main Brand Headline con los colores y formato originales */}
        <div ref={textRef} className="max-w-5xl space-y-4 mb-4 flex flex-col items-center">
          
          {/* Badge Oficial Vigio */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-brand/20 border border-orange-brand/40 text-orange-brand text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_rgba(255,90,38,0.25)]">
            <span className="w-2 h-2 rounded-full bg-orange-brand animate-ping" />
            <span>Vigio · Ecosistema Inteligente NFC</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-[-0.035em] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
            Productos inteligentes y servicios NFC <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-brand via-white to-orange-brand">
              creados para conectar tu mundo.
            </span>
          </h1>

          {/* Nueva descripción universal */}
          <p className="text-zinc-200 text-base sm:text-lg font-normal max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_14px_rgba(0,0,0,1)]">
            En Vigio diseñamos dispositivos físicos con chips NFC y plataformas digitales de respuesta inmediata: seguridad para mascotas, pulseras infantiles y fidelización para comercios.
          </p>
        </div>

        {/* 3 Product Pillars Quick Jump Cards */}
        <div 
          id="productos"
          ref={pillarsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-8 text-left"
        >
          {productLines.map((prod) => (
            <Link
              key={prod.id}
              to={prod.target}
              className="p-8 rounded-[32px] bg-gradient-to-b from-black/70 to-black/95 border border-white/10 hover:border-teal-brand/50 transition-all duration-300 hover:scale-[1.02] backdrop-blur-2xl group flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{prod.icon}</span>
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full border ${prod.accent}`}>
                    {prod.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-brand transition-colors">
                  {prod.name}
                </h3>

                <p className="text-muted-light text-xs sm:text-sm leading-relaxed font-light">
                  {prod.tagline}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-muted-dim group-hover:text-white transition-colors">
                <span>Explorar página dedicada</span>
                <span className="text-teal-brand group-hover:translate-x-1 transition-transform font-bold">→</span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
