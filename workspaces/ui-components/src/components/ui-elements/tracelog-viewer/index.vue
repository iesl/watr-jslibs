<template lang="html">
    <div ref="tracelogViewerMount" id="tracelog">
        <div ref="pageViewerMount" />
        <NarrowingFilter />
    </div>
</template>

<script lang="ts" src="./tracelog-viewer.ts">
// story-name:tracelogViewer
// story-title:Tracelog Viewer
// story-category:page
</script>

<style lang="scss" scoped>
#tracelog {
  display: flex;
  flex-direction: row;
}

</style>
