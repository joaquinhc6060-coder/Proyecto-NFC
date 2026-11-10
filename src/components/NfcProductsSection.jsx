import React, { useEffect, useRef, useState } from 'react';
import content from '../data/homeNfcSection.json';

const DropIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3.5c3.6 4.4 6 7.7 6 10.6A6 6 0 0 1 6 14.1c0-2.9 2.4-6.2 6-10.6Z" />
  </svg>
);
const PhoneIcon = () => (
  <svg className="h-[1.1em] w-[1.1em] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 4h3.5l1.7 4.3-2.1 1.4a11 11 0 0 0 6.2 6.2l1.4-2.1L20 15.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />
  </svg>
);

// Aparece con fundido y leve desplazamiento al entrar en pantalla (sin animación si se pide movimiento reducido).
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) { el.classList.add('is-visible'); return undefined; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('is-visible'); observer.disconnect(); }
    }, { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function scrollToTarget(event, target) {
  const el = document.querySelector(target);
  if (!el) return;
  event.preventDefault();
  const header = document.querySelector('header');
  const offset = header ? header.getBoundingClientRect().bottom : 0;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (window.vigioLenis) {
    window.vigioLenis.scrollTo(el, { offset: -offset, immediate: reduce });
  } else {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: reduce ? 'auto' : 'smooth' });
  }
}

// Pantallas de ejemplo en HTML (se usan mientras no existan las capturas reales).
// Todo se mide en "em" sobre una base relativa al ancho del celular (cqw).
function DemoProfile({ data }) {
  return (
    <div className="flex h-full flex-col items-center bg-gradient-to-b from-[#1c1d22] to-[#111216] px-[0.9em] pt-[2.6em] text-center text-white">
      <div className="h-[5.2em] w-[5.2em] overflow-hidden rounded-full ring-[0.15em] ring-orange-brand">
        <img src={data.photo} alt={data.photoAlt} width="160" height="160" loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: '50% 30%' }} />
      </div>
      <p className="mt-[0.6em] text-[1.35em] font-black leading-none">{data.name}</p>
      <div className="mt-[1em] w-full space-y-[0.5em]">
        {data.contacts.map((label, i) => (
          <div key={label} className={`flex items-center justify-center gap-[0.4em] whitespace-nowrap rounded-[0.7em] py-[0.6em] text-[0.82em] font-bold ${i === 0 ? 'bg-orange-brand' : 'border border-white/25'}`}>
            <PhoneIcon /> {label}
          </div>
        ))}
      </div>
      <div className="mt-[0.9em] flex gap-[0.3em]">
        {data.chips.map(chip => (
          <span key={chip} className="whitespace-nowrap rounded-full border border-teal-brand/40 bg-teal-brand/10 px-[0.5em] py-[0.15em] text-[0.62em] font-bold text-teal-brand">{chip}</span>
        ))}
      </div>
    </div>
  );
}

