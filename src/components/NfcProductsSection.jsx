import React, { useEffect, useRef } from 'react';
import content from '../data/homeNfcSection.json';

const CheckIcon = () => (
  <svg className="mt-0.5 h-5 w-5 shrink-0 text-orange-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" strokeWidth="1.6" opacity="0.35" />
    <path d="m7.5 12.5 3 3 6-6.5" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 4h3.5l1.7 4.3-2.1 1.4a11 11 0 0 0 6.2 6.2l1.4-2.1L20 15.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />
  </svg>
);

const DropIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3.5c3.6 4.4 6 7.7 6 10.6A6 6 0 0 1 6 14.1c0-2.9 2.4-6.2 6-10.6Z" />
    <path d="M9.2 14.6a2.9 2.9 0 0 0 2.6 2.6" strokeLinecap="round" />
  </svg>
);

// Aparece con fundido y leve desplazamiento al entrar en pantalla (CSS respeta prefers-reduced-motion).
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) { el.classList.add('is-visible'); return undefined; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('is-visible'); observer.disconnect(); }
    }, { threshold: 0.18 });
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

// Ondas NFC: círculos centrados en (x, y) del contenedor, con diámetro `size` del ancho.
function NfcWaves({ x, y, size }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="vigio-nfc-wave absolute rounded-full border-2 border-orange-brand/70"
          style={{ left: x, top: y, width: size, aspectRatio: '1 / 1', animationDelay: `${i}s` }}
        />
      ))}
    </div>
  );
}

function ProfileMockup({ profile, caption }) {
  return (
    <figure className="w-full">
      <figcaption className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{caption}</figcaption>
      <div className="rounded-[2rem] border border-white/15 bg-[#0f1013] p-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.85)] ring-1 ring-black/60">
        <div className="relative overflow-hidden rounded-[1.6rem] bg-gradient-to-b from-[#1b1c21] to-[#111216] px-3.5 pb-4 pt-7">
          <span className="absolute left-1/2 top-2 h-4 w-16 -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-orange-brand ring-offset-2 ring-offset-[#1b1c21] sm:h-20 sm:w-20">
              <img src={profile.photo} alt={profile.photoAlt} className="h-full w-full object-cover" style={{ objectPosition: profile.photoPosition }} loading="lazy" />
            </div>
            <p className="mt-2.5 text-lg font-black text-white">{profile.name}</p>
          </div>
          <div className="mt-3 space-y-2">
            {profile.contacts.map((label, i) => (
              <div key={label} className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-bold ${i === 0 ? 'bg-orange-brand text-white' : 'border border-white/15 text-zinc-200'}`}>
                <PhoneIcon /> {label}
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {profile.chips.map(chip => (
              <span key={chip} className="rounded-full border border-teal-brand/30 bg-teal-brand/10 px-2 py-0.5 text-[10px] font-bold text-teal-brand">{chip}</span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}

export default function NfcProductsSection() {
  const textRef = useReveal();
  const visualRef = useReveal();
  const { visual } = content;

  return (
    <section aria-labelledby="nfc-productos-titulo" className="relative overflow-hidden bg-[#0c0d11] text-white">
      {/* Borde superior curvo que separa la sección del hero. */}
      <svg className="pointer-events-none absolute inset-x-0 top-0 h-10 w-full sm:h-16" viewBox="0 0 1440 64" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0h1440v8C1100 58 340 58 0 8Z" fill="#07080a" />
      </svg>
      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-orange-brand/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-teal-brand/[0.07] blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-[1240px] items-center gap-14 px-6 pb-24 pt-24 sm:pt-32 lg:grid-cols-2 lg:gap-10">
        {/* Texto */}
        <div ref={textRef} className="vigio-reveal">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-orange-brand">{content.eyebrow}</p>
          <h2 id="nfc-productos-titulo" className="mt-4 text-4xl font-black leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
            {content.title} <span className="text-orange-brand">{content.titleHighlight}</span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">{content.description}</p>
          <ul className="mt-7 space-y-3">
            {content.bullets.map(item => (
              <li key={item} className="flex items-start gap-3 text-sm text-zinc-200 sm:text-base"><CheckIcon /><span>{item}</span></li>
            ))}
          </ul>
          <p className="mt-6 text-sm italic text-teal-brand">{content.closing}</p>
          <a
            href={content.cta.target}
            onClick={event => scrollToTarget(event, content.cta.target)}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-brand px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-brand/30 transition hover:bg-orange-hover"
          >
            {content.cta.label} <span aria-hidden="true">↓</span>
          </a>
        </div>

        {/* Composición visual */}
        <div ref={visualRef} className="vigio-reveal relative mx-auto h-[520px] w-full max-w-[580px] sm:h-[540px]" style={{ transitionDelay: '150ms' }}>
          {/* Placa con ondas NFC centradas en el disco */}
          <div className="absolute left-[73%] top-[44%] w-[50%] max-w-[260px] -translate-x-1/2 -translate-y-1/2 sm:left-[62%] sm:top-[38%] sm:w-[44%]">
            <div className="vigio-float relative aspect-square">
              <NfcWaves x={visual.plateDisc.x} y={visual.plateDisc.y} size={visual.plateDisc.size} />
              <img src={visual.plateImage} alt={visual.plateAlt} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.6)]" loading="lazy" />
            </div>
          </div>

          {/* Pulsera: misma función, mismas ondas */}
          <div className="absolute left-1/2 top-[89%] z-10 w-[92%] max-w-[380px] -translate-x-1/2 -translate-y-1/2 sm:left-[60%] sm:top-[80%] sm:w-[66%]">
            <div className="vigio-float-fast relative" style={{ aspectRatio: '1400 / 418' }}>
              <NfcWaves x="50%" y="50%" size="34%" />
              <img src={visual.braceletImage} alt={visual.braceletAlt} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_20px_24px_rgba(0,0,0,0.6)]" loading="lazy" />
            </div>
          </div>

          {/* Celular con perfil de ejemplo */}
          <div className="absolute left-0 top-[40%] z-20 w-[44%] max-w-[220px] -translate-y-1/2 sm:top-[42%] sm:w-[40%]">
            <div className="vigio-float-slow -rotate-[4deg]">
              <ProfileMockup profile={visual.profile} caption={visual.profileCaption} />
            </div>
          </div>

          {/* Tarjeta flotante */}
          <div className="absolute right-0 top-0 z-30 sm:top-[2%]">
            <div className="vigio-float-fast flex items-center gap-2.5 rounded-2xl border border-teal-brand/25 bg-[#121316]/90 px-4 py-3 shadow-xl backdrop-blur">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-brand/15 text-teal-brand"><DropIcon /></span>
              <span className="text-sm font-bold">{visual.waterCard}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
