import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Animated blob that responds to hover
function AnimatedBlob({ position, color = "#B4833D", scale = 1 }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      
      const targetScale = hovered ? scale * 1.2 : scale;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere
        ref={meshRef}
        args={[1, 100, 100]}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <MeshDistortMaterial
          color={hovered ? '#FFD700' : color}
          attach="material"
          distort={0.5}
          speed={2}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.3}
        />
      </Sphere>
    </Float>
  );
}

// Spiral of particles
function ParticleSpiral({ count = 200 }) {
  const points = useRef();

  const particlesPosition = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 4;
      const radius = 5 + t * 0.5;
      positions[i * 3] = Math.cos(t) * radius;
      positions[i * 3 + 1] = Math.sin(t) * radius;
      positions[i * 3 + 2] = t * 0.5 - 10;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#B4833D"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Floating ring structure
function FloatingRings() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.1, 16, 100]} />
        <meshStandardMaterial color="#B4833D" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[3.2, 0.1, 16, 100]} />
        <meshStandardMaterial color="#81754B" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[3.4, 0.1, 16, 100]} />
        <meshStandardMaterial color="#66371B" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Main Interactive 3D Section Component
const Interactive3DSection = ({ 
  children, 
  type = 'blobs', 
  className = '',
  backgroundColor = 'transparent'
}) => {
  return (
    <div className={`relative w-full ${className}`} style={{ backgroundColor }}>
      {/* 3D Canvas Background */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 75 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#B4833D" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#81754B" />
          
          {/* Stars background */}
          <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />

          {/* Different 3D elements based on type */}
          {type === 'blobs' && (
            <>
              <AnimatedBlob position={[-3, 2, 0]} color="#B4833D" scale={1.5} />
              <AnimatedBlob position={[3, -2, -2]} color="#81754B" scale={1.2} />
              <AnimatedBlob position={[0, -1, -4]} color="#66371B" scale={1} />
            </>
          )}

          {type === 'spiral' && <ParticleSpiral count={300} />}

          {type === 'rings' && <FloatingRings />}

          {type === 'mixed' && (
            <>
              <FloatingRings />
              <AnimatedBlob position={[0, 0, 2]} color="#B4833D" scale={1} />
              <ParticleSpiral count={150} />
            </>
          )}

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Interactive3DSection;

