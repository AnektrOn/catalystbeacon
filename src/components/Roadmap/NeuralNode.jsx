import React, { useState } from 'react';
import { Check } from 'lucide-react';
import './NeuralNode.css';

const NeuralNode = ({ id, node, containerWidth, onClick }) => {
  const [isShaking, setIsShaking] = useState(false);

  const handleClick = () => {
    if (node.isLocked || node.status === 'locked') {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      return;
    }
    onClick();
  };

  const isCompleted = node.status === 'completed' || node.is_completed;
  const isLocked = node.status === 'locked' || node.isLocked;
  const isActive = node.status === 'active';

  const w = containerWidth != null && containerWidth > 0 ? containerWidth : 0;
  const leftPx = w > 0 ? w / 2 + node.x : 0;
  const topPx = node.y;

  return (
    <div
      id={isActive ? 'active-roadmap-node' : id}
      className={`node-ethereal ${isShaking ? 'shake' : ''}`}
      style={{
        position: 'absolute',
        left: `${leftPx}px`,
        top: `${topPx}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer'
      }}
      onClick={handleClick}
    >
      {/* Bioluminescent Halo */}
      <div
        className={`node-ethereal-halo${isActive ? ' halo-active' : ''}${isCompleted ? ' halo-completed' : ''}`}
      />

      {/* Core */}
      <div
        className={`node-ethereal-core${isActive ? ' core-active' : ''}${isCompleted ? ' core-completed' : ''}${isLocked ? ' core-locked' : ''}`}
      >
        {isCompleted && (
          <Check style={{ color: 'black', width: '14px', height: '14px', strokeWidth: 3 }} />
        )}
        {isActive && (
          <>
            <div className="core-ping" />
            <div className="core-orbit" />
          </>
        )}
      </div>

      {/* Label */}
      <div
        className={`node-ethereal-label${isActive ? ' label-active' : ''}${isCompleted ? ' label-completed' : ''}${isLocked ? ' label-locked' : ''}`}
      >
        {node.lesson?.lesson_title || `NODE ${node.id + 1}`}
      </div>
    </div>
  );
};

export default NeuralNode;
