
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const configPathsPlugin = new TsconfigPathsPlugin({ configFile: './tsconfig.json' });

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractLess = new ExtractTextPlugin({
  filename: "[name].css",
  disable: process.env.NODE_ENV === "development"
});

module.exports = (storybookBaseConfig, configType, config) => {

  config.resolve.extensions.push('.ts', '.tsx', '.vue', '.css', '.less', '.html');

  config.module.rules.push({
    test: /\.ts$/,
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
  });

  config.module.rules.push({
    test: /\.less$/,
    use: extractLess.extract({
      use: [{
        loader: "css-loader"
      }, {
        loader: "less-loader"
      }],
      // use style-loader in development
      fallback: "style-loader"
    })
  });

  config.plugins.push(new ForkTsCheckerWebpackPlugin());
  config.plugins.push(extractLess);
  config.resolve.plugins = config.resolve.plugins || [];
  config.resolve.plugins.push(configPathsPlugin);

  return config;
};










