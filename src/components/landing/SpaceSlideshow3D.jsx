import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Stars, Float } from '@react-three/drei';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as THREE from 'three';

// Particle system for transitions
function Particles({ count = 2000 }) {
  const mesh = useRef();
  const light = useRef();

  const particlePositions = useRef(new Float32Array(count * 3));
  const particleVelocities = useRef(new Float32Array(count * 3));

  useEffect(() => {
    // Initialize particle positions and velocities
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Random positions in a sphere
      const radius = Math.random() * 50 + 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      particlePositions.current[i3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions.current[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions.current[i3 + 2] = radius * Math.cos(phi);
      
      // Random velocities
      particleVelocities.current[i3] = (Math.random() - 0.5) * 0.02;
      particleVelocities.current[i3 + 1] = (Math.random() - 0.5) * 0.02;
      particleVelocities.current[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }
  }, [count]);

  useFrame((state, delta) => {
    if (!mesh.current) return;

    // Update particle positions
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      particlePositions.current[i3] += particleVelocities.current[i3];
      particlePositions.current[i3 + 1] += particleVelocities.current[i3 + 1];
      particlePositions.current[i3 + 2] += particleVelocities.current[i3 + 2];

      // Reset if too far
      const distance = Math.sqrt(
        particlePositions.current[i3] ** 2 +
        particlePositions.current[i3 + 1] ** 2 +
        particlePositions.current[i3 + 2] ** 2
      );
      if (distance > 100) {
        particlePositions.current[i3] = (Math.random() - 0.5) * 20;
        particlePositions.current[i3 + 1] = (Math.random() - 0.5) * 20;
        particlePositions.current[i3 + 2] = (Math.random() - 0.5) * 20;
      }
    }

    mesh.current.geometry.attributes.position.needsUpdate = true;
    mesh.current.rotation.y += delta * 0.1;
  });

  return (
    <>
      <pointLight ref={light} position={[10, 10, 10]} intensity={1} color="#B4833D" />
      <points ref={mesh}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={particlePositions.current}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#B4833D" transparent opacity={0.6} />
      </points>
    </>
  );
}

// 3D Text component (using Text from drei)
function Text3DComponent({ children, position, size = 0.5, color = "#B4833D" }) {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <Text
        position={position}
        fontSize={size}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {children}
      </Text>
    </Float>
  );
}

