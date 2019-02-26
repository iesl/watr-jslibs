<template lang="html">

  <div v-bind="(entry, i) in corpusEntries">
    <CorpusArtifact v-bind="entry" />
  </div>

</template>

<script   lang="ts"   src="./corpus-artifact-list.ts"        ></script>
<style    lang="less" src="./corpus-artifact-list.less" scoped></style>
