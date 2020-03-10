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
// story-name:tracelogViewer?id=1503.00580.pdf.d
// story-title:Tracelog Viewer
// story-category:page
</script>

<style lang="scss" >
.tracelogViewer {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.pageViewersFrame {
  border: 3px solid red;
  margin: 2px;
  height: auto;
}

.pageViewers {
  border: 3px solid yellow;
  margin: 3px;
  overflow: scroll;
  height: 100vh;

  .layers {
    margin: 1em;
    border: 3px solid blue;
    overflow: hidden;
  }
}

</style>
