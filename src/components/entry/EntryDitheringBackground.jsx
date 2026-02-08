import React, { Suspense, lazy } from 'react'

const Dithering = lazy(() =>
  import('@paper-design/shaders-react').then((mod) => ({ default: mod.Dithering }))
)

/**
 * Fond Dithering pour les cartes de texte (ACT 1, ACT 2, ACT 3).
 * Ajuster : opacity (ligne style), colorFront / speed / shape / type (composant Dithering).
 */
export function EntryDitheringBackground({ speed = 0.2, className = '' }) {
  return (
    <div
      className={`entry-dithering-bg ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.35, // ← intensité du dithering (0.2–0.5)
        mixBlendMode: 'screen',
      }}
    >
      <Suspense fallback={<div style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)' }} />}>
        <Dithering
          colorBack="#00000000"
          colorFront="#0891b2"
          shape="warp"
          type="4x4"
          speed={speed}
          size={2}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </Suspense>
    </div>
  )
}
