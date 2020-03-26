import { defineComponent } from '@vue/composition-api';
import { initState } from '~/components/basics/component-basics';
import { divRef } from '~/lib/vue-composition-lib';
import { useTranscriptionViewer } from '../../transcription-viewer';
import { Transcription } from '~/lib/transcription';
import { isRight } from 'fp-ts/lib/Either'

export default defineComponent({
  components: {},
  setup() {

    const state = initState();
    const mountPoint = divRef();

    useTranscriptionViewer({ mountPoint, state })
      .then(transcriptionViewer => {

        const { setText } = transcriptionViewer;

        const transEither  = Transcription.decode(sampleTranscription);
        console.log('transEither', transEither);
        // sampleTranscription;
        if (isRight(transEither)) {
          const trans = transEither.right;
          const page0 = trans.pages[0];
          setText({ trPage: page0, textMarginLeft: 20, textMarginTop: 20 });
        }

      });

    return {
      mountPoint
    };
  }
});


const sampleTranscription = {
  description: "desc",
  documentId: "doc-25-id",
  pages: [{
    pdfPageBounds: [0, 0, 61200, 79200],
    lines: [{
      text: "I Ã ffi",
      glyphs: [
        [1, 2, 3, 4],
        [[59, 2, 3, 4], {}],
        [[3, 2, 3, 4], {
          "gs": [
            [[1, 2, 3, 4], { "g": "A" }],
            [[1, 2, 3, 4], { "g": "~" }]
          ]
        }],
        [[50, 2, 3, 4], {}],
        [[1, 2, 3, 4], { "os": [1, 2], "g": "ﬃ" }],
        [[1, 2, 3, 4], { "o": 1 }],
        [[1, 2, 3, 4], { "o": 2 }],
      ]
    }, {
      text: "Fe_{3}",
      glyphs: [
        [11, 2, 3, 4],
        [22, 2, 3, 4],
        [[51, 2, 3, 4], { "o": -2 }],
        [[52, 2, 3, 4], { "o": -1 }],
        [[53, 2, 3, 4], { "os": [-2, -1, 1] }],
        [[54, 2, 3, 4], { "o": 1 }]
      ]
    }]
  }]
};
