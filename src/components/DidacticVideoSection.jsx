import React, { useRef, useEffect, useState } from 'react';
import RealIPhoneDevice from './RealIPhoneDevice';

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
        threshold: 0.25, // When 25% of the video is visible
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
        <div className="text-center max-w-3xl mx-auto mb-12">

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] leading-[1.05] uppercase">
            Con Vigio, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-light to-orange-brand">
              tu mascota se sentirá más segura.
            </span>
          </h2>

          <p className="text-muted-light text-base sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed font-light">
            Rescate inmediato en 1 toque: cualquier persona acerca su smartphone a la placa para acceder al instante a tu contacto telefónico, chat de WhatsApp con GPS y ficha médica en vivo.
          </p>
        </div>

        {/* Solo el Celular REAL con el Video reproduciéndose automáticamente */}
        <div className="relative flex flex-col items-center justify-center">
          
          <RealIPhoneDevice>
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
              className="absolute bottom-5 right-4 z-40 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-mono flex items-center gap-1.5 hover:bg-black transition-all shadow-xl"
              title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            >
              <span>{isMuted ? '🔇' : '🔊'}</span>
              <span className="text-[10px] uppercase font-bold">{isMuted ? 'Muted' : 'Audio ON'}</span>
            </button>
          </RealIPhoneDevice>



        </div>

      </div>
    </section>
  );
}
