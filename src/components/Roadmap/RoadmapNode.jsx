import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RoadmapNode.css';

/**
 * RoadmapNode - Duolingo-style circular lesson bubble
 * States: locked, unlocked, in-progress, completed
 */
const RoadmapNode = ({
  lesson,
  isLocked = false,
  isCompleted = false,
  isInProgress = false,
  isNext = false,
  isMilestone = false,
  stars = 0,
  onClick
}) => {
  const navigate = useNavigate();

  const getNodeState = () => {
    if (isCompleted) return 'completed';
    if (isInProgress) return 'in-progress';
    if (isLocked) return 'locked';
    if (isNext) return 'next';
    return 'unlocked';
  };

  const getNodeIcon = () => {
    if (isMilestone) return '🏆';
    if (isCompleted) return '⭐';
    if (isLocked) return '🔒';
    return '📖';
  };

  const handleClick = () => {
    if (isLocked || isMilestone) return;

    if (onClick) {
      onClick(lesson);
    } else {
      // Navigate to lesson (note: uses 'chapters' and 'lessons' plural)
      const courseId = lesson.course_id;
      const chapterNum = lesson.chapter_number;
      const lessonNum = lesson.lesson_number;
      
      console.log('Navigating to:', { courseId, chapterNum, lessonNum });
      
      if (!courseId || !chapterNum || !lessonNum) {
        console.error('Missing required navigation data:', lesson);
        return;
      }
      
      navigate(`/courses/${courseId}/chapters/${chapterNum}/lessons/${lessonNum}`);
    }
  };

  const state = getNodeState();
  const icon = getNodeIcon();

  return (
    <div className="roadmap-node-container">
      {/* Circular Bubble */}
      <div 
        className={`roadmap-bubble roadmap-bubble--${state} ${isMilestone ? 'roadmap-bubble--milestone' : ''}`}
        onClick={handleClick}
        role="button"
        tabIndex={isLocked ? -1 : 0}
        aria-label={`${lesson.lesson_title} - ${state}`}
        aria-disabled={isLocked}
      >
        {/* Icon in center */}
        <div className="roadmap-bubble__icon">
          {icon}
        </div>

        {/* Stars for completed lessons */}
        {isCompleted && stars > 0 && (
          <div className="roadmap-bubble__stars">
            {[...Array(3)].map((_, i) => (
              <span 
                key={i} 
                className={i < stars ? 'star-filled' : 'star-empty'}
              >
                {i < stars ? '⭐' : '☆'}
              </span>
            ))}
          </div>
        )}

        {/* Pulse effect for next lesson */}
        {isNext && (
          <div className="roadmap-bubble__pulse"></div>
        )}
      </div>

      {/* Lesson info on hover/tooltip */}
      <div className="roadmap-node-tooltip">
        <h4>{lesson.lesson_title}</h4>
        <p className="tooltip-course">{lesson.course_title}</p>
        <div className="tooltip-meta">
          <span className="tooltip-difficulty">Level {lesson.difficulty_numeric}</span>
          <span className="tooltip-xp">{lesson.lesson_xp_reward} XP</span>
        </div>
      </div>
    </div>
  );
};

export default RoadmapNode;

