<template>
  <div class="about">
    <FilterWidget />
  </div>
</template>


<script lang="ts">
import Vue from 'vue';
import makeFilter from '@/components/filter-engine/FilterWidget.vue';

const FilterWidget = makeFilter([{}, {}], x => ['TODO']);
console.log('FilterWidget', FilterWidget);

export default Vue.extend({
  name: 'about',
  components: {
    FilterWidget: makeFilter([{}, {}], x => ['TODO']),
  },
});

</script>
