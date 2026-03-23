import * as THREE from 'three';

const textureCache = new Map();

function hash2D(x, y, seed) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  let h = (xi * 374761393) ^ (yi * 668265263) ^ (seed * 1274126177);
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smoothNoise2D(x, y, seed) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2D(xi, yi, seed);
  const b = hash2D(xi + 1, yi, seed);
  const c = hash2D(xi, yi + 1, seed);
  const d = hash2D(xi + 1, yi + 1, seed);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

/**
 * Fractal Brownian motion in 2D
 */
export function fbm(x, y, octaves, seed) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise2D(x * frequency, y * frequency, seed + i * 7919);
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return norm > 0 ? value / norm : 0;
}

/**
 * Height field for rocky planets / normal map (same formula as spec)
 */
export function rockyHeight(fx, fy, seed) {
  return fbm(fx * 4, fy * 4, 5, seed);
}

export function gasBandHeight(fx, fy, seed) {
  return fbm(fx * 2, fy * 16, 4, seed);
}

function lerpColor(t, c0, c1) {
  return [
    c0[0] + (c1[0] - c0[0]) * t,
    c0[1] + (c1[1] - c0[1]) * t,
    c0[2] + (c1[2] - c0[2]) * t,
  ];
}

function createRockyTextureUncached(seed, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  const warmDark = [45, 28, 18];
  const warmLight = [210, 165, 115];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const n = fbm(u * 6, v * 6, 6, seed);
      const detail = fbm(u * 24, v * 24, 3, seed + 333);
      const h = Math.min(1, Math.max(0, n * 0.85 + detail * 0.15));
      const [r, g, b] = lerpColor(h, warmDark, warmLight);
      const i = (y * size + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createGasGiantTextureUncached(seed, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  const bands = [
    [80, 55, 35],
    [140, 100, 60],
    [95, 70, 45],
    [180, 130, 75],
    [110, 80, 50],
  ];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const turb = fbm(u * 8, v * 3, 4, seed + 101);
      const band = (v * 5 + turb * 0.4 + u * 0.15) % 1;
      const bi = Math.floor(band * bands.length) % bands.length;
      const bf = (band * bands.length) % 1;
      const c0 = bands[bi];
      const c1 = bands[(bi + 1) % bands.length];
      const [r, g, b] = lerpColor(bf, c0, c1);
      const storm = fbm(u * 20, v * 20, 2, seed + 777);
      const mul = 0.75 + storm * 0.35;
      const i = (y * size + x) * 4;
      img.data[i] = Math.min(255, r * mul);
      img.data[i + 1] = Math.min(255, g * mul);
      img.data[i + 2] = Math.min(255, b * mul);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createNormalMap(heightFn, seed, size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  const eps = 1 / size;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const hL = heightFn(Math.max(0, u - eps), v, seed);
      const hR = heightFn(Math.min(1, u + eps), v, seed);
      const hD = heightFn(u, Math.max(0, v - eps), seed);
      const hU = heightFn(u, Math.min(1, v + eps), seed);
      let nx = (hL - hR) * 0.5;
      let nz = (hD - hU) * 0.5;
      let ny = 1;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      nx = nx / len * 0.5 + 0.5;
      ny = ny / len * 0.5 + 0.5;
      nz = nz / len * 0.5 + 0.5;
      const i = (y * size + x) * 4;
      img.data[i] = nx * 255;
      img.data[i + 1] = ny * 255;
      img.data[i + 2] = nz * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createRoughnessMapUncached(seed, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const n = fbm(u * 5, v * 5, 3, seed);
      const rough = 0.55 + n * 0.4;
      const g = Math.round(rough * 255);
      const i = (y * size + x) * 4;
      img.data[i] = g;
      img.data[i + 1] = g;
      img.data[i + 2] = g;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createRingTextureUncached(seed, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2;
  const img = ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.sqrt(dx * dx + dy * dy) / maxR;
      const i = (y * size + x) * 4;
      if (r < 0.35 || r > 0.95) {
        img.data[i + 3] = 0;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 0;
        continue;
      }
      const bands = Math.sin(r * 60 + seed * 0.01) * 0.5 + 0.5;
      const t = (r - 0.35) / 0.6;
      const br = 60 + t * 180 + bands * 40;
      const bg = 45 + t * 125 + bands * 30;
      const bb = 25 + t * 85 + bands * 20;
      const edge = Math.min(1, (r - 0.35) / 0.08) * Math.min(1, (0.95 - r) / 0.08);
      img.data[i] = Math.min(255, br);
      img.data[i + 1] = Math.min(255, bg);
      img.data[i + 2] = Math.min(255, bb);
      img.data[i + 3] = Math.round(255 * edge * (0.4 + bands * 0.6));
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Module-level cache; key `${type}-${seed}-${size}`
 */
export function getCachedTexture(type, seed, size) {
  const key = `${type}-${seed}-${size}`;
  if (textureCache.has(key)) return textureCache.get(key);

  let tex;
  switch (type) {
    case 'rocky':
      tex = createRockyTextureUncached(seed, size);
      break;
    case 'gas':
      tex = createGasGiantTextureUncached(seed, size);
      break;
    case 'normal':
      tex = createNormalMap(rockyHeight, seed, size);
      break;
    case 'normalGas':
      tex = createNormalMap(gasBandHeight, seed, size);
      break;
    case 'roughness':
      tex = createRoughnessMapUncached(seed, size);
      break;
    case 'ring':
      tex = createRingTextureUncached(seed, size);
      break;
    default:
      tex = createRockyTextureUncached(seed, size);
  }
  textureCache.set(key, tex);
  return tex;
}

export function createRockyTexture(seed, size = 256) {
  return getCachedTexture('rocky', seed, size);
}

export function createGasGiantTexture(seed, size = 256) {
  return getCachedTexture('gas', seed, size);
}

export function createRoughnessMap(seed, size = 128) {
  return getCachedTexture('roughness', seed, size);
}

export function createRingTexture(seed, size = 512) {
  return getCachedTexture('ring', seed, size);
}
