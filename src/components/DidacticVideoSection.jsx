import React, { useRef, useEffect, useState } from 'react';

export default function DidacticVideoSection() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // IntersectionObserver: Plays automatically as soon as it enters viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch((err) => {
              console.log('Autoplay deferred:', err);
            });
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.35, // When 35% of the video is visible
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <section 
      id="video-didactico" 
      ref={containerRef}
      className="py-20 lg:py-32 bg-[#07080a] text-white relative overflow-hidden border-t border-b border-white/5"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-teal-brand/15 via-orange-brand/15 to-transparent blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto relative z-10 flex flex-col items-center">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-brand/10 border border-teal-brand/30 text-teal-brand font-mono text-xs uppercase tracking-[0.16em] mb-4">
            <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
            DEMOSTRACIÓN EN VIVO
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] leading-[1.05] uppercase">
            Mira cómo funciona <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-light to-orange-brand">
              en la vida real.
            </span>
          </h2>
        </div>

        {/* Solo el Celular con el Video reproduciéndose automáticamente */}
        <div className="relative flex items-center justify-center">
          
          {/* External phone frame */}
          <div className="w-[300px] sm:w-[350px] aspect-[9/16] rounded-[52px] bg-gradient-to-b from-[#2e313c] via-[#1a1c23] to-[#0c0d12] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.95)] ring-1 ring-white/20 relative">
            
            {/* Screen bezel */}
            <div className="w-full h-full rounded-[42px] overflow-hidden bg-black relative flex flex-col items-center justify-center">
              
              {/* Dynamic Island */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full bg-black z-30 flex items-center justify-between px-3 border border-white/10 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
              </div>

              {/* The Video: Autoplays on viewport entry, muted, loop, playsInline */}
              <video
                ref={videoRef}
                src="/videos/nfc-didactico.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Minimal floating audio toggle button */}
              <button
                type="button"
                onClick={toggleMute}
                className="absolute bottom-4 right-4 z-30 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-mono flex items-center gap-1.5 hover:bg-black/90 transition-all shadow-lg"
                title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
              >
                <span>{isMuted ? '🔇' : '🔊'}</span>
                <span className="text-[10px] uppercase">{isMuted ? 'Muted' : 'Audio ON'}</span>
              </button>

            </div>
          </div>

          {/* Glowing bottom badge */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/90 border border-teal-brand/40 backdrop-blur-xl px-5 py-2 rounded-full text-xs font-mono text-teal-brand shadow-2xl flex items-center gap-2 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
            <span>Reproducción automática en vivo</span>
          </div>

        </div>

      </div>
    </section>
  );
}
