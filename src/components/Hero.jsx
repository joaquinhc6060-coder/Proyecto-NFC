import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef(null);
  const textContentRef = useRef(null);
  const phoneWrapperRef = useRef(null);
  const phoneImgRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animation on page load
      const entranceTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      entranceTl
        .from(textContentRef.current.children, {
          y: 50,
          opacity: 0,
          stagger: 0.15,
          duration: 1.1,
        })
        .from(phoneWrapperRef.current, {
          y: 70,
          opacity: 0,
          scale: 0.92,
          rotationY: -15,
          duration: 1.3,
        }, '-=0.8')
        .from(glowRef.current, {
          scale: 0.6,
          opacity: 0,
          duration: 1.5,
        }, '-=1.2');

      // Scroll-driven cinematic reaction
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        }
      });

      // Text floats up and fades
      scrollTl.to(textContentRef.current, {
        y: -100,
        opacity: 0.2,
        ease: 'none',
      }, 0);

      // Photorealistic iPhone reacts to scroll: cinematic Y rotation and zoom forward
      scrollTl.to(phoneWrapperRef.current, {
        y: -50,
        rotationY: 14,
        rotationX: -6,
        scale: 1.18,
        ease: 'none',
      }, 0);

      scrollTl.to(glowRef.current, {
        scale: 1.4,
        opacity: 0.4,
        ease: 'none',
      }, 0);

    }, heroRef);

    // Interactive 3D tilt on mouse movement
    const handleMouseMove = (e) => {
      if (!phoneWrapperRef.current) return;
      const { innerWidth, innerHeight } = window;
      const xNorm = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const yNorm = (e.clientY / innerHeight - 0.5) * 2;

      gsap.to(phoneWrapperRef.current, {
        rotationY: xNorm * 10,
        rotationX: -yNorm * 8,
        duration: 0.8,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      ctx.revert();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section 
      ref={heroRef}
      id="inicio"
      className="relative overflow-hidden bg-[#07080a] text-white min-h-[92vh] flex items-center pt-24 pb-16 lg:py-32"
    >
      {/* Ambient background lighting */}
      <div 
        ref={glowRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[950px] h-[550px] bg-gradient-to-tr from-orange-brand/20 via-teal-brand/15 to-transparent rounded-full blur-[150px] pointer-events-none will-change-transform" 
      />

      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center relative z-10">
        
        {/* Left Column: High-Impact Typography (Minimalist) */}
        <div ref={textContentRef} className="space-y-6">
          

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.02] tracking-[-0.04em] uppercase">
            Un toque. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-light to-orange-brand">
              Conexión Vital.
            </span>
          </h1>

          <p className="text-muted-light text-lg sm:text-2xl font-light max-w-xl leading-relaxed">
            La placa inteligente con telemetría pasiva instantánea. Cero baterías. Cero suscripciones mensuales.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a 
              href="#contacto" 
              className="inline-flex items-center justify-center font-extrabold px-8 py-4 rounded-full bg-orange-brand text-white hover:bg-orange-hover hover:scale-105 transition-all shadow-xl shadow-orange-brand/25 text-sm tracking-wide"
            >
              Adquirir Placa Vigio
            </a>

            <a 
              href="#demo" 
              className="inline-flex items-center justify-center font-bold px-8 py-4 rounded-full border border-white/20 text-white hover:bg-white/10 hover:border-white transition-all text-sm tracking-wide backdrop-blur-sm"
            >
              Probar Simulador
            </a>
          </div>

          {/* Micro Telemetry Specs */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 text-xs text-muted-dim font-mono">
            <div>
              <span className="text-white font-bold block text-sm">13.56 MHz</span>
              <span>Inducción Pasiva</span>
            </div>
            <div>
              <span className="text-white font-bold block text-sm">0 Baterías</span>
              <span>Siempre Activa</span>
            </div>
            <div>
              <span className="text-white font-bold block text-sm">Universal</span>
              <span>iOS & Android</span>
            </div>
          </div>

        </div>

        {/* Right Column: 100% Real Photorealistic iPhone 16 Pro Titanium Mockup */}
        <div className="relative flex items-center justify-center perspective-cinema">
          <div 
            ref={phoneWrapperRef}
            className="relative w-[320px] sm:w-[380px] lg:w-[420px] aspect-[9/16] will-change-transform preserve-3d cursor-pointer"
          >
            {/* Ambient shadow underneath floating phone */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-black/80 blur-2xl rounded-full pointer-events-none" />

            {/* 100% Photorealistic Studio iPhone Mockup */}
            <img 
              ref={phoneImgRef}
              src="/images/iphone-16-pro-angle.jpg" 
              alt="iPhone 16 Pro Titanium con Ficha de Rescate Vigio" 
              className="w-full h-full object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.85)] rounded-[44px]"
            />

            {/* Subtle floating badge indicator */}
            <div className="absolute -bottom-4 right-2 sm:right-6 bg-black/80 border border-teal-brand/40 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
              <span className="font-mono text-teal-brand font-semibold">NFC Contactless</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
