
/* global require $  _ watr */
import * as Shared from '../client/lib/shared-state';
import * as PageImageWidget from  '../client/lib/PageImageWidget.js';
import { PageImageListWidget, setupPageImages } from '../client/lib/PageImageListWidget.js';
import {ServerDataExchange} from  '../client/lib/ServerDataExchange.js';
import * as rtrees from  '../client/lib/rtrees.js';
import * as coords from '../client/lib/coord-sys';
import * as testdata from './annot-testdata.js';
import * as spu  from '../client/lib/SplitWin.js';

export function run()  {

    let rootFrame = spu.createRootFrame("#main");
    rootFrame.setDirection(spu.row);

    let [paneLeft, paneRight] = rootFrame.addPanes(2);

    $(paneLeft.clientAreaSelector()).attr('id', 'page-image-list');
    $(paneLeft.clientAreaSelector()).addClass('client-content');

    Shared.initGlobalMouseTracking();

    let annots = testdata.annotData();

    $('#container').css({
        border: 30,
        margin: 20,
        padding: 20,
        background: '#eee',
        display: 'inline-block'
    });

    // let serverExchange = new ServerDataExchange();

    $.getJSON('/data/textgrid', textgrid => {
        // let page0 = textgrid.pages[0];
        // let g = page0.pageGeometry;
        let pages = textgrid.pages;
        let textgrids = _.map(pages, p => p.textgrid);

        let imageList = setupPageImages('page-image-list', textgrid, textgrids);

        imageList.setDevMode(true);

        console.log(annots);
        imageList.setAnnotations(annots);

        // // console.log('textgrids', textgrids);
        // let gridData = rtrees.initGridData(textgrids);

        // let imageList = new PageImageListWidget.PageImageListWidget('page-image-list', serverExchange);

        // $('div.page-image-list-widget').addClass('vcentered');
        // let pageImageContainer = imageList.pageImageWidgetContainerId;

        // let pageImageWidgets = _.map(gridData, (pageGridData, pageNum) => {
        //     // console.log('gridData', gridData);
        //     let glyphData = rtrees.gridDataToGlyphData(pageGridData);
        //     // console.log('glyphData', glyphData);
        //     let pageGeometry = coords.mk.fromArray(textgrid.pages[pageNum].pageGeometry);

        //     let pageImage = new PageImageWidget.PageImageWidget(pageNum, pageGeometry, pageImageContainer);
        //     console.log('pageImageWidget', pageImage);
        //     pageImage.init();
        //     pageImage.setGlyphData(glyphData);

        //     return pageImage;
        // });


        // imageList.setPageImageWidgets(pageImageWidgets);



    });

}
