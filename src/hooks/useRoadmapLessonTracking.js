import { useState, useEffect, useRef, useCallback } from 'react';
import roadmapService from '../services/roadmapService';

/**
 * Custom hook for tracking lesson progress (time and scroll)
 * Automatically updates progress to Supabase every 10 seconds
 * 
 * @param {string} userId - User UUID
 * @param {number} courseId - Course ID
 * @param {number} chapterNumber - Chapter number
 * @param {number} lessonNumber - Lesson number
 * @param {boolean} enabled - Whether tracking is enabled (default: true)
 * @returns {Object} { timeSpent, scrollPercentage, canComplete, isTracking, error }
 */
export const useRoadmapLessonTracking = (
  userId,
  courseId,
  chapterNumber,
  lessonNumber,
  enabled = true
) => {
  const [timeSpent, setTimeSpent] = useState(0);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [canComplete, setCanComplete] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);

  // Refs for tracking
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const isMountedRef = useRef(true);

  /**
   * Calculate scroll percentage - for AppShell main panel
   */
  const calculateScrollPercentage = useCallback(() => {
    // Find the scrolling container (AppShell main panel)
    const scrollContainer = document.querySelector('.glass-main-panel');
    
    if (!scrollContainer) {
      console.warn('Scroll container (.glass-main-panel) not found');
      return 0;
    }
    
    const containerHeight = scrollContainer.clientHeight;
    const contentHeight = scrollContainer.scrollHeight;
    const scrollTop = scrollContainer.scrollTop;
    
    // Calculate scrollable height
    const scrollableHeight = contentHeight - containerHeight;
    
    // If content fits in container, no scroll needed - return 0 until they try to scroll
    if (scrollableHeight <= 10) {
      return 0;
    }
    
    // Normal scroll calculation
    const percentage = Math.min(100, Math.max(0, Math.round((scrollTop / scrollableHeight) * 100)));
    
    return percentage;
  }, []);

  /**
   * Handle scroll events
   */
  const handleScroll = useCallback(() => {
    if (!enabled) return;
    
    const percentage = calculateScrollPercentage();
    setScrollPercentage(prev => {
      // Only log significant changes (10% increments)
      if (percentage >= 100 && prev < 100) {
        console.log('🎉 Scrolled to bottom! 100%');
      } else if (Math.floor(percentage / 10) !== Math.floor(prev / 10)) {
        console.log(`📜 Scroll: ${percentage}%`);
      }
      return percentage;
    });
  }, [enabled, calculateScrollPercentage]);

  /**
   * Update progress to Supabase
   */
  const updateProgress = useCallback(async (currentTime, currentScroll) => {
    if (!enabled || !userId || !courseId) return;

    try {
      const result = await roadmapService.updateLessonTracking(
        userId,
        courseId,
        chapterNumber,
        lessonNumber,
        currentTime,
        currentScroll
      );

      // Update canComplete based on server response
      if (result && result.canComplete !== undefined) {
        setCanComplete(result.canComplete);
      }

      lastUpdateRef.current = Date.now();
    } catch (err) {
      console.error('Error updating lesson tracking:', err);
      setError(err.message);
    }
  }, [enabled, userId, courseId, chapterNumber, lessonNumber]);


  /**
   * Force update progress (useful for manual triggers)
   */
  const forceUpdate = useCallback(async () => {
    if (!startTimeRef.current) return;

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const currentScroll = calculateScrollPercentage();
    await updateProgress(elapsed, currentScroll);
  }, [calculateScrollPercentage, updateProgress]);

  // Initialize tracking on mount
  useEffect(() => {
    console.log('🎯 LessonTracker mounted:', { enabled, userId, courseId, chapterNumber, lessonNumber });
    
    if (!enabled || !userId || !courseId) {
      console.warn('Tracking disabled or missing data:', { enabled, userId, courseId });
      return;
    }

    isMountedRef.current = true;

    // Load existing progress and start tracking
    const init = async () => {
      try {
        const progress = await roadmapService.getLessonProgress(
          userId,
          courseId,
          chapterNumber,
          lessonNumber
        );

        if (progress) {
          console.log('📊 Loaded existing progress:', progress);
          // Don't set time from previous session - start fresh
          // setTimeSpent(progress.time_spent_seconds || 0);
          setScrollPercentage(progress.scroll_percentage || 0);
          setCanComplete(progress.can_complete || false);
        } else {
          console.log('No existing progress, starting fresh');
        }
      } catch (err) {
        console.error('Error loading lesson progress:', err);
      }

      // Start tracking AFTER loading progress
      if (!startTimeRef.current) {
        console.log('⏱️ Initializing timer...');
        startTimeRef.current = Date.now();
        setIsTracking(true);

        // Clear any existing interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        // Start interval
        intervalRef.current = setInterval(() => {
          if (!isMountedRef.current) return;

          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setTimeSpent(elapsed);

          // Log every 10 seconds
          if (elapsed % 10 === 0 && elapsed > 0) {
            const currentScroll = calculateScrollPercentage();
            console.log(`⏱️ ${elapsed}s | 📜 ${currentScroll}%`);
            updateProgress(elapsed, currentScroll);
          }
        }, 1000);

        console.log('✅ Timer started! Interval:', intervalRef.current);
      }
    };

    init();

    return () => {
      console.log('🛑 LessonTracker unmounting');
      isMountedRef.current = false;
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Final update
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const currentScroll = calculateScrollPercentage();
        updateProgress(elapsed, currentScroll);
      }
    };
  }, [enabled, userId, courseId, chapterNumber, lessonNumber, calculateScrollPercentage, updateProgress]);

  // Add scroll listener to AppShell main panel
  useEffect(() => {
    if (!enabled) {
      console.log('Scroll listener not added - tracking disabled');
      return;
    }

    // Find the scrolling container
    const scrollContainer = document.querySelector('.glass-main-panel');
    
    if (!scrollContainer) {
      console.warn('⚠️ Scroll container (.glass-main-panel) not found, retrying in 1s...');
      const timeout = setTimeout(() => {
        const retryContainer = document.querySelector('.glass-main-panel');
        if (retryContainer) {
          console.log('✅ Found scroll container on retry');
          retryContainer.addEventListener('scroll', handleScroll, { passive: true });
        } else {
          console.error('❌ Scroll container still not found');
        }
      }, 1000);
      
      return () => clearTimeout(timeout);
    }

    console.log('📜 Adding scroll listener to .glass-main-panel...');
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    console.log('✅ Scroll listener added');

    return () => {
      console.log('Removing scroll listener from .glass-main-panel');
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, handleScroll]);

  // Check if requirements are met (2 minutes = 120 seconds)
  useEffect(() => {
    const minimumTimeMet = timeSpent >= 120; // 2 minutes
    const scrollComplete = scrollPercentage >= 100;
    const shouldBeComplete = minimumTimeMet && scrollComplete;

    if (shouldBeComplete !== canComplete) {
      setCanComplete(shouldBeComplete);
      
      // Update to server when status changes
      if (shouldBeComplete) {
        console.log('🎉 All requirements met! Can complete lesson now.');
        forceUpdate();
      }
    }
  }, [timeSpent, scrollPercentage, canComplete, forceUpdate]);

  return {
    timeSpent,
    scrollPercentage,
    canComplete,
    isTracking,
    error,
    forceUpdate,
    minimumTimeMet: timeSpent >= 120, // 2 minutes
    scrollComplete: scrollPercentage >= 100,
    timeRemaining: Math.max(0, 120 - timeSpent),
    progressPercentage: Math.min(100, Math.round(
      ((timeSpent / 120) * 50) + ((scrollPercentage / 100) * 50)
    ))
  };
};

export default useRoadmapLessonTracking;

