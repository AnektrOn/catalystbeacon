/**
 * Webpack configuration overrides for Create React App
 * Using react-app-rewired to customize webpack without ejecting
 */

module.exports = function override(config, env) {
  // Optimize bundle splitting
  config.optimization = {
    ...config.optimization,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        
        // React and React-DOM chunk (highest priority)
        react: {
          name: 'react',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
          priority: 40,
          enforce: true
        },
        
        // React Router chunk
        reactRouter: {
          name: 'react-router',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](react-router|react-router-dom|@remix-run)[\\/]/,
          priority: 35,
          enforce: true
        },
        
        // Supabase chunk (can be lazy loaded where possible)
        supabase: {
          name: 'supabase',
          chunks: 'all',
          test: /[\\/]node_modules[\\/]@supabase[\\/]/,
          priority: 30,
          enforce: true
        },
        
        // Stripe chunk (only needed on payment pages)
        stripe: {
          name: 'stripe',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](@stripe|stripe)[\\/]/,
          priority: 25,
          enforce: true
        },
        
        // Radix UI components chunk
        radix: {
          name: 'radix-ui',
          chunks: 'all',
          test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
          priority: 20,
          enforce: true
        },
        
        // Other vendor libraries
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          minChunks: 1,
          reuseExistingChunk: true
        },
        
        // Common code shared across chunks
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    
    // Optimize runtime chunk
    runtimeChunk: {
      name: 'runtime'
    }
  };

  // Enable better tree-shaking
  config.optimization.usedExports = true;
  config.optimization.sideEffects = false;

  return config;
};

