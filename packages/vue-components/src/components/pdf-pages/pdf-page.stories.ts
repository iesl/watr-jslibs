import {storiesOf} from "@storybook/vue";

import PdfPage from "./pdf-page.vue";

import store from "@/store";

import * as $ from 'jquery';
import { GridTypes } from "sharedLib";


storiesOf("Pdf Page(s)", module)
  .add("single page", () => ({
    store,
    components: {PdfPage},
    template: `
<div v-if="initDataReady">
    <PdfPage :initDataReady='initDataReady' :textgrid='textgrid'/>
</div>
<div v-else="">
    Loading...
</div>
`,
    data () {
      return {
        initDataReady: false,
      };
    },
    methods: {
      textgrid(): GridTypes.Textgrid {
        const self = this as any;
        console.log('getting textgrid');
        return self.textgrid;
      },


    },

    created() {
      $.getJSON('http://localhost:3100/textgrids/textgrid-00.json', (textgrid: GridTypes.Grid) => {
        const self = this as any;
        self.textgrid = textgrid;
        self.initDataReady = true;
      }, (err) => {
        console.log('err', err);
      });
    }
  }))
;
