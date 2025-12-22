import React, { memo, useMemo } from 'react';
import { Zap } from 'lucide-react';

const XPProgressWidget = memo(({ level = 1, levelTitle = '', currentXP = 0, nextLevelXP = 1000, phase = 'ignition' }) => {
    // Memoize percentage calculation
    const percentage = useMemo(() => 
        nextLevelXP > 0 ? Math.min((currentXP / nextLevelXP) * 100, 100) : 0,
        [currentXP, nextLevelXP]
    );

    // Memoize phase color lookup
    const color = useMemo(() => {
        const root = document.documentElement;
        const computedStyle = window.getComputedStyle(root);
        const colors = {
            ignition: computedStyle.getPropertyValue('--color-primary').trim() || '#FF8A5B',
            insight: computedStyle.getPropertyValue('--color-secondary').trim() || '#A78BFA',
            transformation: computedStyle.getPropertyValue('--color-success').trim() || '#6BCF7F',
            god_mode: computedStyle.getPropertyValue('--color-warning').trim() || '#FFD700'
        };
        return colors[phase] || colors.ignition;
    }, [phase]);

    return (
        <div className="glass-card-premium p-6 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
                <div 
                    className="p-3 rounded-xl"
                    style={{
                        background: `linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 10%, transparent), color-mix(in srgb, var(--color-primary) 20%, transparent))`,
                        color: 'var(--color-primary)'
                    }}
                >
                    <Zap size={20} />
                </div>
                <div className="text-xs font-medium text-gray-400 bg-white/5 px-2 py-1 rounded-lg border border-white/10 uppercase tracking-wider">
                    Level
                </div>
            </div>

            <div className="mb-4">
                <div className="text-3xl font-semibold text-gray-900 dark:text-white mb-1">
                    Level {level}
                </div>
                {levelTitle && (
                    <div className="text-sm font-medium mb-2" style={{ color: 'var(--color-primary)' }}>
                        {levelTitle}
                    </div>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
                </div>
            </div>

            {/* Progress Ring */}
            <div className="relative w-full">
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                            width: `${percentage}%`,
                            background: `linear-gradient(90deg, ${color}, ${color}dd)`
                        }}
                    />
                </div>
                <div className="mt-2 text-xs text-right font-medium" style={{ color }}>
                    {percentage.toFixed(0)}%
                </div>
            </div>
        </div>
    );
});

XPProgressWidget.displayName = 'XPProgressWidget';

export default XPProgressWidget;
