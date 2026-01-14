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
   * Find the scroll container - works for both desktop and mobile
   */
  const findScrollContainer = useCallback(() => {
    // Try multiple selectors to find the scroll container
    // 1. Desktop: .glass-main-panel
    let scrollContainer = document.querySelector('.glass-main-panel');
    
    // 2. Mobile: AppShellMobile main > div (the overflow-auto container)
    if (!scrollContainer) {
      const main = document.querySelector('main');
      if (main) {
        // Find the first child div with overflow-auto or overflow-y-auto
        // Check direct children first (most common case)
        const directChild = Array.from(main.children).find(child => {
          const style = getComputedStyle(child);
          return style.overflowY === 'auto' || style.overflowY === 'scroll' ||
                 child.classList.contains('overflow-auto') || 
                 child.classList.contains('overflow-y-auto');
        });
        
        if (directChild) {
          scrollContainer = directChild;
        } else {
          // Fallback: search deeper
          const mobileContainer = main.querySelector('div[class*="overflow"]');
          if (mobileContainer) {
            const style = getComputedStyle(mobileContainer);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll' ||
                mobileContainer.classList.contains('overflow-auto') || 
                mobileContainer.classList.contains('overflow-y-auto')) {
              scrollContainer = mobileContainer;
            }
          }
        }
      }
    }
    
    // 3. Try to find any scrollable container in the lesson content area
    if (!scrollContainer) {
      const lessonContent = document.querySelector('[class*="overflow-y-auto"]');
      if (lessonContent) {
        const style = getComputedStyle(lessonContent);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          scrollContainer = lessonContent;
        }
      }
    }
    
    // 4. Verify the container is actually scrollable
    if (scrollContainer && scrollContainer !== 'window') {
      const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight;
      if (!isScrollable) {
        // Container found but not scrollable, try window
        scrollContainer = null;
      }
    }
    
    // 5. Fallback: use window/document for mobile if no container found
    // On mobile, sometimes the entire page scrolls
    if (!scrollContainer) {
      // Check if window/document is scrollable
      const body = document.body;
      const html = document.documentElement;
      if (body.scrollHeight > body.clientHeight || html.scrollHeight > window.innerHeight) {
        // Return a special marker to indicate window scrolling
        return 'window';
      }
    }
    
    return scrollContainer;
  }, []);

  /**
   * Calculate scroll percentage - for AppShell main panel (desktop) or mobile containers
   */
  const calculateScrollPercentage = useCallback(() => {
    const scrollContainer = findScrollContainer();
    
    if (!scrollContainer) {
      console.warn('Scroll container not found');
      return 0;
    }
    
    // Handle window scrolling (mobile fallback)
    if (scrollContainer === 'window') {
      const windowHeight = window.innerHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollableHeight = documentHeight - windowHeight;
      
      if (scrollableHeight <= 10) {
        return 0;
      }
      
      const percentage = Math.min(100, Math.max(0, Math.round((scrollTop / scrollableHeight) * 100)));
      return percentage;
    }
    
    // Handle element scrolling
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
  }, [findScrollContainer]);

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

  // Add scroll listener - works for both desktop and mobile
  useEffect(() => {
    if (!enabled) {
      console.log('Scroll listener not added - tracking disabled');
      return;
    }

    let scrollContainer = null;
    let cleanupFunctions = [];
    let isListenerSetup = false;

    const setupListenerForContainer = (container) => {
      // Don't setup duplicate listeners
      if (isListenerSetup) {
        console.log('⚠️ Listener already setup, skipping...');
        return;
      }

      if (container === 'window') {
        // Handle window scrolling (mobile fallback)
        console.log('📜 Adding scroll listener to window (mobile fallback)...');
        window.addEventListener('scroll', handleScroll, { passive: true });
        // Also listen to touchmove for better mobile detection
        window.addEventListener('touchmove', handleScroll, { passive: true });
        cleanupFunctions.push(() => {
          window.removeEventListener('scroll', handleScroll);
          window.removeEventListener('touchmove', handleScroll);
        });
      } else {
        // Handle element scrolling
        console.log('📜 Adding scroll listener to container:', container.className || container.tagName || 'unnamed');
        container.addEventListener('scroll', handleScroll, { passive: true });
        // Also listen to touchmove for better mobile detection
        container.addEventListener('touchmove', handleScroll, { passive: true });
        cleanupFunctions.push(() => {
          container.removeEventListener('scroll', handleScroll);
          container.removeEventListener('touchmove', handleScroll);
        });
      }
      isListenerSetup = true;
      console.log('✅ Scroll listener added');
    };

    const setupScrollListener = () => {
      scrollContainer = findScrollContainer();
      
      if (!scrollContainer) {
        console.warn('⚠️ Scroll container not found, retrying in 1s...');
        const timeout = setTimeout(() => {
          const retryContainer = findScrollContainer();
          if (retryContainer) {
            console.log('✅ Found scroll container on retry');
            setupListenerForContainer(retryContainer);
          } else {
            console.error('❌ Scroll container still not found');
          }
        }, 1000);
        
        cleanupFunctions.push(() => clearTimeout(timeout));
        return;
      }

      setupListenerForContainer(scrollContainer);
    };

    // Initial setup
    setupScrollListener();

    // Retry setup if container not found initially (for dynamic content)
    const retryTimeout = setTimeout(() => {
      if (!isListenerSetup) {
        const newContainer = findScrollContainer();
        if (newContainer) {
          console.log('🔄 Retrying scroll container setup...');
          setupListenerForContainer(newContainer);
        }
      }
    }, 2000);

    cleanupFunctions.push(() => clearTimeout(retryTimeout));

    return () => {
      console.log('Removing scroll listener');
      cleanupFunctions.forEach(cleanup => cleanup());
      isListenerSetup = false;
    };
  }, [enabled, handleScroll, findScrollContainer]);

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

