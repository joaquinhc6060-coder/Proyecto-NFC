import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollExpansion() {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);
  const badgesRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Timeline for smooth scroll expansion
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      });

      // Expand card from contained 60% to full 100vw x 100vh viewport
      tl.to(cardRef.current, {
        width: '100vw',
        height: '100vh',
        borderRadius: '0px',
        ease: 'none',
      }, 0);

      // Parallax zoom out inside image for cinematic counter-motion
      tl.fromTo(imageRef.current, {
        scale: 1.25,
        yPercent: -5,
      }, {
        scale: 1.0,
        yPercent: 5,
        ease: 'none',
      }, 0);

      // Reveal text taglines with cinematic opacity and upward drift
      tl.fromTo(textRef.current, {
        opacity: 0,
        y: 60,
      }, {
        opacity: 1,
        y: 0,
        ease: 'power2.out',
      }, 0.25);

      // Reveal telemetry badges
      tl.fromTo(badgesRef.current, {
        opacity: 0,
        y: 40,
      }, {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: 'power2.out',
      }, 0.45);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#07080a]"
    >
      {/* Expanding Cinema Card */}
      <div 
        ref={cardRef}
        className="relative w-[90vw] md:w-[60vw] h-[60vh] md:h-[68vh] rounded-[36px] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.9)] ring-1 ring-white/15 will-change-transform flex items-center justify-center"
      >
        {/* Background Parallax Image */}
        <img 
          ref={imageRef}
          src="/images/cinematic-sunset-dog.jpg" 
          alt="Perro con placa FindMe al atardecer en libertad" 
          className="absolute inset-0 w-full h-full object-cover object-center will-change-transform"
        />

        {/* Cinematic Vignette & Ambient Darkness */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/60 backdrop-brightness-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]" />

        {/* Content Overlay */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white flex flex-col items-center">
          
          <div ref={textRef} className="space-y-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-teal-brand/15 border border-teal-brand/30 text-teal-brand font-mono text-xs uppercase tracking-[0.2em] backdrop-blur-md">
              MANIFIESTO FINDME
            </span>

            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[1.05] uppercase">
              Libertad Absoluta. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-brand via-white to-orange-brand">
                Protección Invisible.
              </span>
            </h2>

            <p className="text-white/80 text-base sm:text-xl font-light max-w-xl mx-auto leading-relaxed pt-2">
              Sin pantallas frágiles. Sin baterías que vigilar. La tecnología desaparece para que ellos disfruten sin límites.
            </p>
          </div>

          {/* Futuristic Micro-Metrics Badges */}
          <div 
            ref={badgesRef} 
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8"
          >
            <div className="px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-xl text-xs font-mono tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-brand animate-pulse" />
              NTAG213 HF · 13.56 MHz
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-xl text-xs font-mono tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-brand" />
              CERO BATERÍA · CERO CARGAS
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-xl text-xs font-mono tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              RESINA MILITAR IP68
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
