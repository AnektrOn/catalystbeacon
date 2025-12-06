import React from 'react';
import StellarMap from '../components/stellar-map/StellarMap';
import StellarMapErrorBoundary from '../components/stellar-map/StellarMapErrorBoundary';

const StellarMapPage = () => {
  return (
    <div className="w-full h-screen overflow-hidden">
      <StellarMapErrorBoundary>
        <StellarMap />
      </StellarMapErrorBoundary>
    </div>
  );
};

export default StellarMapPage;
