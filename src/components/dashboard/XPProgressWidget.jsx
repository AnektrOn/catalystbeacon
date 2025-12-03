import React from 'react';
import { Zap } from 'lucide-react';

const XPProgressWidget = ({ level = 1, currentXP = 0, nextLevelXP = 1000, phase = 'ignition' }) => {
    const percentage = Math.min((currentXP / nextLevelXP) * 100, 100);

    const phaseColors = {
        ignition: '#FF8A5B',
        insight: '#A78BFA',
        transformation: '#6BCF7F',
        god_mode: '#FFD700'
    };

    const color = phaseColors[phase] || phaseColors.ignition;

    return (
        <div className="glass-card-premium p-6 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-400/10 to-orange-600/10 text-orange-500">
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
};

export default XPProgressWidget;
