
/* global require module __dirname */

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const configPathsPlugin = new TsconfigPathsPlugin({
  configFile: './tsconfig.json',
  logInfoToStdOut: false,
  logLevel: "INFO",
  extensions: ['.ts', '.tsx', '.vue']
});

const path = require('path');

module.exports = {
  lintOnSave: false,
  runtimeCompiler: true,
  configureWebpack: config => {
    config.resolve.extensions = config.resolve.extensions || [];
    config.resolve.extensions.push('.ts', '.tsx', '.vue', '.css', '.less', '.html');

    config.resolve.alias = config.resolve.alias || {};
    // const rpath = path.resolve(__dirname, 'src');
    const rpath =  __dirname + '/src';
    console.log('(vue.config.js) rpath', rpath);
    console.log('(vue.config.js) __dirname', __dirname);
    config.resolve.alias['Src'] = rpath;


    config.resolve.plugins = config.resolve.plugins || [];
    config.resolve.plugins.push(configPathsPlugin);
  },
  transpileDependencies: [
    /\bvue-awesome\b/
  ]
};

// alias: {
//   '@/': path.resolve(__dirname, './src/'),
// }
