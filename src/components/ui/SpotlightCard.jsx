import * as React from "react"
import { cn } from "../../lib/utils"
import "./SpotlightCard.css"

const SpotlightCard = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const cardRef = React.useRef(null)
    const [mousePosition, setMousePosition] = React.useState({ x: 50, y: 50 })

    const handleMouseMove = React.useCallback((e) => {
      if (!cardRef.current) return

      const rect = cardRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      setMousePosition({ x, y })
    }, [])

    const handleMouseLeave = React.useCallback(() => {
      // Reset to center when mouse leaves
      setMousePosition({ x: 50, y: 50 })
    }, [])

    // Merge refs
    const mergedRef = React.useCallback(
      (node) => {
        cardRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref]
    )

    return (
      <div
        ref={mergedRef}
        className={cn("spotlight-card", className)}
        style={{
          "--mouse-x": `${mousePosition.x}%`,
          "--mouse-y": `${mousePosition.y}%`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SpotlightCard.displayName = "SpotlightCard"

// Sub-components matching the Card API for consistency
const SpotlightCardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("spotlight-card-header", className)}
    {...props}
  />
))
SpotlightCardHeader.displayName = "SpotlightCardHeader"

const SpotlightCardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("spotlight-card-title", className)}
    {...props}
  />
))
SpotlightCardTitle.displayName = "SpotlightCardTitle"

const SpotlightCardDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("spotlight-card-description", className)}
      {...props}
    />
  )
)
SpotlightCardDescription.displayName = "SpotlightCardDescription"

const SpotlightCardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("spotlight-card-content", className)} {...props} />
))
SpotlightCardContent.displayName = "SpotlightCardContent"

const SpotlightCardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("spotlight-card-footer", className)}
    {...props}
  />
))
SpotlightCardFooter.displayName = "SpotlightCardFooter"

export {
  SpotlightCard,
  SpotlightCardHeader,
  SpotlightCardFooter,
  SpotlightCardTitle,
  SpotlightCardDescription,
  SpotlightCardContent,
}
