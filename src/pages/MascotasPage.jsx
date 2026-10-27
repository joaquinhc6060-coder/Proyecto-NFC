import React from 'react';
import DidacticVideoSection from '../components/DidacticVideoSection';
import VigioPlacasShowcase from '../components/VigioPlacasShowcase';
import IPhoneShowcase from '../components/IPhoneShowcase';
import DemoScanner from '../components/DemoScanner';
import FAQ from '../components/FAQ';

export default function MascotasPage() {
  return (
    <div className="space-y-0">
      {/* 1. Didactic Video Hero: Real Phone with Dog NFC Tag Scan */}
      <DidacticVideoSection />

      {/* 2. Official Vigio Hardware Showcase: 5 Colors, Front NFC & Back QR */}
      <VigioPlacasShowcase />

      {/* 3. Photorealistic iPhone 16 Pro Showcase */}
      <IPhoneShowcase />

      {/* 3. Live Interactive Scanner Simulator (Scan, Call, WhatsApp) */}
      <DemoScanner />

      {/* 4. Frequently Asked Questions */}
      <FAQ />
    </div>
  );
}
