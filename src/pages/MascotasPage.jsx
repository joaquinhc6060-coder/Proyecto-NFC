import React from 'react';
import CatalogSection from '../components/CatalogSection';

export default function MascotasPage() {
  return (
    <div className="min-h-screen">
      <CatalogSection 
        categoryIds={['mascotas', 'packs']} 
        badge="Vigio Mascotas"
        title="Catálogo Mascotas."
      />
    </div>
  );
}
