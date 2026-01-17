import React from 'react';
import { Brain } from 'lucide-react';
import { cn } from '../../lib/utils';

// Compact SkillTree: condensed list per master stat with small progress bars and an inline detail card.
export default function SkillTree({ skillsByMasterStat = {}, activeStatId, onStatChange }) {
  const stats = Object.values(skillsByMasterStat);
  const currentStat = stats.find((group) => group.masterStat.id === activeStatId) || stats[0];

  if (!stats.length) {
    return (
      <div className="flex items-center justify-center p-6 text-ethereal-text/40 rounded-lg border border-ethereal-border/10">
        <Brain className="w-6 h-6 mr-2 opacity-20" />
        <div className="text-sm font-heading">No skill paths available</div>
      </div>
    );
  }

  return (
    <div className="skill-tree-compact w-full space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">
        <div className="space-y-2">
          {stats.map(({ masterStat, skills }) => {
            const statColor = masterStat?.color || 'var(--ethereal-cyan)';
            const avg = skills.length ? Math.min(skills.reduce((a, b) => a + (b.current_value || 0), 0) / skills.length, 100) : 0;

            return (
              <div
                key={masterStat.id}
                className="flex items-center justify-between p-3 rounded-xl bg-ethereal-glass/10 border border-ethereal-border/10"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex items-center justify-center rounded-sm"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: `${statColor}11`,
                      border: `1px solid ${statColor}33`
                    }}
                  >
                    <Brain className="w-4 h-4" style={{ color: statColor }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-heading font-bold text-white truncate">{masterStat.display_name}</div>
                    <div className="text-[10px] text-ethereal-text/50 truncate">{skills.length} nodes • Avg {avg.toFixed(0)}%</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-white/6 rounded-full overflow-hidden">
                    <div style={{ width: `${avg}%`, backgroundColor: statColor }} className="h-full transition-all duration-700" />
                  </div>
                  <button
                    type="button"
                    onClick={() => onStatChange(masterStat.id)}
                    className={cn(
                      "text-[10px] font-heading uppercase tracking-wider px-2 py-1 rounded-md",
                      activeStatId === masterStat.id ? "bg-ethereal-glass-hover" : "bg-ethereal-glass/50"
                    )}
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-ethereal-glass/20 border border-ethereal-border/30 rounded-2xl p-4 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] font-heading uppercase tracking-widest text-ethereal-text/60">Current Path</div>
              <div className="text-lg font-heading font-bold text-white uppercase tracking-tight">
                {currentStat?.masterStat.display_name || 'Select a Path'}
              </div>
            </div>
            <span className="text-[10px] text-ethereal-text/50 font-heading tracking-widest">{currentStat?.skills?.length || 0} nodes</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {currentStat?.skills?.slice(0, 4).map((skill) => (
              <div
                key={skill.id}
                className="rounded-lg bg-ethereal-glass/60 border border-ethereal-border/40 px-2 py-1 text-[10px] font-heading font-bold text-white uppercase tracking-wide overflow-hidden whitespace-nowrap"
              >
                {skill.skills?.display_name || skill.skills?.name}
                <div className="text-[9px] text-ethereal-text/60 mt-1">Lvl {Math.floor((skill.current_value || 0) / 10)}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[10px] text-ethereal-text/50 font-heading uppercase tracking-wide">
            Click “View” to update this summary.
          </div>
        </div>
      </div>
    </div>
  );
}

