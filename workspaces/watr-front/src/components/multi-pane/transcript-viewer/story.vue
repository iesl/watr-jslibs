<script lang="ts">
// story-name=extractedTextViewer
// story-args=id=austenite.pdf.d
// story-title= Two Panel: [PageImage | Text]
import StoryComponent from './index.vue'
export default {
  components: { StoryComponent }
}
</script>

<template lang="html">
  <story-layout>

    <template v-slot:title>
      Pdf Page + Text Viewer
    </template>

    <template v-slot:description>
    </template>

    <template v-slot:controls>
      <v-container>
        <v-row>
          <v-col />
        </v-row>
      </v-container>
    </template>

    <template v-slot:notes>
      Notes...
    </template>

    <template v-slot:main>
      <StoryComponent />
    </template>

  </story-layout>
</template>
