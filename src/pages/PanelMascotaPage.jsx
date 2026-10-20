import React from 'react';
import { Link } from 'react-router-dom';
import MiNfc from '../components/MiNfc';

export default function PanelMascotaPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white py-10 px-4 sm:px-6 relative selection:bg-orange-brand selection:text-white">
      {/* Luces de fondo ambient */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-orange-brand/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-brand/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-[1240px] w-full mx-auto relative z-10 space-y-6">
        
        {/* Cabecera del Panel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/[0.08] gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-brand animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-orange-brand">
                PANEL DE CONTROL · MASCOTAS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Gestión de Placa Inteligente <span className="text-teal-brand">Luna</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-muted-light transition-colors"
            >
              Cerrar Sesión ↗
            </Link>
            <Link
              to="/"
              className="px-4 py-2 rounded-full bg-orange-brand hover:bg-orange-hover text-white text-xs font-bold transition-all shadow-md shadow-orange-brand/20"
            >
              ← Volver al Portal
            </Link>
          </div>
        </div>

        {/* Componente de Gestión de Mascota */}
        <MiNfc initialLoggedIn={true} />

      </div>
    </div>
  );
}
