/* global module require __dirname process */

const path = require('path');
const webpack = require('webpack'); //to access built-in plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const devMode = process.env.NODE_ENV !== 'production';

const htmlDev = new HtmlWebpackPlugin({
  filename: "dev-index.html",
  chunks: ["devapp"]
});

const htmlProd = new HtmlWebpackPlugin({
  filename: "prod-index.html",
  chunks: ["app"]
});

const TSLintPlugin = require('tslint-webpack-plugin');

const tslinterPlugin = new TSLintPlugin({
  files: ['./src/**/*.ts'],
  config: "./tslint.json"
});

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const extractLessPlugin = new MiniCssExtractPlugin({
  // Options similar to the same options in webpackOptions.output
  // both options are optional
  filename: "[name].css",
  chunkFilename: "[id].css"
});

const config = {

  entry: {
    app: './src/client/page/app-main',
    devapp: './src/dev/dev-main'
  },

  devtool: 'inline-source-map',
  output: {
    filename: '[name].bundle',
    path: path.resolve(__dirname, 'dist'),
    pathinfo: false
  },

  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: true,
    splitChunks: {
      // chunks: "all"
    }
  },

  module: {
    rules: [
      {test: /\.tsx?$/,
       use: [
         {
           loader: 'ts-loader',
           options: {
             transpileOnly: true,
             experimentalWatchApi: true,
           },
         },
       ],
      },
      { test: /\.(css|scss)$/, use: [
        devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
        'css-loader',
        'postcss-loader',
        'sass-loader'

      ]},
      { test: /\.less$/, use: [
        devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
        'css-loader',
        'less-loader',
      ]},
      { test: /\.(woff|woff2|eot|ttf|otf|svg)$/, use: ['url-loader']},
      { test: /test\.js$/,                       use: ['mocha-loader'], exclude: /node_modules/},
      { test: /\.(jpe?g|png|gif|svg)$/i,         use: ['url-loader?limit=10000', 'img-loader']}
    ]
  },

  resolve: {
    extensions: ['.ts', '.js']
  },

  plugins: [
    tslinterPlugin,
    extractLessPlugin,
    htmlDev, htmlProd,
    new ForkTsCheckerWebpackPlugin()
  ],

  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000,
    publicPath: '/'
  }
};

module.exports = config;
