<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <div class="text-center">
        <logo />
        <vuetify-logo />
      </div>
      <div>
        <TextGraphDev />
      </div>
      <v-card>
        <v-card-title class="headline">
          Hi to the Vuetify + Nuxt.js template
        </v-card-title>
        <v-card-text>
          <p>
            Vuetify is a progressive Material Design component framework for
            Vue.js. It was designed to empower developers to create amazing
            applications.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" nuxt to="/inspire">
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
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
// let cs = {}
// if (process.client) {
// } else {
//   cs = {
//     Logo,
//     VuetifyLogo,
//   }
// }

export default {
  components: cs
}
</script>
