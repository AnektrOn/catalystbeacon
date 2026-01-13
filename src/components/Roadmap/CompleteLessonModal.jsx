import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTransition } from '../../contexts/PageTransitionContext';
import roadmapService from '../../services/roadmapService';
import skillsService from '../../services/skillsService';
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
  onComplete,
  fromRoadmap = false,
  returnUrl = null,
  isFreeUser = false
}) => {
  const navigate = useNavigate();
  const { startTransition, endTransition } = usePageTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [skillNames, setSkillNames] = useState([]);

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🎯 CompleteLessonModal: Completing lesson with params:', {
        userId,
        lessonId,
        courseId,
        chapterNumber,
        lessonNumber,
        masterschool,
        fromRoadmap,
        returnUrl
      });

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
        console.log('✅ CompleteLessonModal: Lesson completed successfully, showing rewards', result.rewards);
        setRewards(result.rewards);
        setCompleted(true);
        console.log('✅ CompleteLessonModal: Set completed to true, modal should show rewards screen');
        
        // Load skill names if skills_earned exists
        if (result.rewards?.skills_earned && Array.isArray(result.rewards.skills_earned) && result.rewards.skills_earned.length > 0) {
          try {
            const { data: skillsData } = await skillsService.getSkillsByIds(result.rewards.skills_earned);
            if (skillsData) {
              const names = skillsData.map(skill => skill.display_name || skill.name || skill.id);
              setSkillNames(names);
              console.log('✅ CompleteLessonModal: Loaded skill names:', names);
            }
          } catch (skillError) {
            console.warn('⚠️ CompleteLessonModal: Could not load skill names:', skillError);
            // Fallback to skill IDs if names can't be loaded
            setSkillNames(result.rewards.skills_earned);
          }
        }
        
        // Don't call onComplete here - wait for user to choose navigation
        // onComplete will be called when user clicks a navigation button
      } else {
        console.error('❌ CompleteLessonModal: Lesson completion failed', result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleBackToRoadmap = () => {
    console.log('🔄 CompleteLessonModal: handleBackToRoadmap called', { fromRoadmap, returnUrl });
    
    // Call onComplete before navigation if provided
    if (onComplete && completed) {
      onComplete({ rewards, success: true });
    }
    
    // Determine the target URL
    let targetUrl = '/roadmap/ignition';
    if (fromRoadmap && returnUrl) {
      try {
        // returnUrl might be encoded, decode it
        const decoded = returnUrl.includes('%') ? decodeURIComponent(returnUrl) : returnUrl;
        // Extract just the path (remove query params for navigation)
        const urlPath = decoded.split('?')[0];
        targetUrl = urlPath || '/roadmap/ignition';
        console.log('🔄 CompleteLessonModal: Using returnUrl:', { original: returnUrl, decoded, targetUrl });
      } catch (e) {
        console.warn('⚠️ CompleteLessonModal: Error decoding returnUrl, using default:', e);
        targetUrl = '/roadmap/ignition';
      }
    }
    
    // Close modal and navigate
    onClose();
    startTransition();
    navigate(targetUrl);
  };

  const handleContinueToNext = async () => {
    // Call onComplete before navigation if provided
    if (onComplete && completed) {
      onComplete({ rewards, success: true });
    }
    
    try {
      const nextLesson = await roadmapService.getNextLesson(userId, masterschool);
      
      onClose();
      startTransition();
      
      if (nextLesson) {
        navigate(`/courses/${nextLesson.course_id}/chapters/${nextLesson.chapter_number}/lessons/${nextLesson.lesson_number}`);
      } else {
        navigate(`/roadmap/ignition`);
      }
    } catch (err) {
      console.error('Error getting next lesson:', err);
      onClose();
      startTransition();
      navigate(`/roadmap/ignition`);
    }
  };

  if (!isOpen) return null;

  console.log('🎯 CompleteLessonModal: Rendering modal', { isOpen, completed, loading, hasRewards: !!rewards });

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
                      +{rewards.xp_earned || 0}
                    </span>
                  </div>
                </div>

                {rewards.skills_earned && Array.isArray(rewards.skills_earned) && rewards.skills_earned.length > 0 && (
                  <div className="complete-lesson-modal__reward">
                    <div className="complete-lesson-modal__reward-icon">💪</div>
                    <div className="complete-lesson-modal__reward-content">
                      <span className="complete-lesson-modal__reward-label">Skills</span>
                      <span className="complete-lesson-modal__reward-value">
                        {skillNames.length > 0 ? skillNames.join(', ') : rewards.skills_earned.join(', ')}
                      </span>
                    </div>
                  </div>
                )}

                {rewards.skill_points && rewards.skill_points > 0 && (
                  <div className="complete-lesson-modal__reward">
                    <div className="complete-lesson-modal__reward-icon">📈</div>
                    <div className="complete-lesson-modal__reward-content">
                      <span className="complete-lesson-modal__reward-label">Skill Points</span>
                      <span className="complete-lesson-modal__reward-value">
                        +{rewards.skill_points}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="complete-lesson-modal__unlock-message">
              <span className="complete-lesson-modal__unlock-icon">🔓</span>
              <span>Next lesson unlocked!</span>
            </div>

            <div className="complete-lesson-modal__actions">
              {/* Only show "Continue to Next Lesson" for paid users (students) */}
              {!isFreeUser && (
                <button
                  className="complete-lesson-modal__button complete-lesson-modal__button--primary"
                  onClick={handleContinueToNext}
                >
                  Continue to Next Lesson
                </button>
              )}
              <button
                className={`complete-lesson-modal__button ${isFreeUser ? 'complete-lesson-modal__button--primary' : 'complete-lesson-modal__button--secondary'}`}
                onClick={handleBackToRoadmap}
              >
                {fromRoadmap ? 'Return to Roadmap' : 'Back to Roadmap'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteLessonModal;

