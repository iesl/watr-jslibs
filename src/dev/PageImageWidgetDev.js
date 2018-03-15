
/* global require $  _ watr */
import * as Shared from '../client/lib/shared-state';
import * as PageImageWidget from  '../client/lib/PageImageWidget.js';
import * as PageImageListWidget from  '../client/lib/PageImageListWidget.js';
import * as rtrees from  '../client/lib/rtrees.js';
import * as coords from '../client/lib/coord-sys.js';

export function run()  {

    Shared.initGlobalMouseTracking();

    let annotTemplate = {
        "id" : 2,
        "document" : 1,
        "owner" : null,
        "annotPath" : null,
        "created" : 1520626895815,
        "label" : "Math",
        "location" : {
            "Zone" : {
                "regions" : [
                    {"page" : {"stableId" : "doc#0", "pageNum" : 0},
                     "bbox" : {"left" : 10000, "top" : 10000, "width" : 8000, "height" : 4000}}
                ]
            }
        },
        "body" : null
    };

    let numPages = 4;
    let annotsPerPage = 6;
    let annots = _.flatMap(_.range(0, numPages), pageNum => {
        return _.map(_.range(0, annotsPerPage), annotNum => {
            let id = (pageNum * annotsPerPage) + annotNum;

            let annot = Object.assign({}, annotTemplate, {
                id: id,
                location : {
                    Zone : {
                        regions : [
                            {page : {stableId : "doc#0", pageNum : pageNum},
                             bbox : {left : (3000*(annotNum+2)), top : (6000*(annotNum+3)), width : 10000, height : 3000}}
                        ]
                    }
                }
            });
            return annot;
        });
    });


    $.getJSON('/data/textgrid', textgrid => {
        let page0 = textgrid.pages[0];
        let g = page0.pageGeometry;
        let pages = textgrid.pages;
        let textgrids = _.map(pages, p => p.textgrid);

        // console.log('textgrids', textgrids);
        let gridData = rtrees.initGridData(textgrids);

        let imageList = new PageImageListWidget.PageImageListWidget('container');

        let pageImageWidgets = _.map(gridData, (pageGridData, pageNum) => {
            // console.log('gridData', gridData);
            let glyphData = rtrees.gridDataToGlyphData(pageGridData);
            // console.log('glyphData', glyphData);
            let pageGeometry = coords.mk.fromArray(textgrid.pages[pageNum].pageGeometry);

            let pageImage = new PageImageWidget.PageImageWidget(pageNum, pageGeometry, 'page-images');
            pageImage.init();
            pageImage.setGlyphData(glyphData);

            return pageImage;
        });


        imageList.setPageImageWidgets(pageImageWidgets);

        imageList.setAnnotations(annots);


    });

}
