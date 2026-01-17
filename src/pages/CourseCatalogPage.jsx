import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePageTransition } from '../contexts/PageTransitionContext';
import { supabase } from '../lib/supabaseClient';
import SEOHead from '../components/SEOHead';
import courseService from '../services/courseService';
import schoolService from '../services/schoolService';
import { BookOpen, Lock, Play, Clock, Search, Grid, List, ChevronLeft, ChevronRight, X, Layers, ChevronDown } from 'lucide-react';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const CourseCatalogPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { startTransition, endTransition } = usePageTransition();
  const navigate = useNavigate();
  const [coursesBySchool, setCoursesBySchool] = useState({});
  const [schools, setSchools] = useState([]);
  const [schoolUnlockStatus, setSchoolUnlockStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null); // masterschool filter
  const [selectedSchoolName, setSelectedSchoolName] = useState(null); // school_name filter
  const [schoolNames, setSchoolNames] = useState([]); // unique school_name values
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', or 'grouped'
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 12;
  const [mobileCardIndex, setMobileCardIndex] = useState(0); // For mobile slideshow
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    // Wait for auth to finish loading before loading data
    if (!authLoading) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const withTimeout = async (promise, ms, label) => {
    let timeoutId;
    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
      });
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  const loadData = async () => {
    // Add timeout to prevent infinite loading
    let timeoutId = null;
    
    try {
      // Avoid re-blocking the entire page if we already have data
      const hasExistingData = coursesBySchool && Object.keys(coursesBySchool).length > 0;
      if (!hasExistingData) setLoading(true);
      setError(null);

      timeoutId = setTimeout(() => {
        setError('Loading is taking longer than expected. Please refresh the page.');
        setLoading(false);
      }, 30000); // 30 second timeout

      // Use the consolidated RPC if user is logged in
      if (user?.id) {
        const { data: consolidatedData, error: consolidatedError } = await courseService.getCourseCatalogDataConsolidated(user.id);
        
        if (consolidatedError) throw consolidatedError;

        const userXp = consolidatedData.user_xp || 0;
        const schoolsData = (consolidatedData.schools || []).map(s => ({
          ...s,
          isUnlocked: userXp >= (s.unlock_xp || 0),
          userXp,
          requiredXp: s.unlock_xp || 0
        }));

        const unlockMap = {};
        schoolsData.forEach((school) => {
          unlockMap[school.name] = !!school.isUnlocked;
        });

        // Group courses by masterschool
        const grouped = {};
        const allCourses = consolidatedData.courses || [];
        const progressMap = new Map();
        (consolidatedData.user_progress || []).forEach(p => {
          progressMap.set(p.course_id, {
            status: p.status,
            progressPercentage: p.progress_percentage,
            lastAccessedAt: p.last_accessed_at
          });
        });

        allCourses.forEach(course => {
          // Normalize masterschool name
          let school = course.masterschool || 'Other';
          if (school.toLowerCase() === 'god mode' || school.toLowerCase() === 'godmode') {
            school = 'God Mode';
          } else if (school) {
            school = school.charAt(0).toUpperCase() + school.slice(1).toLowerCase();
          }

          if (!grouped[school]) {
            grouped[school] = [];
          }
          
          // Attach progress
          const progress = progressMap.get(parseInt(course.course_id));
          course.userProgress = progress || null;
          
          grouped[school].push(course);
        });

        setSchools(schoolsData);
        setSchoolUnlockStatus(unlockMap);
        setCoursesBySchool(grouped);

        // Extract unique school_name values
        const uniqueSchoolNames = new Set();
        allCourses.forEach(course => {
          if (course.school_name) uniqueSchoolNames.add(course.school_name);
        });
        setSchoolNames(Array.from(uniqueSchoolNames).sort());

      } else {
        // Fallback for non-logged in users (traditional way)
        const schoolsRes = await withTimeout(schoolService.getAllSchools(), 8000, 'getAllSchools').catch((err) => {
          return { data: null, error: err };
        });
        const schoolsData = (schoolsRes?.data || []).map(s => ({ ...s, isUnlocked: true }));
        const unlockMap = {};
        schoolsData.forEach(s => unlockMap[s.name] = true);

        const coursesRes = await withTimeout(
          courseService.getCoursesBySchool({}),
          20000,
          'getCoursesBySchool'
        ).catch((err) => {
          return { data: null, error: err };
        });

        const data = coursesRes?.data || {};
        
        setSchools(schoolsData);
        setSchoolUnlockStatus(unlockMap);
        setCoursesBySchool(data);

        const uniqueSchoolNames = new Set();
        Object.values(data).forEach(courses => {
          courses.forEach(course => {
            if (course.school_name) uniqueSchoolNames.add(course.school_name);
          });
        });
        setSchoolNames(Array.from(uniqueSchoolNames).sort());
      }
    } catch (err) {
      setError('Failed to load courses. Please refresh the page.');
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId) => {
    // courseId can be either UUID (id) or course_id (integer)
    navigate(`/courses/${courseId}`);
  };

  const getSchoolColor = (school) => {
    const colors = {
      'Ignition': { backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', color: 'var(--color-primary)', borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)' },
      'Insight': { backgroundColor: 'color-mix(in srgb, var(--color-kobicha) 20%, transparent)', color: 'var(--color-kobicha)', borderColor: 'color-mix(in srgb, var(--color-kobicha) 30%, transparent)' },
      'Transformation': { backgroundColor: 'color-mix(in srgb, var(--color-secondary) 20%, transparent)', color: 'var(--color-secondary)', borderColor: 'color-mix(in srgb, var(--color-secondary) 30%, transparent)' },
      'God Mode': { backgroundColor: 'color-mix(in srgb, var(--color-earth-green) 30%, transparent)', color: 'var(--color-earth-green)', borderColor: 'color-mix(in srgb, var(--color-earth-green) 50%, transparent)', fontWeight: '600' }
    };
    return colors[school] || { backgroundColor: 'rgba(107, 114, 128, 0.2)', color: '#9CA3AF', borderColor: 'rgba(107, 114, 128, 0.3)' };
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return { color: '#9CA3AF' };
    if (difficulty.includes('3D') || difficulty.includes('Focused')) return { color: 'var(--color-primary)' };
    if (difficulty.includes('Zoomed')) return { color: 'var(--color-earth-green)' };
    return { color: 'var(--color-kobicha)' };
  };

  // Background image mapping for school_name (NOT masterschool)
  // This function maps the school_name field from course_metadata to background images
  // 
  // TO ADD BACKGROUND IMAGES:
  // 1. Add your images to public/assets/schools/ directory
  // 2. Uncomment and update the image paths below for each school
  // 3. Use the EXACT school_name value (case-sensitive) as the key
  const getSchoolBackgroundImage = (schoolName) => {
    if (!schoolName) return null;
    
    // Map school_name (from course_metadata.school_name) to background image path
    // Images should be placed in public/assets/schools/ directory
    // Use the EXACT school_name value from your database
    const schoolImageMap = {
      // Institute of Applied Sovereignty (1 course)
      // 'Institute of Applied Sovereignty': '/assets/schools/institute-of-applied-sovereignty-bg.jpg',
      
      // Institute of Behavioral Design (1 course)
      // 'Institute of Behavioral Design': '/assets/schools/institute-of-behavioral-design-bg.jpg',
      
      // Institute of Cognitive Defense (8 courses)
      // 'Institute of Cognitive Defense': '/assets/schools/institute-of-cognitive-defense-bg.jpg',
      
      // Institute of Economic Architecture (23 courses)
      // 'Institute of Economic Architecture': '/assets/schools/institute-of-economic-architecture-bg.jpg',
      
      // Institute of Emotional Integration (5 courses)
      // 'Institute of Emotional Integration': '/assets/schools/institute-of-emotional-integration-bg.jpg',
      
      // Institute of Energetic Anatomy (17 courses)
      // 'Institute of Energetic Anatomy': '/assets/schools/institute-of-energetic-anatomy-bg.jpg',
      
      // Institute of Historical Deconstruction (2 courses)
      // 'Institute of Historical Deconstruction': '/assets/schools/institute-of-historical-deconstruction-bg.jpg',
      
      // Institute of Quantum Mechanics (3 courses)
      // 'Institute of Quantum Mechanics': '/assets/schools/institute-of-quantum-mechanics-bg.jpg',
      
      // Institute of Reality Engineering (1 course)
      // 'Institute of Reality Engineering': '/assets/schools/institute-of-reality-engineering-bg.jpg',
      
      // Institute of Systemic Analysis (3 courses)
      // 'Institute of Systemic Analysis': '/assets/schools/institute-of-systemic-analysis-bg.jpg',
    };
    
    // Return the image path for this school_name, or null if not mapped
    return schoolImageMap[schoolName] || null;
  };

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
          schoolName, // masterschool
          schoolNameField: course.school_name || null, // school_name field
          isUnlocked: isSchoolUnlocked,
          userProgress: course.userProgress || null
        });
      });
    });
    return courses;
  }, [coursesBySchool, displaySchools, schoolUnlockStatus]);

  // Filter courses by search query, masterschool, and school_name
  const filteredCourses = useMemo(() => {
    let filtered = allCourses;

    // Filter by masterschool
    if (selectedSchool) {
      filtered = filtered.filter(course => course.schoolName === selectedSchool);
    }

    // Filter by school_name
    if (selectedSchoolName) {
      filtered = filtered.filter(course => course.schoolNameField === selectedSchoolName);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.course_title?.toLowerCase().includes(query) ||
        course.topic?.toLowerCase().includes(query) ||
        course.difficulty_level?.toLowerCase().includes(query) ||
        course.schoolName?.toLowerCase().includes(query) ||
        course.schoolNameField?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allCourses, selectedSchool, selectedSchoolName, searchQuery]);

  // Group courses by school for grouped view
  const groupedCoursesBySchool = useMemo(() => {
    const grouped = {};
    if (!filteredCourses || filteredCourses.length === 0) {
      return grouped;
    }
    filteredCourses.forEach(course => {
      const schoolName = course.schoolName || 'Other';
      if (!grouped[schoolName]) {
        grouped[schoolName] = [];
      }
      grouped[schoolName].push(course);
    });
    return grouped;
  }, [filteredCourses]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + coursesPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setMobileCardIndex(0); // Reset mobile slideshow index
  }, [selectedSchool, selectedSchoolName, searchQuery]);

  // Swipe handlers for mobile slideshow (only on mobile)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    // Only handle touch on mobile devices
    if (window.innerWidth >= 768) return;
    
    // Prevent touch on buttons and interactive elements
    const target = e.target;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }
    
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    // Only handle touch on mobile devices
    if (window.innerWidth >= 768) return;
    
    // Prevent touch on buttons and interactive elements
    const target = e.target;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }
    
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    // Only handle touch on mobile devices
    if (window.innerWidth >= 768) return;
    
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && mobileCardIndex < paginatedCourses.length - 1) {
      setMobileCardIndex(prev => prev + 1);
    }
    if (isRightSwipe && mobileCardIndex > 0) {
      setMobileCardIndex(prev => prev - 1);
    }
    
    // Reset touch values
    setTouchStart(null);
    setTouchEnd(null);
  };

  const goToNextCard = () => {
    if (mobileCardIndex < paginatedCourses.length - 1) {
      setMobileCardIndex(prev => prev + 1);
    }
  };

  const goToPrevCard = () => {
    if (mobileCardIndex > 0) {
      setMobileCardIndex(prev => prev - 1);
    }
  };

  // Use global loader instead of local loading state
  // useEffect(() => {
  //   if (authLoading || loading) {
  //     startTransition();
  //   } else {
  //     endTransition();
  //   }
  // }, [authLoading, loading, startTransition, endTransition]);

  if (authLoading || (loading && !Object.keys(coursesBySchool).length)) {
    return <SkeletonLoader type="page" />;
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
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto overflow-x-hidden">
      <SEOHead 
        title="Course Catalog - The Human Catalyst Beacon"
        description="Browse our comprehensive catalog of transformative courses across Ignition, Insight, Transformation, and God Mode schools"
      />
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4 mb-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white">Course Catalog</h1>
              {/* View Mode Toggle - Same row as title */}
              <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                viewMode === 'grid' 
                  ? 'bg-white/20 dark:bg-black/20' 
                  : 'bg-white/10 dark:bg-black/10 hover:bg-white/15'
              }`}
              title="Grid View"
            >
              <Grid size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                viewMode === 'list' 
                  ? 'bg-white/20 dark:bg-black/20' 
                  : 'bg-white/10 dark:bg-black/10 hover:bg-white/15'
              }`}
              title="List View"
            >
              <List size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => setViewMode('grouped')}
              className={`p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                viewMode === 'grouped' 
                  ? 'bg-white/20 dark:bg-black/20' 
                  : 'bg-white/10 dark:bg-black/10 hover:bg-white/15'
              }`}
              title="Grouped by School View"
            >
              <Layers size={18} className="sm:w-5 sm:h-5" />
            </button>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
            </p>
          </div>
        </div>

        {/* Search Bar - Mobile Optimized */}
        <div className="relative mb-4 sm:mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 sm:pl-10 sm:pr-10 py-2.5 sm:py-3 rounded-lg glass-effect border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-400 text-sm sm:text-base"
            style={{ color: 'var(--text-primary)' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Masterschool Filter Tabs - Mobile Optimized */}
      {displaySchools.length > 0 && (
        <div className="mb-3 sm:mb-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
            Filter by Masterschool:
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedSchool(null)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors whitespace-nowrap min-h-[44px] flex items-center justify-center ${selectedSchool === null
              ? 'text-white'
              : 'bg-white/50 dark:bg-black/20 text-gray-600 dark:text-gray-300'
              }`}
            style={selectedSchool === null ? {
              backgroundColor: 'var(--color-primary)',
              background: 'var(--gradient-primary)'
            } : {}}
          >
              All Masterschools
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
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap min-h-[44px] flex items-center justify-center ${selectedSchool === schoolName
                  ? 'text-white'
                  : isUnlocked
                    ? 'bg-white/50 dark:bg-black/20 text-gray-600 dark:text-gray-300'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                style={selectedSchool === schoolName ? {
                  backgroundColor: 'var(--color-primary)',
                  background: 'var(--gradient-primary)'
                } : isUnlocked ? {} : {}}
                title={!isUnlocked ? `Requires ${requiredXp.toLocaleString()} XP to unlock` : ''}
              >
                {schoolName}
                {!isUnlocked && <Lock size={12} className="inline-block ml-1.5" />}
              </button>
            );
          })}
          </div>
        </div>
      )}

      {/* School Name Filter Tabs - Mobile Optimized */}
      {schoolNames.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
            Filter by School Name:
          </label>
          
          {/* Mobile Dropdown */}
          <div className="md:hidden">
            <select
              value={selectedSchoolName || ''}
              onChange={(e) => setSelectedSchoolName(e.target.value || null)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg glass-effect border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm sm:text-base text-gray-900 dark:text-white appearance-none cursor-pointer min-h-[44px]"
              style={selectedSchoolName ? {
                backgroundColor: 'var(--color-secondary)',
                background: 'var(--gradient-primary)',
                color: 'white'
              } : {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'inherit'
              }}
            >
              <option value="" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'inherit' }}>
                All School Names
              </option>
              {schoolNames.map((schoolName) => (
                <option 
                  key={schoolName} 
                  value={schoolName}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'inherit' }}
                >
                  {schoolName}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Button Layout */}
          <div className="hidden md:flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSchoolName(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedSchoolName === null
                ? 'text-white'
                : 'bg-white/50 dark:bg-black/20 text-gray-600 dark:text-gray-300'
                }`}
              style={selectedSchoolName === null ? {
                backgroundColor: 'var(--color-secondary)',
                background: 'var(--gradient-primary)'
              } : {}}
            >
              All School Names
            </button>
            {schoolNames.map((schoolName) => (
              <button
                key={schoolName}
                onClick={() => setSelectedSchoolName(schoolName === selectedSchoolName ? null : schoolName)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedSchoolName === schoolName
                  ? 'text-white'
                  : 'bg-white/50 dark:bg-black/20 text-gray-600 dark:text-gray-300'
                  }`}
                style={selectedSchoolName === schoolName ? {
                  backgroundColor: 'var(--color-secondary)',
                  background: 'var(--gradient-primary)'
                } : {}}
              >
                {schoolName}
              </button>
            ))}
          </div>
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
      ) : viewMode === 'grouped' ? (
        <>
          {/* Grouped View by School */}
          {Object.keys(groupedCoursesBySchool).length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                No courses available to display
              </p>
            </div>
          ) : (
            <div className="space-y-8 mb-6">
              {Object.keys(groupedCoursesBySchool).map((schoolName) => {
              const schoolCourses = groupedCoursesBySchool[schoolName];
              const school = displaySchools.find(s => (typeof s === 'string' ? s : s.name) === schoolName);
              const schoolColor = getSchoolColor(schoolName);
              
              return (
                <div key={schoolName} className="space-y-4">
                  {/* School Header */}
                  <div className="flex items-center gap-3 pb-2 border-b" style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
                    <h2 className="text-2xl font-bold" style={{ color: schoolColor.color }}>
                      {schoolName}
                    </h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({schoolCourses.length} {schoolCourses.length === 1 ? 'course' : 'courses'})
                    </span>
                  </div>
                  
                  {/* Courses Grid for this School */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {schoolCourses.map((course) => {
              const schoolRequiredXp = typeof school === 'object' ? school.requiredXp : 0;
                      const courseIdentifier = course.id || course.course_id || course.uuid;
                      const backgroundImage = getSchoolBackgroundImage(course.schoolNameField || course.school_name);

                return (
                  <div
                          key={courseIdentifier}
                          className={`rounded-xl cursor-pointer transition-all hover:scale-[1.02] border-2 relative overflow-hidden ${
                            !course.isUnlocked ? 'opacity-75' : ''
                    }`}
                    style={{
                            minHeight: '280px',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
                          }}
                          onClick={() => course.isUnlocked && handleCourseClick(courseIdentifier)}
                        >
                          {/* Background Image Layer */}
                          {backgroundImage && (
                            <div 
                              className="absolute inset-0 z-0"
                              style={{
                                backgroundImage: `url(${backgroundImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                              }}
                            >
                              {/* Gradient Overlay for Readability */}
                              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />
                            </div>
                          )}

                          {/* Content Layer */}
                          <div className={`relative z-10 flex flex-col h-full min-h-[280px] p-4 ${backgroundImage ? 'text-white' : ''}`}>
                            {/* Lock Overlay */}
                            {!course.isUnlocked && (
                              <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 rounded-xl">
                                <div className="text-center">
                                  <Lock size={28} className="text-white mx-auto mb-2 opacity-80" />
                                  <p className="text-sm font-medium text-white">
                                    {schoolRequiredXp.toLocaleString()} XP required
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* School Badge */}
                            <div className="mb-3">
                              <span 
                                className="px-2 py-1 rounded-lg text-xs font-semibold tracking-wide uppercase border-2 backdrop-blur-md inline-block"
                                style={{
                                  ...getSchoolColor(course.schoolName),
                                  backgroundColor: backgroundImage 
                                    ? `${getSchoolColor(course.schoolName).backgroundColor}80` 
                                    : getSchoolColor(course.schoolName).backgroundColor,
                                  borderColor: getSchoolColor(course.schoolName).borderColor,
                                  color: backgroundImage ? 'white' : getSchoolColor(course.schoolName).color,
                                  textShadow: backgroundImage ? '0 2px 4px rgba(0, 0, 0, 0.3)' : 'none'
                                }}
                              >
                          {course.schoolName}
                        </span>
                      </div>

                            {/* Course Header */}
                            <div className="mb-3 flex-grow">
                              <h3 className={`text-base font-bold mb-2 line-clamp-2 min-h-[2.5rem] ${backgroundImage ? 'text-white drop-shadow-lg' : 'text-gray-800 dark:text-white'}`}>
                                {course.course_title}
                              </h3>
                              <div className={`flex items-center gap-2 text-xs ${backgroundImage ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
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
                              className={`w-full py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm text-white shadow-lg ${
                                !course.isUnlocked 
                                  ? 'bg-gray-500/50 cursor-not-allowed' 
                                  : 'hover:scale-[1.02] active:scale-[0.98]'
                              }`}
                              style={course.isUnlocked ? {
                                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                              } : {}}
                              disabled={!course.isUnlocked}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (course.isUnlocked) handleCourseClick(courseIdentifier);
                              }}
                            >
                              {course.isUnlocked ? (
                                <>
                                  <Play size={16} fill="currentColor" />
                                  {course.userProgress ? 'Continue' : 'Start'}
                                </>
                              ) : (
                                <>
                                  <Lock size={16} />
                                  Locked
                          </>
                        )}
                            </button>
                      </div>
                    </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Mobile Slideshow View (only for grid mode) */}
          {viewMode === 'grid' ? (
            <>
              {/* Mobile Slideshow */}
              <div className="md:hidden mb-6 overflow-x-hidden">
                <div 
                  className="relative overflow-x-hidden"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                  style={{ touchAction: 'pan-y', overflowX: 'hidden' }}
                >
                  {/* Slideshow Container */}
                  <div className="overflow-hidden rounded-2xl" style={{ overflowX: 'hidden' }}>
                    <div 
                      className="flex transition-transform duration-300 ease-in-out"
                      style={{
                        transform: `translateX(-${mobileCardIndex * 100}%)`
                      }}
                    >
                      {paginatedCourses.map((course, index) => {
                        const school = displaySchools.find(s => (typeof s === 'string' ? s : s.name) === course.schoolName);
                        const schoolRequiredXp = typeof school === 'object' ? school.requiredXp : 0;
                        const courseIdentifier = course.id || course.course_id || course.uuid;
                        const backgroundImage = getSchoolBackgroundImage(course.schoolNameField || course.school_name);

              return (
                <div
                            key={courseIdentifier}
                            className="w-full flex-shrink-0 px-3"
                          >
                            <div
                              className={`relative rounded-3xl overflow-hidden cursor-pointer border-2 transition-all ${
                                !course.isUnlocked ? 'opacity-75' : ''
                              }`}
                              style={{
                                minHeight: '520px',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                              }}
                              onClick={() => course.isUnlocked && handleCourseClick(courseIdentifier)}
                            >
                              {/* Background Image Layer */}
                              {backgroundImage && (
                                <div 
                                  className="absolute inset-0 z-0"
                                  style={{
                                    backgroundImage: `url(${backgroundImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                  }}
                                >
                                  {/* Gradient Overlay for Readability */}
                                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />
                                </div>
                              )}

                              {/* Content Layer */}
                              <div className="relative z-10 flex flex-col h-full min-h-[520px] p-6">
                                {/* Lock Overlay */}
                                {!course.isUnlocked && (
                                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 rounded-3xl">
                                    <div className="text-center">
                                      <Lock size={40} className="text-white mx-auto mb-3 opacity-80" />
                                      <p className="text-base font-medium text-white">
                                        {schoolRequiredXp.toLocaleString()} XP required
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Top Section - School Badge */}
                                <div className="mb-5">
                                  <span 
                                    className="px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase border-2 backdrop-blur-md inline-block"
                                    style={{
                                      ...getSchoolColor(course.schoolName),
                                      backgroundColor: `${getSchoolColor(course.schoolName).backgroundColor}80`,
                                      borderColor: getSchoolColor(course.schoolName).borderColor,
                                      color: 'white',
                                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                                    }}
                                  >
                                    {course.schoolName}
                                  </span>
                                </div>

                                {/* Middle Section - Course Content */}
                                <div className="flex-grow flex flex-col justify-end pb-6">
                                  {/* Course Title - Large, Bold, High Contrast */}
                                  <h3 
                                    className="text-3xl font-bold text-white mb-4 leading-tight drop-shadow-lg"
                                    style={{
                                      textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                                      lineHeight: '1.2',
                                      letterSpacing: '-0.02em'
                                    }}
                                  >
                                    {course.course_title}
                                  </h3>

                                  {/* Metadata Row - Secondary Information */}
                                  <div className="flex flex-wrap items-center gap-3 mb-4 text-white/90">
                                    {course.difficulty_level && (
                                      <div className="flex items-center gap-2">
                                        <span 
                                          className="text-sm font-semibold px-3 py-1 rounded-lg backdrop-blur-md"
                                          style={{
                                            ...getDifficultyColor(course.difficulty_level),
                                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                            color: 'white',
                                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                                          }}
                                        >
                                          {course.difficulty_level}
                                        </span>
                                      </div>
                                    )}
                                    {course.duration_hours > 0 && (
                                      <div className="flex items-center gap-2 text-sm font-medium">
                                        <Clock size={16} className="opacity-80" />
                                        <span className="drop-shadow-md">{course.duration_hours}h</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Topic/Description - Tertiary Information */}
                                  {course.topic && (
                                    <p className="text-sm text-white/80 mb-5 leading-relaxed drop-shadow-md line-clamp-2">
                                      {course.topic}
                                    </p>
                                  )}
                                </div>

                                {/* Bottom Section - Action Button */}
                    <button
                                  className={`w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3 text-white shadow-2xl ${
                                    !course.isUnlocked 
                                      ? 'bg-gray-500/50 cursor-not-allowed' 
                                      : 'hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                      style={course.isUnlocked ? {
                                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      } : {}}
                      disabled={!course.isUnlocked}
                      onClick={(e) => {
                        e.stopPropagation();
                                    if (course.isUnlocked) handleCourseClick(courseIdentifier);
                      }}
                                  onTouchStart={(e) => e.stopPropagation()}
                                  onTouchMove={(e) => e.stopPropagation()}
                                  onTouchEnd={(e) => e.stopPropagation()}
                    >
                      {course.isUnlocked ? (
                        <>
                                      <Play size={24} fill="currentColor" />
                                      <span className="tracking-wide">
                                        {course.userProgress ? 'Continue Learning' : 'Start Course'}
                                      </span>
                        </>
                      ) : (
                                    <>
                                      <Lock size={24} />
                                      <span>Locked</span>
                                    </>
                      )}
                    </button>
                              </div>
                            </div>
                  </div>
                );
                      })}
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  {paginatedCourses.length > 1 && (
                    <>
                      <button
                        onClick={goToPrevCard}
                        disabled={mobileCardIndex === 0}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full backdrop-blur-xl border-2 border-white/30 transition-all z-20 ${
                          mobileCardIndex === 0 
                            ? 'opacity-20 cursor-not-allowed' 
                            : 'hover:bg-white/20 hover:scale-110 active:scale-95'
                        }`}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                        }}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                      >
                        <ChevronLeft size={28} className="text-white drop-shadow-lg" strokeWidth={3} />
                      </button>
                      <button
                        onClick={goToNextCard}
                        disabled={mobileCardIndex === paginatedCourses.length - 1}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full backdrop-blur-xl border-2 border-white/30 transition-all z-20 ${
                          mobileCardIndex === paginatedCourses.length - 1 
                            ? 'opacity-20 cursor-not-allowed' 
                            : 'hover:bg-white/20 hover:scale-110 active:scale-95'
                        }`}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                        }}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                      >
                        <ChevronRight size={28} className="text-white drop-shadow-lg" strokeWidth={3} />
                      </button>
                    </>
                  )}

                  {/* Dots Indicator */}
                  {paginatedCourses.length > 1 && (
                    <div className="flex justify-center gap-3 mt-6">
                      {paginatedCourses.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setMobileCardIndex(index)}
                          className={`rounded-full transition-all ${
                            index === mobileCardIndex 
                              ? 'w-10 h-2 bg-white shadow-lg' 
                              : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                          }`}
                          style={{
                            boxShadow: index === mobileCardIndex ? '0 2px 8px rgba(255, 255, 255, 0.5)' : 'none'
                          }}
                          onTouchStart={(e) => e.stopPropagation()}
                          onTouchMove={(e) => e.stopPropagation()}
                          onTouchEnd={(e) => e.stopPropagation()}
                        />
                      ))}
                    </div>
                  )}

                  {/* Card Counter */}
                  <div className="text-center mt-4">
                    <span className="text-sm font-semibold text-white/70 tracking-wide">
                      {mobileCardIndex + 1} <span className="text-white/40">/</span> {paginatedCourses.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Grid View */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {paginatedCourses.map((course) => {
                  const school = displaySchools.find(s => (typeof s === 'string' ? s : s.name) === course.schoolName);
                  const schoolRequiredXp = typeof school === 'object' ? school.requiredXp : 0;
                  const courseIdentifier = course.id || course.course_id || course.uuid;
                  const backgroundImage = getSchoolBackgroundImage(course.schoolNameField || course.school_name);

              return (
                <div
                      key={courseIdentifier}
                      className={`rounded-xl cursor-pointer transition-all hover:scale-[1.02] border-2 relative overflow-hidden ${
                        !course.isUnlocked ? 'opacity-75' : ''
                  }`}
                  style={{
                        minHeight: '280px',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
                  }}
                      onClick={() => course.isUnlocked && handleCourseClick(courseIdentifier)}
                    >
                      {/* Background Image Layer */}
                      {backgroundImage && (
                        <div 
                          className="absolute inset-0 z-0"
                          style={{
                            backgroundImage: `url(${backgroundImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        >
                          {/* Gradient Overlay for Readability */}
                          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />
                        </div>
                      )}

                      {/* Content Layer */}
                      <div className={`relative z-10 flex flex-col h-full min-h-[280px] p-4 ${backgroundImage ? 'text-white' : ''}`}>
                  {/* Lock Overlay */}
                  {!course.isUnlocked && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 rounded-xl">
                      <div className="text-center">
                              <Lock size={28} className="text-white mx-auto mb-2 opacity-80" />
                              <p className="text-sm font-medium text-white">
                          {schoolRequiredXp.toLocaleString()} XP required
                        </p>
                      </div>
                    </div>
                  )}

                  {/* School Badge */}
                  <div className="mb-3">
                          <span 
                            className="px-2 py-1 rounded-lg text-xs font-semibold tracking-wide uppercase border-2 backdrop-blur-md inline-block"
                            style={{
                              ...getSchoolColor(course.schoolName),
                              backgroundColor: backgroundImage 
                                ? `${getSchoolColor(course.schoolName).backgroundColor}80` 
                                : getSchoolColor(course.schoolName).backgroundColor,
                              borderColor: getSchoolColor(course.schoolName).borderColor,
                              color: backgroundImage ? 'white' : getSchoolColor(course.schoolName).color,
                              textShadow: backgroundImage ? '0 2px 4px rgba(0, 0, 0, 0.3)' : 'none'
                            }}
                          >
                      {course.schoolName}
                    </span>
                  </div>

                  {/* Course Header */}
                        <div className="mb-3 flex-grow">
                          <h3 className={`text-base font-bold mb-2 line-clamp-2 min-h-[2.5rem] ${backgroundImage ? 'text-white drop-shadow-lg' : 'text-gray-800 dark:text-white'}`}>
                      {course.course_title}
                    </h3>
                          <div className={`flex items-center gap-2 text-xs ${backgroundImage ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
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
                          className={`w-full py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm text-white shadow-lg ${
                            !course.isUnlocked 
                              ? 'bg-gray-500/50 cursor-not-allowed' 
                              : 'hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                    style={course.isUnlocked ? {
                            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    } : {}}
                    disabled={!course.isUnlocked}
                    onClick={(e) => {
                      e.stopPropagation();
                            if (course.isUnlocked) handleCourseClick(courseIdentifier);
                    }}
                  >
                    {course.isUnlocked ? (
                      <>
                              <Play size={16} fill="currentColor" />
                        {course.userProgress ? 'Continue' : 'Start'}
                      </>
                    ) : (
                      <>
                              <Lock size={16} />
                        Locked
                      </>
                    )}
                  </button>
                      </div>
                </div>
              );
            })}
          </div>
            </>
          ) : (
            /* List View */
            <div className="space-y-3 mb-6">
              {paginatedCourses.map((course) => {
                const school = displaySchools.find(s => (typeof s === 'string' ? s : s.name) === course.schoolName);
                const schoolRequiredXp = typeof school === 'object' ? school.requiredXp : 0;
                const courseIdentifier = course.id || course.course_id || course.uuid;
                const backgroundImage = getSchoolBackgroundImage(course.schoolNameField || course.school_name);

                return (
                  <div
                    key={courseIdentifier}
                    className={`rounded-xl cursor-pointer transition-all hover:scale-[1.01] border-2 relative overflow-hidden flex items-center gap-4 ${
                      !course.isUnlocked ? 'opacity-75' : ''
                    }`}
                    style={{
                      minHeight: '120px',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                    onClick={() => course.isUnlocked && handleCourseClick(courseIdentifier)}
                  >
                    {/* Background Image Layer */}
                    {backgroundImage && (
                      <div 
                        className="absolute inset-0 z-0"
                        style={{
                          backgroundImage: `url(${backgroundImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      >
                        {/* Gradient Overlay for Readability */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/50 to-black/70" />
                      </div>
                    )}

                    {/* Content Layer */}
                    <div className={`relative z-10 flex-1 min-w-0 p-4 flex items-center gap-4 ${backgroundImage ? 'text-white' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className={`text-lg font-bold line-clamp-1 ${backgroundImage ? 'text-white drop-shadow-lg' : 'text-gray-800 dark:text-white'}`}>
                            {course.course_title}
                          </h3>
                          <span 
                            className="px-2 py-1 rounded-lg text-xs font-semibold tracking-wide uppercase border-2 backdrop-blur-md flex-shrink-0"
                            style={{
                              ...getSchoolColor(course.schoolName),
                              backgroundColor: backgroundImage 
                                ? `${getSchoolColor(course.schoolName).backgroundColor}80` 
                                : getSchoolColor(course.schoolName).backgroundColor,
                              borderColor: getSchoolColor(course.schoolName).borderColor,
                              color: backgroundImage ? 'white' : getSchoolColor(course.schoolName).color,
                              textShadow: backgroundImage ? '0 2px 4px rgba(0, 0, 0, 0.3)' : 'none'
                            }}
                          >
                            {course.schoolName}
                          </span>
                        </div>
                        <div className={`flex items-center gap-3 text-sm ${backgroundImage ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
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
                        className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-white shadow-lg flex-shrink-0 ${
                          !course.isUnlocked ? 'bg-gray-500/50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                        }`}
                        style={course.isUnlocked ? {
                          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        } : {}}
                        disabled={!course.isUnlocked}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (course.isUnlocked) handleCourseClick(courseIdentifier);
                        }}
                      >
                        {course.isUnlocked ? (
                          <>
                            <Play size={16} fill="currentColor" />
                            {course.userProgress ? 'Continue' : 'Start'}
                          </>
                        ) : (
                          <Lock size={16} />
                        )}
                      </button>
                    </div>

                    {/* Lock Overlay */}
                    {!course.isUnlocked && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 rounded-xl">
                        <div className="text-center">
                          <Lock size={24} className="text-white mx-auto mb-2 opacity-80" />
                          <p className="text-xs font-medium text-white">
                            {schoolRequiredXp.toLocaleString()} XP required
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {viewMode !== 'grouped' && totalPages > 1 && (
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

