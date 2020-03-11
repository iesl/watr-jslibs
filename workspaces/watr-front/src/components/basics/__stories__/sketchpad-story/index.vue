<template lang="html">
    <story-layout>
        <template v-slot:title>
            Sketchlib Core/Trace functionality
        </template>

        <template v-slot:description>
            Basic Shape Drawing and animation for Tracelog viewing
        </template>

        <template v-slot:controls>
            <v-container>
                <v-row>
                    <v-col justify="space-between" cols="4">
                        <v-card>

                            <v-btn-toggle v-model="inkwellToggle">
                                <v-btn>
                                    <v-icon>mdi-format-align-left</v-icon>
                                </v-btn>

                                <v-btn>
                                    <v-icon>mdi-format-align-center</v-icon>
                                </v-btn>

                                <v-btn>
                                    <v-icon>mdi-format-align-right</v-icon>
                                </v-btn>

                                <v-btn>
                                    <v-icon>mdi-format-align-justify</v-icon>
                                </v-btn>
                            </v-btn-toggle>
                            <span>{{ inkwellSelection }}</span>

                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </template>

        <template v-slot:notes>
            Notes...
        </template>

    <template v-slot:main>
        <div class="mountPoint" ref="mountPoint"></div>
    </template>

    </story-layout>
</template>

<script lang="ts" src="./index.ts">
// story-name=sketchpad
// story-title=Sketchpad shape drawing primitives
// story-category=core/elements
</script>
