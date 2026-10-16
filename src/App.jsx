import React from 'react';
import useSmoothScroll from './hooks/useSmoothScroll';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ScrollExpansion from './components/ScrollExpansion';
import IPhoneShowcase from './components/IPhoneShowcase';
import HowItWorks from './components/HowItWorks';
import Benefits from './components/Benefits';
import DemoScanner from './components/DemoScanner';
import MiNfc from './components/MiNfc';
import FAQ from './components/FAQ';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

export default function App() {
  // Initialize Lenis smooth scroll synchronized with GSAP ScrollTrigger
  useSmoothScroll();

  return (
    <div className="min-h-screen flex flex-col bg-[#07080a] text-white font-sans antialiased selection:bg-orange-brand selection:text-white">
      {/* Accessibility shortcut */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-ink focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-brand"
      >
        Saltar al contenido principal
      </a>

      {/* Floating Cinematic Glass Navbar */}
      <Navbar />

      {/* Main Page Content Flow */}
      <main id="main-content" className="flex-1">
        {/* 1. Cinematic Hero with 3D Tilt & Photorealistic iPhone 16 Pro */}
        <Hero />

        {/* 2. Scroll Expansion: Contained 60% card expands to 100% Viewport */}
        <ScrollExpansion />

        {/* 3. 3D iPhone Showcase: Photorealistic studio render reacting to scroll with Y-rotation and zoom */}
        <IPhoneShowcase />

        {/* 4. Minimalist 3-Step Protocol */}
        <HowItWorks />

        {/* 5. Minimalist Hardware Bento Grid */}
        <Benefits />

        {/* 6. Interactive Simulator (Llamada Telefónica & WhatsApp en Vivo) */}
        <DemoScanner />

        {/* 7. Portal Cloud Mi NFC */}
        <MiNfc />

        {/* 8. Preguntas Frecuentes */}
        <FAQ />

        {/* 9. Contacto & Preventa */}
        <ContactForm />
      </main>

      {/* Cinematic Minimalist Footer */}
      <Footer />
    </div>
  );
}
