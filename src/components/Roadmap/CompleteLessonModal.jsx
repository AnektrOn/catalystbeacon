import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import roadmapService from '../../services/roadmapService';
import './CompleteLessonModal.css';

/**
 * CompleteLessonModal - Modal for completing a lesson
 * Shows XP earned, skill points, and option to continue to next lesson
 */
const CompleteLessonModal = ({
  isOpen,
  onClose,
  userId,
  lessonId,
  courseId,
  chapterNumber,
  lessonNumber,
  masterschool,
  lessonTitle,
  onComplete
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [completed, setCompleted] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await roadmapService.completeLesson(
        userId,
        lessonId,
        courseId,
        chapterNumber,
        lessonNumber,
        masterschool,
        lessonTitle
      );

      if (result.success) {
        setRewards(result.rewards);
        setCompleted(true);
        
        if (onComplete) {
          onComplete(result);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToNext = async () => {
    try {
      const nextLesson = await roadmapService.getNextLesson(userId, masterschool);
      
      if (nextLesson) {
        navigate(`/courses/${nextLesson.course_id}/chapter/${nextLesson.chapter_number}/lesson/${nextLesson.lesson_number}`);
      } else {
        navigate(`/roadmap/${masterschool.toLowerCase()}`);
      }
      
      onClose();
    } catch (err) {
      console.error('Error getting next lesson:', err);
      navigate(`/roadmap/${masterschool.toLowerCase()}`);
      onClose();
    }
  };

  const handleBackToRoadmap = () => {
    navigate(`/roadmap/${masterschool.toLowerCase()}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="complete-lesson-modal__overlay" onClick={onClose}>
      <div className="complete-lesson-modal" onClick={(e) => e.stopPropagation()}>
        {!completed ? (
          // Pre-completion state
          <div className="complete-lesson-modal__content">
            <h2 className="complete-lesson-modal__title">Complete Lesson?</h2>
            <p className="complete-lesson-modal__message">
              You've met all the requirements for this lesson. Complete it now to earn your rewards!
            </p>

            {error && (
              <div className="complete-lesson-modal__error">
                {error}
              </div>
            )}

            <div className="complete-lesson-modal__actions">
              <button
                className="complete-lesson-modal__button complete-lesson-modal__button--primary"
                onClick={handleComplete}
                disabled={loading}
              >
                {loading ? 'Completing...' : 'Complete Lesson'}
              </button>
              <button
                className="complete-lesson-modal__button complete-lesson-modal__button--secondary"
                onClick={onClose}
                disabled={loading}
              >
                Not Yet
              </button>
            </div>
          </div>
        ) : (
          // Post-completion state with rewards
          <div className="complete-lesson-modal__content complete-lesson-modal__content--success">
            <div className="complete-lesson-modal__success-icon">
              🎉
            </div>

            <h2 className="complete-lesson-modal__title">Lesson Complete!</h2>
            <p className="complete-lesson-modal__lesson-title">{lessonTitle}</p>

            {rewards && (
              <div className="complete-lesson-modal__rewards">
                <div className="complete-lesson-modal__reward">
                  <div className="complete-lesson-modal__reward-icon">⭐</div>
                  <div className="complete-lesson-modal__reward-content">
                    <span className="complete-lesson-modal__reward-label">XP Earned</span>
                    <span className="complete-lesson-modal__reward-value">
                      +{rewards.xp_earned}
                    </span>
                  </div>
                </div>

                {rewards.skills_earned && rewards.skills_earned.length > 0 && (
                  <div className="complete-lesson-modal__reward">
                    <div className="complete-lesson-modal__reward-icon">💪</div>
                    <div className="complete-lesson-modal__reward-content">
                      <span className="complete-lesson-modal__reward-label">Skills</span>
                      <span className="complete-lesson-modal__reward-value">
                        {rewards.skills_earned.join(', ')}
                      </span>
                    </div>
                  </div>
                )}

                <div className="complete-lesson-modal__reward">
                  <div className="complete-lesson-modal__reward-icon">📈</div>
                  <div className="complete-lesson-modal__reward-content">
                    <span className="complete-lesson-modal__reward-label">Skill Points</span>
                    <span className="complete-lesson-modal__reward-value">
                      +{rewards.skill_points}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="complete-lesson-modal__unlock-message">
              <span className="complete-lesson-modal__unlock-icon">🔓</span>
              <span>Next lesson unlocked!</span>
            </div>

            <div className="complete-lesson-modal__actions">
              <button
                className="complete-lesson-modal__button complete-lesson-modal__button--primary"
                onClick={handleContinueToNext}
              >
                Continue to Next Lesson
              </button>
              <button
                className="complete-lesson-modal__button complete-lesson-modal__button--secondary"
                onClick={handleBackToRoadmap}
              >
                Back to Roadmap
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteLessonModal;

