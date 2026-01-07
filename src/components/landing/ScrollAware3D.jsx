import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';

// Scroll-reactive rotating cube
function ScrollCube({ scrollProgress }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Rotation based on scroll
      meshRef.current.rotation.x = scrollProgress * Math.PI * 4;
      meshRef.current.rotation.y = scrollProgress * Math.PI * 4;
      
      // Position moves as you scroll
      meshRef.current.position.y = Math.sin(scrollProgress * Math.PI * 2) * 2;
      
      // Scale changes with scroll
      const scale = 1 + Math.sin(scrollProgress * Math.PI * 4) * 0.3;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial
        color="#B4833D"
        metalness={0.8}
        roughness={0.2}
        emissive="#B4833D"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

// Scroll-reactive sphere that follows the scroll
function ScrollSphere({ scrollProgress }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Move along a path based on scroll
      const angle = scrollProgress * Math.PI * 2;
      meshRef.current.position.x = Math.cos(angle) * 3;
      meshRef.current.position.z = Math.sin(angle) * 3;
      meshRef.current.position.y = (scrollProgress - 0.5) * 4;
      
      // Rotate
      meshRef.current.rotation.y = angle * 2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#81754B"
          metalness={0.9}
          roughness={0.1}
          emissive="#81754B"
          emissiveIntensity={0.4}
        />
      </mesh>
    </Float>
  );
}

// Morphing torus that changes based on scroll
function ScrollTorus({ scrollProgress }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Rotation
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = scrollProgress * Math.PI * 2;
      
      // Position oscillation
      meshRef.current.position.x = Math.sin(scrollProgress * Math.PI * 3) * 2;
      meshRef.current.position.y = Math.cos(scrollProgress * Math.PI * 3) * 2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[1, 0.3, 16, 100]} />
      <meshStandardMaterial
        color="#FFD700"
        metalness={0.8}
        roughness={0.2}
        emissive="#FFD700"
        emissiveIntensity={scrollProgress * 0.5}
      />
    </mesh>
  );
}

// Particle wave that responds to scroll
function ScrollParticles({ scrollProgress, count = 1000 }) {
  const points = useRef();
  const positions = useRef(new Float32Array(count * 3));

  useEffect(() => {
    // Initialize positions in a wave pattern
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = (i / count) * 20 - 10;
      const y = Math.sin(i / 10) * 2;
      const z = Math.cos(i / 10) * 2;
      
      positions.current[i3] = x;
      positions.current[i3 + 1] = y;
      positions.current[i3 + 2] = z;
    }
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      // Update particle positions based on scroll
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const waveOffset = scrollProgress * Math.PI * 4;
        positions.current[i3 + 1] = Math.sin(i / 10 + waveOffset) * 3;
        positions.current[i3 + 2] = Math.cos(i / 10 + waveOffset) * 3;
      }
      
      points.current.geometry.attributes.position.needsUpdate = true;
      points.current.rotation.y = scrollProgress * Math.PI;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#B4833D"
        transparent
        opacity={0.6 + scrollProgress * 0.4}
        sizeAttenuation
      />
    </points>
  );
}

// Camera controller that follows scroll
function ScrollCamera({ scrollProgress }) {
  const { camera } = useFrame(() => {});

  useFrame(() => {
    // Camera moves in a spiral based on scroll
    const angle = scrollProgress * Math.PI * 2;
    const radius = 8 + Math.sin(scrollProgress * Math.PI) * 2;
    
    camera.position.x = Math.sin(angle) * radius;
    camera.position.y = (scrollProgress - 0.5) * 5;
    camera.position.z = Math.cos(angle) * radius;
    
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Main Scroll-Aware 3D Component
const ScrollAware3D = ({ className = '' }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate how much of the component is visible
        const visibleTop = Math.max(0, -rect.top);
        const visibleBottom = Math.min(rect.height, windowHeight - rect.top);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const progress = visibleHeight / windowHeight;
        
        setScrollProgress(Math.min(1, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={canvasRef} className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#B4833D" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#81754B" />
        <directionalLight position={[0, 5, 5]} intensity={0.5} />

        {/* Background stars */}
        <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />

        {/* Scroll-reactive elements */}
        <ScrollCube scrollProgress={scrollProgress} />
        <ScrollSphere scrollProgress={scrollProgress} />
        <ScrollTorus scrollProgress={scrollProgress} />
        <ScrollParticles scrollProgress={scrollProgress} count={500} />
        <ScrollCamera scrollProgress={scrollProgress} />
      </Canvas>
      
      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-black/70 text-white p-2 rounded text-xs">
          Scroll: {Math.round(scrollProgress * 100)}%
        </div>
      )}
    </div>
  );
};

export default ScrollAware3D;

