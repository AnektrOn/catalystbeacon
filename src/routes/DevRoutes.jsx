import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import SkeletonLoader from '../components/ui/SkeletonLoader';

/**
 * Dev-only routes. Use in App as: {process.env.NODE_ENV === 'development' && <DevRouteElements />}
 * so the direct child of <Routes> is a Fragment (allowed), not a component.
 */
const MasteryTestComponent = React.lazy(() =>
  import(/* webpackChunkName: "dev-mastery-test" */ '../components/test/MasteryTestComponent')
);

const LoadingScreen = () => <SkeletonLoader type="page" />;

/** Fragment of dev Route elements – use inside <Routes> so children are Route, not a component */
export const DevRouteElements = (
  <>
    <Route
      path="/test"
      element={
        <div style={{ padding: '20px', backgroundColor: 'lightblue' }}>
          <h1>TEST ROUTE WORKS!</h1>
          <p>If you can see this, routing is working.</p>
        </div>
      }
    />
    <Route
      path="/mastery-test"
      element={
        <ProtectedRoute>
          <React.Suspense fallback={<LoadingScreen />}>
            <MasteryTestComponent />
          </React.Suspense>
        </ProtectedRoute>
      }
    />
  </>
);

export default DevRouteElements;
