import {
  ref,
  Ref
} from '@vue/composition-api'

import _ from 'lodash';
import * as E from 'fp-ts/lib/Either'
import { PathReporter } from 'io-ts/lib/PathReporter'
import { initState } from '~/components/basics/component-basics'
import { usePdfPageViewer } from '~/components/single-pane/pdf-page-viewer'
import * as coords from '~/lib/coord-sys'
// import { initGridData, gridDataToGlyphData } from '~/lib/transcript/TextGlyphDataTypes';
import { Point } from '~/lib/coord-sys'
import { resolveCorpusUrl, getArtifactData } from '~/lib/axios'
import { LogEntry } from '~/lib/transcript/tracelogs'
import { Transcript } from '~/lib/transcript/transcript'

export default {
  setup() {
    const state = initState()

    const mountPoint: Ref<HTMLDivElement | null> = ref(null)
    const logEntryRef: Ref<LogEntry[]> = ref([])

    // const entryId = '1503.00580.pdf.d'
    const entryId = 'austenite.pdf.d'

    const run = async () => {
      const pdfPageViewer = await usePdfPageViewer({
        mountPoint,
        state,
        pageNumber: 1,
        entryId,
        logEntryRef,
        pageBounds: { kind: 'rect', x: 10, y: 10, width: 1000, height: 1000 }
      });


      const { superimposedElements } = pdfPageViewer
      const imageUrl = resolveCorpusUrl(entryId, 'image', '1')
      superimposedElements.setImageSource(imageUrl);

      getArtifactData(entryId, 'transcript')
        .then(async (transcriptJson) => {
          const maybeDecoded = Transcript.decode(transcriptJson)
          console.log(maybeDecoded)
          if (E.isLeft(maybeDecoded)) {
            const report = PathReporter.report(maybeDecoded)
            console.log('error decoding transcript');
            _.each(report, r => {
              console.log('Error:', r);

            })
            return;
          } else {
            const transcript = maybeDecoded.right

            const page0 = transcript.pages[0]
            //         // TODO: why is this margin here? hardcoded?
            const pageBounds = page0.bounds;
            //         // page0.glyphs
            //         const tmpPageMargin = 10
            //         const origin = new Point(tmpPageMargin, tmpPageMargin, coords.CoordSys.GraphUnits)
            //         // const gridData = initGridData(page0.textgrid, () => 10, origin, 10);
            //         // const glyphData = gridDataToGlyphData(gridData.textDataPoints);
            const glyphs = page0.glyphs;

            pdfPageViewer.setGlyphOverlays(glyphs, pageBounds);
          }
        })

    };

    run();

    return {
      mountPoint
    }
  }
}
