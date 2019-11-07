
// const path = require('path')
// const colors = require('vuetify/es5/util/colors').default
// const tailwindJS = path.join(__dirname, 'tailwind.js')

const config = {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: '%s - ' + process.env.npm_package_name,
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },

  srcDir: 'src',

  // /*
  //  ** Customize the progress-bar color
  //  */
  loading: { color: '#000f' },

  // /*
  //  ** Global CSS
  //  */
  // css: ['~assets/css/tailwind.css'],
  // /*
  //  ** Plugins to load before mounting the App
  //  */
  // plugins: [],
  // /*
  //  ** Nuxt.js dev-modules
  //  */
  // buildModules: [
  //   // Doc: https://github.com/nuxt-community/eslint-module
  //   '@nuxtjs/eslint-module',
  //   '@nuxtjs/vuetify',
  //   '@nuxt/typescript-build'
  // ],
  // eslint: {},
  // /*
  //  ** Nuxt.js modules
  //  */
  // modules: [
  //   // Doc: https://axios.nuxtjs.org/usage
  //   '@nuxtjs/axios',
  //   '@nuxtjs/dotenv'
  // ],
  // /*
  //  ** Axios module configuration
  //  ** See https://axios.nuxtjs.org/options
  //  */
  // axios: {},
  // /*
  //  ** vuetify module configuration
  //  ** https://github.com/nuxt-community/vuetify-module
  //  */
  // vuetify: {
  //   customVariables: ['~assets/variables.scss'],
  //   theme: {
  //     dark: true,
  //     themes: {
  //       dark: {
  //         primary: colors.blue.darken2,
  //         accent: colors.grey.darken3,
  //         secondary: colors.amber.darken3,
  //         info: colors.teal.lighten1,
  //         warning: colors.amber.base,
  //         error: colors.deepOrange.accent4,
  //         success: colors.green.accent3
  //       }
  //     }
  //   }
  // },
  // /*
  //  ** Build configuration
  //  */
  build: {
    // filenames: {
    //   app: ({ isDev }) => (isDev ? '[name].[hash].js' : '[chunkhash].js'),
    //   chunk: ({ isDev }) => (isDev ? '[name].[hash].js' : '[chunkhash].js')
    // }
    //   babel: {
    //     plugins: [
    //       ['@babel/plugin-proposal-decorators', { legacy: true }]
    //       // 'transform-decorators-legacy',
    //       // 'transform-class-properties'
    //     ]
    //   },

    //   postcss: {
    //     plugins: [
    //       require('tailwindcss')(tailwindJS),
    //       require('autoprefixer')
    //     ]
    //   },

    //   /*
    //    ** You can extend webpack config here
    //    */
    //   extend(config, ctx) {
    //     // Run ESLint on save
    //     // if (ctx.isDev && ctx.isClient) {
    //     //   config.module.rules.push({
    //     //     enforce: 'pre',
    //     //     test: /\.(js|vue)$/,
    //     //     loader: 'eslint-loader',
    //     //     exclude: /(node_modules)/
    //     //   })
    //     // }
    //   }
  }
}

module.exports = config
