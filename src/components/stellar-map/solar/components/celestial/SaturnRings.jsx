import { useLoader } from '@react-three/fiber';
import { TextureLoader, DoubleSide } from 'three';
import { Ring } from '@react-three/drei';

export default function SaturnRings({ texturePath, innerRadius, outerRadius }) {
  const texture = useLoader(TextureLoader, texturePath);

  return (
    <Ring args={[innerRadius, outerRadius, 128]} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial map={texture} side={DoubleSide} transparent />
    </Ring>
  );
}
