import React from 'react';
import BaseCard from '../common/BaseCard';

/**
 * Modern Card - Ethereal variant for dashboard/widgets.
 * Single BaseCard; no duplicate styles or inline style block.
 */
const ModernCard = ({
  children,
  className = '',
  elevated = false,
  interactive = false,
  onClick
}) => (
  <BaseCard
    variant="ethereal"
    size="medium"
    elevated={elevated}
    interactive={interactive}
    withParticles={false}
    onClick={onClick}
    className={className}
  >
    {children}
  </BaseCard>
);

export default ModernCard;
