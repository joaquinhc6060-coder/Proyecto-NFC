import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { name: 'Mascotas', path: '/mascotas', color: 'hover:text-orange-brand' },
    { name: 'Kids', path: '/kids', color: 'hover:text-teal-brand' },
    { name: 'Restaurantes', path: '/restaurantes', color: 'hover:text-amber-400' },
    { name: 'Contacto', path: '/contacto', color: 'hover:text-teal-brand' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#07080a]/90 backdrop-blur-xl text-white border-b border-white/10 transition-colors">
      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto flex items-center justify-between h-[72px]">
        
        {/* Brand Logo */}
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
        <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `transition-colors ${isActive ? 'text-white font-extrabold border-b-2 border-teal-brand pb-1' : 'text-muted-light hover:text-white'}`
            }
          >
            Inicio
          </NavLink>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `transition-colors ${
                  isActive 
                    ? 'text-white font-extrabold border-b-2 border-orange-brand pb-1' 
                    : `text-muted-light ${item.color}`
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          {/* Button: MI NFC */}
          <NavLink 
            to="/login" 
            className="inline-flex items-center justify-center text-xs font-black uppercase tracking-wider bg-orange-brand text-white px-6 py-2.5 rounded-full hover:bg-orange-hover hover:scale-105 transition-all shadow-md shadow-orange-brand/25"
          >
            MI NFC
          </NavLink>
        </nav>

      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <nav id="mobile-menu" className="lg:hidden bg-[#0c0d12] border-t border-white/10 px-6 py-6 flex flex-col gap-4 text-sm font-semibold">
          <Link 
            to="/" 
            onClick={closeMenu}
            className={`py-1 ${location.pathname === '/' ? 'text-teal-brand font-bold' : 'text-white hover:text-teal-brand'}`}
          >
            Inicio
          </Link>

          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              onClick={closeMenu}
              className={`py-1 ${location.pathname === item.path ? 'text-orange-brand font-bold' : 'text-white hover:text-orange-brand'}`}
            >
              {item.name}
            </Link>
          ))}

          <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
            <Link 
              to="/login" 
              onClick={closeMenu}
              className="w-full text-center py-3 rounded-full bg-orange-brand text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-brand/25"
            >
              MI NFC
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
