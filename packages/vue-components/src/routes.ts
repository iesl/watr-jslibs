
import Vue, {} from "vue";
import VueRouter from "vue-router";

import Browse from "./pages/browse/browse.vue";
import Callback from "./components/auth/callback";
import authService from "./auth/authService";

Vue.use(VueRouter);

const routes = [
  {path: "/", component: Browse},
  {path: "/profile", component: Browse},
  {path: "/callback", component: Callback},
  // {path: "/document", component: Foo},
  // {path: "/login", component: Foo},
  // {path: "/curate", component: Foo},
];

const router = new VueRouter({
  routes,
  mode: "history",
  base: process.env.BASE_URL,
});


router.beforeEach((to, _from, next) => {
  console.log('router path', to);

  if (to.path === "/" || to.path === "/callback" || authService.isAuthenticated()) {
    return next();
  }

  authService.login({ redirectUri: to.path });
});

export default router;
