/**
 * Script to populate stellar_map_nodes from JSON data
 * 
 * Usage:
 * 1. Prepare your JSON data in the format provided
 * 2. Run this script or use the SQL version
 * 
 * JSON Format:
 * {
 *   "classification": {
 *     "core_node": "TRANSFORMATION",
 *     "family_name": "Energy-Body Engineering",
 *     "constellation_name": "Chakra Calibration",
 *     "difficulty_level": 8,
 *     "difficulty_name": "3D",
 *     "selected_skills": ["self_awareness", "ritual_creation", ...]
 *   },
 *   "analysis_details": {
 *     "title": "Node Title",
 *     "link": "https://..."
 *   }
 * }
 */

// Mapping from JSON names to database names
const FAMILY_NAME_MAPPING = {
  "Energy-Body Engineering": "Energy Architects",
  // Add more mappings as needed
};

const CONSTELLATION_NAME_MAPPING = {
  "Chakra Calibration": "Wheel Harmonizers", // Map to closest match or create new
  // Add more mappings as needed
};

const CORE_MAPPING = {
  "TRANSFORMATION": "Transformation",
  "IGNITION": "Ignition",
  "INSIGHT": "Insight",
  "GOD_MODE": "God Mode"
};

/**
 * Convert JSON node data to SQL INSERT statement
 */
function convertNodeToSQL(nodeData) {
  const classification = nodeData.classification;
  const analysis = nodeData.analysis_details;
  
  // Map names
  const familyName = FAMILY_NAME_MAPPING[classification.family_name] || classification.family_name;
  const constellationName = CONSTELLATION_NAME_MAPPING[classification.constellation_name] || classification.constellation_name;
  const coreLevel = CORE_MAPPING[classification.core_node] || classification.core_node;
  
  // Calculate XP threshold based on difficulty
  // Using the XP thresholds from useXPVisibility.js
  const XP_THRESHOLDS = {
    Ignition: { Fog: 0, Lens: 3750, Prism: 7500, Beam: 11250 },
    Insight: { Fog: 15000, Lens: 20250, Prism: 25500, Beam: 30750 },
    Transformation: { Fog: 36000, Lens: 52000, Prism: 68000, Beam: 84000 }
  };
  
  const difficulty = classification.difficulty_level;
  const thresholds = XP_THRESHOLDS[coreLevel] || XP_THRESHOLDS.Transformation;
  
  // Determine XP threshold based on difficulty level
  let xpThreshold = 0;
  if (difficulty >= 9) xpThreshold = thresholds.Beam;
  else if (difficulty >= 6) xpThreshold = thresholds.Prism;
  else if (difficulty >= 3) xpThreshold = thresholds.Lens;
  else xpThreshold = thresholds.Fog;
  
  // Build metadata JSON
  const metadata = {
    selected_skills: classification.selected_skills || [],
    difficulty_name: classification.difficulty_name
  };
  
  return {
    title: analysis.title,
    link: analysis.link,
    familyName,
    constellationName,
    coreLevel,
    difficulty: difficulty,
    difficultyLabel: classification.difficulty_name,
    xpThreshold,
    metadata
  };
}

/**
 * Generate SQL INSERT statement for a node
 */
function generateSQLInsert(nodeData) {
  const mapped = convertNodeToSQL(nodeData);
  
  return `
INSERT INTO stellar_map_nodes (title, link, constellation_id, difficulty, difficulty_label, xp_threshold, metadata)
SELECT 
  '${mapped.title.replace(/'/g, "''")}',
  '${mapped.link.replace(/'/g, "''")}',
  c.id,
  ${mapped.difficulty},
  '${mapped.difficultyLabel.replace(/'/g, "''")}',
  ${mapped.xpThreshold},
  '${JSON.stringify(mapped.metadata).replace(/'/g, "''")}'::jsonb
FROM constellations c
JOIN constellation_families cf ON c.family_id = cf.id
WHERE c.name = '${mapped.constellationName.replace(/'/g, "''")}'
  AND cf.name = '${mapped.familyName.replace(/'/g, "''")}'
  AND c.level = '${mapped.coreLevel}'
ON CONFLICT DO NOTHING;
`;
}

// Example usage
const exampleNode = {
  "classification": {
    "core_node": "TRANSFORMATION",
    "family_name": "Energy-Body Engineering",
    "constellation_name": "Chakra Calibration",
    "difficulty_level": 8,
    "difficulty_name": "3D",
    "selected_skills": [
      "self_awareness",
      "ritual_creation",
      "quantum_understanding_habit"
    ]
  },
  "analysis_details": {
    "title": "Activating Your Spiritual Potential Through Angels, Crystals, Colors and Metals | Dr. Robert Gilbert",
    "link": "https://www.youtube.com/watch?v=iaAvH7wc9CE"
  }
};

console.log('Example SQL:');
console.log(generateSQLInsert(exampleNode));

module.exports = { convertNodeToSQL, generateSQLInsert };
