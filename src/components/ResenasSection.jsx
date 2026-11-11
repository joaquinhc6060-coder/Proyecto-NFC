import React, { useCallback, useEffect, useRef, useState } from 'react';
import data from '../data/resenas.json';
import useMediaQuery from '../hooks/useMediaQuery';
import { clampEstrellas, datosEstructurados, enlaceWhatsApp, formatoFecha, iniciales, resumenCalificacion } from '../lib/resenas';

const AUTOPLAY_MS = 5000;
const RESUME_AFTER_MS = 4000;

const Star = ({ filled }) => (
  <svg className={`h-4 w-4 ${filled ? 'text-orange-brand' : 'text-white/20'}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.8l-5.1 2.6 1-5.6-4.1-4 5.7-.8z" />
  </svg>
);

const CheckBadge = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="10" cy="10" r="8" /><path d="m6.5 10.2 2.3 2.3 4.7-4.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowIcon = ({ dir }) => (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === 'left' ? 'M12.5 4.5 7 10l5.5 5.5' : 'M7.5 4.5 13 10l-5.5 5.5'} />
  </svg>
);

const PauseIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><rect x="5" y="4" width="3.5" height="12" rx="1" /><rect x="11.5" y="4" width="3.5" height="12" rx="1" /></svg>
);
const PlayIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6 4.2v11.6a.8.8 0 0 0 1.2.7l9.2-5.8a.8.8 0 0 0 0-1.4L7.2 3.5A.8.8 0 0 0 6 4.2Z" /></svg>
);

function ReviewCard({ review }) {
  const estrellas = clampEstrellas(review.estrellas);
  const fecha = formatoFecha(review.fecha);
  return (
    <article className="relative flex h-full flex-col rounded-[22px] border border-white/10 bg-[#121316] px-6 pb-6 pt-8 shadow-xl">
      <span className="absolute right-0 top-0 rounded-bl-xl rounded-tr-[21px] border-b border-l border-orange-brand/30 bg-orange-brand/15 px-3 py-1 text-[11px] font-bold text-orange-light">
        Compró: {review.producto}
      </span>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex gap-0.5" role="img" aria-label={`${estrellas} de 5 estrellas`}>
          {[1, 2, 3, 4, 5].map(n => <Star key={n} filled={n <= estrellas} />)}
        </div>
        {review.verificada === true && (
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-teal-brand"><CheckBadge /> Compra verificada</span>
        )}
      </div>
      <blockquote className="mt-5 flex-1 text-[16px] font-semibold leading-relaxed text-white sm:text-[17px]">“{review.texto}”</blockquote>
      <footer className="mt-6 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-brand/15 text-sm font-black text-orange-brand ring-1 ring-orange-brand/30">
          {review.foto ? <img src={review.foto} alt={`Foto de ${review.nombre}`} width="44" height="44" loading="lazy" className="h-full w-full object-cover" /> : iniciales(review.nombre)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-black text-white">{review.nombre}</p>
          <p className="truncate text-xs text-zinc-400">{review.ciudad}{fecha ? ` · ${fecha}` : ''}</p>
        </div>
      </footer>
    </article>
  );
}

export default function ResenasSection() {
  const reviews = data.resenas || [];
  const count = reviews.length;
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const loop = count > 3; // con 3 o menos: todas en fila, sin giro ni copias
  const autoplayAllowed = loop && !reduceMotion;
  const items = loop ? [...reviews, ...reviews] : reviews;

  const trackRef = useRef(null);
  const indexRef = useRef(0);
  const settleTimer = useRef(null);
  const [current, setCurrent] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [pageHidden, setPageHidden] = useState(typeof document !== 'undefined' && document.hidden);
  const [lastInteraction, setLastInteraction] = useState(0);

  const cardLeft = useCallback(index => {
    const cards = trackRef.current?.children;
    if (!cards?.[index]) return 0;
    return cards[index].offsetLeft - cards[0].offsetLeft;
  }, []);

  const scrollToIndex = useCallback((index, smooth = true) => {
    const track = trackRef.current;
    if (!track) return;
    indexRef.current = index;
    track.scrollTo({ left: cardLeft(index), behavior: smooth && !reduceMotion ? 'smooth' : 'instant' });
    setCurrent(index % count);
  }, [cardLeft, count, reduceMotion]);

  // Al terminar un desplazamiento (automático o con el dedo): fijar el índice y, si quedó
  // en la copia del final, volver al original sin salto visible (mismo contenido en pantalla).
  const onScroll = () => {
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const track = trackRef.current;
      if (!track) return;
      const positions = [...track.children].map((_, i) => Math.abs(cardLeft(i) - track.scrollLeft));
      let index = positions.indexOf(Math.min(...positions));
      if (loop && index >= count) {
        index -= count;
        track.scrollTo({ left: cardLeft(index), behavior: 'instant' });
      }
      indexRef.current = index;
      setCurrent(index);
    }, 140);
  };

  const next = useCallback(() => scrollToIndex(indexRef.current + 1), [scrollToIndex]);
  const prev = useCallback(() => {
    if (loop && indexRef.current === 0) {
      trackRef.current?.scrollTo({ left: cardLeft(count), behavior: 'instant' });
      indexRef.current = count;
    }
    scrollToIndex(Math.max(0, indexRef.current - 1));
  }, [loop, count, cardLeft, scrollToIndex]);

  const markInteraction = () => setLastInteraction(Date.now());

  // Pausa cuando la pestaña no está visible.
  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Giro automático cada 5 s. Se detiene con mouse encima, foco de teclado, pestaña oculta
  // o pausa manual; tras tocar/arrastrar espera 4 s de inactividad antes de volver a contar.
  useEffect(() => {
    if (!autoplayAllowed || userPaused || hovering || focusWithin || pageHidden) return undefined;
    const idleWait = Math.max(0, lastInteraction + RESUME_AFTER_MS - Date.now());
    const timer = setTimeout(next, idleWait + AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [autoplayAllowed, userPaused, hovering, focusWithin, pageHidden, lastInteraction, current, next]);

  useEffect(() => () => clearTimeout(settleTimer.current), []);

  if (data.mostrarSeccion === false || !count) return null;

  const resumen = resumenCalificacion(reviews);
  const schema = datosEstructurados(reviews);
  const playing = autoplayAllowed && !userPaused;
  const controlClass = 'flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition hover:border-orange-brand hover:text-orange-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-white';

  return (
    <section id="resenas" aria-labelledby="resenas-titulo" className="overflow-hidden bg-[#07080a] px-5 py-16 text-white sm:px-6 sm:py-24">
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />}
      <div className="mx-auto max-w-[1240px]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-orange-brand sm:text-xs">{data.eyebrow}</p>
          <h2 id="resenas-titulo" className="mt-3 text-[2rem] font-black leading-[1.05] tracking-[-0.035em] sm:text-5xl">{data.title}</h2>
          {resumen && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-orange-brand/30 bg-orange-brand/10 px-4 py-1.5 text-sm font-bold">
              <Star filled /> {resumen.texto}
            </p>
          )}
        </div>

        <div
          role="region"
          aria-roledescription="carrusel"
          aria-label="Opiniones de clientes"
          className="relative mt-10 sm:mt-12"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => { setHovering(false); markInteraction(); }}
          onFocus={() => setFocusWithin(true)}
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) { setFocusWithin(false); markInteraction(); } }}
          onPointerDown={markInteraction}
          onTouchStart={markInteraction}
          onWheel={markInteraction}
        >
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="vigio-carousel -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:gap-6 lg:scroll-px-0 lg:px-0"
          >
            {items.map((review, i) => {
              const clone = i >= count;
              return (
                <div
                  key={`${i}-${review.nombre}`}
                  className="w-[90%] shrink-0 snap-start sm:w-[calc((100%-16px)/2)] lg:w-[calc((100%-48px)/3)]"
                  aria-hidden={clone ? 'true' : undefined}
                  inert={clone ? '' : undefined}
                  role={clone ? undefined : 'group'}
                  aria-roledescription={clone ? undefined : 'reseña'}
                  aria-label={clone ? undefined : `${(i % count) + 1} de ${count}`}
                >
                  <ReviewCard review={review} />
                </div>
              );
            })}
          </div>

          {loop && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button type="button" onClick={() => { markInteraction(); prev(); }} aria-label="Reseña anterior" className={`${controlClass} hidden lg:flex`}><ArrowIcon dir="left" /></button>
              <div className="flex items-center gap-1">
                {reviews.map((review, i) => (
                  <button
                    key={`dot-${i}`}
                    type="button"
                    onClick={() => { markInteraction(); scrollToIndex(i); }}
                    aria-label={`Ir a la reseña ${i + 1} de ${count}`}
                    aria-current={i === current ? 'true' : undefined}
                    className="flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <span className={`block h-2 rounded-full transition-all ${i === current ? 'w-6 bg-orange-brand' : 'w-2 bg-white/25'}`} />
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => { markInteraction(); next(); }} aria-label="Reseña siguiente" className={`${controlClass} hidden lg:flex`}><ArrowIcon dir="right" /></button>
              {autoplayAllowed && (
                <button
                  type="button"
                  onClick={() => setUserPaused(p => !p)}
                  aria-label={playing ? 'Pausar el giro automático' : 'Reanudar el giro automático'}
                  aria-pressed={!playing}
                  className={`${controlClass} ml-1`}
                >
                  {playing ? <PauseIcon /> : <PlayIcon />}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={enlaceWhatsApp(data.whatsapp, data.whatsappMensaje)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-black text-white transition hover:border-teal-brand hover:text-teal-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {data.botonResena}
          </a>
        </div>
      </div>
    </section>
  );
}
