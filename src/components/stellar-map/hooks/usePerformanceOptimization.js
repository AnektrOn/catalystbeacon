import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for performance optimizations
 * Implements render throttling and pixel ratio capping
 * @param {Object} contexts - Map of Three.js contexts
 * @returns {Object} Performance utilities
 */
export function usePerformanceOptimization(contexts) {
  const needsRenderRef = useRef(true);
  const rafIdRef = useRef(null);

  /**
   * Mark that a render is needed
   */
  const invalidateRender = useCallback(() => {
    needsRenderRef.current = true;
  }, []);

  /**
   * Cap pixel ratio for performance
   */
  useEffect(() => {
    if (!contexts) return;

    Object.values(contexts).forEach(ctx => {
      if (ctx?.renderer && !ctx.renderer._pixelRatioCapped) {
        ctx.renderer.setPixelRatio(
          Math.min(window.devicePixelRatio || 1, 1.5)
        );
        ctx.renderer._pixelRatioCapped = true;
      }
    });
  }, [contexts]);

  /**
   * Attach invalidators to controls
   */
  useEffect(() => {
    if (!contexts) return;

    Object.values(contexts).forEach(ctx => {
      if (ctx?.controls && !ctx.controls._invalidateHooked) {
        ctx.controls.addEventListener('change', invalidateRender);
        ctx.controls._invalidateHooked = true;
      }
    });

    return () => {
      Object.values(contexts).forEach(ctx => {
        if (ctx?.controls?._invalidateHooked) {
          ctx.controls.removeEventListener('change', invalidateRender);
        }
      });
    };
  }, [contexts, invalidateRender]);

  /**
   * Handle window resize
   */
  useEffect(() => {
    const handleResize = () => {
      invalidateRender();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [invalidateRender]);

  /**
   * Optimized render loop
   */
  useEffect(() => {
    const render = (timeMs) => {
      rafIdRef.current = requestAnimationFrame(render);
      const t = timeMs * 0.001; // seconds

      // Update animated materials (cheap operation)
      if (contexts) {
        Object.values(contexts).forEach(ctx => {
          if (ctx?.sunMat) {
            ctx.sunMat.uniforms.time.value = t;
          }
          if (ctx?.coronaMat) {
            ctx.coronaMat.uniforms.time.value = t;
          }
          if (ctx?.flares) {
            ctx.flares.rotation.y += 0.005;
          }
        });
      }

      // Only render if needed
      if (!needsRenderRef.current) return;

      // Render visible canvases
      if (contexts) {
        Object.values(contexts).forEach(ctx => {
          const canvasVisible =
            ctx.renderer?.domElement?.parentElement?.style.display !== 'none';
          if (canvasVisible && ctx?.composer) {
            ctx.composer.render();
          }
        });
      }

      needsRenderRef.current = false;
    };

    rafIdRef.current = requestAnimationFrame(render);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [contexts]);

  return {
    invalidateRender
  };
}
