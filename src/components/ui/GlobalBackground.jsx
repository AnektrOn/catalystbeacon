import React from 'react';

/**
 * GlobalBackground - Consolidated Background System
 * 
 * A single component that handles all background layers:
 * - Base color from palette
 * - Animated Aurora orbs (primary, secondary, accent)
 * - Noise texture overlay
 */
const GlobalBackground = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      {/* Layer 1: Base Color */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Layer 2: Aurora Orbs */}
      {/* Orb 1 - Primary Color */}
      <div
        className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-primary opacity-60 blur-[100px] animate-aurora will-change-transform"
        style={{
          animationDelay: '0s',
          mixBlendMode: 'multiply',
        }}
      />
      
      {/* Orb 2 - Secondary Color */}
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary opacity-60 blur-[100px] animate-aurora will-change-transform"
        style={{
          animationDelay: '5s',
          mixBlendMode: 'multiply',
        }}
      />
      
      {/* Orb 3 - Accent Color */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-accent opacity-60 blur-[100px] animate-aurora will-change-transform"
        style={{
          animationDelay: '10s',
          mixBlendMode: 'multiply',
        }}
      />
      
      {/* Layer 3: Noise Overlay */}
      <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay" />
    </div>
  );
};

export default GlobalBackground;
