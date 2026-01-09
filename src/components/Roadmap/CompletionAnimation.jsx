import React, { useEffect, useState } from 'react';
import './CompletionAnimation.css';

const CompletionAnimation = ({ isVisible, onComplete, xpEarned, lessonTitle }) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true);
      const timer = setTimeout(() => {
        setShowAnimation(false);
        if (onComplete) {
          setTimeout(() => onComplete(), 300);
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`completion-animation-overlay ${showAnimation ? 'visible' : ''}`}>
      <div className="completion-animation-content">
        <div className="completion-checkmark">
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        <h2 className="completion-title">LESSON COMPLETE</h2>
        <p className="completion-lesson">{lessonTitle}</p>
        <div className="completion-xp">
          <i className="fas fa-star"></i>
          <span>+{xpEarned} XP</span>
        </div>
        <div className="completion-message">Neural Link Strengthened</div>
      </div>
    </div>
  );
};

export default CompletionAnimation;
