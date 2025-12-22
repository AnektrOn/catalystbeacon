import React from 'react';
import { CheckCircle2, Clock, Award, Bookmark, BookmarkCheck } from 'lucide-react';

/**
 * Tooltip component for displaying node information
 */
const NodeTooltip = ({ node, position, visible, completionMap = new Map(), isBookmarked = false, onToggleBookmark }) => {
  if (!visible || !node) return null;

  const { x, y } = position;
  const completion = completionMap.get(node.id);
  const isCompleted = completion?.completed || node.isCompleted || false;
  const xpReward = node.xp_reward || node.xpReward || (node.difficulty ? node.difficulty * 10 : 0);

  const tooltipStyle = {
    position: 'fixed',
    left: `${x}px`,
    top: `${y + 15}px`,
    zIndex: 1000,
    maxWidth: '280px',
    padding: '12px 16px',
    background: 'rgba(0, 0, 0, 0.92)',
    border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
    borderRadius: '6px',
    fontSize: '13px',
    color: '#f0f0f0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.8)',
    pointerEvents: 'none',
    backdropFilter: 'blur(8px)'
  };

  // Adjust position if it would go off screen
  const adjustedStyle = { ...tooltipStyle };
  if (x + 280 > window.innerWidth) {
    adjustedStyle.left = `${x - 280}px`;
  }
  if (y + 150 > window.innerHeight) {
    adjustedStyle.top = `${y - 150}px`;
  }

  return (
    <div style={adjustedStyle}>
      <div className="flex items-start gap-2 mb-2">
        <a
          href={node.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FFD966] hover:text-[#FFE699] font-semibold flex-1"
        >
          {node.title}
        </a>
        <div className="flex items-center gap-1">
          {isCompleted && (
            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
          )}
          {onToggleBookmark && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleBookmark(node.id);
              }}
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-1 text-xs text-white/80">
        <div className="flex items-center gap-2">
          <span className="font-medium">Difficulty:</span>
          <span>{node.difficulty_label || `Level ${node.difficulty || 0}`}</span>
        </div>
        
        {xpReward > 0 && (
          <div className="flex items-center gap-2">
            <Award size={12} className="text-yellow-400" />
            <span>XP Reward: {xpReward}</span>
          </div>
        )}
        
        {isCompleted && completion?.completedAt && (
          <div className="flex items-center gap-2 text-green-400">
            <Clock size={12} />
            <span>Completed: {new Date(completion.completedAt).toLocaleDateString()}</span>
          </div>
        )}
        
        <div className="pt-1 border-t border-white/10 mt-2">
          <div className="text-white/60">
            <div>Constellation: {node.constellationAlias || 'N/A'}</div>
            <div>Family: {node.familyAlias || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeTooltip;
