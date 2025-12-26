import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import SEOHead from '../components/SEOHead';
import courseService from '../services/courseService';
import schoolService from '../services/schoolService';
import { BookOpen, Lock, Play, Clock, Search, Grid, List, ChevronLeft, ChevronRight, X } from 'lucide-react';

const CourseCatalogPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [coursesBySchool, setCoursesBySchool] = useState({});
  const [schools, setSchools] = useState([]);
  const [schoolUnlockStatus, setSchoolUnlockStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 12;

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Load user progress for all courses in batch if user is logged in
      if (user?.id && data) {
        const coursesWithProgress = { ...data };
        
        // Collect all course IDs
        const allCourseIds = [];
        for (const schoolName in coursesWithProgress) {
          const courses = coursesWithProgress[schoolName];
          courses.forEach(course => {
            if (course.course_id) {
              allCourseIds.push(parseInt(course.course_id));
            }
          });
        }

        // Batch load all progress in a single query
        if (allCourseIds.length > 0) {
          try {
            const { data: allProgress, error: progressError } = await supabase
              .from('user_course_progress')
              .select('course_id, status, progress_percentage, last_accessed_at')
              .eq('user_id', user.id)
              .in('course_id', allCourseIds);

            if (!progressError && allProgress) {
              // Create a map for quick lookup
              const progressMap = new Map();
              allProgress.forEach(progress => {
                progressMap.set(progress.course_id, {
                  status: progress.status,
                  progressPercentage: progress.progress_percentage,
                  lastAccessedAt: progress.last_accessed_at
                });
              });

              // Attach progress to courses
              for (const schoolName in coursesWithProgress) {
                const courses = coursesWithProgress[schoolName];
                courses.forEach(course => {
                  if (course.course_id) {
                    const progress = progressMap.get(parseInt(course.course_id));
                    course.userProgress = progress || null;
                  }
                });
              }
            }
          } catch (err) {
            console.warn('Failed to batch load course progress:', err);
            // Continue without progress - courses will still display
          }
        }
        
        setCoursesBySchool(coursesWithProgress);
      } else {
        setCoursesBySchool(data || {});
      }
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
      'Ignition': { backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', color: 'var(--color-primary)', borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)' },
      'Insight': { backgroundColor: 'color-mix(in srgb, var(--color-kobicha) 20%, transparent)', color: 'var(--color-kobicha)', borderColor: 'color-mix(in srgb, var(--color-kobicha) 30%, transparent)' },
      'Transformation': { backgroundColor: 'color-mix(in srgb, var(--color-secondary) 20%, transparent)', color: 'var(--color-secondary)', borderColor: 'color-mix(in srgb, var(--color-secondary) 30%, transparent)' },
      'God Mode': { backgroundColor: 'color-mix(in srgb, var(--color-earth-green) 20%, transparent)', color: 'var(--color-earth-green)', borderColor: 'color-mix(in srgb, var(--color-earth-green) 30%, transparent)' }
    };
    return colors[school] || { backgroundColor: 'rgba(107, 114, 128, 0.2)', color: '#9CA3AF', borderColor: 'rgba(107, 114, 128, 0.3)' };
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return { color: '#9CA3AF' };
    if (difficulty.includes('3D') || difficulty.includes('Focused')) return { color: 'var(--color-primary)' };
    if (difficulty.includes('Zoomed')) return { color: 'var(--color-earth-green)' };
    return { color: 'var(--color-kobicha)' };
  };

  const userXp = profile?.current_xp || 0;

  // Use schools from state, fallback to course keys if schools not loaded yet
  const displaySchools = schools.length > 0 ? schools : Object.keys(coursesBySchool).map(name => ({ name, isUnlocked: true, requiredXp: 0 }));

  // Flatten all courses for search and pagination
  const allCourses = useMemo(() => {
    const courses = [];
    Object.keys(coursesBySchool).forEach(schoolName => {
      const school = displaySchools.find(s => (typeof s === 'string' ? s : s.name) === schoolName);
      const isSchoolUnlocked = typeof school === 'object' ? school.isUnlocked : (schoolUnlockStatus[schoolName] ?? true);
      
      (coursesBySchool[schoolName] || []).forEach(course => {
        courses.push({
          ...course,
          schoolName,
          isUnlocked: isSchoolUnlocked,
          userProgress: coursesBySchool[schoolName]?.find(c => c.id === course.id)?.userProgress || null
        });
      });
    });
    return courses;
  }, [coursesBySchool, displaySchools, schoolUnlockStatus]);

  // Filter courses by search query and selected school
  const filteredCourses = useMemo(() => {
    let filtered = allCourses;

    // Filter by school
    if (selectedSchool) {
      filtered = filtered.filter(course => course.schoolName === selectedSchool);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.course_title?.toLowerCase().includes(query) ||
        course.topic?.toLowerCase().includes(query) ||
        course.difficulty_level?.toLowerCase().includes(query) ||
        course.schoolName?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allCourses, selectedSchool, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + coursesPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSchool, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
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
            className="px-4 py-2 text-white rounded-lg transition-all duration-300"
            style={{
              backgroundColor: 'var(--color-primary)',
              background: 'var(--gradient-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 90%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <SEOHead 
        title="Course Catalog - The Human Catalyst University"
        description="Browse our comprehensive catalog of transformative courses across Ignition, Insight, Transformation, and God Mode schools"
      />
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2">Course Catalog</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white/20 dark:bg-black/20' 
                  : 'bg-white/10 dark:bg-black/10 hover:bg-white/15'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white/20 dark:bg-black/20' 
                  : 'bg-white/10 dark:bg-black/10 hover:bg-white/15'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search courses by title, topic, or school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-lg glass-effect border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* School Filter Tabs */}
      {displaySchools.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSchool(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedSchool === null
              ? 'text-white'
              : 'bg-white/50 dark:bg-black/20 text-gray-600 dark:text-gray-300'
              }`}
            style={selectedSchool === null ? {
              backgroundColor: 'var(--color-primary)',
              background: 'var(--gradient-primary)'
            } : {}}
            onMouseEnter={selectedSchool !== null ? (e) => {
              e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 10%, transparent)';
            } : undefined}
            onMouseLeave={selectedSchool !== null ? (e) => {
              e.currentTarget.style.backgroundColor = '';
            } : undefined}
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
                  ? 'text-white'
                  : isUnlocked
                    ? 'bg-white/50 dark:bg-black/20 text-gray-600 dark:text-gray-300'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                style={selectedSchool === schoolName ? {
                  backgroundColor: 'var(--color-primary)',
                  background: 'var(--gradient-primary)'
                } : isUnlocked ? {} : {}}
                onMouseEnter={isUnlocked && selectedSchool !== schoolName ? (e) => {
                  e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 10%, transparent)';
                } : undefined}
                onMouseLeave={isUnlocked && selectedSchool !== schoolName ? (e) => {
                  e.currentTarget.style.backgroundColor = '';
                } : undefined}
                title={!isUnlocked ? `Requires ${requiredXp.toLocaleString()} XP to unlock` : ''}
              >
                {schoolName}
                {!isUnlocked && <Lock size={14} className="inline-block ml-2" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Courses Display */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            {searchQuery ? 'No courses found matching your search' : 'No courses available yet'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-primary hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Course Cards */}
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6'
            : 'space-y-3 mb-6'
          }>
            {paginatedCourses.map((course) => {
              const school = displaySchools.find(s => (typeof s === 'string' ? s : s.name) === course.schoolName);
              const schoolRequiredXp = typeof school === 'object' ? school.requiredXp : 0;

              if (viewMode === 'list') {
                return (
                  <div
                    key={course.id}
                    className={`glass-effect rounded-lg p-4 cursor-pointer transition-all hover:scale-[1.01] border flex items-center gap-4 ${
                      !course.isUnlocked ? 'opacity-60' : ''
                    }`}
                    style={{
                      borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)'
                    }}
                    onClick={() => course.isUnlocked && handleCourseClick(course.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-1">
                          {course.course_title}
                        </h3>
                        <span className="px-2 py-1 rounded text-xs font-medium border flex-shrink-0" style={getSchoolColor(course.schoolName)}>
                          {course.schoolName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span style={getDifficultyColor(course.difficulty_level)}>
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
                        {course.topic && (
                          <>
                            <span>•</span>
                            <span>{course.topic}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-white shadow-md flex-shrink-0 ${
                        !course.isUnlocked ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : ''
                      }`}
                      style={course.isUnlocked ? {
                        background: 'var(--gradient-primary)',
                        backgroundColor: 'var(--color-primary)'
                      } : {}}
                      disabled={!course.isUnlocked}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (course.isUnlocked) handleCourseClick(course.id);
                      }}
                    >
                      {course.isUnlocked ? (
                        <>
                          <Play size={16} />
                          {course.userProgress ? 'Continue' : 'Start'}
                        </>
                      ) : (
                        <Lock size={16} />
                      )}
                    </button>
                  </div>
                );
              }

              // Grid view
              return (
                <div
                  key={course.id}
                  className={`glass-effect rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] border relative ${
                    !course.isUnlocked ? 'opacity-60' : ''
                  }`}
                  style={{
                    borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)'
                  }}
                  onMouseEnter={(e) => {
                    if (course.isUnlocked) {
                      e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-primary) 50%, transparent)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-primary) 20%, transparent)';
                  }}
                  onClick={() => course.isUnlocked && handleCourseClick(course.id)}
                >
                  {/* Lock Overlay */}
                  {!course.isUnlocked && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center z-10">
                      <div className="text-center">
                        <Lock size={24} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-300">
                          {schoolRequiredXp.toLocaleString()} XP required
                        </p>
                      </div>
                    </div>
                  )}

                  {/* School Badge */}
                  <div className="mb-3">
                    <span className="px-2 py-1 rounded text-xs font-medium border inline-block" style={getSchoolColor(course.schoolName)}>
                      {course.schoolName}
                    </span>
                  </div>

                  {/* Course Header */}
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2 min-h-[2.5rem]">
                      {course.course_title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span style={getDifficultyColor(course.difficulty_level)}>
                        {course.difficulty_level || 'N/A'}
                      </span>
                      {course.duration_hours > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {course.duration_hours}h
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm text-white shadow-md ${
                      !course.isUnlocked ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : ''
                    }`}
                    style={course.isUnlocked ? {
                      background: 'var(--gradient-primary)',
                      backgroundColor: 'var(--color-primary)'
                    } : {}}
                    disabled={!course.isUnlocked}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (course.isUnlocked) handleCourseClick(course.id);
                    }}
                  >
                    {course.isUnlocked ? (
                      <>
                        <Play size={14} />
                        {course.userProgress ? 'Continue' : 'Start'}
                      </>
                    ) : (
                      <>
                        <Lock size={14} />
                        Locked
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg glass-effect border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-white/20 dark:bg-black/20'
                          : 'glass-effect border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg glass-effect border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseCatalogPage;

