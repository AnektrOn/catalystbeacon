/**
 * Import Stellar Map Nodes from JSON file
 * 
 * This script reads a JSON file with node data and generates SQL INSERT statements
 * or directly inserts into Supabase
 * 
 * Usage:
 *   node scripts/importStellarMapNodesFromJSON.js <input.json> [--dry-run]
 */

import { readFileSync, writeFileSync } from 'fs';
import { supabase } from '../src/lib/supabaseClient.js';

// Mapping from JSON names to database names
const FAMILY_NAME_MAPPING = {
  "Energy-Body Engineering": "Energy Architects",
  // Add more mappings as needed
};

const CONSTELLATION_NAME_MAPPING = {
  "Chakra Calibration": "Wheel Harmonizers", // Or create new constellation
  // Add more mappings as needed
};

const CORE_MAPPING = {
  "TRANSFORMATION": "Transformation",
  "IGNITION": "Ignition",
  "INSIGHT": "Insight",
  "GOD_MODE": "God Mode"
};

const XP_THRESHOLDS = {
  Ignition: { Fog: 0, Lens: 3750, Prism: 7500, Beam: 11250 },
  Insight: { Fog: 15000, Lens: 20250, Prism: 25500, Beam: 30750 },
  Transformation: { Fog: 36000, Lens: 52000, Prism: 68000, Beam: 84000 }
};

function calculateXPThreshold(level, difficulty) {
  const thresholds = XP_THRESHOLDS[level] || XP_THRESHOLDS.Transformation;
  if (difficulty >= 9) return thresholds.Beam;
  if (difficulty >= 6) return thresholds.Prism;
  if (difficulty >= 3) return thresholds.Lens;
  return thresholds.Fog;
}

async function importNode(nodeData, dryRun = false) {
  const classification = nodeData.classification;
  const analysis = nodeData.analysis_details;
  
  // Map names
  const familyName = FAMILY_NAME_MAPPING[classification.family_name] || classification.family_name;
  const constellationName = CONSTELLATION_NAME_MAPPING[classification.constellation_name] || classification.constellation_name;
  const coreLevel = CORE_MAPPING[classification.core_node] || classification.core_node;
  
  const difficulty = classification.difficulty_level;
  const xpThreshold = calculateXPThreshold(coreLevel, difficulty);
  
  const metadata = {
    selected_skills: classification.selected_skills || [],
    difficulty_name: classification.difficulty_name
  };
  
  if (dryRun) {
    console.log(`Would insert: ${analysis.title}`);
    console.log(`  Family: ${familyName}, Constellation: ${constellationName}`);
    console.log(`  Difficulty: ${difficulty}, XP Threshold: ${xpThreshold}`);
    return null;
  }
  
  // Get constellation ID
  const { data: constellation, error: constError } = await supabase
    .from('constellations')
    .select('id')
    .eq('name', constellationName)
    .eq('level', coreLevel)
    .single();
  
  if (constError || !constellation) {
    console.error(`Error finding constellation "${constellationName}":`, constError);
    return { error: `Constellation not found: ${constellationName}` };
  }
  
  // Insert node
  const { data, error } = await supabase
    .from('stellar_map_nodes')
    .insert({
      title: analysis.title,
      link: analysis.link,
      constellation_id: constellation.id,
      difficulty: difficulty,
      difficulty_label: classification.difficulty_name,
      xp_threshold: xpThreshold,
      metadata: metadata
    })
    .select()
    .single();
  
  if (error) {
    console.error(`Error inserting node "${analysis.title}":`, error);
    return { error };
  }
  
  console.log(`✅ Inserted: ${analysis.title}`);
  return { data };
}

async function importFromJSON(jsonFilePath, dryRun = false) {
  try {
    const jsonData = JSON.parse(readFileSync(jsonFilePath, 'utf8'));
    const nodes = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    console.log(`Importing ${nodes.length} node(s)...`);
    
    const results = [];
    for (const node of nodes) {
      const result = await importNode(node, dryRun);
      results.push(result);
    }
    
    console.log(`\n✅ Import complete: ${results.filter(r => r && !r.error).length} successful`);
    return results;
  } catch (error) {
    console.error('Error importing nodes:', error);
    throw error;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const jsonFile = args[0];
  const dryRun = args.includes('--dry-run');
  
  if (!jsonFile) {
    console.error('Usage: node importStellarMapNodesFromJSON.js <input.json> [--dry-run]');
    process.exit(1);
  }
  
  importFromJSON(jsonFile, dryRun)
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { importFromJSON, importNode };
