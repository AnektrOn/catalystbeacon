import { useState, useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * Hook for handling node interactions (click, hover)
 * @param {Object} context - Three.js context with renderer and camera
 * @param {Array} nodes - Array of node meshes
 * @returns {Object} Interaction state and handlers
 */
export function useNodeInteraction(context, nodes) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, visible: false });
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const lastHoveredRef = useRef(null);

  /**
   * Handle mouse move for hover detection
   */
  const handleMouseMove = useCallback((event) => {
    if (!context?.renderer || !context?.camera) return;

    const rect = context.renderer.domElement.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, context.camera);

    // Only intersect with actual subnode spheres
    const subnodeMeshes = nodes.filter(
      obj => obj.userData?._is3DSubnode && obj.geometry?.type === 'SphereGeometry'
    );

    const intersects = raycasterRef.current.intersectObjects(subnodeMeshes, true);
    const hitInfo = intersects.find(h =>
      h.object.userData?._is3DSubnode && h.object.userData?.title
    );

    // Reset previous hover
    if (lastHoveredRef.current && lastHoveredRef.current !== hitInfo?.object) {
      lastHoveredRef.current.scale.set(1, 1, 1);
      if (lastHoveredRef.current.material) {
        lastHoveredRef.current.material.opacity = 0.9;
      }
    }

    if (hitInfo) {
      const hovered = hitInfo.object;
      hovered.scale.set(1.35, 1.35, 1.35);
      if (hovered.material) {
        hovered.material.opacity = 1.0;
      }
      lastHoveredRef.current = hovered;
      setHoveredNode(hovered);
      setTooltipPosition({
        x: event.clientX,
        y: event.clientY,
        visible: true
      });
    } else {
      setHoveredNode(null);
      setTooltipPosition(prev => ({ ...prev, visible: false }));
      lastHoveredRef.current = null;
    }
  }, [context, nodes]);

  /**
   * Handle click for node selection
   */
  const handleClick = useCallback((event) => {
    if (!context?.renderer || !context?.camera) return;

    const rect = context.renderer.domElement.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, context.camera);

    const subnodeMeshes = nodes.filter(
      obj => obj.userData?._is3DSubnode && obj.geometry?.type === 'SphereGeometry'
    );

    const intersects = raycasterRef.current.intersectObjects(subnodeMeshes, true);
    const hitInfo = intersects.find(h =>
      h.object.userData?._is3DSubnode && h.object.userData?.title
    );

    if (hitInfo) {
      setSelectedNode(hitInfo.object);
      // Navigate to node link if available
      if (hitInfo.object.userData?.link) {
        window.open(hitInfo.object.userData.link, '_blank');
      }
    } else {
      setSelectedNode(null);
    }
  }, [context, nodes]);

  /**
   * Attach event listeners to renderer DOM element
   */
  useEffect(() => {
    const canvas = context?.renderer?.domElement;
    if (!canvas) return;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [context, handleMouseMove, handleClick]);

  return {
    hoveredNode,
    selectedNode,
    tooltipPosition,
    setSelectedNode
  };
}
