import { supabase } from '../lib/supabaseClient';
import { logDebug, logError } from '../utils/logger';

class StellarMapService {
  /**
   * Get all constellation families for a specific level
   * @param {string} level - Level name ('Ignition', 'Insight', 'Transformation', 'God Mode')
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getFamiliesByLevel(level) {
    try {
      if (!level) {
        return { data: null, error: new Error('Level parameter is required') };
      }

      const { data, error } = await supabase
        .from('constellation_families')
        .select('*')
        .eq('level', level)
        .order('display_order', { ascending: true });

      if (error) {
        logError(`[StellarMapService] Error fetching families for level "${level}":`, error);
        throw error;
      }

      if (!data || data.length === 0) {
      }

      return { data: data || [], error: null };
    } catch (error) {
      logError(error, 'StellarMapService - getFamiliesByLevel error');
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  /**
   * Get all families with their constellations
   * @param {string} level - Level name
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getFamiliesWithConstellations(level) {
    try {
      // Normalize level to match database format (capitalized)
      const normalizedLevel = level 
        ? level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()
        : level;
      
      // Handle special case for "God Mode"
      const finalLevel = normalizedLevel === 'God mode' ? 'God Mode' : normalizedLevel;

      const { data, error } = await supabase
        .from('constellation_families')
        .select(`
          *,
          constellations!inner (
            id,
            name,
            level,
            color_hex,
            display_order
          )
        `)
        .eq('level', finalLevel)
        .eq('constellations.level', finalLevel)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Sort constellations within each family
      if (data) {
        data.forEach(family => {
          if (family.constellations) {
            // Filter constellations by level (double-check, in case the query didn't work)
            family.constellations = family.constellations.filter(
              c => c.level === level
            );
            family.constellations.sort((a, b) => a.display_order - b.display_order);
          }
        });
      }

      if (process.env.NODE_ENV === 'development') {
        const totalConstellationsBefore = data?.reduce((sum, f) => sum + (f.constellations?.length || 0), 0) || 0;
        const constellationsByLevel = {};
        
        data?.forEach(family => {
          if (family.constellations) {
            family.constellations.forEach(c => {
              const cLevel = c.level || 'unknown';
              constellationsByLevel[cLevel] = (constellationsByLevel[cLevel] || 0) + 1;
            });
          }
        });

        logDebug(`[StellarMapService] getFamiliesWithConstellations for level "${level}" (normalized to "${finalLevel}"):`, {
          familiesFound: data?.length || 0,
          totalConstellationsBeforeFilter: totalConstellationsBefore,
          constellationsByLevel: constellationsByLevel,
          warning: constellationsByLevel[finalLevel] !== totalConstellationsBefore 
            ? `Found ${totalConstellationsBefore - (constellationsByLevel[finalLevel] || 0)} constellations with wrong level!` 
            : 'All constellations match the requested level'
        });
      }

      return { data, error: null };
    } catch (error) {
      logError(error, 'StellarMapService - Error fetching families with constellations');
      return { data: null, error };
    }
  }

  /**
   * Get constellations by family ID
   * @param {string} familyId - Family UUID
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getConstellationsByFamily(familyId) {
    try {
      const { data, error } = await supabase
        .from('constellations')
        .select('*')
        .eq('family_id', familyId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError(error, 'StellarMapService - Error fetching constellations by family');
      return { data: null, error };
    }
  }

  /**
   * Get all nodes for a specific constellation
   * @param {string} constellationId - Constellation UUID
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getNodesByConstellation(constellationId) {
    try {
      const { data, error } = await supabase
        .from('stellar_map_nodes')
        .select('*')
        .eq('constellation_id', constellationId)
        .order('difficulty', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError(error, 'StellarMapService - Error fetching nodes by constellation');
      return { data: null, error };
    }
  }

  /**
   * Get all visible nodes for a user based on their XP
   * @param {string} level - Level name
   * @param {number} userXP - User's current XP
   * @param {string} visibilityGroup - 'Fog', 'Lens', 'Prism', or 'Beam'
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getUserVisibleNodes(level, userXP, visibilityGroup) {
    try {
      // Determine difficulty range based on visibility group
      const difficultyRanges = {
        Fog: [0, 2],
        Lens: [3, 5],
        Prism: [6, 8],
        Beam: [9, 10]
      };

      const range = difficultyRanges[visibilityGroup] || [0, 10];
      const [minDifficulty, maxDifficulty] = range;

      // Get all nodes for this level that are within the difficulty range
      // (XP filter removed - show all nodes)
      const { data, error } = await supabase
        .from('stellar_map_nodes')
        .select(`
          *,
          constellations!inner (
            id,
            name,
            level,
            color_hex,
            family_id,
            constellation_families!inner (
              id,
              name,
              level,
              color_hex
            )
          )
        `)
        .eq('constellations.level', level)
        .gte('difficulty', minDifficulty)
        .lte('difficulty', maxDifficulty)
        .order('difficulty', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError(error, 'StellarMapService - Error fetching user visible nodes');
      return { data: null, error };
    }
  }

  /**
   * Get all nodes for a level, grouped by family and constellation
   * @param {string} level - Level name
   * @param {number} userXP - User's current XP
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getNodesGroupedByHierarchy(level, userXP) {
    try {
      if (!level) {
        return { data: null, error: new Error('Level parameter is required') };
      }

      // Normalize level to match database format (capitalized)
      const normalizedLevel = level 
        ? level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()
        : level;
      
      // Handle special case for "God Mode"
      const finalLevel = normalizedLevel === 'God mode' ? 'God Mode' : normalizedLevel;

      const xp = userXP || 0;
      const isDevelopment = process.env.NODE_ENV === 'development';

      // First get families with constellations (pass normalized level)
      const { data: families, error: familiesError } = await this.getFamiliesWithConstellations(finalLevel);
      if (familiesError) {
        logError(familiesError, 'StellarMapService - Failed to fetch families');
        throw familiesError;
      }

      if (!families || families.length === 0) {
        const warning = `[StellarMapService] No families found for level "${level}" (normalized: "${finalLevel}")`;
        if (isDevelopment) {
          // Check if level exists at all in database
          const { data: allLevels } = await supabase
            .from('constellation_families')
            .select('level')
            .order('level');
          const uniqueLevels = [...new Set((allLevels || []).map(f => f.level))];
        }
        return { data: {}, error: null };
      }

      // Build validation maps: constellation_id -> { constellation, family }
      const constellationIdMap = new Map();
      const familyIdMap = new Map();
      
      families.forEach(family => {
        if (!family.id || !family.name) {
          if (isDevelopment) {
          }
          return;
        }

        familyIdMap.set(family.id, family);

        if (family.constellations && Array.isArray(family.constellations)) {
          family.constellations.forEach(constellation => {
            if (!constellation.id || !constellation.name) {
              if (isDevelopment) {
              }
              return;
            }

            // CRITICAL: Validate constellation level matches the requested level
            if (constellation.level && constellation.level !== finalLevel) {
              if (isDevelopment) {
              }
              return; // Skip this constellation - it's for a different level
            }

            // Validate constellation belongs to this family
            if (constellation.family_id && constellation.family_id !== family.id) {
              if (isDevelopment) {
              }
            }

            constellationIdMap.set(constellation.id, {
              constellation,
              family
            });
          });
        }
      });

      // Then get all nodes for this level (XP filter removed - show all nodes)
      const { data: nodes, error: nodesError } = await supabase
        .from('stellar_map_nodes')
        .select(`
          *,
          constellations!inner (
            id,
            name,
            level,
            color_hex,
            family_id
          )
        `)
        .eq('constellations.level', finalLevel)
        .order('difficulty', { ascending: true });

      if (nodesError) {
        logError(nodesError, 'StellarMapService - Failed to fetch nodes');
        throw nodesError;
      }

      // Debug: Check if we got any nodes at all
      if (isDevelopment) {
        // Also check how many nodes exist without XP filter for this level
        const { count: totalNodeCount } = await supabase
          .from('stellar_map_nodes')
          .select(`
            *,
            constellations!inner (
              id,
              level
            )
          `, { count: 'exact', head: true })
          .eq('constellations.level', level);
        
        logDebug(`[StellarMapService] Query results for level "${level}":`, {
          totalNodesInLevel: totalNodeCount || 0,
          nodesLoaded: nodes?.length || 0,
          userXP: xp,
          note: 'XP filter removed - all nodes are visible'
        });

        if ((nodes?.length || 0) === 0 && (totalNodeCount || 0) > 0) {
        }

        if ((totalNodeCount || 0) === 0) {
          // Check what levels have nodes
          const { data: levelsWithNodes } = await supabase
            .from('stellar_map_nodes')
            .select(`
              constellations!inner (level)
            `);
          if (levelsWithNodes && levelsWithNodes.length > 0) {
            const availableLevels = [...new Set(levelsWithNodes.map(n => n.constellations?.level).filter(Boolean))];
          } else {
          }
        }
      }

      // Validate and group nodes by family -> constellation
      const grouped = {};
      const misgroupedNodes = [];
      const validatedNodes = [];

      if (families && nodes) {
        // First pass: validate all nodes
        nodes.forEach(node => {
          if (!node.constellations || !node.constellations.id) {
            if (isDevelopment) {
            }
            misgroupedNodes.push({
              node,
              reason: 'Missing constellation relationship'
            });
            return;
          }

          const constellationId = node.constellations.id;
          const constellationData = constellationIdMap.get(constellationId);

          if (!constellationData) {
            if (isDevelopment) {
            }
            misgroupedNodes.push({
              node,
              reason: `Constellation ${constellationId} not found in level ${level}`
            });
            return;
          }

          const { constellation, family } = constellationData;

          // If constellation is in our map, it's correctly associated with the family for this level
          // We trust that relationship. Only validate level to ensure we don't show wrong-level nodes.
          // Note: The query already filters by level, but we double-check as a safety measure
          const nodeConstellationLevel = node.constellations?.level;
          if (nodeConstellationLevel && nodeConstellationLevel !== finalLevel) {
            if (isDevelopment) {
            }
            misgroupedNodes.push({
              node,
              reason: `Level mismatch: constellation level is ${nodeConstellationLevel}, requested ${finalLevel}`
            });
            return;
          }

          // Optional: Log family_id mismatch for debugging but don't reject the node
          // The constellation is in our map, so it's correctly associated
          if (isDevelopment) {
            const nodeConstellationFamilyId = node.constellations?.family_id;
            if (nodeConstellationFamilyId && nodeConstellationFamilyId !== family.id) {
            }
          }

          // Node passed all validations - add aliases for consistency with 3D view
          const validatedNode = {
            ...node,
            familyAlias: family.name,
            constellationAlias: constellation.name
          };

          validatedNodes.push({
            node: validatedNode,
            family,
            constellation
          });
        });

        // Second pass: group validated nodes
        families.forEach(family => {
          if (!family.name) return;

          grouped[family.name] = {};
          
          if (family.constellations && Array.isArray(family.constellations)) {
            family.constellations.forEach(constellation => {
              if (!constellation.id || !constellation.name) return;

              const constellationNodes = validatedNodes
                .filter(item => item.constellation.id === constellation.id)
                .map(item => item.node);
              
              if (constellationNodes.length > 0) {
                grouped[family.name][constellation.name] = constellationNodes;
              }
            });
          }
        });
      }

      const totalNodes = Object.values(grouped).reduce((sum, constellations) => {
        return sum + Object.values(constellations).reduce((s, nodes) => s + nodes.length, 0);
      }, 0);

      if (isDevelopment) {
        logDebug(
          `[StellarMapService] Data fetch summary for level "${level}":`,
          {
            familiesFound: families.length,
            totalNodesFetched: nodes?.length || 0,
            validatedNodes: validatedNodes.length,
            misgroupedNodes: misgroupedNodes.length,
            totalNodesInResult: totalNodes,
            userXP: xp,
            note: 'XP filter removed - all nodes are visible'
          }
        );

        if (misgroupedNodes.length > 0) {
          // Log misgrouped nodes if needed
        }

        if (totalNodes === 0 && (nodes?.length || 0) > 0) {
        }

        if (totalNodes === 0 && (nodes?.length || 0) === 0) {
        }
      }

      logDebug(
        `[StellarMapService] Loaded ${totalNodes} validated nodes for ${level} (XP: ${xp})` +
        (misgroupedNodes.length > 0 ? `, ${misgroupedNodes.length} misgrouped nodes excluded` : '')
      );

      return { data: grouped, error: null };
    } catch (error) {
      logError(error, 'StellarMapService - getNodesGroupedByHierarchy error');
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  /**
   * Get a single node by ID
   * @param {string} nodeId - Node UUID
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getNodeById(nodeId) {
    try {
      const { data, error } = await supabase
        .from('stellar_map_nodes')
        .select(`
          *,
          constellations (
            id,
            name,
            level,
            color_hex,
            family_id,
            constellation_families (
              id,
              name,
              level,
              color_hex
            )
          )
        `)
        .eq('id', nodeId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError(error, 'StellarMapService - Error fetching node by ID');
      return { data: null, error };
    }
  }

  /**
   * Get constellation center position data (for camera focusing)
   * This would typically be calculated client-side, but we can store metadata
   * @param {string} constellationId - Constellation UUID
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getConstellationMetadata(constellationId) {
    try {
      const { data, error } = await supabase
        .from('constellations')
        .select(`
          *,
          constellation_families (
            id,
            name,
            level,
            color_hex
          )
        `)
        .eq('id', constellationId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError(error, 'StellarMapService - Error fetching constellation metadata');
      return { data: null, error };
    }
  }

  /**
   * Check if a user has already completed a node
   * @param {string} userId - User UUID
   * @param {string} nodeId - Node UUID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async checkNodeCompletion(userId, nodeId) {
    try {
      if (!userId || !nodeId) {
        return { data: null, error: new Error('User ID and Node ID are required') };
      }

      const { data, error } = await supabase
        .from('user_stellar_node_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('node_id', nodeId)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError(error, 'StellarMapService - Error checking node completion');
      return { data: null, error };
    }
  }

  /**
   * Complete a stellar node and award XP
   * @param {string} userId - User UUID
   * @param {string} nodeId - Node UUID
   * @param {number} xpAmount - XP amount to award
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async completeStellarNode(userId, nodeId, xpAmount) {
    try {
      if (!userId || !nodeId) {
        return { data: null, error: new Error('User ID and Node ID are required') };
      }

      if (!xpAmount || xpAmount <= 0) {
        return { data: null, error: new Error('XP amount must be greater than 0') };
      }

      // Check if already completed
      const { data: existing, error: checkError } = await this.checkNodeCompletion(userId, nodeId);
      if (checkError) {
        return { data: null, error: checkError };
      }

      if (existing) {
        return { 
          data: { alreadyCompleted: true, completion: existing }, 
          error: null 
        };
      }

      // Import masteryService dynamically to avoid circular dependencies
      const { default: masteryService } = await import('./masteryService');

      // Award XP
      const { data: xpData, error: xpError } = await masteryService.awardXP(
        userId,
        xpAmount,
        'stellar_map_node',
        `Completed stellar map node: ${nodeId}`
      );

      if (xpError) {
        logError(xpError, 'StellarMapService - Error awarding XP');
        // Continue with completion tracking even if XP award fails
      }

      // Record completion
      const { data: completion, error: completionError } = await supabase
        .from('user_stellar_node_completions')
        .insert({
          user_id: userId,
          node_id: nodeId,
          xp_awarded: xpAmount
        })
        .select()
        .single();

      if (completionError) {
        logError(completionError, 'StellarMapService - Error recording completion');
        return { data: null, error: completionError };
      }

      return { 
        data: { 
          completion, 
          xpAwarded: xpAmount,
          xpTransaction: xpData 
        }, 
        error: null 
      };
    } catch (error) {
      logError(error, 'StellarMapService - Error completing stellar node');
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  /**
   * Get node with completion status for a user
   * @param {string} userId - User UUID
   * @param {string} nodeId - Node UUID
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getNodeWithCompletionStatus(userId, nodeId) {
    try {
      if (!userId || !nodeId) {
        return { data: null, error: new Error('User ID and Node ID are required') };
      }

      // Get node data
      const { data: node, error: nodeError } = await this.getNodeById(nodeId);
      if (nodeError || !node) {
        return { data: null, error: nodeError || new Error('Node not found') };
      }

      // Check completion status
      const { data: completion, error: completionError } = await this.checkNodeCompletion(userId, nodeId);
      if (completionError) {
        // Return node data even if completion check fails
      }

      return {
        data: {
          ...node,
          isCompleted: !!completion,
          completion: completion || null
        },
        error: null
      };
    } catch (error) {
      logError(error, 'StellarMapService - Error getting node with completion status');
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  /**
   * Get completion status for multiple nodes at once (bulk fetch)
   * @param {string} userId - User UUID
   * @param {Array<string>} nodeIds - Array of node UUIDs
   * @returns {Promise<{data: Map<string, Object>, error: Error|null}>}
   */
  async getBulkCompletionStatus(userId, nodeIds) {
    try {
      if (!userId || !nodeIds || nodeIds.length === 0) {
        return { data: new Map(), error: null };
      }

      const { data, error } = await supabase
        .from('user_stellar_node_completions')
        .select('node_id, completed_at, xp_awarded')
        .eq('user_id', userId)
        .in('node_id', nodeIds);

      if (error) throw error;

      // Create a map of node_id -> completion data
      const completionMap = new Map();
      if (data) {
        data.forEach(completion => {
          completionMap.set(completion.node_id, {
            completed: true,
            completedAt: completion.completed_at,
            xpAwarded: completion.xp_awarded
          });
        });
      }

      // Add entries for nodes that aren't completed
      nodeIds.forEach(nodeId => {
        if (!completionMap.has(nodeId)) {
          completionMap.set(nodeId, {
            completed: false,
            completedAt: null,
            xpAwarded: null
          });
        }
      });

      return { data: completionMap, error: null };
    } catch (error) {
      logError(error, 'StellarMapService - Error fetching bulk completion status');
      return { data: new Map(), error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}

const stellarMapService = new StellarMapService();
export default stellarMapService;
