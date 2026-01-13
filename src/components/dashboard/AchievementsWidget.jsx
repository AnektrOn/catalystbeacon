import React, { memo } from 'react';
import { Trophy, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AchievementsWidget = memo(({ recentAchievements = [], totalCount = 0, nextUnlock = null }) => {
    const navigate = useNavigate();

    return (
        <div className="glass-card-premium p-6 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
                <div 
                    className="p-3 rounded-ethereal"
                    style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
                        color: 'var(--color-warning)'
                    }}
                >
                    <Trophy size={20} />
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-xs font-medium text-ethereal-text bg-ethereal-glass/50 px-2 py-1 rounded-ethereal-sm border border-ethereal uppercase tracking-wider">
                        Achievements
                    </div>
                    <button
                        onClick={() => navigate('/achievements')}
                        className="text-xs font-medium flex items-center gap-1 transition-colors hover:opacity-80"
                        style={{ color: 'var(--color-warning)' }}
                        aria-label="View all achievements"
                    >
                        View All
                        <ArrowRight size={12} aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <div className="text-3xl font-semibold text-ethereal-white mb-1">
                    {totalCount}
                </div>
                <div className="text-sm text-ethereal-text">
                    unlocked
                </div>
            </div>

            {/* Recent Achievements */}
            {recentAchievements.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                    {recentAchievements.slice(0, 3).map((achievement, index) => (
                        <div
                            key={index}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-ethereal-white shadow-ethereal-base"
                            style={{
                                background: 'var(--gradient-primary)',
                                backgroundColor: 'var(--color-warning)'
                            }}
                            title={achievement.name}
                        >
                            <Trophy size={16} />
                        </div>
                    ))}
                </div>
            )}

            {/* Next Unlock */}
            {nextUnlock && (
                <div className="mt-3 pt-3 border-t border-ethereal">
                    <div className="flex items-center gap-2 mb-2">
                        <Lock size={12} className="text-ethereal-text" />
                        <span className="text-xs text-ethereal-text">Next unlock</span>
                    </div>
                    <div className="w-full h-1.5 bg-ethereal-glass/50 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                                width: `${(nextUnlock.progress / nextUnlock.total) * 100}%`,
                                background: 'var(--gradient-primary)',
                                backgroundColor: 'var(--color-warning)'
                            }}
                        />
                    </div>
                    <div className="text-xs text-ethereal-text mt-1">
                        {nextUnlock.progress}/{nextUnlock.total}
                    </div>
                </div>
            )}
        </div>
    );
});

AchievementsWidget.displayName = 'AchievementsWidget';

export default AchievementsWidget;
