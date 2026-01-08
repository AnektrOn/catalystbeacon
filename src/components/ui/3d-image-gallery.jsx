import React, { Suspense, useEffect, useMemo, useRef, useState, createContext, useContext } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  OrbitControls,
  Environment,
  Html,
  Sphere,
} from "@react-three/drei"
import { Download, Heart, X } from "lucide-react"

/**
 * Single-file Stellar Node Gallery
 * - Context, Starfield, Galaxy, FloatingNode (sun ball), Modal, and Page in one.
 */

/* =========================
   Node Context (inlined)
   ========================= */

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

const NodeContext = createContext(undefined)

function useNode() {
  const ctx = useContext(NodeContext)
  if (!ctx) throw new Error("useNode must be used within NodeProvider")
  return ctx
}

function NodeProvider({ children }) {
  const [selectedNode, setSelectedNode] = useState(null)

  const nodes = [
    { id: "1", title: "Elegant Invitation", difficulty: 0 },
    { id: "2", title: "Modern Design", difficulty: 1 },
    { id: "3", title: "Vintage Style", difficulty: 2 },
    { id: "4", title: "Minimalist", difficulty: 3 },
    { id: "5", title: "Floral Design", difficulty: 4 },
    { id: "6", title: "Geometric", difficulty: 5 },
    { id: "7", title: "Luxury Gold", difficulty: 6 },
    { id: "8", title: "Rustic Style", difficulty: 7 },
    { id: "9", title: "Dark Modern", difficulty: 8 },
    { id: "10", title: "Colorful Party", difficulty: 9 },
    { id: "11", title: "Geometric Pattern", difficulty: 5 },
    { id: "12", title: "Luxury Design", difficulty: 6 },
    { id: "13", title: "Rustic Charm", difficulty: 7 },
    { id: "14", title: "Modern Dark", difficulty: 8 },
    { id: "15", title: "Party Theme", difficulty: 9 },
    { id: "16", title: "Elegant Script", difficulty: 10 },
    { id: "17", title: "Watercolor Art", difficulty: 8 },
    { id: "18", title: "Botanical", difficulty: 7 },
    { id: "19", title: "Art Deco", difficulty: 9 },
    { id: "20", title: "Marble Luxury", difficulty: 10 },
  ]

  return (
    <NodeContext.Provider value={{ selectedNode, setSelectedNode, nodes }}>
      {children}
    </NodeContext.Provider>
  )
}

/* =========================
   Starfield Background (inlined)
   ========================= */

function StarfieldBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 1)
    mountRef.current.appendChild(renderer.domElement)

    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 10000
    const positions = new Float32Array(starsCount * 3)
    for (let i = 0; i < starsCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, sizeAttenuation: true })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    camera.position.z = 10

    let animationId = 0
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      stars.rotation.y += 0.0001
      stars.rotation.x += 0.00005
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      starsGeometry.dispose()
      starsMaterial.dispose()
    }
  }, [])

  return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0 bg-black" />
}

/* =========================
   Floating Node (Sun Ball) (inlined)
   ========================= */

function FloatingNode({
  node,
  position,
}) {
  const meshRef = useRef(null)
  const rimRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const { setSelectedNode } = useNode()

  const style = useMemo(() => DIFFICULTY_STYLES[node.difficulty] || DIFFICULTY_STYLES[0], [node.difficulty])
  const nodeRadius = useMemo(() => style.size, [style.size])
  const coreGeometryArgs = useMemo(() => [nodeRadius, 16, 16], [nodeRadius])
  const rimGeometryArgs = useMemo(() => [nodeRadius * 1.05, 16, 16], [nodeRadius])

  const targetScale = useMemo(() => hovered ? 1.35 : 1.0, [hovered])
  let lastFrame = 0
  useFrame((state) => {
    if (state.clock.elapsedTime - lastFrame < 0.016) return
    lastFrame = state.clock.elapsedTime
    
    if (meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15)
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    setSelectedNode(node)
  }
  const handlePointerOver = (e) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = "pointer"
  }
  const handlePointerOut = (e) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = "auto"
  }

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Core sphere */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={coreGeometryArgs} />
        <meshBasicMaterial 
          color={style.color} 
          transparent 
          opacity={hovered ? 1.0 : 0.9}
          depthWrite={false}
        />
      </mesh>

      {/* Rim/Halo */}
      <mesh ref={rimRef}>
        <sphereGeometry args={rimGeometryArgs} />
        <meshBasicMaterial 
          color={0x000000} 
          side={THREE.BackSide}
          transparent 
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Label */}
      {hovered && (
        <Html
          position={[0, nodeRadius + 0.5, 0]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div className="px-2 py-1 rounded bg-black/70 text-white text-xs font-medium whitespace-nowrap">
            {node.title}
          </div>
        </Html>
      )}
    </group>
  )
}

/* =========================
   Node Modal (inlined)
   ========================= */

