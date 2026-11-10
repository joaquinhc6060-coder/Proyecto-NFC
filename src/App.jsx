import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useSmoothScroll from './hooks/useSmoothScroll';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import AnnouncementBar from './components/AnnouncementBar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import MascotasPage from './pages/MascotasPage';
import KidsPage from './pages/KidsPage';
import LoginPage from './pages/LoginPage';
import ContactoPage from './pages/ContactoPage';
import ScanPage from './pages/ScanPage';
import VigioAdminMasterPage from './pages/VigioAdminMasterPage';
import { AuthProvider } from './contexts/AuthContext';
import AccountRoute from './components/AccountRoute';
import ActivateProductPage from './pages/ActivateProductPage';
import AccountPage from './pages/AccountPage';
import ProductPage from './pages/ProductPage';

export default function App() {
  // Initialize Lenis smooth scroll synchronized with GSAP
  useSmoothScroll();

  return (
    <BrowserRouter>
      <AuthProvider>
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

        {/* Barra de anuncios fija sobre el menú */}
        <AnnouncementBar />

        {/* Floating Glass Navbar with Routing Links */}
        <Navbar />

        {/* Dynamic Route Pages */}
        <main id="main-content" className="flex-1">
          <Routes>
            {/* 1. Página Principal (Master Brand Portal & Autonomous Autoplay Video) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/pagina_principal" element={<HomePage />} />

            {/* 2. Vigio Mascotas / Animales (Universal, Luna reference, no 3D inspection) */}
            <Route path="/mascotas" element={<MascotasPage />} />
            <Route path="/animales" element={<MascotasPage />} />

            {/* 3. Vigio Kids (Waterproof silicone wristbands & Martina simulation) */}
            <Route path="/kids" element={<KidsPage />} />
            <Route path="/ninos" element={<KidsPage />} />

            {/* Restaurantes queda temporalmente fuera de la experiencia pública. */}
            <Route path="/restaurantes" element={<Navigate to="/" replace />} />
            <Route path="/restaurant" element={<Navigate to="/" replace />} />

            {/* Página de producto: una plantilla para todos (datos en src/data/products.json) */}
            <Route path="/producto/:id" element={<ProductPage />} />

            {/* 5. Contacto (Ruta dedicada estándar) */}
            <Route path="/contacto" element={<ContactoPage />} />

            {/* 6. Login / Portal del Dueño (Vigio ID - RBAC) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/minfc" element={<LoginPage />} />

            {/* 7. Paneles de Usuario RBAC Dedicados */}
            <Route path="/mi-cuenta" element={<AccountRoute />} />
            <Route path="/panel" element={<AccountRoute />} />
            <Route path="/panel/cuenta" element={<AccountRoute><AccountPage /></AccountRoute>} />
            <Route path="/activar/:token" element={<AccountRoute><ActivateProductPage /></AccountRoute>} />
            <Route path="/panel-mascota" element={<AccountRoute />} />
            <Route path="/panel-kids" element={<AccountRoute />} />
            <Route path="/admin" element={<AccountRoute />} />

            {/* 8. Escaneo público de dispositivos NFC */}
            <Route path="/scan/:code" element={<ScanPage />} />
            <Route path="/p/:code" element={<ScanPage />} />

            <Route path="/dashboard-restaurante" element={<Navigate to="/" replace />} />
            <Route path="/demo/restaurante" element={<Navigate to="/" replace />} />
            <Route path="/restaurante/:id/mi-tarjeta" element={<Navigate to="/" replace />} />
            <Route path="/restaurante/mi-tarjeta" element={<Navigate to="/" replace />} />

            <Route path="/admin-master" element={<VigioAdminMasterPage />} />
            <Route path="/gestion-vigio" element={<VigioAdminMasterPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
