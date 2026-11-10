import React, { useEffect, useState } from 'react';

// Muestra la imagen indicada o, si el archivo no existe, un recuadro gris "Imagen pendiente".
export default function ProductImage({ src, alt, className = '', placeholderLabel, position }) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => { setFailed(!src); }, [src]);

  if (failed) {
    return (
      <div role="img" aria-label={`${alt} (imagen pendiente)`} className={`flex h-full w-full flex-col items-center justify-center gap-1 bg-zinc-300 text-center text-zinc-600 ${className}`}>
        <svg className="h-7 w-7 opacity-60" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m21 16-5-5-8 8" /></svg>
        <span className="text-xs font-bold">Imagen pendiente</span>
        {placeholderLabel && <span className="text-[10px] uppercase tracking-wider opacity-70">{placeholderLabel}</span>}
      </div>
    );
  }

  return <img src={src} alt={alt} onError={() => setFailed(true)} className={`h-full w-full object-contain ${className}`} style={position ? { objectPosition: position } : undefined} draggable="false" />;
}
