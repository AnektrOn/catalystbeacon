import React from 'react';
import './EntityAuraFX.css';

/**
 * EntityAuraFX Component
 * Visual effects overlay for Act 2 entity scene
 * Layers: grain texture, radial fog, glow halo, vignette
 */
const EntityAuraFX = () => {
  return (
    <>
      {/* Grain texture overlay */}
      <div className="entity-fx-grain"></div>
      
      {/* Radial fog layers */}
      <div className="entity-fx-fog entity-fx-fog-1"></div>
      <div className="entity-fx-fog entity-fx-fog-2"></div>
      <div className="entity-fx-fog entity-fx-fog-3"></div>
      
      {/* Center glow halo */}
      <div className="entity-fx-glow"></div>
      
      {/* Vignette (dark edges) */}
      <div className="entity-fx-vignette"></div>
    </>
  );
};

export default EntityAuraFX;
