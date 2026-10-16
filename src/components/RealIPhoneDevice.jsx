import React from 'react';

/**
 * RealIPhoneDevice:
 * Wraps any screen content (video, interactive demo, etc.) inside the exact 
 * photorealistic iPhone 16 Pro Titanium frame matching the "Diseñado para el Momento Crítico" section.
 */
export default function RealIPhoneDevice({ children, className = '' }) {
  return (
    <div className={`relative w-[290px] sm:w-[330px] aspect-[430/900] mx-auto select-none ${className}`}>
      
      {/* 1. Realistic Drop Shadow */}
      <div className="absolute inset-x-6 bottom-4 h-12 bg-black/80 blur-2xl rounded-full pointer-events-none" />

      {/* 2. Inner Screen Container (Behind the titanium bezel) */}
      <div className="absolute inset-[1.6%_3.6%_1.8%_3.6%] rounded-[40px] overflow-hidden bg-black z-10">
        {children}
      </div>

      {/* 3. Photorealistic 100% Real Studio iPhone 16 Pro Titanium Frame */}
      <img
        src="/images/iphone-16-pro-frame.png"
        alt="Marco iPhone 16 Pro Titanium Real"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-30 drop-shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
        loading="eager"
      />

      {/* 4. Subtle Glass Specular Reflection Highlight */}
      <div className="absolute inset-0 rounded-[50px] ring-1 ring-white/15 pointer-events-none z-40" />
    </div>
  );
}
