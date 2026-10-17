import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useSmoothScroll from './hooks/useSmoothScroll';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import MascotasPage from './pages/MascotasPage';
import KidsPage from './pages/KidsPage';
import RestaurantesPage from './pages/RestaurantesPage';
import LoginPage from './pages/LoginPage';
import ContactoPage from './pages/ContactoPage';
import ScanPage from './pages/ScanPage';

export default function App() {
  // Initialize Lenis smooth scroll synchronized with GSAP
  useSmoothScroll();

  return (
    <BrowserRouter>
      {/* Scroll to top automatically on route changes */}
      <ScrollToTop />

      <div className="min-h-screen flex flex-col bg-[#07080a] text-white font-sans antialiased selection:bg-orange-brand selection:text-white">
        {/* Accessibility jump link */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-ink focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-brand"
        >
          Saltar al contenido principal
        </a>

        {/* Floating Glass Navbar with Routing Links */}
        <Navbar />

        {/* Dynamic Route Pages */}
        <main id="main-content" className="flex-1">
          <Routes>
            {/* 1. Página Principal (Master Brand Portal & Autonomous Autoplay Video) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/pagina_principal" element={<HomePage />} />

            {/* 2. FindeMe Mascotas / Animales (Universal, Luna reference, no 3D inspection) */}
            <Route path="/mascotas" element={<MascotasPage />} />
            <Route path="/animales" element={<MascotasPage />} />

            {/* 3. FindeMe Kids (Waterproof silicone wristbands & Martina simulation) */}
            <Route path="/kids" element={<KidsPage />} />
            <Route path="/ninos" element={<KidsPage />} />

            {/* 4. FindeMe Restaurantes & VIP Loyalty (Table stands & VIP Loyalty Cards) */}
            <Route path="/restaurantes" element={<RestaurantesPage />} />
            <Route path="/restaurant" element={<RestaurantesPage />} />

            {/* 5. Contacto (Ruta dedicada estándar) */}
            <Route path="/contacto" element={<ContactoPage />} />

            {/* 6. Login / Portal del Dueño (Mi NFC - Botón Naranja Principal) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/minfc" element={<LoginPage />} />

            {/* 7. Escaneo Público en Vivo de Dispositivos NFC (En la calle / restaurante) */}
            <Route path="/scan/:code" element={<ScanPage />} />
            <Route path="/p/:code" element={<ScanPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}
