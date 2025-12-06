import React from 'react';

/**
 * Tooltip component for displaying node information
 */
const NodeTooltip = ({ node, position, visible }) => {
  if (!visible || !node) return null;

  const { x, y } = position;
  const tooltipStyle = {
    position: 'fixed',
    left: `${x}px`,
    top: `${y + 15}px`,
    zIndex: 1000,
    maxWidth: '240px',
    padding: '10px 14px',
    background: 'rgba(0, 0, 0, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#f0f0f0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
    pointerEvents: 'none'
  };

  // Adjust position if it would go off screen
  const adjustedStyle = { ...tooltipStyle };
  if (x + 240 > window.innerWidth) {
    adjustedStyle.left = `${x - 240}px`;
  }
  if (y + 100 > window.innerHeight) {
    adjustedStyle.top = `${y - 100}px`;
  }

  return (
    <div style={adjustedStyle}>
      <a
        href={node.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#FFD966] underline hover:text-[#FFE699]"
      >
        <strong>{node.title}</strong>
      </a>
      <br />
      <div className="mt-1 text-xs text-white/80">
        Difficulty: {node.label || `Level ${node.difficulty}`}
        <br />
        Constellation: {node.constellationAlias || 'N/A'}
        <br />
        Family: {node.familyAlias || 'N/A'}
      </div>
    </div>
  );
};

export default NodeTooltip;
