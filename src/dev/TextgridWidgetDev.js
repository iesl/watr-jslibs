
/* global require  $ watr */
import * as Shared from '../client/lib/shared-state';
// import * as ReflowWidget from  '../client/lib/ReflowWidget.js';
import * as TextgridWidget from  '../client/lib/TextgridWidget.js';


export function run()  {
    console.log("running TextgridWidget");

    Shared.initGlobalMouseTracking();
    // let textGridConstruction = new watr.textgrid.TextGridConstructor();
    // let textGrid = textGridConstruction.getTestTextGridLarge();
    // let textGrid = textGridConstruction.getTestTextGrid();
    // let labelSchema = textGridConstruction.getTestLabelSchema();

    $.getJSON('/data/textgrids/00', textgrid => {
        let pages = textgrid.pages;
        let textgrids = _.map(pages, p => p.textgrid);
        let textgrid0 = textgrids[0];

        console.log('textGrid', textgrid0);
        let textgridWidget = new TextgridWidget.TextgridWidget('page-textgrids', textgrid0, 0);
        textgridWidget.init();
    });

}
