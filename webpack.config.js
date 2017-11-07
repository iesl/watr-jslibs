const path = require('path');

module.exports = {
    entry: {
        document: './src/client/annot-main.js',
        menu: './src/client/menu-main.js'
    },

    devtool: 'inline-source-map',

    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },

    module: {
        rules: [
            { test: /\.(css|scss)$/,                   use: ['style-loader', 'css-loader']},
            { test: /\.less$/,                         use: ['less-loader']},
            { test: /\.(woff|woff2|eot|ttf|otf|svg)$/, use: ['url-loader']}
        ]
    }
};
