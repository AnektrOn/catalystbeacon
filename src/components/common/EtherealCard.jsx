import React from 'react';
import BaseCard from './BaseCard';

/**
 * EtherealCard - Reusable card matching XPCircleWidget / design system.
 * Delegates to BaseCard with variant="ethereal"; glass, particles, ambient glow.
 */
const EtherealCard = ({
  children,
  className = '',
  size = 'medium',
  elevated = false,
  interactive = false,
  withParticles = true,
  onClick,
  style = {}
}) => (
  <BaseCard
    variant="ethereal"
    size={size}
    elevated={elevated}
    interactive={interactive}
    withParticles={withParticles}
    onClick={onClick}
    className={className}
    style={style}
  >
    {children}
  </BaseCard>
);

export default EtherealCard;
