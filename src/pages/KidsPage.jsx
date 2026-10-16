import React from 'react';
import KidsSection from '../components/KidsSection';
import ContactForm from '../components/ContactForm';

export default function KidsPage() {
  return (
    <div className="space-y-0">
      {/* 1. Full FindeMe Kids Division (Wristbands & Martina Profile Simulator) */}
      <KidsSection />

      {/* 2. Direct Inquiry / Order Request */}
      <ContactForm />
    </div>
  );
}
