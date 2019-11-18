
// import { onMounted, ref } from '@vue/composition-api';

import PdfPage from '~/components/pdf-pages/pdf-page'

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
    // const self = this;
    // // const self = <any>this;
    // asyncGetJson<GridTypes.Grid>('http://localhost:3100/textgrids/textgrid-00.json')
    //   .then((textgrid: GridTypes.Grid) => {
    //     self.textgrid = textgrid;
    //     // console.log('textgrid?', textgrid);
    //     // console.log('setDiv', self.setDiv);
    //     // console.log('self', self);
    //     // self.setDiv(this.imageContentId)
    //     // this.loadShapes()
    //     self.initDataReady = true;
    //   })
    //   .catch(err => console.log('err', err))
    // ;
  },

  setup() {

  }
}
