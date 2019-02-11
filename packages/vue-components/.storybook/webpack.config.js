
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const configPathsPlugin = new TsconfigPathsPlugin({ configFile: './tsconfig.json' });

// const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');
// const VueLoaderPlugin = require('vue-loader/lib/plugin');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractLess = new ExtractTextPlugin({
  filename: "[name].css",
  disable: process.env.NODE_ENV === "development"
});

module.exports = (storybookBaseConfig, configType, config) => {

  config.resolve.extensions.push('.ts', '.tsx', '.vue', '.css', '.less', '.html');

  const rules = [
    // {test: /\.vue$/,
    //   loader: 'vue-loader'
    // },
    {test: /(?!flycheck_)(?:\.ts$)/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            experimentalWatchApi: true,
            appendTsSuffixTo: [/\.vue$/],
            transpileOnly: true // used with ForkTsCheckerWebpackPlugin
          },
        }
      ],
    },

    {test: /\.less$/,
     use: extractLess.extract({
       use: [{
         loader: "css-loader"
       }, {
         loader: "less-loader"
       }],
       fallback: "style-loader"
     })
    },

    {test: /\.styl$/,
      loader: "style-loader!css-loader!stylus-loader"
    }
  ];

  // config.module.rules.push(...rules);
  rules.forEach(rule => config.module.rules.push(rule));

  // config.plugins.push(new VueLoaderPlugin());
  // config.plugins.push(new VuetifyLoaderPlugin());
  config.plugins.push(new ForkTsCheckerWebpackPlugin());
  config.plugins.push(extractLess);


  config.resolve.plugins = config.resolve.plugins || [];
  config.resolve.plugins.push(configPathsPlugin);

  return config;
};












