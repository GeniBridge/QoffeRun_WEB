const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure public path for subdirectory deployment
config.transformer = {
  ...config.transformer,
  publicPath: '/mobile/',
};

module.exports = config;
