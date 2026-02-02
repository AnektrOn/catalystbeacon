/**
 * Stellar Map Constants
 * Centralized configuration values for the Stellar Map visualization
 */

// Camera animation constants
export const CAMERA_CONFIG = {
  LERP_SPEED: 0.15, // Camera animation speed (was 0.05)
  LERP_SPEED_MAX: 0.3, // Maximum lerp speed with easing
  DISTANCE_EASING_FACTOR: 0.1, // Easing factor based on distance
  ANIMATION_THRESHOLD: 0.05, // Distance threshold to stop animation
  INITIAL_POSITION: [0, 0, 25],
  FOV: 60,
  MIN_DISTANCE: 15,
  MAX_DISTANCE: 500,
  FOCUS_DISTANCE_CONSTELLATION: 15,
  FOCUS_DISTANCE_NODE: 10
};

// OrbitControls configuration
export const ORBIT_CONTROLS_CONFIG = {
  DAMPING_FACTOR: 0.1,
  ROTATE_SPEED: 0.5,
  ZOOM_SPEED: 1.0,
  PAN_SPEED: 0.5,
  MIN_DISTANCE: 15,
  MAX_DISTANCE: 500
};

// Node rendering constants
export const NODE_CONFIG = {
  SPRITE_SIZE_BASE: 0.3, // Base sprite size in 3D units
  SPRITE_SIZE_INCREMENT: 0.05, // Size increment per difficulty level
  SPRITE_SIZE_MAX: 0.8, // Maximum sprite size
  TEXTURE_SIZE: 128, // Canvas texture size in pixels
  TEXTURE_RADIUS_BASE: 20, // Base radius in pixels (difficulty 0)
  TEXTURE_RADIUS_INCREMENT: 3, // Radius increment per difficulty
  TEXTURE_RADIUS_MAX: 50, // Maximum radius (difficulty 10)
  HOVER_SCALE: 1.15, // Scale factor on hover
  INTERACTION_SIZE_MULTIPLIER: 1.2 // Interaction plane size multiplier
};

// Canvas/WebGL configuration
export const RENDER_CONFIG = {
  DPR_MIN: 0.5,
  DPR_MAX: 1.0,
  PERFORMANCE_MIN: 0.3,
  ANTIALIAS: false,
  ALPHA: true,
  POWER_PREFERENCE: 'high-performance',
  STENCIL: false,
  DEPTH: true,
  LOGARITHMIC_DEPTH_BUFFER: false,
  PRECISION: 'lowp'
};

// Family and constellation placement
export const PLACEMENT_CONFIG = {
  FAMILY_PLACEMENT_SCALE: 0.6, // Scale down placement radius
  CONSTELLATION_MARGIN: 0.5
};

// CoreSun animation
export const CORESUN_CONFIG = {
  ANIMATION_THROTTLE: 0.1, // Update every 0.1s (~10fps)
  FLARE_ROTATION_SPEED: 0.001, // Slower rotation for flares
  FLARE_COUNT_IGNITION: 3,
  FLARE_COUNT_INSIGHT: 5,
  FLARE_COUNT_TRANSFORMATION: 8,
  SPHERE_SEGMENTS_CORE: 10,
  SPHERE_SEGMENTS_CORONA: 8,
  SCALE: 0.6
};

// Starfield background
export const STARFIELD_CONFIG = {
  STAR_COUNT: 10000,
  ROTATION_SPEED: 0.0001
};

// LOD (Level of Detail) for nodes based on camera distance
export const LOD_CONFIG = {
  NEAR_DISTANCE: 35,   // Full node (sprite + interaction) within this distance
  FAR_DISTANCE: 120    // Beyond this, node is not rendered (or use simple dot)
};
