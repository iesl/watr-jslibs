const path = require('path');
const webpack = require('webpack'); //to access built-in plugins
const ExtractTextPlugin = require('extract-text-webpack-plugin');


const jQueryProvider = new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    'window.jQuery': 'jquery'
});

const config = {
    entry: {
        document: './src/client/annot-main.js',
        browse: './src/client/browse-main.js'
    },

    devtool: 'inline-source-map',

    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },

    module: {
        rules: [
            { test: /\.(css|scss)$/,                   use: ['style-loader', 'css-loader']},
            { test: /\.less$/,                         use: ["style-loader", "css-loader", "less-loader"]},
            { test: /\.(woff|woff2|eot|ttf|otf|svg)$/, use: ['url-loader']},
            { test: /test\.js$/,                       use: ['mocha-loader'], exclude: /node_modules/}
        ]
    },

    plugins: [
        jQueryProvider
    ]
};

module.exports = config;

