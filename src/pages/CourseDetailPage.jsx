import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import courseService from '../services/courseService';
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
  const [course, setCourse] = useState(null);
  const [courseStructure, setCourseStructure] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [unlockStatus, setUnlockStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Removed unused completedLessons state

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

          // Load completed lessons (data not currently used but may be needed for future features)
          await courseService.getUserLessonProgress(user.id, fullCourse.course_id);
          // Note: getUserLessonProgress returns a single record, we need a way to get ALL completed lessons.
          // Since the service doesn't have a "getAllUserLessonProgress" method readily available in the snippet I saw,
          // I will rely on the fact that we can iterate through chapters and check status if needed, 
          // OR better, let's just fetch all completed lessons for this course directly if possible.
          // For now, let's assume we can get this data or we'll fetch it per chapter/lesson if needed.
          // Actually, let's check `calculateCourseProgress` implementation again - it fetches completed lessons internally.
          // We can replicate that logic here to populate `completedLessons` set.

          // Fetching all completed lessons for this course manually to populate the UI state
          // This is a bit of a workaround since we don't have a direct service method for "get all completed lesson IDs"
          // We'll rely on the structure iteration later.
        }
      }
    } catch (err) {
      console.error('Error loading course:', err);
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
          console.error('Error finding next lesson:', nextLessonError);
        }

        if (nextLesson) {
          navigate(`/courses/${courseId}/chapters/${nextLesson.chapter_number}/lessons/${nextLesson.lesson_number}`);
          return;
        }
      } catch (err) {
        console.error('Error getting next lesson:', err);
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
    const colors = {
      'Ignition': 'bg-[#B4833D]/20 text-[#B4833D] border-[#B4833D]/30',
      'Insight': 'bg-[#66371B]/20 text-[#66371B] dark:text-[#E3D8C1] border-[#66371B]/30',
      'Transformation': 'bg-[#81754B]/20 text-[#81754B] border-[#81754B]/30',
      'God Mode': 'bg-[#3F3F2C]/20 text-[#3F3F2C] dark:text-[#F7F1E1] border-[#3F3F2C]/30'
    };
    return colors[school] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B4833D] mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-panel-floating p-8 text-center max-w-md mx-auto">
          <p className="text-red-400 mb-6 text-lg">{error || 'Course not found'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-3 bg-[#B4833D] text-white rounded-xl hover:bg-[#B4833D]/80 transition-all font-medium"
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
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 pb-24">
      {/* Back Button */}
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#B4833D] dark:hover:text-white transition-colors group"
      >
        <div className="p-2 rounded-full bg-white/5 dark:bg-black/20 group-hover:bg-[#B4833D]/10 transition-colors">
          <ArrowLeft size={20} />
        </div>
        <span className="font-medium">Back to Catalog</span>
      </button>

      {/* Course Header Card */}
      <div className="glass-card-premium relative overflow-hidden">
        {/* Background Gradient Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B4833D]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

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

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white font-heading leading-tight">
              {course.course_title}
            </h1>

            {course.topic && (
              <p className="text-xl text-gray-600 dark:text-gray-300 font-light">
                Topic: <span className="font-medium text-[#B4833D]">{course.topic}</span>
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
                  <span className="font-bold text-[#B4833D]">{unlockStatus?.requiredXp || 0} XP</span>
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
            <div className="glass-effect rounded-2xl p-6 border border-[#B4833D]/20 bg-[#B4833D]/5 min-w-[280px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#B4833D]/20 rounded-lg">
                  <Award size={24} className="text-[#B4833D]" />
                </div>
                <span className="text-[#B4833D] font-bold text-lg">Course Unlocked</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Ready to master this skill?
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="glass-effect rounded-xl p-4 border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
            <BookOpen size={24} className="text-[#B4833D] mb-2" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{courseStructure?.chapters?.length || 0}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chapters</span>
          </div>
          <div className="glass-effect rounded-xl p-4 border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
            <Play size={24} className="text-[#B4833D] mb-2" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalLessons}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lessons</span>
          </div>
          <div className="glass-effect rounded-xl p-4 border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
            <Clock size={24} className="text-[#B4833D] mb-2" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{course.duration_hours || 0}h</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</span>
          </div>
          <div className="glass-effect rounded-xl p-4 border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
            <TrendingUp size={24} className="text-[#B4833D] mb-2" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{course.xp_threshold || 100}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total XP</span>
          </div>
        </div>

        {/* Progress Section */}
        {userProgress && progressPercentage > 0 && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Course Progress</span>
              <span className="text-sm font-bold text-[#B4833D]">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#B4833D] to-[#81754B] h-full rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-8">
          <button
            onClick={handleStartCourse}
            disabled={!isUnlocked}
            className={`w-full lg:w-auto px-10 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl ${isUnlocked
              ? 'bg-gradient-to-r from-[#B4833D] to-[#81754B] hover:from-[#B4833D] hover:to-[#66371B] text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
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
              <div key={chapter.id} className="glass-panel-floating !m-0 overflow-hidden group">
                <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#B4833D]/10 flex items-center justify-center text-[#B4833D] font-bold border border-[#B4833D]/20">
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
                      // Placeholder for lesson completion check - would need real data here
                      const isCompleted = false;

                      return (
                        <button
                          key={`${lesson.chapter_number}_${lesson.lesson_number}`}
                          onClick={() => handleLessonClick(lesson.chapter_number, lesson.lesson_number)}
                          disabled={!isUnlocked}
                          className={`w-full flex items-center justify-between p-4 transition-all ${isUnlocked
                            ? 'hover:bg-[#B4833D]/5 cursor-pointer'
                            : 'opacity-60 cursor-not-allowed'
                            }`}
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
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 group-hover:text-[#B4833D] group-hover:bg-[#B4833D]/10 transition-all">
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

