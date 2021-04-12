const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/preload/preload.ts',
  target: 'electron-preload',
  // devtool: 'inline-source-map',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [{
      test: /\.ts$/,
      include: /preload/,
      use: [{ loader: 'ts-loader' }]
    }]
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'preload.js'
  }
}
