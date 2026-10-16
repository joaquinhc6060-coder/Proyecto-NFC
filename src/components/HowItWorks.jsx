import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  const steps = [
    {
      num: '01',
      tagline: 'EL CONTACTO',
      detail: 'El rescatista acerca su smartphone al collar. La inducción electromagnética despierta el chip en 0.2 segundos.',
      spec: 'NTAG213 High Frequency · 13.56 MHz',
      icon: '⚡',
    },
    {
      num: '02',
      tagline: 'LA TELEMETRÍA',
      detail: 'El navegador abre automáticamente la ficha médica, advertencias de alergias severas y contacto de emergencia.',
      spec: 'Cero apps necesarias · Protocolo Web Universal',
      icon: '📱',
    },
    {
      num: '03',
      tagline: 'EL REENCUENTRO',
      detail: 'Con un solo toque, el rescatista conecta una llamada directa o envía sus coordenadas GPS por WhatsApp.',
      spec: 'Geolocalización Inmediata en 1 Toque',
      icon: '📍',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered reveal on scroll
      gsap.from(cardRefs.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
        y: 60,
        opacity: 0,
        stagger: 0.2,
        duration: 1.1,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="como-funciona" 
      className="py-32 lg:py-40 bg-[#07080a] text-white relative overflow-hidden border-t border-b border-white/5"
    >
      {/* Ambient background lighting */}
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-teal-brand/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto relative z-10">
        
        {/* Section Header: Minimalist & Breathable */}
        <div className="max-w-2xl mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-brand/10 border border-orange-brand/30 text-orange-brand font-mono text-xs uppercase tracking-[0.16em] mb-4">
            PROTOCOLO DE RESCATE
          </span>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] leading-[1.05] uppercase">
            Tres pasos. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-light to-orange-brand">
              Cero Fricción.
            </span>
          </h2>
        </div>

        {/* 3 Large Minimalist Architectural Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div 
              key={step.num}
              ref={(el) => (cardRefs.current[idx] = el)}
              className="relative p-8 sm:p-10 rounded-[32px] bg-gradient-to-b from-white/[0.04] to-black/60 border border-white/10 hover:border-teal-brand/40 transition-all duration-500 backdrop-blur-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-3xl font-black text-white/20 group-hover:text-teal-brand transition-colors">
                    {step.num}
                  </span>
                  <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {step.icon}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white mb-3 tracking-tight group-hover:text-white transition-colors uppercase">
                  {step.tagline}
                </h3>

                <p className="text-muted-light text-sm sm:text-base leading-relaxed font-light">
                  {step.detail}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-2 font-mono text-[11px] text-teal-brand">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-brand" />
                <span>{step.spec}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
