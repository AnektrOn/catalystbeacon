import React, { useState, useMemo } from 'react';
import { Search, X, Filter, CheckCircle2, Circle } from 'lucide-react';

/**
 * Search and Filter component for Stellar Map
 */
const StellarMapSearch = ({
  hierarchyData,
  completionMap,
  onNodeSelect,
  onFilterChange,
  visible = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: { min: 0, max: 10 },
    completionStatus: 'all', // 'all', 'completed', 'incomplete'
    constellation: '',
    family: ''
  });

  // Get all nodes flattened
  const allNodes = useMemo(() => {
    const nodes = [];
    Object.entries(hierarchyData).forEach(([familyName, constellations]) => {
      Object.entries(constellations).forEach(([constellationName, nodeList]) => {
        nodeList.forEach(node => {
          const completion = completionMap.get(node.id);
          nodes.push({
            ...node,
            familyAlias: familyName,
            constellationAlias: constellationName,
            isCompleted: completion?.completed || false
          });
        });
      });
    });
    return nodes;
  }, [hierarchyData, completionMap]);

  // Get unique families and constellations for filter dropdowns
  const families = useMemo(() => {
    return Array.from(new Set(allNodes.map(n => n.familyAlias))).sort();
  }, [allNodes]);

  const constellations = useMemo(() => {
    return Array.from(new Set(allNodes.map(n => n.constellationAlias))).sort();
  }, [allNodes]);

  // Filter and search nodes
  const filteredNodes = useMemo(() => {
    let filtered = allNodes;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(node =>
        node.title?.toLowerCase().includes(query) ||
        node.constellationAlias?.toLowerCase().includes(query) ||
        node.familyAlias?.toLowerCase().includes(query)
      );
    }

    // Difficulty filter
    filtered = filtered.filter(node =>
      (node.difficulty || 0) >= filters.difficulty.min &&
      (node.difficulty || 0) <= filters.difficulty.max
    );

    // Completion status filter
    if (filters.completionStatus === 'completed') {
      filtered = filtered.filter(node => node.isCompleted);
    } else if (filters.completionStatus === 'incomplete') {
      filtered = filtered.filter(node => !node.isCompleted);
    }

    // Constellation filter
    if (filters.constellation) {
      filtered = filtered.filter(node => node.constellationAlias === filters.constellation);
    }

    // Family filter
    if (filters.family) {
      filtered = filtered.filter(node => node.familyAlias === filters.family);
    }

    return filtered;
  }, [allNodes, searchQuery, filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters, filteredNodes);
    }
  };

  const clearFilters = () => {
    const defaultFilters = {
      difficulty: { min: 0, max: 10 },
      completionStatus: 'all',
      constellation: '',
      family: ''
    };
    setFilters(defaultFilters);
    setSearchQuery('');
    if (onFilterChange) {
      onFilterChange(defaultFilters, allNodes);
    }
  };

  if (!visible) return null;

  return (
    <div className="absolute top-4 left-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 p-3 shadow-lg min-w-[320px] max-w-[400px]">
      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={16} />
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (onFilterChange) {
              const newFilters = { ...filters };
              handleFilterChange('search', e.target.value);
            }
          }}
          className="w-full pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/40 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              handleFilterChange('search', '');
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm transition-colors mb-2"
      >
        <div className="flex items-center gap-2">
          <Filter size={14} />
          <span>Filters</span>
          {(filters.completionStatus !== 'all' || filters.constellation || filters.family || 
            filters.difficulty.min > 0 || filters.difficulty.max < 10) && (
            <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded">Active</span>
          )}
        </div>
        <span className="text-white/60">{filteredNodes.length} results</span>
      </button>

      {/* Filter Panel */}
      {showFilters && (
        <div className="space-y-3 pt-2 border-t border-white/10">
          {/* Completion Status */}
          <div>
            <label className="block text-xs text-white/80 mb-1.5">Completion Status</label>
            <div className="flex gap-2">
              {['all', 'completed', 'incomplete'].map(status => (
                <button
                  key={status}
                  onClick={() => handleFilterChange('completionStatus', status)}
                  className={`flex-1 px-2 py-1.5 rounded text-xs transition-colors ${
                    filters.completionStatus === status
                      ? 'bg-primary text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {status === 'all' ? 'All' : status === 'completed' ? 'Completed' : 'Incomplete'}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Range */}
          <div>
            <label className="block text-xs text-white/80 mb-1.5">
              Difficulty: {filters.difficulty.min} - {filters.difficulty.max}
            </label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max="10"
                value={filters.difficulty.min}
                onChange={(e) => handleFilterChange('difficulty', {
                  ...filters.difficulty,
                  min: parseInt(e.target.value)
                })}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="10"
                value={filters.difficulty.max}
                onChange={(e) => handleFilterChange('difficulty', {
                  ...filters.difficulty,
                  max: parseInt(e.target.value)
                })}
                className="flex-1"
              />
            </div>
          </div>

          {/* Family Filter */}
          <div>
            <label className="block text-xs text-white/80 mb-1.5">Family</label>
            <select
              value={filters.family}
              onChange={(e) => handleFilterChange('family', e.target.value)}
              className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:border-white/40"
            >
              <option value="">All Families</option>
              {families.map(family => (
                <option key={family} value={family} className="bg-black">{family}</option>
              ))}
            </select>
          </div>

          {/* Constellation Filter */}
          <div>
            <label className="block text-xs text-white/80 mb-1.5">Constellation</label>
            <select
              value={filters.constellation}
              onChange={(e) => handleFilterChange('constellation', e.target.value)}
              className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:border-white/40"
            >
              <option value="">All Constellations</option>
              {constellations.map(constellation => (
                <option key={constellation} value={constellation} className="bg-black">{constellation}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-xs transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Search Results */}
      {searchQuery && filteredNodes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10 max-h-64 overflow-y-auto">
          <div className="text-xs text-white/60 mb-2">Search Results ({filteredNodes.length})</div>
          <div className="space-y-1">
            {filteredNodes.slice(0, 10).map(node => (
              <button
                key={node.id}
                onClick={() => {
                  if (onNodeSelect) {
                    onNodeSelect(node);
                  }
                }}
                className="w-full text-left px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs text-white/90 transition-colors flex items-center gap-2"
              >
                {node.isCompleted ? (
                  <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
                ) : (
                  <Circle size={12} className="text-white/40 flex-shrink-0" />
                )}
                <span className="truncate flex-1">{node.title}</span>
                <span className="text-white/50 text-xs">Lv.{node.difficulty || 0}</span>
              </button>
            ))}
            {filteredNodes.length > 10 && (
              <div className="text-xs text-white/50 text-center py-1">
                +{filteredNodes.length - 10} more...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StellarMapSearch;

