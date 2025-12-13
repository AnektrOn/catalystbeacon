import React, { memo } from 'react';
import { Flame } from 'lucide-react';

const DailyRitualWidget = memo(({ completed = false, streak = 0, xpReward = 50 }) => {
    return (
        <div className="glass-card-premium p-6 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
                <div 
                    className="p-3 rounded-xl transition-colors"
                    style={completed ? {
                        backgroundColor: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
                        color: 'var(--color-success)'
                    } : {
                        backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                        color: 'var(--color-primary)'
                    }}
                >
                    <Flame size={20} />
                </div>
                <div className="text-xs font-medium text-gray-400 bg-white/5 px-2 py-1 rounded-lg border border-white/10 uppercase tracking-wider">
                    Ritual
                </div>
            </div>

            <div className="mb-4">
                <div className="text-3xl font-semibold text-gray-900 dark:text-white mb-1">
                    {streak}-day
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {completed ? 'Completed today' : 'streak'}
                </div>
            </div>

            {!completed ? (
                <button 
                    className="w-full py-2 px-4 rounded-lg text-white font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg"
                    style={{ 
                        background: 'var(--gradient-primary)',
                        backgroundColor: 'var(--color-success)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-success) 90%, transparent)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-success)';
                    }}
                >
                    Begin Ritual (+{xpReward} XP)
                </button>
            ) : (
                <div 
                    className="w-full py-2 px-4 rounded-lg font-medium text-sm text-center border transition-all duration-300"
                    style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
                        color: 'var(--color-success)',
                        borderColor: 'color-mix(in srgb, var(--color-success) 20%, transparent)'
                    }}
                >
                    ✓ Completed
                </div>
            )}
        </div>
    );
});

DailyRitualWidget.displayName = 'DailyRitualWidget';

export default DailyRitualWidget;
