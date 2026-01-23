import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ONBOARDING_STEPS from '../constants/onboardingSteps';

const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showTour, setShowTour] = useState(false); // Controls overall tour visibility
  const [showInstituteSorter, setShowInstituteSorter] = useState(false); // Controls sorter modal
  const navigate = useNavigate();
  const location = useLocation();

  // Function to check and potentially start the onboarding tour
  const startOnboarding = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('has_completed_onboarding')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching onboarding status:', error.message);
          // If there's an error, assume onboarding is needed to not block user
          setShowTour(true);
          if (location.pathname !== ONBOARDING_STEPS[0].route) {
            navigate(ONBOARDING_STEPS[0].route);
          }
          return;
        }

        if (!data?.has_completed_onboarding) {
          // User has not completed onboarding
          setShowTour(true);
          // If not on the first step's route, navigate there to start the tour
          if (location.pathname !== ONBOARDING_STEPS[0].route) {
            navigate(ONBOARDING_STEPS[0].route);
          }
        } else {
          // User has completed onboarding
          setShowTour(false);
        }
      } catch (err) {
        console.error('A critical error occurred while fetching onboarding status:', err);
        setShowTour(true); // Default to showing tour on critical error
      }
    } else {
      setShowTour(false); // Do not show tour if no user is logged in
    }
  }, [location.pathname, navigate]);

  // Effect to run on mount and auth state changes to check onboarding status
  useEffect(() => {
    startOnboarding();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        startOnboarding(); // Re-check onboarding status if auth state changes (e.g., login)
      } else {
        setShowTour(false); // Hide tour if user logs out
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [startOnboarding]);

  // Logic to advance to the next step in the tour
  const nextStep = useCallback(async () => {
    const nextIndex = currentStepIndex + 1;
    const currentStepConfig = ONBOARDING_STEPS[currentStepIndex];

    // Handle special action for the current step
    if (currentStepConfig.specialAction === 'OPEN_SORTER') {
      setShowInstituteSorter(true);
      return; // Do not advance index yet, wait for sorter to complete
    }

    // Handle final step: complete onboarding
    if (nextIndex >= ONBOARDING_STEPS.length) {
      await completeOnboarding();
      return;
    }

    const nextStepConfig = ONBOARDING_STEPS[nextIndex];

    // If the next step has a different route, navigate there first
    if (nextStepConfig.route && nextStepConfig.route !== location.pathname) {
      navigate(nextStepConfig.route);
      // Crucial: Wait for the new page to render before updating the step index
      setTimeout(() => setCurrentStepIndex(nextIndex), 800); // 800ms delay
    } else {
      // If same route or no route change, just update the step index immediately
      setCurrentStepIndex(nextIndex);
    }
  }, [currentStepIndex, location.pathname, navigate, showTour]); // Added showTour to dependencies

  // Function to explicitly mark onboarding as complete in the database
  const completeOnboarding = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ has_completed_onboarding: true })
          .eq('id', user.id);
        if (error) {
          console.error('Error completing onboarding:', error.message);
        }
      } catch (err) {
        console.error('A critical error occurred while completing onboarding:', err);
      }
    }
    setShowTour(false);
    setCurrentStepIndex(0); // Reset index for next time (if re-triggered)
  }, []);

  // Function to skip the entire onboarding tour
  const skipOnboarding = useCallback(async () => {
    await completeOnboarding(); // Mark as complete when skipping
  }, [completeOnboarding]);

  // Handler for when InstituteSorterModal completes
  const handleSorterComplete = useCallback(() => {
    setShowInstituteSorter(false);
    setCurrentStepIndex((prevIndex) => prevIndex + 1); // Advance to the next step after sorter
  }, []);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        currentStepIndex,
        showTour,
        showInstituteSorter,
        nextStep,
        skipOnboarding,
        handleSorterComplete,
        ONBOARDING_STEPS,
        startOnboarding, // Expose startOnboarding for manual re-trigger
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
