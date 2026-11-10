import React from 'react';
import BrandHero from '../components/BrandHero';
import NfcProductsSection from '../components/NfcProductsSection';
import CatalogSection from '../components/CatalogSection';

export default function HomePage() {
  return (
    <div className="space-y-0">
      {/* 1. Master Brand Hero with 3 distinct product worlds */}
      <BrandHero />

      {/* 2. Productos NFC: NFC + QR, perfil editable (textos en src/data/homeNfcSection.json) */}
      <NfcProductsSection />

      {/* 3. Vitrina comercial referencial de productos Vigio */}
      <CatalogSection />
    </div>
  );
}
