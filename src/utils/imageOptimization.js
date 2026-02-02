/**
 * Image Optimization Utilities
 * Provides utilities for optimizing images on mobile devices
 */

/**
 * Get optimized image URL based on device capabilities
 * @param {string} originalUrl - Original image URL
 * @param {object} options - Options for optimization
 * @returns {string} Optimized image URL
 */
export function getOptimizedImageUrl(originalUrl, options = {}) {
  if (!originalUrl) return originalUrl;

  const {
    width,
    height,
    quality = 80,
    format = 'webp'
  } = options;

  // If image is already optimized or external, return as-is
  if (originalUrl.includes('http') && !originalUrl.includes('supabase')) {
    return originalUrl;
  }

  // For Supabase storage, add transformation parameters
  if (originalUrl.includes('supabase')) {
    const url = new URL(originalUrl);
    const params = new URLSearchParams();

    if (width) params.append('width', width);
    if (height) params.append('height', height);
    if (quality) params.append('quality', quality);
    if (format) params.append('format', format);

    if (params.toString()) {
      url.search = params.toString();
      return url.toString();
    }
  }

  return originalUrl;
}

/**
 * Create responsive image srcset
 * @param {string} baseUrl - Base image URL
 * @param {Array<number>} widths - Array of widths
 * @returns {string} srcset string
 */
export function createSrcSet(baseUrl, widths = [320, 640, 1024, 1920]) {
  return widths
    .map(width => `${getOptimizedImageUrl(baseUrl, { width })} ${width}w`)
    .join(', ');
}

/**
 * Lazy load image with intersection observer
 * @param {HTMLElement} imgElement - Image element
 * @param {string} src - Image source
 */
export function lazyLoadImage(imgElement, src) {
  if (!imgElement || !src) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px'
  });

  observer.observe(imgElement);
}

/**
 * Preload critical images
 * @param {Array<string>} urls - Array of image URLs to preload
 */
export function preloadImages(urls) {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Get image dimensions for responsive sizing
 * @param {string} url - Image URL
 * @returns {Promise<{width: number, height: number}>}
 */
export function getImageDimensions(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = reject;
    img.src = url;
  });
}
