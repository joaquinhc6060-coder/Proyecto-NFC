import React from 'react';

export default function Benefits() {
  const benefits = [
    {
      title: "Acceso rápido",
      desc: "Información relevante a un solo toque de distancia, sin fricciones.",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ff5a2e" strokeWidth="2.2" strokeLinecap="round">
          <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
        </svg>
      )
    },
    {
      title: "Perfil editable",
      desc: "Actualiza los teléfonos, fotos o advertencias médicas en cualquier momento sin cambiar la placa.",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ff5a2e" strokeWidth="2.2" strokeLinecap="round">
          <path d="M4 20h4l11-11-4-4L4 16v4z" />
          <path d="M13 7l4 4" />
        </svg>
      )
    },
    {
      title: "Placa ligera y durable",
      desc: "Fabricada con materiales resistentes al agua y al juego diario de tu compañero.",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ff5a2e" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M6 14h12M8 10h8" />
        </svg>
      )
    },
    {
      title: "Uso 100% sencillo",
      desc: "Sin descargar aplicaciones, crear cuentas ni configuraciones complejas para quien la encuentra.",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ff5a2e" strokeWidth="2.2" strokeLinecap="round">
          <path d="M5 12l5 5 9-10" />
        </svg>
      )
    }
  ];

  return (
    <section id="beneficios" className="py-20 md:py-24 bg-cream">
      <div className="max-w-[1120px] w-[calc(100%-40px)] mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black leading-[1.1] tracking-[-0.03em] text-ink">
          Pensada para ser simple
        </h2>
        <p className="text-muted text-lg mt-3">
          Todo lo necesario para proteger a tu mascota sin complicaciones.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {benefits.map((item, idx) => (
            <article 
              key={idx}
              className="bg-white rounded-[22px] p-7 shadow-sm hover:shadow-md transition-shadow border border-ink/5 flex flex-col"
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center bg-cream-secondary mb-5 shrink-0" 
                aria-hidden="true"
              >
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">
                {item.title}
              </h3>
              <p className="text-muted text-sm sm:text-[0.95rem] leading-relaxed">
                {item.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

