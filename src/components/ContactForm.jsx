import React, { useState } from 'react';

export default function ContactForm() {
  const [email, setEmail] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('animales');
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
    setTimeout(() => {
      setIsSubmitting(false);
      setMsg({ 
        text: '¡Gracias por tu interés! Hemos registrado tu solicitud para la línea seleccionada.', 
        isError: false 
      });
      setEmail('');
    }, 450);
  };

  return (
    <section 
      id="contacto" 
      className="py-24 lg:py-32 text-white text-center bg-gradient-to-br from-[#ff5a2e] via-[#e0481d] to-[#12141a] relative overflow-hidden"
    >
      <div className="max-w-[1120px] w-[calc(100%-48px)] mx-auto relative z-10">
        
        <span className="inline-block px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-white font-mono text-xs uppercase tracking-widest mb-4">
          CONTACTO & PREVENTA OFICIAL
        </span>

        <h2 className="text-3xl sm:text-5xl font-black leading-[1.05] tracking-[-0.035em] max-w-xl mx-auto uppercase">
          Sé parte de la nueva era contactless
        </h2>
        
        <p className="mt-4 mb-10 text-base sm:text-lg max-w-xl mx-auto text-white/90 leading-relaxed font-light">
          Déjanos tu correo para recibir información prioritaria o cotizaciones según la solución que necesitas.
        </p>

        <form onSubmit={handleSubmit} noValidate className="max-w-[480px] mx-auto text-left flex flex-col gap-4 bg-black/40 p-6 sm:p-8 rounded-[32px] border border-white/15 backdrop-blur-xl shadow-2xl">
          
          {/* Product selector */}
          <div>
            <label className="font-bold text-xs uppercase tracking-wider block mb-2 text-white/90">
              ¿Qué línea de producto te interesa?
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedProduct('animales')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  selectedProduct === 'animales'
                    ? 'bg-white text-ink border-white font-bold shadow'
                    : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10'
                }`}
              >
                🐾 Animales
              </button>

              <button
                type="button"
                onClick={() => setSelectedProduct('kids')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  selectedProduct === 'kids'
                    ? 'bg-white text-ink border-white font-bold shadow'
                    : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10'
                }`}
              >
                👶 Kids (Pulseras)
              </button>

              <button
                type="button"
                onClick={() => setSelectedProduct('gastro')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  selectedProduct === 'gastro'
                    ? 'bg-white text-ink border-white font-bold shadow'
                    : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10'
                }`}
              >
                🍽️ Gastro & VIP
              </button>

              <button
                type="button"
                onClick={() => setSelectedProduct('todas')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  selectedProduct === 'todas'
                    ? 'bg-white text-ink border-white font-bold shadow'
                    : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10'
                }`}
              >
                ⚡ Todo el Ecosistema
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="user-email" className="font-bold text-xs uppercase tracking-wider block mb-1.5 text-white/90">
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
              className="w-full px-4 py-3.5 rounded-2xl text-ink bg-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-teal-brand/50 font-medium text-sm shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-black px-6 py-4 rounded-full bg-ink text-white hover:bg-black hover:scale-[1.02] active:scale-100 transition-all shadow-xl mt-2 text-xs uppercase tracking-wider disabled:opacity-75"
          >
            {isSubmitting ? 'Enviando solicitud...' : 'Solicitar Información'}
          </button>

          {msg.text && (
            <p 
              role="status" 
              aria-live="polite"
              className={`text-xs font-semibold text-center p-3 rounded-xl mt-1 ${
                msg.isError ? 'bg-red-500/20 border border-red-500/40 text-red-200' : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'
              }`}
            >
              {msg.text}
            </p>
          )}

        </form>

      </div>
    </section>
  );
}
