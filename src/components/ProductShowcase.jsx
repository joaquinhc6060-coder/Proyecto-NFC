import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function ProductShowcase() {
  // 5 Devices in the Vigio Ecosystem
  const devices = [
    {
      id: 0,
      tabTitle: 'Panel del Dueño',
      badge: 'Control Total',
      title: 'Gestión en la Nube',
      subtitle: 'Historial de lecturas y control de estados',
      screenType: 'dashboard',
      gradient: 'from-[#1c1f27] to-[#12141a]',
      content: {
        header: 'Mis Mascotas',
        status: 'Placa NTAG213 Activa',
        reads: '14 lecturas este mes',
        plateId: 'VIGIO-9824-CL'
      }
    },
    {
      id: 1,
      tabTitle: 'Punto de Encuentro',
      badge: 'Ubicación Inmediata',
      title: 'Punto de Escaneo',
      subtitle: 'Ubicación enviada por el rescatista vía WhatsApp',
      screenType: 'map',
      gradient: 'from-[#0d1f1c] to-[#0b1016]',
      content: {
        location: 'Parque Providencia, Santiago',
        coordinates: '-33.4372, -70.6506',
        distance: 'A 350 metros de ti',
        time: 'Detectado hace 2 min'
      }
    },
    {
      id: 2,
      tabTitle: 'Ficha de Rescate NFC',
      badge: 'Escaneo Instantáneo',
      title: 'Un Toque para Volver',
      subtitle: 'Lo que ve quien escanea la placa en su celular',
      screenType: 'profile',
      gradient: 'from-[#2a1b14] to-[#12141a]',
      content: {
        name: 'Luna',
        breed: 'Golden Retriever · 3 años',
        photo: '/images/luna-perfil.jpg',
        emergency: 'Muy dócil y sociable'
      }
    },
    {
      id: 3,
      tabTitle: 'Ficha Médica & Alergias',
      badge: 'Salud y Cuidados',
      title: 'Atención Veterinaria',
      subtitle: 'Indicaciones críticas ante emergencias',
      screenType: 'medical',
      gradient: 'from-[#122328] to-[#0c141a]',
      content: {
        allergies: ['Penicilina', 'Amoxicilina'],
        food: ['Chocolate', 'Uvas', 'Cebolla'],
        vet: 'Clínica Providencia (24/7)'
      }
    },
    {
      id: 4,
      tabTitle: 'Alerta Push en tu Celular',
      badge: 'Notificación Inmediata',
      title: 'Aviso al Dueño',
      subtitle: 'Notificación con el punto de encuentro en tu teléfono',
      screenType: 'notification',
      gradient: 'from-[#1e1726] to-[#100d16]',
      content: {
        msg: '¡Tu placa NFC acaba de ser leída!',
        sub: 'Alguien acercó su celular al collar de Luna en Parque Providencia.',
        time: 'Ahora'
      }
    }
  ];

  // Continuous rotation angle in degrees
  // 0 degrees corresponds to device 2 in front center
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startAngle, setStartAngle] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const requestRef = useRef(null);
  const lastTimeRef = useRef(null);
  const targetAngleRef = useRef(null);

  // Resize listener for responsive 3D radii
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute 3D ellipse radii based on screen size
  const getRadii = () => {
    if (windowWidth < 640) {
      return { rx: 145, rz: 110, ry: 10 };
    } else if (windowWidth < 1024) {
      return { rx: 270, rz: 160, ry: 14 };
    }
    return { rx: 390, rz: 210, ry: 18 };
  };

  const { rx, rz, ry } = getRadii();

  // Continuous animation loop
  // Moving back phones from LEFT to RIGHT:
  // Since x = rx * sin(rad), when in back (cos < 0), if angle increases, sin goes from - to + (left to right)
  const animate = useCallback((time) => {
    if (lastTimeRef.current != null) {
      const delta = time - lastTimeRef.current;
      
      if (targetAngleRef.current !== null) {
        // Smoothly interpolate towards target angle (e.g. after clicking a tab or phone)
        setRotationAngle((prev) => {
          const diff = targetAngleRef.current - prev;
          if (Math.abs(diff) < 0.2) {
            const finalAngle = targetAngleRef.current;
            targetAngleRef.current = null;
            return finalAngle;
          }
          return prev + diff * 0.08;
        });
      } else if (isAutoRotating && !isDragging) {
        // Orbit speed (~0.045 deg per ms -> ~2.7 deg/sec, smooth silky orbit)
        setRotationAngle((prev) => (prev + delta * 0.038) % 360);
      }
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [isAutoRotating, isDragging]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  // Which device is currently closest to the front (cos(angle) closest to 1)?
  const getActiveDeviceIndex = () => {
    let closestIndex = 0;
    let maxZ = -Infinity;

    devices.forEach((_, index) => {
      // Base placement offset for each device
      const baseOffset = (index - 2) * (360 / devices.length);
      const angle = (rotationAngle + baseOffset) % 360;
      const rad = (angle * Math.PI) / 180;
      const z = Math.cos(rad);
      if (z > maxZ) {
        maxZ = z;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const activeDeviceIndex = getActiveDeviceIndex();

  // Rotate a specific device directly to the front center
  const rotateDeviceToFront = (index) => {
    // We want (targetAngle + (index - 2) * 72) % 360 to equal 0
    const desiredTarget = -(index - 2) * (360 / devices.length);
    // Find closest equivalent target to prevent full spin
    const current = rotationAngle;
    const diff = (desiredTarget - current) % 360;
    const normalizedDiff = diff > 180 ? diff - 360 : diff < -180 ? diff + 360 : diff;
    targetAngleRef.current = current + normalizedDiff;
    setIsAutoRotating(false);
  };

  // Next / Prev manual step
  const handleStep = (direction) => {
    const step = (360 / devices.length) * direction;
    targetAngleRef.current = rotationAngle + step;
    setIsAutoRotating(false);
  };

  // Mouse & Touch Drag interactions
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartAngle(rotationAngle);
    targetAngleRef.current = null;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    // Drag horizontally to spin 3D oval
    setRotationAngle(startAngle + deltaX * 0.35);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartAngle(rotationAngle);
    targetAngleRef.current = null;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX;
    setRotationAngle(startAngle + deltaX * 0.35);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <section 
      id="ecosistema" 
      className="py-24 md:py-32 bg-[#0c0d12] text-white relative overflow-hidden border-t border-b border-white/10 select-none"
    >
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-gradient-to-r from-orange-brand/15 via-teal-brand/15 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-teal-brand/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-brand/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1240px] w-[calc(100%-40px)] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] leading-[1.08] text-white">
            Un ecosistema inteligente. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-light to-orange-brand">
              Tranquilidad total.
            </span>
          </h2>

          <p className="text-muted-light text-base sm:text-xl mt-5 max-w-2xl mx-auto leading-relaxed">
            Los dispositivos rotan continuamente en órbita 3D ovalada. Arrastra con el cursor, haz clic en cualquier teléfono para traerlo al frente o pausa la rotación para explorar.
          </p>

          {/* Interactive Feature Pills (Tabs) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8">
            {devices.map((device, index) => {
              const isActive = activeDeviceIndex === index;
              return (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => rotateDeviceToFront(index)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 border ${
                    isActive
                      ? 'bg-orange-brand border-orange-brand text-white shadow-lg shadow-orange-brand/30 scale-105'
                      : 'bg-white/5 border-white/10 text-muted-dim hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-teal-brand'}`} />
                  {device.tabTitle}
                </button>
              );
            })}
          </div>
        </div>

        {/* -------------------------------------------------------------
            THE 3D OVAL / ELLIPTICAL ORBITING CAROUSEL
           ------------------------------------------------------------- */}
        <div 
          className="relative min-h-[580px] sm:min-h-[660px] flex items-center justify-center py-6 cursor-grab active:cursor-grabbing"
          style={{ perspective: '1400px' }}
          onMouseEnter={() => setIsAutoRotating(false)}
          onMouseLeave={() => !isDragging && setIsAutoRotating(true)}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Subtle Orbit Path Ring Guide */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/[0.04] pointer-events-none"
            style={{
              width: `${rx * 2}px`,
              height: `${rz * 1.5}px`,
              transform: 'translate(-50%, -50%) rotateX(68deg)',
            }}
          />

          <div 
            className="relative w-full max-w-[1050px] h-[540px] sm:h-[600px] flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {devices.map((device, index) => {
              // Base angle offset for this device in the 5-point circle
              const baseOffset = (index - 2) * (360 / devices.length);
              const angleDeg = (rotationAngle + baseOffset) % 360;
              const rad = (angleDeg * Math.PI) / 180;

              // 3D Elliptical Orbit Coordinates:
              // X: Left to right
              // Z: Front (+rz) to Back (-rz)
              // In the back (cos(rad) < 0), as angleDeg advances, sin(rad) moves from negative (left) to positive (right)
              const x = rx * Math.sin(rad);
              const z = rz * Math.cos(rad);
              const y = -ry * Math.cos(rad);

              // Scale: 1.02 in front, ~0.74 in back
              const cosZ = Math.cos(rad);
              const scale = 0.88 + 0.14 * cosZ;

              // Angle tilt: facing slightly toward center
              const rotateY = -Math.sin(rad) * 24;

              // Opacity: full in front, subtly dimmed in back to prioritize the foreground phone
              const opacity = cosZ > 0 ? 1 : 0.55 + 0.35 * (cosZ + 1);

              // Z-Index: strictly determined by Z depth to eliminate layering glitches
              const zIndex = Math.round(z + 500);

              const isFront = cosZ > 0.65;

              return (
                <div
                  key={device.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    rotateDeviceToFront(index);
                  }}
                  className="absolute cursor-pointer transition-transform duration-75 will-change-transform"
                  style={{
                    transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}deg) scale(${scale})`,
                    zIndex: zIndex,
                    opacity: opacity,
                  }}
                >
                  {/* Phone Bezel Frame */}
                  <div className={`w-[260px] sm:w-[280px] h-[520px] sm:h-[560px] rounded-[46px] p-3 bg-gradient-to-b from-[#2a2d36] via-[#15171e] to-[#0a0b0e] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ${
                    isFront ? 'ring-teal-brand/70 shadow-teal-brand/20 ring-2' : 'ring-white/10'
                  } transition-all duration-300`}>
                    
                    {/* Inner Screen */}
                    <div className={`w-full h-full rounded-[36px] overflow-hidden bg-gradient-to-b ${device.gradient} text-white flex flex-col relative border border-white/10 shadow-inner`}>
                      
                      {/* Dynamic Island Notch */}
                      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full bg-black z-30 flex items-center justify-end pr-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-brand animate-ping" />
                      </div>

                      {/* Top App Status Header */}
                      <div className="pt-7 px-4 pb-2 flex items-center justify-between text-[10px] text-muted-dim font-medium border-b border-white/5">
                        <span className="font-bold text-white flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16d1b0" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M5 9a9 9 0 0 1 0 6M9 6.5a13 13 0 0 1 0 11M13 4a17 17 0 0 1 0 16" />
                          </svg>
                          FindMe
                        </span>
                        <span className="text-teal-brand font-semibold text-[9px] bg-teal-brand/15 px-1.5 py-0.5 rounded-full">
                          {device.badge}
                        </span>
                      </div>

                      {/* SCREEN 0: DASHBOARD / MI NFC */}
                      {device.screenType === 'dashboard' && (
                        <div className="p-4 flex-1 flex flex-col justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2.5 mb-3">
                              <div className="w-10 h-10 rounded-full bg-orange-brand/20 border border-orange-brand text-orange-brand flex items-center justify-center font-bold text-sm">
                                L
                              </div>
                              <div>
                                <h4 className="font-extrabold text-white text-sm">Placa de Luna</h4>
                                <span className="text-[10px] text-teal-brand font-mono">{device.content.plateId}</span>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 mb-2">
                              <span className="text-[9px] uppercase font-bold text-muted-light block">Estado de la placa</span>
                              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                🟢 Segura en Casa
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                              <span className="text-[9px] uppercase font-bold text-muted-light block">Telemetría NFC</span>
                              <p className="text-white font-semibold text-xs mt-0.5">14 escaneos registrados</p>
                              <span className="text-[9px] text-muted-dim">Chip NTAG213 High Frequency</span>
                            </div>
                          </div>

                          <div className="w-full py-2.5 rounded-xl bg-orange-brand/20 border border-orange-brand/50 text-orange-brand font-bold text-center text-xs">
                            Modo Alerta: Desactivado
                          </div>
                        </div>
                      )}

                      {/* SCREEN 1: UBICACION DEL ESCANEO */}
                      {device.screenType === 'map' && (
                        <div className="relative flex-1 flex flex-col justify-between p-3.5">
                          {/* Grid Map Background Mockup */}
                          <div className="absolute inset-0 bg-[#0a1518] overflow-hidden opacity-90">
                            <svg className="w-full h-full opacity-40" viewBox="0 0 200 300">
                              <path d="M-20 80 Q 80 120 220 70" stroke="#16d1b0" strokeWidth="6" fill="none" />
                              <path d="M30 0 L 150 300" stroke="#5d6370" strokeWidth="4" fill="none" />
                              <circle cx="110" cy="140" r="45" fill="#16d1b0" fillOpacity="0.15" />
                              <path d="M 80 120 Q 110 140 140 130" stroke="#ff5a2e" strokeWidth="3" strokeDasharray="4 2" fill="none" />
                            </svg>

                            {/* Glowing Location Signal Rings */}
                            <div className="absolute top-[44%] left-[52%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                              <span className="absolute -inset-4 rounded-full border-2 border-teal-brand animate-ping opacity-75" />
                              <span className="w-4 h-4 rounded-full bg-teal-brand border-2 border-white block shadow-lg shadow-teal-brand" />
                            </div>
                          </div>

                          {/* Top Location Pill */}
                          <div className="relative z-10 bg-ink/90 backdrop-blur-md p-2 rounded-xl border border-white/15 text-[10px]">
                            <span className="text-teal-brand font-bold uppercase block text-[8px]">Ubicación Compartida</span>
                            <span className="text-white font-semibold">Parque Providencia, Santiago</span>
                          </div>

                          {/* Bottom Card */}
                          <div className="relative z-10 bg-ink/95 backdrop-blur-md p-3 rounded-2xl border border-white/15 space-y-1.5">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-muted-light font-medium">Distancia estimada:</span>
                              <span className="text-teal-brand font-bold">350 metros</span>
                            </div>
                            <div className="w-full py-2 rounded-xl bg-teal-brand text-ink font-bold text-center text-[11px] shadow-sm">
                              Abrir en Google Maps →
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SCREEN 2: FICHA DE RESCATE (THE CORE USER SCREEN) */}
                      {device.screenType === 'profile' && (
                        <div className="flex-1 flex flex-col bg-[#f4ebe1] text-[#12141a] overflow-hidden">
                          {/* Dog Photo */}
                          <div className="relative aspect-[16/11] w-full overflow-hidden bg-cream-secondary">
                            <img 
                              src={device.content.photo} 
                              alt="Luna" 
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1.5 right-2 bg-ink/80 text-white text-[8px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                              FindMe NFC
                            </span>
                          </div>

                          {/* Profile Data */}
                          <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between text-left">
                            <div>
                              <h4 className="text-xl font-black text-ink leading-tight">Luna</h4>
                              <p className="text-xs text-muted font-medium">Golden Retriever · 3 años</p>
                              <p className="text-[10px] text-ink/80 mt-1 line-clamp-2 leading-snug">
                                Muy cariñosa y dócil. Tiene una mancha blanca en el pecho.
                              </p>
                            </div>

                            {/* Contact Action Buttons */}
                            <div className="space-y-1.5 pt-1">
                              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                <div className="py-2 bg-white rounded-lg text-center font-bold border border-black/10 shadow-sm">
                                  📞 Llamar
                                </div>
                                <div className="py-2 bg-[#25D366]/20 text-[#128C7E] rounded-lg text-center font-bold border border-[#25D366]/30">
                                  💬 WhatsApp
                                </div>
                              </div>
                              <div className="w-full py-2 rounded-lg bg-[#a69683] text-white text-[10px] font-bold text-center">
                                📍 Enviar mi ubicación al dueño
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SCREEN 3: FICHA MÉDICA */}
                      {device.screenType === 'medical' && (
                        <div className="p-4 flex-1 flex flex-col justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2 mb-3 text-red-400 font-bold text-[11px]">
                              <span>⚠️</span> Alertas Médicas Severas
                            </div>

                            <div className="space-y-2">
                              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                                <span className="text-[9px] uppercase font-bold text-red-300 block">Alergias a Medicamentos</span>
                                <span className="font-semibold text-white text-[11px]">Penicilina, Amoxicilina</span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <span className="text-[9px] uppercase font-bold text-amber-300 block">Alimentos Prohibidos</span>
                                <span className="font-semibold text-white text-[11px]">Chocolate, Uvas, Cebolla</span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-[9px] uppercase font-bold text-muted-light block">Veterinario de Cabecera</span>
                                <span className="font-semibold text-white text-[11px]">Dr. Soto (+56 9 1122 3344)</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-2 bg-teal-brand/10 border border-teal-brand/30 rounded-xl text-center text-[10px] text-teal-brand font-bold">
                            ✓ Historial sincronizado con Supabase
                          </div>
                        </div>
                      )}

                      {/* SCREEN 4: NOTIFICACIÓN PUSH */}
                      {device.screenType === 'notification' && (
                        <div className="p-4 flex-1 flex flex-col justify-center text-xs">
                          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 shadow-2xl backdrop-blur-md space-y-2">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-extrabold text-teal-brand flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
                                FindMe Notificación
                              </span>
                              <span className="text-muted-light text-[9px]">Ahora</span>
                            </div>

                            <p className="text-white font-bold text-xs leading-snug">
                              ¡Tu placa NFC acaba de ser leída!
                            </p>
                            <p className="text-muted-dim text-[10px] leading-relaxed">
                              Alguien acercó su teléfono a la placa de Luna cerca de Providencia. Toca para ver las coordenadas en el mapa.
                            </p>

                            <div className="pt-1 flex gap-2">
                              <span className="text-[10px] font-bold text-orange-brand">Ver ubicación en vivo →</span>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Orbit Controls Bar (Play/Pause, Step Next/Prev) */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={() => handleStep(-1)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/15 text-white flex items-center justify-center hover:bg-white/15 hover:border-teal-brand transition-all shadow-md"
            title="Girar hacia la izquierda"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-semibold text-muted-light hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <span className={`w-2 h-2 rounded-full ${isAutoRotating ? 'bg-teal-brand animate-pulse' : 'bg-amber-400'}`} />
            {isAutoRotating ? 'Pausar rotación 3D' : 'Reanudar órbita 3D'}
          </button>

          <button
            type="button"
            onClick={() => handleStep(1)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/15 text-white flex items-center justify-center hover:bg-white/15 hover:border-teal-brand transition-all shadow-md"
            title="Girar hacia la derecha"
          >
            ›
          </button>
        </div>

        {/* Feature Highlights Grid Below Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl bg-[#14161f] border border-white/10 hover:border-teal-brand/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-brand/15 text-teal-brand flex items-center justify-center font-bold text-lg mb-3">
              ⚡
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Sin descargas para quien lo encuentra</h4>
            <p className="text-sm text-muted-light leading-relaxed">
              Cualquier smartphone moderno (iOS o Android) abre el perfil instantáneamente al acercarlo a la placa.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#14161f] border border-white/10 hover:border-orange-brand/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-orange-brand/15 text-orange-brand flex items-center justify-center font-bold text-lg mb-3">
              📍
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Ubicación con 1 toque</h4>
            <p className="text-sm text-muted-light leading-relaxed">
              Quien encuentra a tu mascota puede compartirte su ubicación exacta por WhatsApp en segundos.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#14161f] border border-white/10 hover:border-teal-brand/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-brand/15 text-teal-brand flex items-center justify-center font-bold text-lg mb-3">
              🛡️
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Modo Alerta y Privacidad Total</h4>
            <p className="text-sm text-muted-light leading-relaxed">
              Tú decides qué datos mostrar y puedes activar una alarma roja en la placa en caso de extravío.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
