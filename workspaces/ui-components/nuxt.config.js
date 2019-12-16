import colors from 'vuetify/es5/util/colors'

import path from 'path';
import util from 'util';
const resolve = path.resolve;


const modulesDir = [
  resolve(__dirname, '../../node_modules/'),
  resolve(__dirname, './node_modules/')
];

const rootDir = __dirname;
const srcDir = resolve( rootDir, 'src');
const tsconfigFile = resolve( rootDir, 'tsconfig.json');



export default {
  rootDir,
  srcDir,
  modulesDir,

  env: {
  },

  typescript: {
    loaders: {
      // ts-loader options
      ts: {
        configFile: tsconfigFile
      }
    }
  },

  mode: 'spa',
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
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },

  /*
   ** Global CSS
   */
  css: [
    '~/assets/sass/main.scss'
  ],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/composition-api'
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify',
    '@nuxt/typescript-build'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios'
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  /*
   ** Build configuration
   */
  build: {
    // You can extend webpack config here
    extend(config, ctx) {
      // const c = util.inspect(config, true, 8, true);
      // const ct = util.inspect(ctx, true, 8, true);
      // console.log('build config:', c);
      // console.log('build ctx:', ct);
    },

    babel: {
      presets({ isServer }, [ preset, options ]) {
        console.log('babel isServer:', isServer);
        console.log('babel pre:', preset);
        console.log('babel opt:', options);
      }
    }
  }

}
