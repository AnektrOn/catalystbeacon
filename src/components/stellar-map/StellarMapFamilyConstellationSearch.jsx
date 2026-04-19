import React, { useState, useMemo } from 'react';
import { Search, X, Orbit, Sparkles } from 'lucide-react';

/**
 * @param {boolean} [inline] — no absolute positioning; parent handles layout
 * @param {string} [className] — extra classes on outer wrapper
 */
export default function StellarMapFamilyConstellationSearch({
  families,
  onSelect,
  visible = true,
  inline = false,
  className = '',
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const out = [];
    (families || []).forEach((family) => {
      const constellations = (family.constellations || []).filter(
        (c) =>
          !q ||
          c.name?.toLowerCase().includes(q) ||
          family.name?.toLowerCase().includes(q)
      );
      const famMatch = !q || family.name?.toLowerCase().includes(q);
      if (!famMatch && constellations.length === 0) return;
      out.push({
        kind: 'family',
        family,
        constellations,
      });
    });
    return out;
  }, [families, searchQuery]);

  const handleSelectFamily = (family) => {
    onSelect?.({ type: 'family', family });
    setSearchQuery('');
    setOpen(false);
  };

  const handleSelectConstellation = (constellation, family) => {
    onSelect?.({ type: 'constellation', constellation, family });
    setSearchQuery('');
    setOpen(false);
  };

  if (!visible) return null;

  const outer = inline
    ? `relative w-full min-w-0 z-40 rounded-xl border border-[#C8A96E]/25 bg-black/85 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.45)] overflow-visible ${className}`
    : `absolute top-20 left-4 z-40 w-80 rounded-xl border border-[#C8A96E]/25 bg-black/85 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.45)] overflow-hidden ${className}`;

  return (
    <div className={outer.trim()}>
      <div className="relative flex items-center border-b border-white/10">
        <Search className="absolute left-3 text-[#C8A96E]/70 pointer-events-none" size={17} />
        <input
          type="text"
          placeholder="Famille ou constellation…"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          className="w-full min-w-0 pl-10 pr-9 py-2.5 bg-transparent text-white placeholder-white/45 border-0 focus:outline-none focus:ring-0 text-xs md:text-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2 p-1 rounded-md text-white/45 hover:text-white hover:bg-white/10"
            aria-label="Effacer"
          >
            <X size={15} />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-0 max-h-72 overflow-y-auto rounded-b-xl border-t border-white/10 bg-[#0a0a0a]/98 shadow-xl">
          {rows.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-white/45">
              Aucune famille ne correspond.
            </div>
          ) : (
            <ul className="py-2">
              {rows.map(({ family, constellations }) => (
                <li key={family.name} className="border-b border-white/[0.06] last:border-0">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectFamily(family)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#C8A96E]/12 transition-colors group"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C8A96E]/15 text-[#C8A96E] group-hover:bg-[#C8A96E]/25">
                      <Orbit size={16} strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium uppercase tracking-wide text-[#C8A96E]/80">
                        Famille
                      </span>
                      <span className="block truncate text-sm font-medium text-white/95">{family.name}</span>
                    </span>
                  </button>
                  {constellations.length > 0 && (
                    <ul className="pb-2 pl-4 pr-2 space-y-0.5 border-l-2 border-[#C8A96E]/25 ml-5 mr-2 mb-1">
                      {constellations.map((constellation) => (
                        <li key={constellation.id || `${family.name}-${constellation.name}`}>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelectConstellation(constellation, family)}
                            className="w-full flex items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-white/10 transition-colors"
                          >
                            <Sparkles size={14} className="shrink-0 text-amber-200/50" />
                            <span className="truncate text-sm text-white/88">{constellation.name}</span>
                            <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wider text-white/35">
                              Constellation
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
