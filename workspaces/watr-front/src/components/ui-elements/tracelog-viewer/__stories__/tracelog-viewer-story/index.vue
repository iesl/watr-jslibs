<template lang="html">

    <layout>

        <template v-slot:title>
            Visual Tracelog Viewer
        </template>

        <template v-slot:description>
            Visualizations for Text Extraction/Analysis
        </template>

        <template v-slot:controls>
            <v-container>
                <v-row>
                    <v-col> Control Panel </v-col>
                </v-row>
            </v-container>
        </template>

        <template v-slot:notes>
            Todo: Notes...
        </template>

        <template v-slot:main>
            <TracelogViewer />
        </template>
    </layout>

</template>

<script lang="ts">
  import TracelogViewer from '~/components/ui-elements/tracelog-viewer/index.vue'
  export default {
    components: { TracelogViewer }
  }
</script>
