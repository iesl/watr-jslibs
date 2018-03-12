/**
 *
 **/

/* global */

import * as _ from 'lodash';

import * as lbl from './labeling';
import * as coords from './coord-sys.js';
import * as panes from  './splitpane-utils.js';
import * as reflowWidget from  './ReflowWidget.js';
import * as reflowWidgetInit from  './ReflowWidgetInit.js';

import {$id, t, icon} from './jstags.js';
import { PageImageWidget, PageImageListWidget } from './PageImageWidget.js';

import * as server from './serverApi.js';
import * as rtrees from './rtrees.js';
import { shared } from './shared-state';
import * as global from './shared-state';
import {zipWithIndex} from './lodash-plus';
import {ServerDataExchange} from  './ServerDataExchange.js';


// function setupStatusBar(statusBarId) {

//     $id(statusBarId)
//         .addClass('statusbar');

//     let $selectStatus = t.div('.statusitem', "Selections");

//     shared.rx.selections.subscribe( selectedZones => {
//         $selectStatus.empty();
//         $selectStatus.append(t.span(`Selected:${selectedZones.length} del: `));

//         if (selectedZones.length == 1) {
//             let selection = selectedZones[0];
//             let gridForSelection = reflowWidgetInit.getTextGridForSelectedZone(selection);
//             let deleteBtn = t.button([icon.trash]);
//             deleteBtn.on('click', function() {
//                 let zoneId = selection.zoneId;
//                 server.deleteZone(zoneId).then(resp => {
//                     global.setSelections([]);
//                     shared.activeReflowWidget = undefined;
//                     lbl.updateAnnotationShapes();
//                 }).catch(() => {
//                     shared.activeReflowWidget = undefined;
//                     lbl.updateAnnotationShapes();
//                     global.setSelections([]);
//                 }) ;
//             });

//             $selectStatus.append(deleteBtn);

//             if (gridForSelection !== undefined) {
//                 reflowWidgetInit.showGrid(gridForSelection);
//             } else {
//                 let gridShaperBtn = t.button([icon.fa('indent')]);

//                 gridShaperBtn.on('click', function() {
//                     let textGrid = reflowWidgetInit.createTextGridFromSelectedZone(selection);
//                     reflowWidgetInit.showGrid(textGrid);
//                 });
//                 $selectStatus.append(gridShaperBtn);

//             }
//         }
//         else if (selectedZones.length > 1) {
//             reflowWidget.unshowGrid();



//         } else {
//             reflowWidget.unshowGrid();
//             $selectStatus.text(``);
//         }
//     });

//     let $mouseCoords = t.div('.statusitem', 'Mouse');
//     shared.rx.clientPt.subscribe(clientPt => {
//         $mouseCoords.text(`x:${clientPt.x} y:${clientPt.y}`);
//     });

//     $id(statusBarId)
//         .append($selectStatus)
//         .append($mouseCoords);

// }

export function setupPageImages(contentSelector, textGridJson, gridData) {
    let pages = textGridJson.pages;
    let pageGeometries = _.map(pages, p => p.pageGeometry);

    let ctx = {maxh: 0, maxw: 0};

    pageGeometries = _.map(zipWithIndex(pageGeometries), ([g, i]) => {
        let pageBounds = coords.mk.fromArray(g);
        pageBounds.page = i+1;
        return pageBounds;
    });


    _.each(pageGeometries, sh  => {
        ctx.maxh = Math.max(ctx.maxh, sh.y + sh.height);
        ctx.maxw = Math.max(ctx.maxw, sh.x + sh.width);
    });

    panes.setParentPaneWidth(contentSelector, ctx.maxw + 80);

    let {topPaneId: statusBarId, bottomPaneId: pageImageDivId} =
        panes.splitHorizontal(contentSelector, {fixedTop: 30});

    // setupStatusBar(statusBar);

    $id(pageImageDivId).append(
        t.div('.split-pane-component-inner', [
            t.div('#page-images .page-images')
        ])
    );

    let widgets = _.map(pageGeometries, (pageGeometry, pageNum) => {
        let widget = new PageImageWidget(pageNum, pageGeometry, 'page-images');
        let glyphData = rtrees.gridDataToGlyphData(gridData[pageNum]);
        widget.init();
        widget.setGlyphData(glyphData);
        // let annots = [];
        // widget.setAnnotations(annots);
        return widget;
    });

    let sdx = new ServerDataExchange();

    let pageImages = new PageImageListWidget(widgets, statusBarId, sdx);

    sdx.init();


}
