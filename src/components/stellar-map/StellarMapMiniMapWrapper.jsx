import React, { useMemo } from 'react';
import { useFamilyPositions } from './solar/contexts/FamilyPositionsContext';
import { useConstellationPositions } from './solar/contexts/ConstellationPositionsContext';
import { useNodePositions } from './solar/contexts/NodePositionsContext';
import StellarMapMiniMap from './StellarMapMiniMap';

/**
 * Builds 2D layout from 3D position contexts (project X,Z to map plane) and renders the minimap.
 */
export default function StellarMapMiniMapWrapper({ families }) {
  const { familyPositions = {} } = useFamilyPositions();
  const { constellationPositions = {} } = useConstellationPositions();
  const { nodePositions = {} } = useNodePositions();

  const layout = useMemo(() => {
    if (!families?.length) return { bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 }, families: [] };
    const points = [];
    const layoutFamilies = families.map((family) => {
      const fp = familyPositions[family.name];
      const fx = fp ? fp[0] : 0;
      const fz = fp ? fp[2] : 0;
      if (fp) points.push(fx, fz);
      const constellations = (family.constellations || []).map((constellation) => {
        const key = constellation.id || `${family.name}-${constellation.name}`;
        const cp = constellationPositions[key];
        const cx = cp ? cp[0] : 0;
        const cz = cp ? cp[2] : 0;
        if (cp) points.push(cx, cz);
        const nodes = (constellation.nodes || []).map((node) => {
          const np = nodePositions[node.id];
          const nx = np ? np[0] : 0;
          const nz = np ? np[2] : 0;
          if (np) points.push(nx, nz);
          return { ...node, x: nx, y: nz };
        });
        return { ...constellation, x: cx, y: cz, nodes };
      });
      return { name: family.name, x: fx, y: fz, constellations };
    });
    const xs = points.filter((_, i) => i % 2 === 0);
    const zs = points.filter((_, i) => i % 2 === 1);
    const minX = xs.length ? Math.min(...xs) : -50;
    const maxX = xs.length ? Math.max(...xs) : 50;
    const minY = zs.length ? Math.min(...zs) : -50;
    const maxY = zs.length ? Math.max(...zs) : 50;
    const padding = 5;
    return {
      bounds: {
        minX: minX - padding,
        maxX: maxX + padding,
        minY: minY - padding,
        maxY: maxY + padding,
      },
      families: layoutFamilies,
    };
  }, [families, familyPositions, constellationPositions, nodePositions]);

  return <StellarMapMiniMap layout={layout} visible={!!families?.length} />;
}
