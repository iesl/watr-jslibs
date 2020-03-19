import { usePdfTextViewer } from '~/components/single-pane/pdf-text-viewer'
import { defineComponent } from '@vue/composition-api';
import * as GridTypes from '~/lib/TextGridTypes';
import * as coords from '~/lib/coord-sys';
import { getArtifactData } from '~/lib/axios';
import { initState } from '~/components/basics/component-basics';
import { divRef } from '~/lib/vue-composition-lib';
import { useTranscriptionViewer } from '../../transcription-viewer';
import { Transcription } from '~/lib/transcription';

export default defineComponent({
  components: {},
  setup() {

    const state = initState();
    const mountPoint = divRef();

    useTranscriptionViewer({ mountPoint, state })
      .then(transcriptionViewer => {



        const { setText } = transcriptionViewer;

        const trans: Transcription = sampleTranscription;
        const page0 = trans.pages[0];
        setText({ trPage: page0, textMarginLeft: 20, textMarginTop: 20 });

        // const entryId = '1503.00580.pdf.d';
        // getArtifactData(entryId, 'textgrid')
        //   .then((grid: GridTypes.Grid) => {
        //     const page0 = grid.pages[0]
        //     const textgrid = page0.textgrid;
        //     setText({ textgrid, textMarginLeft: 20, textMarginTop: 20 });
        //   });
      });

    return {
      mountPoint
    };
  }
});

const sampleTranscription: Transcription = {
  description: "",
  documentId : "1503.00580.pdf.d",
  pages : [{
    pdfPageBounds : [0, 0, 61200, 79200],
    lines : [{
      //: "Here 'A' and tilde are 2 glyphs combining into single char",
      text : "I, Ãdam",
      glyphs : [
        [1, 2, 3, 4],
        [2, 2, 3, 4],
        [5, 2, 3, 4, {}],
        [3, 2, 3, 4, {
          "gs": [
            [1, 2, 3, 4, {"g": "A"}],
            [1, 2, 3, 4, {"g": "~"}]
          ]
        }],
        [1, 2, 3, 4],
        [1, 2, 3, 4],
        [5, 2, 3, 4, {}],
        [1, 2, 3, 4]
      ]
    }, {
      text : "Fe_{3}",
      //: "_{} and ^{} are super/subscript escapes",
      glyphs : [
        [1, 2, 3, 4],
        [2, 2, 3, 4],
        [5, 2, 3, 4, {"o": -2}],
        [5, 2, 3, 4, {"o": -1}],
        [5, 2, 3, 4, {"os": [-2, -1, 1]}],
        [5, 2, 3, 4, {"o": 1}]
      ]
    }, {
      text : "affine",
      //: "ﬃ -> ffi",
      chars : [
        [1, 2, 3, 4],
        [1, 2, 3, 4, {"os": [1,2], "g":"ﬃ"}],
        [1, 2, 3, 4, {"o": 1}],
        [1, 2, 3, 4, {"o": 2}],
        [1, 2, 3, 4],
        [1, 2, 3, 4]
      ]
    }]
  }],

  labels: []
}
