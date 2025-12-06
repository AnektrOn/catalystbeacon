import * as THREE from 'three';
import {
  positionSubnodeMetatron,
  PLANET_RADII,
  calculateFamilyRadius,
  calculateConstellationRadius,
  calculateSafeConstellationDistance,
  calculateFamilyPlacementRadius,
  getAngularDirection,
  METATRON_CUBE
} from '../../../utils/stellarMapPositioning';

/**
 * Family and constellation halo colors
 */
const FAMILY_HALO_COLORS = {
  "Veil Piercers": 0x301934,
  "Mind Hackers": 0x203020,
  "Persona Shifters": 0x102030,
  "Reality Shatters": 0x303010,
  "Thought Catchers": 0x301030,
  "Heart Whisperers": 0x103030,
  "Routine Architects": 0x302010,
  "Safe Havens": 0x201020,
  "Path Makers": 0x301820,
  "Reality Tuners": 0x182030,
  "Energy Architects": 0x203018,
  "Inner Illuminators": 0x302810,
  "Ritual Grid": 0x281830
};

const CONSTELLATION_HALO_COLORS = {
  "Puppet Masters": 0x600000,
  "Smoke & Mirrors": 0x800000,
  "Golden Shackles": 0xA00000,
  "Panopticon": 0xC00000,
  "Lesson Leashes": 0xE00000,
  "Hidden Commands": 0x006000,
  "Feed Puppets": 0x008000,
  "Mind Traps": 0x00A000,
  "Voice of Deception": 0x00C000,
  "Mask Breakers": 0x000060,
  "Avatar Illusions": 0x000080,
  "I-Dissolvers": 0x0000A0,
  "Numbers Don't Lie": 0x606000,
  "Whistleblowers": 0x808000,
  "Double-Speak": 0xA0A000,
  "Pause Buttons": 0x301030,
  "Mirror Moments": 0x501050,
  "Grounding Gems": 0x701070,
  "Feeling Detectors": 0x106010,
  "Calm Cradles": 0x108010,
  "Mood Markers": 0x10A010,
  "Tiny Dawns": 0x606010,
  "Signal Guards": 0x808010,
  "Reset Pulses": 0xA0A010,
  "Mind Sanctum": 0x101060,
  "Breath Portals": 0x101080,
  "Rhythm Reset": 0x1010A0,
  "Thought Sculptors": 0x602000,
  "Mind Cartographers": 0x802000,
  "Body-Bridge": 0xA02000,
  "Witness Protocols": 0x006020,
  "Chance Benders": 0x008020,
  "Aura Sync": 0x00A020,
  "Wheel Harmonizers": 0x200060,
  "Energy Highways": 0x200080,
  "Prana Weaver": 0x2000A0,
  "Core Miners": 0x600060,
  "Voice Bridgers": 0x800080,
  "Shadow Ledger": 0xA000A0,
  "Dawn Circuit": 0x002060,
  "Unity Pulse": 0x002080,
  "Meta Map": 0x0020A0
};

const DIFFICULTY_STYLES = {
  0: { color: 0x2A3E66, size: 0.3 },
  1: { color: 0x3A527A, size: 0.4 },
  2: { color: 0x4B668E, size: 0.5 },
  3: { color: 0x5C7AA2, size: 0.6 },
  4: { color: 0x6D8EB6, size: 0.7 },
  5: { color: 0x7EA2CA, size: 0.8 },
  6: { color: 0x8FB6DE, size: 0.9 },
  7: { color: 0xA0CAEE, size: 1.0 },
  8: { color: 0xB1DEFF, size: 1.1 },
  9: { color: 0xC2F2FF, size: 1.2 },
  10: { color: 0xFFFFFF, size: 1.3 }
};

/**
 * Create fog material for family/constellation spheres
 */
