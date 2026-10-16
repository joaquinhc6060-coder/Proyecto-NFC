import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#050608] text-muted-light py-8 border-t border-white/5 text-sm">
      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        {/* Brand */}
        <div className="flex items-center gap-2.5 font-extrabold text-[1.25rem] tracking-[-0.03em] text-white">
          <span className="w-7 h-7 rounded-full bg-black border border-white/20 flex items-center justify-center text-teal-brand text-xs shadow-inner" aria-hidden="true">
            📍
          </span>
          <span className="font-black">Finde<b className="text-orange-brand">Me</b></span>
        </div>

        {/* Copyright */}
        <div className="text-xs text-muted-dim">
          © 2026 FindeMe · Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
}
