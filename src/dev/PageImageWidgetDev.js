
/* global require $  _ watr */
import * as Shared from '../client/lib/shared-state';
import * as PageImageWidget from  '../client/lib/PageImageWidget.js';
import * as rtrees from  '../client/lib/rtrees.js';

export function run()  {

    Shared.initGlobalMouseTracking();

    let annot0 = {
        "id" : 2,
        "document" : 1,
        "owner" : null,
        "annotPath" : null,
        "created" : 1520626895815,
        "label" : "Math",
        "location" : {
            "Zone" : {
                "regions" : [
                    {
                        "page" : {
                            "stableId" : "doc#0",
                            "pageNum" : 0
                        },
                        "bbox" : {
                            "left" : 10000,
                            "top" : 10000,
                            "width" : 8000,
                            "height" : 4000
                        }
                    }
                ]
            }
        },
        "body" : null
    };






    $.getJSON('/data/textgrid', textgrid => {
        let page0 = textgrid.pages[0];
        let g = page0.pageGeometry;
        let pages = textgrid.pages;
        let textgrids = _.map(pages, p => p.textgrid);

        console.log('textgrids', textgrids);
        let gridData = rtrees.initGridData(textgrids);
        console.log('gridData', gridData);
        let glyphData = rtrees.gridDataToGlyphData(gridData[0]);
        console.log('glyphData', glyphData);

        let widget = new PageImageWidget.PageImageWidget(0, g, 'page-images');

        widget.init();
        widget.setGlyphData(glyphData);
        widget.setAnnotations([annot0]);

    });

}
