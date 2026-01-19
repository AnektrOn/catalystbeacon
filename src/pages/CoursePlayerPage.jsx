import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePageTransition } from '../contexts/PageTransitionContext';
import useSubscription from '../hooks/useSubscription';
import courseService from '../services/courseService';
import roadmapService from '../services/roadmapService';
import { supabase } from '../lib/supabaseClient';
import QuizComponent from '../components/QuizComponent';
import LessonTracker from '../components/Roadmap/LessonTracker';
import CompleteLessonModal from '../components/Roadmap/CompleteLessonModal';
import { useRoadmapLessonTracking } from '../hooks/useRoadmapLessonTracking';
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Menu,
  BrainCircuit,
  X,
  List
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CoursePlayerPage = () => {
  const { courseId, chapterNumber, lessonNumber } = useParams();
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuth();
  const { startTransition, endTransition } = usePageTransition();
  const { isFreeUser } = useSubscription();
  const [course, setCourse] = useState(null);
  const [courseStructure, setCourseStructure] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  // Removed unused currentChapter state
  const [lessonContent, setLessonContent] = useState(null);
  const [lessonDescription, setLessonDescription] = useState(null);
  const [userLessonProgress, setUserLessonProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // Start closed on mobile
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(new Set()); // Store completed lessons as Set for O(1) lookup
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const chapterNum = parseInt(chapterNumber);
  const lessonNum = parseInt(lessonNumber);
  
  // Check if accessed from roadmap (free access mode)
  const [fromRoadmap, setFromRoadmap] = useState(false);
  const [returnUrl, setReturnUrl] = useState(null);
  const [allowedLesson, setAllowedLesson] = useState(null); // Store the allowed lesson ID
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromRoadmapParam = params.get('fromRoadmap');
    const returnParam = params.get('return');
    
    // If fromRoadmap=true OR if return param contains roadmap path, consider it as from roadmap
    const isFromRoadmap = fromRoadmapParam === 'true' || (returnParam && (returnParam.includes('roadmap') || returnParam.includes('/roadmap/')));
    
    if (isFromRoadmap) {
      setFromRoadmap(true);
      // Store the allowed lesson (current lesson when accessed from roadmap)
      setAllowedLesson(`${courseId}-${chapterNum}-${lessonNum}`);
      if (returnParam) {
        try {
          const decoded = returnParam.includes('%') ? decodeURIComponent(returnParam) : returnParam;
          setReturnUrl(decoded);
        } catch (e) {
          setReturnUrl(returnParam);
        }
      } else {
        // Default return URL if not provided
        setReturnUrl('/roadmap/ignition');
      }
    } else {
      // Reset if not from roadmap
      setFromRoadmap(false);
      setReturnUrl(null);
    }
  }, [courseId, chapterNum, lessonNum]);

  // Derived state for restricted mode
  const isRestrictedMode = fromRoadmap && isFreeUser;
  
  // Validate lesson access when in roadmap mode (only for free users)
  useEffect(() => {
    // Only apply restrictions for free users - paid users have full access
    if (isRestrictedMode && allowedLesson) {
      const currentLessonKey = `${courseId}-${chapterNum}-${lessonNum}`;
      if (currentLessonKey !== allowedLesson) {
        // User tried to access a different lesson - redirect back
        toast.error('Access restricted. You can only access the lesson you selected from the roadmap.');
        if (returnUrl) {
          navigate(returnUrl);
        } else {
          navigate('/roadmap/ignition');
        }
      }
    }
  }, [courseId, chapterNum, lessonNum, fromRoadmap, allowedLesson, returnUrl, navigate, isFreeUser]);

  useEffect(() => {
    if (courseId && chapterNum && lessonNum) {
      loadLessonData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, chapterNum, lessonNum, user]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      setError(null);
      setQuizData(null);
      setShowQuiz(false);

      // Load full course structure
      const { data: fullCourse, error: structureError } = await courseService.getFullCourseStructure(courseId);
      if (structureError) throw structureError;

      setCourse(fullCourse);

      // Check if we need to build structure from course_content (for roadmap navigation)
      if (!fullCourse?.chapters || fullCourse.chapters.length === 0) {
        
        // Load ALL lessons for this course from course_content
        const { data: allLessons, error: allLessonsError } = await supabase
          .from('course_content')
          .select('*')
          .eq('course_id', parseInt(courseId))
          .order('chapter_number', { ascending: true })
          .order('lesson_number', { ascending: true });

        if (allLessonsError) {
          throw allLessonsError;
        }

        // Group lessons by chapter
        const chaptersMap = {};
        (allLessons || []).forEach(lessonData => {
          const chNum = lessonData.chapter_number;
          if (!chaptersMap[chNum]) {
            chaptersMap[chNum] = {
              chapter_number: chNum,
              chapter_title: lessonData.attached_to_chapter || `Chapter ${chNum}`,
              chapter_id: lessonData.chapter_id,
              lessons: []
            };
          }
          chaptersMap[chNum].lessons.push({
            lesson_id: lessonData.lesson_id,
            lesson_title: lessonData.lesson_title,
            lesson_number: lessonData.lesson_number,
            chapter_number: lessonData.chapter_number,
            chapter_id: lessonData.chapter_id
          });
        });

        // Convert to array and sort
        fullCourse.chapters = Object.values(chaptersMap).sort((a, b) => a.chapter_number - b.chapter_number);
      }

      setCourseStructure(fullCourse);

      // Find current chapter and lesson
      const chapter = fullCourse?.chapters?.find(ch => ch.chapter_number === chapterNum);
      const lesson = chapter?.lessons?.find(l => l.lesson_number === lessonNum);

      if (!chapter || !lesson) {
        throw new Error('Lesson not found');
      }

      setCurrentLesson(lesson);

      // Load lesson content (use course_id, not UUID)
      const actualCourseId = fullCourse?.course_id || parseInt(courseId);
      if (actualCourseId) {
        const { data: content, error: contentError } = await courseService.getLessonContent(
          actualCourseId,
          chapterNum,
          lessonNum
        );
        if (contentError && contentError.code !== 'PGRST116') {
        } else if (content) {
          setLessonContent(content);
        }

        // Load lesson description
        const { data: description } = await courseService.getLessonDescription(
          courseId,
          chapterNum,
          lessonNum
        );
        setLessonDescription(description);

        // Load user progress
        if (user) {
          const { data: progress } = await courseService.getUserLessonProgress(
            user.id,
            fullCourse.course_id,
            chapterNum,
            lessonNum
          );
          setUserLessonProgress(progress);

          // Load all completed lessons for this course to show completion status in sidebar
          
          const { data: allCompleted, error: completedError } = await supabase
            .from('user_lesson_progress')
            .select('chapter_number, lesson_number')
            .eq('user_id', user.id)
            .eq('course_id', parseInt(fullCourse.course_id))
            .eq('is_completed', true);

          if (!completedError && allCompleted) {
            // Create a Set of completed lesson keys for O(1) lookup
            const completedSet = new Set(
              allCompleted.map(c => `${c.chapter_number}_${c.lesson_number}`)
            );
            setCompletedLessons(completedSet);
          }
        }

        // Load quiz data from Supabase (if quiz table exists)
        // Note: Quiz system is planned for future implementation
        // When quiz table is created, implement quiz loading here
        try {
          // Future implementation:
          // const { data: quizData, error: quizError } = await supabase
          //   .from('lesson_quizzes')
          //   .select('*')
          //   .eq('lesson_id', lessonId)
          //   .single();
          // if (!quizError && quizData) {
          //   setQuizData(quizData.questions || []);
          // } else {
          //   setQuizData([]);
          // }
          setQuizData([]); // No quizzes until quiz system is implemented
        } catch (quizErr) {
          setQuizData([]);
        }
      }
    } catch (err) {
      setError('Failed to load lesson. Please try again.');
      toast.error('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async (xpBonus = 0) => {
    if (!user || !course?.course_id || !currentLesson) return;

    // If course has masterschool, open the modal instead of completing directly
    if (course.masterschool && currentLesson.lesson_id) {
      setShowCompleteModal(true);
      return;
    }

    // For non-roadmap courses, complete directly (legacy behavior)
    try {
      setIsCompleting(true);
      
      // For non-roadmap courses, use courseService
      const { data, error: completeError } = await courseService.completeLesson(
        user.id,
        course.course_id,
        chapterNum,
        lessonNum,
        50 + xpBonus
      );

      if (completeError) throw completeError;

      // Verify DB change
      const { data: progressCheck } = await supabase
        .from('user_lesson_progress')
        .select('is_completed')
        .eq('user_id', user.id)
        .eq('course_id', course.course_id)
        .eq('chapter_number', chapterNum)
        .eq('lesson_number', lessonNum)
        .single();

      if (!progressCheck?.is_completed) {
        throw new Error('Lesson completion not confirmed in database');
      }

      // Update local state only after DB confirmation
      setUserLessonProgress({ ...data.lessonProgress, is_completed: true });
      const lessonKey = `${chapterNum}_${lessonNum}`;
      setCompletedLessons(prev => new Set([...prev, lessonKey]));

      // Recalculate course progress
      await courseService.calculateCourseProgress(user.id, course.course_id);

      // Refresh profile to update XP
      if (user.id) {
        await fetchProfile(user.id);
      }

      toast.success(`Lesson completed! +${data.xpAwarded} XP earned`, {
        duration: 4000,
        style: {
          background: 'rgba(30, 41, 59, 0.95)',
          color: '#fff',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          padding: '16px 20px',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 9999,
        },
        iconTheme: {
          primary: '#10B981',
          secondary: '#fff',
        },
      });
    } catch (err) {
      toast.error(err.message || 'Failed to complete lesson. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleLessonCompleteFromModal = (result) => {
    // Update local state after lesson completion from modal
    if (course?.course_id && currentLesson) {
      setUserLessonProgress(prev => ({ ...prev, is_completed: true }));
      const lessonKeyLocal = `${chapterNum}_${lessonNum}`;
      setCompletedLessons(prev => new Set([...prev, lessonKeyLocal]));
      
      // Refresh profile to update XP
      if (user?.id) {
        fetchProfile(user.id);
      }
    }
    setShowCompleteModal(false);
  };

  const handleQuizComplete = ({ passed, xpEarned }) => {
    if (passed) {
      handleCompleteLesson(xpEarned);
    }
  };

  const getNextLesson = () => {
    if (!courseStructure?.chapters) return null;

    let foundCurrent = false;
    for (const chapter of courseStructure.chapters) {
      for (const lesson of chapter.lessons || []) {
        if (foundCurrent) {
          return { lesson, chapter };
        }
        if (lesson.chapter_number === chapterNum && lesson.lesson_number === lessonNum) {
          foundCurrent = true;
        }
      }
    }
    return null;
  };

  const getPreviousLesson = () => {
    if (!courseStructure?.chapters) return null;

    let previousLesson = null;
    for (const chapter of courseStructure.chapters) {
      for (const lesson of chapter.lessons || []) {
        if (lesson.chapter_number === chapterNum && lesson.lesson_number === lessonNum) {
          return previousLesson;
        }
        previousLesson = { lesson, chapter };
      }
    }
    return null;
  };

  const handleNavigateLesson = (targetChapterNum, targetLessonNum) => {
    // Block navigation if accessed from roadmap (only for free users)
    // Paid users can navigate freely
    if (isRestrictedMode) {
      toast.error('Access restricted. This lesson is only available through the roadmap.');
      return;
    }
    navigate(`/courses/${courseId}/chapters/${targetChapterNum}/lessons/${targetLessonNum}`);
  };

  const isCompleted = userLessonProgress?.is_completed || false;
  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  // Track lesson progress to enable "Mark as Complete" button
  const { canComplete: trackingCanComplete } = useRoadmapLessonTracking(
    user?.id,
    course?.course_id ? parseInt(course.course_id) : null,
    chapterNum,
    lessonNum,
    !!course?.masterschool && !!user // Only enable if course has masterschool and user is logged in
  );

  // Use global loader instead of local loading state
  useEffect(() => {
    if (loading) {
      startTransition();
    } else {
      endTransition();
    }
  }, [loading, startTransition, endTransition]);

  if (error || !currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-panel-floating p-8 text-center max-w-md mx-auto">
          <p className="text-red-400 mb-6 text-lg">{error || 'Lesson not found'}</p>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="px-6 py-3 text-white rounded-xl transition-all font-medium"
            style={{ backgroundColor: 'var(--color-primary)' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 80%, transparent)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-[calc(100vh-80px)] overflow-hidden transition-all duration-500 ${cinemaMode ? 'fixed inset-0 z-50 overflow-y-auto' : ''}`} style={cinemaMode ? { backgroundColor: 'var(--bg-secondary, #0f0f0f)', width: '100vw', height: '100vh' } : {}}>

      {/* Mobile Menu Overlay - Disabled in roadmap mode only for free users */}
      {showMobileMenu && !isRestrictedMode ? createPortal(
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
          style={{ width: '100vw', height: '100vh' }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" style={{ width: '100vw', height: '100vh' }} />
          <div 
            className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-slate-900/95 backdrop-blur-xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm truncate pr-2">{course?.course_title}</h3>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {courseStructure?.chapters?.map((chapter) => (
                <div key={chapter.id} className="space-y-1">
                  <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Chapter {chapter.chapter_number}
                  </div>
                  {chapter.lessons?.map((lesson) => {
                    const isActive = lesson.chapter_number === chapterNum && lesson.lesson_number === lessonNum;
                    const lessonKey = `${lesson.chapter_number}_${lesson.lesson_number}`;
                    const isLessonCompleted = completedLessons.has(lessonKey);

                    return (
                      <button
                        key={`${lesson.chapter_number}_${lesson.lesson_number}`}
                        onClick={() => {
                          handleNavigateLesson(lesson.chapter_number, lesson.lesson_number);
                          setShowMobileMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all min-h-[44px] ${
                          isActive
                            ? 'font-medium'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                        style={isActive ? { backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', color: 'var(--color-primary)' } : {}}
                      >
                        {isLessonCompleted ? (
                          <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border flex-shrink-0 ${isActive ? '' : 'border-slate-500'}`} style={isActive ? { borderColor: 'var(--color-primary)' } : {}}></div>
                        )}
                        <span className="truncate text-left">{lesson.lesson_title}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      ) : null}

      {/* Sidebar - Course Structure (Desktop) - Hidden in roadmap mode only for free users */}
      {!isRestrictedMode && (
      <div
        className={`glass-effect border-r border-white/10 transition-all duration-300 flex-col
          ${cinemaMode ? (showSidebar ? 'w-80 flex' : 'w-0 opacity-0 overflow-hidden hidden') : 'hidden lg:flex lg:w-80'}
          ${!cinemaMode && 'm-4 rounded-2xl'}
        `}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white truncate pr-2">{course.course_title}</h3>
          {cinemaMode && (
            <button onClick={() => setShowSidebar(false)} className="p-1 hover:bg-white/10 rounded-lg">
              <ChevronLeft size={20} className="text-gray-400" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {courseStructure?.chapters?.map((chapter) => (
            <div key={chapter.id} className="space-y-1">
              <div className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Chapter {chapter.chapter_number}
              </div>
              {chapter.lessons?.map((lesson) => {
                const isActive = lesson.chapter_number === chapterNum && lesson.lesson_number === lessonNum;
                // Check if lesson is completed using the completedLessons Set
                const lessonKey = `${lesson.chapter_number}_${lesson.lesson_number}`;
                const isLessonCompleted = completedLessons.has(lessonKey);

                return (
                  <button
                    key={`${lesson.chapter_number}_${lesson.lesson_number}`}
                    onClick={() => handleNavigateLesson(lesson.chapter_number, lesson.lesson_number)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive
                      ? 'font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/5'
                    }`}
                    style={isActive ? { backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', color: 'var(--color-primary)' } : {}}
                  >
                    {isLessonCompleted ? (
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <div className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 ${isActive ? '' : 'border-gray-400'}`} style={isActive ? { borderColor: 'var(--color-primary)' } : {}}></div>
                    )}
                    <span className="truncate">{lesson.lesson_title}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Roadmap Mode Notice - Only for free users */}
      {isRestrictedMode && (
        <div className="hidden lg:flex lg:w-80 flex-col items-center justify-center p-6 text-center border-r border-white/10">
          <div className="glass-panel-floating p-6 max-w-xs">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Free Preview Mode</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You're viewing this lesson from the roadmap. Access to other lessons requires a subscription.
            </p>
            <button
              onClick={() => returnUrl ? navigate(returnUrl) : navigate('/roadmap/ignition')}
              className="w-full px-4 py-2 text-sm font-medium text-white rounded-lg transition-all"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Back to Roadmap
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* Top Bar - Mobile Optimized */}
        <div className={`flex items-center justify-between px-3 sm:px-6 py-3 ${cinemaMode ? 'backdrop-blur-md' : ''}`} style={cinemaMode ? { backgroundColor: 'color-mix(in srgb, var(--bg-secondary, #0f0f0f) 80%, transparent)' } : {}}>
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* Mobile Menu Button - Disabled in roadmap mode for free users only */}
            {!isRestrictedMode && (
            <button
              onClick={() => setShowMobileMenu(true)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-gray-500 dark:text-gray-400 dark:hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Course Menu"
            >
              <List size={20} />
            </button>
            )}
            
            {/* Cinema Mode Sidebar Toggle */}
            {cinemaMode && !showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="hidden lg:flex p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="Show Sidebar"
              >
                <Menu size={20} />
              </button>
            )}
            
            {/* Back Button */}
            {!cinemaMode && (
              <button
                onClick={() => {
                  if (fromRoadmap && returnUrl) {
                    navigate(returnUrl);
                  } else {
                    navigate(`/courses/${courseId}`);
                  }
                }}
                className="flex items-center gap-1.5 sm:gap-2 text-gray-500 dark:text-gray-400 dark:hover:text-white transition-colors min-h-[44px]"
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <ArrowLeft size={18} className="sm:w-5 sm:h-5" aria-hidden="true"/>
                <span className="hidden sm:inline text-sm sm:text-base">
                  {fromRoadmap ? 'Back to Roadmap' : 'Back'}
                </span>
              </button>
            )}
            
            {/* Current Lesson Title (Mobile) */}
            {currentLesson && (
              <div className="lg:hidden flex-1 min-w-0 ml-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {currentLesson.lesson_title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ch {chapterNum} • L {lessonNum}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCinemaMode(!cinemaMode)}
              className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              title={cinemaMode ? "Exit Cinema Mode" : "Enter Cinema Mode"}
            >
              {cinemaMode ? <Minimize2 size={18} className="sm:w-5 sm:h-5" /> : <Maximize2 size={18} className="sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-20">
          <div className={`max-w-4xl mx-auto transition-all duration-500 ${cinemaMode ? 'py-12' : 'py-6'}`}>

            {/* Lesson Header */}
            <div className="mb-12 text-center">
              <div className="meta-text inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)', borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', borderWidth: '1px', borderStyle: 'solid' }}>
                Chapter {chapterNum} • Lesson {lessonNum}
              </div>
              {isRestrictedMode && (
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                  <span>🔓</span>
                  <span>Free Preview Mode - Roadmap Access</span>
                </div>
              )}
              <h1 className="mb-6">
                {currentLesson.lesson_title}
              </h1>
              {lessonDescription?.lesson_description && (
                <p className="text-body max-w-2xl mx-auto">
                  {lessonDescription.lesson_description}
                </p>
              )}
            </div>

            {/* Video Placeholder (if applicable) */}
            {/* <div className="aspect-video bg-black rounded-2xl mb-12 shadow-2xl flex items-center justify-center border border-white/10">
              <Play size={64} className="text-white/20" />
            </div> */}

            {/* Quiz Section (removed - quiz functionality disabled) */}
            {false && showQuiz && quizData ? (
              <div className="mb-12 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setShowQuiz(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <ArrowLeft size={20}  aria-hidden="true"/>
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lesson Quiz</h2>
                </div>
                <QuizComponent
                  quizData={quizData}
                  onComplete={handleQuizComplete}
                  xpReward={20}
                />
              </div>
            ) : (
              /* Content Cards */
              lessonContent ? (
                <div className="space-y-8">
                  {/* The Hook */}
                  {lessonContent.the_hook && (
                    <div className="glass-panel-floating p-8 !m-0">
                      <h3 className="mb-6 flex items-center gap-3">
                        <span style={{ color: 'var(--color-primary)' }}>01.</span> The Hook
                      </h3>
                      <p className="text-body">
                        {lessonContent.the_hook}
                      </p>
                    </div>
                  )}

                  {/* Key Terms */}
                  {(lessonContent.key_terms_1 || lessonContent.key_terms_2 || lessonContent.key_terms_3 || lessonContent.key_terms_4) && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {lessonContent.key_terms_1 && (
                        <div className="glass-card-premium p-6">
                          <h4 className="mb-3" style={{ color: 'var(--color-primary)' }}>{lessonContent.key_terms_1}</h4>
                          <p className="text-body-sm">{lessonContent.key_terms_1_def}</p>
                        </div>
                      )}
                      {lessonContent.key_terms_2 && (
                        <div className="glass-card-premium p-6">
                          <h4 className="mb-3" style={{ color: 'var(--color-primary)' }}>{lessonContent.key_terms_2}</h4>
                          <p className="text-body-sm">{lessonContent.key_terms_2_def}</p>
                        </div>
                      )}
                      {lessonContent.key_terms_3 && (
                        <div className="glass-card-premium p-6">
                          <h4 className="mb-3" style={{ color: 'var(--color-primary)' }}>{lessonContent.key_terms_3}</h4>
                          <p className="text-body-sm">{lessonContent.key_terms_3_def}</p>
                        </div>
                      )}
                      {lessonContent.key_terms_4 && (
                        <div className="glass-card-premium p-6">
                          <h4 className="mb-3" style={{ color: 'var(--color-primary)' }}>{lessonContent.key_terms_4}</h4>
                          <p className="text-body-sm">{lessonContent.key_terms_4_def}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Core Concepts */}
                  {(lessonContent.core_concepts_1 || lessonContent.core_concepts_2 || lessonContent.core_concepts_3 || lessonContent.core_concepts_4) && (
                    <div className="glass-panel-floating p-8 !m-0">
                      <h3 className="mb-8 flex items-center gap-3">
                        <span style={{ color: 'var(--color-primary)' }}>02.</span> Core Concepts
                      </h3>
                      <div className="space-y-8">
                        {lessonContent.core_concepts_1 && (
                          <div className="pl-6 border-l-2" style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)' }}>
                            <h4 className="mb-3">{lessonContent.core_concepts_1}</h4>
                            <p className="text-body">{lessonContent.core_concepts_1_def}</p>
                          </div>
                        )}
                        {lessonContent.core_concepts_2 && (
                          <div className="pl-6 border-l-2" style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)' }}>
                            <h4 className="mb-3">{lessonContent.core_concepts_2}</h4>
                            <p className="text-body">{lessonContent.core_concepts_2_def}</p>
                          </div>
                        )}
                        {lessonContent.core_concepts_3 && (
                          <div className="pl-6 border-l-2" style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)' }}>
                            <h4 className="mb-3">{lessonContent.core_concepts_3}</h4>
                            <p className="text-body">{lessonContent.core_concepts_3_def}</p>
                          </div>
                        )}
                        {lessonContent.core_concepts_4 && (
                          <div className="pl-6 border-l-2" style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)' }}>
                            <h4 className="mb-3">{lessonContent.core_concepts_4}</h4>
                            <p className="text-body">{lessonContent.core_concepts_4_def}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Synthesis & Connect */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {lessonContent.synthesis && (
                      <div className="glass-panel-floating p-8 !m-0">
                        <h3 className="mb-6">Synthesis</h3>
                        <p className="text-body">{lessonContent.synthesis}</p>
                      </div>
                    )}
                    {lessonContent.connect_to_your_life && (
                      <div className="glass-panel-floating p-8 !m-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', borderWidth: '1px', borderStyle: 'solid' }}>
                        <h3 className="mb-6" style={{ color: 'var(--color-primary)' }}>Connect to Your Life</h3>
                        <p className="text-body">{lessonContent.connect_to_your_life}</p>
                      </div>
                    )}
                  </div>

                  {/* Key Takeaways */}
                  {(lessonContent.key_takeaways_1 || lessonContent.key_takeaways_2 || lessonContent.key_takeaways_3 || lessonContent.key_takeaways_4) && (
                    <div className="glass-panel-floating p-8 !m-0">
                      <h3 className="mb-8 flex items-center gap-3">
                        <span style={{ color: 'var(--color-primary)' }}>03.</span> Key Takeaways
                      </h3>
                      <ul className="space-y-4">
                        {lessonContent.key_takeaways_1 && (
                          <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', color: 'var(--color-primary)' }}>
                              <CheckCircle size={20} />
                            </div>
                            <span className="text-body pt-1">{lessonContent.key_takeaways_1}</span>
                          </li>
                        )}
                        {lessonContent.key_takeaways_2 && (
                          <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', color: 'var(--color-primary)' }}>
                              <CheckCircle size={20} />
                            </div>
                            <span className="text-body pt-1">{lessonContent.key_takeaways_2}</span>
                          </li>
                        )}
                        {lessonContent.key_takeaways_3 && (
                          <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', color: 'var(--color-primary)' }}>
                              <CheckCircle size={20} />
                            </div>
                            <span className="text-body pt-1">{lessonContent.key_takeaways_3}</span>
                          </li>
                        )}
                        {lessonContent.key_takeaways_4 && (
                          <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', color: 'var(--color-primary)' }}>
                              <CheckCircle size={20} />
                            </div>
                            <span className="text-body pt-1">{lessonContent.key_takeaways_4}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-24 glass-panel-floating">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Lesson content is being prepared. Check back soon!</p>
                </div>
              )
            )}

            {/* Completion Action */}
            {!showQuiz && (
              <div className="mt-12 flex flex-col items-center justify-center space-y-6">
                {isCompleted ? (
                  <div className="flex flex-col items-center gap-6 animate-fade-in">
                    <div className="flex flex-col items-center gap-3 text-green-500">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle size={32} />
                      </div>
                      <span className="text-xl font-bold">Lesson Completed</span>
                    </div>
                    
                    {/* Next Lesson Button - Show after completion (disabled in roadmap mode) */}
                    {nextLesson && !isRestrictedMode && (
                      <button
                        onClick={() => handleNavigateLesson(nextLesson.lesson.chapter_number, nextLesson.lesson.lesson_number)}
                        className="group relative px-8 py-4 text-white rounded-full font-bold text-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
                        style={{ 
                          background: 'var(--gradient-primary)',
                          backgroundColor: 'var(--color-primary)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 90%, transparent)';
                          e.currentTarget.style.boxShadow = '0 10px 30px color-mix(in srgb, var(--color-primary) 30%, transparent)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                          e.currentTarget.style.boxShadow = '';
                        }}
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <div className="relative flex items-center gap-3">
                          <ChevronRight size={24} />
                          <span>Next Lesson</span>
                        </div>
                      </button>
                    )}
                    {/* Roadmap mode - return to roadmap after completion (free users only) */}
                    {isRestrictedMode && isCompleted && (
                      <button
                        onClick={() => returnUrl ? navigate(returnUrl) : navigate('/roadmap/ignition')}
                        className="group relative px-8 py-4 text-white rounded-full font-bold text-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
                        style={{ 
                          background: 'var(--gradient-primary)',
                          backgroundColor: 'var(--color-primary)'
                        }}
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <div className="relative flex items-center gap-3">
                          <ArrowLeft size={24} />
                          <span>Return to Roadmap</span>
                        </div>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <button
                      onClick={() => handleCompleteLesson()}
                      disabled={isCompleting || (course?.masterschool && !trackingCanComplete)}
                      className="group relative px-8 py-4 text-white rounded-full font-bold text-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 90%, transparent)';
                          e.currentTarget.style.boxShadow = '0 10px 30px color-mix(in srgb, var(--color-primary) 30%, transparent)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      <div className="relative flex items-center gap-3">
                        {isCompleting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Completing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={24} />
                            <span>
                              {course?.masterschool && !trackingCanComplete 
                                ? 'Complete Requirements First' 
                                : 'Mark as Complete (+50 XP)'}
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                )}

                {/* Navigation Buttons - Disabled in roadmap mode for free users only */}
                {!isRestrictedMode && (
                <div className="flex items-center gap-4 mt-8 w-full max-w-md justify-between">
                  {previousLesson ? (
                    <button
                      onClick={() => handleNavigateLesson(previousLesson.lesson.chapter_number, previousLesson.lesson.lesson_number)}
                      className="flex items-center gap-2 px-6 py-3 text-gray-500 dark:text-gray-400 dark:hover:text-white transition-colors"
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = ''}
                    >
                      <ChevronLeft size={20}  aria-hidden="true"/>
                      <span>Previous Lesson</span>
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {/* Next Lesson button - Only show if lesson is completed */}
                  {isCompleted && nextLesson && (
                    <button
                      onClick={() => handleNavigateLesson(nextLesson.lesson.chapter_number, nextLesson.lesson.lesson_number)}
                      className="flex items-center gap-2 px-6 py-3 text-gray-500 dark:text-gray-400 dark:hover:text-white transition-colors"
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = ''}
                    >
                      <span>Next Lesson</span>
                      <ChevronRight size={20}  aria-hidden="true"/>
                    </button>
                  )}
                </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Lesson Tracker - Only show if course has masterschool */}
      {course?.masterschool && currentLesson && currentLesson.lesson_id && (
        <LessonTracker
          courseId={parseInt(courseId)}
          chapterNumber={chapterNum}
          lessonNumber={lessonNum}
          lessonId={currentLesson.lesson_id}
          lessonTitle={currentLesson.lesson_title}
          masterschool={course.masterschool}
          enabled={true}
          fromRoadmap={fromRoadmap}
          returnUrl={returnUrl}
        />
      )}

      {/* Complete Lesson Modal - For courses with masterschool when clicking the main complete button */}
      {course?.masterschool && currentLesson && currentLesson.lesson_id && (
        <CompleteLessonModal
          isOpen={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          userId={user?.id}
          lessonId={currentLesson.lesson_id}
          courseId={parseInt(courseId)}
          chapterNumber={chapterNum}
          lessonNumber={lessonNum}
          masterschool={course.masterschool}
          lessonTitle={currentLesson.lesson_title}
          onComplete={handleLessonCompleteFromModal}
          fromRoadmap={fromRoadmap}
          returnUrl={returnUrl}
          isFreeUser={isFreeUser}
        />
      )}
    </div>
  );
};

export default CoursePlayerPage;
