import React from 'react';
import BrandHero from '../components/BrandHero';
import DidacticVideoSection from '../components/DidacticVideoSection';
import HowItWorks from '../components/HowItWorks';
import ContactForm from '../components/ContactForm';

export default function HomePage() {
  return (
    <div className="space-y-0">
      {/* 1. Master Brand Hero with 3 distinct product worlds */}
      <BrandHero />

      {/* 2. Interactive Video Showcase: Cellphone alone with automatic autoplay on viewport entry */}
      <DidacticVideoSection />

      {/* 3. Universal How it Works (3 Steps) */}
      <HowItWorks />

      {/* 4. Contact / B2B & Personal Inquiry */}
      <ContactForm />
    </div>
  );
}
