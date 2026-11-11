import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import ProductViewer360 from '../components/product/ProductViewer360';
import ProductImage from '../components/product/ProductImage';
import ProductCardImage from '../components/product/ProductCardImage';
import { Accordion, ColorSelector, QuantityControl } from '../components/product/ProductControls';
import { facesFor, formatCLP, getProduct, savingsOf } from '../lib/products';
import { useCart } from '../contexts/CartContext';

// Galería definida en products.json ("gallery"): visor giratorio, imagen compuesta del pack
// o fotos (src + alt + position para encuadrar al recortar).
const galleryLabel = item => (item.type === 'viewer' ? 'Vista giratoria 360°' : item.type === 'composite' ? 'Productos incluidos' : item.alt);

const SHIPPING_LINES = [
  'Coquimbo y La Serena: entrega en 1 a 2 días hábiles.',
  'También enviamos a todas las regiones de Chile. El costo se calcula al finalizar la compra.',
  'Envío gratis en los packs Familia y Manada.',
];

const STEPS = [
  {
    text: 'Acerca el celular a la placa o pulsera.',
    icon: <path d="M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 15h2M19.5 8.5a5 5 0 0 1 0 7M21.8 6.3a8.2 8.2 0 0 1 0 11.4" />,
  },
  {
    text: 'Se abren los datos de contacto que tú elegiste.',
    icon: <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm4.5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-3 3.5c.5-1.5 1.6-2.3 3-2.3s2.5.8 3 2.3M14 10h4M14 13.5h3" />,
  },
  {
    text: 'Te llaman para que vuelvan a casa.',
    icon: <path d="M5 4h3.5l1.7 4.3-2.1 1.4a11 11 0 0 0 6.2 6.2l1.4-2.1L20 15.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />,
  },
];

function Price({ product, large = false }) {
  const isPack = Boolean(product.regularPrice);
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {isPack && <span className="text-base text-zinc-500 line-through">{formatCLP(product.regularPrice)}</span>}
        <span className={`font-black text-orange-brand ${large ? 'text-3xl sm:text-4xl' : 'text-lg'}`}>{formatCLP(product.price)}</span>
        <span className="text-sm font-medium text-zinc-400">CLP</span>
      </div>
      {isPack && large && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-orange-brand/15 px-3 py-1 text-xs font-black text-orange-brand">Ahorras {formatCLP(savingsOf(product))}</span>
          {product.freeShipping && <span className="rounded-full bg-teal-brand/15 px-3 py-1 text-xs font-black text-teal-brand">Envío gratis</span>}
        </div>
      )}
    </div>
  );
}

function ComplementRow({ product, state, onChange }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5">
        <ProductCardImage product={product} />
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="truncate text-sm font-bold">{product.name}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="text-sm font-black text-orange-brand">{formatCLP(product.price)}</span>
          {product.colors?.length > 1 && (
            <ColorSelector size="sm" colors={product.colors} value={state.color} label={`Color de ${product.name}`} onChange={color => onChange({ ...state, color })} />
          )}
        </div>
      </div>
      <QuantityControl size="sm" min={0} value={state.qty} label={`Cantidad de ${product.name}`} onChange={qty => onChange({ ...state, qty })} />
    </li>
  );
}

