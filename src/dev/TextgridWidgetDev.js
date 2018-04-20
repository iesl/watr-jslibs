/* global require $ */

import * as Shared from '../client/lib/shared-state';
import * as TextgridWidget from  '../client/lib/TextgridWidget.js';


export function run()  {

    Shared.initGlobalMouseTracking();

    $.getJSON('/data/textgrids/00', textgrid => {
        let pages = textgrid.pages;
        let textgrids = _.map(pages, p => p.textgrid);
        let textgrid0 = textgrids[0];

        console.log('textGrid', textgrid0);
        let textgridWidget = new TextgridWidget.TextgridWidget('page-textgrids', textgrid0, 0);
        textgridWidget.init();
    });

}
