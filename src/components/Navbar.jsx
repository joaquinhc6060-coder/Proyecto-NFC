import React, { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-[#12141a]/90 backdrop-blur-md text-white border-b border-white/10 transition-colors">
      <div className="max-w-[1120px] w-[calc(100%-40px)] mx-auto flex items-center justify-between h-[68px]">
        {/* Brand */}
        <a 
          href="#inicio" 
          className="flex items-center gap-2.5 font-extrabold text-[1.3rem] tracking-[-0.02em] text-white hover:opacity-95 transition-opacity" 
          aria-label="FindMe, inicio"
          onClick={closeMenu}
        >
          <span className="w-[30px] h-[30px] rounded-full bg-ink border-2 border-teal-brand flex items-center justify-center text-teal-brand" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16d1b0" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 9a9 9 0 0 1 0 6M9 6.5a13 13 0 0 1 0 11M13 4a17 17 0 0 1 0 16" />
            </svg>
          </span>
          <span>Find<b className="text-orange-brand">Me</b></span>
        </a>

        {/* Mobile menu toggle */}
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex items-center justify-center p-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors" 
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
        <nav className="hidden md:flex items-center gap-6">
          <a href="#ecosistema" className="text-sm font-semibold text-muted-dim hover:text-teal-brand transition-colors">
            Ecosistema
          </a>
          <a href="#como-funciona" className="text-sm font-semibold text-muted-dim hover:text-teal-brand transition-colors">
            Cómo funciona
          </a>
          <a href="#beneficios" className="text-sm font-semibold text-muted-dim hover:text-teal-brand transition-colors">
            Beneficios
          </a>
          <a href="#demo" className="text-sm font-semibold text-muted-dim hover:text-teal-brand transition-colors">
            Demostración
          </a>
          <a href="#faq" className="text-sm font-semibold text-muted-dim hover:text-teal-brand transition-colors">
            Preguntas frecuentes
          </a>
          <a 
            href="#mi-nfc" 
            className="inline-flex items-center gap-1.5 text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-full hover:border-teal-brand/60 transition-all shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16d1b0" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 9a9 9 0 0 1 0 6M9 6.5a13 13 0 0 1 0 11M13 4a17 17 0 0 1 0 16" />
            </svg>
            <span>Mi NFC</span>
          </a>
          <a 
            href="#contacto" 
            className="inline-flex items-center justify-center text-sm font-bold bg-orange-brand text-white px-5 py-2.5 rounded-full hover:bg-orange-hover hover:-translate-y-0.5 transition-all shadow-sm"
          >
            Conocer la placa
          </a>
        </nav>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <nav id="mobile-menu" className="md:hidden bg-ink border-t border-white/10 px-6 py-5 flex flex-col gap-4">
          <a 
            href="#ecosistema" 
            onClick={closeMenu}
            className="text-base font-semibold text-muted-dim hover:text-teal-brand py-1 transition-colors"
          >
            Ecosistema
          </a>
          <a 
            href="#como-funciona" 
            onClick={closeMenu}
            className="text-base font-semibold text-muted-dim hover:text-teal-brand py-1 transition-colors"
          >
            Cómo funciona
          </a>
          <a 
            href="#beneficios" 
            onClick={closeMenu}
            className="text-base font-semibold text-muted-dim hover:text-teal-brand py-1 transition-colors"
          >
            Beneficios
          </a>
          <a 
            href="#demo" 
            onClick={closeMenu}
            className="text-base font-semibold text-muted-dim hover:text-teal-brand py-1 transition-colors"
          >
            Demostración
          </a>
          <a 
            href="#faq" 
            onClick={closeMenu}
            className="text-base font-semibold text-muted-dim hover:text-teal-brand py-1 transition-colors"
          >
            Preguntas frecuentes
          </a>
          <a 
            href="#mi-nfc" 
            onClick={closeMenu}
            className="inline-flex items-center gap-2 text-base font-bold text-teal-brand py-1 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 9a9 9 0 0 1 0 6M9 6.5a13 13 0 0 1 0 11M13 4a17 17 0 0 1 0 16" />
            </svg>
            <span>Mi NFC</span>
          </a>
          <a 
            href="#contacto" 
            onClick={closeMenu}
            className="inline-flex items-center justify-center text-base font-bold bg-orange-brand text-white py-3 rounded-full hover:bg-orange-hover transition-colors text-center mt-2 shadow-sm"
          >
            Conocer la placa
          </a>
        </nav>
      )}
    </header>
  );
}

