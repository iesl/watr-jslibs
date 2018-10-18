
/* global require $   watr */
import * as Shared from '../client/lib/shared-state';
import * as ReflowWidget from  '../client/lib/ReflowWidget.js';

export function runReflow()  {
    console.log('running runReflow');

    Shared.initGlobalMouseTracking();
    let textGridConstruction = new watr.textgrid.TextGridConstructor();
    // let textGrid = textGridConstruction.getTestTextGridLarge();
    let textGrid = textGridConstruction.getTestTextGrid();
    let labelSchema = textGridConstruction.getTestLabelSchema();
    let reflowWidget = new ReflowWidget.ReflowWidget('page-textgrids', textGrid, labelSchema);


    reflowWidget.init();

}
