import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050608] text-muted-light py-10 border-t border-white/5 text-sm">
      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-sm">📍</span>
            <strong className="text-white font-extrabold text-base">Finde<span className="text-orange-brand">Me</span></strong>
            <span className="text-xs font-mono text-teal-brand bg-teal-brand/10 border border-teal-brand/30 px-2 py-0.5 rounded-full ml-1">
              Contactless Ecosystem
            </span>
          </div>
          <p className="text-xs text-muted-dim mt-1.5">
            Tecnología NFC pasiva universal para mascotas, niños y gastronomía.
          </p>
        </div>

        {/* Quick Nav Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold uppercase tracking-wider text-muted-light">
          <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
          <Link to="/mascotas" className="hover:text-orange-brand transition-colors">🐾 Mascotas</Link>
          <Link to="/kids" className="hover:text-teal-brand transition-colors">👶 Kids</Link>
          <Link to="/restaurantes" className="hover:text-amber-400 transition-colors">🍽️ Restaurantes</Link>
          <Link to="/contacto" className="hover:text-white transition-colors">✉️ Contacto</Link>
          <Link to="/login" className="hover:text-orange-brand transition-colors font-mono">Mi NFC · Login</Link>
        </div>

        <div className="text-xs text-muted-dim">
          © {currentYear} FindeMe · Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
}
