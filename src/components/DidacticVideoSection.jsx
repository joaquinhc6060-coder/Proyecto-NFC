import React, { useState, useRef, useEffect } from 'react';

export default function DidacticVideoSection() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(25);
  const [activeMilestone, setActiveMilestone] = useState(0);

  // Milestones from the user's video
  const milestones = [
    {
      id: 0,
      time: 2,
      label: '01. El Extravío',
      badge: 'Distancia: 1,2 km',
      title: 'Luna salió a explorar y se alejó de casa',
      desc: 'En cuestión de segundos, una mascota puede desorientarse. La distancia crece rápidamente, pero la placa FindeMe permanece en su collar.',
      techPoint: 'Placa pasiva siempre activa sin baterías que puedan descargarse.'
    },
    {
      id: 1,
      time: 9,
      label: '02. La Placa FindeMe',
      badge: 'NFC Contactless',
      title: '¡Acerca tu teléfono aquí!',
      desc: 'Cualquier persona que la encuentre observa la placa física circular. No requiere saber de tecnología: solo acerca su teléfono.',
      techPoint: 'Antena de cobre interna de 13.56 MHz energizada por el propio celular.'
    },
    {
      id: 2,
      time: 17,
      label: '03. Reencuentro Inmediato',
      badge: 'Alerta WhatsApp',
      title: 'Ubicación enviada y llamada directa',
      desc: 'El teléfono del rescatista despliega la ficha con foto, alergias médicas severas y botones para llamar o enviar coordenadas por WhatsApp.',
      techPoint: 'Protocolo web seguro universal: funciona en 100% de iPhones y Android.'
    }
  ];

  // Track video progress and sync active milestone
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    if (time < 8) {
      setActiveMilestone(0);
    } else if (time < 16) {
      setActiveMilestone(1);
    } else {
      setActiveMilestone(2);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 25);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const seekTo = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    videoRef.current.play();
    setIsPlaying(true);
  };

  return (
    <section 
      id="video-didactico" 
      className="py-24 lg:py-36 bg-[#07080a] text-white relative overflow-hidden border-t border-b border-white/5"
    >
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-gradient-to-r from-teal-brand/10 via-orange-brand/10 to-transparent blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-brand/10 border border-teal-brand/30 text-teal-brand font-mono text-xs uppercase tracking-[0.16em] mb-4">
            <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
            DEMOSTRACIÓN DIDÁCTICA EN VIVO
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] leading-[1.05] uppercase">
            Mira cómo funciona <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-light to-orange-brand">
              en la vida real.
            </span>
          </h2>

          <p className="text-muted-light text-base sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            Un recorrido visual paso a paso: desde el extravío de Luna hasta la lectura instantánea y la notificación por WhatsApp enviada al dueño.
          </p>
        </div>

        {/* 2-Column Didactic Console */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
          
          {/* Column 1: Video Player framed in a realistic vertical device */}
          <div className="mx-auto w-[280px] sm:w-[320px] aspect-[9/16] rounded-[48px] bg-gradient-to-b from-[#2e313c] via-[#1a1c23] to-[#0c0d12] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/20 relative group">
            
            {/* Screen bezel */}
            <div className="w-full h-full rounded-[38px] overflow-hidden bg-black relative flex flex-col items-center justify-center">
              
              {/* Dynamic Island */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full bg-black z-30 flex items-center justify-between px-3 border border-white/5 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
              </div>

              {/* The Real Video provided by User */}
              <video
                ref={videoRef}
                src="/videos/nfc-didactico.mp4"
                playsInline
                loop
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
                className="w-full h-full object-cover cursor-pointer"
              />

              {/* Big Play Button Overlay when paused */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 border border-white/30 backdrop-blur-md text-white flex items-center justify-center text-2xl hover:scale-110 transition-all z-20 shadow-2xl"
                  title="Reproducir video"
                >
                  ▶
                </button>
              )}

              {/* Bottom Custom Video Controller Bar */}
              <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 z-20 flex flex-col gap-1.5">
                {/* Progress track */}
                <div 
                  className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer relative"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    seekTo(pos * duration);
                  }}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-teal-brand to-orange-brand transition-all duration-100" 
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-light font-mono px-1">
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={togglePlay}
                      className="hover:text-white transition-colors"
                    >
                      {isPlaying ? '⏸' : '▶'}
                    </button>
                    <button 
                      type="button" 
                      onClick={toggleMute}
                      className="hover:text-white transition-colors text-xs"
                    >
                      {isMuted ? '🔇' : '🔊'}
                    </button>
                  </div>
                  <span>
                    {Math.floor(currentTime).toString().padStart(2, '0')}s / {Math.floor(duration).toString().padStart(2, '0')}s
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Column 2: Interactive Didactic Milestones */}
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-teal-brand block mb-2">
              Sincronización en tiempo real con el video:
            </span>

            {milestones.map((item, idx) => {
              const isActive = activeMilestone === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => seekTo(item.time)}
                  className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer backdrop-blur-md relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-white/[0.08] to-white/[0.03] border-teal-brand/60 shadow-xl shadow-teal-brand/10 scale-[1.02]'
                      : 'bg-white/[0.02] border-white/5 opacity-50 hover:opacity-80 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Active highlight bar */}
                  {isActive && (
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-teal-brand to-orange-brand" />
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-teal-brand tracking-wider uppercase">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-muted-light border border-white/10">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                    {item.title}
                  </h3>

                  <p className="text-sm text-muted-light leading-relaxed mb-3">
                    {item.desc}
                  </p>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 text-xs font-mono text-teal-brand">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-brand" />
                    <span>{item.techPoint}</span>
                  </div>
                </div>
              );
            })}

            <div className="pt-2 flex items-center gap-3 text-xs text-muted-dim font-mono">
              <span className="w-2 h-2 rounded-full bg-orange-brand animate-pulse" />
              <span>Haz clic en cualquier fase para saltar a ese segundo del video.</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
