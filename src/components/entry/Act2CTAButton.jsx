import React from 'react';
import './Act2CTAButton.css';

/**
 * Act2CTAButton Component
 * Minimalist white/gray gradient button for Act 2
 * "WHAT'S THE FIRST STEP?" button
 */
const Act2CTAButton = ({ onClick, children = "WHAT'S THE FIRST STEP?" }) => {
  return (
    <button className="act2-cta-button" onClick={onClick}>
      <span className="act2-cta-text">{children}</span>
    </button>
  );
};

export default Act2CTAButton;
