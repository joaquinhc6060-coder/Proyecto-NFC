import React from 'react';
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
    <article className={`group flex flex-col overflow-hidden rounded-[28px] border bg-[#121316] shadow-2xl transition duration-300 hover:-translate-y-1 ${featured ? 'border-orange-brand/70 ring-1 ring-orange-brand/40' : 'border-white/10 hover:border-white/25'}`}>
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
                {/* Misma grilla en las tres secciones para que todas las tarjetas midan igual. */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-5 rounded-[28px] border border-teal-brand/20 bg-teal-brand/[0.06] p-6 sm:flex-row sm:items-center">
          <div><p className="font-bold text-teal-brand">¿Quieres consultar disponibilidad o una compra para varios productos?</p><p className="mt-1 text-sm text-zinc-400">Esta primera vitrina es referencial. Escríbenos y te ayudamos a elegir.</p></div>
          <Link to="/contacto" className="rounded-xl bg-orange-brand px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-brand/20 transition hover:bg-orange-hover">Consultar disponibilidad</Link>
        </div>
      </div>
    </section>
  );
}
