import React, { useState, useEffect, useRef } from 'react';
import { Palette } from 'lucide-react';
import colorPaletteSwitcher, { getAllPalettes } from '../../utils/colorPaletteSwitcher';
import './ColorPaletteDropdown.css';

const ColorPaletteDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPalette, setCurrentPalette] = useState(colorPaletteSwitcher.getCurrentPalette());
  const dropdownRef = useRef(null);
  const touchStartRef = useRef(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const handlePaletteChange = (event) => {
      setCurrentPalette(event.detail.paletteKey);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Track touch start for mobile scroll detection
    const handleTouchStart = (event) => {
      // Always track touch start position
      touchStartRef.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
        target: event.target,
        time: Date.now()
      };
      isScrollingRef.current = false;
      
      // If touch is inside the dropdown, don't close on touchstart
      if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
        return; // Don't close - allow interaction inside dropdown
      }
    };

    // Track touch move to detect scrolling
    const handleTouchMove = (event) => {
      if (!touchStartRef.current) return;
      
      const touch = event.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      
      // If moved more than 5px, consider it a scroll/pan gesture
      if (deltaX > 5 || deltaY > 5) {
        isScrollingRef.current = true;
      }
    };

    // Only close on touchend if it was a tap (not a scroll)
    const handleTouchEnd = (event) => {
      if (!touchStartRef.current) {
        return;
      }
      
      // If touch ended inside the dropdown, don't close
      if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
        touchStartRef.current = null;
        isScrollingRef.current = false;
        return;
      }
      
      // If user was scrolling/panning, don't close the modal
      if (isScrollingRef.current) {
        touchStartRef.current = null;
        isScrollingRef.current = false;
        return;
      }
      
      // Check if it was a quick tap (less than 300ms) outside the dropdown
      const touchDuration = Date.now() - touchStartRef.current.time;
      if (touchDuration < 300 && !dropdownRef.current.contains(event.target)) {
        // It was a quick tap outside - close the modal
        setIsOpen(false);
      }
      
      touchStartRef.current = null;
      isScrollingRef.current = false;
    };

    window.addEventListener('colorPaletteChanged', handlePaletteChange);
    document.addEventListener('mousedown', handleClickOutside);
    // Use touch events that distinguish between taps and scrolls
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('colorPaletteChanged', handlePaletteChange);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const palettes = getAllPalettes();
  const listRef = useRef(null);
  const dropdownContainerRef = useRef(null);

  const handlePaletteSelect = (paletteKey) => {
    colorPaletteSwitcher.switchTo(paletteKey);
    setIsOpen(false);
  };

  return (
    <div className="color-palette-dropdown-container" ref={dropdownRef} data-color-palette-dropdown>
      <button
        className="color-palette-trigger glass-icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        onTouchEnd={(e) => {
          // Prevent double-firing on mobile
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-label="Change color palette"
        aria-expanded={isOpen}
      >
        <Palette size={18} />
      </button>

      {isOpen && (
        <div 
          className="color-palette-dropdown" 
          ref={dropdownContainerRef}
          onTouchStart={(e) => {
            // Prevent closing when touching inside the dropdown
            e.stopPropagation();
          }}
          onTouchMove={(e) => {
            // Prevent closing when scrolling inside the dropdown
            e.stopPropagation();
          }}
        >
          <div className="color-palette-dropdown-header">
            <span className="color-palette-dropdown-title">Color Themes</span>
          </div>
          <div 
            className="color-palette-dropdown-list" 
            ref={listRef}
            onTouchStart={(e) => {
              // Allow scrolling in the list
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              // Allow scrolling in the list
              e.stopPropagation();
            }}
          >
            {Object.entries(palettes).map(([key, palette], index) => {
              const isValid = palette && palette.light && palette.name;
              
              // Skip if palette structure is invalid
              if (!isValid) {
                return null;
              }
              
              const isSelected = key === currentPalette;
              // Get primary color from light variant (for preview)
              const primaryColor = palette.light['--color-primary'] || '#B4833D';
              
              return (
                <button
                  key={key}
                  className={`color-palette-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handlePaletteSelect(key)}
                  onTouchEnd={(e) => {
                    // Prevent double-firing on mobile
                    e.preventDefault();
                    handlePaletteSelect(key);
                  }}
                  aria-label={`Select ${palette.name} theme`}
                  data-palette-index={index}
                >
                  <div className="color-palette-preview">
                    <div
                      className="color-palette-preview-color"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div 
                      className="color-palette-preview-gradient" 
                      style={{ 
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${palette.light['--color-secondary'] || primaryColor} 100%)` 
                      }} 
                    />
                  </div>
                  <div className="color-palette-info">
                    <span className="color-palette-name">{palette.name}</span>
                    <span className="color-palette-description">{palette.description}</span>
                  </div>
                  {isSelected && (
                    <svg
                      className="color-palette-checkmark"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.3333 4L6 11.3333L2.66667 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPaletteDropdown;
