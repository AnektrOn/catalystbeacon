import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CORE_STYLES = {
  Ignition: {
    coreColor: 0x220901,
    layer2Color: 0x220901,
    layer3Color: 0x220901,
    surfaceColor: 0xF6AA1C,
    coronaColor: 0xF6AA1C
  },
  Insight: {
    coreColor: 0x0F084B,
    layer2Color: 0x3D60A7,
    layer3Color: 0x44BBA4,
    surfaceColor: 0xE7BB41,
    coronaColor: 0x44BBA4
  },
  Transformation: {
    coreColor: 0x3A0C2E,
    layer2Color: 0x7B2D4F,
    layer3Color: 0xE15554,
    surfaceColor: 0xE1BC29,
    coronaColor: 0xE15554
  }
};

function hexToVec3(hex) {
  const r = ((hex >> 16) & 255) / 255;
  const g = ((hex >> 8) & 255) / 255;
  const b = (hex & 255) / 255;
  return `${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)}`;
}

function generateCoreShader(coreName) {
  const core = CORE_STYLES[coreName];
  if (!core) return '';
  return `
    vec3 coreColor    = vec3(${hexToVec3(core.coreColor)});
    vec3 layer2Color  = vec3(${hexToVec3(core.layer2Color)});
    vec3 layer3Color  = vec3(${hexToVec3(core.layer3Color)});
    vec3 surfaceColor = vec3(${hexToVec3(core.surfaceColor)});
  `;
}

function generateCoronaShader(coreName) {
  const core = CORE_STYLES[coreName];
  if (!core) return '';
  return `
    vec3 color = mix(
      vec3(${hexToVec3(core.layer3Color)}),
      vec3(${hexToVec3(core.coronaColor)}),
      glow
    );
  `;
}

export function CoreSun({ coreName }) {
  const sunRef = useRef();
  const coronaRef = useRef();
  const flaresRef = useRef();

  const core = CORE_STYLES[coreName];

  // Sun shader material
  const sunMaterial = useMemo(() => {
    if (!core) return null;
    return new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main(){
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform float time;
        vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
        float snoise(vec2 v){
          const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
          vec2 i = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y)? vec2(1.0,0.0): vec2(0.0,1.0);
          vec4 x12 = x0.xyxy + C.xxzz - vec4(i1.xy,i1.xy);
          i = mod(i, 289.0);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                           + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0),
                                  dot(x12.xy,x12.xy),
                                  dot(x12.zw,x12.zw)), 0.0);
          m = m*m*m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          vec3 g;
          g.x  = a0.x * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }
        void main() {
          // Simplified noise calculation for better performance
          float noise = snoise(vUv * 8.0 + time * 0.15);
          noise = pow(noise * 0.5 + 0.5, 2.0);
          ${generateCoreShader(coreName)}
          // Simplified edge factor calculation
          float edgeFactor = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          vec3 finalColor;
          if (edgeFactor < 0.5) {
            finalColor = mix(coreColor, layer2Color, edgeFactor * 2.0);
          } else {
            finalColor = mix(layer2Color, surfaceColor, (edgeFactor - 0.5) * 2.0);
          }
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });
  }, [coreName, core]);

  // Corona shader material
  const coronaMaterial = useMemo(() => {
    if (!core) return null;
    return new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec3 vNormal;
        void main(){
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform float time;
        void main() {
          // Simplified glow calculation
          float glow = pow(1.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          ${generateCoronaShader(coreName)}
          gl_FragColor = vec4(color * glow * 1.5, glow * 0.6);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
  }, [coreName, core]);

  // Flares geometry and material
  const { flareGeometry, flareMaterial } = useMemo(() => {
    if (!core) return { flareGeometry: null, flareMaterial: null };
    // Further reduced flare count for performance
    const flareCount = coreName === 'Ignition' ? 3 : coreName === 'Insight' ? 5 : 8;
    const flareGeo = new THREE.BufferGeometry();
    const posArr = new Float32Array(flareCount * 3);
    const sizeArr = new Float32Array(flareCount);
    const colorArr = new Float32Array(flareCount * 3);

    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const flareColor = new THREE.Color(core.surfaceColor);

    for (let i = 0; i < flareCount; i++) {
      const y = 1 - (i / (flareCount - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = 2 * Math.PI * i / goldenRatio;

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      const distance = 2 + Math.random() * 1;
      posArr[i * 3] = x * distance;
      posArr[i * 3 + 1] = y * distance;
      posArr[i * 3 + 2] = z * distance;

      sizeArr[i] = 0.2 + Math.random() * 0.3;

      colorArr[i * 3] = flareColor.r;
      colorArr[i * 3 + 1] = flareColor.g;
      colorArr[i * 3 + 2] = flareColor.b;
    }

    flareGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    flareGeo.setAttribute('size', new THREE.BufferAttribute(sizeArr, 1));
    flareGeo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));

    const flareMat = new THREE.PointsMaterial({
      vertexColors: true,
      size: 0.3,
      sizeAttenuation: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.9
    });

    return { flareGeometry: flareGeo, flareMaterial: flareMat };
  }, [coreName, core]);

  // Animate - Throttled for maximum performance
  let lastUpdate = 0;
  useFrame((state) => {
    if (!core) return;
    
    // Only update every 3 frames (~20fps animation) for better performance
    if (state.clock.elapsedTime - lastUpdate < 0.05) return;
    lastUpdate = state.clock.elapsedTime;
    
    const t = state.clock.elapsedTime;
    
    // Update shader uniforms (lightweight)
    if (sunRef.current?.material) {
      sunRef.current.material.uniforms.time.value = t;
    }
    if (coronaRef.current?.material) {
      coronaRef.current.material.uniforms.time.value = t;
    }
    
    // Slower rotation for flares
    if (flaresRef.current) {
      flaresRef.current.rotation.y += 0.002;
    }
  });

  // Early return after all hooks
  if (!core) return null;

  return (
    <group scale={0.6}>
      {/* Core Sun - Minimized segments for maximum performance */}
      <mesh ref={sunRef} material={sunMaterial}>
        <sphereGeometry args={[1, 12, 12]} />
      </mesh>

      {/* Corona Glow - Minimized segments */}
      <mesh ref={coronaRef} material={coronaMaterial}>
        <sphereGeometry args={[1.25, 8, 8]} />
      </mesh>

      {/* Solar Flares - Reduced count */}
      {flareGeometry && flareMaterial && (
        <points ref={flaresRef} geometry={flareGeometry} material={flareMaterial} />
      )}
    </group>
  );
}
