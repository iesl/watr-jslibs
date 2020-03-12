<template lang="html" src="./_inc.html"></template>
<script lang="ts" src="./_inc.ts"></script>
<style lang="scss" scoped >
.extractedTextViewer {
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
.pageTextFrame {
  border: 3px solid white;
  margin: 2px;
  height: auto;
}

.pageTexts {
  overflow: scroll;
  height: 100vh;
}

</style>
