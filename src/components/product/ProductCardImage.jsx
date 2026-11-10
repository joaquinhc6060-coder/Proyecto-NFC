import React from 'react';

const IMAGE_CLASS = 'h-full w-full object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.16)]';

// Imagen de producto sobre fondo blanco. En los packs compone las fotos de cada
// producto incluido (placas arriba, pulseras abajo) sin generar imágenes nuevas.
export default function ProductCardImage({ product, className = '' }) {
  const images = product.cardImages || [];
  const alt = product.includes ? `${product.name}: ${product.includes.join(' y ')}` : product.name;

  if (images.length <= 1) {
    return <img src={images[0]} alt={alt} loading="lazy" className={`${IMAGE_CLASS} ${className}`} />;
  }

  const plates = images.filter(src => !src.includes('pulsera'));
  const bands = images.filter(src => src.includes('pulsera'));
  return (
    <div role="img" aria-label={alt} className={`flex h-full w-full flex-col items-center justify-center gap-1 ${className}`}>
      {plates.length > 0 && (
        <div className="flex h-[55%] w-full items-center justify-center">
          {plates.map((src, i) => (
            <img key={`${src}-${i}`} src={src} alt="" loading="lazy" className={`${IMAGE_CLASS} min-w-0 max-w-[48%] ${i > 0 ? '-ml-[6%]' : ''}`} />
          ))}
        </div>
      )}
      {bands.length > 0 && (
        <div className="flex h-[42%] w-full items-center justify-center">
          {bands.map((src, i) => (
            <img key={`${src}-${i}`} src={src} alt="" loading="lazy" className={`${IMAGE_CLASS} min-w-0 max-w-[58%] ${i > 0 ? '-ml-[14%]' : ''}`} />
          ))}
        </div>
      )}
    </div>
  );
}
