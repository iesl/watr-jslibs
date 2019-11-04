
const path = require('path');

module.exports = {
  lintOnSave: false,
  runtimeCompiler: true,
  configureWebpack: {
    // resolve: {
    //   extensions: ['.ts'],
    //   alias: {
    //     '@/': path.resolve(__dirname, './src/'),
    //   }
    // }
  },
  transpileDependencies: [
    /\bvue-awesome\b/
  ]
};
