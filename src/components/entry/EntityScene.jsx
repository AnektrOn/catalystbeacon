import React from 'react';
import './EntityScene.css';

/**
 * EntityScene Component
 * Full-screen video background for Act 2
 */
const EntityScene = () => {
  return (
    <div className="entity-scene">
      {/* Full-screen video background */}
      <video 
        className="entity-background-video"
        src="/assets/act2-background.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
};

export default EntityScene;