function NodeModal() {
  const { selectedNode, setSelectedNode } = useNode()
  const [isFavorited, setIsFavorited] = useState(false)
  const nodeRef = useRef(null)

  const style = useMemo(() => {
    if (!selectedNode) return DIFFICULTY_STYLES[0]
    return DIFFICULTY_STYLES[selectedNode.difficulty] || DIFFICULTY_STYLES[0]
  }, [selectedNode?.difficulty])

  const handleMouseMove = (e) => {
    if (!nodeRef.current) return
    const rect = nodeRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 15
    const rotateY = (centerX - x) / 15
    nodeRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseEnter = () => {}
  const handleMouseLeave = () => {
    if (nodeRef.current) {
      nodeRef.current.style.transition = "transform 0.5s ease-out"
      nodeRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"
    }
  }

  const toggleFavorite = () => setIsFavorited((v) => !v)
  const handleClose = () => setSelectedNode(null)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  // Early return after all hooks
  if (!selectedNode) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={handleBackdropClick}>
      <div className="relative max-w-md w-full mx-4">
        <button onClick={handleClose} className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10">
          <X className="w-8 h-8" />
        </button>

        <div style={{ perspective: "1000px" }} className="w-full">
          <div
            ref={nodeRef}
            className="relative cursor-pointer rounded-[16px] bg-[#1F2121] p-6 transition-all duration-500 ease-out w-full"
            style={{
              transformStyle: "preserve-3d",
              boxShadow:
                "rgba(0, 0, 0, 0.01) 0px 520px 146px 0px, rgba(0, 0, 0, 0.04) 0px 333px 133px 0px, rgba(0, 0, 0, 0.26) 0px 83px 83px 0px, rgba(0, 0, 0, 0.29) 0px 21px 46px 0px",
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative w-full mb-4 flex items-center justify-center" style={{ height: "200px" }}>
              <div
                className="rounded-full"
                style={{
                  width: "120px",
                  height: "120px",
                  backgroundColor: `#${style.color.toString(16).padStart(6, '0')}`,
                  boxShadow: `0 0 40px rgba(${(style.color >> 16) & 0xFF}, ${(style.color >> 8) & 0xFF}, ${style.color & 0xFF}, 0.6)`,
                }}
              />
            </div>

            <h3 className="text-white text-lg font-semibold mb-2 text-center">{selectedNode.title}</h3>
            <p className="text-gray-400 text-sm text-center mb-4">
              Difficulty: {selectedNode.difficulty}/10
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex h-9 flex-1 items-center justify-center rounded-lg text-base font-medium text-black outline-none transition duration-300 ease-out hover:opacity-80 active:scale-[0.97]"
                style={{ backgroundColor: "#31b8c6" }}
              >
                <div className="flex items-center gap-1.5">
                  <Download className="h-4 w-4" strokeWidth={1.8} />
                  <span>Explore</span>
                </div>
              </button>
              <button
                type="button"
                onClick={toggleFavorite}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-black outline-none transition duration-300 ease-out hover:opacity-80 active:scale-[0.97]"
                style={{ backgroundColor: "#31b8c6" }}
              >
                <Heart className="h-4 w-4" strokeWidth={1.8} fill={isFavorited ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================
   Node Galaxy (inlined)
   ========================= */

function NodeGalaxy() {
  const { nodes } = useNode()

  const nodePositions = useMemo(() => {
    const positions = []
    const numNodes = nodes.length
    const goldenRatio = (1 + Math.sqrt(5)) / 2

    for (let i = 0; i < numNodes; i++) {
      const y = 1 - (i / (numNodes - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = (2 * Math.PI * i) / goldenRatio
      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY
      const layerRadius = 12 + (i % 3) * 4

      positions.push({
        x: x * layerRadius,
        y: y * layerRadius,
        z: z * layerRadius,
        rotationX: Math.atan2(z, Math.sqrt(x * x + y * y)),
        rotationY: Math.atan2(x, z),
        rotationZ: (Math.random() - 0.5) * 0.2,
      })
    }
    return positions
  }, [nodes.length])

  return (
    <>
      <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.15} wireframe />
      </Sphere>
      <Sphere args={[12, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.05} wireframe />
      </Sphere>
      <Sphere args={[16, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.03} wireframe />
      </Sphere>
      <Sphere args={[20, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.02} wireframe />
      </Sphere>

      {nodes.map((node, i) => (
        <FloatingNode key={node.id} node={node} position={nodePositions[i]} />
      ))}
    </>
  )
}

/* =========================
   Page/Component Export
   ========================= */

export default function StellarCardGallerySingle() {
  return (
    <NodeProvider>
      <div className="w-full h-screen relative overflow-hidden bg-black">
        <StarfieldBackground />

        <Canvas
          camera={{ position: [0, 0, 15], fov: 60 }}
          className="absolute inset-0 z-10"
          onCreated={({ gl }) => {
            gl.domElement.style.pointerEvents = "auto"
          }}
        >
          <Suspense fallback={null}>
            <Environment preset="night" />
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={0.6} />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />
            <NodeGalaxy />
            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              minDistance={5}
              maxDistance={40}
              autoRotate={false}
              rotateSpeed={0.5}
              zoomSpeed={1.2}
              panSpeed={0.8}
              target={[0, 0, 0]}
            />
          </Suspense>
        </Canvas>

        <NodeModal />

        <div className="absolute top-4 left-4 z-20 text-white pointer-events-none">
          <h1 className="text-2xl font-bold mb-2">3D Stellar Node Gallery</h1>
          <p className="text-sm opacity-70">Drag to look around • Scroll to zoom • Click nodes to view details</p>
        </div>
      </div>
    </NodeProvider>
  )
}
