import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Benefits from './components/Benefits';
import DemoScanner from './components/DemoScanner';
import Privacy from './components/Privacy';
import FAQ from './components/FAQ';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink antialiased selection:bg-orange-brand selection:text-white">
      {/* Skip to main content for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-ink focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-brand"
      >
        Saltar al contenido principal
      </a>

      {/* Main Navigation */}
      <Navbar />

      {/* Main Page Content */}
      <main id="main-content" className="flex-1">
        <Hero />
        <HowItWorks />
        <Benefits />
        <DemoScanner />
        <Privacy />
        <FAQ />
        <ContactForm />
      </main>

      {/* Site Footer */}
      <Footer />
    </div>
  );
}

