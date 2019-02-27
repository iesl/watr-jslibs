<script lang="ts" src="./corpus-artifact.ts"/>

<template lang="html">

<v-card>
    
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

 style lang="less" scoped>
</style>
