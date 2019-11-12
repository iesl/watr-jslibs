<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <div>
        <TextGraphDev />
      </div>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
/* eslint-disable */
import Logo from '~/components/Logo.vue'
import VuetifyLogo from '~/components/VuetifyLogo.vue'
import TextGraphDev from '~/components/text-graph/text-graph.dev.vue'

const cs = {
  Logo,
  VuetifyLogo,
  TextGraphDev
};

export default {
  components: cs
}
</script>
