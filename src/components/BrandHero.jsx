import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function BrandHero() {
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const pillarsRef = useRef(null);

  const productLines = [
    {
      id: 'animales',
      icon: '🐾',
      name: 'FindeMe Animales',
      target: '#animales',
      tagline: 'Placas inteligentes para cualquier mascota. Perros, gatos y animales de compañía.',
      badge: 'Telemetría Pasiva',
      accent: 'border-orange-brand/40 text-orange-brand bg-orange-brand/10',
    },
    {
      id: 'ninos',
      icon: '👶',
      name: 'FindeMe Kids',
      target: '#ninos',
      tagline: 'Pulseras de silicona sumergibles. Contacto inmediato con padres en parques y playas.',
      badge: 'Seguridad Infantil',
      accent: 'border-teal-brand/40 text-teal-brand bg-teal-brand/10',
    },
    {
      id: 'restaurantes',
      icon: '🍽️',
      name: 'FindeMe Gastro & VIP',
      target: '#restaurantes',
      tagline: 'Peanas de mesa para carta/Wi-Fi y tarjetas metálicas VIP de fidelización de clientes.',
      badge: 'Mesa & Clientes VIP',
      accent: 'border-amber-400/40 text-amber-300 bg-amber-400/10',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(textRef.current.children, {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 1.1,
      }).from(pillarsRef.current.children, {
        y: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 1.0,
      }, '-=0.6');

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={heroRef}
      id="inicio"
      className="relative overflow-hidden bg-[#07080a] text-white min-h-[95vh] flex flex-col justify-center pt-28 pb-20 border-b border-white/5"
    >
      {/* Dynamic ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-gradient-to-r from-teal-brand/15 via-orange-brand/15 to-transparent blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto relative z-10 flex flex-col items-center text-center">
        
        {/* Main Brand Headline */}
        <div ref={textRef} className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-teal-brand/10 border border-teal-brand/30 text-teal-brand font-mono text-xs uppercase tracking-[0.18em]">
            <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
            FINDEME · ECOSISTEMA HARDWARE CONTACTLESS
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.02] tracking-[-0.04em] uppercase">
            Una marca. Tres mundos. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-brand via-white to-orange-brand">
              Conectados por un toque.
            </span>
          </h1>

          <p className="text-muted-light text-base sm:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
            Transformamos objetos físicos en canales directos de información y seguridad. Sin baterías, sin descargas de apps y con compatibilidad universal.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <a 
              href="#video-didactico"
              className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-full bg-orange-brand hover:bg-orange-hover text-white text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-brand/25 hover:scale-105"
            >
              <span>▶</span> Ver Video Didáctico
            </a>
            <a 
              href="#productos"
              className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-white text-xs uppercase tracking-wider transition-all backdrop-blur-md"
            >
              Explorar Líneas de Producto ↓
            </a>
          </div>
        </div>

        {/* 3 Product Pillars Quick Jump Cards */}
        <div 
          id="productos"
          ref={pillarsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-16 text-left"
        >
          {productLines.map((prod) => (
            <a
              key={prod.id}
              href={prod.target}
              className="p-8 rounded-[32px] bg-gradient-to-b from-white/[0.05] to-black/60 border border-white/10 hover:border-teal-brand/50 transition-all duration-300 hover:scale-[1.02] backdrop-blur-xl group flex flex-col justify-between"
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
                <span>Ver detalles y simulador</span>
                <span className="text-teal-brand group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
