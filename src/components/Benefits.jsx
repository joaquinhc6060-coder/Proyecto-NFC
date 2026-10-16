import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Benefits() {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  const highlights = [
    {
      title: "CERO BATERÍA",
      subtitle: "Inducción Pasiva",
      desc: "El chip jamás se apaga ni requiere cables. Listo para actuar incluso años después.",
      tag: "Siempre Activo",
      accent: "text-teal-brand border-teal-brand/30 bg-teal-brand/10",
    },
    {
      title: "ACCESO UNIVERSAL",
      subtitle: "Sin Apps",
      desc: "Compatible de fábrica con el 100% de smartphones modernos iOS y Android.",
      tag: "1 Toque",
      accent: "text-orange-brand border-orange-brand/30 bg-orange-brand/10",
    },
    {
      title: "FICHA MÉDICA EN VIVO",
      subtitle: "Sincronizada",
      desc: "Actualiza teléfonos, medicamentos o advertencias de alergias desde la nube al instante.",
      tag: "Nube Cloud",
      accent: "text-teal-brand border-teal-brand/30 bg-teal-brand/10",
    },
    {
      title: "BLINDAJE RESINA IP68",
      subtitle: "Indestructible",
      desc: "Sellado epóxico sumergible, resistente a mordiscos, barro, lluvia y juego extremo.",
      tag: "Grado Militar",
      accent: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(gridRef.current.children, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: 'power2.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="beneficios" 
      className="py-32 lg:py-40 bg-[#07080a] text-white relative overflow-hidden"
    >
      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto relative z-10">
        
        {/* Minimalist Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-teal-brand/10 border border-teal-brand/30 text-teal-brand font-mono text-xs uppercase tracking-[0.16em] mb-4">
            INGENIERÍA DE HARDWARE
          </span>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] leading-[1.05] uppercase">
            Rendimiento Absoluto. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-brand via-white to-orange-brand">
              Cero Mantenimiento.
            </span>
          </h2>
        </div>

        {/* Minimal Bento Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {highlights.map((item, idx) => (
            <div 
              key={idx}
              className="p-8 sm:p-10 rounded-[32px] bg-gradient-to-b from-white/[0.04] to-black/70 border border-white/10 hover:border-white/25 transition-all duration-300 backdrop-blur-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-dim">
                    {item.subtitle}
                  </span>
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full border ${item.accent}`}>
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 group-hover:text-teal-brand transition-colors uppercase">
                  {item.title}
                </h3>

                <p className="text-muted-light text-sm sm:text-base leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-muted-dim">
                <span>FindMe Tech Protocol</span>
                <span className="text-teal-brand">✓</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
