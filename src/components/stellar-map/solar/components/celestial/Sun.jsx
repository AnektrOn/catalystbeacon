import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { MeshWobbleMaterial, Sphere } from '@react-three/drei';

export default function Sun({ position, radius }) {
  const sunTexture = useLoader(TextureLoader, '/images/bodies/sun_2k.webp');

  return (
    <mesh position={position}>
      <Sphere args={[radius, 32, 32]}>
        <MeshWobbleMaterial
          map={sunTexture}
          emissive="#FFFF99"
          emissiveIntensity={0.012}
          factor={0.1}
          speed={0.05}
        />
      </Sphere>
    </mesh>
  );
}
