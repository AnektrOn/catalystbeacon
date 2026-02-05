import React from 'react';
import './Act1CenterMessage.css';

/**
 * Act1CenterMessage Component
 * Sequential text reveal overlay for Act 1
 * Displays messages one by one with stagger animation
 */
const Act1CenterMessage = ({ messages = [], visible = false }) => {
  if (!visible) return null;

  return (
    <div className="act1-center-message">
      <div className="act1-message-container">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className="act1-message-line"
            style={{ animationDelay: `${index * 0.8}s` }}
          >
            {message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Act1CenterMessage;
