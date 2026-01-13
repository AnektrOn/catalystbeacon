import React, { memo } from 'react';
import { BookOpen, Play, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CurrentLessonWidget = memo(({
    lessonId = null,
    lessonTitle = 'No active lesson',
    courseTitle = '',
    progressPercentage = 0,
    timeRemaining = 0,
    thumbnailUrl = null
}) => {
    const navigate = useNavigate();

    const handleResume = () => {
        if (lessonId) {
            // Navigate to lesson player
            navigate(`/courses/${lessonId}`);
        }
    };

    return (
        <div className="glass-panel-floating p-6 hover:shadow-ethereal-hover transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="text-xs font-medium text-ethereal-text uppercase tracking-wider mb-2">
                        Current Lesson
                    </div>
                    <h3 className="text-xl font-semibold text-ethereal-white mb-1">
                        {lessonTitle}
                    </h3>
                    {courseTitle && (
                        <p className="text-sm text-ethereal-text">
                            {courseTitle}
                        </p>
                    )}
                </div>
                <div 
                    className="p-3 rounded-ethereal"
                    style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-info) 10%, transparent)',
                        color: 'var(--color-info)'
                    }}
                >
                    <BookOpen size={20} />
                </div>
            </div>

            {thumbnailUrl && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4 group cursor-pointer" onClick={handleResume} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleResume()} aria-label={`Resume lesson: ${lessonTitle}`}>
                    <img
                        src={thumbnailUrl}
                        alt={`${lessonTitle} thumbnail`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-ethereal-glass flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play size={20} className="text-ethereal-white ml-1" />
                        </div>
                    </div>
                </div>
            )}

            {lessonId && (
                <>
                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-ethereal-text">Progress</span>
                            <span className="text-xs font-medium" style={{ color: 'var(--color-info)' }}>{progressPercentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-ethereal-glass/50 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                    width: `${progressPercentage}%`,
                                    background: 'var(--gradient-primary)',
                                    backgroundColor: 'var(--color-info)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Time Remaining */}
                    {timeRemaining > 0 && (
                        <div className="flex items-center gap-2 text-sm text-ethereal-text mb-4">
                            <Clock size={14} />
                            <span>{timeRemaining} min remaining</span>
                        </div>
                    )}

                    {/* Resume Button */}
                    <button
                        onClick={handleResume}
                        className="w-full py-3 px-4 rounded-ethereal-sm bg-gradient-to-r from-blue-500 to-blue-600 text-ethereal-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-ethereal-base hover:shadow-ethereal-hover flex items-center justify-center gap-2"
                        aria-label={`Resume lesson: ${lessonTitle}`}
                    >
                        <Play size={16} aria-hidden="true" />
                        Resume Lesson
                    </button>
                </>
            )}

            {!lessonId && (
                <button
                    onClick={() => navigate('/courses')}
                    className="w-full py-3 px-4 rounded-ethereal-sm border-2 border-ethereal text-ethereal-text font-medium transition-all duration-300"
                    style={{
                        borderColor: 'var(--color-info)',
                        color: 'var(--color-info)'
                    }}
                    aria-label="Browse available courses"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-info)';
                        e.currentTarget.style.color = 'var(--color-info)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '';
                        e.currentTarget.style.color = '';
                    }}
                >
                    Browse Courses
                </button>
            )}
        </div>
    );
});

CurrentLessonWidget.displayName = 'CurrentLessonWidget';

export default CurrentLessonWidget;
