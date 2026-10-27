import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#050608] text-muted-light py-10 border-t border-white/5 text-sm">
      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-brand overflow-hidden shadow-md shadow-orange-brand/20 flex items-center justify-center shrink-0">
            <img src="/images/vigio-logo.jpg" alt="Vigio" className="w-full h-full object-cover scale-110" />
          </div>
          <span className="font-black text-white text-xl tracking-tight leading-none">
            VIGI<span className="text-orange-brand">O</span>
          </span>
        </div>

        {/* Copyright */}
        <div className="text-xs text-muted-dim font-mono">
          © 2026 Vigio · Todos los derechos reservados · <span className="text-orange-brand">vigio.cl</span>
        </div>
      </div>
    </footer>
  );
}
