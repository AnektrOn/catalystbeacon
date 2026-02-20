import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
      const canonicalLessonId = `${courseId}-${chapterNumber}-${lessonNumber}`;
      const result = await roadmapService.completeLesson(
        userId,
        canonicalLessonId,
        courseId,
        chapterNumber,
        lessonNumber,
        masterschool,
        lessonTitle
      );

      if (result.success) {
        setRewards(result.rewards);
        setCompleted(true);
        
        // Load skill names if skills_earned exists
        if (result.rewards?.skills_earned && Array.isArray(result.rewards.skills_earned) && result.rewards.skills_earned.length > 0) {
          try {
            const { data: skillsData } = await skillsService.getSkillsByIds(result.rewards.skills_earned);
            if (skillsData) {
              const names = skillsData.map(skill => skill.display_name || skill.name || skill.id);
              setSkillNames(names);
            }
          } catch (skillError) {
            // Fallback to skill IDs if names can't be loaded
            setSkillNames(result.rewards.skills_earned);
          }
        }
        
        // Don't call onComplete here - wait for user to choose navigation
        // onComplete will be called when user clicks a navigation button
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleBackToRoadmap = () => {
    // Call onComplete before navigation if provided (updates local state + refreshes profile XP)
    if (onComplete && completed) {
      try {
        onComplete({ rewards, success: true });
      } catch (e) {
        console.error('[CompleteLessonModal] onComplete error:', e);
      }
    }

    let targetUrl = '/roadmap/ignition';
    if (fromRoadmap && returnUrl) {
      try {
        const decoded = returnUrl.includes('%') ? decodeURIComponent(returnUrl) : returnUrl;
        const urlPath = decoded.split('?')[0];
        targetUrl = urlPath || '/roadmap/ignition';
      } catch (e) {
        targetUrl = '/roadmap/ignition';
      }
    }

    // Add completion params so roadmap shows celebration and can unlock the exact next node (from backend)
    if (completed && courseId != null && chapterNumber != null && lessonNumber != null) {
      const params = new URLSearchParams();
      params.set('completed', 'true');
      params.set('lessonId', `${courseId}-${chapterNumber}-${lessonNumber}`);
      if (rewards?.xp_earned != null) params.set('xp', String(rewards.xp_earned));
      if (rewards?.next_lesson_id) params.set('nextLessonId', rewards.next_lesson_id);
      targetUrl = targetUrl.includes('?') ? `${targetUrl}&${params}` : `${targetUrl}?${params}`;
    }

    onClose();
    startTransition();
    // Pass completion via state so roadmap reads it reliably (avoids URL/effect races)
    const state = completed && courseId != null && chapterNumber != null && lessonNumber != null
      ? {
          fromCompletion: true,
          lessonId: `${courseId}-${chapterNumber}-${lessonNumber}`,
          nextLessonId: rewards?.next_lesson_id ?? null,
          xp: rewards?.xp_earned ?? 50
        }
      : undefined;
    const pathOnly = targetUrl.split('?')[0];
    if (process.env.NODE_ENV === 'development') {
      console.log('[CompleteLessonModal] Navigating to roadmap:', pathOnly, state);
    }
    navigate(pathOnly, { replace: true, state });
  };

  const handleContinueToNext = async () => {
    // Call onComplete before navigation if provided
    if (onComplete && completed) {
      try {
        onComplete({ rewards, success: true });
      } catch (e) {
        console.error('[CompleteLessonModal] onComplete error:', e);
      }
    }
    
    try {
      const nextLesson = await roadmapService.getNextLesson(userId, masterschool);
      
      onClose();
      startTransition();
      
      if (nextLesson) {
        const nextUrl = `/courses/${nextLesson.course_id}/chapters/${nextLesson.chapter_number}/lessons/${nextLesson.lesson_number}`;
        if (process.env.NODE_ENV === 'development') console.log('[CompleteLessonModal] Navigating to next lesson:', nextUrl);
        navigate(nextUrl, { replace: true });
      } else {
        if (process.env.NODE_ENV === 'development') console.log('[CompleteLessonModal] No next lesson, navigating to roadmap');
        navigate(`/roadmap/ignition`, { replace: true });
      }
    } catch (err) {
      onClose();
      startTransition();
      if (process.env.NODE_ENV === 'development') console.log('[CompleteLessonModal] Error, fallback to roadmap');
      navigate(`/roadmap/ignition`, { replace: true });
    }
  };

  if (!isOpen) return null;


  const handleOverlayClick = () => {
    if (completed) {
      // When completed, overlay click = same as "Back to Roadmap" (ensure redirect)
      handleBackToRoadmap();
    } else {
      onClose();
    }
  };

  return createPortal(
    <div className="complete-lesson-modal__overlay" onClick={handleOverlayClick}>
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
    </div>,
    document.body
  );
};

export default CompleteLessonModal;

