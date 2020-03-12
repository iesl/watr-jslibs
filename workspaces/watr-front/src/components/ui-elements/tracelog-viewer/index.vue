<template lang="html">
  <div ref="tracelogViewerMount" class="tracelogViewer">
    <div class="pageViewersFrame">
      <div ref="pageViewers" class="pageViewers" />
    </div>
    <NarrowingFilter
      @items-selected="onItemsSelected"
      @items-reset="onItemsReset"
      />
  </div>
</template>

<script lang="ts" src="./tracelog-viewer.ts">
</script>

<style lang="scss" >
.tracelogViewer {
  display: flex;
  flex-direction: row;
  height: 100%;
}

</style>
