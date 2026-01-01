import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RoadmapNotificationBanner.css';

/**
 * RoadmapNotificationBanner - Shows notifications about roadmap changes
 * Displays when new lessons are added or roadmap is updated
 */
const RoadmapNotificationBanner = ({ notification, onDismiss }) => {
  const navigate = useNavigate();

  const handleGoToNewLessons = () => {
    // Navigate to the first new lesson if available
    if (notification.lessons_added && notification.lessons_added.length > 0) {
      const firstLesson = notification.lessons_added[0];
      navigate(`/courses/${firstLesson.course_id}/chapter/${firstLesson.chapter_number}/lesson/${firstLesson.lesson_number}`);
    }
    onDismiss();
  };

  const handleContinue = () => {
    onDismiss();
  };

  const getNotificationIcon = () => {
    switch (notification.notification_type) {
      case 'lessons_added':
        return '🎉';
      case 'roadmap_update':
        return '🔄';
      case 'difficulty_changed':
        return '⚡';
      default:
        return 'ℹ️';
    }
  };

  const lessonsCount = notification.lessons_added?.length || 0;

  return (
    <div className="roadmap-notification-banner">
      <div className="roadmap-notification-banner__icon">
        {getNotificationIcon()}
      </div>

      <div className="roadmap-notification-banner__content">
        <h3 className="roadmap-notification-banner__title">
          {notification.message}
        </h3>
        
        {lessonsCount > 0 && (
          <p className="roadmap-notification-banner__details">
            {lessonsCount} new {lessonsCount === 1 ? 'lesson' : 'lessons'} available at lower difficulty levels
          </p>
        )}
      </div>

      <div className="roadmap-notification-banner__actions">
        {lessonsCount > 0 && (
          <button
            className="roadmap-notification-banner__button roadmap-notification-banner__button--primary"
            onClick={handleGoToNewLessons}
          >
            Go to New Lessons
          </button>
        )}
        
        <button
          className="roadmap-notification-banner__button roadmap-notification-banner__button--secondary"
          onClick={handleContinue}
        >
          Continue
        </button>

        <button
          className="roadmap-notification-banner__close"
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default RoadmapNotificationBanner;

