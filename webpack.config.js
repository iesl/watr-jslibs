/* global module require __dirname process */

const path = require('path');
const webpack = require('webpack'); //to access built-in plugins
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractLess = new ExtractTextPlugin({
    // filename: "[name].[contenthash].css",
    filename: "[name].css",
    disable: process.env.NODE_ENV === "development"
});

const config = {
    // context: path.resolve(__dirname, "app"),

    entry: {
        app: './src/client/page/app-main.js',
        devapp: './src/dev/page/dev-main.js'
    },

    devtool: 'inline-source-map',

    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },

    // { test: /\.less$/,                         use: ["style-loader", "css-loader", "less-loader"]},
    module: {
        rules: [
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

    plugins: [
        extractLess
        // jQueryProvider
    ],

    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        port: 9000,
        publicPath: '/'
    }
};

module.exports = config;
