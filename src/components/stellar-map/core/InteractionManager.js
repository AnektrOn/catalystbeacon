import * as THREE from 'three';

/**
 * InteractionManager - Handles all user interactions with the stellar map
 */
export class InteractionManager {
  constructor(scene, camera, renderer, nodeMeshes) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.nodeMeshes = nodeMeshes || [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredNode = null;
    this.selectedNode = null;
    this.lastHoveredMesh = null;
    this.onNodeHover = null;
    this.onNodeClick = null;
    this.onNodeFocus = null;
    this.hoverDebounceTimer = null;
    this.cachedSubnodeMeshes = null;
    this.lastMeshUpdateTime = 0;
  }

  /**
   * Update node meshes reference
   */
  updateNodeMeshes(nodeMeshes) {
    this.nodeMeshes = nodeMeshes || [];
    // Invalidate cache when meshes update
    this.cachedSubnodeMeshes = null;
    this.lastMeshUpdateTime = Date.now();
  }

  /**
   * Get filtered subnode meshes with caching
   */
  getSubnodeMeshes() {
    const now = Date.now();
    // Cache for 100ms to avoid repeated filtering
    if (this.cachedSubnodeMeshes && (now - this.lastMeshUpdateTime) < 100) {
      return this.cachedSubnodeMeshes;
    }

    this.cachedSubnodeMeshes = this.nodeMeshes.filter(
      mesh => mesh.userData?._is3DSubnode && mesh.geometry?.type === 'SphereGeometry'
    );
    return this.cachedSubnodeMeshes;
  }

  /**
   * Set callback for node hover
   */
  setOnNodeHover(callback) {
    this.onNodeHover = callback;
  }

  /**
   * Set callback for node click
   */
  setOnNodeClick(callback) {
    this.onNodeClick = callback;
  }

  /**
   * Set callback for node focus
   */
  setOnNodeFocus(callback) {
    this.onNodeFocus = callback;
  }

  /**
   * Handle mouse move for hover detection
   */
  handleMouseMove(event) {
    if (!this.renderer || !this.camera) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Only intersect with subnode spheres
    const subnodeMeshes = this.nodeMeshes.filter(
      mesh => mesh.userData?._is3DSubnode && mesh.geometry?.type === 'SphereGeometry'
    );

    const intersects = this.raycaster.intersectObjects(subnodeMeshes, true);
    const hitInfo = intersects.find(h =>
      h.object.userData?._is3DSubnode && h.object.userData?.title
    );

    // Reset previous hover
    if (this.lastHoveredMesh && this.lastHoveredMesh !== hitInfo?.object) {
      this.lastHoveredMesh.scale.set(1, 1, 1);
      if (this.lastHoveredMesh.material) {
        this.lastHoveredMesh.material.opacity = 0.9;
      }
    }

    if (hitInfo) {
      const hovered = hitInfo.object;
      hovered.scale.set(1.35, 1.35, 1.35);
      if (hovered.material) {
        hovered.material.opacity = 1.0;
      }
      this.lastHoveredMesh = hovered;
      this.hoveredNode = hovered;

      if (this.onNodeHover) {
        this.onNodeHover({
          node: hovered.userData,
          position: { x: event.clientX, y: event.clientY },
          visible: true
        });
      }
    } else {
      this.hoveredNode = null;
      this.lastHoveredMesh = null;
      if (this.onNodeHover) {
        this.onNodeHover({ visible: false });
      }
    }
  }

  /**
   * Handle click for node selection
   */
  handleClick(event) {
    if (!this.renderer || !this.camera) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Use cached subnode meshes
    const subnodeMeshes = this.getSubnodeMeshes();

    const intersects = this.raycaster.intersectObjects(subnodeMeshes, false); // false = don't check children
    const hitInfo = intersects.find(h =>
      h.object.userData?._is3DSubnode && h.object.userData?.title
    );

    if (hitInfo) {
      this.selectedNode = hitInfo.object;
      const nodeData = hitInfo.object.userData;

      if (this.onNodeClick) {
        this.onNodeClick(nodeData);
      }

      // Note: Link navigation is now handled in StellarMap component
      // (YouTube modal or new tab based on URL type)
    } else {
      this.selectedNode = null;
    }
  }

  /**
   * Focus camera on a constellation
   */
  focusConstellation(constellationName, constellationCenters, controls) {
    if (!controls || !this.camera) return;

    const centerPos = constellationCenters[constellationName];
    if (!centerPos) {
      console.warn(`No position found for constellation "${constellationName}"`);
      return;
    }

    const targetPos = centerPos instanceof THREE.Vector3
      ? centerPos
      : new THREE.Vector3(centerPos.x, centerPos.y, centerPos.z);

    controls.target.copy(targetPos);

    const dir = new THREE.Vector3()
      .subVectors(this.camera.position, targetPos)
      .normalize();

    const desiredDistance = 15;
    this.camera.position.copy(
      targetPos.clone().add(dir.multiplyScalar(desiredDistance))
    );

    controls.update();

    if (this.onNodeFocus) {
      this.onNodeFocus({ type: 'constellation', name: constellationName });
    }
  }

  /**
   * Focus camera on a subnode
   */
  focusSubnode(nodePosition, controls) {
    if (!controls || !this.camera) return;

    const targetPos = nodePosition instanceof THREE.Vector3
      ? nodePosition
      : new THREE.Vector3(nodePosition.x, nodePosition.y, nodePosition.z);

    controls.target.copy(targetPos);

    const dir = new THREE.Vector3()
      .subVectors(this.camera.position, targetPos)
      .normalize();

    const desiredDistance = 10;
    this.camera.position.copy(
      targetPos.clone().add(dir.multiplyScalar(desiredDistance))
    );

    controls.update();

    if (this.onNodeFocus) {
      this.onNodeFocus({ type: 'subnode', position: targetPos });
    }
  }

  /**
   * Attach event listeners to renderer canvas
   */
  attachListeners() {
    if (!this.renderer?.domElement) return;

    const canvas = this.renderer.domElement;
    canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    canvas.addEventListener('click', this.handleClick.bind(this));

    return () => {
      canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
      canvas.removeEventListener('click', this.handleClick.bind(this));
    };
  }

  /**
   * Cleanup
   */
  dispose() {
    this.nodeMeshes = [];
    this.hoveredNode = null;
    this.selectedNode = null;
    this.lastHoveredMesh = null;
    this.onNodeHover = null;
    this.onNodeClick = null;
    this.onNodeFocus = null;
  }
}
