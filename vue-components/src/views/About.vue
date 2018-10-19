<template>
  <div class="about">
    <FilterWidget />
  </div>
</template>


<script lang="ts">
import Vue from 'vue';
import { makeFilter } from '@/components/filter-engine/index.vue';
import FilterWidget from '@/components/filter-engine/index.vue';

// const FilterWidget = makeFilter([{}, {}], x => ['TODO']);
// console.log('FilterWidget', FilterWidget);


export default Vue.extend({
  name: 'About',
  components: {
    FilterWidget
  },
});

</script>
