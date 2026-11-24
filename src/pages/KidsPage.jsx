import React from 'react';
import CatalogSection from '../components/CatalogSection';

export default function KidsPage() {
  return (
    <div className="min-h-screen">
      <CatalogSection 
        categoryIds={['pulseras', 'packs']} 
        badge="Vigio Pulseras"
        title="Catálogo Pulseras."
      />
    </div>
  );
}
