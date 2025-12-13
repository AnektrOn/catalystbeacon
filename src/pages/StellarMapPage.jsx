import React from 'react';
import StellarMap from '../components/stellar-map/StellarMap';
import StellarMapErrorBoundary from '../components/stellar-map/StellarMapErrorBoundary';

const StellarMapPage = () => {
  return (
    <div className="w-full h-screen overflow-hidden" style={{ padding: 0, margin: 0 }}>
      <StellarMapErrorBoundary>
        <StellarMap />
      </StellarMapErrorBoundary>
    </div>
  );
};

export default StellarMapPage;
