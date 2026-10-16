import React from 'react';

export default function Benefits() {
  const benefits = [
    {
      title: "Acceso Instantáneo sin App",
      desc: "Quien encuentre a tu mascota acerca su celular y ve su perfil en menos de 1 segundo. Sin descargas, sin registros previos y sin cuentas.",
      icon: "⚡",
      badge: "Ultrarrápido",
      accent: "text-teal-brand bg-teal-brand/10 border-teal-brand/30"
    },
    {
      title: "Ficha Médica y Alergias en Vivo",
      desc: "Modifica teléfonos, advertencias sobre alimentos tóxicos o medicación en tiempo real desde tu panel sin tener que reemplazar la placa física.",
      icon: "🩺",
      badge: "Salud 24/7",
      accent: "text-orange-brand bg-orange-brand/10 border-orange-brand/30"
    },
    {
      title: "Sin Baterías ni Recargas",
      desc: "El microchip pasivo NTAG213 funciona por inducción electromagnética. Nunca se apagará ni te dejará sin batería en una emergencia.",
      icon: "🔋",
      badge: "Cero Mantenimiento",
      accent: "text-teal-brand bg-teal-brand/10 border-teal-brand/30"
    },
    {
      title: "Envío de Ubicación Directa a WhatsApp",
      desc: "La persona que rescata a tu compañero puede presionar un solo botón y enviarte un mensaje con el punto exacto donde fue escaneada la placa.",
      icon: "📍",
      badge: "Seguridad Activa",
      accent: "text-orange-brand bg-orange-brand/10 border-orange-brand/30"
    }
  ];

  return (
    <section id="beneficios" className="py-24 md:py-32 bg-[#0c0d12] text-white relative overflow-hidden border-t border-white/5">
      {/* Background glow */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-teal-brand/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1160px] w-[calc(100%-40px)] mx-auto relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-brand/10 border border-teal-brand/30 text-teal-brand font-bold tracking-[0.1em] uppercase text-xs mb-3.5">
            Ventajas del Ecosistema
          </div>

          <h2 className="text-3xl sm:text-5xl font-black leading-[1.08] tracking-[-0.035em]">
            Tecnología diseñada para la <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-brand to-orange-light">
              vida real de tu mascota.
            </span>
          </h2>
          <p className="text-muted-light text-base sm:text-lg mt-4 max-w-xl mx-auto">
            Protección pasiva duradera y tranquilidad mental para ti, todos los días.
          </p>
        </div>

        {/* Modern Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {benefits.map((item, idx) => (
            <article 
              key={idx}
              className="group relative bg-[#13151e] hover:bg-[#181b27] rounded-[28px] p-8 sm:p-9 border border-white/10 hover:border-white/20 shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${item.accent}`}>
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-teal-brand transition-colors">
                  {item.title}
                </h3>
                <p className="text-muted-light text-sm sm:text-base leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-semibold text-muted-dim group-hover:text-white transition-colors">
                <span>FindMe Smart Protection</span>
                <span className="ml-auto text-teal-brand">→</span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
