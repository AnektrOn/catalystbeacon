import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Image as ImageIcon,
  Video,
  FileText,
  Link as LinkIcon,
  Hash,
  Send,
  Loader2
} from 'lucide-react'
import socialService from '../../services/socialService'
import { useAuth } from '../../contexts/AuthContext'

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [postType, setPostType] = useState('text')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    imageUrl: '',
    videoUrl: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const postData = {
        userId: user.id,
        title: formData.title,
        content: formData.content,
        excerpt: formData.content.substring(0, 150) + '...',
        type: postType,
        tags: tagsArray,
        imageUrl: formData.imageUrl || null,
        videoUrl: formData.videoUrl || null
      }

      const { data, error } = await socialService.createPost(postData)

      if (error) {
        return
      }

      // Reset form
      setFormData({
        title: '',
        content: '',
        tags: '',
        imageUrl: '',
        videoUrl: ''
      })

      onPostCreated?.(data)
      onClose()
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto" style={{ width: '100vw', height: '100vh' }}>
      <div className="glass-panel-floating w-full max-w-2xl overflow-y-auto my-auto" style={{ maxHeight: 'calc(100vh - 40px)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Post Type Selector */}
          <div className="flex space-x-2">
            {[
              { id: 'text', label: 'Text', icon: FileText },
              { id: 'image', label: 'Image', icon: ImageIcon },
              { id: 'video', label: 'Video', icon: Video },
              { id: 'link', label: 'Link', icon: LinkIcon }
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setPostType(type.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${postType === type.id
                    ? 'bg-[#B4833D] text-white shadow-md'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
              >
                <type.icon className="w-4 h-4" />
                <span>{type.label}</span>
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What's on your mind?"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B4833D]/50 focus:border-[#B4833D]/50"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Share your thoughts, insights, or experiences..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B4833D]/50 focus:border-[#B4833D]/50 resize-none"
              required
            />
          </div>

          {/* Media URLs based on post type */}
          {postType === 'image' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B4833D]/50 focus:border-[#B4833D]/50"
              />
            </div>
          )}

          {postType === 'video' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Video URL
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B4833D]/50 focus:border-[#B4833D]/50"
              />
            </div>
          )}

          {postType === 'link' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Link URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B4833D]/50 focus:border-[#B4833D]/50"
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="mindfulness, productivity, learning (comma separated)"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B4833D]/50 focus:border-[#B4833D]/50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#B4833D] hover:bg-[#B4833D]/90 rounded-xl text-white font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default CreatePostModal
