import React from 'react';
import './Act1CTAButton.css';

/**
 * Act1CTAButton Component
 * Gradient CTA button with glow effect
 * "RELEASE MY CHAINS" button for Act 1
 */
const Act1CTAButton = ({ onClick, children = 'RELEASE MY CHAINS' }) => {
  return (
    <button className="act1-cta-button" onClick={onClick}>
      <span className="act1-cta-text">{children}</span>
      <div className="act1-cta-glow"></div>
    </button>
  );
};

export default Act1CTAButton;
