import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function IPhoneShowcase() {
  const containerRef = useRef(null);
  const phoneRef = useRef(null);
  const glowRef = useRef(null);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: 0,
      step: '01',
      title: 'Lectura Instantánea',
      tagline: 'Cualquier teléfono moderno lee la placa en 0.2 segundos sin instalar aplicaciones.',
      badge: 'NFC Pasivo NTAG213',
    },
    {
      id: 1,
      step: '02',
      title: 'Ficha Médica de Urgencia',
      tagline: 'Alergias severas, medicación y contacto del veterinario visibles de inmediato.',
      badge: 'Alerta Veterinaria 24/7',
    },
    {
      id: 2,
      step: '03',
      title: 'Punto de Encuentro GPS',
      tagline: 'El rescatista envía sus coordenadas directamente a tu WhatsApp con un toque.',
      badge: 'Geolocalización Inmediata',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pinned ScrollTrigger animation for the iPhone 3D rotation and zoom
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=200%',
          pin: true,
          scrub: 1.2,
          onUpdate: (self) => {
            const progress = self.progress;
            if (progress < 0.35) {
              setActiveFeature(0);
            } else if (progress < 0.70) {
              setActiveFeature(1);
            } else {
              setActiveFeature(2);
            }
          }
        }
      });

      // Stage 1 -> Stage 2: Rotate and zoom closer
      tl.fromTo(phoneRef.current, {
        rotationY: -20,
        rotationX: 8,
        scale: 0.95,
        y: 30,
      }, {
        rotationY: 0,
        rotationX: 0,
        scale: 1.12,
        y: 0,
        ease: 'power1.inOut',
      }, 0);

      // Stage 2 -> Stage 3: Cinematic Zoom into the screen and slight right tilt
      tl.to(phoneRef.current, {
        rotationY: 18,
        rotationX: -4,
        scale: 1.30,
        y: -20,
        ease: 'power1.inOut',
      }, 0.5);

      // Glow pulsation on scroll
      tl.to(glowRef.current, {
        scale: 1.5,
        opacity: 0.8,
        ease: 'none',
      }, 0.5);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      id="ecosistema"
      className="relative w-full h-screen bg-[#07080a] text-white overflow-hidden flex items-center justify-center border-t border-b border-white/5"
    >
      {/* Background Volumetric Lighting */}
      <div 
        ref={glowRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-r from-teal-brand/15 via-orange-brand/15 to-transparent rounded-full blur-[160px] pointer-events-none will-change-transform" 
      />

      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
        
        {/* Left Column: Photorealistic iPhone 16 Pro Max Mockup reacting to Scroll */}
        <div className="flex items-center justify-center perspective-cinema order-2 lg:order-1">
          <div 
            ref={phoneRef}
            className="relative w-[280px] sm:w-[340px] lg:w-[380px] aspect-[9/16] will-change-transform preserve-3d"
          >
            {/* Real photorealistic iPhone 16 Pro studio render */}
            <img 
              src="/images/iphone-16-pro-front.jpg" 
              alt="iPhone 16 Pro Max mostrando perfil FindMe" 
              className="w-full h-full object-contain rounded-[48px] drop-shadow-[0_30px_70px_rgba(0,0,0,0.95)]"
            />

            {/* Glowing active screen ring */}
            <div className="absolute inset-0 rounded-[48px] ring-1 ring-white/20 pointer-events-none" />
          </div>
        </div>

        {/* Right Column: Dynamic Feature Storytelling driven by Scroll */}
        <div className="space-y-8 order-1 lg:order-2">
          
          <div className="space-y-3">

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] leading-[1.05] uppercase">
              Diseñado para el <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-light to-orange-brand">
                Momento Crítico.
              </span>
            </h2>
          </div>

          {/* Stepper Features */}
          <div className="space-y-4">
            {features.map((feat, idx) => {
              const isActive = activeFeature === idx;
              return (
                <div 
                  key={feat.id}
                  className={`p-6 rounded-2xl border transition-all duration-500 backdrop-blur-md ${
                    isActive 
                      ? 'bg-white/10 border-teal-brand/50 shadow-lg shadow-teal-brand/10 scale-[1.02]' 
                      : 'bg-white/[0.02] border-white/5 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-teal-brand font-bold tracking-widest uppercase">
                      {feat.step} · {feat.badge}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-teal-brand animate-pulse" />
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white mb-1">
                    {feat.title}
                  </h3>

                  <p className="text-muted-light text-sm sm:text-base leading-relaxed">
                    {feat.tagline}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom Scroll Indicator */}
          <div className="flex items-center gap-3 text-xs text-muted-dim font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-brand animate-bounce" />
            <span>Desplaza hacia abajo para acercar el dispositivo en 3D</span>
          </div>

        </div>

      </div>
    </section>
  );
}
