import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Search only families and constellations by name.
 * Selecting an item focuses the camera on that family or constellation.
 */
export default function StellarMapFamilyConstellationSearch({ families, onSelect, visible = true }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    const list = [];
    (families || []).forEach((family) => {
      list.push({ type: 'family', label: family.name, family });
      (family.constellations || []).forEach((constellation) => {
        list.push({
          type: 'constellation',
          label: constellation.name,
          family,
          constellation,
        });
      });
    });
    return list;
  }, [families]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.label?.toLowerCase().includes(q) ||
        (item.type === 'constellation' && item.family?.name?.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  const handleSelect = (item) => {
    if (item.type === 'family') {
      onSelect?.({ type: 'family', family: item.family });
    } else {
      onSelect?.({ type: 'constellation', constellation: item.constellation, family: item.family });
    }
    setSearchQuery('');
    setOpen(false);
  };

  if (!visible) return null;

  return (
    <div className="absolute top-20 left-4 z-40 w-72 bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
      <div className="relative flex items-center">
        <Search className="absolute left-3 text-white/50" size={16} />
        <input
          type="text"
          placeholder="Famille ou constellation…"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="w-full pl-9 pr-8 py-2.5 bg-transparent text-white placeholder-white/50 border-0 focus:outline-none text-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2 text-white/50 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {open && (searchQuery.trim() || filtered.length > 0) && (
        <div className="max-h-64 overflow-y-auto border-t border-white/10">
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-sm text-white/50">Aucun résultat</div>
          ) : (
            filtered.slice(0, 20).map((item, idx) => (
              <button
                key={`${item.type}-${item.label}-${idx}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3 py-2 text-sm text-white/90 hover:bg-white/10 flex items-center gap-2"
              >
                <span className="text-white/50 text-xs w-16 flex-shrink-0">
                  {item.type === 'family' ? 'Famille' : 'Constellation'}
                </span>
                <span className="truncate">{item.label}</span>
                {item.type === 'constellation' && item.family?.name && (
                  <span className="text-white/40 text-xs truncate">· {item.family.name}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
