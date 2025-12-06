import { supabase } from '../lib/supabaseClient';

class StellarMapService {
  /**
   * Get all constellation families for a specific level
   * @param {string} level - Level name ('Ignition', 'Insight', 'Transformation', 'God Mode')
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getFamiliesByLevel(level) {
    try {
      const { data, error } = await supabase
        .from('constellation_families')
        .select('*')
        .eq('level', level)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching families by level:', error);
      return { data: null, error };
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
      // First get families with constellations
      const { data: families, error: familiesError } = await this.getFamiliesWithConstellations(level);
      if (familiesError) throw familiesError;

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
        .lte('xp_threshold', userXP)
        .order('difficulty', { ascending: true });

      if (nodesError) throw nodesError;

      // Group nodes by family -> constellation
      const grouped = {};
      
      if (families && nodes) {
        families.forEach(family => {
          grouped[family.name] = {};
          
          if (family.constellations) {
            family.constellations.forEach(constellation => {
              const constellationNodes = nodes.filter(
                node => node.constellations?.id === constellation.id
              );
              
              if (constellationNodes.length > 0) {
                grouped[family.name][constellation.name] = constellationNodes;
              }
            });
          }
        });
      }

      return { data: grouped, error: null };
    } catch (error) {
      console.error('Error fetching grouped nodes:', error);
      return { data: null, error };
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
