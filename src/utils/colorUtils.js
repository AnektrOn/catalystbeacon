/**
 * Color Utility Functions
 * Convert between hex and HSL formats
 */

/**
 * Convert hex color to HSL format (without hsl() wrapper)
 * @param {string} hex - Hex color (e.g., "#B4833D")
 * @returns {string} HSL values (e.g., "36 54% 47%")
 */
export function hexToHsl(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: h = 0;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

/**
 * Convert HSL string to hex
 * @param {string} hsl - HSL string (e.g., "36 54% 47%")
 * @returns {string} Hex color (e.g., "#B4833D")
 */
export function hslToHex(hsl) {
  const [h, s, l] = hsl.match(/\d+/g).map(Number);
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;

  let r, g, b;

  if (sNorm === 0) {
    r = g = b = lNorm; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
    const p = 2 * lNorm - q;

    r = hue2rgb(p, q, hNorm + 1/3);
    g = hue2rgb(p, q, hNorm);
    b = hue2rgb(p, q, hNorm - 1/3);
  }

  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Adjust lightness of HSL color
 * @param {string} hsl - HSL string
 * @param {number} delta - Lightness adjustment (-100 to 100)
 * @returns {string} Adjusted HSL string
 */
export function adjustLightness(hsl, delta) {
  const matches = hsl.match(/\d+/g);
  if (!matches || matches.length < 3) return hsl;
  const [h, s, l] = matches.map(Number);
  const newL = Math.max(0, Math.min(100, l + delta));
  return `${h} ${s}% ${newL}%`;
}

/**
 * Note: Algorithmic color generation functions removed.
 * All color palettes are now manually crafted for optimal
 * contrast ratios and visual hierarchy.
 * 
 * Only conversion utilities remain below.
 */

