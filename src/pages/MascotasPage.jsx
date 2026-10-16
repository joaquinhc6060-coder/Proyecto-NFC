import React from 'react';
import AnimalsDivision from '../components/AnimalsDivision';
import IPhoneShowcase from '../components/IPhoneShowcase';
import DemoScanner from '../components/DemoScanner';
import Benefits from '../components/Benefits';
import FAQ from '../components/FAQ';
import ContactForm from '../components/ContactForm';

export default function MascotasPage() {
  return (
    <div className="space-y-0">
      {/* 1. Header & Animals Line Overview (Dogs, Cats, Any Pet) */}
      <AnimalsDivision />

      {/* 2. Photorealistic iPhone 16 Pro Showcase */}
      <IPhoneShowcase />

      {/* 3. Live Interactive Scanner Simulator (Scan, Call, WhatsApp) */}
      <DemoScanner />

      {/* 4. Core Benefits for Pets */}
      <Benefits />

      {/* 5. Frequently Asked Questions */}
      <FAQ />

      {/* 6. Contact Form */}
      <ContactForm />
    </div>
  );
}
