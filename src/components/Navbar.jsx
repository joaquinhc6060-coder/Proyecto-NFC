import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { name: 'Mascotas', path: '/mascotas', icon: '🐾', color: 'hover:text-orange-brand' },
    { name: 'Kids', path: '/kids', icon: '👶', color: 'hover:text-teal-brand' },
    { name: 'Restaurantes', path: '/restaurantes', icon: '🍽️', color: 'hover:text-amber-400' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#07080a]/90 backdrop-blur-xl text-white border-b border-white/10 transition-colors">
      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto flex items-center justify-between h-[72px]">
        
        {/* Brand Logo with exact FindeMe pin */}
        <Link 
          to="/" 
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
        </Link>

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
        <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `transition-colors flex items-center gap-1.5 ${isActive ? 'text-white font-extrabold border-b-2 border-teal-brand pb-1' : 'text-muted-light hover:text-white'}`
            }
          >
            Inicio
          </NavLink>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `transition-colors flex items-center gap-1.5 ${
                  isActive 
                    ? 'text-white font-extrabold border-b-2 border-orange-brand pb-1' 
                    : `text-muted-light ${item.color}`
                }`
              }
            >
              <span>{item.icon}</span> {item.name}
            </NavLink>
          ))}

          {/* Login / Mi NFC button */}
          <NavLink 
            to="/login" 
            className={({ isActive }) =>
              `inline-flex items-center gap-1.5 text-xs font-mono px-3.5 py-1.5 rounded-full transition-all border ${
                isActive
                  ? 'bg-teal-brand text-black font-black border-teal-brand'
                  : 'text-teal-brand bg-teal-brand/10 hover:bg-teal-brand/20 border-teal-brand/30'
              }`
            }
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-brand animate-ping" />
            <span>Mi NFC · Login</span>
          </NavLink>

          {/* Contacto link */}
          <a 
            href="/#contacto" 
            className="inline-flex items-center justify-center text-xs font-extrabold bg-orange-brand text-white px-5 py-2.5 rounded-full hover:bg-orange-hover hover:scale-105 transition-all shadow-md shadow-orange-brand/20"
          >
            Contacto
          </a>
        </nav>

      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <nav id="mobile-menu" className="lg:hidden bg-[#0c0d12] border-t border-white/10 px-6 py-6 flex flex-col gap-4 text-sm font-semibold">
          <Link 
            to="/" 
            onClick={closeMenu}
            className={`py-1 flex items-center gap-2 ${location.pathname === '/' ? 'text-teal-brand font-bold' : 'text-white hover:text-teal-brand'}`}
          >
            <span>🏠</span> Inicio
          </Link>

          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              onClick={closeMenu}
              className={`py-1 flex items-center gap-2 ${location.pathname === item.path ? 'text-orange-brand font-bold' : 'text-white hover:text-orange-brand'}`}
            >
              <span>{item.icon}</span> {item.name}
            </Link>
          ))}

          <div className="pt-2 border-t border-white/10 flex flex-col gap-3">
            <Link 
              to="/login" 
              onClick={closeMenu}
              className="w-full text-center py-2.5 rounded-full bg-teal-brand/10 border border-teal-brand/30 text-teal-brand font-mono text-xs font-bold"
            >
              Mi NFC · Iniciar Sesión
            </Link>
            <a 
              href="/#contacto" 
              onClick={closeMenu}
              className="w-full text-center py-3 rounded-full bg-orange-brand text-white font-bold text-xs"
            >
              Contacto
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
