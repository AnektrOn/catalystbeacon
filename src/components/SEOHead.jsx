import { useEffect } from 'react'

/**
 * SEO Head component for dynamic meta tags
 * Usage: <SEOHead title="Page Title" description="Page description" />
 */
const SEOHead = ({ 
  title = 'The Human Catalyst Beacon',
  description = 'Transform Your Mind, Transform Your Life - Online learning platform for personal development and mastery',
  keywords = 'personal development, online learning, transformation, mastery, self-improvement',
  image = '/logo512.png',
  url = ''
}) => {
  useEffect(() => {
    // Update document title
    document.title = title

    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name'
      let element = document.querySelector(`meta[${attribute}="${name}"]`)
      
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }
      
      element.setAttribute('content', content)
    }

    // Primary meta tags
    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords)
    
    // Open Graph tags
    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:image', image, true)
    if (url) {
      updateMetaTag('og:url', url, true)
    }
    
    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image', true)
    updateMetaTag('twitter:title', title, true)
    updateMetaTag('twitter:description', description, true)
    updateMetaTag('twitter:image', image, true)
  }, [title, description, keywords, image, url])

  return null
}

export default SEOHead

