const path = require('path');

module.exports = {
  entry: './vtrace/app/vtracer.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(
          path.resolve(__dirname, 'vtrace'),
          'dist')
  }
};
