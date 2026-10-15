import React, { useState } from 'react';

export default function ContactForm() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState({ text: '', isError: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    const isValid = /^\S+@\S+\.\S+$/.test(trimmed);

    if (!isValid) {
      setMsg({ text: 'Por favor, escribe un correo electrónico válido.', isError: true });
      return;
    }

    setIsSubmitting(true);
    // Simulate lightweight client-side network delay
    setTimeout(() => {
      setIsSubmitting(false);
      setMsg({ 
        text: '¡Gracias por tu interés! Hemos registrado tu correo para notificarte del lanzamiento.', 
        isError: false 
      });
      setEmail('');
    }, 400);
  };

  return (
    <section 
      id="contacto" 
      className="py-20 md:py-24 text-white text-center"
      style={{
        background: 'linear-gradient(135deg, #ff5a2e, #ff8a4c)'
      }}
    >
      <div className="max-w-[1120px] w-[calc(100%-40px)] mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black leading-[1.1] tracking-[-0.03em] max-w-xl mx-auto">
          Dale a tu mascota una forma de volver
        </h2>
        <p className="mt-4 mb-8 text-base sm:text-lg max-w-xl mx-auto text-white/90 leading-relaxed">
          Déjanos tu correo para saber cuándo esté disponible el primer lote con descuento. Aún no hay compra en línea abierta.
        </p>

        <form onSubmit={handleSubmit} noValidate className="max-w-[440px] mx-auto text-left flex flex-col gap-3">
          <div>
            <label htmlFor="user-email" className="font-bold text-sm block mb-1 text-white">
              Correo electrónico
            </label>
            <input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (msg.text) setMsg({ text: '', isError: false });
              }}
              placeholder="tu@correo.com"
              required
              className="w-full px-4 py-3.5 rounded-2xl text-ink bg-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-ink/20 font-medium text-base shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-bold px-6 py-3.5 rounded-full bg-ink text-white hover:bg-black hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md mt-1 disabled:opacity-75"
          >
            {isSubmitting ? 'Registrando...' : 'Quiero más información'}
          </button>

          <p 
            id="formMsg" 
            role="status" 
            aria-live="polite"
            className={`min-h-[1.5em] text-sm font-bold text-center mt-2 ${
              msg.isError ? 'text-ink bg-white/80 p-2 rounded-lg' : 'text-white'
            }`}
          >
            {msg.text}
          </p>
        </form>
      </div>
    </section>
  );
}

