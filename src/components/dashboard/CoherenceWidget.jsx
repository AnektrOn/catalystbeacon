import React, { memo } from 'react';
import { Brain, Heart, Zap } from 'lucide-react';

const CoherenceWidget = memo(({ energy = 75, mind = 85, heart = 90 }) => {
    const overall = Math.round((energy + mind + heart) / 3);

    const getColor = (value) => {
        if (value >= 80) return '#6BCF7F';
        if (value >= 60) return '#FFB75B';
        return '#FF8A5B';
    };

    return (
        <div className="glass-card-premium p-6 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-400/10 text-purple-500">
                    <Brain size={20} />
                </div>
                <div className="text-xs font-medium text-gray-400 bg-white/5 px-2 py-1 rounded-lg border border-white/10 uppercase tracking-wider">
                    Coherence
                </div>
            </div>

            <div className="mb-4">
                <div className="text-3xl font-semibold text-gray-900 dark:text-white mb-1">
                    {overall}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Overall balance
                </div>
            </div>

            {/* Three Brains Indicators */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1 text-center">
                    <div
                        className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-1 transition-all duration-500"
                        style={{
                            background: `linear-gradient(135deg, ${getColor(energy)}22, ${getColor(energy)}44)`,
                            border: `2px solid ${getColor(energy)}`
                        }}
                    >
                        <Zap size={16} style={{ color: getColor(energy) }} />
                    </div>
                    <div className="text-xs font-medium text-gray-500">{energy}%</div>
                </div>

                <div className="flex-1 text-center">
                    <div
                        className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-1 transition-all duration-500"
                        style={{
                            background: `linear-gradient(135deg, ${getColor(mind)}22, ${getColor(mind)}44)`,
                            border: `2px solid ${getColor(mind)}`
                        }}
                    >
                        <Brain size={16} style={{ color: getColor(mind) }} />
                    </div>
                    <div className="text-xs font-medium text-gray-500">{mind}%</div>
                </div>

                <div className="flex-1 text-center">
                    <div
                        className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-1 transition-all duration-500"
                        style={{
                            background: `linear-gradient(135deg, ${getColor(heart)}22, ${getColor(heart)}44)`,
                            border: `2px solid ${getColor(heart)}`
                        }}
                    >
                        <Heart size={16} style={{ color: getColor(heart) }} />
                    </div>
                    <div className="text-xs font-medium text-gray-500">{heart}%</div>
                </div>
            </div>
        </div>
    );
});

CoherenceWidget.displayName = 'CoherenceWidget';

export default CoherenceWidget;
