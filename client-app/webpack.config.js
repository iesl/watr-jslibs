/* global module require __dirname process */

const path = require('path');
const webpack = require('webpack'); //to access built-in plugins
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const htmlDev = new HtmlWebpackPlugin({
    filename: "dev-index.html",
    chunks: ["devapp"]
});
const htmlProd = new HtmlWebpackPlugin({
    filename: "prod-index.html",
    chunks: ["app"]
});

const WebpackMd5Hash = require('webpack-md5-hash');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const TSLintPlugin = require('tslint-webpack-plugin');
const tslinterPlugin = new TSLintPlugin({
    files: ['./src/**/*.ts'],
    config: "./tslint.json"
});



const extractLess = new ExtractTextPlugin({
    // filename: "[name].[contenthash].css",
    filename: "[name].css",
    disable: process.env.NODE_ENV === "development"
});

const config = {

    entry: {
        app: './src/client/page/app-main.js',
        devapp: './src/dev/dev-main.js'
    },

    devtool: 'inline-source-map',
    output: {
        filename: '[name].bundle.js',
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
            // { test: /\.tsx?$/,                         use: ['awesome-typescript-loader']  },
            { test: /\.(css|scss)$/,                   use: ['style-loader', 'css-loader']},
            { test: /\.less$/,
              use: extractLess.extract({
                  use: [{
                      loader: "css-loader"
                  }, {
                      loader: "less-loader"
                  }],
                  // use style-loader in development
                  fallback: "style-loader"
              })
            },
            { test: /\.(woff|woff2|eot|ttf|otf|svg)$/, use: ['url-loader']},
            { test: /test\.js$/,                       use: ['mocha-loader'], exclude: /node_modules/},
            { test: /\.(jpe?g|png|gif|svg)$/i,         use: ['url-loader?limit=10000', 'img-loader']}
        ]
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },

    plugins: [
        tslinterPlugin,
        extractLess,
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
