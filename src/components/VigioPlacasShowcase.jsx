import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Link } from 'react-router-dom';
import { createVigioPlateTexture } from './PlateTextureGenerator';

// High-Fidelity 3D Physical Medallion (Apple-like studio lighting, zero z-fighting)
function VigioMedallion({ variant, isFlipped, flipTrigger }) {
  const meshGroup = useRef();

  // Create crisp procedural 1024x1024 textures for front (NFC) & back (QR laser etched)
  const frontTexture = useMemo(() => createVigioPlateTexture(variant, false), [variant.id]);
  const backTexture = useMemo(() => createVigioPlateTexture(variant, true), [variant.id]);

  // Target rotation for programmatic flip (0 rad = front, PI rad = back)
  const targetRotY = useRef(0);

  useEffect(() => {
    targetRotY.current = isFlipped ? Math.PI : 0;
  }, [isFlipped, flipTrigger]);

  // Smooth lerp rotation when flipping via button
  useFrame((state, delta) => {
    if (meshGroup.current) {
      meshGroup.current.rotation.y = THREE.MathUtils.damp(
        meshGroup.current.rotation.y,
        targetRotY.current,
        5,
        delta
      );
    }
  });

  // Physical Dimensions
  const outerRadius = 1.68;
  const innerRadius = 1.58;
  const thickness = 0.22;
  const segments = 64;

  return (
    <group ref={meshGroup} position={[0, 0.1, 0]}>
      {/* 1. FRONT FACE DISC (NFC Logo & Brand, polished resin finish) */}
      <mesh position={[0, 0, thickness / 2 + 0.005]}>
        <circleGeometry args={[innerRadius, segments]} />
        <meshPhysicalMaterial
          map={frontTexture}
          roughness={0.15}
          metalness={0.05}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
          reflectivity={0.9}
          envMapIntensity={1.8}
        />
      </mesh>

      {/* 2. BACK FACE DISC (Laser Etched QR Code & ID) */}
      <mesh position={[0, 0, -thickness / 2 - 0.005]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[innerRadius, segments]} />
        <meshPhysicalMaterial
          map={backTexture}
          roughness={0.2}
          metalness={0.05}
          clearcoat={0.9}
          clearcoatRoughness={0.12}
          reflectivity={0.8}
          envMapIntensity={1.6}
        />
      </mesh>

      {/* 3. SOLID MAIN BEVELED RIM (Anodized Dark Titanium / Silicone Casing) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[outerRadius, outerRadius, thickness, segments, 1, false]} />
        <meshStandardMaterial
          color="#1e2025"
          metalness={0.85}
          roughness={0.25}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* 4. METALLIC ACCENT RING ON FRONT BEVEL (Slightly raised, zero z-fighting) */}
      <mesh position={[0, 0, thickness / 2 + 0.002]}>
        <ringGeometry args={[innerRadius, outerRadius, segments]} />
        <meshStandardMaterial
          color={variant.hex}
          metalness={0.7}
          roughness={0.3}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* 5. METALLIC ACCENT RING ON BACK BEVEL (Slightly raised, zero z-fighting) */}
      <mesh position={[0, 0, -thickness / 2 - 0.002]} rotation={[0, Math.PI, 0]}>
        <ringGeometry args={[innerRadius, outerRadius, segments]} />
        <meshStandardMaterial
          color={variant.hex}
          metalness={0.7}
          roughness={0.3}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* 6. TOP EYELET RING (Collar connector - polished chrome/gunmetal) */}
      <group position={[0, outerRadius + 0.16, 0]}>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[0.3, 0.065, 24, 48]} />
          <meshStandardMaterial
            color="#e5e7eb"
            metalness={0.95}
            roughness={0.12}
            envMapIntensity={3.5}
          />
        </mesh>
      </group>
    </group>
  );
}

