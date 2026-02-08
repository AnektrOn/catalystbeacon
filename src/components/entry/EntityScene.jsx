import React from 'react';
import './EntityScene.css';

const ACT2_IMAGE_MOBILE_URL = '/assets/4505bf8457486a00ffcb727fcce13ef341.jpg';
const ACT2_IMAGE_DESKTOP_URL = '/assets/' + encodeURIComponent('DASHBOARDe BG.png');

/**
 * EntityScene Component
 * Act 2: image de fond — une pour mobile, une pour ordi.
 * Mettre act2-mobile.jpg et act2-desktop.jpg dans public/assets/
 */
const EntityScene = () => {
  return (
    <div className="entity-scene">
      <img
        src={ACT2_IMAGE_MOBILE_URL}
        alt=""
        className="entity-background-image entity-background-image--mobile"
      />
      <img
        src={ACT2_IMAGE_DESKTOP_URL}
        alt=""
        className="entity-background-image entity-background-image--desktop"
      />
    </div>
  );
};

export default EntityScene;
