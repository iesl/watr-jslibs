
/* global require $  _ watr */
import * as Shared from '../client/lib/shared-state';
import * as PageImageWidget from  '../client/lib/PageImageWidget.js';
import * as PageImageListWidget from  '../client/lib/PageImageListWidget.js';
import * as rtrees from  '../client/lib/rtrees.js';
import * as coords from '../client/lib/coord-sys.js';
import * as testdata from './annot-testdata.js';

export function run()  {

    Shared.initGlobalMouseTracking();

    let annots = testdata.annotData();

    $('#container').css({
        border: 30,
        margin: 20,
        padding: 20,
        background: '#eee',
        display: 'inline-block'
    });


    $.getJSON('/data/textgrid', textgrid => {
        let page0 = textgrid.pages[0];
        let g = page0.pageGeometry;
        let pages = textgrid.pages;
        let textgrids = _.map(pages, p => p.textgrid);

        // console.log('textgrids', textgrids);
        let gridData = rtrees.initGridData(textgrids);

        let imageList = new PageImageListWidget.PageImageListWidget('container');

        let pageImageContainer = imageList.pageImageWidgetContainerId;

        let pageImageWidgets = _.map(gridData, (pageGridData, pageNum) => {
            // console.log('gridData', gridData);
            let glyphData = rtrees.gridDataToGlyphData(pageGridData);
            // console.log('glyphData', glyphData);
            let pageGeometry = coords.mk.fromArray(textgrid.pages[pageNum].pageGeometry);

            let pageImage = new PageImageWidget.PageImageWidget(pageNum, pageGeometry, pageImageContainer);
            console.log('pageImageWidget', pageImage);
            pageImage.init();
            pageImage.setGlyphData(glyphData);

            return pageImage;
        });


        imageList.setPageImageWidgets(pageImageWidgets);

        imageList.setAnnotations(annots);


    });

}
