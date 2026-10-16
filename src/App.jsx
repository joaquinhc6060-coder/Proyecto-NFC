import React from 'react';
import useSmoothScroll from './hooks/useSmoothScroll';
import Navbar from './components/Navbar';
import BrandHero from './components/BrandHero';
import DidacticVideoSection from './components/DidacticVideoSection';
import ScrollExpansion from './components/ScrollExpansion';
import AnimalsDivision from './components/AnimalsDivision';
import IPhoneShowcase from './components/IPhoneShowcase';
import DemoScanner from './components/DemoScanner';
import KidsSection from './components/KidsSection';
import RestaurantSection from './components/RestaurantSection';
import HowItWorks from './components/HowItWorks';
import Benefits from './components/Benefits';
import MiNfc from './components/MiNfc';
import FAQ from './components/FAQ';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

export default function App() {
  // Initialize Lenis smooth scroll synchronized with GSAP
  useSmoothScroll();

  return (
    <div className="min-h-screen flex flex-col bg-[#07080a] text-white font-sans antialiased selection:bg-orange-brand selection:text-white">
      {/* Accessibility jump link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-ink focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-brand"
      >
        Saltar al contenido principal
      </a>

      {/* Floating Cinematic Glass Navbar */}
      <Navbar />

      {/* Main Brand Portal Experience */}
      <main id="main-content" className="flex-1">
        {/* 1. Main Brand Portal Hero: 3 Product Worlds */}
        <BrandHero />

        {/* 2. Interactive Didactic Video Console (Using the User's Video) */}
        <DidacticVideoSection />

        {/* 3. GSAP Scroll Expansion (60% to 100% Viewport) */}
        <ScrollExpansion />

        {/* 4. Product Line 1: FindeMe Animales (Any pet, dogs as main reference) */}
        <AnimalsDivision />

        {/* 5. 3D iPhone 16 Pro Cinematic Showcase */}
        <IPhoneShowcase />

        {/* 6. Live Interactive Scanner Simulator (Llamada Falsa & WhatsApp) */}
        <DemoScanner />

        {/* 7. Product Line 2: FindeMe Kids (Waterproof smart wristbands) */}
        <KidsSection />

        {/* 8. Product Line 3: FindeMe Gastro & VIP Loyalty (Table stands & VIP Cards) */}
        <RestaurantSection />

        {/* 9. Hardware & Protocol Architecture */}
        <HowItWorks />

        {/* 10. Minimalist Hardware Bento Grid */}
        <Benefits />

        {/* 11. Cloud Owner Portal (Mi NFC con Supabase) */}
        <MiNfc />

        {/* 12. Preguntas Frecuentes */}
        <FAQ />

        {/* 13. Contacto & Preventa Multilínea */}
        <ContactForm />
      </main>

      {/* Brand Footer */}
      <Footer />
    </div>
  );
}
