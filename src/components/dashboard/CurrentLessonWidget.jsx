import React from 'react';
import { BookOpen, Play, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CurrentLessonWidget = ({
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
        <div className="glass-panel-floating p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                        Current Lesson
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {lessonTitle}
                    </h3>
                    {courseTitle && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {courseTitle}
                        </p>
                    )}
                </div>
                <div className="p-3 rounded-xl bg-blue-400/10 text-blue-500">
                    <BookOpen size={20} />
                </div>
            </div>

            {thumbnailUrl && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4 group cursor-pointer" onClick={handleResume}>
                    <img
                        src={thumbnailUrl}
                        alt={lessonTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play size={20} className="text-gray-900 ml-1" />
                        </div>
                    </div>
                </div>
            )}

            {lessonId && (
                <>
                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Progress</span>
                            <span className="text-xs font-medium text-blue-500">{progressPercentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Time Remaining */}
                    {timeRemaining > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <Clock size={14} />
                            <span>{timeRemaining} min remaining</span>
                        </div>
                    )}

                    {/* Resume Button */}
                    <button
                        onClick={handleResume}
                        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        <Play size={16} />
                        Resume Lesson
                    </button>
                </>
            )}

            {!lessonId && (
                <button
                    onClick={() => navigate('/courses')}
                    className="w-full py-3 px-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:border-blue-500 hover:text-blue-500 transition-all duration-300"
                >
                    Browse Courses
                </button>
            )}
        </div>
    );
};

export default CurrentLessonWidget;
