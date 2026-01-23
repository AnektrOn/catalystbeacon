import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import InstituteSorterModal from '../InstituteSorterModal';
import './OnboardingTour.css';

const OnboardingTour = () => {
  const { 
    currentStep, 
    showTour, 
    nextStep, 
    skipOnboarding, 
    showInstituteSorter, 
    handleSorterComplete 
  } = useOnboarding();
  
  const [spotlightStyles, setSpotlightStyles] = useState({});
  const tourCardRef = useRef(null);
  const [cardPosition, setCardPosition] = useState({});

  // Effect to calculate spotlight and card position
  useLayoutEffect(() => {
    console.log(`OnboardingTour: useLayoutEffect triggered for step ${currentStep?.id || 'N/A'}. showTour: ${showTour}`);
    if (!showTour || !currentStep) {
      console.log("OnboardingTour: Tour not active or no current step. Resetting styles.");
      setSpotlightStyles({});
      setCardPosition({});
      return;
    }

    const updatePositions = () => {
      console.log(`OnboardingTour: updatePositions called for targetId: ${currentStep.targetId}`);
      if (currentStep.targetId) {
        const targetElement = document.getElementById(currentStep.targetId);
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          console.log(`OnboardingTour: Target element found for ${currentStep.targetId}. Rect:`, rect);
          
          // Calculate spotlight styles
          setSpotlightStyles({
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            top: `${rect.top + window.scrollY}px`,
            left: `${rect.left + window.scrollX}px`,
            borderRadius: '8px',
          });

          // Calculate card position relative to spotlight
          const newCardPosition = {};
          switch (currentStep.position) {
            case 'top':
              newCardPosition.bottom = `${window.innerHeight - rect.top + 20}px`;
              newCardPosition.left = `${rect.left + rect.width / 2}px`;
              newCardPosition.transform = 'translateX(-50%)';
              break;
            case 'right':
              newCardPosition.top = `${rect.top + window.scrollY}px`;
              newCardPosition.left = `${rect.right + window.scrollX + 20}px`;
              break;
            case 'bottom':
              newCardPosition.top = `${rect.bottom + window.scrollY + 20}px`;
              newCardPosition.left = `${rect.left + rect.width / 2}px`;
              newCardPosition.transform = 'translateX(-50%)';
              break;
            case 'left':
              newCardPosition.top = `${rect.top + window.scrollY}px`;
              newCardPosition.right = `${window.innerWidth - rect.left + 20}px`;
              break;
            default: // center
              newCardPosition.top = '50%';
              newCardPosition.left = '50%';
              newCardPosition.transform = 'translate(-50%, -50%)';
              break;
          }
          newCardPosition.maxWidth = '400px'; // Limit card width
          setCardPosition(newCardPosition);

        } else {
          console.log(`OnboardingTour: Target element NOT found for ${currentStep.targetId}. Centering card.`);
          // Target not found, center the card and hide spotlight
          setSpotlightStyles({});
          setCardPosition({
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '500px',
          });
        }
      } else {
        console.log("OnboardingTour: No targetId for current step. Centering card.");
        // No targetId, center the card and hide spotlight
        setSpotlightStyles({});
        setCardPosition({
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '500px',
        });
      }
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    // Use a short debounce for scroll to avoid excessive re-renders
    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updatePositions, 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Add a slight delay to ensure all elements are rendered before calculating positions
    const initialDelay = setTimeout(updatePositions, 100); 

    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      clearTimeout(initialDelay);
    };
  }, [showTour, currentStep]);

  if (!showTour) {
    return null;
  }

  // If specialAction is OPEN_SORTER and showInstituteSorter is true, display the modal
  if (currentStep?.specialAction === 'OPEN_SORTER' && showInstituteSorter) {
    return createPortal(
      <InstituteSorterModal
        isOpen={showInstituteSorter}
        onClose={handleSorterComplete} // Allow closing the sorter to advance
        onSave={handleSorterComplete} // onSave should also advance the step
      />,
      document.body
    );
  }

  // Render the regular onboarding tour card
  return createPortal(
    <div className="onboarding-overlay">
      {currentStep?.targetId && Object.keys(spotlightStyles).length > 0 && (
        <div className="onboarding-spotlight" style={spotlightStyles}></div>
      )}
      <div ref={tourCardRef} className="onboarding-tour-card" style={cardPosition}>
        <h3 className="onboarding-card-title cinzel-font">{currentStep?.title}</h3>
        <p className="onboarding-card-content">{currentStep?.content}</p>
        <div className="onboarding-card-actions">
          {/* Conditionally render button based on specialAction, but always 'Next' or 'Start Sorter' then 'Next' */}
          {currentStep?.specialAction === 'OPEN_SORTER' ? (
            <button onClick={nextStep} className="onboarding-button primary">
              Start Sorter
            </button>
          ) : (
            <button onClick={nextStep} className="onboarding-button primary">
              Next
            </button>
          )}
          <button onClick={skipOnboarding} className="onboarding-button secondary">
            Skip Tour
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OnboardingTour;
