import React, { useState } from 'react';

const emptyForm = { name: '', email: '', phone: '', subject: '', message: '' };

export default function ContactForm() {
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState({ text: '', isError: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (msg.text) setMsg({ text: '', isError: false });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name || !message || !/^\S+@\S+\.\S+$/.test(email)) {
      setMsg({ text: 'Completa tu nombre, correo válido y mensaje para poder enviarlo.', isError: true });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/vigio-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: form.phone.trim(), subject: form.subject.trim(), message, company: '' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || 'No pudimos enviar tu mensaje.');
      setMsg({ text: '¡Gracias! Recibimos tu mensaje y te responderemos pronto.', isError: false });
      setForm(emptyForm);
    } catch (error) {
      console.warn('No se pudo registrar el contacto:', error);
      setMsg({ text: 'No pudimos enviar tu mensaje. Inténtalo nuevamente en unos minutos.', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="relative overflow-hidden bg-[#07080a] pb-20 pt-5 text-center text-white sm:pb-24 lg:pb-28">
      <div className="relative z-10 mx-auto w-[calc(100%-48px)] max-w-[1120px]">


        <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-[780px] rounded-[30px] border border-white/15 bg-[#111216]/90 p-5 text-left shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-brand text-base shadow-lg shadow-orange-brand/25" aria-hidden="true">✉</span>
            <div>
              <p className="text-sm font-black text-white">Contáctanos</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="sr-only" htmlFor="contact-name">Nombre</label>
              <input id="contact-name" type="text" autoComplete="name" value={form.name} onChange={updateField('name')} placeholder="Nombre *" required className="vigio-contact-input" />
            </div>
            <div>
              <label className="sr-only" htmlFor="contact-email">Correo electrónico</label>
              <input id="contact-email" type="email" autoComplete="email" value={form.email} onChange={updateField('email')} placeholder="Email *" required className="vigio-contact-input" />
            </div>
          </div>

          <div className="mt-3">
            <label className="sr-only" htmlFor="contact-phone">Teléfono</label>
            <input id="contact-phone" type="tel" autoComplete="tel" value={form.phone} onChange={updateField('phone')} placeholder="Teléfono (opcional)" className="vigio-contact-input" />
          </div>

          <div className="mt-3">
            <label className="sr-only" htmlFor="contact-subject">Asunto</label>
            <input id="contact-subject" type="text" value={form.subject} onChange={updateField('subject')} placeholder="Asunto" className="vigio-contact-input" />
          </div>

          <div className="mt-3">
            <label className="sr-only" htmlFor="contact-message">Mensaje</label>
            <textarea id="contact-message" rows="6" value={form.message} onChange={updateField('message')} placeholder="Mensaje *" required className="vigio-contact-input min-h-40 resize-y py-4" />
          </div>

          <div className="mt-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-relaxed text-zinc-500">Usaremos tus datos solo para responder esta consulta.</p>
            <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-orange-brand px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-brand/20 transition hover:scale-[1.02] hover:bg-orange-hover disabled:cursor-wait disabled:opacity-70 sm:w-auto">
              {isSubmitting ? 'Enviando…' : 'Enviar mensaje'} →
            </button>
          </div>

          {msg.text && <p role="status" aria-live="polite" className={`mt-5 rounded-xl border p-3 text-center text-sm font-semibold ${msg.isError ? 'border-red-400/35 bg-red-500/15 text-red-200' : 'border-emerald-400/35 bg-emerald-500/15 text-emerald-100'}`}>{msg.text}</p>}
        </form>
      </div>
    </section>
  );
}
