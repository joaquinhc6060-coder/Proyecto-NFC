import React, { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "¿Cómo funciona el NFC?",
      a: "El NFC (Near Field Communication) es una tecnología inalámbrica de corto alcance que permite que cualquier teléfono inteligente compatible lea la placa al acercarse a pocos centímetros y abra automáticamente el perfil de tu mascota en el navegador web. Depende únicamente de que el teléfono cuente con NFC y esté activado."
    },
    {
      q: "¿Necesito una aplicación?",
      a: "No, absolutamente ninguna. Quien encuentra a la mascota no necesita descargar aplicaciones de ninguna tienda ni registrarse: el perfil web de tu mascota se abre al instante en el navegador nativo del smartphone (Safari, Chrome, etc.)."
    },
    {
      q: "¿Qué pasa si cambia mi información de contacto?",
      a: "No tienes que cambiar ni reemplazar la placa. El perfil es 100% digital y editable en la nube: puedes cambiar teléfonos de contacto, notas médicas, veterinario asignado o fotos cuantas veces quieras y se actualizará al segundo."
    },
    {
      q: "¿La placa necesita batería o recargarse?",
      a: "No. Las placas NFC son componentes pasivos que se energizan por inducción electromagnética con el propio teléfono que las escanea. No llevan pilas, no necesitan recargarse nunca y son resistentes al agua."
    }
  ];

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 md:py-24 bg-ink text-white">
      <div className="max-w-[1120px] w-[calc(100%-40px)] mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black leading-[1.1] tracking-[-0.03em]">
          Preguntas frecuentes
        </h2>
        <p className="text-muted-light text-lg mt-3">
          Respuestas a las dudas más comunes sobre la placa y su funcionamiento.
        </p>

        <div className="mt-10 space-y-3.5 max-w-[820px]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className="bg-ink-secondary rounded-[18px] px-6 border border-white/5 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full py-5 flex items-center justify-between text-left font-bold text-base sm:text-lg focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-white pr-4">{faq.q}</span>
                  <span className={`text-orange-brand text-2xl font-black transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <p className="text-muted-light text-sm sm:text-base pb-5 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

