import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePageTransition } from '../contexts/PageTransitionContext';
import { Trophy, Star, Zap, BookOpen, Clock, Award } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Achievements = () => {
    const { user, profile } = useAuth();
    const { startTransition, endTransition } = usePageTransition();
    const [loading, setLoading] = useState(true);
    const [achievements, setAchievements] = useState([]);

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

    // Icon mapping for badges
    const getBadgeIcon = useCallback((category, title) => {
        const titleLower = title?.toLowerCase() || '';
        if (titleLower.includes('streak') || titleLower.includes('fire')) return Fire;
        if (titleLower.includes('lesson') || titleLower.includes('book') || titleLower.includes('scholar')) return BookOpen;
        if (titleLower.includes('level') || titleLower.includes('star')) return Trophy;
        if (titleLower.includes('quiz') || titleLower.includes('ace')) return Star;
        if (titleLower.includes('focus') || titleLower.includes('time')) return Clock;
        if (titleLower.includes('first') || titleLower.includes('start')) return Zap;
        return Trophy;
    }, []);

    // Load achievements/badges from Supabase
    useEffect(() => {
        const loadAchievements = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Get all badges
                const { data: allBadges, error: badgesError } = await supabase
                    .from('badges')
                    .select('*')
                    .eq('is_active', true)
                    .order('xp_reward', { ascending: true });

                if (badgesError) throw badgesError;

                // Get user's earned badges
                const { data: userBadges, error: userBadgesError } = await supabase
                    .from('user_badges')
                    .select('badge_id, awarded_at')
                    .eq('user_id', user.id);

                if (userBadgesError) throw userBadgesError;

                const userBadgeIds = new Set((userBadges || []).map(ub => ub.badge_id));
                const userBadgesMap = new Map((userBadges || []).map(ub => [ub.badge_id, ub.awarded_at]));

                // Transform badges to achievements format
                const transformedAchievements = (allBadges || []).map(badge => {
                    const isUnlocked = userBadgeIds.has(badge.id);
                    const criteria = badge.criteria || {};
                    let progress = 0;
                    let total = 1;

                    // Calculate progress based on criteria
                    if (criteria.type === 'habits_completed') {
                        progress = Math.min(profile?.habits_completed_total || 0, criteria.count || 10);
                        total = criteria.count || 10;
                    } else if (criteria.type === 'streak') {
                        progress = Math.min(profile?.completion_streak || 0, criteria.days || 7);
                        total = criteria.days || 7;
                    } else if (criteria.type === 'xp') {
                        progress = Math.min(profile?.current_xp || 0, criteria.amount || 1000);
                        total = criteria.amount || 1000;
                    } else if (criteria.type === 'level') {
                        progress = Math.min(profile?.level || 1, criteria.level || 5);
                        total = criteria.level || 5;
                    } else {
                        // Default: unlocked or not
                        progress = isUnlocked ? 1 : 0;
                        total = 1;
                    }

                    return {
                        id: badge.id,
                        title: badge.title,
                        description: badge.description || '',
                        icon: getBadgeIcon(badge.category, badge.title),
                        xpReward: badge.xp_reward || 0,
                        isUnlocked,
                        unlockedAt: userBadgesMap.get(badge.id) || null,
                        progress,
                        total
                    };
                });

                setAchievements(transformedAchievements);
            } catch (error) {
                console.error('Error loading achievements:', error);
                setAchievements([]);
            } finally {
                setLoading(false);
            }
        };

        loadAchievements();
    }, [user, profile, getBadgeIcon]);

    // Use global loader instead of local loading state
    useEffect(() => {
        if (loading) {
            startTransition();
        } else {
            endTransition();
        }
    }, [loading, startTransition, endTransition]);

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
                            {achievements.length > 0 ? Math.round((achievements.filter(a => a.isUnlocked).length / achievements.length) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Completion</div>
                    </div>
                </div>

                {/* Achievements Grid */}
                {achievements.length === 0 ? (
                    <div className="text-center py-12">
                        <Trophy size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No achievements yet</h3>
                        <p className="text-gray-600 dark:text-gray-400">Start completing tasks to unlock achievements!</p>
                    </div>
                ) : (
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
                )}

            </div>
        </div>
    );
};

export default Achievements;
