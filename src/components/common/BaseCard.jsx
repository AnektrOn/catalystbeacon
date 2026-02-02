import React from 'react';
import './BaseCard.css';

/**
 * BaseCard - Single card primitive for CatalystBeacon design system.
 * Variant is controlled via data-variant so ~90% of styling is shared.
 * Use .transition-snappy / .transition-ambient for intent-based transitions.
 */
const BaseCard = ({
  children,
  variant = 'ethereal', // 'ethereal' | 'neomorphic'
  className = '',
  size = 'medium',
  elevated = false,
  interactive = false,
  withParticles = false,
  onClick,
  style = {},
  ...props
}) => {
  const classes = [
    'base-card',
    `base-card--${variant}`,
    size && `base-card--${size}`,
    elevated && 'base-card--elevated',
    interactive && 'base-card--interactive',
    withParticles && 'base-card--particles',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      data-variant={variant}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      style={style}
      {...props}
    >
      {withParticles && (
        <div className="base-card__particles" aria-hidden>
          <span className="base-card__particle base-card__particle--1" />
          <span className="base-card__particle base-card__particle--2" />
          <span className="base-card__particle base-card__particle--3" />
        </div>
      )}
      <div className="base-card__content">{children}</div>
    </div>
  );
};

export default BaseCard;
