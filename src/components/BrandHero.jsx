import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import useMediaQuery from '../hooks/useMediaQuery';

// Medios del hero. TEMPORAL: mientras no exista el video "historia" final se usan el video y
// una foto actuales. Cuando esté listo, reemplazar por:
//   sources: [{ src: '/videos/vigio-historia.webm', type: 'video/webm' },
//             { src: '/videos/vigio-historia.mp4', type: 'video/mp4' }]
//   poster: '/videos/vigio-historia-poster.webp'
const HERO_MEDIA = {
  sources: [{ src: '/videos/vigio-hero.mp4', type: 'video/mp4' }],
  poster: '/images/cinematic-sunset-dog.jpg',
};

// Guion del video: 6 escenas + cierre con logo (sin subtítulo).
// Los tiempos se escalan a la duración real del video, así que basta con que sean proporcionales.
const SCENE_SECONDS = 3.7;
const CLOSING_SECONDS = 2;
const SCENES = [
  'Un descuido…',
  '…y se alejan un momento.',
  'Alguien los encuentra y escanea.',
  'Ve tus datos y te llama al instante.',
  'Te llaman.',
  'Vuelven a casa. Felices.',
];
const TIMELINE_SECONDS = SCENES.length * SCENE_SECONDS + CLOSING_SECONDS;

export default function BrandHero() {
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const videoRef = useRef(null);
  const fillRefs = useRef([]);
  const subtitleRefs = useRef([]);
  const [videoFailed, setVideoFailed] = useState(false);

  const isMobile = useMediaQuery('(max-width: 767px)');
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const staticMode = isMobile || reduceMotion;
  const showVideo = !staticMode && !videoFailed;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(textRef.current?.children || [], {
        y: 25,
        opacity: 0,
        stagger: 0.08,
        duration: 0.55,
        ease: 'power3.out',
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // Subtítulos y barra de progreso sincronizados con la posición del video.
  // Si el video aún no tiene duración (o falló), avanza con un reloj propio.
  useEffect(() => {
    if (staticMode) return undefined;
    let frame;
    let lastScene = -1;
    const startedAt = performance.now();

    const tick = (now) => {
      const video = videoRef.current;
      const hasVideoClock = video && Number.isFinite(video.duration) && video.duration > 0 && video.readyState >= 2;
      const t = hasVideoClock
        ? (video.currentTime / video.duration) * TIMELINE_SECONDS
        : ((now - startedAt) / 1000) % TIMELINE_SECONDS;

      const current = Math.min(Math.floor(t / SCENE_SECONDS), SCENES.length); // SCENES.length = cierre
      if (current !== lastScene) {
        lastScene = current;
        subtitleRefs.current.forEach((subtitle, i) => {
          if (subtitle) subtitle.style.opacity = i === current ? '1' : '0';
        });
      }
      fillRefs.current.forEach((fill, i) => {
        if (!fill) return;
        const progress = i < current ? 1 : i > current ? 0 : (t - i * SCENE_SECONDS) / SCENE_SECONDS;
        fill.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
      });
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [staticMode]);

  return (
    <section
      ref={heroRef}
      id="inicio"
      className="relative flex flex-col justify-center overflow-hidden border-b border-white/5 bg-black pb-12 pt-16 text-white md:min-h-[calc(100svh-var(--vigio-bar-h,0px)-var(--vigio-nav-h,72px))] md:pb-32 md:pt-20"
    >
      {/* Fondo: video en escritorio; solo póster en móvil o con movimiento reducido. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {showVideo ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={HERO_MEDIA.poster}
            onError={() => setVideoFailed(true)}
            className="h-full w-full object-cover object-center"
          >
            {HERO_MEDIA.sources.map(source => (
              <source key={source.src} src={source.src} type={source.type} onError={source === HERO_MEDIA.sources.at(-1) ? () => setVideoFailed(true) : undefined} />
            ))}
          </video>
        ) : (
          <img src={HERO_MEDIA.poster} alt="" className="h-full w-full object-cover object-center" />
        )}
        {/* Velo oscuro (~45 %) para que el título siga legible sobre cualquier escena. */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/55" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#07080a] via-[#07080a]/70 to-transparent" />
      </div>

      <div className="relative z-20 mx-auto flex w-[calc(100%-48px)] max-w-[1240px] flex-col items-center text-center">
        <div ref={textRef} className="flex max-w-4xl flex-col items-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-brand/40 bg-orange-brand/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-brand shadow-[0_0_20px_rgba(255,90,38,0.25)] backdrop-blur-md">
            <span className="h-2 w-2 animate-ping rounded-full bg-orange-brand" />
            <span>Vigio · Ecosistema Inteligente NFC</span>
          </div>

          <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.035em] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] sm:text-6xl lg:text-7xl">
            Un toque y{' '}
            <span className="bg-gradient-to-r from-teal-brand via-white to-orange-brand bg-clip-text text-transparent">
              vuelven a casa.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-200 drop-shadow-[0_2px_14px_rgba(0,0,0,1)] sm:text-lg">
            Placas NFC para mascotas y pulseras para niños. Quien los encuentre escanea, ve tus datos de contacto y te llama. Sin app ni batería.
          </p>

          <div className="flex w-full flex-col items-center justify-center gap-3 pt-3 sm:w-auto sm:flex-row">
            <Link to="/mascotas" className="w-full rounded-xl bg-orange-brand px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-brand/30 transition hover:bg-orange-hover sm:w-auto">
              Proteger a mi mascota
            </Link>
            <Link to="/kids" className="w-full rounded-xl border border-white/25 bg-black/30 px-6 py-3.5 text-sm font-black text-white backdrop-blur-md transition hover:border-teal-brand hover:text-teal-brand sm:w-auto">
              Proteger a mi hijo
            </Link>
          </div>
        </div>

        {/* Móvil / movimiento reducido: la historia como lista corta de pasos. */}
        {staticMode && (
          <ol className="mt-10 grid w-full max-w-xl grid-cols-2 gap-2 text-left text-xs text-zinc-200 sm:grid-cols-3">
            {SCENES.map((text, i) => (
              <li key={text} className="flex items-start gap-2 rounded-xl border border-white/10 bg-black/45 px-3 py-2.5 backdrop-blur-md">
                <span className="mt-px font-mono text-[10px] font-bold text-orange-brand">{i + 1}</span>
                <span className="leading-snug">{text}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Escritorio: subtítulos HTML sincronizados + barra de progreso de 6 segmentos. */}
      {!staticMode && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex flex-col items-center px-6" aria-hidden="true">
          <div className="relative h-9 w-full max-w-3xl">
            {SCENES.map((text, i) => (
              <p
                key={text}
                ref={el => { subtitleRefs.current[i] = el; }}
                style={{ opacity: i === 0 ? 1 : 0 }}
                className="absolute inset-0 text-center text-lg font-semibold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] transition-opacity duration-500 lg:text-xl"
              >
                {text}
              </p>
            ))}
          </div>
          <div className="mt-3 flex w-full max-w-xs gap-1.5">
            {SCENES.map((text, i) => (
              <span key={text} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
                <span ref={el => { fillRefs.current[i] = el; }} className="block h-full origin-left scale-x-0 bg-orange-brand" />
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
