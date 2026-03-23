/**
 * Webpack configuration overrides for Create React App (react-app-rewired)
 */

module.exports = function override(config, env) {
  // ESLint's Ajv fails in child compilers — disable the plugin during builds
  if (config.plugins) {
    config.plugins = config.plugins.filter(
      (p) => !p || p.constructor.name !== 'ESLintWebpackPlugin'
    );
  }

  if (env === 'development') {
    config.output = {
      ...config.output,
      chunkFilename: 'static/js/[name].chunk.js',
      pathinfo: false,
    };
    config.optimization = {
      ...config.optimization,
      moduleIds: 'named',
      chunkIds: 'named',
      // Avoid runtimeChunk/splitChunks in dev — can hang webpack-dev-server
    };
  }

  if (env === 'production') {
    // Disable source maps by default; set GENERATE_SOURCEMAP=true to enable
    if (process.env.GENERATE_SOURCEMAP !== 'true') {
      config.devtool = false;

      if (config.optimization && config.optimization.minimizer) {
        config.optimization.minimizer.forEach((minimizer) => {
          if (minimizer.constructor.name === 'TerserPlugin') {
            minimizer.options = minimizer.options || {};
            minimizer.options.sourceMap = false;
            minimizer.options.terserOptions = minimizer.options.terserOptions || {};
            minimizer.options.terserOptions.sourceMap = false;
          }
          if (minimizer.constructor.name === 'CssMinimizerPlugin') {
            minimizer.options = minimizer.options || {};
            minimizer.options.sourceMap = false;
          }
        });
      }

      if (config.module && config.module.rules) {
        config.module.rules.forEach((rule) => {
          if (rule.use) {
            rule.use.forEach((use) => {
              if (use.loader && typeof use.options === 'object') {
                use.options.sourceMap = false;
              }
            });
          }
          if (rule.loader && typeof rule.options === 'object') {
            rule.options.sourceMap = false;
          }
        });
      }
    }

    if (process.env.BUILD_NO_MINIFY === 'true') {
      config.optimization = {
        ...config.optimization,
        minimize: false,
      };
    }

    // Vendor chunk splitting — keeps stable third-party code separate from
    // app code so browsers can cache vendor chunks across deploys
    config.optimization = {
      ...config.optimization,
      runtimeChunk: { name: 'runtime' },
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,

          // React core (highest priority — always needed)
          react: {
            name: 'vendor-react',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            priority: 50,
            enforce: true,
          },

          // React Router
          reactRouter: {
            name: 'vendor-router',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react-router|react-router-dom|@remix-run)[\\/]/,
            priority: 45,
            enforce: true,
          },

          // Three.js + React Three Fiber — only used on StellarMapPage
          three: {
            name: 'vendor-three',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            priority: 40,
            enforce: true,
          },

          // Supabase client
          supabase: {
            name: 'vendor-supabase',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            priority: 35,
            enforce: true,
          },

          // Stripe client (payment pages only)
          stripe: {
            name: 'vendor-stripe',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]@stripe[\\/]/,
            priority: 30,
            enforce: true,
          },

          // Radix UI headless primitives
          radix: {
            name: 'vendor-radix',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            priority: 25,
            enforce: true,
          },

          // Animation (framer-motion, @react-spring)
          animation: {
            name: 'vendor-animation',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](framer-motion|@react-spring)[\\/]/,
            priority: 20,
            enforce: true,
          },

          // All other node_modules
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            minChunks: 1,
            reuseExistingChunk: true,
          },

          // App code shared across 2+ chunks
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
    };
  }

  return config;
};
