import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, PresentationControls } from '@react-three/drei';

function TagModel() {
  const meshRef = useRef();

  // Subtle continuous 3D rotation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.35;
      meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.5) * 0.15;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Outer Metallic Ring / Keychain Eyelet */}
      <mesh position={[0, 1.35, 0]}>
        <torusGeometry args={[0.32, 0.06, 24, 48]} />
        <meshStandardMaterial 
          color="#cfd4dc" 
          metalness={0.9} 
          roughness={0.15} 
        />
      </mesh>

      {/* Main Tag Disc (Matte Black Titanium / Resin) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.15, 64]} />
        <meshStandardMaterial 
          color="#12141a" 
          metalness={0.4} 
          roughness={0.35} 
        />
      </mesh>

      {/* Outer Beveled Edge Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.18, 0.04, 24, 64]} />
        <meshStandardMaterial 
          color="#16d1b0" 
          metalness={0.7} 
          roughness={0.2} 
          emissive="#16d1b0"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Front Face Emblem Plane */}
      <mesh position={[0, 0, 0.082]}>
        <circleGeometry args={[1.05, 48]} />
        <meshStandardMaterial 
          color="#0c0d12" 
          roughness={0.6} 
        />
      </mesh>

      {/* NFC Antenna Inductor Rings (Subtle Golden / Copper Internal Coil) */}
      <mesh position={[0, 0, 0.084]}>
        <ringGeometry args={[0.75, 0.78, 48]} />
        <meshStandardMaterial 
          color="#ff5a2e" 
          metalness={0.8} 
          roughness={0.2}
          emissive="#ff5a2e"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[0, 0, 0.084]}>
        <ringGeometry args={[0.60, 0.63, 48]} />
        <meshStandardMaterial 
          color="#16d1b0" 
          metalness={0.8} 
          roughness={0.2}
          emissive="#16d1b0"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Central NFC Contactless Symbol */}
      <mesh position={[0, 0, 0.086]}>
        <ringGeometry args={[0.25, 0.32, 32, 1, Math.PI * 0.25, Math.PI * 0.5]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.086]}>
        <ringGeometry args={[0.38, 0.44, 32, 1, Math.PI * 0.25, Math.PI * 0.5]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

export default function R3FSmartTag() {
  return (
    <div className="w-full h-[320px] sm:h-[400px] relative flex items-center justify-center cursor-grab active:cursor-grabbing">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 5, 4]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-4, -3, 2]} intensity={0.6} color="#16d1b0" />
        <pointLight position={[0, 0, 3]} intensity={1.2} color="#ff8a4c" />

        <PresentationControls
          global
          zoom={0.9}
          rotation={[0, 0, 0]}
          polar={[-Math.PI / 4, Math.PI / 4]}
          azimuth={[-Math.PI / 3, Math.PI / 3]}
          config={{ mass: 1, tension: 170, friction: 26 }}
        >
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
            <TagModel />
          </Float>
        </PresentationControls>

        <ContactShadows
          position={[0, -1.6, 0]}
          opacity={0.65}
          scale={5}
          blur={2.4}
          far={3}
          color="#000000"
        />
      </Canvas>

      {/* Interactive Helper Overlay */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 border border-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] font-mono text-muted-light pointer-events-none flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-brand animate-pulse" />
        <span>R3F 3D Interactivo · Arrastra para rotar en 360°</span>
      </div>
    </div>
  );
}
