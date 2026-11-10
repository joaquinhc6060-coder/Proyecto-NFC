import React, { useId, useState } from 'react';

export function QuantityControl({ value, onChange, min = 1, max = 99, label = 'Cantidad', size = 'md' }) {
  const small = size === 'sm';
  const button = `flex items-center justify-center rounded-lg border border-white/15 font-black transition hover:border-orange-brand hover:text-orange-brand disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-white/15 disabled:hover:text-current ${small ? 'h-8 w-8 text-sm' : 'h-11 w-11 text-lg'}`;
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <button type="button" className={button} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Restar uno a ${label.toLowerCase()}`}>−</button>
      <output aria-live="polite" className={`text-center font-black tabular-nums ${small ? 'w-6 text-sm' : 'w-10 text-lg'}`}>{value}</output>
      <button type="button" className={button} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Sumar uno a ${label.toLowerCase()}`}>+</button>
    </div>
  );
}

// Círculos de color accesibles: son radios nativos, así que funcionan con Tab y flechas.
export function ColorSelector({ colors, value, onChange, label = 'Color', size = 'md' }) {
  const name = useId();
  if (!colors?.length) return null;
  const selected = colors.find(color => color.id === value) || colors[0];
  const dot = size === 'sm' ? 'h-6 w-6' : 'h-9 w-9';
  return (
    <fieldset className="min-w-0">
      <legend className={size === 'sm' ? 'sr-only' : 'mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400'}>
        {label}: <span className="normal-case tracking-normal text-white">{selected.name}</span>
      </legend>
      <div className="flex flex-wrap items-center gap-2.5">
        {colors.map(color => (
          <label key={color.id} className="relative cursor-pointer" title={color.name}>
            <input type="radio" name={name} value={color.id} checked={selected.id === color.id} onChange={() => onChange(color.id)} className="peer sr-only" />
            <span className="sr-only">{color.name}</span>
            <span
              aria-hidden="true"
              className={`block rounded-full border border-white/30 ring-offset-2 ring-offset-[#07080a] transition peer-checked:ring-2 peer-checked:ring-orange-brand peer-focus-visible:ring-2 peer-focus-visible:ring-white ${dot}`}
              style={{ background: color.hex }}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="border-b border-white/10">
      <h3>
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)} className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-bold transition hover:text-orange-brand">
          {title}
          <svg className={`h-5 w-5 shrink-0 text-orange-brand transition-transform duration-300 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
      </h3>
      <div id={id} hidden={!open} className="pb-6 text-sm leading-relaxed text-zinc-300">{children}</div>
    </div>
  );
}
