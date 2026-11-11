import React, { useEffect, useRef } from 'react';
import content from '../data/comoFunciona.json';
import scrollToSection from '../lib/scrollToSection';

const ICONS = {
  tap: <><rect x="6.5" y="2.5" width="9" height="17" rx="2" /><path d="M10 16.5h2" /><path d="M18.5 7.5a5 5 0 0 1 0 7" /><path d="M21 5a8.5 8.5 0 0 1 0 12" /></>,
  profile: <><rect x="3" y="4.5" width="18" height="15" rx="2.5" /><circle cx="9" cy="11" r="2.3" /><path d="M5.8 16.5c.6-1.6 1.8-2.4 3.2-2.4s2.6.8 3.2 2.4M14.5 10h4M14.5 13.5h3" /></>,
  call: <path d="M5 4h3.5l1.7 4.3-2.1 1.4a11 11 0 0 0 6.2 6.2l1.4-2.1L20 15.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />,
  home: <><path d="M3.5 11 12 4l8.5 7" /><path d="M6 9.5V20h12V9.5" /><path d="M10 20v-5h4v5" /></>,
};

const StepIcon = ({ name }) => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>
);

// Agrega "is-visible" a cada elemento marcado cuando entra en pantalla.
function useRevealAll(selector) {
  const ref = useRef(null);
  useEffect(() => {
    const items = [...(ref.current?.querySelectorAll(selector) || [])];
    if (!('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('is-visible')); return undefined; }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.25 });
    items.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [selector]);
  return ref;
}

// Móvil (< 768 px): línea de tiempo vertical con tarjetas.
function MobileTimeline({ steps }) {
  const listRef = useRevealAll('.vigio-reveal');
  return (
    <ol ref={listRef} className="relative mx-auto mt-10 max-w-md md:hidden">
      <span className="absolute bottom-6 left-[21px] top-6 w-0.5 bg-gradient-to-b from-orange-brand via-orange-brand/60 to-teal-brand/70" aria-hidden="true" />
      {steps.map((step, index) => (
        <li key={step.title} className="vigio-reveal relative flex gap-4 pb-7 last:pb-0" style={{ transitionDelay: `${index * 90}ms` }}>
          <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-orange-brand/50 bg-[#1a1210] text-orange-brand shadow-[0_0_0_5px_#0c0d11]">
            <StepIcon name={step.icon} />
          </span>
          <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono text-2xl font-black leading-none text-orange-brand/90">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="text-base font-black leading-tight">{step.title}</h3>
            </div>
            <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-300">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

// Tablet y escritorio (≥ 768 px): línea horizontal con 4 nodos y tarjetas de igual altura.
// Al entrar en pantalla la línea se llena y cada nodo/tarjeta se enciende cuando la línea llega (index.css).
function WideTimeline({ steps }) {
  const wrapRef = useRevealAll('.cf-timeline');
  return (
    <div ref={wrapRef} className="mt-14 hidden md:block">
      <div className="cf-timeline relative [--cf-gap:14px] lg:[--cf-gap:24px]">
        {/* Línea entre el centro del primer y el último nodo: (100% - 3 gaps) / 8 desde cada borde. */}
        <div className="absolute top-[23px] h-0.5 rounded-full bg-white/10" style={{ left: 'calc((100% - 3 * var(--cf-gap)) / 8)', right: 'calc((100% - 3 * var(--cf-gap)) / 8)' }} aria-hidden="true">
          <span className="cf-line-fill block h-full w-full origin-left rounded-full bg-gradient-to-r from-orange-brand via-orange-brand/70 to-teal-brand/80" />
        </div>
        <ol className="relative grid grid-cols-4 items-stretch" style={{ gap: 'var(--cf-gap)' }}>
          {steps.map((step, index) => (
            <li key={step.title} className="cf-step flex flex-col items-center" style={{ '--i': index }}>
              <span className="cf-node relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-[#1a1210] text-orange-brand shadow-[0_0_0_6px_#0c0d11]">
                <StepIcon name={step.icon} />
              </span>
              <span className="h-5 w-0.5 bg-gradient-to-b from-orange-brand/60 to-white/10" aria-hidden="true" />
              <div className="cf-card flex w-full flex-1 flex-col rounded-2xl border bg-white/[0.03] px-4 py-4 lg:px-6 lg:py-5">
                <div className="flex flex-col gap-1.5 lg:flex-row lg:items-baseline lg:gap-2.5">
                  <span className="font-mono text-2xl font-black leading-none text-orange-brand/90 lg:text-[1.7rem]">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="text-[15px] font-black leading-tight lg:text-lg">{step.title}</h3>
                </div>
                <p className="mt-2 text-[13.5px] leading-snug text-zinc-300 lg:text-[15px]">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function ComoFuncionaSection() {
  return (
    <section id="como-funciona" aria-labelledby="como-funciona-titulo" className="bg-[#0c0d11] px-5 py-16 text-white sm:px-6 sm:py-24">
      <div className="mx-auto max-w-[1240px]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-orange-brand sm:text-xs">{content.eyebrow}</p>
          <h2 id="como-funciona-titulo" className="mt-3 text-[2rem] font-black leading-[1.05] tracking-[-0.035em] sm:text-5xl">{content.title}</h2>
          <p className="mt-3 text-[15px] text-zinc-300 sm:text-lg">{content.subtitle}</p>
        </div>

        <MobileTimeline steps={content.steps} />
        <WideTimeline steps={content.steps} />

        <div className="mt-10 flex justify-center md:mt-12">
          <a
            href={content.cta.target}
            onClick={event => scrollToSection(event, content.cta.target)}
            className="inline-flex items-center rounded-xl bg-orange-brand px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-brand/30 transition hover:bg-orange-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {content.cta.label}
          </a>
        </div>
      </div>
    </section>
  );
}
