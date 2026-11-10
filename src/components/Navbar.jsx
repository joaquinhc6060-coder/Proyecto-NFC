import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = () => { setIsOpen(false); setProfileOpen(false); };
  const displayName = user?.user_metadata?.nombre_completo || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '';
  const logout = async () => { await signOut(); closeMenu(); navigate('/login', { replace: true }); };

  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Mascotas', path: '/mascotas' },
    { name: 'Kids', path: '/kids' },
    { name: 'Contacto', path: '/contacto' },
  ];

  return (
    <header className="sticky top-[var(--vigio-bar-h,0px)] z-50bg-[#07080a]/95 backdrop-blur-xl text-white border-b border-white/10 transition-colors">
      <div className="max-w-[1340px] w-[calc(100%-48px)] mx-auto flex items-center justify-between h-[72px]">
        
        {/* Full Left: Brand Logo + Menu Options together */}
        <div className="flex items-center gap-8 lg:gap-10">
          
          {/* Brand Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group hover:opacity-90 transition-opacity" 
            aria-label="Vigio, página principal"
            onClick={closeMenu}
          >
            <div className="w-10 h-10 rounded-2xl bg-orange-brand overflow-hidden shadow-lg shadow-orange-brand/30 ring-1 ring-white/20 group-hover:scale-105 transition-transform flex items-center justify-center">
              <img src="/images/vigio-logo.jpg" alt="Vigio Logo" className="w-full h-full object-cover scale-110" />
            </div>
            <span className="font-black text-2xl tracking-tight text-white flex items-center leading-none">
              VIGI<span className="text-orange-brand">O</span>
            </span>
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
          {user ? <div className="relative hidden sm:block"><button type="button" onClick={() => setProfileOpen(value => !value)} aria-expanded={profileOpen} className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-2 pr-4 text-left transition-colors hover:bg-white/[0.08]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-brand text-sm font-black shadow-lg shadow-orange-brand/30">{displayName.slice(0,1).toUpperCase()}</span><span className="max-w-36 truncate text-xs font-bold text-white">Hola, {displayName}</span>
          </button>{profileOpen&&<div className="absolute right-0 top-14 w-72 rounded-2xl border border-white/10 bg-[#15161a] p-3 shadow-2xl"><p className="px-3 pt-1 text-xs font-bold text-white">Hola, {displayName}</p><p className="truncate px-3 pb-3 pt-1 text-xs text-zinc-400">{user.email}</p><Link to="/panel" onClick={closeMenu} className="block rounded-xl px-3 py-3 text-center text-xs font-black text-white hover:bg-white/5">Mis productos</Link><Link to="/panel/cuenta" onClick={closeMenu} className="block rounded-xl bg-orange-brand px-3 py-3 text-center text-xs font-black text-white">Mi cuenta</Link><button type="button" onClick={logout} className="mt-2 w-full rounded-xl px-3 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white">Cerrar sesión</button></div>}</div> : <Link 
            to="/login"
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
            aria-label="Iniciar sesión"
            title="Iniciar sesión"
            className="w-10 h-10 rounded-full bg-orange-brand hover:bg-orange-hover text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg shadow-orange-brand/30 ring-2 ring-orange-brand/30"
          >
            {/* User avatar silhouette matching user image */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </Link>}

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
              to={user ? '/mi-cuenta' : '/login'}
              onClick={() => {
                closeMenu();
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-orange-brand text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-brand/25"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
              <span>{user ? `Hola, ${displayName} · Mi dashboard` : 'Iniciar sesión'}</span>
            </Link>
            {user&&<button type="button" onClick={logout} className="py-2 text-left text-xs text-zinc-400">Cerrar sesión</button>}
          </div>
        </nav>
      )}
    </header>
  );
}
