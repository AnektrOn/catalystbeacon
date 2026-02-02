import React from 'react';

/**
 * Skeleton loader that mimics the Stellar Map layout (controls + 3D area)
 * while data is loading. Uses shimmer animation for visual feedback.
 */
function StellarMapSkeleton() {
  return (
    <div
      className="absolute inset-0 flex flex-col bg-black/80 z-40"
      aria-hidden="true"
    >
      {/* Top bar: hamburger placeholder */}
      <div className="flex items-center gap-2 p-4">
        <div className="h-11 w-11 rounded-md bg-white/10 animate-pulse" />
        <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
      </div>

      {/* Main area: left panel skeleton + canvas skeleton */}
      <div className="flex flex-1 gap-4 p-4 pt-0">
        {/* Left panel skeleton (controls) */}
        <div className="w-64 flex-shrink-0 space-y-3">
          <div className="h-8 w-3/4 rounded bg-white/10 animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-full rounded bg-white/10 animate-pulse" />
            ))}
          </div>
          <div className="h-8 w-1/2 rounded bg-white/10 animate-pulse mt-4" />
          <div className="space-y-2 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-5 w-full rounded bg-white/10 animate-pulse" />
            ))}
          </div>
        </div>

        {/* 3D canvas area skeleton with shimmer */}
        <div className="flex-1 relative rounded-lg overflow-hidden bg-white/5 min-h-[200px]">
          <div
            className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
              width: '60%'
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
          </div>
        </div>
      </div>

      {/* Shimmer keyframes - use Tailwind animate or inline */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

export default StellarMapSkeleton;
