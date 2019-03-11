<script lang="ts" src="./corpus-artifact.ts"/>

<template lang="html">

<v-card>
    
    <v-card-title primary-title>
        <div>
            <h3>
                <a :href="docUrl">
                    <span>{{index}}. {{entryName()}}</span>
                </a>
            </h3>
        </div>
        <br />
    </v-card-title>
    
</v-card>

</template>

<style lang="less" scoped>
</style>
