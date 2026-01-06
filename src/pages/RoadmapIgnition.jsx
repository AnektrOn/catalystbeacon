import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import roadmapService from '../services/roadmapService';
import RoadmapNode from '../components/Roadmap/RoadmapNode';
import RoadmapPath from '../components/Roadmap/RoadmapPath';
import RoadmapNotificationBanner from '../components/Roadmap/RoadmapNotificationBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorDisplay from '../components/common/ErrorDisplay';
import './RoadmapIgnition.css';

/**
 * RoadmapIgnition - Main page for Ignition masterschool roadmap
 * Displays lessons in Duolingo-style vertical path
 */
const RoadmapIgnition = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { statLink } = useParams(); // URL param (keeping name for compatibility)

  const [lessons, setLessons] = useState([]);
  const [groupedLessons, setGroupedLessons] = useState({});
  const [currentMasterSkill, setCurrentMasterSkill] = useState(statLink || null);
  const [progress, setProgress] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlockedLessons, setUnlockedLessons] = useState(new Set());
  const [completedSet, setCompletedSet] = useState(new Set());

  const masterschool = 'Ignition';

  // Debug overlay is noisy on mobile; only allow when explicitly enabled.
  const debugEnabled = useMemo(() => {
    if (process.env.NODE_ENV !== 'development') return false;
    const params = new URLSearchParams(location.search);
    return params.get('debug') === 'true';
  }, [location.search]);

  // Load completed lessons
  useEffect(() => {
    const loadCompleted = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_lesson_progress')
        .select('course_id, chapter_number, lesson_number, is_completed')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      const completed = new Set(
        (data || []).map(c => `${c.course_id}-${c.chapter_number}-${c.lesson_number}`)
      );
      setCompletedSet(completed);
    };
    
    loadCompleted();
  }, [user]);

  // Calculate unlocked lessons when completedSet or lessons change
  useEffect(() => {
    if (lessons.length === 0) return;

    const unlocked = new Set();
    lessons.forEach((lesson, index) => {
      // First lesson always unlocked
      if (index === 0) {
        unlocked.add(lesson.lesson_id);
        return;
      }

      // Check if previous lesson is completed
      const prevLesson = lessons[index - 1];
      const prevKey = `${prevLesson.course_id}-${prevLesson.chapter_number}-${prevLesson.lesson_number}`;
      
      if (completedSet.has(prevKey)) {
        unlocked.add(lesson.lesson_id);
      }
    });

    setUnlockedLessons(unlocked);
  }, [lessons, completedSet]);

  // Load roadmap data
  useEffect(() => {
    const loadRoadmap = async () => {
      if (!user) {
        console.warn('No user found, skipping roadmap load');
        return;
      }

      console.log('🚀 Loading roadmap for:', masterschool);

      try {
        setLoading(true);
        setError(null);

        // Load lessons grouped by master skill (no duplicates)
        console.log('🔍 Fetching lessons by master skill...');
        const grouped = await roadmapService.getRoadmapByStatLink(masterschool);
        console.log('📊 Grouped by master skills:', grouped);
        console.log('📊 Master skill keys:', Object.keys(grouped));
        
        if (Object.keys(grouped).length === 0) {
          console.error('❌ No grouped lessons found!');
          setError('No lessons found. Make sure courses are assigned to Ignition masterschool.');
          setLoading(false);
          return;
        }
        
        setGroupedLessons(grouped);

        // Get first master skill if none selected
        const masterSkills = Object.keys(grouped);
        const selectedSkill = currentMasterSkill || masterSkills[0] || 'General';
        setCurrentMasterSkill(selectedSkill);

        // Set lessons for current master skill
        const currentLessons = grouped[selectedSkill]?.lessons || [];
        console.log(`📚 Setting ${currentLessons.length} lessons for master skill: ${selectedSkill}`);
        setLessons(currentLessons);

        // Load user progress
        const userProgress = await roadmapService.getUserRoadmapProgress(user.id, masterschool);
        setProgress(userProgress);

        // Load notifications
        const userNotifications = await roadmapService.getRoadmapNotifications(user.id, masterschool);
        setNotifications(userNotifications);

        // Determine which lessons are unlocked based on completedSet from other useEffect
        // We'll do this after completedSet is loaded

      } catch (err) {
        console.error('❌ Error loading roadmap:', err);
        console.error('Error details:', err.message);
        setError(err.message);
      } finally {
        console.log('Loading complete');
        setLoading(false);
      }
    };

    loadRoadmap();
  }, [user, masterschool, currentMasterSkill]);

  // Handle master skill change
  const handleMasterSkillChange = (masterSkill) => {
    setCurrentMasterSkill(masterSkill);
    navigate(`/roadmap/ignition/${masterSkill}`);
  };

  // Handle notification dismiss
  const handleNotificationDismiss = async (notificationId) => {
    try {
      await roadmapService.markNotificationAsRead(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error dismissing notification:', err);
    }
  };

  // Get lesson state
  const getLessonState = (lesson, completedSet) => {
    const lessonKey = `${lesson.course_id}-${lesson.chapter_number}-${lesson.lesson_number}`;
    const isCompleted = completedSet.has(lessonKey);
    const isLocked = !unlockedLessons.has(lesson.lesson_id);
    const isCurrent = progress?.current_lesson_id === lesson.lesson_id;
    
    // Check if this is the next lesson to complete
    const nextLesson = lessons.find(l => {
      const key = `${l.course_id}-${l.chapter_number}-${l.lesson_number}`;
      return !completedSet.has(key) && unlockedLessons.has(l.lesson_id);
    });
    const isNext = nextLesson?.lesson_id === lesson.lesson_id;

    return {
      isCompleted,
      isLocked,
      isInProgress: isCurrent,
      isNext
    };
  };

  // Compute derived values
  const masterSkills = Object.keys(groupedLessons);
  const currentGroup = groupedLessons[currentMasterSkill] || {};
  const totalLessons = currentGroup.total || 0;
  const completedCount = lessons.filter(l => {
    const key = `${l.course_id}-${l.chapter_number}-${l.lesson_number}`;
    return completedSet.has(key);
  }).length;

  if (loading) {
    return (
      <div className="roadmap-ignition__loading">
        <LoadingSpinner />
        <p>Loading your Ignition roadmap...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="roadmap-ignition__error">
        <ErrorDisplay message={error} />
      </div>
    );
  }

  return (
    <div className="roadmap-ignition">
      {/* Debug Info (remove later) */}
      {debugEnabled && (
        <div style={{ 
          position: 'fixed', 
          top: '80px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 9999,
          maxWidth: '300px'
        }}>
          <div><strong>Debug Info:</strong></div>
          <div>Total Lessons: {lessons.length}</div>
          <div>Unlocked: {unlockedLessons.size}</div>
          <div>Completed: {completedSet.size}</div>
          <div>          Master Skills: {Object.keys(groupedLessons).join(', ')}</div>
          <div>Current Skill: {currentMasterSkill}</div>
        </div>
      )}

      {/* Header */}
      <div className="roadmap-ignition__header">
        <h1 className="roadmap-ignition__title">Ignition Roadmap</h1>
        <p className="roadmap-ignition__subtitle">
          Your journey through the Ignition masterschool
        </p>
        
        <div className="roadmap-ignition__progress-summary">
          <span className="roadmap-ignition__progress-text">
            {completedCount} of {totalLessons} lessons completed
          </span>
          <div className="roadmap-ignition__progress-bar">
            <div 
              className="roadmap-ignition__progress-fill"
              style={{ width: `${totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="roadmap-ignition__notifications">
          {notifications.map(notification => (
            <RoadmapNotificationBanner
              key={notification.id}
              notification={notification}
              onDismiss={() => handleNotificationDismiss(notification.id)}
            />
          ))}
        </div>
      )}

      {/* Master Skill Tabs */}
      {masterSkills.length > 1 && (
        <div className="roadmap-ignition__tabs">
          {masterSkills.map(masterSkill => (
            <button
              key={masterSkill}
              className={`roadmap-ignition__tab ${currentMasterSkill === masterSkill ? 'roadmap-ignition__tab--active' : ''}`}
              onClick={() => handleMasterSkillChange(masterSkill)}
            >
              {masterSkill}
              <span className="roadmap-ignition__tab-count">
                {groupedLessons[masterSkill]?.total || 0}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Roadmap Content - Winding Path with Nodes */}
      <div className="roadmap-ignition__content">
        {lessons.length === 0 ? (
          <div className="roadmap-ignition__empty">
            <h3>⚠️ No Lessons Found</h3>
            <p>No lessons are available for the Ignition masterschool yet.</p>
            <div style={{ marginTop: '2rem', textAlign: 'left', padding: '1rem', background: 'rgba(180, 131, 61, 0.1)', borderRadius: '8px' }}>
              <p><strong>To fix this:</strong></p>
              <ol style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                <li>Go to Supabase Dashboard → SQL Editor</li>
                <li>Run the file: <code>QUICK_FIX_ROADMAP.sql</code></li>
                <li>This will assign a course to Ignition</li>
                <li>Refresh this page</li>
              </ol>
              <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
                Or follow the full setup in: <code>ROADMAP_SETUP_INSTRUCTIONS.md</code>
              </p>
            </div>
          </div>
        ) : (
          <div className="roadmap-ignition__path-wrapper">
            {/* Background winding path */}
            <RoadmapPath
              lessons={lessons}
              completedLessonIds={Array.from(completedSet)}
            />
            
            {/* Lesson nodes positioned along the path */}
            {lessons.map((lesson, index) => {
              const state = getLessonState(lesson, completedSet);
              const isMilestone = (index + 1) % 5 === 0; // Every 5th lesson is a milestone
              const stars = state.isCompleted ? 3 : 0;
              
              // Calculate position along winding path
              const verticalSpacing = 150;
              const horizontalAmplitude = 120;
              const cycleLength = 4;
              const progress = (index / cycleLength) * Math.PI * 2;
              const x = Math.sin(progress) * horizontalAmplitude;
              const y = index * verticalSpacing;
              
              return (
                <div
                  key={lesson.lesson_id}
                  className="roadmap-ignition__node-wrapper"
                  style={{
                    position: 'absolute',
                    left: `calc(50% + ${x}px)`,
                    top: `${y}px`,
                    transform: 'translate(-50%, 0)',
                  }}
                >
                  <RoadmapNode
                    lesson={lesson}
                    {...state}
                    isMilestone={isMilestone}
                    stars={stars}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="roadmap-ignition__footer">
        <p className="roadmap-ignition__info">
          Complete lessons in order to unlock the next one. Each lesson requires 3 minutes of engagement and scrolling to the end.
        </p>
      </div>
    </div>
  );
};

export default RoadmapIgnition;

