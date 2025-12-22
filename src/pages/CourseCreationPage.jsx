import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import courseService from '../services/courseService';
import { ArrowLeft, Save, Send, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CourseCreationPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  // Removed unused loading state
  const [saving, setSaving] = useState(false);
  
  // Course metadata
  const [courseData, setCourseData] = useState({
    course_title: '',
    school_name: '',
    masterschool: 'Ignition',
    difficulty_level: '',
    topic: '',
    duration_hours: 0,
    xp_threshold: 0,
    master_skill_linked: '',
    stats_linked: [],
    status: 'draft'
  });

  // Chapters and lessons
  const [chapters, setChapters] = useState([
    {
      chapter_number: 1,
      chapter_title: '',
      lessons: [
        { lesson_number: 1, lesson_title: '' }
      ]
    }
  ]);

  useEffect(() => {
    // Check if user is teacher or admin
    if (profile && profile.role !== 'Teacher' && profile.role !== 'Admin') {
      toast.error('Only teachers and admins can create courses');
      navigate('/courses');
    }
  }, [profile, navigate]);

  const handleCourseDataChange = (field, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddChapter = () => {
    const newChapterNumber = chapters.length + 1;
    setChapters(prev => [
      ...prev,
      {
        chapter_number: newChapterNumber,
        chapter_title: '',
        lessons: [
          { lesson_number: 1, lesson_title: '' }
        ]
      }
    ]);
  };

  const handleRemoveChapter = (chapterIndex) => {
    if (chapters.length <= 1) {
      toast.error('Course must have at least one chapter');
      return;
    }
    setChapters(prev => prev.filter((_, index) => index !== chapterIndex));
  };

  const handleChapterTitleChange = (chapterIndex, title) => {
    setChapters(prev => prev.map((chapter, index) => 
      index === chapterIndex 
        ? { ...chapter, chapter_title: title }
        : chapter
    ));
  };

  const handleAddLesson = (chapterIndex) => {
    setChapters(prev => prev.map((chapter, index) => {
      if (index === chapterIndex) {
        const newLessonNumber = chapter.lessons.length + 1;
        return {
          ...chapter,
          lessons: [
            ...chapter.lessons,
            { lesson_number: newLessonNumber, lesson_title: '' }
          ]
        };
      }
      return chapter;
    }));
  };

  const handleRemoveLesson = (chapterIndex, lessonIndex) => {
    setChapters(prev => prev.map((chapter, index) => {
      if (index === chapterIndex) {
        if (chapter.lessons.length <= 1) {
          toast.error('Chapter must have at least one lesson');
          return chapter;
        }
        return {
          ...chapter,
          lessons: chapter.lessons.filter((_, idx) => idx !== lessonIndex)
        };
      }
      return chapter;
    }));
  };

  const handleLessonTitleChange = (chapterIndex, lessonIndex, title) => {
    setChapters(prev => prev.map((chapter, index) => {
      if (index === chapterIndex) {
        return {
          ...chapter,
          lessons: chapter.lessons.map((lesson, idx) =>
            idx === lessonIndex
              ? { ...lesson, lesson_title: title }
              : lesson
          )
        };
      }
      return chapter;
    }));
  };

  const validateForm = () => {
    if (!courseData.course_title.trim()) {
      toast.error('Course title is required');
      return false;
    }
    if (!courseData.masterschool) {
      toast.error('Masterschool is required');
      return false;
    }
    if (chapters.some(ch => !ch.chapter_title.trim())) {
      toast.error('All chapters must have a title');
      return false;
    }
    if (chapters.some(ch => ch.lessons.some(lesson => !lesson.lesson_title.trim()))) {
      toast.error('All lessons must have a title');
      return false;
    }
    return true;
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      // Create course metadata
      const { data: course, error: courseError } = await courseService.createCourse(user.id, {
        ...courseData,
        status: 'draft'
      });

      if (courseError) throw courseError;

      // Create chapters and lessons
      for (const chapterData of chapters) {
        const { data: chapter, error: chapterError } = await courseService.addChapter(course.id, {
          chapter_number: chapterData.chapter_number,
          chapter_title: chapterData.chapter_title
        });

        if (chapterError) throw chapterError;

        // Create lessons for this chapter
        for (const lessonData of chapterData.lessons) {
          const { error: lessonError } = await courseService.addLesson(chapter.id, {
            lesson_number: lessonData.lesson_number,
            lesson_title: lessonData.lesson_title
          });

          if (lessonError) throw lessonError;
        }
      }

      toast.success('Course saved as draft!');
      navigate(`/courses/${course.id}`);
    } catch (err) {
      console.error('Error saving course:', err);
      toast.error('Failed to save course. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      // Create course metadata with pending status
      const { data: course, error: courseError } = await courseService.createCourse(user.id, {
        ...courseData,
        status: 'pending' // Will need admin approval
      });

      if (courseError) throw courseError;

      // Create chapters and lessons
      for (const chapterData of chapters) {
        const { data: chapter, error: chapterError } = await courseService.addChapter(course.id, {
          chapter_number: chapterData.chapter_number,
          chapter_title: chapterData.chapter_title
        });

        if (chapterError) throw chapterError;

        // Create lessons for this chapter
        for (const lessonData of chapterData.lessons) {
          const { error: lessonError } = await courseService.addLesson(chapter.id, {
            lesson_number: lessonData.lesson_number,
            lesson_title: lessonData.lesson_title
          });

          if (lessonError) throw lessonError;
        }
      }

      toast.success('Course submitted for review!');
      navigate('/courses');
    } catch (err) {
      console.error('Error submitting course:', err);
      toast.error('Failed to submit course. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!profile || (profile.role !== 'Teacher' && profile.role !== 'Admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400 mb-4">You don't have permission to create courses</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            aria-label="Return to courses page"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Return to courses page"
        >
          <ArrowLeft size={20} aria-hidden="true" />
          <span>Back to Courses</span>
        </button>
      </div>

      <h1 className="text-3xl font-bold text-white mb-8">Create New Course</h1>

      {/* Course Metadata */}
      <div className="glass-effect rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Course Information</h2>
        
        <div className="space-y-4">
          <div>
          <label htmlFor="course-title" className="block text-sm font-medium text-gray-300 mb-2">
            Course Title *
          </label>
          <input
            id="course-title"
            type="text"
            value={courseData.course_title}
            onChange={(e) => handleCourseDataChange('course_title', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter course title"
            required
          />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="masterschool" className="block text-sm font-medium text-gray-300 mb-2">
                Masterschool *
              </label>
              <select
                id="masterschool"
                value={courseData.masterschool}
                onChange={(e) => handleCourseDataChange('masterschool', e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Ignition">Ignition</option>
                <option value="Insight">Insight</option>
                <option value="Transformation">Transformation</option>
                <option value="God Mode">God Mode</option>
              </select>
            </div>

            <div>
              <label htmlFor="difficulty-level" className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty Level
              </label>
              <input
                id="difficulty-level"
                type="text"
                value={courseData.difficulty_level}
                onChange={(e) => handleCourseDataChange('difficulty_level', e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 3D, Focused, Zoomed In"
              />
            </div>
          </div>

          <div>
            <label htmlFor="course-topic" className="block text-sm font-medium text-gray-300 mb-2">
              Topic
            </label>
            <input
              id="course-topic"
              type="text"
              value={courseData.topic}
              onChange={(e) => handleCourseDataChange('topic', e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Course topic"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration-hours" className="block text-sm font-medium text-gray-300 mb-2">
                Duration (hours)
              </label>
              <input
                id="duration-hours"
                type="number"
                value={courseData.duration_hours}
                onChange={(e) => handleCourseDataChange('duration_hours', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="xp-threshold" className="block text-sm font-medium text-gray-300 mb-2">
                XP Threshold
              </label>
              <input
                id="xp-threshold"
                type="number"
                value={courseData.xp_threshold}
                onChange={(e) => handleCourseDataChange('xp_threshold', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chapters and Lessons */}
      <div className="glass-effect rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Course Structure</h2>
          <button
            onClick={handleAddChapter}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            aria-label="Add new chapter to course"
          >
            <Plus size={18} aria-hidden="true" />
            <span>Add Chapter</span>
          </button>
        </div>

        <div className="space-y-4">
          {chapters.map((chapter, chapterIndex) => (
            <div key={chapterIndex} className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <input
                  id={`chapter-${chapterIndex}-title`}
                  type="text"
                  value={chapter.chapter_title}
                  onChange={(e) => handleChapterTitleChange(chapterIndex, e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Chapter ${chapter.chapter_number} Title`}
                  aria-label={`Chapter ${chapter.chapter_number} title`}
                />
                {chapters.length > 1 && (
                  <button
                    onClick={() => handleRemoveChapter(chapterIndex)}
                    className="ml-2 p-2 text-red-400 hover:text-red-300 transition-colors"
                    aria-label={`Remove chapter ${chapter.chapter_number}`}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {chapter.lessons.map((lesson, lessonIndex) => (
                  <div key={lessonIndex} className="flex items-center gap-2">
                    <input
                      id={`chapter-${chapterIndex}-lesson-${lessonIndex}-title`}
                      type="text"
                      value={lesson.lesson_title}
                      onChange={(e) => handleLessonTitleChange(chapterIndex, lessonIndex, e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Lesson ${lesson.lesson_number} Title`}
                      aria-label={`Chapter ${chapter.chapter_number} lesson ${lesson.lesson_number} title`}
                    />
                    {chapter.lessons.length > 1 && (
                      <button
                        onClick={() => handleRemoveLesson(chapterIndex, lessonIndex)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        aria-label={`Remove lesson ${lesson.lesson_number} from chapter ${chapter.chapter_number}`}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => handleAddLesson(chapterIndex)}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  aria-label={`Add lesson to chapter ${chapter.chapter_number}`}
                >
                  <Plus size={14} aria-hidden="true" />
                  <span>Add Lesson</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4">
        <button
          onClick={handleSaveDraft}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          <span>Save Draft</span>
        </button>
        <button
          onClick={handleSubmitForReview}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <Send size={18} />
          <span>Submit for Review</span>
        </button>
      </div>
    </div>
  );
};

export default CourseCreationPage;

