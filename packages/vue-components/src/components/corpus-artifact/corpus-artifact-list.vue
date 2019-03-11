<script lang="ts" src="./corpus-artifact-list.ts" />

<template lang="html">

<div>
    
    <v-container>
        <v-layout row align-center justify-start>
            <v-flex>
                <span>
                    Displaying {{ start }} to {{ last }} of {{ corpusSize }}
                </span>
            </v-flex>
            <v-flex>
                <v-btn class="prev-page">
                    <v-icon dark small >chevron_left</v-icon>
                    <v-icon dark small >chevron_left</v-icon>
                </v-btn>
            </v-flex>
            
            <v-flex>
                <v-text-field label="page"> </v-text-field>
            </v-flex>
            <v-flex>
                <v-btn class="prev-page">
                    <v-icon dark small >chevron_right</v-icon>
                    <v-icon dark small >chevron_right</v-icon>
                </v-btn>
            </v-flex>
            
        </v-layout>
    </v-container>
    
    <v-container>
        <v-layout row wrap align-start justify-start>
            <v-flex  v-for="item in this.corpusEntries" :key="item.stableId">
                <CorpusArtifact v-bind="item"/>
            </v-flex>
        </v-layout>
    </v-container>
    
</div>


</template>

<style lang="less" scoped></style>
