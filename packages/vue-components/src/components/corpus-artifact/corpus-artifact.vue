<template lang="html">

  <v-card>
    
    <!-- <a :href="docUrl">
         <v-img
           :src="thumbnailUrl"
           max-height="250px"
           height="200"
           width="200"
           ></v-img>
    </a>
    -->
    <v-card-title primary-title>
      <div>
        <h3>
          <a :href="docUrl">
            <span>{{index}}. {{entryName}}</span>
          </a>
        </h3>
      </div>
      <br />
      <div>
        <span> {{stableId}} </span>
      </div>
    </v-card-title>
    
    <v-card-actions>
      <v-btn flat color="green">Share</v-btn>
    </v-card-actions>
  </v-card>
  
</template>

<script   lang="ts"   src="./corpus-artifact.ts"        ></script>
<style    lang="less" src="./corpus-artifact.less" scoped></style>
