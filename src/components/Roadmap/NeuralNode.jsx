import React, { useState } from 'react';
import './NeuralNode.css';

const NeuralNode = ({ id, node, onClick }) => {
  const [isShaking, setIsShaking] = useState(false);

  const handleClick = () => {
    if (node.isLocked) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      return;
    }
    onClick();
  };

  const getNodeLabel = () => {
    return `NODE ${node.id + 1}`;
  };

  const status = node.isLocked ? 'locked' : node.status;

  return (
    <div
      id={status === 'active' ? 'active-roadmap-node' : id}
      className={`node-wrapper ${status} ${node.isBoss ? 'boss' : ''} ${isShaking ? 'shake' : ''} ${node.is_completed ? 'completed' : ''}`}
      style={{
        left: `calc(50% + ${node.x}px)`,
        top: `${node.y}px`,
      }}
      onClick={handleClick}
    >
      <div className="node-halo"></div>
      <div className="node-core" id={status === 'active' ? 'active-roadmap-node' : undefined}></div>
      <div className="node-label">{getNodeLabel()}</div>
      {node.is_completed && <div className="node-tooltip">Completed</div>}
      {node.isLocked && <div className="node-tooltip">{node.lockReason}</div>}
    </div>
  );
};

export default NeuralNode;