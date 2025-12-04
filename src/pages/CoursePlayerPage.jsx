import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import courseService from '../services/courseService';
import QuizComponent from '../components/QuizComponent';
import {
  ArrowLeft,
  CheckCircle,
  Play,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Clock,
  Maximize2,
  Minimize2,
  Menu,
  BrainCircuit
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CoursePlayerPage = () => {
  const { courseId, chapterNumber, lessonNumber } = useParams();
  const navigate = useNavigate();
  const { user, profile, fetchProfile } = useAuth();
  const [course, setCourse] = useState(null);
  const [courseStructure, setCourseStructure] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [lessonContent, setLessonContent] = useState(null);
  const [lessonDescription, setLessonDescription] = useState(null);
  const [userLessonProgress, setUserLessonProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const chapterNum = parseInt(chapterNumber);
  const lessonNum = parseInt(lessonNumber);

  useEffect(() => {
    if (courseId && chapterNum && lessonNum) {
      loadLessonData();
    }
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
      setCourseStructure(fullCourse);

      // Find current chapter and lesson
      const chapter = fullCourse?.chapters?.find(ch => ch.chapter_number === chapterNum);
      const lesson = chapter?.lessons?.find(l => l.lesson_number === lessonNum);

      if (!chapter || !lesson) {
        throw new Error('Lesson not found');
      }

      setCurrentChapter(chapter);
      setCurrentLesson(lesson);

      // Load lesson content (use course_id, not UUID)
      if (fullCourse?.course_id) {
        const { data: content, error: contentError } = await courseService.getLessonContent(
          fullCourse.course_id,
          chapterNum,
          lessonNum
        );
        if (contentError && contentError.code !== 'PGRST116') {
          console.warn('Lesson content not found:', contentError);
        } else {
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
          console.warn('Quiz data not available:', quizErr);
          setQuizData([]);
        }
      }
    } catch (err) {
      console.error('Error loading lesson:', err);
      setError('Failed to load lesson. Please try again.');
      toast.error('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async (xpBonus = 0) => {
    if (!user || !course?.course_id) return;

    try {
      setIsCompleting(true);

      // Complete lesson (awards XP)
      const { data, error: completeError } = await courseService.completeLesson(
        user.id,
        course.course_id,
        chapterNum,
        lessonNum,
        50 + xpBonus
      );

      if (completeError) throw completeError;

      setUserLessonProgress({ ...data.lessonProgress, is_completed: true });

      // Refresh profile to update XP
      if (user.id) {
        setTimeout(async () => {
          await fetchProfile(user.id);
        }, 500);
      }

      // Recalculate course progress
      await courseService.calculateCourseProgress(user.id, course.course_id);

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
      console.error('Error completing lesson:', err);
      toast.error('Failed to complete lesson. Please try again.');
    } finally {
      setIsCompleting(false);
    }
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
    navigate(`/courses/${courseId}/chapters/${targetChapterNum}/lessons/${targetLessonNum}`);
  };

  const isCompleted = userLessonProgress?.is_completed || false;
  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B4833D] mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-panel-floating p-8 text-center max-w-md mx-auto">
          <p className="text-red-400 mb-6 text-lg">{error || 'Lesson not found'}</p>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="px-6 py-3 bg-[#B4833D] text-white rounded-xl hover:bg-[#B4833D]/80 transition-all font-medium"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-[calc(100vh-80px)] overflow-hidden transition-all duration-500 ${cinemaMode ? 'fixed inset-0 z-50 bg-[#0f0f0f]' : ''}`}>

      {/* Sidebar - Course Structure */}
      <div
        className={`glass-effect border-r border-white/10 transition-all duration-300 flex flex-col
          ${cinemaMode ? (showSidebar ? 'w-80' : 'w-0 opacity-0 overflow-hidden') : 'hidden lg:flex lg:w-80'}
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
                // Placeholder for completion status
                const isLessonCompleted = false;

                return (
                  <button
                    key={`${lesson.chapter_number}_${lesson.lesson_number}`}
                    onClick={() => handleNavigateLesson(lesson.chapter_number, lesson.lesson_number)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive
                      ? 'bg-[#B4833D]/20 text-[#B4833D] font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/5'
                      }`}
                  >
                    {isLessonCompleted ? (
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <div className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 ${isActive ? 'border-[#B4833D]' : 'border-gray-400'}`}></div>
                    )}
                    <span className="truncate">{lesson.lesson_title}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* Top Bar */}
        <div className={`flex items-center justify-between px-6 py-4 ${cinemaMode ? 'bg-[#0f0f0f]/80 backdrop-blur-md' : ''}`}>
          <div className="flex items-center gap-4">
            {cinemaMode && !showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="Show Sidebar"
              >
                <Menu size={20} />
              </button>
            )}
            {!cinemaMode && (
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#B4833D] dark:hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">Back to Course</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCinemaMode(!cinemaMode)}
              className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
              title={cinemaMode ? "Exit Cinema Mode" : "Enter Cinema Mode"}
            >
              {cinemaMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-20">
          <div className={`max-w-4xl mx-auto transition-all duration-500 ${cinemaMode ? 'py-12' : 'py-6'}`}>

            {/* Lesson Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B4833D]/10 text-[#B4833D] text-xs font-bold uppercase tracking-wider mb-4 border border-[#B4833D]/20">
                Chapter {chapterNum} • Lesson {lessonNum}
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-heading leading-tight">
                {currentLesson.lesson_title}
              </h1>
              {lessonDescription?.lesson_description && (
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  {lessonDescription.lesson_description}
                </p>
              )}
            </div>

            {/* Video Placeholder (if applicable) */}
            {/* <div className="aspect-video bg-black rounded-2xl mb-12 shadow-2xl flex items-center justify-center border border-white/10">
              <Play size={64} className="text-white/20" />
            </div> */}

            {/* Quiz Section (if active) */}
            {showQuiz && quizData ? (
              <div className="mb-12 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setShowQuiz(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <ArrowLeft size={20} />
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
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <span className="text-[#B4833D]">01.</span> The Hook
                      </h3>
                      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                        {lessonContent.the_hook}
                      </p>
                    </div>
                  )}

                  {/* Key Terms */}
                  {(lessonContent.key_terms_1 || lessonContent.key_terms_2) && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {lessonContent.key_terms_1 && (
                        <div className="glass-card-premium p-6">
                          <h4 className="font-bold text-[#B4833D] text-lg mb-2">{lessonContent.key_terms_1}</h4>
                          <p className="text-gray-600 dark:text-gray-300">{lessonContent.key_terms_1_def}</p>
                        </div>
                      )}
                      {lessonContent.key_terms_2 && (
                        <div className="glass-card-premium p-6">
                          <h4 className="font-bold text-[#B4833D] text-lg mb-2">{lessonContent.key_terms_2}</h4>
                          <p className="text-gray-600 dark:text-gray-300">{lessonContent.key_terms_2_def}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Core Concepts */}
                  {(lessonContent.core_concepts_1 || lessonContent.core_concepts_2) && (
                    <div className="glass-panel-floating p-8 !m-0">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="text-[#B4833D]">02.</span> Core Concepts
                      </h3>
                      <div className="space-y-6">
                        {lessonContent.core_concepts_1 && (
                          <div className="pl-6 border-l-2 border-[#B4833D]/30">
                            <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{lessonContent.core_concepts_1}</h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{lessonContent.core_concepts_1_def}</p>
                          </div>
                        )}
                        {lessonContent.core_concepts_2 && (
                          <div className="pl-6 border-l-2 border-[#B4833D]/30">
                            <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{lessonContent.core_concepts_2}</h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{lessonContent.core_concepts_2_def}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Synthesis & Connect */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {lessonContent.synthesis && (
                      <div className="glass-panel-floating p-8 !m-0">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Synthesis</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{lessonContent.synthesis}</p>
                      </div>
                    )}
                    {lessonContent.connect_to_your_life && (
                      <div className="glass-panel-floating p-8 !m-0 bg-[#B4833D]/5 border-[#B4833D]/20">
                        <h3 className="text-xl font-bold text-[#B4833D] mb-4">Connect to Your Life</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{lessonContent.connect_to_your_life}</p>
                      </div>
                    )}
                  </div>

                  {/* Key Takeaways */}
                  {(lessonContent.key_takeaways_1 || lessonContent.key_takeaways_2) && (
                    <div className="glass-panel-floating p-8 !m-0">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="text-[#B4833D]">03.</span> Key Takeaways
                      </h3>
                      <ul className="space-y-4">
                        {lessonContent.key_takeaways_1 && (
                          <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="p-2 bg-[#B4833D]/20 rounded-lg text-[#B4833D]">
                              <CheckCircle size={20} />
                            </div>
                            <span className="text-lg text-gray-700 dark:text-gray-200 pt-1">{lessonContent.key_takeaways_1}</span>
                          </li>
                        )}
                        {lessonContent.key_takeaways_2 && (
                          <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="p-2 bg-[#B4833D]/20 rounded-lg text-[#B4833D]">
                              <CheckCircle size={20} />
                            </div>
                            <span className="text-lg text-gray-700 dark:text-gray-200 pt-1">{lessonContent.key_takeaways_2}</span>
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
                  <div className="flex flex-col items-center gap-3 text-green-500 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle size={32} />
                    </div>
                    <span className="text-xl font-bold">Lesson Completed</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    {quizData && (
                      <button
                        onClick={() => setShowQuiz(true)}
                        className="group relative px-8 py-4 bg-white/10 hover:bg-white/20 text-gray-900 dark:text-white rounded-full font-bold text-lg shadow-lg border border-white/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
                      >
                        <BrainCircuit size={24} className="text-[#B4833D]" />
                        <span>Take Quiz</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCompleteLesson()}
                      disabled={isCompleting}
                      className="group relative px-8 py-4 bg-[#B4833D] hover:bg-[#B4833D]/90 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-[#B4833D]/30 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
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
                            <span>Mark as Complete (+50 XP)</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center gap-4 mt-8 w-full max-w-md justify-between">
                  {previousLesson ? (
                    <button
                      onClick={() => handleNavigateLesson(previousLesson.lesson.chapter_number, previousLesson.lesson.lesson_number)}
                      className="flex items-center gap-2 px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-[#B4833D] dark:hover:text-white transition-colors"
                    >
                      <ChevronLeft size={20} />
                      <span>Previous Lesson</span>
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {nextLesson && (
                    <button
                      onClick={() => handleNavigateLesson(nextLesson.lesson.chapter_number, nextLesson.lesson.lesson_number)}
                      className="flex items-center gap-2 px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-[#B4833D] dark:hover:text-white transition-colors"
                    >
                      <span>Next Lesson</span>
                      <ChevronRight size={20} />
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayerPage;