export default function VigioPlacasShowcase() {
  const [selectedColor, setSelectedColor] = useState('naranja');
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipTrigger, setFlipTrigger] = useState(0);

  const colorVariants = [
    { 
      id: 'negro', 
      name: 'Negro Ónix', 
      hex: '#18181b', 
      ring: 'ring-zinc-400',
      glow: 'rgba(255, 255, 255, 0.1)'
    },
    { 
      id: 'fucsia', 
      name: 'Fucsia Neón', 
      hex: '#d91b7d', 
      ring: 'ring-pink-500',
      glow: 'rgba(217, 27, 125, 0.35)'
    },
    { 
      id: 'azul', 
      name: 'Azul Profundo', 
      hex: '#0e2a56', 
      ring: 'ring-blue-500',
      glow: 'rgba(14, 42, 86, 0.45)'
    },
    { 
      id: 'verde', 
      name: 'Verde Esmeralda', 
      hex: '#159648', 
      ring: 'ring-emerald-500',
      glow: 'rgba(21, 150, 72, 0.35)'
    },
    { 
      id: 'naranja', 
      name: 'Naranja Vigio', 
      hex: '#f55716', 
      ring: 'ring-orange-500',
      glow: 'rgba(245, 87, 22, 0.4)'
    },
  ];

  const currentVariant = colorVariants.find((c) => c.id === selectedColor) || colorVariants[4];

  const handleToggleFlip = () => {
    setIsFlipped((prev) => !prev);
    setFlipTrigger((prev) => prev + 1);
  };

  return (
    <section 
      id="placas-vigio" 
      className="py-14 lg:py-20 bg-[#07080a] text-white relative overflow-hidden border-t border-b border-white/5 select-none"
    >
      {/* Background ambient lighting dinámico según el color de la placa */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] blur-[160px] pointer-events-none rounded-full transition-all duration-700" 
        style={{ backgroundColor: currentVariant.glow }}
      />

      <div className="max-w-[880px] w-[calc(100%-48px)] mx-auto relative z-10">
        
        {/* Main Showcase Glass Container */}
        <div className="relative rounded-[36px] bg-gradient-to-b from-[#131418] to-[#0a0b0e] border border-white/10 p-6 sm:p-10 shadow-2xl overflow-hidden backdrop-blur-2xl">
          
          {/* 3D WebGL Canvas Stage */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#181a20] via-[#111216] to-[#090a0d] border border-white/10 shadow-2xl h-[380px] sm:h-[460px] cursor-grab active:cursor-grabbing">
            
            {/* Subtle Studio Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08)_0%,_transparent_75%)] pointer-events-none z-10" />

            {/* Flip 180° Button */}
            <div className="absolute top-4 right-4 z-20">
              <button
                type="button"
                onClick={handleToggleFlip}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[12px] font-mono flex items-center gap-2 transition-all shadow-lg active:scale-95 backdrop-blur-md"
              >
                <span>🔄</span>
                <span>Girar 180°</span>
              </button>
            </div>

            {/* THREE.JS R3F CANVAS */}
            <Canvas
              shadows
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true, logarithmicDepthBuffer: true }}
              camera={{ position: [0, 0, 5.2], fov: 42 }}
              className="w-full h-full"
            >
              {/* Studio Environment for Ultra-Crisp Metallic Reflections */}
              <Environment preset="city" />

              {/* Precise Apple-Style Key & Rim Lighting */}
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
              <directionalLight position={[-5, -4, -3]} intensity={0.6} color="#ffffff" />
              <spotLight
                position={[0, 6, 3]}
                intensity={1.2}
                angle={0.6}
                penumbra={0.8}
                color="#ffffff"
              />

              {/* Floating Animation + 3D Medallion */}
              <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.35}>
                <VigioMedallion
                  variant={currentVariant}
                  isFlipped={isFlipped}
                  flipTrigger={flipTrigger}
                />
              </Float>

              {/* Realistic Contact Shadow on Studio Floor */}
              <ContactShadows
                position={[0, -2.0, 0]}
                opacity={0.65}
                scale={7}
                blur={2.4}
                far={4.5}
                color="#000000"
              />

              {/* 360° Interactive Orbit Drag Controls */}
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                dampingFactor={0.05}
                rotateSpeed={0.8}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 1.7}
              />
            </Canvas>
          </div>

          {/* Bottom Controls: Color Selector & CTA Button */}
          <div className="mt-7 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* Color circles */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Color:
              </span>
              <div className="flex items-center gap-3">
                {colorVariants.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    className={`w-9 h-9 rounded-full transition-all flex items-center justify-center border-2 border-white/20 ${c.ring} ${
                      selectedColor === c.id 
                        ? 'scale-125 ring-2 ring-offset-2 ring-offset-black shadow-lg shadow-black' 
                        : 'opacity-70 hover:opacity-100 hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {selectedColor === c.id && <span className="text-white text-xs font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct CTA Link */}
            <div>
              <Link
                to="/contacto"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-orange-brand hover:bg-orange-hover text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-brand/30 hover:scale-105 active:scale-95"
              >
                Pedir mi Placa Vigio →
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
