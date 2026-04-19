import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCompletionRefresh } from './solar/contexts/CompletionRefreshContext';
import stellarMapService from '../../services/stellarMapService';
import useMediaQuery from './hooks/useMediaQuery';

/**
 * Progression panel — desktop/tablet floating; mobile bottom sheet above app nav (44px).
 * @param {React.ReactNode} [children] — optional extra footer (e.g. mobile tools)
 */
export default function StellarMapProgressionPanel({ families, children }) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const { user } = useAuth();
  const completionRefresh = useCompletionRefresh();
  const completionVersion = completionRefresh?.completionVersion ?? 0;
  const [completionMap, setCompletionMap] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [mobileSheetExpanded, setMobileSheetExpanded] = useState(false);

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

  const firstFamily = stats.byFamily[0];

  const renderStats = (familyOnly) => {
    if (loading) return <p className="py-2">Chargement…</p>;
    return (
      <div className="space-y-3">
        {stats.byFamily.map(({ familyName, total, completed }) => (
          <div key={familyName}>
            <div className="font-medium text-white/90">
              {familyName}: {completed}/{total}
            </div>
            {!familyOnly && (
              <div className="ml-3 mt-0.5 space-y-0.5">
                {stats.byConstellation
                  .filter((c) => c.familyName === familyName)
                  .map((c) => (
                    <div key={`${c.familyName}-${c.constellationName}`} className="text-xs text-white/70">
                      {c.constellationName}: {c.completed}/{c.total}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const desktopPanelClass = [
    'absolute z-40 bg-black/80 backdrop-blur-sm border border-white/20 overflow-hidden',
    'transition-all duration-300 rounded-lg',
    'left-3 max-w-[240px] bottom-12 lg:bottom-10',
    'md:left-2 md:max-w-[220px] md:bottom-10',
  ].join(' ');

  const mobileSheetClass = [
    'absolute z-40 bg-black/90 backdrop-blur-sm border-t border-x border-white/20',
    'left-0 right-0 max-w-none bottom-[44px] rounded-b-none rounded-t-xl',
    'transition-all duration-300 flex flex-col min-h-0',
  ].join(' ');

  const headerButton = (
    <button
      type="button"
      onClick={() => setCollapsed(!collapsed)}
      className="w-full flex items-center justify-between px-3 py-2 text-white/90 text-sm font-medium hover:bg-white/5 shrink-0"
    >
      <span className="flex items-center gap-2 min-w-0">
        <BarChart3 size={16} className="shrink-0" />
        <span className="truncate">Progression</span>
      </span>
      {collapsed ? <ChevronRight size={16} className="shrink-0" /> : <ChevronDown size={16} className="shrink-0" />}
    </button>
  );

  if (isMobile) {
    const expanded = mobileSheetExpanded;
    return (
      <div
        className={mobileSheetClass}
        style={
          expanded
            ? { height: '60vh', maxHeight: '60vh' }
            : { minHeight: '80px' }
        }
      >
        <button
          type="button"
          className="w-full pt-2 pb-1 flex justify-center touch-manipulation shrink-0"
          onClick={() => setMobileSheetExpanded((v) => !v)}
          aria-label={expanded ? 'Replier la progression' : 'Déplier la progression'}
        >
          <div className="h-0.5 bg-white/20 rounded-full w-7" />
        </button>
        {headerButton}
        {expanded ? (
          <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-2 text-sm text-white/80 border-t border-white/10">
            {renderStats(collapsed)}
          </div>
        ) : (
          <div className="px-3 pb-1 text-xs text-white/70 truncate shrink-0 border-t border-white/10">
            {loading ? '…' : firstFamily ? `${firstFamily.familyName}: ${firstFamily.completed}/${firstFamily.total}` : ''}
          </div>
        )}
        {children && (
          <div className="border-t border-white/10 shrink-0 bg-black/50 min-h-[40px] max-h-[40px] overflow-hidden">
            {children}
          </div>
        )}
      </div>
    );
  }

  const bodyContent = !collapsed && (
    <div className="px-3 pb-3 pt-0 text-sm text-white/80 border-t border-white/10 max-h-[200px] overflow-y-auto">
      {renderStats(false)}
    </div>
  );

  return (
    <div className={desktopPanelClass}>
      {headerButton}
      {bodyContent}
    </div>
  );
}
