<template>
<v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
        <PdfPage />
        <!-- <div v-if="initDataReady"> -->
        <!-- <PdfPage :init-data-ready="initDataReady" :textgrid="textgrid" /> -->
        <!-- </div> -->
        <!-- <div v-else=""> -->
        <!-- Still Loading... -->
        <!-- </div> -->
    </v-flex>
</v-layout>
</template>

<script lang="ts" src="./pdf-page-dev.ts"></script>
