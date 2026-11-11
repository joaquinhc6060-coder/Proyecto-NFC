import React from 'react';
import BrandHero from '../components/BrandHero';
import NfcProductsSection from '../components/NfcProductsSection';
import CatalogSection from '../components/CatalogSection';
import ComoFuncionaSection from '../components/ComoFuncionaSection';
import ResenasSection from '../components/ResenasSection';
import WholesaleBlock from '../components/WholesaleBlock';

export default function HomePage() {
  return (
    <div className="space-y-0">
      {/* 1. Hero con video */}
      <BrandHero />

      {/* 2. Productos NFC: "Cambia el teléfono, no el producto." (src/data/homeNfcSection.json) */}
      <NfcProductsSection />

      {/* 3. Catálogo (src/data/products.json) */}
      <CatalogSection />

      {/* 4. Cómo funciona (src/data/comoFunciona.json) */}
      <ComoFuncionaSection />

      {/* 5. Reseñas (src/data/resenas.json; "mostrarSeccion" la oculta) */}
      <ResenasSection />

      {/* 6. Compras por varios productos */}
      <WholesaleBlock />
    </div>
  );
}
