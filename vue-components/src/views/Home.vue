<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import HelloWorld from '@/components/HelloWorld.vue'; 
import About from '@/views/About.vue';

export default Vue.extend({
    name: 'Home',
    components: {
        HelloWorld,
        About
    },
});
</script>