function createFogMaterial(hex, peak = 0.15) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(hex) },
      uPeak: { value: peak }
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vPos;
      uniform vec3  uColor;
      uniform float uPeak;
      void main() {
        float r = length(vPos);
        float edge = smoothstep(0.7,1.0,r);
        gl_FragColor = vec4(uColor, (1.0 - edge) * uPeak);
      }
    `
  });
}

/**
 * NodeRenderer - Handles rendering of all nodes in the stellar map
 */
export class NodeRenderer {
  constructor(scene) {
    this.scene = scene;
    this.renderedObjects = [];
    this.constellationCenters = {};
  }

  /**
   * Clear all rendered nodes
   */
  clear() {
    this.renderedObjects.forEach(obj => {
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    this.renderedObjects = [];
    this.constellationCenters = {};
  }

  /**
   * Render nodes from hierarchy data
   * @param {Object} hierarchyData - { familyName: { constellationName: [nodes] } }
   * @param {boolean} showWhiteLines - Whether to show intra-constellation lines
   * @returns {Object} { nodeMeshes: Array, constellationCenters: Object }
   */
  render(hierarchyData, showWhiteLines = true) {
    // Clear previous render
    this.clear();

    if (!hierarchyData || Object.keys(hierarchyData).length === 0) {
      return { nodeMeshes: [], constellationCenters: {} };
    }

    const nodeMeshes = [];
    const centers = {};

    // Calculate family positions
    const familyList = Object.keys(hierarchyData);
    const familyData = familyList.map(familyName => {
      const constellations = hierarchyData[familyName];
      const totalNodes = Object.values(constellations).flat().length;
      return {
        name: familyName,
        totalNodes,
        radius: calculateFamilyRadius(totalNodes),
        constellations
      };
    });

    const maxFamilyRadius = Math.max(...familyData.map(f => f.radius));
    const familyPlacementRadius = calculateFamilyPlacementRadius(maxFamilyRadius, familyList.length);

    // Render families and their contents
    familyData.forEach((family, familyIndex) => {
      const familyDir = getAngularDirection(familyIndex, familyList.length);
      const familyCenter = familyDir.clone().multiplyScalar(familyPlacementRadius);
      const familyColor = FAMILY_HALO_COLORS[family.name] || 0x333333;

      // Create family fog sphere
      const familyGeo = new THREE.SphereGeometry(family.radius, 16, 16);
      const familyMat = createFogMaterial(familyColor, 0.15);
      const familyMesh = new THREE.Mesh(familyGeo, familyMat);
      familyMesh.position.copy(familyCenter);
      familyMesh.userData = { _is3DFamily: true, familyAlias: family.name };
      this.scene.add(familyMesh);
      this.renderedObjects.push(familyMesh);

      // Render constellations within family
      const constellationList = Object.entries(family.constellations);
      constellationList.forEach(([constellationName, nodes], constIndex) => {
        if (!nodes || nodes.length === 0) return;

        const constRadius = calculateConstellationRadius(nodes.length);
        const safeDist = calculateSafeConstellationDistance(family.radius, constRadius);
        const constDir = getAngularDirection(constIndex, constellationList.length);
        const constPos = familyCenter.clone().add(constDir.clone().multiplyScalar(safeDist));
        const constColor = CONSTELLATION_HALO_COLORS[constellationName] || 0x666666;

        centers[constellationName] = constPos.clone();
        this.constellationCenters[constellationName] = constPos.clone();

        // Create constellation fog sphere
        const constGeo = new THREE.SphereGeometry(constRadius, 12, 12);
        const constMat = createFogMaterial(constColor, 0.20);
        const constMesh = new THREE.Mesh(constGeo, constMat);
        constMesh.position.copy(constPos);
        constMesh.userData = {
          _is3DConstellation: true,
          constellationAlias: constellationName,
          familyAlias: family.name
        };
        this.scene.add(constMesh);
        this.renderedObjects.push(constMesh);

        // Render subnodes
        const nodePositions = [];
        nodes.forEach((node, nodeIndex) => {
          const difficulty = node.difficulty || 0;
          const style = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES[0];
          const nodeRadius = style.size;

          // Position using Metatron cube
          const nodePos = positionSubnodeMetatron(
            nodeIndex,
            nodes.length,
            constPos,
            constRadius,
            nodeRadius
          );

          nodePositions.push(nodePos);

          // Core sphere
          const coreGeo = new THREE.SphereGeometry(nodeRadius, 12, 12);
          const coreMat = new THREE.MeshBasicMaterial({
            color: style.color,
            transparent: true,
            opacity: 0.9
          });
          const coreMesh = new THREE.Mesh(coreGeo, coreMat);
          coreMesh.position.copy(nodePos);
          coreMesh.userData = {
            _is3DSubnode: true,
            id: node.id,
            title: node.title,
            link: node.link,
            constellationAlias: constellationName,
            familyAlias: family.name,
            difficulty: difficulty,
            label: node.difficulty_label
          };
          this.scene.add(coreMesh);
          this.renderedObjects.push(coreMesh);
          nodeMeshes.push(coreMesh);

          // Rim
          const rimGeo = new THREE.SphereGeometry(nodeRadius * 1.05, 12, 12);
          const rimMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.35
          });
          const rimMesh = new THREE.Mesh(rimGeo, rimMat);
          rimMesh.position.copy(nodePos);
          rimMesh.userData._is3DHalo = true;
          this.scene.add(rimMesh);
          this.renderedObjects.push(rimMesh);
        });

        // Gold line from family center to constellation's easiest node
        if (nodes.length > 0) {
          const easiestNode = nodes.reduce((min, node) =>
            (node.difficulty || 0) < (min.difficulty || 0) ? node : min
          );
          const easiestIndex = nodes.findIndex(n => n.id === easiestNode.id);
          if (easiestIndex >= 0 && nodePositions[easiestIndex]) {
            const goldMat = new THREE.LineBasicMaterial({
              color: 0xffd700,
              transparent: true,
              opacity: 0.75,
              linewidth: 2
            });
            const goldGeo = new THREE.BufferGeometry().setFromPoints([
              familyCenter,
              nodePositions[easiestIndex]
            ]);
            const goldLine = new THREE.Line(goldGeo, goldMat);
            goldLine.userData = { _is3DLine: true, lineType: 'gold' };
            this.scene.add(goldLine);
            this.renderedObjects.push(goldLine);
          }
        }

        // White lines between nodes in constellation
        if (showWhiteLines && nodePositions.length > 1) {
          const whiteMat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4,
            linewidth: 1
          });
          for (let i = 0; i < nodePositions.length; i++) {
            for (let j = i + 1; j < nodePositions.length; j++) {
              const whiteGeo = new THREE.BufferGeometry().setFromPoints([
                nodePositions[i],
                nodePositions[j]
              ]);
              const whiteLine = new THREE.Line(whiteGeo, whiteMat);
              whiteLine.userData = { _is3DLine: true, lineType: 'white' };
              this.scene.add(whiteLine);
              this.renderedObjects.push(whiteLine);
            }
          }
        }
      });
    });

    return { nodeMeshes, constellationCenters: centers };
  }

  /**
   * Get constellation centers
   */
  getConstellationCenters() {
    return { ...this.constellationCenters };
  }

  /**
   * Toggle white lines visibility
   */
  toggleWhiteLines(show) {
    this.renderedObjects.forEach(obj => {
      if (obj.userData?._is3DLine && obj.userData.lineType === 'white') {
        obj.visible = show;
      }
    });
  }
}
