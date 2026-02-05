import React, { useEffect, useState } from 'react';
import './TypingEffect.css';

/**
 * TypingEffect Component
 * Animation typing caractère par caractère, puis effacement avant ligne suivante
 */
const TypingEffect = ({ 
  lines = [], 
  typingSpeed = 50, 
  deletionSpeed = 30,
  pauseAfterLine = 2000,
  onComplete 
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (lines.length === 0) return;
    if (isComplete) return;

    const currentLine = lines[currentLineIndex];
    if (!currentLine) return;

    let timeout;

    if (!isDeleting) {
      // Typing phase
      if (currentText.length < currentLine.length) {
        timeout = setTimeout(() => {
          setCurrentText(currentLine.slice(0, currentText.length + 1));
        }, typingSpeed);
      } else {
        // Line complete, wait then start deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseAfterLine);
      }
    } else {
      // Deleting phase
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, deletionSpeed);
      } else {
        // Line deleted, move to next line
        if (currentLineIndex < lines.length - 1) {
          setIsDeleting(false);
          setCurrentLineIndex(currentLineIndex + 1);
        } else {
          // All lines done
          setIsComplete(true);
          if (onComplete) {
            onComplete();
          }
        }
      }
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [currentLineIndex, currentText, isDeleting, lines, typingSpeed, deletionSpeed, pauseAfterLine, isComplete, onComplete]);

  return (
    <div className="typing-effect">
      <span className="typing-text">{currentText}</span>
      {!isComplete && <span className="typing-cursor">|</span>}
    </div>
  );
};

export default TypingEffect;