// Camera controller for smooth transitions
function CameraController({ targetSlide }) {
  const { camera } = useThree();
  const cameraPositions = [
    [0, 0, 15],      // Slide 0: Hero
    [20, 5, 10],    // Slide 1: Features
    [-15, -5, 12],  // Slide 2: Pricing
    [0, -10, 8],    // Slide 3: CTA
  ];

  useFrame(() => {
    const targetPos = cameraPositions[targetSlide];
    
    // Smooth camera movement (faster for more noticeable transitions)
    camera.position.x += (targetPos[0] - camera.position.x) * 0.08;
    camera.position.y += (targetPos[1] - camera.position.y) * 0.08;
    camera.position.z += (targetPos[2] - camera.position.z) * 0.08;

    // Look at center
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Interactive 3D Mesh Component
function InteractiveMesh({ geometry, position, color, metalness = 0.7, emissive = false }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Constant rotation
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
      
      // Pulse effect when hovered
      if (hovered) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {geometry}
      <meshStandardMaterial
        color={hovered ? '#FFD700' : color}
        metalness={metalness}
        roughness={0.2}
        emissive={emissive ? color : '#000000'}
        emissiveIntensity={hovered ? 0.5 : (emissive ? 0.3 : 0)}
      />
    </mesh>
  );
}

// Orbiting particles around a point
function OrbitingElements({ radius = 3, count = 6, slideIndex }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const elements = Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    return { x, y: Math.sin(angle * 2) * 0.5, z };
  });

  return (
    <group ref={groupRef}>
      {elements.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color="#B4833D"
            emissive="#B4833D"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

// Scene content for each slide
function SlideContent({ slideIndex }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  switch (slideIndex) {
    case 0: // Hero - Enhanced with orbiting elements
      return (
        <group ref={groupRef}>
          <Text3DComponent position={[-3, 2, 0]} size={1.2} color="#B4833D">
            Human Catalyst
          </Text3DComponent>
          <Text3DComponent position={[-2, 0, 0]} size={0.8} color="#81754B">
            University
          </Text3DComponent>
          
          {/* Interactive torus with glow */}
          <InteractiveMesh
            geometry={<torusGeometry args={[2, 0.3, 16, 100]} />}
            position={[0, -2, 0]}
            color="#B4833D"
            metalness={0.8}
            emissive={true}
          />
          
          {/* Orbiting particles */}
          <OrbitingElements radius={3.5} count={8} slideIndex={slideIndex} />
        </group>
      );
    
    case 1: // Features - Floating geometric shapes
      return (
        <group ref={groupRef}>
          <Text3DComponent position={[0, 3, 0]} size={0.8} color="#B4833D">
            Transform
          </Text3DComponent>
          
          {/* Interactive floating shapes */}
          <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <InteractiveMesh
              geometry={<octahedronGeometry args={[1, 0]} />}
              position={[-3, 0, 0]}
              color="#81754B"
            />
          </Float>
          
          <Float speed={2.5} rotationIntensity={1.5} floatIntensity={1.5}>
            <InteractiveMesh
              geometry={<icosahedronGeometry args={[1, 0]} />}
              position={[0, 0, 0]}
              color="#B4833D"
              emissive={true}
            />
          </Float>
          
          <Float speed={1.8} rotationIntensity={0.8} floatIntensity={2.2}>
            <InteractiveMesh
              geometry={<tetrahedronGeometry args={[1, 0]} />}
              position={[3, 0, 0]}
              color="#66371B"
            />
          </Float>
          
          {/* Connecting lines */}
          <OrbitingElements radius={4} count={6} slideIndex={slideIndex} />
        </group>
      );
    
    case 2: // Pricing - Rotating cubes
      return (
        <group ref={groupRef}>
          <Text3DComponent position={[0, 2, 0]} size={0.7} color="#B4833D">
            Choose Your Path
          </Text3DComponent>
          
          {/* Three pricing tiers as 3D boxes */}
          <InteractiveMesh
            geometry={<boxGeometry args={[1.5, 2, 1.5]} />}
            position={[-3, -1, 0]}
            color="#81754B"
            metalness={0.6}
          />
          
          <InteractiveMesh
            geometry={<boxGeometry args={[1.5, 2.5, 1.5]} />}
            position={[0, -0.75, 0]}
            color="#B4833D"
            metalness={0.8}
            emissive={true}
          />
          
          <InteractiveMesh
            geometry={<boxGeometry args={[1.5, 2, 1.5]} />}
            position={[3, -1, 0]}
            color="#66371B"
            metalness={0.6}
          />
          
          <OrbitingElements radius={5} count={12} slideIndex={slideIndex} />
        </group>
      );
    
    case 3: // CTA - Pulsing sphere
      return (
        <group ref={groupRef}>
          <Text3DComponent position={[0, 1, 0]} size={1} color="#B4833D">
            Start Your Journey
          </Text3DComponent>
          
          {/* Central pulsing sphere */}
          <InteractiveMesh
            geometry={<sphereGeometry args={[2, 32, 32]} />}
            position={[0, -2, 0]}
            color="#B4833D"
            metalness={0.9}
            emissive={true}
          />
          
          {/* Surrounding ring of energy */}
          <OrbitingElements radius={3.5} count={16} slideIndex={slideIndex} />
          
          {/* Outer ring */}
          <OrbitingElements radius={5} count={24} slideIndex={slideIndex} />
        </group>
      );
    
    default:
      return null;
  }
}

// Main slideshow component
const SpaceSlideshow3D = ({ slides = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const totalSlides = slides.length || 4;

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => {
      const next = (prev + 1) % totalSlides;
      console.log('Next slide:', next);
      return next;
    });
    setTimeout(() => setIsTransitioning(false), 1500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => {
      const next = (prev - 1 + totalSlides) % totalSlides;
      console.log('Previous slide:', next);
      return next;
    });
    setTimeout(() => setIsTransitioning(false), 1500);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    console.log('Go to slide:', index);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 1500);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isTransitioning) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransitioning, currentSlide, totalSlides]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a]">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        className="absolute inset-0"
      >
        <Suspense fallback={null}>
          <CameraController targetSlide={currentSlide} />
          
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#B4833D" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#81754B" />
          <directionalLight position={[0, 10, 5]} intensity={0.5} />

          {/* Stars background */}
          <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />

          {/* Particles */}
          <Particles count={1500} />

          {/* Slide content */}
          <SlideContent slideIndex={currentSlide} />

          {/* Disable OrbitControls to allow camera control */}
          <OrbitControls enabled={false} />
        </Suspense>
      </Canvas>

      {/* Content Overlay (for 2D content) */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
      >
        {slides[currentSlide] && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              {slides[currentSlide]}
            </div>
          </div>
        )}
      </div>

      {/* Touch handler overlay */}
      <div
        className="absolute inset-0 pointer-events-auto z-5"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }}
      />

      {/* Navigation Controls - Highest z-index */}
      <div className="absolute inset-0 pointer-events-none z-40">
        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          disabled={isTransitioning}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto
                     p-3 rounded-full bg-black/50 backdrop-blur-sm border border-[#B4833D]/50
                     hover:bg-[#B4833D]/30 hover:border-[#B4833D] transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-[#B4833D]" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          disabled={isTransitioning}
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto
                     p-3 rounded-full bg-black/50 backdrop-blur-sm border border-[#B4833D]/50
                     hover:bg-[#B4833D]/30 hover:border-[#B4833D] transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-[#B4833D]" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto
                        flex gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-[#B4833D] w-8'
                  : 'bg-[#81754B]/50 hover:bg-[#81754B] w-2'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpaceSlideshow3D;

