import React from 'react';
import { Link } from 'react-router-dom';

// Bloque de compras por varios productos (antes vivía al final del catálogo; mismo contenido y estilo).
export default function WholesaleBlock() {
  return (
    <section aria-label="Compras por mayor" className="bg-[#07080a] px-6 pb-24 text-white">
      <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-5 rounded-[28px] border border-teal-brand/20 bg-teal-brand/[0.06] p-6 sm:flex-row sm:items-center">
        <div><p className="font-bold text-teal-brand">¿Quieres consultar disponibilidad o una compra para varios productos?</p><p className="mt-1 text-sm text-zinc-400">Esta primera vitrina es referencial. Escríbenos y te ayudamos a elegir.</p></div>
        <Link to="/contacto" className="rounded-xl bg-orange-brand px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-brand/20 transition hover:bg-orange-hover">Consultar disponibilidad</Link>
      </div>
    </section>
  );
}