function DemoPanel({ data }) {
  return (
    <div className="flex h-full flex-col bg-[#f4f4f6] px-[0.9em] pt-[2.4em] text-left text-zinc-900">
      <p className="text-[1.05em] font-black">{data.title}</p>
      <div className="mt-[0.7em] flex items-center gap-[0.6em] rounded-[0.7em] bg-white p-[0.55em] shadow-sm">
        <div className="h-[2.6em] w-[2.6em] shrink-0 overflow-hidden rounded-full">
          <img src={content.demoProfile.photo} alt="" width="80" height="80" loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: '50% 30%' }} />
        </div>
        <span className="text-[0.72em] font-bold text-orange-brand">Cambiar foto</span>
      </div>
      <div className="mt-[0.6em] space-y-[0.45em]">
        {data.fields.map(field => (
          <div key={field.label} className="rounded-[0.6em] bg-white px-[0.6em] py-[0.4em] shadow-sm">
            <p className="text-[0.58em] font-semibold uppercase tracking-wide text-zinc-500">{field.label}</p>
            <p className="whitespace-nowrap text-[0.78em] font-bold">{field.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-[0.45em] flex items-center gap-[0.5em] rounded-[0.6em] bg-white px-[0.6em] py-[0.45em] shadow-sm">
        <span className="flex h-[1.6em] w-[1.6em] items-center justify-center rounded-full bg-orange-brand text-[0.7em] text-white" aria-hidden="true">▶</span>
        <span className="flex-1 text-[0.7em] font-bold">{data.audioLabel}</span>
        <span className="text-[0.62em] text-zinc-500">{data.audioLength}</span>
      </div>
      <div className="mt-auto mb-[1.2em] rounded-[0.7em] bg-orange-brand py-[0.6em] text-center text-[0.8em] font-black text-white">{data.save}</div>
    </div>
  );
}

// Celular de marco negro (HTML/CSS). Muestra la captura si existe; si no, la pantalla de ejemplo.
function PhoneMockup({ image, fallback, rotate, className }) {
  const [useFallback, setUseFallback] = useState(false);
  return (
    <div className={`absolute top-0 w-[49%] ${className}`} style={{ transform: `rotate(${rotate}deg)` }}>
      <div className="rounded-[13%/6.2%] bg-black p-[3.2%] shadow-[0_30px_50px_-16px_rgba(0,0,0,0.9)] ring-1 ring-white/15">
        <div className="relative overflow-hidden rounded-[11%/5.2%] bg-zinc-900" style={{ aspectRatio: '9 / 19.5', containerType: 'inline-size' }}>
          <span className="absolute left-1/2 top-[1.8%] z-10 h-[3.2%] w-[34%] -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
          {!useFallback ? (
            <img src={image.src} alt={image.alt} width="540" height="1170" loading="lazy" onError={() => setUseFallback(true)} className="h-full w-full object-cover object-top" />
          ) : (
            <div role="img" aria-label={image.alt} className="h-full" style={{ fontSize: '7.4cqw' }}>{fallback}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Composición cenital: dos celulares inclinados y la placa al centro con ondas NFC.
function FlatLay() {
  const { images } = content;
  return (
    <div className="relative mx-auto w-full max-w-[305px] sm:max-w-[500px] lg:max-w-[520px]" style={{ aspectRatio: '1 / 1.12' }}>
      <PhoneMockup image={images.profileScreen} fallback={<DemoProfile data={content.demoProfile} />} rotate={-8} className="left-[3%]" />
      <PhoneMockup image={images.editScreen} fallback={<DemoPanel data={content.demoPanel} />} rotate={8} className="right-[3%] top-[3%]" />

      <div className="absolute bottom-[-4%] left-1/2 z-10 w-[36%] -translate-x-1/2">
        <div className="relative aspect-square">
          {/* Ondas NFC desde el disco de la placa (máx. 3 aros) */}
          <div className="pointer-events-none absolute left-1/2 top-[69%] h-0 w-0" aria-hidden="true">
            {[0, 1, 2].map(i => (
              <span key={i} className="vigio-flat-wave absolute left-0 top-0 aspect-square w-[min(44vw,190px)] rounded-full border-2 border-orange-brand/75" style={{ animationDelay: `${i * 1.3}s` }} />
            ))}
          </div>
          <img src={images.plate.src} alt={images.plate.alt} width={images.plate.width} height={images.plate.height} loading="lazy" className="relative h-full w-full object-contain drop-shadow-[0_22px_26px_rgba(0,0,0,0.75)]" />
        </div>
      </div>
    </div>
  );
}

function ActionRow({ className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-brand/40 bg-black/40 px-3 py-2 text-xs font-bold text-teal-brand backdrop-blur">
        <DropIcon /> {content.waterChip}
      </span>
      <a
        href={content.cta.target}
        onClick={event => scrollToTarget(event, content.cta.target)}
        className="inline-flex items-center gap-2 rounded-xl bg-orange-brand px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-brand/30 transition hover:bg-orange-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {content.cta.label} <span aria-hidden="true">↓</span>
      </a>
    </div>
  );
}

export default function NfcProductsSection() {
  const { images } = content;
  const textRef = useReveal();
  const visualRef = useReveal();

  return (
    <section aria-labelledby="nfc-productos-titulo" className="relative overflow-hidden bg-[#121316] text-white">
      {/* Fondo: parque al atardecer desenfocado; versión vertical en móvil y horizontal en escritorio. */}
      <picture className="absolute inset-0" aria-hidden="true">
        <source media="(min-width: 1024px)" srcSet={images.backgroundDesktop.src} width={images.backgroundDesktop.width} height={images.backgroundDesktop.height} />
        <img src={images.backgroundMobile.src} alt="" width={images.backgroundMobile.width} height={images.backgroundMobile.height} loading="lazy" className="h-full w-full object-cover" />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/65 lg:bg-gradient-to-r lg:from-black/85 lg:via-black/55 lg:to-black/30" aria-hidden="true" />

      {/* Borde superior curvo que separa la sección del hero. */}
      <svg className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 w-full sm:h-12" viewBox="0 0 1440 64" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0h1440v8C1100 58 340 58 0 8Z" fill="#07080a" />
      </svg>

      <div className="relative z-10 mx-auto grid max-w-[1240px] items-center gap-6 px-5 pb-9 pt-11 sm:gap-9 sm:px-8 sm:pt-20 lg:grid-cols-[minmax(0,560px)_1fr] lg:gap-14 lg:py-24">
        <div ref={textRef} className="vigio-reveal text-center lg:text-left">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-orange-brand sm:text-xs">{content.eyebrow}</p>
          <h2 id="nfc-productos-titulo" className="mt-3 font-black leading-[1.05] tracking-[-0.035em]" style={{ fontSize: 'clamp(2rem, 8.4vw, 3.9rem)' }}>
            {content.title} <span className="text-orange-brand">{content.titleHighlight}</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[14.5px] leading-relaxed text-zinc-100 sm:mt-4 sm:text-lg lg:mx-0">{content.description}</p>
          <ul className="mx-auto mt-4 w-fit max-w-full space-y-1.5 text-left sm:mt-5 sm:space-y-2 lg:mx-0">
            {content.bullets.map(item => (
              <li key={item} className="flex items-start gap-2.5 text-zinc-50" style={{ fontSize: 'clamp(12.5px, 3.55vw, 17px)' }}>
                <span className="mt-[0.45em] h-2 w-2 shrink-0 rounded-full bg-orange-brand" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <ActionRow className="mt-8 hidden lg:flex" />
        </div>

        <div ref={visualRef} className="vigio-reveal" style={{ transitionDelay: '120ms' }}>
          <FlatLay />
          <ActionRow className="mt-9 justify-center lg:hidden" />
        </div>
      </div>
    </section>
  );
}
