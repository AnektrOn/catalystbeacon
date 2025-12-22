import React, { useMemo } from 'react';
import { BarChart3, X, TrendingUp, Award, Clock } from 'lucide-react';

/**
 * Analytics and Insights Panel
 */
const StellarMapAnalytics = ({
  hierarchyData,
  completionMap,
  currentCore,
  userXP,
  visible = false,
  onClose
}) => {
  const stats = useMemo(() => {
    let totalNodes = 0;
    let completedNodes = 0;
    let totalXP = 0;
    const difficultyDistribution = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
    const constellationStats = [];

    Object.entries(hierarchyData).forEach(([familyName, constellations]) => {
      Object.entries(constellations).forEach(([constellationName, nodes]) => {
        const constellationCompleted = nodes.filter(node => {
          const comp = completionMap.get(node.id);
          return comp?.completed || false;
        }).length;
        
        constellationStats.push({
          name: constellationName,
          family: familyName,
          total: nodes.length,
          completed: constellationCompleted,
          progress: nodes.length > 0 ? (constellationCompleted / nodes.length) * 100 : 0
        });

        nodes.forEach(node => {
          totalNodes++;
          const comp = completionMap.get(node.id);
          if (comp?.completed) {
            completedNodes++;
            totalXP += comp.xpAwarded || 0;
          }
          const diff = node.difficulty || 0;
          if (difficultyDistribution[diff] !== undefined) {
            difficultyDistribution[diff]++;
          }
        });
      });
    });

    return {
      totalNodes,
      completedNodes,
      completionRate: totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0,
      totalXP,
      difficultyDistribution,
      constellationStats: constellationStats.sort((a, b) => b.progress - a.progress)
    };
  }, [hierarchyData, completionMap]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 right-4 z-40 bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 p-4 shadow-lg max-w-sm max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <BarChart3 size={18} />
          Analytics
        </h3>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
          aria-label="Close analytics"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4 text-sm">
        {/* Overall Stats */}
        <div className="bg-white/5 rounded p-3">
          <h4 className="text-white/90 font-medium mb-2">Overall Progress</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-white/70">
              <span>Total Nodes:</span>
              <span className="font-semibold text-white">{stats.totalNodes}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Completed:</span>
              <span className="font-semibold text-green-400">{stats.completedNodes}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Completion Rate:</span>
              <span className="font-semibold text-primary">{stats.completionRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>XP Earned:</span>
              <span className="font-semibold text-yellow-400">{stats.totalXP}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Difficulty Distribution */}
        <div>
          <h4 className="text-white/90 font-medium mb-2 flex items-center gap-2">
            <TrendingUp size={14} />
            Difficulty Distribution
          </h4>
          <div className="space-y-1">
            {Object.entries(stats.difficultyDistribution).map(([diff, count]) => (
              <div key={diff} className="flex items-center gap-2">
                <span className="text-white/60 text-xs w-8">Lv.{diff}:</span>
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(count / stats.totalNodes) * 100}%` }}
                  />
                </div>
                <span className="text-white/70 text-xs w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Constellations */}
        <div>
          <h4 className="text-white/90 font-medium mb-2 flex items-center gap-2">
            <Award size={14} />
            Top Constellations
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stats.constellationStats.slice(0, 5).map((constellation, idx) => (
              <div key={constellation.name} className="bg-white/5 rounded p-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white/90 text-xs font-medium truncate flex-1">
                    {idx + 1}. {constellation.name}
                  </span>
                  <span className="text-white/60 text-xs ml-2">
                    {constellation.completed}/{constellation.total}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${constellation.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Info */}
        <div className="bg-white/5 rounded p-3">
          <div className="flex items-center gap-2 text-white/70 text-xs">
            <Clock size={12} />
            <span>Current Core: <strong className="text-white">{currentCore}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-xs mt-1">
            <Award size={12} />
            <span>Total XP: <strong className="text-yellow-400">{userXP || 0}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StellarMapAnalytics;

