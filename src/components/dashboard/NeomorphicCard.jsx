import React from 'react';
import BaseCard from '../common/BaseCard';
import './NeomorphicCard.css';

const NEO_SIZE_CLASS = {
  small: 'neo-card-small',
  medium: 'neo-card-medium',
  large: 'neo-card-large',
  xl: 'neo-card-xl'
};

/**
 * Neomorphic Card - BaseCard with data-variant="neomorphic" and size classes.
 */
const NeomorphicCard = ({
  children,
  size = 'medium',
  className = '',
  elevated = false,
  interactive = false,
  onClick,
  style = {}
}) => (
  <BaseCard
    variant="neomorphic"
    size={size}
    elevated={elevated}
    interactive={interactive}
    onClick={onClick}
    className={`${NEO_SIZE_CLASS[size] || NEO_SIZE_CLASS.medium} ${className}`.trim()}
    style={style}
  >
    {children}
  </BaseCard>
);

export default NeomorphicCard;

