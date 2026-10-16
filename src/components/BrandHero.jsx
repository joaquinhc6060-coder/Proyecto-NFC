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
      name: 'FindeMe Animales',
      target: '/mascotas',
      tagline: 'Placas inteligentes para cualquier mascota. Perros, gatos y animales de compañía.',
      badge: 'Telemetría Pasiva',
      accent: 'border-orange-brand/40 text-orange-brand bg-orange-brand/10',
    },
    {
      id: 'ninos',
      icon: '👶',
      name: 'FindeMe Kids',
      target: '/kids',
      tagline: 'Pulseras de silicona sumergibles. Contacto inmediato con padres en parques y playas.',
      badge: 'Seguridad Infantil',
      accent: 'border-teal-brand/40 text-teal-brand bg-teal-brand/10',
    },
    {
      id: 'restaurantes',
      icon: '🍽️',
      name: 'FindeMe Gastro & VIP',
      target: '/restaurantes',
      tagline: 'Peanas de mesa para carta/Wi-Fi y tarjetas metálicas VIP de fidelización de clientes.',
      badge: 'Mesa & Clientes VIP',
      accent: 'border-amber-400/40 text-amber-300 bg-amber-400/10',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(textRef.current, {
        y: 40,
        opacity: 0,
        duration: 1.1,
      }).from(pillarsRef.current.children, {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
      }, '-=0.4');

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={heroRef}
      id="inicio"
      className="relative overflow-hidden bg-black text-white min-h-[92vh] flex flex-col justify-center pt-24 pb-20 border-b border-white/5"
    >
      {/* 1. Full-Bleed Cinematic Background Video (Estilo Fi Tracking) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          src="/videos/nfc-didactico.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-center opacity-35 scale-105"
        />
        {/* Dark Cinematic Gradient Overlay for Maximum Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07080a]/95 via-[#07080a]/75 to-[#07080a] z-10" />
      </div>

      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto relative z-20 flex flex-col items-center text-center">
        
        {/* Main Brand Headline with NO paragraph and NO extra buttons */}
        <div ref={textRef} className="max-w-4xl space-y-4 mb-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.02] tracking-[-0.04em] uppercase">
            Una marca. Tres mundos. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-brand via-white to-orange-brand">
              Conectados por un toque.
            </span>
          </h1>
        </div>

        {/* 3 Product Pillars Quick Jump Cards */}
        <div 
          id="productos"
          ref={pillarsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-10 text-left"
        >
          {productLines.map((prod) => (
            <Link
              key={prod.id}
              to={prod.target}
              className="p-8 rounded-[32px] bg-gradient-to-b from-white/[0.06] to-black/85 border border-white/10 hover:border-teal-brand/50 transition-all duration-300 hover:scale-[1.02] backdrop-blur-2xl group flex flex-col justify-between shadow-2xl"
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
                <span className="text-teal-brand group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
