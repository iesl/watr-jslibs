import {storiesOf} from "@storybook/vue";

import PdfPage from "./pdf-page.vue";

import store from "@/store";

// import * as fs from 'file-system';
import * as $ from 'jquery';
import { GridTypes } from "sharedLib";

const textGrid00File = './dev-data/textgrids/textgrid-00.json';
// const textGrid00: string = fs.readFileSync(textGrid00File, { encoding: 'utf8' });
// const grids: GridTypes.Grid = GridTypes.Convert.toGrid(textGrid00);



storiesOf("Pdf Page(s)", module)
  .add("single page", () => ({
    store,
    components: {PdfPage},
    template: "<PdfPage :textgrid='textgrid'/>",
    data: {

    },
    methods: {
      get textgrid(): GridTypes.Textgrid { return this.textgrid; },

      mounted() {

        $.getJSON('http://localhost:3100/textgrids/textgrid-00.json', (textgrid: GridTypes.Grid) => {
          // console.log('textgrid', textgrid);
        }, (err) => {
          console.log('err', err);
        });

      }
    },
  }))
;
