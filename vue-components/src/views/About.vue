<template>
  <div class="about">
    <ComponentGallery />
  </div>
</template>


<script lang="ts">

import Vue from 'vue';
import ComponentGallery from '@/components/gallery/gallery.vue';

export default Vue.extend({
  name: 'About',
  components: {
      ComponentGallery
  },
});

</script>
