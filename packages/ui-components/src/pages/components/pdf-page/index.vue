<template>
<v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
        <div v-if="initDataReady">
            <PdfPage :init-data-ready="initDataReady" :textgrid="textgrid" />
        </div>
        <div v-else="">
            Still Loading...
        </div>
    </v-flex>
</v-layout>
</template>

<script lang="ts">

/* eslint-disable */
import PdfPage from '~/components/pdf-pages/pdf-page.vue'
import { asyncGetJson } from "~/lib/dev-helpers";
import { GridTypes } from "sharedLib";

export default {
  components: {
    PdfPage
  },
  
  data () {
    return {
      initDataReady: false,
    };
  },
  methods: {
    textgrid(): GridTypes.Textgrid {
      const self = this;
      // const self = <any>this;
      console.log('getting textgrid');
      return self.textgrid;
    },
    
    
  },
  
  created() {
    const self = this;
    // const self = <any>this;
    asyncGetJson<GridTypes.Grid>('http://localhost:3100/textgrids/textgrid-00.json')
      .then((textgrid: GridTypes.Grid) => {
        self.textgrid = textgrid;
        console.log('textgrid?', textgrid);
        self.initDataReady = true;
      })
      .catch(err => console.log('err', err))
    ;
  }
}
</script>
