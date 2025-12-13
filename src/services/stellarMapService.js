import { supabase } from '../lib/supabaseClient';

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
        console.error(`[StellarMapService] Error fetching families for level "${level}":`, error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn(`[StellarMapService] No families found for level "${level}"`);
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('[StellarMapService] getFamiliesByLevel error:', error);
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
      const { data, error } = await supabase
        .from('constellation_families')
        .select(`
          *,
          constellations (
            id,
            name,
            level,
            color_hex,
            display_order
          )
        `)
        .eq('level', level)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Sort constellations within each family
      if (data) {
        data.forEach(family => {
          if (family.constellations) {
            family.constellations.sort((a, b) => a.display_order - b.display_order);
          }
        });
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching families with constellations:', error);
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
      console.error('Error fetching constellations by family:', error);
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
      console.error('Error fetching nodes by constellation:', error);
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
      // and have XP threshold <= userXP
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
        .lte('xp_threshold', userXP)
        .order('difficulty', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user visible nodes:', error);
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

      const xp = userXP || 0;
      const isDevelopment = process.env.NODE_ENV === 'development';

      // First get families with constellations
      const { data: families, error: familiesError } = await this.getFamiliesWithConstellations(level);
      if (familiesError) {
        console.error('[StellarMapService] Failed to fetch families:', familiesError);
        throw familiesError;
      }

      if (!families || families.length === 0) {
        console.warn(`[StellarMapService] No families found for level "${level}"`);
        return { data: {}, error: null };
      }

      // Build validation maps: constellation_id -> { constellation, family }
      const constellationIdMap = new Map();
      const familyIdMap = new Map();
      
      families.forEach(family => {
        if (!family.id || !family.name) {
          if (isDevelopment) {
            console.warn('[StellarMapService] Family missing id or name:', family);
          }
          return;
        }

        familyIdMap.set(family.id, family);

        if (family.constellations && Array.isArray(family.constellations)) {
          family.constellations.forEach(constellation => {
            if (!constellation.id || !constellation.name) {
              if (isDevelopment) {
                console.warn('[StellarMapService] Constellation missing id or name:', constellation);
              }
              return;
            }

            // Validate constellation belongs to this family
            if (constellation.family_id && constellation.family_id !== family.id) {
              if (isDevelopment) {
                console.warn(
                  `[StellarMapService] Constellation "${constellation.name}" has mismatched family_id: ` +
                  `expected ${family.id}, got ${constellation.family_id}`
                );
              }
            }

            constellationIdMap.set(constellation.id, {
              constellation,
              family
            });
          });
        }
      });

      // Then get all nodes for this level that user can see
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
        .eq('constellations.level', level)
        .lte('xp_threshold', xp)
        .order('difficulty', { ascending: true });

      if (nodesError) {
        console.error('[StellarMapService] Failed to fetch nodes:', nodesError);
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
        
        console.log(`[StellarMapService] Query results for level "${level}":`, {
          totalNodesInLevel: totalNodeCount || 0,
          nodesAfterXPFilter: nodes?.length || 0,
          userXP: xp,
          xpThresholdFilter: `xp_threshold <= ${xp}`,
          minimumXPRequired: level === 'Insight' ? 15000 : level === 'Transformation' ? 36000 : 0
        });

        if ((nodes?.length || 0) === 0 && (totalNodeCount || 0) > 0) {
          console.warn(
            `[StellarMapService] WARNING: ${totalNodeCount} nodes exist for level "${level}" but 0 nodes visible. ` +
            `This means all nodes have xp_threshold > ${xp}. ` +
            `Minimum XP requirements: Insight (15000), Transformation (36000)`
          );
        }

        if ((totalNodeCount || 0) === 0) {
          console.warn(
            `[StellarMapService] WARNING: No nodes exist in database for level "${level}". ` +
            `Check if nodes have been imported for this level.`
          );
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
              console.warn(`[StellarMapService] Node ${node.id} missing constellation relationship`);
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
              console.warn(
                `[StellarMapService] Node ${node.id} (${node.title}) has constellation_id ${constellationId} ` +
                `that is not in level "${level}"`
              );
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
          if (nodeConstellationLevel && nodeConstellationLevel !== level) {
            if (isDevelopment) {
              console.warn(
                `[StellarMapService] Node ${node.id} (${node.title}) belongs to constellation ` +
                `"${constellation.name}" with level "${nodeConstellationLevel}" but requested level is "${level}"`
              );
            }
            misgroupedNodes.push({
              node,
              reason: `Level mismatch: constellation level is ${nodeConstellationLevel}, requested ${level}`
            });
            return;
          }

          // Optional: Log family_id mismatch for debugging but don't reject the node
          // The constellation is in our map, so it's correctly associated
          if (isDevelopment) {
            const nodeConstellationFamilyId = node.constellations?.family_id;
            if (nodeConstellationFamilyId && nodeConstellationFamilyId !== family.id) {
              console.warn(
                `[StellarMapService] Note: Node ${node.id} (${node.title}) has constellation with family_id ${nodeConstellationFamilyId} ` +
                `but is correctly grouped under family ${family.id} (${family.name}) via constellation mapping. ` +
                `This is acceptable - trusting the constellation-family relationship from our map.`
              );
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
        console.log(
          `[StellarMapService] Data fetch summary for level "${level}":`,
          {
            familiesFound: families.length,
            totalNodesFetched: nodes?.length || 0,
            validatedNodes: validatedNodes.length,
            misgroupedNodes: misgroupedNodes.length,
            totalNodesInResult: totalNodes,
            userXP: xp,
            xpThresholds: {
              Insight: { min: 15000 },
              Transformation: { min: 36000 }
            }
          }
        );

        if (misgroupedNodes.length > 0) {
          console.warn(
            `[StellarMapService] Found ${misgroupedNodes.length} misgrouped nodes for level "${level}":`,
            misgroupedNodes.map(item => ({
              nodeId: item.node.id,
              nodeTitle: item.node.title,
              reason: item.reason
            }))
          );
        }

        if (totalNodes === 0 && (nodes?.length || 0) > 0) {
          console.warn(
            `[StellarMapService] WARNING: ${nodes.length} nodes fetched but 0 nodes in result. ` +
            `This could mean:\n` +
            `1. All nodes were filtered out by validation\n` +
            `2. User XP (${xp}) is too low for level "${level}" (Insight needs 15000+, Transformation needs 36000+)\n` +
            `3. No nodes match the constellation-family relationships`
          );
        }

        if (totalNodes === 0 && (nodes?.length || 0) === 0) {
          console.warn(
            `[StellarMapService] No nodes found for level "${level}" with XP threshold <= ${xp}. ` +
            `Check if:\n` +
            `1. Nodes exist in database for this level\n` +
            `2. User XP (${xp}) meets minimum requirements (Insight: 15000+, Transformation: 36000+)\n` +
            `3. Nodes have xp_threshold values that allow visibility`
          );
        }
      }

      console.log(
        `[StellarMapService] Loaded ${totalNodes} validated nodes for ${level} (XP: ${xp})` +
        (misgroupedNodes.length > 0 ? `, ${misgroupedNodes.length} misgrouped nodes excluded` : '')
      );

      return { data: grouped, error: null };
    } catch (error) {
      console.error('[StellarMapService] getNodesGroupedByHierarchy error:', error);
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
      console.error('Error fetching node by ID:', error);
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
      console.error('Error fetching constellation metadata:', error);
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
      console.error('Error checking node completion:', error);
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
        console.error('Error awarding XP:', xpError);
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
        console.error('Error recording completion:', completionError);
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
      console.error('Error completing stellar node:', error);
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
        console.warn('Error checking completion status:', completionError);
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
      console.error('Error getting node with completion status:', error);
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}

const stellarMapService = new StellarMapService();
export default stellarMapService;
