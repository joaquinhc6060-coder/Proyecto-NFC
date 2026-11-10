import React, { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import useMediaQuery from '../hooks/useMediaQuery';

const DISCOUNT_CODE = 'VIGIO10';
const STORAGE_KEY = 'vigio:announcement-closed-at';
const HIDE_FOR_MS = 24 * 60 * 60 * 1000;
const ROTATE_MS = 4000;
// Cuántas veces se repite la secuencia en cada mitad de la pista, para cubrir pantallas anchas.
const REPEATS_PER_HALF = 3;

const MESSAGES = [
  { id: 'descuento', emoji: '🎁', text: `Lanzamiento: 10% de descuento con el código ${DISCOUNT_CODE}`, copy: true },
  { id: 'envio', emoji: '🚚', text: 'Envío a todo Chile' },
  { id: 'sin-app', emoji: '🔋', text: 'Sin app, sin batería, sin suscripción mensual' },
];

function wasClosedRecently() {
  try {
    const closedAt = Number(window.localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(closedAt) && closedAt > 0 && Date.now() - closedAt < HIDE_FOR_MS;
  } catch {
    return false;
  }
}

function rememberClosed() {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // Sin localStorage (modo privado estricto): la barra solo se oculta en esta visita.
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function Message({ message, onCopy, hidden }) {
  const content = (<><span aria-hidden="true">{message.emoji}</span> {message.text}</>);
  if (!message.copy) return <span className="whitespace-nowrap">{content}</span>;
  return (
    <button
      type="button"
      onClick={onCopy}
      tabIndex={hidden ? -1 : undefined}
      title={`Copiar código ${DISCOUNT_CODE}`}
      className="whitespace-nowrap rounded underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
    >
      {content}
    </button>
  );
}

export default function AnnouncementBar() {
  const [closed, setClosed] = useState(wasClosedRecently);
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState('');
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const resumeTimer = useRef(null);
  const toastTimer = useRef(null);

  // El menú y el hero leen --vigio-bar-h; al cerrar la barra vuelve a 0.
  useLayoutEffect(() => {
    document.documentElement.dataset.announcement = closed ? 'closed' : 'open';
  }, [closed]);

  // Movimiento reducido: un mensaje a la vez, con fundido cada 4 segundos.
  useEffect(() => {
    if (closed || !reduceMotion) return undefined;
    let fadeTimer;
    const interval = setInterval(() => {
      setVisible(false);
      fadeTimer = setTimeout(() => {
        setIndex(current => (current + 1) % MESSAGES.length);
        setVisible(true);
      }, 300);
    }, ROTATE_MS);
    return () => { clearInterval(interval); clearTimeout(fadeTimer); };
  }, [closed, reduceMotion]);

  useEffect(() => () => { clearTimeout(resumeTimer.current); clearTimeout(toastTimer.current); }, []);

  if (closed) return null;

  const handleCopy = async () => {
    const ok = await copyToClipboard(DISCOUNT_CODE);
    setToast(ok ? 'Código copiado' : `Tu código: ${DISCOUNT_CODE}`);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };

  const handleClose = () => {
    rememberClosed();
    setClosed(true);
  };

  // En pantallas táctiles no hay hover: tocar pausa y se reanuda poco después de soltar.
  const pauseOnTouch = () => { clearTimeout(resumeTimer.current); setPaused(true); };
  const resumeAfterTouch = () => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), 2500);
  };

  const half = Array.from({ length: REPEATS_PER_HALF }, () => MESSAGES).flat();

  return (
    <div
      role="region"
      aria-label="Anuncios Vigio"
      className="sticky top-0 z-[60] flex h-[var(--vigio-bar-h)] items-center overflow-hidden bg-orange-brand text-[11px] font-bold text-white sm:text-xs"
    >
      {reduceMotion ? (
        <div className="flex flex-1 items-center justify-center px-10 text-center">
          <span className={`transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            <Message message={MESSAGES[index]} onCopy={handleCopy} />
          </span>
        </div>
      ) : (
        <div
          className="vigio-marquee relative flex-1 overflow-hidden"
          data-paused={paused}
          onTouchStart={pauseOnTouch}
          onTouchEnd={resumeAfterTouch}
          onTouchCancel={resumeAfterTouch}
        >
          <div className="vigio-marquee-track flex w-max items-center">
            {[0, 1].map(copy => (
              <div key={copy} className="flex items-center" aria-hidden={copy === 1 ? 'true' : undefined}>
                {half.map((message, i) => {
                  const hidden = copy === 1 || i >= MESSAGES.length;
                  return (
                    <Fragment key={`${copy}-${i}`}>
                      <span aria-hidden={hidden && copy === 0 ? 'true' : undefined} className="flex items-center">
                        <Message message={message} onCopy={handleCopy} hidden={hidden} />
                      </span>
                      <span aria-hidden="true" className="px-5 opacity-80 sm:px-7">•</span>
                    </Fragment>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <div role="status" aria-live="polite" className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        {toast && <span className="rounded-full bg-white px-3 py-0.5 text-[11px] font-black text-orange-brand shadow-lg sm:text-xs">✓ {toast}</span>}
      </div>

      <button
        type="button"
        onClick={handleClose}
        aria-label="Cerrar anuncios"
        className="relative z-20 flex h-full w-9 shrink-0 items-center justify-center bg-orange-brand text-base leading-none text-white/90 shadow-[-10px_0_12px_rgba(255,90,46,0.95)] transition hover:text-white sm:w-11"
      >
        ×
      </button>
    </div>
  );
}
