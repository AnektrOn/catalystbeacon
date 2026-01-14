import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/**
 * Core-specific color styles
 */
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

/**
 * Convert hex to vec3 string for shaders
 */
function hexToVec3(hex) {
  const r = ((hex >> 16) & 255) / 255;
  const g = ((hex >> 8) & 255) / 255;
  const b = (hex & 255) / 255;
  return `${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)}`;
}

/**
 * Generate core shader code
 */
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

/**
 * Generate corona shader code
 */
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

/**
 * ThreeSceneManager - Manages Three.js scenes for all cores
 * Handles initialization, rendering, and cleanup
 */
export class ThreeSceneManager {
  constructor() {
    this.scenes = {};
    this.animationFrameId = null;
    this.isAnimating = false;
  }

  /**
   * Initialize a scene for a specific core
   * @param {string} containerId - DOM element ID
   * @param {string} coreName - Core name ('Ignition', 'Insight', 'Transformation')
   * @returns {Object|null} Scene context or null if failed
   */
  initializeScene(containerId, coreName) {
    try {
      const container = document.getElementById(containerId);
      if (!container) {
        return null;
      }

      // Check if already initialized
      if (this.scenes[coreName]) {
        return this.scenes[coreName];
      }

      const W = container.clientWidth || window.innerWidth;
      const H = container.clientHeight || window.innerHeight;

      if (W === 0 || H === 0) {
        return null;
      }

      // Scene & Camera
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x101020);

      const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
      camera.position.z = 8;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      container.appendChild(renderer.domElement);

      // Post-processing
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new UnrealBloomPass(
        new THREE.Vector2(W, H),
        2.0,   // strength
        1.0,   // radius
        0.05   // threshold
      ));

      // OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0, 0);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.5;
      controls.zoomSpeed = 1.0;
      controls.panSpeed = 0.5;
      controls.minDistance = 10;
      controls.maxDistance = 350;
      controls.maxPolarAngle = Math.PI;
      controls.autoRotate = false;
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.screenSpacePanning = false;
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      };
      controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      };

      // Core styles
      const currentCoreStyles = CORE_STYLES[coreName];
      if (!currentCoreStyles) {
        return null;
      }

      // Sun Core
      const sunGeo = new THREE.SphereGeometry(1, 128, 128);
      const sunMat = new THREE.ShaderMaterial({
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
            float noise = snoise(vUv * 12.0 + time * 0.2);
            noise = pow(noise * 0.5 + 0.5, 3.0);
            ${generateCoreShader(coreName)}
            float edgeFactor = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
            vec3 finalColor;
            if (edgeFactor < 0.4) {
              finalColor = mix(coreColor, layer2Color, edgeFactor * 2.5);
            } else if (edgeFactor < 0.7) {
              finalColor = mix(layer2Color, layer3Color, (edgeFactor - 0.4) * 3.33);
            } else {
              finalColor = mix(layer3Color, surfaceColor, (edgeFactor - 0.7) * 3.33);
            }
            gl_FragColor = vec4(finalColor, 1.0);
          }
        `,
        side: THREE.DoubleSide
      });
      const sun = new THREE.Mesh(sunGeo, sunMat);
      scene.add(sun);

      // Corona Glow
      const coronaGeo = new THREE.SphereGeometry(1.25, 64, 64);
      const coronaMat = new THREE.ShaderMaterial({
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
            float glow = pow(1.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
            ${generateCoronaShader(coreName)}
            gl_FragColor = vec4(color * glow * 2.0, glow * 0.7);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      });
      const corona = new THREE.Mesh(coronaGeo, coronaMat);
      sun.add(corona);

      // Solar Flares
      const flareCount = coreName === 'Ignition' ? 10 : coreName === 'Insight' ? 20 : 30;
      const flareGeo = new THREE.BufferGeometry();
      const posArr = new Float32Array(flareCount * 3);
      const sizeArr = new Float32Array(flareCount);
      const colorArr = new Float32Array(flareCount * 3);

      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      const flareColor = new THREE.Color(currentCoreStyles.surfaceColor);

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

      const flares = new THREE.Points(flareGeo, flareMat);
      sun.add(flares);

      // Lighting
      scene.add(new THREE.AmbientLight(0x333333));
      const pointLight = new THREE.PointLight(0xff8844, 2, 50);
      pointLight.position.set(0, 0, 0);
      scene.add(pointLight);

      // Store context
      const context = {
        scene,
        renderer,
        camera,
        composer,
        controls,
        sunMat,
        coronaMat,
        flares,
        sun,
        container,
        coreName,
        containerId
      };

      this.scenes[coreName] = context;
      return context;
    } catch (error) {
      return null;
    }
  }

  /**
   * Start animation loop
   */
  startAnimation() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    const animate = (timeMs) => {
      if (!this.isAnimating) return;

      this.animationFrameId = requestAnimationFrame(animate);
      const t = timeMs * 0.001;

      // Update all scenes
      Object.values(this.scenes).forEach(ctx => {
        if (ctx && ctx.container) {
          const isVisible = ctx.container.style.visibility !== 'hidden' && 
                          ctx.container.style.display !== 'none';
          
          if (isVisible) {
            // Update animated materials
            if (ctx.sunMat) ctx.sunMat.uniforms.time.value = t;
            if (ctx.coronaMat) ctx.coronaMat.uniforms.time.value = t;
            if (ctx.flares) ctx.flares.rotation.y += 0.005;
            if (ctx.controls) ctx.controls.update();
            if (ctx.composer) ctx.composer.render();
          }
        }
      });
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Stop animation loop
   */
  stopAnimation() {
    this.isAnimating = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Get scene context for a core
   */
  getScene(coreName) {
    return this.scenes[coreName] || null;
  }

  /**
   * Handle window resize
   */
  handleResize() {
    Object.values(this.scenes).forEach(ctx => {
      if (!ctx || !ctx.container) return;

      const container = ctx.container;
      const w = container.clientWidth;
      const h = container.clientHeight;

      if (w > 0 && h > 0) {
        ctx.camera.aspect = w / h;
        ctx.camera.updateProjectionMatrix();
        ctx.renderer.setSize(w, h);
        ctx.composer.setSize(w, h);
      }
    });
  }

  /**
   * Cleanup and dispose of all resources
   */
  dispose() {
    this.stopAnimation();

    Object.values(this.scenes).forEach(ctx => {
      if (!ctx) return;

      // Dispose of geometries and materials
      ctx.scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      // Dispose renderer
      if (ctx.renderer) {
        ctx.renderer.dispose();
        if (ctx.container && ctx.renderer.domElement.parentNode === ctx.container) {
          ctx.container.removeChild(ctx.renderer.domElement);
        }
      }

      // Dispose composer
      if (ctx.composer) {
        ctx.composer.dispose();
      }
    });

    this.scenes = {};
  }
}
