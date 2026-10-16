import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink text-muted-light py-9 border-t border-white/5 text-sm">
      <div className="max-w-[1120px] w-[calc(100%-40px)] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <strong className="text-white font-bold">FindMe</strong>
          <span className="text-muted-light/70 ml-2">· Placa NFC inteligente</span>
        </div>
        <div className="text-xs sm:text-sm text-muted-light/80">
          © {currentYear} FindMe · Todos los derechos reservados · Sitio de demostración
        </div>
      </div>
    </footer>
  );
}

