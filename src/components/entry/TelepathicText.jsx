import React from 'react';
import './TelepathicText.css';

/**
 * TelepathicText Component
 * Sequential text reveal for Act 2
 * Lines appear one by one, previous lines dim
 */
const TelepathicText = ({ lines = [], currentIndex = 0 }) => {
  if (!lines || lines.length === 0) return null;

  return (
    <div className="telepathic-text-container">
      {lines.map((line, index) => (
        // Show all lines up to currentIndex, stacked vertically
        index <= currentIndex && (
          <div 
            key={index}
            className={`telepathic-text-line ${
              index === currentIndex ? 'active' : 
              'dimmed'
            }`}
          >
            {line}
          </div>
        )
      ))}
    </div>
  );
};

export default TelepathicText;
