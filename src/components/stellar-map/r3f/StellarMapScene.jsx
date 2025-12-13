import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
// Bloom post-processing disabled for performance
// import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { CoreSun } from './CoreSun';
import { FogSphere } from './FogSphere';
import { NodeSphere } from './NodeSphere';
import { GoldLine, WhiteLine } from './ConnectionLines';
import {
  positionSubnodeMetatron,
  calculateFamilyRadius,
  calculateConstellationRadius,
  calculateSafeConstellationDistance,
  calculateFamilyPlacementRadius,
  getAngularDirection
} from '../../../utils/stellarMapPositioning';

// #region agent log
const checkCSSVariables = () => {
  try {
    const root = document.documentElement;
    const computedStyle = window.getComputedStyle(root);
    const colorPrimary = computedStyle.getPropertyValue('--color-primary').trim();
    const colorSecondary = computedStyle.getPropertyValue('--color-secondary').trim();
    const darkGoldenrod = computedStyle.getPropertyValue('--color-dark-goldenrod').trim();
    fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StellarMapScene.jsx:19',message:'CSS variables check',data:{colorPrimary,colorSecondary,darkGoldenrod,hasVariables:!!(colorPrimary||colorSecondary||darkGoldenrod)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  } catch(e) {
    fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StellarMapScene.jsx:19',message:'CSS variables check failed',data:{error:e.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  }
};
if (typeof window !== 'undefined') {
  setTimeout(checkCSSVariables, 100);
}
// #endregion

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

function SceneContent({ 
  hierarchyData, 
  showWhiteLines, 
  onNodeHover, 
  onNodeClick,
  hoveredNodeId,
  onConstellationCentersReady,
  onNodePositionsReady
}) {
  const { camera } = useThree();
  const [constellationCenters, setConstellationCenters] = useState({});
  const nodePositionsRef = useRef({});
  const cameraPositionRef = useRef([0, 0, 25]);
  const maxRenderDistance = 100; // Only render nodes within this distance

  // Update camera position ref for distance calculations
  useFrame(() => {
    if (camera) {
      cameraPositionRef.current = [camera.position.x, camera.position.y, camera.position.z];
    }
  });

  const sceneElements = useMemo(() => {
    if (!hierarchyData || Object.keys(hierarchyData).length === 0) {
      return null;
    }

    const elements = [];
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
    const familyPlacementRadius = calculateFamilyPlacementRadius(maxFamilyRadius, familyList.length) * 0.6;  // Scale down placement radius

    // Render families and their contents
    familyData.forEach((family, familyIndex) => {
      const familyDir = getAngularDirection(familyIndex, familyList.length);
      const familyCenter = familyDir.clone().multiplyScalar(familyPlacementRadius);
      const familyColor = FAMILY_HALO_COLORS[family.name] || 0x333333;
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StellarMapScene.jsx:121',message:'Family color being used',data:{familyName:family.name,colorHex:familyColor.toString(16),isHardcoded:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      // Family fog sphere - Optional, can be disabled for better performance
      // Commented out to improve performance - uncomment if needed for visual clarity
      // elements.push(
      //   <FogSphere
      //     key={`family-${family.name}`}
      //     radius={family.radius}
      //     color={familyColor}
      //     peak={0.15}
      //     position={[familyCenter.x, familyCenter.y, familyCenter.z]}
      //     userData={{ _is3DFamily: true, familyAlias: family.name }}
      //   />
      // );

      // Render constellations within family
      const constellationList = Object.entries(family.constellations);
      constellationList.forEach(([constellationName, nodes], constIndex) => {
        if (!nodes || nodes.length === 0) return;

        const constRadius = calculateConstellationRadius(nodes.length);
        const safeDist = calculateSafeConstellationDistance(family.radius, constRadius);
        const constDir = getAngularDirection(constIndex, constellationList.length);
        const constPos = familyCenter.clone().add(constDir.clone().multiplyScalar(safeDist));
        const constColor = CONSTELLATION_HALO_COLORS[constellationName] || 0x666666;
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StellarMapScene.jsx:144',message:'Constellation color being used',data:{constellationName,colorHex:constColor.toString(16),isHardcoded:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        centers[constellationName] = [constPos.x, constPos.y, constPos.z];
        
        // Store node positions for focus
        nodes.forEach((node, nodeIndex) => {
          const nodePos = positionSubnodeMetatron(
            nodeIndex,
            nodes.length,
            constPos,
            constRadius,
            node.difficulty || 0
          );
          nodePositionsRef.current[node.id] = [nodePos.x, nodePos.y, nodePos.z];
        });

        // Constellation fog sphere - Disabled for performance
        // Only render if really needed for visual clarity (can be re-enabled)
        // if (nodes.length > 0) {
        //   elements.push(
        //     <FogSphere
        //       key={`constellation-${constellationName}`}
        //       radius={constRadius}
        //       color={constColor}
        //       peak={0.20}
        //       position={[constPos.x, constPos.y, constPos.z]}
        //       userData={{
        //         _is3DConstellation: true,
        //         constellationAlias: constellationName,
        //         familyAlias: family.name
        //       }}
        //     />
        //   );
        // }

        // Render subnodes - All nodes visible
        const nodePositions = [];
        nodes.forEach((node, nodeIndex) => {
          const nodePos = positionSubnodeMetatron(
            nodeIndex,
            nodes.length,
            constPos,
            constRadius,
            node.difficulty || 0
          );
          const nodePosArray = [nodePos.x, nodePos.y, nodePos.z];
          nodePositions.push(nodePosArray);

          elements.push(
            <NodeSphere
              key={`node-${node.id}`}
              position={nodePosArray}
              difficulty={node.difficulty || 0}
              userData={{
                id: node.id,
                title: node.title,
                link: node.link,
                constellationAlias: constellationName,
                familyAlias: family.name,
                difficulty: node.difficulty,
                label: node.difficulty_label
              }}
              onHover={onNodeHover}
              onClick={onNodeClick}
              isHovered={hoveredNodeId === node.id}
            />
          );
        });

        // Gold line from family center to constellation's easiest node
        if (nodes.length > 0) {
          const easiestNode = nodes.reduce((min, node) =>
            (node.difficulty || 0) < (min.difficulty || 0) ? node : min
          );
          const easiestIndex = nodes.findIndex(n => n.id === easiestNode.id);
          if (easiestIndex >= 0 && nodePositions[easiestIndex]) {
            elements.push(
              <GoldLine
                key={`gold-${constellationName}`}
                start={[familyCenter.x, familyCenter.y, familyCenter.z]}
                end={nodePositions[easiestIndex]}
              />
            );
          }
        }

        // White lines between nodes - Severely limited for performance
        if (showWhiteLines && nodePositions.length > 1) {
          // Only connect nodes in a chain (each to next) to drastically reduce line count
          for (let i = 0; i < nodePositions.length - 1; i++) {
            // Only connect to next node (chain connection)
            elements.push(
              <WhiteLine
                key={`white-${constellationName}-${i}-${i + 1}`}
                start={nodePositions[i]}
                end={nodePositions[i + 1]}
                visible={showWhiteLines}
              />
            );
          }
        }
      });
    });

    setConstellationCenters(centers);
    
    // Notify parent of centers and positions
    if (onConstellationCentersReady) {
      onConstellationCentersReady(centers);
    }
    if (onNodePositionsReady) {
      onNodePositionsReady(nodePositionsRef.current);
    }
    
    return elements;
  }, [hierarchyData, showWhiteLines, onNodeHover, onNodeClick, hoveredNodeId, onConstellationCentersReady, onNodePositionsReady]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={1.5} distance={50} color={0xff8844} />
      {sceneElements}
    </>
  );
}

// Camera controller component with smooth animation
function CameraController({ controlsRef, onConstellationFocus, onSubnodeFocus, constellationCenters, nodePositions }) {
  const { camera } = useThree();
  const targetRef = useRef(null);
  const targetPositionRef = useRef(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (!camera) return;

    const focusConstellation = (constellationName) => {
      const center = constellationCenters[constellationName];
      if (!center) return;

      const targetPos = new THREE.Vector3(center[0], center[1], center[2]);
      const currentPos = camera.position.clone();
      const direction = new THREE.Vector3()
        .subVectors(currentPos, targetPos)
        .normalize();
      const distance = 15;
      const newPos = targetPos.clone().add(direction.multiplyScalar(distance));

      targetRef.current = targetPos;
      targetPositionRef.current = newPos;
      isAnimatingRef.current = true;
    };

    const focusSubnode = (nodeId) => {
      const position = nodePositions[nodeId];
      if (!position) return;

      const targetPos = new THREE.Vector3(position[0], position[1], position[2]);
      const currentPos = camera.position.clone();
      const direction = new THREE.Vector3()
        .subVectors(currentPos, targetPos)
        .normalize();
      const distance = 10;
      const newPos = targetPos.clone().add(direction.multiplyScalar(distance));

      targetRef.current = targetPos;
      targetPositionRef.current = newPos;
      isAnimatingRef.current = true;
    };

    if (onConstellationFocus) {
      onConstellationFocus(focusConstellation);
    }
    if (onSubnodeFocus) {
      onSubnodeFocus(focusSubnode);
    }
  }, [camera, constellationCenters, nodePositions, onConstellationFocus, onSubnodeFocus]);

  // Animate camera smoothly
  useFrame(() => {
    if (!isAnimatingRef.current || !targetRef.current || !targetPositionRef.current || !camera) return;
    
    const controls = controlsRef.current;
    if (!controls) return;

    // Animate target
    controls.target.lerp(targetRef.current, 0.05);
    
    // Animate camera position
    camera.position.lerp(targetPositionRef.current, 0.05);
    controls.update();

    // Check if animation is complete
    if (camera.position.distanceTo(targetPositionRef.current) < 0.1) {
      isAnimatingRef.current = false;
    }
  });

  return null;
}

