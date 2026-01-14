import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePageTransition } from '../contexts/PageTransitionContext';
import courseService from '../services/courseService';
import { supabase } from '../lib/supabaseClient';
import {
  BookOpen,
  Play,
  Lock,
  CheckCircle,
  Clock,
  ArrowLeft,
  TrendingUp,
  Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startTransition, endTransition } = usePageTransition();
  const [course, setCourse] = useState(null);
  const [courseStructure, setCourseStructure] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [unlockStatus, setUnlockStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set()); // Store completed lessons as Set for O(1) lookup

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, user]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load full course structure (metadata + parsed structure)
      const { data: fullCourse, error: structureError } = await courseService.getFullCourseStructure(courseId);
      if (structureError) throw structureError;

      setCourse(fullCourse);
      setCourseStructure(fullCourse);

      // Load unlock status
      if (user) {
        const { data: unlock, error: unlockError } = await courseService.checkCourseUnlock(user.id, courseId);
        if (unlockError) throw unlockError;
        setUnlockStatus(unlock);

        // Load user progress (use course_id, not UUID)
        if (fullCourse?.course_id) {
          const { data: progress, error: progressError } = await courseService.getUserCourseProgress(user.id, fullCourse.course_id);
          if (progressError) throw progressError;
          setUserProgress(progress);

          // Calculate progress percentage
          const { data: calculatedProgress } = await courseService.calculateCourseProgress(user.id, fullCourse.course_id);
          if (calculatedProgress) {
            setUserProgress(prev => ({
              ...prev,
              progress_percentage: calculatedProgress.progressPercentage,
              status: calculatedProgress.status
            }));
          }

          // Load all completed lessons for this course to show completion status
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
      }
    } catch (err) {
      setError('Failed to load course. Please try again.');
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCourse = async () => {
    if (!unlockStatus?.isUnlocked) {
      toast.error(`You need ${unlockStatus?.requiredXp || 0} XP to unlock this course`);
      return;
    }

    if (!courseStructure?.course_id) {
      toast.error('Course structure not available');
      return;
    }

    // Find the first uncompleted lesson using courseService
    if (user && courseStructure.course_id) {
      try {
        const { data: nextLesson, error: nextLessonError } = await courseService.getNextLesson(
          user.id,
          courseStructure.course_id
        );

        if (nextLessonError) {
        }

        if (nextLesson) {
          navigate(`/courses/${courseId}/chapters/${nextLesson.chapter_number}/lessons/${nextLesson.lesson_number}`);
          return;
        }
      } catch (err) {
      }
    }

    // Fallback to first lesson if no progress found
    if (courseStructure?.chapters?.[0]?.lessons?.[0]) {
      const firstLesson = courseStructure.chapters[0].lessons[0];
      navigate(`/courses/${courseId}/chapters/${firstLesson.chapter_number}/lessons/${firstLesson.lesson_number}`);
    } else {
      toast.error('Course structure not available');
    }
  };

  const handleLessonClick = (chapterNumber, lessonNumber) => {
    if (!unlockStatus?.isUnlocked) {
      toast.error(`You need ${unlockStatus?.requiredXp || 0} XP to unlock this course`);
      return;
    }
    navigate(`/courses/${courseId}/chapters/${chapterNumber}/lessons/${lessonNumber}`);
  };

  const getSchoolColor = (school) => {
    // Return style object instead of class string for dynamic colors
    const colors = {
      'Ignition': { backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', color: 'var(--color-primary)', borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)' },
      'Insight': { backgroundColor: 'color-mix(in srgb, var(--color-kobicha) 20%, transparent)', color: 'var(--color-kobicha)', borderColor: 'color-mix(in srgb, var(--color-kobicha) 30%, transparent)' },
      'Transformation': { backgroundColor: 'color-mix(in srgb, var(--color-secondary) 20%, transparent)', color: 'var(--color-secondary)', borderColor: 'color-mix(in srgb, var(--color-secondary) 30%, transparent)' },
      'God Mode': { backgroundColor: 'color-mix(in srgb, var(--color-earth-green) 20%, transparent)', color: 'var(--color-earth-green)', borderColor: 'color-mix(in srgb, var(--color-earth-green) 30%, transparent)' }
    };
    return colors[school] || { backgroundColor: 'rgba(107, 114, 128, 0.2)', color: '#9CA3AF', borderColor: 'rgba(107, 114, 128, 0.3)' };
  };

  // Use global loader instead of local loading state
  useEffect(() => {
    if (loading) {
      startTransition();
    } else {
      endTransition();
    }
  }, [loading, startTransition, endTransition]);

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-panel-floating p-8 text-center max-w-md mx-auto">
          <p className="text-red-400 mb-6 text-lg">{error || 'Course not found'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-3 text-white rounded-xl transition-all font-medium"
            style={{ backgroundColor: 'var(--color-primary)' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 80%, transparent)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  const isUnlocked = unlockStatus?.isUnlocked || false;
  const progressPercentage = userProgress?.progress_percentage || 0;
  const totalLessons = courseStructure?.chapters?.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0) || 0;

  return (
    <div className="p-3 sm:p-4 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-24">
      {/* Back Button - Mobile Optimized */}
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 dark:hover:text-white transition-colors group min-h-[44px]"
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = ''}
      >
        <div className="p-2 rounded-lg bg-white/5 dark:bg-black/20 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 10%, transparent)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
          <ArrowLeft size={18} />
        </div>
        <span className="font-medium text-sm sm:text-base">Back</span>
      </button>

      {/* Course Header Card */}
      <div className="glass-card-premium relative overflow-hidden">
        {/* Background Gradient Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}></div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 relative z-10">
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border backdrop-blur-md ${getSchoolColor(course.masterschool)}`}>
                {course.masterschool}
              </span>
              {course.difficulty_level && (
                <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-white/10">
                  {course.difficulty_level}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white font-heading leading-tight">
              {course.course_title}
            </h1>

            {course.topic && (
              <p className="text-xl text-gray-600 dark:text-gray-300 font-light">
                Topic: <span className="font-medium" style={{ color: 'var(--color-primary)' }}>{course.topic}</span>
              </p>
            )}
          </div>

          {/* Unlock Status / XP Card */}
          {!isUnlocked ? (
            <div className="glass-effect rounded-2xl p-6 border border-red-500/30 bg-red-500/5 min-w-[280px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Lock size={24} className="text-red-500" />
                </div>
                <span className="text-red-500 font-bold text-lg">Locked</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Required XP</span>
                  <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{unlockStatus?.requiredXp || 0} XP</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${Math.min(((unlockStatus?.userXp || 0) / (unlockStatus?.requiredXp || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Current: {unlockStatus?.userXp || 0} XP</span>
                  <span>{Math.max(0, (unlockStatus?.requiredXp || 0) - (unlockStatus?.userXp || 0))} XP needed</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-effect rounded-2xl p-6 border min-w-[280px]" style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
                  <Award size={24} style={{ color: 'var(--color-primary)' }} />
                </div>
                <span className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>Course Unlocked</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Ready to master this skill?
              </p>
            </div>
          )}
        </div>

        {/* Stats Row - All in one line, smaller */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="font-semibold text-gray-900 dark:text-white">{courseStructure?.chapters?.length || 0}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chapters</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Play size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="font-semibold text-gray-900 dark:text-white">{totalLessons}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lessons</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="font-semibold text-gray-900 dark:text-white">{course.duration_hours || 0}h</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="font-semibold text-gray-900 dark:text-white">{course.xp_threshold || 100}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total XP</span>
          </div>
        </div>

        {/* Progress Section */}
        {userProgress && progressPercentage > 0 && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Course Progress</span>
              <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out relative"
                style={{ background: 'var(--gradient-primary)', width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button - Mobile Optimized */}
        <div className="mt-6 sm:mt-8">
          <button
            onClick={handleStartCourse}
            disabled={!isUnlocked}
            className={`w-full lg:w-auto px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3 shadow-xl min-h-[48px] ${isUnlocked
              ? 'text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            style={isUnlocked ? { background: 'var(--gradient-primary)' } : {}}
            onMouseEnter={isUnlocked ? (e) => e.currentTarget.style.background = 'var(--gradient-primary)' : undefined}
          >
            {userProgress?.status === 'completed' ? (
              <>
                <CheckCircle size={24} />
                <span>Course Completed</span>
              </>
            ) : userProgress?.status === 'in_progress' ? (
              <>
                <Play size={24} fill="currentColor" />
                <span>Continue Learning</span>
              </>
            ) : (
              <>
                <Play size={24} fill="currentColor" />
                <span>Start Course</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Course Outline */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white px-2 font-heading">Course Curriculum</h2>

        {!courseStructure?.chapters || courseStructure.chapters.length === 0 ? (
          <div className="glass-panel-floating p-8 text-center text-gray-500 dark:text-gray-400">
            No chapters available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {courseStructure.chapters.map((chapter, chapterIndex) => (
              <div key={chapter.chapter_id || `chapter-${chapter.chapter_number}`} className="glass-panel-floating !m-0 overflow-hidden group">
                <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)', borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', borderWidth: '1px', borderStyle: 'solid' }}>
                      {chapter.chapter_number}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {chapter.chapter_title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {chapter.lessons?.length || 0} Lessons
                      </p>
                    </div>
                  </div>
                </div>

                {chapter.lessons && chapter.lessons.length > 0 && (
                  <div className="divide-y divide-white/5">
                    {chapter.lessons.map((lesson, lessonIndex) => {
                      // Check if lesson is completed using the completedLessons Set
                      const lessonKey = `${lesson.chapter_number}_${lesson.lesson_number}`;
                      const isCompleted = completedLessons.has(lessonKey);

                      return (
                        <button
                          key={`${lesson.chapter_number}_${lesson.lesson_number}`}
                          onClick={() => handleLessonClick(lesson.chapter_number, lesson.lesson_number)}
                          disabled={!isUnlocked}
                          className={`w-full flex items-center justify-between p-4 transition-all ${isUnlocked
                            ? 'cursor-pointer'
                            : 'opacity-60 cursor-not-allowed'
                            }`}
                          onMouseEnter={isUnlocked ? (e) => e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 5%, transparent)' : undefined}
                          onMouseLeave={isUnlocked ? (e) => e.currentTarget.style.backgroundColor = '' : undefined}
                        >
                          <div className="flex items-center gap-4">
                            {isCompleted ? (
                              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                <CheckCircle size={18} />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{lesson.lesson_number}</span>
                              </div>
                            )}
                            <div className="text-left">
                              <span className={`text-sm font-medium block ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                                {lesson.lesson_title}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {isUnlocked ? (
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 transition-all" onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 10%, transparent)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.backgroundColor = ''; }}>
                                <Play size={14} fill="currentColor" />
                              </div>
                            ) : (
                              <Lock size={16} className="text-gray-400" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;

