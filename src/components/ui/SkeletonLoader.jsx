import React from 'react';

/**
 * Enhanced Skeleton Loader for Ethereal UI
 * Provides shimmering feedback while content is loading
 */
const SkeletonLoader = ({ type = 'page' }) => {
  if (type === 'dashboard') {
    return (
      <div className="p-6 space-y-6 animate-pulse w-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-48 bg-white/10 rounded-lg"></div>
          <div className="h-10 w-32 bg-indigo-500/20 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-white/5 rounded-2xl border border-white/10"></div>
          <div className="h-48 bg-white/5 rounded-2xl border border-white/10"></div>
          <div className="h-48 bg-white/5 rounded-2xl border border-white/10"></div>
        </div>

        <div className="h-64 bg-white/5 rounded-2xl border border-white/10"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-white/5 rounded-2xl border border-white/10"></div>
          <div className="h-40 bg-white/5 rounded-2xl border border-white/10"></div>
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="h-48 bg-white/5 rounded-2xl border border-white/10 animate-pulse w-full"></div>
    );
  }

  // Default Page Skeleton
  return (
    <div className="min-h-screen p-8 space-y-8 animate-pulse">
      <div className="h-12 w-1/3 bg-white/10 rounded-xl mb-12"></div>
      
      <div className="space-y-4">
        <div className="h-4 w-full bg-white/5 rounded-full"></div>
        <div className="h-4 w-5/6 bg-white/5 rounded-full"></div>
        <div className="h-4 w-4/6 bg-white/5 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-56 bg-white/5 rounded-3xl border border-white/10 shadow-ethereal-base"></div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;
