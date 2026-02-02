import React, { useState, useEffect } from 'react';
import { NativeBiometric } from 'capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../../contexts/AuthContext';
import { Fingerprint, FaceId, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Biometric Login Component
 * Provides biometric authentication option
 */
const BiometricLogin = ({ onSuccess, onError }) => {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  /**
   * Check if biometric authentication is available
   */
  const checkBiometricAvailability = async () => {
    if (!Capacitor.isNativePlatform()) {
      setIsAvailable(false);
      return;
    }

    try {
      const available = await NativeBiometric.isAvailable();
      setIsAvailable(available.isAvailable);
      setBiometricType(available.biometryType);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
    }
  };

  /**
   * Authenticate using biometrics
   */
  const authenticate = async () => {
    if (!isAvailable) {
      toast.error('Biometric authentication not available');
      return;
    }

    setIsLoading(true);

    try {
      // Check if credentials are stored
      const stored = await NativeBiometric.getCredentials({
        server: 'hcbeacon'
      });
      
      if (!stored || !stored.username) {
        toast.error('No stored credentials found. Please log in with email/password first.');
        setIsLoading(false);
        return;
      }

      // Authenticate with biometrics
      await NativeBiometric.verifyIdentity({
        reason: 'Authenticate to access your account',
        title: 'Biometric Authentication',
        subtitle: 'Use your biometric to sign in',
        description: 'Place your finger on the sensor or use Face ID',
        useFallback: true
      });

      // If we get here, authentication succeeded
      // Retrieve stored credentials
      const credentials = await NativeBiometric.getCredentials({
        server: 'hcbeacon'
      });
      
      if (onSuccess) {
        onSuccess(credentials);
      } else {
        // Default: try to sign in with stored credentials
        toast.success('Biometric authentication successful');
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      if (onError) {
        onError(error);
      } else {
        toast.error('Biometric authentication error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Store credentials for biometric login
   * Call this after successful email/password login
   */
  const storeCredentials = async (username, password) => {
    if (!isAvailable) {
      return;
    }

    try {
      await NativeBiometric.setCredentials({
        username: username,
        password: password,
        server: 'hcbeacon'
      });
      toast.success('Credentials stored for biometric login');
    } catch (error) {
      console.error('Error storing credentials:', error);
      toast.error('Failed to store credentials');
    }
  };

  /**
   * Get biometric icon based on type
   */
  const getBiometricIcon = () => {
    if (biometricType === 'faceId' || biometricType === 'face') {
      return <FaceId className="w-6 h-6" />;
    }
    return <Fingerprint className="w-6 h-6" />;
  };

  /**
   * Get biometric label
   */
  const getBiometricLabel = () => {
    if (biometricType === 'faceId' || biometricType === 'face') {
      return 'Face ID';
    }
    if (biometricType === 'touchId' || biometricType === 'fingerprint') {
      return 'Touch ID';
    }
    return 'Biometric';
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <div className="biometric-login">
      <button
        onClick={authenticate}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`Sign in with ${getBiometricLabel()}`}
      >
        {isLoading ? (
          <Lock className="w-6 h-6 animate-spin" />
        ) : (
          getBiometricIcon()
        )}
        <span>{isLoading ? 'Authenticating...' : `Sign in with ${getBiometricLabel()}`}</span>
      </button>
    </div>
  );
};

// Export function to store credentials (for use in LoginForm)
export const storeBiometricCredentials = async (username, password) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const { NativeBiometric } = await import('capacitor-native-biometric');
    const available = await NativeBiometric.isAvailable();
    
    if (available.isAvailable) {
      await NativeBiometric.setCredentials({
        username: username,
        password: password,
        server: 'hcbeacon'
      });
    }
  } catch (error) {
    console.error('Error storing biometric credentials:', error);
  }
};

export default BiometricLogin;
