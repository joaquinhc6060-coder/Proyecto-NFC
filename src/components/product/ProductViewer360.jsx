import React, { useCallback, useEffect, useRef, useState } from 'react';
import ProductImage from './ProductImage';
import useMediaQuery from '../../hooks/useMediaQuery';

// Proporción del objeto según la forma configurada en products.json (viewer.shape).
const SHAPES = {
  circle: { width: '56%', aspectRatio: '1 / 1', radius: '50%' },
  band: { width: '88%', aspectRatio: '2.4 / 1', radius: '999px' },
  box: { width: '76%', aspectRatio: '4 / 3', radius: '18px' },
  // Correa plana: el canto se dibuja con la silueta de la propia imagen (ver edgeFromImage).
  strap: { width: '94%', aspectRatio: '40 / 3', radius: '0', edgeFromImage: true },
};

const DRAG_FACTOR = 0.5; // grados por píxel arrastrado
const FRICTION = 0.94; // inercia al soltar
const AUTO_SPEED = 0.22; // grados por cuadro mientras gira solo
const KEY_STEP = 15; // grados por tecla de flecha

function HandIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-1.2a6 6 0 0 1-4.6-2.2L3.6 15a1.5 1.5 0 0 1 2.3-1.9L9 16" />
      <path d="M3 4h4M3 4l1.5-1.5M3 4l1.5 1.5M21 4h-4m4 0-1.5-1.5M21 4l-1.5 1.5" />
    </svg>
  );
}

/**
 * Visor giratorio. viewer.mode:
 *  - "flip": objeto CSS 3D con frente, reverso y canto con grosor (por defecto).
 *  - "model": modelo .glb con <model-viewer>. Requiere cargar el web component
 *    (https://modelviewer.dev) en index.html; si no está disponible, vuelve a "flip".
 */
export default function ProductViewer360({ name, viewer = {}, frontSrc, backSrc }) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [interacted, setInteracted] = useState(false);
  const stageRef = useRef(null);
  const objectRef = useRef(null);
  const state = useRef({ angle: -18, velocity: 0, dragging: false, lastX: 0, auto: true, frame: 0 });

  const shape = SHAPES[viewer.shape] || SHAPES.circle;
  const thickness = viewer.thickness ?? 12;
  const layers = Math.max(2, Math.round(thickness / 1.5));
  const useModel = viewer.mode === 'model' && viewer.model && typeof window !== 'undefined' && window.customElements?.get('model-viewer');

  const apply = useCallback((withTransition = false) => {
    const s = state.current;
    const el = objectRef.current;
    if (!el) return;
    el.style.transition = withTransition ? 'transform 260ms ease-out' : 'none';
    el.style.transform = `rotateX(-6deg) rotateY(${s.angle}deg)`;
    stageRef.current?.setAttribute('aria-valuenow', String(((Math.round(s.angle) % 360) + 360) % 360));
  }, []);

  const loop = useCallback(() => {
    const s = state.current;
    s.frame = 0;
    if (s.dragging) return;
    if (Math.abs(s.velocity) > 0.02) {
      s.angle += s.velocity;
      s.velocity *= FRICTION;
    } else if (s.auto) {
      s.angle += AUTO_SPEED;
    } else {
      return;
    }
    apply();
    s.frame = requestAnimationFrame(loop);
  }, [apply]);

  const start = useCallback(() => {
    if (!state.current.frame) state.current.frame = requestAnimationFrame(loop);
  }, [loop]);

  // Giro automático suave al cargar (salvo movimiento reducido); se detiene al tocar.
  useEffect(() => {
    const s = state.current;
    s.auto = !reduceMotion && !interacted;
    apply();
    if (s.auto) start();
    return () => { cancelAnimationFrame(s.frame); s.frame = 0; };
  }, [reduceMotion, interacted, apply, start]);

  const stopAuto = () => {
    state.current.auto = false;
    if (!interacted) setInteracted(true);
  };

  const onPointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    const s = state.current;
    stopAuto();
    s.dragging = true;
    s.velocity = 0;
    s.lastX = event.clientX;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    const s = state.current;
    if (!s.dragging) return;
    const delta = (event.clientX - s.lastX) * DRAG_FACTOR;
    s.lastX = event.clientX;
    s.angle += delta;
    s.velocity = delta;
    apply();
  };

  const onPointerUp = () => {
    const s = state.current;
    if (!s.dragging) return;
    s.dragging = false;
    if (reduceMotion) s.velocity = 0;
    start();
  };

  const onKeyDown = (event) => {
    const step = event.key === 'ArrowLeft' ? -KEY_STEP : event.key === 'ArrowRight' ? KEY_STEP : event.key === 'Home' ? null : undefined;
    if (step === undefined) return;
    event.preventDefault();
    stopAuto();
    const s = state.current;
    s.velocity = 0;
    s.angle = step === null ? 0 : s.angle + step;
    apply(!reduceMotion);
  };

  if (useModel) {
    return (
      <div className="relative h-full w-full">
        {React.createElement('model-viewer', {
          src: viewer.model,
          alt: `Modelo 3D de ${name}`,
          'camera-controls': true,
          'touch-action': 'pan-y',
          'auto-rotate': reduceMotion ? undefined : true,
          style: { width: '100%', height: '100%' },
        })}
      </div>
    );
  }

  const faceStyle = { borderRadius: shape.radius, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' };

  return (
    <div
      ref={stageRef}
      role="slider"
      tabIndex={0}
      aria-label={`Vista giratoria de ${name}. Usa las flechas izquierda y derecha para girar.`}
      aria-valuemin={0}
      aria-valuemax={359}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className="relative flex h-full w-full cursor-grab select-none items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-orange-brand active:cursor-grabbing"
      style={{ perspective: '1100px', touchAction: 'pan-y' }}
    >
      <div ref={objectRef} className="relative" style={{ width: shape.width, aspectRatio: shape.aspectRatio, transformStyle: 'preserve-3d' }}>
        {/* Canto: capas apiladas entre el frente y el reverso para dar grosor real. */}
        {Array.from({ length: layers - 1 }, (_, i) => {
          const z = -thickness / 2 + ((i + 1) * thickness) / layers;
          const shade = 0.82 + 0.18 * Math.sin((i / layers) * Math.PI);
          if (shape.edgeFromImage && frontSrc) {
            return (
              <img
                key={i}
                src={frontSrc}
                alt=""
                aria-hidden="true"
                draggable="false"
                className="absolute inset-0 h-full w-full object-contain"
                style={{ transform: `translateZ(${z}px)`, filter: `brightness(${0.32 * shade})` }}
              />
            );
          }
          return (
            <div
              key={i}
              aria-hidden="true"
              className="absolute inset-0"
              style={{ borderRadius: shape.radius, transform: `translateZ(${z}px)`, background: viewer.edgeColor || '#c4c8cf', filter: `brightness(${shade})` }}
            />
          );
        })}
        <div className="absolute inset-0 overflow-hidden" style={{ ...faceStyle, transform: `translateZ(${thickness / 2}px)` }}>
          <ProductImage src={frontSrc} alt={`${name}, frente`} placeholderLabel="Frente" />
        </div>
        <div className="absolute inset-0 overflow-hidden" style={{ ...faceStyle, transform: `rotateY(180deg) translateZ(${thickness / 2}px)` }}>
          <ProductImage src={backSrc} alt={`${name}, reverso`} placeholderLabel="Reverso" />
        </div>
      </div>

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur transition-opacity duration-500 ${interacted ? 'opacity-0' : 'opacity-100'}`}
      >
        <HandIcon /> Arrastra para girar
      </div>
    </div>
  );
}