export function StellarMapScene({ 
  coreName, 
  hierarchyData, 
  showWhiteLines,
  onNodeHover,
  onNodeClick,
  hoveredNodeId,
  onConstellationFocus,
  onSubnodeFocus
}) {
  const controlsRef = useRef();
  const [constellationCenters, setConstellationCenters] = useState({});
  const [nodePositions, setNodePositions] = useState({});

  return (
      <Canvas
      camera={{ position: [0, 0, 25], fov: 50 }}
      gl={{ 
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
        logarithmicDepthBuffer: false,
        precision: "lowp"
      }}
      dpr={[0.5, 0.8]}
      performance={{ min: 0.5 }}
      frameloop="always"
      style={{ background: '#101020' }}
    >
      <OrbitControls
        ref={controlsRef}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.5}
        zoomSpeed={1.0}
        panSpeed={0.5}
        minDistance={15}
        maxDistance={500}
        maxPolarAngle={Math.PI}
        enableZoom
        enablePan
        screenSpacePanning={false}
        makeDefault
      />
      
      <CoreSun coreName={coreName} />
      
      <SceneContent
        hierarchyData={hierarchyData}
        showWhiteLines={showWhiteLines}
        onNodeHover={onNodeHover}
        onNodeClick={onNodeClick}
        hoveredNodeId={hoveredNodeId}
        onConstellationCentersReady={setConstellationCenters}
        onNodePositionsReady={setNodePositions}
      />

      <CameraController
        controlsRef={controlsRef}
        onConstellationFocus={onConstellationFocus}
        onSubnodeFocus={onSubnodeFocus}
        constellationCenters={constellationCenters}
        nodePositions={nodePositions}
      />

      {/* Bloom effect disabled for performance - very expensive with many objects */}
      {/* <EffectComposer>
        <Bloom intensity={1.5} radius={0.5} threshold={0.1} />
      </EffectComposer> */}
    </Canvas>
  );
}
