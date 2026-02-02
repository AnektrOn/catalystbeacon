/**
 * Simplified Webpack configuration overrides
 */

module.exports = function override(config, env) {
  // Fix ESLint "Cannot set properties of undefined (setting 'defaultMeta')" error.
  // ESLint's Ajv fails in child compilers (e.g. html-webpack-plugin). Disable ESLint during build;
  // use "npm run lint" for linting.
  if (config.plugins) {
    config.plugins = config.plugins.filter(
      (p) => !p || p.constructor.name !== 'ESLintWebpackPlugin'
    );
  }

  // For production builds, we can disable minification if needed
  // This helps with memory issues on low-resource servers
  if (env === 'production') {
    // Disable source maps by default in production to prevent JSON.parse errors
    // Source maps are not needed in production and can cause issues when .map files are missing
    if (process.env.GENERATE_SOURCEMAP !== 'true') {
      config.devtool = false;
      
      // Remove source map comments from output files
      // This prevents browsers from trying to load non-existent .map files
      if (config.optimization && config.optimization.minimizer) {
        config.optimization.minimizer.forEach((minimizer) => {
          if (minimizer.constructor.name === 'TerserPlugin') {
            minimizer.options = minimizer.options || {};
            minimizer.options.sourceMap = false;
            minimizer.options.terserOptions = minimizer.options.terserOptions || {};
            minimizer.options.terserOptions.sourceMap = false;
          }
          // Also handle CssMinimizerPlugin
          if (minimizer.constructor.name === 'CssMinimizerPlugin') {
            minimizer.options = minimizer.options || {};
            minimizer.options.sourceMap = false;
          }
        });
      }
      
      // Disable source maps for all loaders
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
    
    // If BUILD_NO_MINIFY is set, disable minification
    if (process.env.BUILD_NO_MINIFY === 'true') {
      config.optimization = {
        ...config.optimization,
        minimize: false,
      };
    }
  }
  
  return config;
};
