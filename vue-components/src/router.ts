import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import ComponentGallery from '@/components/gallery/gallery.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'gallery',
      component: ComponentGallery,
    },
    {
      path: '/other',
      name: 'home',
      component: Home,
    },
  ],
});
