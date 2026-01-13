import React from 'react';

/**
 * AmbientBackground - Pure Aurora High-Performance Background
 * 
 * A lightweight, animated ambient background using only CSS gradients.
 * No images, zero network data, maximum performance.
 * 
 * Features:
 * - Uses semantic color variables (primary, secondary, accent) that adapt to theme
 * - Smooth aurora animation with gentle movement and scaling
 * - Massive blur for diffused, ethereal light sources
 * - Positioned behind all content (z-[-50])
 */
const AmbientBackground = () => {
  return (
    <div className="fixed inset-0 z-[-50] bg-background overflow-hidden">
      {/* Orb 1 - Top Left: Primary Color */}
      <div
        className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/40 blur-[120px] animate-aurora"
        style={{
          animationDelay: '0s',
        }}
      />
      
      {/* Orb 2 - Bottom Right: Secondary Color */}
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/40 blur-[120px] animate-aurora"
        style={{
          animationDelay: '8s',
        }}
      />
      
      {/* Orb 3 - Center/Moving: Accent Color */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-accent/30 blur-[100px] animate-aurora"
        style={{
          animationDelay: '15s',
        }}
      />
    </div>
  );
};

export default AmbientBackground;
