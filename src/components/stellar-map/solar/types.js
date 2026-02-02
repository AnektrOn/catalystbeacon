/**
 * Types for solar system (from greengem/threejs-solar-system)
 * JSDoc for IDE; no runtime types in CRA.
 */

/** @typedef {{ id: number; name: string; texturePath: string; position: import('three').Vector3; radius: number; rotationSpeed: number; tilt: number; orbitSpeed: number; moons: MoonData[]; wobble?: boolean; rings?: RingsData; orbitalPosition?: import('three').Vector3; displayStats: DisplayStats }} PlanetData */

/** @typedef {{ texturePath: string; size: [number, number] }} RingsData */

/** @typedef {{ name: string }} MoonData */

/** @typedef {{ classification: string; orbitalPeriod: number; meanDistanceFromSun: number; accurateRadius: number; mass: number; surfaceGravity: number; rotationPeriod: number; axialTilt: number; numberOfMoons: number; atmosphericComposition: string; surfaceTemp: string }} DisplayStats */

export default {};
