import Vue from "vue";

import Vuetify, {
  VApp,
  VContent,
  VLayout,
  VFlex,
  VPagination,
  VCard,
  VCardTitle,
  VCardActions,
  VBtn,
  VImg,
  VInput,
  VTextField,
  VNavigationDrawer,
  VContainer,
  VFooter,
  VToolbar,
  VToolbarSideIcon,
  VToolbarTitle,
  VSpacer,
  VIcon,
  VList,
  VListTile,
  VListTileTitle,
  VListTileAction,
  VListTileContent,
  VDivider,
} from "vuetify/lib";

import "vuetify/src/stylus/app.styl";

// import '@fortawesome/fontawesome-free/css/all.css' // Ensure you are using css-loader
import '@/../node_modules/material-design-icons-iconfont/dist/material-design-icons.css'

// import "@mdi/font/css/materialdesignicons.css"; // Ensure you are using css-loader
// import "@fortawesome/fontawesome-free/css/all.css"; // Ensure you are using css-loader
// only import the icons you use to reduce bundle size
// import "vue-awesome/icons/flag";
// or import all icons if you don't care about bundle size
// import "vue-awesome/icons";
// import Icon from "@/../node_modules/vue-awesome/components/Icon.vue";
// Vue.component("v-icon", Icon);

Vue.use(Vuetify, {
  components: {
    VApp,
    VContent,
    VLayout,
    VFlex,
    VPagination,
    VCard,
    VCardTitle,
    VCardActions,
    VTextField,
    VBtn,
    VImg,
    VInput,
    VNavigationDrawer,
    VToolbar,
    VContainer,
    VFooter,
    VToolbarSideIcon,
    VToolbarTitle,
    VSpacer,
    VIcon,
    VList,
    VListTile,
    VListTileTitle,
    VListTileAction,
    VListTileContent,
    VDivider,
  },
  theme: {
    primary: "#ee44aa",
    secondary: "#424242",
    accent: "#82B1FF",
    error: "#FF5252",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FFC107",
  },
  customProperties: true,
  iconfont: "md",
});
