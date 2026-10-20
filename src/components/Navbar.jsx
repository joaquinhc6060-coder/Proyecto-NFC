import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Mascotas', path: '/mascotas' },
    { name: 'Kids', path: '/kids' },
    { name: 'Restaurantes', path: '/restaurantes' },
    { name: 'Contacto', path: '/contacto' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#07080a]/95 backdrop-blur-xl text-white border-b border-white/10 transition-colors">
      <div className="max-w-[1340px] w-[calc(100%-48px)] mx-auto flex items-center justify-between h-[72px]">
        
        {/* Full Left: Brand Logo + Menu Options together */}
        <div className="flex items-center gap-8 lg:gap-10">
          
          {/* Brand Logo */}
          <Link 
            to="/" 
            className="flex items-center font-extrabold text-[1.35rem] tracking-[-0.03em] text-white hover:opacity-90 transition-opacity" 
            aria-label="FindeMe, página principal"
            onClick={closeMenu}
          >
            <span className="font-black">Finde<b className="text-orange-brand">Me</b></span>
          </Link>

          {/* Desktop Navigation full izquierda pegada al logo */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-bold uppercase tracking-wider">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `transition-colors py-1 ${
                    isActive 
                      ? 'text-white font-extrabold border-b-2 border-orange-brand' 
                      : 'text-muted-light hover:text-white'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Full Right: Orange User Avatar Icon */}
        <div className="flex items-center gap-4">
          <Link 
            to="/login"
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
            aria-label="FindeMe ID / Iniciar Sesión"
            title="FindeMe ID · Iniciar Sesión"
            className="w-10 h-10 rounded-full bg-orange-brand hover:bg-orange-hover text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg shadow-orange-brand/30 ring-2 ring-orange-brand/30"
          >
            {/* User avatar silhouette matching user image */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
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
        </div>

      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <nav id="mobile-menu" className="lg:hidden bg-[#0c0d12] border-t border-white/10 px-6 py-6 flex flex-col gap-4 text-sm font-semibold">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              onClick={closeMenu}
              className={`py-1.5 ${location.pathname === item.path ? 'text-orange-brand font-bold' : 'text-white hover:text-orange-brand'}`}
            >
              {item.name}
            </Link>
          ))}

          <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
            <Link 
              to="/login" 
              onClick={() => {
                closeMenu();
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-orange-brand text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-brand/25"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
              <span>FindeMe ID · Login</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
