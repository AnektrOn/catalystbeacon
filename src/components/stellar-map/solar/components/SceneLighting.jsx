export default function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.08} color="#FFE8C0" />
      <directionalLight
        castShadow
        intensity={1.4}
        color="#FFF5DC"
        position={[0, 2, 0]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={220}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={90}
        shadow-camera-bottom={-90}
      />
      <directionalLight
        intensity={0.05}
        color="#C0D8FF"
        position={[-10, -5, -10]}
      />
    </>
  );
}
