"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "src/lib/utils"

export function MiniChart({ data, title = "Mastery", unit = "pts", totalValue }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [displayValue, setDisplayValue] = useState(null)
  const [isHovering, setIsHovering] = useState(false)
  const containerRef = useRef(null)
  
  // Calculate total if not provided
  const calculatedTotal = totalValue !== undefined ? totalValue : (data ? data.reduce((sum, item) => sum + item.value, 0) : 0)
  
  // Calculate max value for scaling the bars
  const maxValue = data && data.length > 0 ? Math.max(...data.map((d) => d.value)) : 100

  useEffect(() => {
    if (hoveredIndex !== null && data[hoveredIndex]) {
      setDisplayValue(data[hoveredIndex].value)
    }
  }, [hoveredIndex, data])

  const handleContainerEnter = () => setIsHovering(true)
  const handleContainerLeave = () => {
    setIsHovering(false)
    setHoveredIndex(null)
    setTimeout(() => {
      setDisplayValue(null)
    }, 150)
  }

  if (!data || data.length === 0) return null

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleContainerEnter}
      onMouseLeave={handleContainerLeave}
      className="group relative w-full p-6 rounded-2xl bg-ethereal-glass border border-ethereal-border backdrop-blur-ethereal transition-all duration-500 hover:bg-ethereal-glass-hover hover:border-ethereal-border/50 flex flex-col gap-4 shadow-ethereal-base h-full justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-ethereal-cyan animate-pulse shadow-[0_0_8px_var(--ethereal-cyan)]" />
          <span className="text-xs font-bold text-ethereal-text/70 tracking-widest uppercase font-heading">{title}</span>
        </div>
        <div className="relative h-7 flex items-center">
          <span
            className={cn(
              "text-lg font-bold tabular-nums transition-all duration-300 ease-out font-heading",
              isHovering && displayValue !== null ? "opacity-100 text-ethereal-cyan" : "opacity-70 text-ethereal-text/80",
            )}
          >
            {(displayValue !== null ? displayValue : calculatedTotal).toFixed(1)}
            <span
              className={cn(
                "text-[10px] font-semibold text-ethereal-text/40 ml-1 transition-opacity duration-300 uppercase",
                "opacity-100",
              )}
            >
              {displayValue !== null ? unit : `Total ${unit}`}
            </span>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-3 h-32 px-1">
        {data.map((item, index) => {
          // Normalize height relative to maxValue, ensuring a minimum height for visibility
          const heightPercentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
          const isHovered = hoveredIndex === index
          const isAnyHovered = hoveredIndex !== null
          const isNeighbor = hoveredIndex !== null && (index === hoveredIndex - 1 || index === hoveredIndex + 1)

          return (
            <div
              key={item.label + index}
              className="relative flex-1 flex flex-col items-center justify-end h-full"
              onMouseEnter={() => setHoveredIndex(index)}
            >
              {/* Bar */}
              <div
                className={cn(
                  "w-7 sm:w-8 rounded-full cursor-pointer transition-all duration-300 ease-out origin-bottom",
                  isHovered
                    ? "opacity-100 shadow-[0_0_15px_rgba(var(--primary),0.4)]"
                    : isNeighbor
                      ? "opacity-60"
                      : isAnyHovered
                        ? "opacity-20"
                        : "opacity-40 group-hover:opacity-50",
                )}
                style={{
                  height: `${Math.max(heightPercentage, 5)}%`,
                  backgroundColor: item.color || 'var(--ethereal-cyan)',
                  transform: isHovered ? "scaleX(1.3) scaleY(1.05)" : isNeighbor ? "scaleX(1.1)" : "scaleX(1)",
                }}
              />

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] font-bold mt-3 transition-all duration-300 font-heading uppercase tracking-tighter",
                  isHovered ? "text-ethereal-text scale-110" : "text-ethereal-text/40",
                )}
              >
                {item.label.charAt(0)}
              </span>

              {/* Tooltip */}
              <div
                className={cn(
                  "absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-ethereal-text text-ethereal-glass text-[10px] font-bold transition-all duration-200 whitespace-nowrap z-10 font-heading shadow-xl",
                  isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none",
                )}
              >
                {item.label}: {item.value.toFixed(1)} {unit}
              </div>
            </div>
          )
        })}
      </div>

      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-ethereal-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  )
}
