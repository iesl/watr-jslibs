<template lang="html">
    <layout>

        <template v-slot:title>
            Pdf page display, selection, etc
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
            <div class="mountPoint" ref="mountPoint"></div>
        </template>

    </layout>
</template>

<script lang="ts" src="./pdf-page-story.ts">
// story-name=pdfPageViewer
// story-title=Pdf Page Viewer
</script>
