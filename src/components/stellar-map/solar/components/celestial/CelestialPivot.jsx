import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * CelestialPivot - Base component for orbital rotation
 * 
 * Creates a THREE.Group that rotates around Y axis and can be tilted on X/Z
 * Children are positioned at 'radius' distance on the X axis (local space)
 * Optional centerContent is rendered at orbit center (0,0,0) and does not orbit.
 * 
 * @param {Object} props
 * @param {React.Ref} props.innerRef - Ref to the outer group (orbit center in world space)
 * @param {number} props.radius - Distance from center where children are positioned
 * @param {number} props.speed - Rotation speed (radians per frame * timeScale)
 * @param {Array<number>} props.tilt - [x, z] rotation tilts in radians for 3D orbit
 * @param {number} props.initialAngle - Starting angle offset (radians)
 * @param {Array<number>} props.position - [x, y, z] position of the pivot center
 * @param {React.ReactNode} props.centerContent - Optional content at orbit center (e.g. clickable)
 * @param {React.ReactNode} props.children - Child elements to orbit
 */
const CelestialPivot = forwardRef(function CelestialPivot({ 
  radius = 5, 
  speed = 0.1, 
  tilt = [0, 0], 
  initialAngle = 0,
  position = [0, 0, 0],
  centerContent,
  children 
}, ref) {
  const pivotRef = useRef();
  const angleRef = useRef(initialAngle);

  useFrame((state, delta) => {
    if (!pivotRef.current) return;
    
    angleRef.current += speed * delta;
    pivotRef.current.rotation.y = angleRef.current;
    pivotRef.current.rotation.x = tilt[0];
    pivotRef.current.rotation.z = tilt[1];
  });
  
  return (
    <group ref={ref} position={position}>
      <group ref={pivotRef}>
        {centerContent ? <group position={[0, 0, 0]}>{centerContent}</group> : null}
        <group position={[radius, 0, 0]}>
          {children}
        </group>
      </group>
    </group>
  );
});

export default CelestialPivot;

/**
 * StaticPivot - Non-rotating group for static positioning
 * Used when we want to position something in orbit without animation
 * 
 * @param {Object} props
 * @param {number} props.radius - Distance from center
 * @param {number} props.angle - Fixed angle (radians)
 * @param {Array<number>} props.tilt - [x, z] rotation tilts
 * @param {Array<number>} props.position - [x, y, z] position of the pivot center
 * @param {React.ReactNode} props.children - Child elements
 */
export function StaticPivot({ 
  radius = 5, 
  angle = 0, 
  tilt = [0, 0],
  position = [0, 0, 0],
  children 
}) {
  const groupRef = useRef();
  
  // Apply static transformations
  if (groupRef.current) {
    groupRef.current.rotation.y = angle;
    groupRef.current.rotation.x = tilt[0];
    groupRef.current.rotation.z = tilt[1];
  }
  
  return (
    <group position={position}>
      <group ref={groupRef}>
        <group position={[radius, 0, 0]}>
          {children}
        </group>
      </group>
    </group>
  );
}

/**
 * OrbitTrail - Visual orbit ring/trail (optional visual aid)
 * 
 * @param {Object} props
 * @param {number} props.radius - Orbit radius
 * @param {string} props.color - Ring color
 * @param {number} props.opacity - Ring opacity
 * @param {Array<number>} props.tilt - [x, z] rotation tilts to match orbital plane
 */
export function OrbitTrail({ radius = 5, color = "#ffffff", opacity = 0.15, tilt = [0, 0] }) {
  const points = [];
  const segments = 128;
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      )
    );
  }
  
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return (
    <group rotation={[tilt[0], 0, tilt[1]]}>
      <line geometry={lineGeometry}>
        <lineBasicMaterial color={color} opacity={opacity} transparent />
      </line>
    </group>
  );
}
