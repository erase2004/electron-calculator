const electronConfigs = require('./webpack.electron.js');
const preloadConfigs = require('./webpack.preload.js');
const reactConfigs = require('./webpack.react.js');

module.exports = [
  preloadConfigs,
  electronConfigs,
  reactConfigs
];
