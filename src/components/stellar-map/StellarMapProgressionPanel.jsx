import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCompletionRefresh } from './solar/contexts/CompletionRefreshContext';
import stellarMapService from '../../services/stellarMapService';

/**
 * Progression panel: X/Y completed per constellation and per family.
 * Collapsible panel showing completion counts.
 */
export default function StellarMapProgressionPanel({ families }) {
  const { user } = useAuth();
  const completionRefresh = useCompletionRefresh();
  const completionVersion = completionRefresh?.completionVersion ?? 0;
  const [completionMap, setCompletionMap] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const nodeIds = useMemo(() => {
    if (!families?.length) return [];
    const ids = [];
    families.forEach((family) => {
      family.constellations?.forEach((constellation) => {
        constellation.nodes?.forEach((node) => {
          if (node?.id) ids.push(node.id);
        });
      });
    });
    return [...new Set(ids)];
  }, [families]);

  useEffect(() => {
    if (!user?.id || nodeIds.length === 0) {
      setCompletionMap(new Map());
      return;
    }
    let cancelled = false;
    setLoading(true);
    stellarMapService.getBulkCompletionStatus(user.id, nodeIds).then(({ data }) => {
      if (!cancelled) {
        setCompletionMap(data || new Map());
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [user?.id, nodeIds.length, completionVersion]);

  const stats = useMemo(() => {
    const byFamily = [];
    const byConstellation = [];
    if (!families?.length) return { byFamily, byConstellation };
    families.forEach((family) => {
      let familyTotal = 0;
      let familyCompleted = 0;
      (family.constellations || []).forEach((constellation) => {
        const nodes = constellation.nodes || [];
        const total = nodes.length;
        const completed = nodes.filter((n) => completionMap.has(n.id)).length;
        familyTotal += total;
        familyCompleted += completed;
        byConstellation.push({
          familyName: family.name,
          constellationName: constellation.name,
          total,
          completed,
        });
      });
      byFamily.push({ familyName: family.name, total: familyTotal, completed: familyCompleted });
    });
    return { byFamily, byConstellation };
  }, [families, completionMap]);

  if (!families?.length) return null;

  return (
    <div className="absolute bottom-24 left-4 z-40 bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden max-w-[280px]">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-3 py-2 text-white/90 text-sm font-medium hover:bg-white/5"
      >
        <span className="flex items-center gap-2">
          <BarChart3 size={16} />
          Progression
        </span>
        {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
      </button>
      {!collapsed && (
        <div className="px-3 pb-3 pt-0 text-sm text-white/80 border-t border-white/10">
          {loading ? (
            <p className="py-2">Chargement…</p>
          ) : (
            <div className="space-y-3">
              {stats.byFamily.map(({ familyName, total, completed }) => (
                <div key={familyName}>
                  <div className="font-medium text-white/90">
                    {familyName}: {completed}/{total}
                  </div>
                  <div className="ml-3 mt-0.5 space-y-0.5">
                    {stats.byConstellation
                      .filter((c) => c.familyName === familyName)
                      .map((c) => (
                        <div key={`${c.familyName}-${c.constellationName}`} className="text-xs text-white/70">
                          {c.constellationName}: {c.completed}/{c.total}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
