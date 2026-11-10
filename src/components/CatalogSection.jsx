import React from 'react';
import { Link } from 'react-router-dom';

// Valores e imágenes referenciales: reemplázalos cuando esté listo el catálogo comercial.
const products = [
  { id: 'placa-negra', name: 'Placa NFC Vigio · Negra', category: 'Mascotas', price: '$12.990', color: 'Negro huellas', image: '/images/vigio-placa-negra-llavero.png', target: '/mascotas', accent: 'bg-orange-brand text-white' },
  { id: 'placa-azul', name: 'Placa NFC Vigio · Azul', category: 'Mascotas', price: '$12.990', color: 'Azul marino', image: '/images/vigio-placa-azul-llavero.png', target: '/mascotas', accent: 'bg-sky-400 text-slate-950' },
];

export default function CatalogSection() {
  return (
    <section id="catalogo" className="bg-[#07080a] px-6 py-24 text-white sm:py-32">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-11 flex flex-col gap-5 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-orange-brand/35 bg-orange-brand/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-orange-brand">Catálogo Vigio</span>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-5xl">Nuestro Catálogo.</h2>
          </div>
          <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-zinc-400">Imágenes y precios referenciales · sujetos a actualización</p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {products.map((product) => (
            <article key={product.id} className="group overflow-hidden rounded-[28px] border border-white/10 bg-[#121316] shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-white/25">
              <div className="relative flex aspect-[4/3.1] items-center justify-center overflow-hidden bg-white p-5 sm:p-7">
                <span className={`absolute left-4 top-4 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${product.accent}`}>Nuevo</span>
                <span className="absolute bottom-4 right-4 rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-[10px] font-bold text-zinc-600 backdrop-blur">NFC</span>
                <img src={product.image} alt={`${product.name} montada en un llavero metálico`} className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]" />
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500"><span>{product.category}</span><span>{product.color}</span></div>
                <h3 className="min-h-12 text-lg font-black leading-tight tracking-[-0.02em]">{product.name}</h3>
                <div className="flex items-end justify-between gap-3 border-t border-white/10 pt-4"><div><p className="text-[10px] uppercase tracking-wider text-zinc-500">Precio referencial</p><p className="mt-1 text-xl font-black text-orange-brand">{product.price}<span className="ml-1 text-xs font-medium text-zinc-400">CLP</span></p></div><Link to={product.target} className="rounded-xl border border-white/15 px-3 py-2 text-xs font-bold transition hover:border-orange-brand hover:bg-orange-brand hover:text-white" aria-label={`Ver ${product.name}`}>Ver →</Link></div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-[28px] border border-teal-brand/20 bg-teal-brand/[0.06] p-6 sm:flex-row sm:items-center">
          <div><p className="font-bold text-teal-brand">¿Quieres consultar disponibilidad o una compra para varios productos?</p><p className="mt-1 text-sm text-zinc-400">Esta primera vitrina es referencial. Escríbenos y te ayudamos a elegir.</p></div>
          <Link to="/contacto" className="rounded-xl bg-orange-brand px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-brand/20 transition hover:bg-orange-hover">Consultar disponibilidad</Link>
        </div>
      </div>
    </section>
  );
}
