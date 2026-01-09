import React, { useState } from 'react';
import './NeuralNode.css';

const NeuralNode = ({ id, node, onClick }) => {
  const [isShaking, setIsShaking] = useState(false);

  const handleClick = () => {
    if (node.status === 'locked') {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      return;
    }
    onClick();
  };

  const getNodeLabel = () => {
    return `NODE ${node.id + 1}`;
  };

  return (
    <div
      id={id}
      className={`node-wrapper ${node.status} ${node.isBoss ? 'boss' : ''} ${isShaking ? 'shake' : ''}`}
      style={{
        left: `calc(50% + ${node.x}px)`,
        top: `${node.y}px`,
      }}
      onClick={handleClick}
    >
      <div className="node-halo"></div>
      <div className="node-core"></div>
      <div className="node-label">{getNodeLabel()}</div>
    </div>
  );
};

export default NeuralNode;
