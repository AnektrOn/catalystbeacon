/**
 * Simplified Webpack configuration overrides
 */

module.exports = function override(config, env) {
  // For production builds, we can disable minification if needed
  // This helps with memory issues on low-resource servers
  if (env === 'production') {
    // Disable source maps to reduce memory usage
    if (process.env.GENERATE_SOURCEMAP === 'false') {
      config.devtool = false;
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
