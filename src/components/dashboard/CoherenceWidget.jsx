import React, { memo, useMemo, useCallback } from 'react';
import { Brain, Heart, Zap } from 'lucide-react';

const CoherenceWidget = memo(({ energy = 75, mind = 85, heart = 90 }) => {
    // Memoize overall calculation
    const overall = useMemo(() => Math.round((energy + mind + heart) / 3), [energy, mind, heart]);

    // Memoize color lookup function
    const getColor = useCallback((value) => {
        const root = document.documentElement;
        const computedStyle = window.getComputedStyle(root);
        if (value >= 80) return computedStyle.getPropertyValue('--color-success').trim() || '#6BCF7F';
        if (value >= 60) return computedStyle.getPropertyValue('--color-warning').trim() || '#FFB75B';
        return computedStyle.getPropertyValue('--color-primary').trim() || '#FF8A5B';
    }, []);

    // Memoize color values
    const energyColor = useMemo(() => getColor(energy), [getColor, energy]);
    const mindColor = useMemo(() => getColor(mind), [getColor, mind]);
    const heartColor = useMemo(() => getColor(heart), [getColor, heart]);

    return (
        <div className="glass-card-premium p-6 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
                <div 
                    className="p-3 rounded-xl"
                    style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-secondary) 10%, transparent)',
                        color: 'var(--color-secondary)'
                    }}
                >
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
                            background: `linear-gradient(135deg, ${energyColor}22, ${energyColor}44)`,
                            border: `2px solid ${energyColor}`
                        }}
                    >
                        <Zap size={16} style={{ color: energyColor }} />
                    </div>
                    <div className="text-xs font-medium text-gray-500">{energy}%</div>
                </div>

                <div className="flex-1 text-center">
                    <div
                        className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-1 transition-all duration-500"
                        style={{
                            background: `linear-gradient(135deg, ${mindColor}22, ${mindColor}44)`,
                            border: `2px solid ${mindColor}`
                        }}
                    >
                        <Brain size={16} style={{ color: mindColor }} />
                    </div>
                    <div className="text-xs font-medium text-gray-500">{mind}%</div>
                </div>

                <div className="flex-1 text-center">
                    <div
                        className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-1 transition-all duration-500"
                        style={{
                            background: `linear-gradient(135deg, ${heartColor}22, ${heartColor}44)`,
                            border: `2px solid ${heartColor}`
                        }}
                    >
                        <Heart size={16} style={{ color: heartColor }} />
                    </div>
                    <div className="text-xs font-medium text-gray-500">{heart}%</div>
                </div>
            </div>
        </div>
    );
});

CoherenceWidget.displayName = 'CoherenceWidget';

export default CoherenceWidget;
