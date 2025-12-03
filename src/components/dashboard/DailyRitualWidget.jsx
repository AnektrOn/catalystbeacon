import React from 'react';
import { Flame } from 'lucide-react';

const DailyRitualWidget = ({ completed = false, streak = 0, xpReward = 50 }) => {
    return (
        <div className="glass-card-premium p-6 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${completed ? 'bg-green-500/10 text-green-500' : 'bg-orange-400/10 text-orange-500'} transition-colors`}>
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
                <button className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-green-400 to-green-600 text-white font-medium text-sm hover:from-green-500 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg">
                    Begin Ritual (+{xpReward} XP)
                </button>
            ) : (
                <div className="w-full py-2 px-4 rounded-lg bg-green-500/10 text-green-600 font-medium text-sm text-center border border-green-500/20">
                    ✓ Completed
                </div>
            )}
        </div>
    );
};

export default DailyRitualWidget;
