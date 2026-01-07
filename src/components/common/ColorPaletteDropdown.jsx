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
    // Support both mouse and touch events for mobile compatibility
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      window.removeEventListener('colorPaletteChanged', handlePaletteChange);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const palettes = getAllPalettes();
  const listRef = useRef(null);
  const dropdownContainerRef = useRef(null);
  
  // #region agent log
  useEffect(() => {
    const totalPalettes = Object.keys(palettes).length;
    fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorPaletteDropdown.jsx:34',message:'Total palettes available',data:{totalPalettes,paletteKeys:Object.keys(palettes)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  }, [palettes]);
  // #endregion

  const handlePaletteSelect = (paletteKey) => {
    colorPaletteSwitcher.switchTo(paletteKey);
    setIsOpen(false);
  };

  // #region agent log
  useEffect(() => {
    if (!isOpen) {
      fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorPaletteDropdown.jsx:50',message:'Dropdown closed',data:{isOpen},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,E'})}).catch(()=>{});
      return;
    }
    
    const checkLayout = () => {
      const hasListRef = !!listRef.current;
      const hasDropdownRef = !!dropdownContainerRef.current;
      
      fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorPaletteDropdown.jsx:57',message:'Checking refs',data:{hasListRef,hasDropdownRef,isOpen},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,E'})}).catch(()=>{});
      
      if (!listRef.current || !dropdownContainerRef.current) {
        fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorPaletteDropdown.jsx:60',message:'Refs not ready',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,E'})}).catch(()=>{});
        return;
      }
      
      const listEl = listRef.current;
      const dropdownEl = dropdownContainerRef.current;
      const items = listEl.querySelectorAll('.color-palette-item');
      
      const listStyles = window.getComputedStyle(listEl);
      const dropdownStyles = window.getComputedStyle(dropdownEl);
      
      // Check if mobile media query is active
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      const isMediaQueryActive = mediaQuery.matches;
      
      const totalContentHeight = Array.from(items).reduce((sum, item) => {
        const itemRect = item.getBoundingClientRect();
        return sum + itemRect.height;
      }, 0);
      const lastItemRect = items[items.length - 1]?.getBoundingClientRect();
      const firstItemRect = items[0]?.getBoundingClientRect();
      const expectedListHeight = lastItemRect ? (lastItemRect.bottom - firstItemRect.top) : 0;
      
      // Check for inline styles or other constraints
      const listInlineHeight = listEl.style.height;
      const dropdownInlineHeight = dropdownEl.style.height;
      
      const data = {
        itemCount: items.length,
        listMaxHeight: listStyles.maxHeight,
        listHeight: listEl.offsetHeight,
        listScrollHeight: listEl.scrollHeight,
        listClientHeight: listEl.clientHeight,
        listOverflowY: listStyles.overflowY,
        listDisplay: listStyles.display,
        listFlexDirection: listStyles.flexDirection,
        listHeightComputed: listStyles.height,
        listMinHeight: listStyles.minHeight,
        listInlineHeight,
        dropdownMaxHeight: dropdownStyles.maxHeight,
        dropdownHeight: dropdownEl.offsetHeight,
        dropdownClientHeight: dropdownEl.clientHeight,
        dropdownScrollHeight: dropdownEl.scrollHeight,
        dropdownOverflowY: dropdownStyles.overflowY,
        dropdownOverflow: dropdownStyles.overflow,
        dropdownDisplay: dropdownStyles.display,
        dropdownFlexDirection: dropdownStyles.flexDirection,
        dropdownInlineHeight,
        isMobile: window.innerWidth <= 768,
        isMediaQueryActive,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
        totalContentHeight,
        expectedListHeight,
        itemHeights: Array.from(items).map((item, i) => ({
          index: i,
          height: item.offsetHeight,
          top: item.offsetTop,
          bottom: item.offsetTop + item.offsetHeight,
          visible: item.offsetTop < listEl.scrollHeight,
          computedDisplay: window.getComputedStyle(item).display,
          computedHeight: window.getComputedStyle(item).height
        }))
      };
      
      fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorPaletteDropdown.jsx:85',message:'Layout measurements',data,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,E'})}).catch(()=>{});
    };
    
    // Check immediately and after delays for layout to settle
    checkLayout();
    const timeout1 = setTimeout(checkLayout, 50);
    const timeout2 = setTimeout(checkLayout, 200);
    const timeout3 = setTimeout(checkLayout, 500);
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [isOpen]);
  // #endregion

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
        <div className="color-palette-dropdown" ref={dropdownContainerRef}>
          <div className="color-palette-dropdown-header">
            <span className="color-palette-dropdown-title">Color Themes</span>
          </div>
          <div className="color-palette-dropdown-list" ref={listRef}>
            {Object.entries(palettes).map(([key, palette], index) => {
              // #region agent log
              const isValid = palette && palette.light && palette.name;
              if (index === 0) {
                fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorPaletteDropdown.jsx:69',message:'Starting palette map render',data:{totalEntries:Object.entries(palettes).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
              }
              // #endregion
              
              // Skip if palette structure is invalid
              if (!isValid) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorPaletteDropdown.jsx:75',message:'Invalid palette filtered out',data:{key,palette:!!palette,hasLight:!!palette?.light,hasName:!!palette?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
                console.warn(`⚠️ Invalid palette structure for key: ${key}`, palette);
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
