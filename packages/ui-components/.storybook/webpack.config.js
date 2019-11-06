const path = require('path');

const styleRules = {
  test: /\.s?css$/,
  use: [
    'style-loader', 'css-loader', 'postcss-loader',
    {
      loader: 'sass-loader',
      options: {
        // sassOptions: (loaderContext) => {
        //   // More information about available properties https://webpack.js.org/api/loaders/
        //   const { resourcePath, rootContext } = loaderContext;
        //   const relativePath = path.relative(rootContext, resourcePath);

        //   return {
        //     includePaths: [ '../src/assets' ],
        //   };
        // },
      }

    },
    // {
    //   loader: 'sass-resources-loader',
    //   options: {
    //     resources: [
    //       './assets/css/lib/_variables.scss',
    //       './assets/css/lib/_mixins.scss',
    //       './assets/css/style.scss'
    //     ]
    //   }
    // },
    // {
    //   loader: "postcss-loader",
    //   options: {
    //     plugins: [
    //       require("autoprefixer")({
    //         grid: true
    //       })
    //     ]
    //   }
    // }
  ],
  include: path.resolve(__dirname, '../')
};

const imageFileRules = {
  test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
  loader: 'file-loader'
};

const typescriptRules = {
  test: /\.ts$/,
  exclude: /node_modules/,
  use: [
    {
      loader: 'ts-loader',
      options: {
        appendTsSuffixTo: [/\.vue$/],
        transpileOnly: true
      },
    }
  ],
};

module.exports = {
  module: {
    rules: [
      styleRules,
      imageFileRules,
      typescriptRules,
    ]
  },
  resolve:  {
    extensions: ['.js', '.ts', '.tsx', '.vue', '.css', '.less', '.html' ],
    alias: {
      '~': path.resolve(__dirname, '../src/'),
      '@': path.resolve(__dirname, '../src/')
    }
  }
}
