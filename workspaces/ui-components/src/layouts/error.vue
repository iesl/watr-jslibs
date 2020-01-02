<template>
<v-app dark>
    <h1 v-if="error.statusCode === 404">
        {{ pageNotFound }}
    </h1>
    <h1 v-else="">
        {{ otherError }}
    </h1>
    <NuxtLink to="/">
        Home page
    </NuxtLink>
</v-app>
</template>

<script lang="ts" src="./error.ts" ></script>

<style scoped>
  h1 {
  font-size: 20px;
  }
</style>
