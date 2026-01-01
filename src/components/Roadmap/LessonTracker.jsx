import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import useRoadmapLessonTracking from '../../hooks/useRoadmapLessonTracking';
import CompleteLessonModal from './CompleteLessonModal';
import './LessonTracker.css';

/**
 * LessonTracker - Floating side panel to track lesson progress
 * Displays progress bar and complete button
 * Mounted on lesson pages
 */
const LessonTracker = ({
  courseId,
  chapterNumber,
  lessonNumber,
  lessonId,
  lessonTitle,
  masterschool,
  enabled = true
}) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Log tracker props for debugging
  useEffect(() => {
    console.log('🎓 LessonTracker props:', {
      courseId,
      chapterNumber,
      lessonNumber,
      lessonId,
      lessonTitle,
      masterschool,
      enabled,
      userId: user?.id
    });
  }, [courseId, chapterNumber, lessonNumber, lessonId, lessonTitle, masterschool, enabled, user]);

  const {
    timeSpent,
    scrollPercentage,
    canComplete,
    minimumTimeMet,
    scrollComplete,
    timeRemaining,
    progressPercentage,
    error
  } = useRoadmapLessonTracking(
    user?.id,
    courseId,
    chapterNumber,
    lessonNumber,
    enabled
  );

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteClick = () => {
    if (canComplete) {
      setShowModal(true);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleLessonComplete = () => {
    // Refresh page or update state as needed
    window.location.reload();
  };

  if (!enabled || !user) return null;

  return (
    <>
      <div className={`lesson-tracker-panel ${isCollapsed ? 'lesson-tracker-panel--collapsed' : ''}`}>
        {/* Header */}
        <div className="lesson-tracker-panel__header">
          <h3 className="lesson-tracker-panel__title">Lesson Progress</h3>
          <button 
            className="lesson-tracker-panel__toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label="Toggle tracker"
          >
            {isCollapsed ? '◀' : '▶'}
          </button>
        </div>

        {!isCollapsed && (
          <>
            {/* Overall Progress */}
            <div className="lesson-tracker-panel__progress">
              <div className="lesson-tracker-panel__progress-ring">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="rgba(180, 131, 61, 0.2)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#B4833D"
                    strokeWidth="8"
                    strokeDasharray={339.292}
                    strokeDashoffset={339.292 * (1 - progressPercentage / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                  />
                </svg>
                <div className="lesson-tracker-panel__progress-text">
                  <span className="lesson-tracker-panel__percentage">{progressPercentage}%</span>
                  <span className="lesson-tracker-panel__label">Complete</span>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="lesson-tracker-panel__requirements">
              {/* Time Requirement */}
              <div className={`lesson-tracker-panel__requirement ${minimumTimeMet ? 'requirement--met' : ''}`}>
                <div className="requirement__icon">
                  {minimumTimeMet ? '✅' : '⏱️'}
                </div>
                <div className="requirement__content">
                  <div className="requirement__label">Time Spent</div>
                  <div className="requirement__value">
                    {formatTime(timeSpent)} / 3:00
                  </div>
                  {!minimumTimeMet && (
                    <div className="requirement__remaining">
                      {formatTime(timeRemaining)} remaining
                    </div>
                  )}
                </div>
              </div>

              {/* Scroll Requirement */}
              <div className={`lesson-tracker-panel__requirement ${scrollComplete ? 'requirement--met' : ''}`}>
                <div className="requirement__icon">
                  {scrollComplete ? '✅' : '📜'}
                </div>
                <div className="requirement__content">
                  <div className="requirement__label">Scroll Progress</div>
                  <div className="requirement__value">{scrollPercentage}%</div>
                  <div className="requirement__progress-bar">
                    <div 
                      className="requirement__progress-fill"
                      style={{ width: `${scrollPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="lesson-tracker-panel__error">
                ⚠️ {error}
              </div>
            )}

            {/* Complete Button */}
            <button
              className={`lesson-tracker-panel__button ${canComplete ? 'button--ready' : ''}`}
              onClick={handleCompleteClick}
              disabled={!canComplete}
            >
              {canComplete ? '✨ Complete Lesson' : '🔒 Complete Requirements First'}
            </button>

            {/* Hint */}
            {!canComplete && (
              <p className="lesson-tracker-panel__hint">
                {!minimumTimeMet && !scrollComplete && '⏱️ Spend 3 minutes and scroll to the bottom'}
                {!minimumTimeMet && scrollComplete && `⏱️ ${formatTime(timeRemaining)} remaining`}
                {minimumTimeMet && !scrollComplete && '📜 Scroll to the bottom'}
              </p>
            )}
          </>
        )}
      </div>

      <CompleteLessonModal
        isOpen={showModal}
        onClose={handleModalClose}
        userId={user.id}
        lessonId={lessonId}
        courseId={courseId}
        chapterNumber={chapterNumber}
        lessonNumber={lessonNumber}
        masterschool={masterschool}
        lessonTitle={lessonTitle}
        onComplete={handleLessonComplete}
      />
    </>
  );
};

export default LessonTracker;

