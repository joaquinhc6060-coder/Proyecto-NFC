import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCardImage from './product/ProductCardImage';
import { CATEGORIES, formatCLP, getProductsByCategory, productPath } from '../lib/products';

const BADGE_STYLES = {
  orange: 'bg-orange-brand text-white',
  sky: 'bg-sky-400 text-slate-950',
  teal: 'bg-teal-brand text-slate-950',
};

// Tarjeta selectora: imagen, nombre, precio y "Ver producto".
function ProductCard({ product }) {
  const featured = product.highlightStyle === 'orange';
  const badge = product.highlight || product.badge;
  const badgeStyle = BADGE_STYLES[product.highlightStyle || product.badgeStyle] || BADGE_STYLES.orange;

  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-[28px] border bg-[#121316] shadow-2xl transition duration-300 hover:-translate-y-1 ${featured ? 'border-orange-brand/70 ring-1 ring-orange-brand/40' : 'border-white/10 hover:border-white/25'}`}>
      <div className="relative flex aspect-[4/3.1] items-center justify-center overflow-hidden bg-white p-5 sm:p-7">
        {badge && <span className={`absolute left-4 top-4 z-10 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${badgeStyle}`}>{badge}</span>}
        <span className="absolute bottom-4 right-4 z-10 rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-[10px] font-bold text-zinc-600 backdrop-blur">NFC</span>
        <ProductCardImage product={product} className="transition duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <h4 className="text-lg font-black leading-tight tracking-[-0.02em]">{product.name}</h4>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/10 pt-4">
          <p className="flex flex-wrap items-baseline gap-x-2">
            {product.regularPrice && <span className="text-sm text-zinc-500 line-through">{formatCLP(product.regularPrice)}</span>}
            <span className="text-xl font-black text-orange-brand">{formatCLP(product.price)}</span>
            <span className="text-xs font-medium text-zinc-400">CLP</span>
          </p>
          <Link to={productPath(product.id)} className="shrink-0 rounded-xl border border-white/15 px-4 py-2 text-xs font-bold transition hover:border-orange-brand hover:bg-orange-brand hover:text-white" aria-label={`Ver producto: ${product.name}`}>
            Ver producto
          </Link>
        </div>
      </div>
    </article>
  );
}

// Móvil: una fila horizontal que se desliza (scroll-snap) con puntos indicadores.
// Desde sm: la grilla de siempre. Teclado: flechas izquierda/derecha.
function ProductRow({ label, products }) {
  const trackRef = useRef(null);
  const [current, setCurrent] = useState(0);

  const cards = () => [...(trackRef.current?.children || [])];
  const goTo = index => {
    const track = trackRef.current;
    const card = cards()[index];
    if (!track || !card) return;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft || 0) });
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const onScroll = () => {
      const start = track.scrollLeft;
      const positions = cards().map(card => Math.abs(card.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft || 0) - start));
      setCurrent(positions.indexOf(Math.min(...positions)));
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  const onKeyDown = event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    if (getComputedStyle(trackRef.current).overflowX === 'visible') return; // escritorio: grilla
    event.preventDefault();
    goTo(Math.max(0, Math.min(products.length - 1, current + (event.key === 'ArrowRight' ? 1 : -1))));
  };

  return (
    <div>
      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carrusel"
        aria-label={`Productos de ${label}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="vigio-carousel -mx-6 flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-px-4 px-4 pb-2 outline-none focus-visible:ring-2 focus-visible:ring-orange-brand/60 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3"
      >
        {products.map(product => (
          <div key={product.id} className="w-[86%] shrink-0 snap-start sm:w-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      {products.length > 1 && (
        <div className="mt-4 flex justify-center gap-2 sm:hidden">
          {products.map((product, index) => (
            <button
              key={product.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ir a ${product.name}`}
              aria-current={index === current ? 'true' : undefined}
              className={`h-2 rounded-full transition-all ${index === current ? 'w-6 bg-orange-brand' : 'w-2 bg-white/25'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CatalogSection() {
  return (
    <section id="catalogo" className="bg-[#07080a] px-6 py-24 text-white sm:py-32">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-12 border-b border-white/10 pb-8">
          <span className="inline-flex rounded-full border border-orange-brand/35 bg-orange-brand/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-orange-brand">Catálogo Vigio</span>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-5xl">Nuestro Catálogo.</h2>
        </div>

        {/* Las tres categorías visibles a la vez, en orden: Mascotas, Pulseras, Packs. */}
        <div className="space-y-16">
          {CATEGORIES.map(category => {
            const products = getProductsByCategory(category.id);
            if (!products.length) return null;
            return (
              <section key={category.id} aria-labelledby={`catalogo-${category.id}`}>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 id={`catalogo-${category.id}`} className="text-2xl font-black tracking-[-0.02em]">{category.label}</h3>
                  {category.notice && <p className="w-fit rounded-xl border border-orange-brand/25 bg-orange-brand/[0.07] px-4 py-2 text-xs font-semibold text-orange-light">{category.notice}</p>}
                </div>
                <ProductRow label={category.label} products={products} />
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
