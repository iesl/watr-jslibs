const path = require('path');
const webpack = require('webpack'); //to access built-in plugins

const config = {
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
    },


    plugins: [
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'window.jQuery': 'jquery',
                Popper: ['popper.js', 'default']
                // In case you imported plugins individually, you must also require them here:
                // Util: "exports-loader?Util!bootstrap/js/dist/util",
                // Dropdown: "exports-loader?Dropdown!bootstrap/js/dist/dropdown",
            })
    ]
};

module.exports = config;
