import React from 'react';
import RestaurantSection from '../components/RestaurantSection';
import ContactForm from '../components/ContactForm';

export default function RestaurantesPage() {
  return (
    <div className="space-y-0">
      {/* 1. Full FindeMe Gastro & VIP Division (Table Stands & VIP Loyalty Cards) */}
      <RestaurantSection />

      {/* 2. Direct Hospitality / Corporate Inquiry */}
      <ContactForm />
    </div>
  );
}
