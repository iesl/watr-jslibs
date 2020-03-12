<template lang="html" src="./_inc.html"></template>
<script lang="ts" src="./_inc.ts"></script>
<style lang="scss" >
.extractedTextViewer {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.pageTextFrame {
  border: 3px solid white;
  margin: 2px;
  height: auto;

  .pageTexts {
    overflow: scroll;
    height: calc(100vh - 200px);
  }
}


</style>
