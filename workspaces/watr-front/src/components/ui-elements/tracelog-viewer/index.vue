<template lang="html">
  <div ref="tracelogViewerMount" class="tracelogViewer">
    <div ref="pageViewers" />
    <NarrowingFilter
      v-on:items-selected="onItemsSelected"
      v-on:items-reset="onItemsReset"
      />
  </div>
</template>

<script lang="ts" src="./tracelog-viewer.ts">
// story-name:tracelogViewer?id=1503.00580.pdf.d
// story-title:Tracelog Viewer
// story-category:page
</script>

<style lang="scss" scoped>
.tracelogViewer {
  display: flex;
  flex-direction: row;
}
</style>
