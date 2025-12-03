import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import courseService from '../services/courseService';
import schoolService from '../services/schoolService';
import { BookOpen, Lock, Play, Star, Clock, TrendingUp } from 'lucide-react';

const CourseCatalogPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [coursesBySchool, setCoursesBySchool] = useState({});
  const [schools, setSchools] = useState([]);
  const [schoolUnlockStatus, setSchoolUnlockStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load schools with unlock status
      if (user?.id) {
        const { data: schoolsData, error: schoolsError } = await schoolService.getSchoolsWithUnlockStatus(user.id);
        if (schoolsError) throw schoolsError;

        setSchools(schoolsData || []);

        // Create a map of school unlock status
        const unlockMap = {};
        schoolsData?.forEach(school => {
          unlockMap[school.name] = school.isUnlocked;
        });
        setSchoolUnlockStatus(unlockMap);
      } else {
        // If no user, just get all schools
        const { data: schoolsData } = await schoolService.getAllSchools();
        setSchools(schoolsData || []);
      }

      // Load courses (filtered by unlocked schools if user is logged in)
      const filters = user?.id ? { userId: user.id } : {};
      const { data, error: fetchError } = await courseService.getCoursesBySchool(filters);

      if (fetchError) throw fetchError;

      setCoursesBySchool(data || {});
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
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

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return 'text-gray-400';
    if (difficulty.includes('3D') || difficulty.includes('Focused')) return 'text-[#B4833D]';
    if (difficulty.includes('Zoomed')) return 'text-[#3F3F2C] dark:text-[#F7F1E1]';
    return 'text-[#66371B] dark:text-[#E3D8C1]';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B4833D] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-[#B4833D] text-white rounded-lg hover:bg-[#B4833D]/80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const userXp = profile?.current_xp || 0;

  // Use schools from state, fallback to course keys if schools not loaded yet
  const displaySchools = schools.length > 0 ? schools : Object.keys(coursesBySchool).map(name => ({ name, isUnlocked: true, requiredXp: 0 }));

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2">Course Catalog</h1>
        <p className="text-gray-600 dark:text-gray-400">Explore courses organized by school</p>
      </div>

      {/* School Filter Tabs */}
      {displaySchools.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSchool(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedSchool === null
              ? 'bg-[#B4833D] text-white'
              : 'bg-white/50 dark:bg-black/20 text-gray-600 dark:text-gray-300 hover:bg-[#B4833D]/10'
              }`}
          >
            All Schools
          </button>
          {displaySchools.map((school) => {
            const schoolName = typeof school === 'string' ? school : school.name;
            const isUnlocked = typeof school === 'object' ? school.isUnlocked : (schoolUnlockStatus[schoolName] ?? true);
            const requiredXp = typeof school === 'object' ? school.requiredXp : 0;

            return (
              <button
                key={schoolName}
                onClick={() => isUnlocked && setSelectedSchool(schoolName)}
                disabled={!isUnlocked}
                className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${selectedSchool === schoolName
                  ? 'bg-[#B4833D] text-white'
                  : isUnlocked
                    ? 'bg-white/50 dark:bg-black/20 text-gray-600 dark:text-gray-300 hover:bg-[#B4833D]/10'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                title={!isUnlocked ? `Requires ${requiredXp.toLocaleString()} XP to unlock` : ''}
              >
                {schoolName}
                {!isUnlocked && <Lock size={14} className="inline-block ml-2" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Courses by School */}
      {displaySchools.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No courses available yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {displaySchools
            .filter(school => {
              const schoolName = typeof school === 'string' ? school : school.name;
              return !selectedSchool || schoolName === selectedSchool;
            })
            .map((school) => {
              const schoolName = typeof school === 'string' ? school : school.name;
              const isSchoolUnlocked = typeof school === 'object' ? school.isUnlocked : (schoolUnlockStatus[schoolName] ?? true);
              const schoolRequiredXp = typeof school === 'object' ? school.requiredXp : 0;
              const courses = coursesBySchool[schoolName] || [];

              return (
                <div
                  key={schoolName}
                  className={`glass-card ${!isSchoolUnlocked ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <BookOpen size={24} className="text-[#B4833D]" />
                        {schoolName}
                      </h2>
                      {!isSchoolUnlocked && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-500 border border-red-500/30 flex items-center gap-2">
                          <Lock size={14} />
                          Locked - {schoolRequiredXp.toLocaleString()} XP Required
                        </span>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSchoolColor(schoolName)}`}>
                      {courses.length} {courses.length === 1 ? 'course' : 'courses'}
                    </span>
                  </div>

                  {!isSchoolUnlocked ? (
                    <div className="text-center py-12 bg-black/5 rounded-xl">
                      <Lock size={48} className="text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">This school is locked</p>
                      <p className="text-gray-500 text-sm">
                        You need {schoolRequiredXp.toLocaleString()} XP to unlock {schoolName}
                      </p>
                      <p className="text-gray-600 text-xs mt-2">
                        You currently have {userXp.toLocaleString()} XP
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                      {courses.map((course) => {
                        // Course is unlocked if school is unlocked
                        const isUnlocked = isSchoolUnlocked;
                        const userProgress = null; // TODO: Load user progress

                        return (
                          <div
                            key={course.id}
                            className={`glass-effect rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.02] border border-[#B4833D]/20 hover:border-[#B4833D]/50 ${!isUnlocked ? 'opacity-60' : ''
                              }`}
                            onClick={() => isUnlocked && handleCourseClick(course.id)}
                          >
                            {/* Lock Overlay */}
                            {!isUnlocked && (
                              <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center z-10">
                                <div className="text-center">
                                  <Lock size={32} className="text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-300">
                                    School locked: {schoolRequiredXp.toLocaleString()} XP required
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Course Header */}
                            <div className="mb-4">
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                                {course.course_title}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className={getDifficultyColor(course.difficulty_level)}>
                                  {course.difficulty_level || 'N/A'}
                                </span>
                                {course.duration_hours > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Clock size={14} />
                                      {course.duration_hours}h
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Course Info */}
                            <div className="space-y-2 mb-4">
                              {course.topic && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Topic: <span className="text-gray-700 dark:text-gray-300">{course.topic}</span>
                                </div>
                              )}
                            </div>

                            {/* Action Button */}
                            <button
                              className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isUnlocked
                                ? 'bg-gradient-to-r from-[#B4833D] to-[#81754B] hover:from-[#B4833D]/90 hover:to-[#81754B]/90 text-white shadow-md'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                }`}
                              disabled={!isUnlocked}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isUnlocked) handleCourseClick(course.id);
                              }}
                            >
                              {isUnlocked ? (
                                <>
                                  <Play size={16} />
                                  {userProgress ? 'Continue' : 'Start Course'}
                                </>
                              ) : (
                                <>
                                  <Lock size={16} />
                                  Locked
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default CourseCatalogPage;

