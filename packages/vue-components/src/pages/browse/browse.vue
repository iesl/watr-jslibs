<script   lang="ts"   src="./browse.ts" />

<style lang="less" scoped>

  .todo {

  }

</style>


<template lang="html">

  <div class="">
    <v-pagination
      v-model="page"
      :length="6"
      :total-visible="6" />

    <input name="" type="text" value="set page"/>
    <span> Displaying ${start} to ${last} of ${count} </span>

    <div>
      <CorpusArtifact v-bind="data" />
    </div>
  </div>

</template>