function ProductDetail({ product }) {
  const { addItem, openCart } = useCart();
  const [colorId, setColorId] = useState(product.colors?.[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const gallery = product.gallery.filter(item => item.type !== 'viewer' || product.viewer?.mode !== 'none');
  const [view, setView] = useState(0);
  const complements = product.complements.map(getProduct).filter(Boolean);
  const [extras, setExtras] = useState(() => Object.fromEntries(complements.map(item => [item.id, { qty: 0, color: item.colors?.[0]?.id }])));

  const faces = facesFor(product, colorId);
  const color = product.colors?.find(c => c.id === colorId);
  const isNew = product.badge === 'NUEVO';

  // Deja espacio para la barra de compra fija en móvil.
  useEffect(() => {
    document.body.classList.add('has-mobile-buybar');
    return () => document.body.classList.remove('has-mobile-buybar');
  }, []);

  // ─── PUNTO DE CONEXIÓN DEL CARRITO ───────────────────────────────────────
  // Selección lista para enviar al carrito/checkout cuando exista.
  const selection = {
    productId: product.id,
    color: colorId,
    quantity,
    extras: Object.entries(extras).filter(([, item]) => item.qty > 0).map(([id, item]) => ({ productId: id, ...item })),
  };
  const handleBuyNow = () => {
    addSelectionToCart();
    openCart();
  };
  const handleAddToCart = () => {
    addSelectionToCart();
  };
  const addSelectionToCart = () => {
    addItem({ productId: selection.productId, colorId: selection.color, quantity: selection.quantity });
    selection.extras.forEach(item => addItem({ productId: item.productId, colorId: item.color, quantity: item.qty }));
  };
  // ─────────────────────────────────────────────────────────────────────────

  const current = gallery[view] || gallery[0];
  const mainView = current.type === 'viewer'
    ? <ProductViewer360 name={product.name} viewer={product.viewer} frontSrc={faces.frente} backSrc={faces.reverso} />
    : current.type === 'composite'
      ? <div className="h-full w-full p-8 sm:p-12"><ProductCardImage product={product} /></div>
      : <ProductImage key={current.src} src={current.src} alt={current.alt} position={current.position} className="object-cover" />;

  return (
    <div className="bg-[#07080a] px-6 pb-20 pt-10 text-white sm:pt-14">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Galería y visor */}
          <div className="min-w-0 space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-white/10 bg-white">
              {isNew && <span className="absolute left-4 top-4 z-10 rounded-lg bg-orange-brand px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">Nuevo</span>}
              {product.highlight && <span className={`absolute right-4 top-4 z-10 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${product.highlightStyle === 'teal' ? 'bg-teal-brand text-slate-950' : 'bg-orange-brand text-white'}`}>{product.highlight}</span>}
              {mainView}
            </div>
            <div className="grid gap-2.5 sm:gap-3" style={{ gridTemplateColumns: `repeat(${gallery.length}, minmax(0, 1fr))` }} role="group" aria-label="Galería del producto">
              {gallery.map((item, index) => {
                const selected = (gallery[view] ? view : 0) === index;
                return (
                  <button
                    key={item.src || item.type}
                    type="button"
                    onClick={() => setView(index)}
                    aria-pressed={selected}
                    aria-label={galleryLabel(item)}
                    className={`relative aspect-square overflow-hidden rounded-2xl border-2 bg-white transition ${selected ? 'border-orange-brand' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    {item.type === 'viewer' && <div className="h-full w-full p-2"><ProductImage key={faces.frente} src={faces.frente} alt="" /></div>}
                    {item.type === 'composite' && <div className="h-full w-full p-1.5"><ProductCardImage product={product} /></div>}
                    {item.src && <ProductImage src={item.src} alt="" position={item.position} className="object-cover" />}
                    {item.type === 'viewer' && <span className="absolute bottom-1 right-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-black text-white">360°</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Información y compra */}
          <div className="min-w-0 space-y-7">
            <div className="space-y-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-orange-brand">{product.categoryLabel}</p>
              <h1 className="text-3xl font-black leading-tight tracking-[-0.03em] sm:text-5xl">{product.name}</h1>
              {product.includes && <p className="text-sm text-zinc-400">Incluye {product.includes.join(' + ')}</p>}
              <Price product={product} large />
              <p className="text-xs text-zinc-500">Envío calculado al finalizar la compra.</p>
            </div>

            <ColorSelector colors={product.colors} value={colorId} onChange={setColorId} label={product.colorSelectorLabel} />

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Cantidad</p>
              <QuantityControl value={quantity} onChange={setQuantity} min={1} />
            </div>

            {complements.length > 0 && (
              <section aria-labelledby="complementos" className="rounded-[22px] border border-white/10 bg-white/[0.03] p-5">
                <h2 id="complementos" className="text-base font-black">Complementa tu compra</h2>
                {product.upsellMessage && <p className="mt-2 rounded-xl bg-orange-brand/10 px-3 py-2 text-xs font-bold text-orange-light">{product.upsellMessage}</p>}
                <ul className="mt-2 divide-y divide-white/10">
                  {complements.map(item => (
                    <ComplementRow key={item.id} product={item} state={extras[item.id]} onChange={next => setExtras(current => ({ ...current, [item.id]: next }))} />
                  ))}
                </ul>
              </section>
            )}

            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={handleBuyNow} className="rounded-xl bg-orange-brand px-6 py-4 text-sm font-black text-white shadow-lg shadow-orange-brand/30 transition hover:bg-orange-hover">Comprar ahora</button>
                <button type="button" onClick={handleAddToCart} className="rounded-xl border border-white/25 px-6 py-4 text-sm font-black text-white transition hover:border-orange-brand hover:text-orange-brand">Agregar al carrito</button>
              </div>
              <p className="text-center text-xs text-zinc-400">Pago seguro • Envío en 1-2 días en Coquimbo y La Serena</p>
              <p className="text-center text-xs italic text-zinc-500">{product.notice}</p>
            </div>
          </div>
        </div>

        {/* Desplegables a ancho completo */}
        <div className="mt-14 border-t border-white/10">
          <Accordion title="Características">
            <p className="mb-3">{product.description}</p>
            <ul className="list-disc space-y-1.5 pl-5">{product.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
          </Accordion>
          <Accordion title="Especificaciones (medidas)">
            <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {product.specs.map(spec => (
                <div key={spec.label} className="flex justify-between gap-4 border-b border-white/5 py-2">
                  <dt className="text-zinc-400">{spec.label}</dt>
                  <dd className={spec.value === 'Pendiente' ? 'italic text-zinc-500' : 'font-semibold'}>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </Accordion>
          <Accordion title="Envíos y tarifas">
            <ul className="space-y-2">{SHIPPING_LINES.map(line => <li key={line}>{line}</li>)}</ul>
          </Accordion>
          <Accordion title="Cómo funciona">
            <ol className="grid gap-4 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step.text} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-brand/15 text-orange-brand">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{step.icon}</svg>
                  </span>
                  <span><span className="font-black text-white">{i + 1}.</span> {step.text}</span>
                </li>
              ))}
            </ol>
          </Accordion>
        </div>
      </div>

      {/* Móvil: barra fija con precio y compra */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-white/10 bg-[#07080a]/95 px-5 py-3 backdrop-blur-xl lg:hidden">
        <div className="min-w-0">
          <p className="truncate text-[11px] text-zinc-400">{product.name}{color && product.colors.length > 1 ? ` · ${color.name}` : ''}</p>
          <p className="text-lg font-black text-orange-brand">{formatCLP(product.price)} <span className="text-xs font-medium text-zinc-400">CLP</span></p>
        </div>
        <button type="button" onClick={handleBuyNow} className="shrink-0 rounded-xl bg-orange-brand px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-brand/30">Comprar ahora</button>
      </div>
    </div>
  );
}

// Una sola plantilla para todos los productos: /producto/:id toma los datos de products.json.
export default function ProductPage() {
  const { id } = useParams();
  const product = getProduct(id);
  if (!product) return <Navigate to="/" replace />;
  return <ProductDetail key={product.id} product={product} />;
}
