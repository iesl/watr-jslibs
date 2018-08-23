/* global module require __dirname process */

const path = require('path');
const webpack = require('webpack'); //to access built-in plugins
const ExtractTextPlugin = require('extract-text-webpack-plugin');


// const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const StyleLintPlugin = require('stylelint-webpack-plugin');

const TSLintPlugin = require('tslint-webpack-plugin');
const tslinterPlugin = new TSLintPlugin({
    files: ['./src/**/*.ts']
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
        removeEmptyChunks: false,
        splitChunks: false,
    },

    module: {
        rules: [
            // { test: /\.ts$/, use: ['ts-loader'], exclude: /node_modules/},
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
        extensions: [ '.tsx', '.ts', '.js' ]
    },

    plugins: [
        // new CleanWebpackPlugin('dist', {}),
        extractLess,
        tslinterPlugin
        // new WebpackMd5Hash(),
        // new MiniCssExtractPlugin({
        //     filename: 'style.[contenthash].css'
        // }),
        // new HtmlWebpackPlugin({
        //     inject: false,
        //     hash: true,
        //     template: './src/index.html',
        //     filename: 'index.html'
        // }),
        // new StyleLintPlugin({
        //     configFile: './stylelint.config.js',
        //     files: './src/scss/*.scss',
        //     syntax: 'scss'
        // })
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
