import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Lock, Star, Zap, Target, BookOpen, Clock, Award } from 'lucide-react';

const Achievements = () => {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(true);

    // Helper component for icon rendering to avoid reference errors if icon is missing
    const Fire = ({ size, className }) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.5-3.3.3-1.1 1-2.2 1.5-3.2.5 1 1 2 1.5 3z"></path>
        </svg>
    );

    // Mock Achievements Data (replace with DB fetch later)
    const achievements = [
        {
            id: 'first_login',
            title: 'First Step',
            description: 'Log in to the platform for the first time.',
            icon: Zap,
            xpReward: 10,
            isUnlocked: true,
            unlockedAt: '2023-10-25'
        },
        {
            id: 'first_lesson',
            title: 'Scholar',
            description: 'Complete your first lesson.',
            icon: BookOpen,
            xpReward: 50,
            isUnlocked: profile?.current_xp > 50, // Simple mock logic
            progress: 1,
            total: 1
        },
        {
            id: 'focus_master',
            title: 'Focus Master',
            description: 'Complete a 25-minute focus session.',
            icon: Clock,
            xpReward: 100,
            isUnlocked: false,
            progress: 0,
            total: 25
        },
        {
            id: 'streak_7',
            title: 'Unstoppable',
            description: 'Maintain a 7-day login streak.',
            icon: Fire,
            xpReward: 500,
            isUnlocked: false,
            progress: 3,
            total: 7
        },
        {
            id: 'quiz_ace',
            title: 'Quiz Ace',
            description: 'Score 100% on a quiz.',
            icon: Star,
            xpReward: 200,
            isUnlocked: false,
            progress: 0,
            total: 1
        },
        {
            id: 'level_5',
            title: 'Rising Star',
            description: 'Reach Level 5.',
            icon: Trophy,
            xpReward: 1000,
            isUnlocked: (profile?.level || 1) >= 5,
            progress: profile?.level || 1,
            total: 5
        }
    ];

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 800);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B4833D]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 pt-6 px-4 lg:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-10 text-center lg:text-left">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 font-heading">
                        Achievements
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                        Track your milestones and earn rewards as you progress.
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="glass-card-premium p-6 text-center">
                        <div className="text-3xl font-bold text-[#B4833D] mb-1">
                            {achievements.filter(a => a.isUnlocked).length}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Unlocked</div>
                    </div>
                    <div className="glass-card-premium p-6 text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            {achievements.length}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Total</div>
                    </div>
                    <div className="glass-card-premium p-6 text-center">
                        <div className="text-3xl font-bold text-[#B4833D] mb-1">
                            {achievements.filter(a => a.isUnlocked).reduce((acc, curr) => acc + curr.xpReward, 0)}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">XP Earned</div>
                    </div>
                    <div className="glass-card-premium p-6 text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            {Math.round((achievements.filter(a => a.isUnlocked).length / achievements.length) * 100)}%
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Completion</div>
                    </div>
                </div>

                {/* Achievements Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((achievement) => {
                        const Icon = achievement.icon || Trophy;

                        return (
                            <div
                                key={achievement.id}
                                className={`glass-panel-floating p-6 relative overflow-hidden transition-all duration-300 ${achievement.isUnlocked
                                    ? 'hover:-translate-y-1 hover:shadow-[#B4833D]/20'
                                    : 'opacity-70 grayscale-[0.5]'
                                    }`}
                            >
                                {/* Background Glow for Unlocked */}
                                {achievement.isUnlocked && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#B4833D]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                                )}

                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${achievement.isUnlocked
                                        ? 'bg-gradient-to-br from-[#B4833D] to-[#81754B] text-white shadow-lg'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                        }`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${achievement.isUnlocked
                                        ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                        }`}>
                                        {achievement.isUnlocked ? 'Unlocked' : 'Locked'}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {achievement.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 min-h-[40px]">
                                    {achievement.description}
                                </p>

                                {/* Progress Bar (if applicable and not fully unlocked, or just visual) */}
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                                        <span>Progress</span>
                                        <span>{achievement.isUnlocked ? '100%' : `${Math.round((achievement.progress / achievement.total) * 100)}%`}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${achievement.isUnlocked ? 'bg-[#B4833D]' : 'bg-gray-400'
                                                }`}
                                            style={{ width: achievement.isUnlocked ? '100%' : `${(achievement.progress / achievement.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                                    <Award size={16} className={achievement.isUnlocked ? 'text-[#B4833D]' : 'text-gray-400'} />
                                    <span className={`text-sm font-bold ${achievement.isUnlocked ? 'text-[#B4833D]' : 'text-gray-500'}`}>
                                        {achievement.xpReward} XP
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default Achievements;
