import React from 'react';
import MiNfc from '../components/MiNfc';

export default function LoginPage() {
  return (
    <div className="py-12 bg-[#07080a] min-h-[85vh]">
      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-brand/10 border border-teal-brand/30 text-teal-brand font-mono text-xs uppercase tracking-[0.16em] mb-3">
          <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
          ACCESO CLIENTES & PROPIETARIOS
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          Portal <span className="text-teal-brand">Mi NFC</span>
        </h1>
        <p className="text-muted-light text-sm sm:text-base mt-2 max-w-lg mx-auto">
          Gestiona los datos de contacto, advertencias médicas y ubicación de tus dispositivos FindeMe en tiempo real.
        </p>
      </div>

      <MiNfc />
    </div>
  );
}
