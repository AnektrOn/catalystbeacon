import React, { memo } from 'react';
import { Trophy, Lock } from 'lucide-react';

const AchievementsWidget = memo(({ recentAchievements = [], totalCount = 0, nextUnlock = null }) => {
    return (
        <div className="glass-card-premium p-6 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-yellow-400/10 text-yellow-600">
                    <Trophy size={20} />
                </div>
                <div className="text-xs font-medium text-gray-400 bg-white/5 px-2 py-1 rounded-lg border border-white/10 uppercase tracking-wider">
                    Achievements
                </div>
            </div>

            <div className="mb-4">
                <div className="text-3xl font-semibold text-gray-900 dark:text-white mb-1">
                    {totalCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    unlocked
                </div>
            </div>

            {/* Recent Achievements */}
            {recentAchievements.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                    {recentAchievements.slice(0, 3).map((achievement, index) => (
                        <div
                            key={index}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white shadow-lg"
                            title={achievement.name}
                        >
                            <Trophy size={16} />
                        </div>
                    ))}
                </div>
            )}

            {/* Next Unlock */}
            {nextUnlock && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <Lock size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Next unlock</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-500"
                            style={{ width: `${(nextUnlock.progress / nextUnlock.total) * 100}%` }}
                        />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {nextUnlock.progress}/{nextUnlock.total}
                    </div>
                </div>
            )}
        </div>
    );
});

AchievementsWidget.displayName = 'AchievementsWidget';

export default AchievementsWidget;
