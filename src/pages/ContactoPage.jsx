import React from 'react';
import ContactForm from '../components/ContactForm';

export default function ContactoPage() {
  return (
    <div className="py-12 bg-[#07080a] min-h-[85vh] text-white">
      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-brand/10 border border-teal-brand/30 text-teal-brand font-mono text-xs uppercase tracking-[0.16em] mb-4">
          <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
          ATENCIÓN & CONSULTAS COMERCIALES
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] uppercase">
          ¿Hablamos de tu próximo <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-brand via-white to-orange-brand">
            dispositivo FindeMe?
          </span>
        </h1>

        <p className="text-muted-light text-base sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
          Para pedidos individuales de mascotas o niños, o implementaciones a gran escala para restaurantes, hoteles y colegios.
        </p>
      </div>

      {/* Main Contact Form Component */}
      <ContactForm />
    </div>
  );
}
