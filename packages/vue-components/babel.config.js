
/* global require module __dirname */


module.exports = {
  presets: [
    '@vue/app',
  ],
  plugins: [
    ["module-resolver", {
      "root": ["."],
      "cwd": "packagejson",
      "extensions": [".ts", ".js", ".vue", ".jsx", ".es", ".es6", ".mjs"],
      "alias": {
        "^Src/(.+)": ([, match1]) => {

          const path = require('path');
          const rpath = path.resolve(__dirname, './src');
          console.log('(babel.config.js) __dirname', __dirname);
          console.log('(babel.config.js) rpath', rpath);

          const p = `${rpath}/${match1}`;

          console.log(`(babel.config.js) (Src/..) p: ${p}`);
          return p;
        },
        "^@/(.+)": ([, match1]) => {

          const p = `./src/${match1}`;

          console.log(`(@/..) m: ${match1} p: ${p}`);

          return p;
        }
      }
    }]
  ]

};
