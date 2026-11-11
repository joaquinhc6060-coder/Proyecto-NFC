import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { formatCLP, productPath } from '../lib/products';
import { QuantityControl } from './product/ProductControls';
import ProductCardImage from './product/ProductCardImage';

const POSITION_KEY = 'vigio:cart-button-position';
const WHATSAPP_NUMBER = '56930536140';

function clampCartPosition(x, y) {
  return {
    x: Math.max(8, Math.min(window.innerWidth - 60, x)),
    y: Math.max(72, Math.min(window.innerHeight - 60, y)),
  };
}

function CartIcon({ className = 'h-5 w-5' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L20 8H7" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>;
}

function TrashIcon({ className = 'h-4 w-4' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>;
}

const normalizePhone = value => value.replace(/[^0-9+]/g, '').replace(/^\+?56/, '56').replace(/^9/, '569');
const validPhone = value => /^569\d{8}$/.test(normalizePhone(value));

function discountFor(items, subtotal, coupon) {
  if (coupon !== 'VIGIO10') return { amount: 0, message: coupon ? 'Código no válido.' : '' };
  if (items.some(item => item.product.regularPrice)) return { amount: 0, message: 'VIGIO10 no es acumulable con packs.' };
  return { amount: Math.round(subtotal * 0.1), message: 'Código VIGIO10 aplicado: 10% de descuento.' };
}

function EmptyCart({ closeCart }) {
  return <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-brand/15 text-orange-brand"><CartIcon className="h-8 w-8" /></span>
    <h2 className="mt-5 text-xl font-black">Tu carrito está vacío</h2>
    <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">Explora las placas y pulseras Vigio para preparar tu cotización.</p>
    <Link to="/#catalogo" onClick={closeCart} className="mt-6 rounded-xl bg-orange-brand px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-brand/25">Ver productos</Link>
  </div>;
}

function QuoteForm() {
  const { user } = useAuth();
  const { items, subtotal } = useCart();
  const displayName = user?.user_metadata?.nombre_completo || user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  const [form, setForm] = useState({ name: displayName, email: user?.email || '', phone: '', address: '', coupon: '' });
  const [error, setError] = useState('');

  useEffect(() => setForm(current => ({ ...current, name: current.name || displayName, email: current.email || user?.email || '' })), [displayName, user?.email]);

  const coupon = form.coupon.trim().toUpperCase();
  const discount = discountFor(items, subtotal, coupon);
  const total = subtotal - discount.amount;
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

  const sendQuote = event => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !validPhone(form.phone)) { setError('Completa nombre, correo electrónico y un teléfono chileno válido.'); return; }
    const lines = [
      'Hola Vigio, quiero solicitar una cotización:',
      '',
      ...items.map(item => `• ${item.product.name}${item.colorId ? ` · ${item.product.colors?.find(color => color.id === item.colorId)?.name || item.colorId}` : ''} × ${item.quantity} — ${formatCLP(item.product.price * item.quantity)}`),
      '',
      `Subtotal: ${formatCLP(subtotal)}`,
      ...(discount.amount ? [`Descuento ${coupon}: -${formatCLP(discount.amount)}`] : []),
      `Total estimado: ${formatCLP(total)}`,
      '',
      `Nombre: ${form.name.trim()}`,
      `Correo: ${form.email.trim()}`,
      `Teléfono: +${normalizePhone(form.phone)}`,
      ...(form.address.trim() ? [`Dirección / comuna: ${form.address.trim()}`] : []),
      ...(coupon ? [`Código informado: ${coupon}`] : []),
    ];
    const popup = window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
    if (!popup) { setError('Tu navegador bloqueó WhatsApp. Permite ventanas emergentes e inténtalo nuevamente.'); return; }
    setError('');
  };

  return <form onSubmit={sendQuote} className="mt-5 space-y-3 border-t border-white/10 pt-5">
    <div><p className="text-sm font-black">Solicita tu cotización</p><p className="mt-1 text-xs leading-relaxed text-zinc-400">La enviaremos preparada a WhatsApp. No se realiza ningún cobro todavía.</p></div>
    <label className="block text-xs font-bold text-zinc-300">Nombre<input name="name" value={form.name} onChange={update} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-orange-brand" /></label>
    <label className="block text-xs font-bold text-zinc-300">Correo electrónico<input name="email" type="email" value={form.email} onChange={update} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-orange-brand" /></label>
    <label className="block text-xs font-bold text-zinc-300">Teléfono de contacto<input name="phone" inputMode="tel" placeholder="+56 9 1234 5678" value={form.phone} onChange={update} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-orange-brand" /></label>
    <label className="block text-xs font-bold text-zinc-300">Dirección o comuna <span className="font-normal text-zinc-500">(opcional)</span><input name="address" value={form.address} onChange={update} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-orange-brand" /></label>
    <label className="block text-xs font-bold text-zinc-300">Código de descuento <span className="font-normal text-zinc-500">(opcional)</span><input name="coupon" value={form.coupon} onChange={update} placeholder="VIGIO10" className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm uppercase text-white outline-none focus:border-orange-brand" /></label>
    {discount.message && <p className={`text-xs ${discount.amount ? 'text-teal-brand' : 'text-orange-light'}`}>{discount.message}</p>}
    <div className="flex items-center justify-between border-t border-white/10 pt-3"><span className="text-sm font-bold text-zinc-300">Total estimado</span><span className="text-xl font-black text-orange-brand">{formatCLP(total)} <small className="text-xs font-medium text-zinc-400">CLP</small></span></div>
    {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</p>}
    <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3.5 text-sm font-black text-[#071109] shadow-lg shadow-[#25D366]/20 transition hover:brightness-110"><span aria-hidden="true">◔</span> Enviar cotización por WhatsApp</button>
  </form>;
}

function CartPanel() {
  const { items, subtotal, setQuantity, removeItem, clearCart, isOpen, closeCart } = useCart();
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true" aria-label="Carrito de compra">
    <button type="button" aria-label="Cerrar carrito" onClick={closeCart} className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />
    <aside className="relative flex h-full w-full max-w-[430px] flex-col border-l border-white/10 bg-[#111216] shadow-2xl">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><p className="text-lg font-black">Tu carrito</p><p className="text-xs text-zinc-400">{items.length ? `${items.reduce((sum, item) => sum + item.quantity, 0)} producto(s) seleccionados` : 'Aún no agregas productos'}</p></div><button type="button" onClick={closeCart} className="flex h-11 w-11 items-center justify-center rounded-md border border-white/20 bg-black/20 text-2xl leading-none text-zinc-200 transition hover:border-orange-brand hover:bg-orange-brand hover:text-white" aria-label="Cerrar carrito">×</button></header>
      {!items.length ? <EmptyCart closeCart={closeCart} /> : <div className="flex-1 overflow-y-auto px-5 py-4">
        <ul className="divide-y divide-white/10">{items.map(item => { const color = item.product.colors?.find(entry => entry.id === item.colorId); return <li key={`${item.productId}-${item.colorId}`} className="flex gap-3 py-4"><div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2"><ProductCardImage product={item.product} /></div><div className="min-w-0 flex-1"><div className="flex gap-2"><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{item.product.name}</p>{color && <p className="mt-0.5 text-xs text-zinc-400">{color.name}</p>}</div><button type="button" onClick={() => removeItem(item.productId, item.colorId)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-400/25 bg-red-500/10 text-red-300 transition hover:bg-red-500 hover:text-white" aria-label={`Quitar ${item.product.name}`} title="Quitar producto"><TrashIcon /></button></div><div className="mt-3 flex items-center justify-between gap-2"><QuantityControl size="sm" value={item.quantity} onChange={quantity => setQuantity(item.productId, item.colorId, quantity)} label={`Cantidad de ${item.product.name}`} /><p className="text-sm font-black text-orange-brand">{formatCLP(item.product.price * item.quantity)}</p></div></div></li>; })}</ul>
        <div className="mt-3 flex items-center justify-between"><span className="text-sm text-zinc-400">Subtotal</span><span className="text-lg font-black">{formatCLP(subtotal)} CLP</span></div>
        <button type="button" onClick={clearCart} className="mt-4 text-xs text-zinc-500 underline-offset-4 hover:text-white hover:underline">Vaciar carrito</button>
        <QuoteForm />
      </div>}
    </aside>
  </div>;
}

export default function FloatingCart() {
  const { count, isOpen, openCart } = useCart();
  const [position, setPosition] = useState(null);
  const pointer = useRef(null);
  const dragged = useRef(false);
  const latestPosition = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(POSITION_KEY) || 'null');
      if (Number.isFinite(saved?.x) && Number.isFinite(saved?.y)) {
        const safe = clampCartPosition(saved.x, saved.y);
        latestPosition.current = safe;
        setPosition(safe);
        return;
      }
    } catch { /* Se usa la posición inicial. */ }
    const initial = { x: Math.max(16, window.innerWidth - 76), y: Math.max(96, window.innerHeight - 94) };
    latestPosition.current = initial;
    setPosition(initial);
  }, []);

  useEffect(() => {
    const keepButtonVisible = () => {
      if (!latestPosition.current) return;
      const safe = clampCartPosition(latestPosition.current.x, latestPosition.current.y);
      latestPosition.current = safe;
      setPosition(safe);
      try { window.localStorage.setItem(POSITION_KEY, JSON.stringify(safe)); } catch { /* La posición queda para esta visita. */ }
    };
    window.addEventListener('resize', keepButtonVisible);
    return () => window.removeEventListener('resize', keepButtonVisible);
  }, []);

  const startDrag = event => { const origin = latestPosition.current || position || { x: Math.max(16, window.innerWidth - 76), y: Math.max(96, window.innerHeight - 94) }; pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, origin }; dragged.current = false; event.currentTarget.setPointerCapture?.(event.pointerId); };
  const moveDrag = event => { if (!pointer.current || pointer.current.id !== event.pointerId) return; const next = clampCartPosition(pointer.current.origin.x + event.clientX - pointer.current.x, pointer.current.origin.y + event.clientY - pointer.current.y); if (Math.abs(next.x - pointer.current.origin.x) > 3 || Math.abs(next.y - pointer.current.origin.y) > 3) dragged.current = true; latestPosition.current = next; setPosition(next); };
  const finishDrag = event => { if (!pointer.current || pointer.current.id !== event.pointerId) return; try { window.localStorage.setItem(POSITION_KEY, JSON.stringify(latestPosition.current || pointer.current.origin)); } catch { /* La posición queda para esta visita. */ } pointer.current = null; };
  const activate = () => { if (!dragged.current) openCart(); dragged.current = false; };

  return <><button type="button" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag} onClick={activate} style={position ? { left: position.x, top: position.y } : { right: 24, bottom: 24 }} className="fixed z-[70] flex h-14 w-14 touch-none items-center justify-center rounded-2xl border border-white/20 bg-orange-brand text-white shadow-[0_16px_35px_rgba(255,90,38,0.42)] transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-brand" aria-label={`Abrir carrito${count ? `, ${count} productos` : ''}`} title="Arrastra para mover el carrito"><CartIcon className="h-6 w-6" />{count > 0 && <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-[#07080a] bg-teal-brand px-1 text-[11px] font-black text-[#071109]">{count > 99 ? '99+' : count}</span>}</button><CartPanel /></>;
}
