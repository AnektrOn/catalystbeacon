import React, { useState, useEffect, useRef } from 'react';
import { Palette } from 'lucide-react';
import colorPaletteSwitcher, { getAllPalettes } from '../../utils/colorPaletteSwitcher';
import './ColorPaletteDropdown.css';

const ColorPaletteDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPalette, setCurrentPalette] = useState(colorPaletteSwitcher.getCurrentPalette());
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handlePaletteChange = (event) => {
      setCurrentPalette(event.detail.paletteKey);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('colorPaletteChanged', handlePaletteChange);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('colorPaletteChanged', handlePaletteChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const palettes = getAllPalettes();
  
  // Debug: Log available palettes
  useEffect(() => {
    console.log('🎨 Available color palettes:', Object.keys(palettes));
    console.log('🎨 Total palettes:', Object.keys(palettes).length);
  }, [palettes]);

  const handlePaletteSelect = (paletteKey) => {
    colorPaletteSwitcher.switchTo(paletteKey);
    setIsOpen(false);
  };

  return (
    <div className="color-palette-dropdown-container" ref={dropdownRef} data-color-palette-dropdown>
      <button
        className="color-palette-trigger glass-icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change color palette"
        aria-expanded={isOpen}
      >
        <Palette size={18} />
      </button>

      {isOpen && (
        <div className="color-palette-dropdown">
          <div className="color-palette-dropdown-header">
            <span className="color-palette-dropdown-title">Color Themes</span>
          </div>
          <div className="color-palette-dropdown-list">
            {Object.entries(palettes).map(([key, palette]) => {
              const isSelected = key === currentPalette;
              // Get primary color from light variant (for preview)
              const primaryColor = palette.light['--color-primary'] || '#B4833D';
              
              return (
                <button
                  key={key}
                  className={`color-palette-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handlePaletteSelect(key)}
                  aria-label={`Select ${palette.name} theme`}
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
