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

      // Group nodes by family -> constellation
      const grouped = {};
      
      if (families && nodes) {
        families.forEach(family => {
          if (!family.name) {
            console.warn('[StellarMapService] Family missing name:', family);
            return;
          }

          grouped[family.name] = {};
          
          if (family.constellations && Array.isArray(family.constellations)) {
            family.constellations.forEach(constellation => {
              if (!constellation.id || !constellation.name) {
                console.warn('[StellarMapService] Constellation missing id or name:', constellation);
                return;
              }

              const constellationNodes = (nodes || []).filter(
                node => node.constellations?.id === constellation.id
              );
              
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

      console.log(`[StellarMapService] Loaded ${totalNodes} nodes for ${level} (XP: ${xp})`);

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
}

const stellarMapService = new StellarMapService();
export default stellarMapService;
