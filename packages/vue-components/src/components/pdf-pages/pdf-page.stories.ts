import {storiesOf} from "@storybook/vue";
// import { Vue, Component, Prop, Watch } from "vue-property-decorator";

import PdfPage from "./pdf-page.vue";

import store from "../../store";

import { asyncGetJson } from "../../lib/dev-helpers";

// import * as $ from 'jquery';
import { GridTypes } from "sharedLib";


const singlePageStory = {
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
      const self = this as any;
      asyncGetJson<GridTypes.Grid>('http://localhost:3100/textgrids/textgrid-00.json')
        .then((textgrid: GridTypes.Grid) => {
          self.textgrid = textgrid;
          console.log('textgrid?', textgrid);
          self.initDataReady = true;
        })
        .catch(err => console.log('err', err))
      ;
    }
};


storiesOf("Pdf Page(s)", module)
  .add("single page", () => singlePageStory) ;
