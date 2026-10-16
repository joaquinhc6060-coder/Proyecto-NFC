import React, { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-[#07080a]/85 backdrop-blur-xl text-white border-b border-white/10 transition-colors">
      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto flex items-center justify-between h-[72px]">
        
        {/* Brand Logo with exact FindeMe pin from the video */}
        <a 
          href="#inicio" 
          className="flex items-center gap-2.5 font-extrabold text-[1.35rem] tracking-[-0.03em] text-white hover:opacity-90 transition-opacity" 
          aria-label="FindeMe, página principal"
          onClick={closeMenu}
        >
          <span className="w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center text-teal-brand shadow-inner" aria-hidden="true">
            <span className="text-sm">📍</span>
          </span>
          <span className="font-black">Finde<b className="text-orange-brand">Me</b></span>
          <span className="hidden sm:inline-block text-[9px] font-mono uppercase tracking-widest text-teal-brand bg-teal-brand/10 border border-teal-brand/30 px-2 py-0.5 rounded-full ml-1">
            NFC
          </span>
        </a>

        {/* Mobile menu toggle button */}
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden flex items-center justify-center p-2 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors" 
          aria-expanded={isOpen} 
          aria-controls="mobile-menu"
          aria-label="Alternar menú de navegación"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
          <a href="#animales" className="text-muted-light hover:text-orange-brand transition-colors flex items-center gap-1.5">
            <span>🐾</span> Animales
          </a>
          <a href="#ninos" className="text-muted-light hover:text-teal-brand transition-colors flex items-center gap-1.5">
            <span>👶</span> Kids
          </a>
          <a href="#restaurantes" className="text-muted-light hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <span>🍽️</span> Gastro & VIP
          </a>
          <a href="#video-didactico" className="text-muted-light hover:text-white transition-colors flex items-center gap-1.5">
            <span>📹</span> Video
          </a>
          <a href="#demo" className="text-muted-light hover:text-white transition-colors">
            Simulador
          </a>
          <a 
            href="#minfc" 
            className="inline-flex items-center gap-1.5 text-xs font-mono text-teal-brand bg-teal-brand/10 hover:bg-teal-brand/20 border border-teal-brand/30 px-3.5 py-1.5 rounded-full transition-all"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-brand animate-ping" />
            <span>Mi NFC</span>
          </a>
          <a 
            href="#contacto" 
            className="inline-flex items-center justify-center text-xs font-extrabold bg-orange-brand text-white px-5 py-2.5 rounded-full hover:bg-orange-hover hover:scale-105 transition-all shadow-md shadow-orange-brand/20"
          >
            Contacto
          </a>
        </nav>

      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <nav id="mobile-menu" className="lg:hidden bg-[#0c0d12] border-t border-white/10 px-6 py-6 flex flex-col gap-4 text-sm font-semibold">
          <a 
            href="#animales" 
            onClick={closeMenu}
            className="text-white hover:text-orange-brand py-1 flex items-center gap-2"
          >
            <span>🐾</span> FindeMe Animales
          </a>
          <a 
            href="#ninos" 
            onClick={closeMenu}
            className="text-white hover:text-teal-brand py-1 flex items-center gap-2"
          >
            <span>👶</span> FindeMe Kids
          </a>
          <a 
            href="#restaurantes" 
            onClick={closeMenu}
            className="text-white hover:text-amber-400 py-1 flex items-center gap-2"
          >
            <span>🍽️</span> FindeMe Gastro & VIP
          </a>
          <a 
            href="#video-didactico" 
            onClick={closeMenu}
            className="text-muted-light hover:text-white py-1 flex items-center gap-2"
          >
            <span>📹</span> Video Didáctico
          </a>
          <a 
            href="#demo" 
            onClick={closeMenu}
            className="text-muted-light hover:text-white py-1"
          >
            Simulador en Vivo
          </a>
          <a 
            href="#minfc" 
            onClick={closeMenu}
            className="text-teal-brand font-mono py-1 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
            Panel Mi NFC
          </a>
          <a 
            href="#contacto" 
            onClick={closeMenu}
            className="mt-2 text-center font-bold bg-orange-brand text-white py-3 rounded-full hover:bg-orange-hover"
          >
            Cotizar / Contacto
          </a>
        </nav>
      )}
    </header>
  );
}
