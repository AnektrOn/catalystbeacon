import { supabase } from '../lib/supabaseClient'

class SocialService {
  /**
   * Get all posts with user information
   */
  async getPosts(limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            full_name,
            avatar_url,
            current_xp,
            level
          )
        `)
        .eq('is_published', true)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Create a new post
   */
  async createPost(postData) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          user_id: postData.userId,
          title: postData.title,
          content: postData.content,
          excerpt: postData.excerpt,
          post_type: postData.type || 'text',
          video_url: postData.videoUrl,
          image_url: postData.imageUrl,
          tags: postData.tags || [],
          is_published: true,
          is_public: true
        }])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Like/unlike a post
   */
  async togglePostLike(postId, userId) {
    try {
      // First check if like exists
      const { data: existingLike, error: checkError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingLike) {
        // Unlike the post
        const { error: deleteError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)

        if (deleteError) throw deleteError

        // Update post likes count
        await this.updatePostLikesCount(postId, -1)
        return { data: { liked: false }, error: null }
      } else {
        // Like the post
        const { error: insertError } = await supabase
          .from('post_likes')
          .insert([{
            post_id: postId,
            user_id: userId
          }])

        if (insertError) throw insertError

        // Update post likes count
        await this.updatePostLikesCount(postId, 1)
        return { data: { liked: true }, error: null }
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Update post likes count
   */
  async updatePostLikesCount(postId, increment) {
    try {
      const { error } = await supabase.rpc('increment_post_likes', {
        post_id: postId,
        increment_value: increment
      })

      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get comments for a post
   */
  async getPostComments(postId, limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_user_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Add a comment to a post
   */
  async addComment(postId, userId, content, parentCommentId = null) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          user_id: userId,
          content,
          parent_comment_id: parentCommentId
        }])
        .select()
        .single()

      if (error) throw error

      // Update post comments count
      await this.updatePostCommentsCount(postId, 1)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Update post comments count
   */
  async updatePostCommentsCount(postId, increment) {
    try {
      const { error } = await supabase.rpc('increment_post_comments', {
        post_id: postId,
        increment_value: increment
      })

      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get user leaderboard
   */
  async getLeaderboard(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          current_xp,
          level
        `)
        .order('current_xp', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get challenges
   */
  async getChallenges(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          challenge_participants!inner (
            user_id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Join a challenge
   */
  async joinChallenge(challengeId, userId) {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .insert([{
          challenge_id: challengeId,
          user_id: userId
        }])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Search posts
   */
  async searchPosts(query, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            full_name,
            avatar_url,
            current_xp,
            level
          )
        `)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)
        .eq('is_published', true)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get user's posts
   */
  async getUserPosts(userId, limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            full_name,
            avatar_url,
            current_xp,
            level
          )
        `)
        .eq('user_id', userId)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

const socialService = new SocialService()
export default socialService
