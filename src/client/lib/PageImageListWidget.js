/**
 *
 *
 */

import * as $ from 'jquery';
import * as _ from 'lodash';

import {t, $id, icon} from './jstags.js';
import * as reflowWidgetInit from  './ReflowWidgetInit.js';
import {shared} from './shared-state';
import * as schema from './schemas';
import * as coords from './coord-sys';

import * as spu  from './SplitWin.js';
import { PageImageWidget } from './PageImageWidget.js';
import * as rtrees from './rtrees.js';
import {zipWithIndex} from './lodash-plus';
import {ServerDataExchange} from  './ServerDataExchange.js';


export class PageImageListWidget {

    /**
     * @param {ServerDataExchange}  serverExchange
     */
    constructor (containerId, serverExchange) {
        this.containerId = containerId;
        this.serverExchange = serverExchange;

        this.pageImageWidgetContainerId = 'page-image-widget-list';
        this.init();
    }

    setDevMode(b) {
        _.each(this.pageImageWidgets, p => p.setDevMode(b));
    }


    init() {

        let listId = this.pageImageWidgetContainerId;

        let node =
            t.div(`.page-image-list-widget`, [
                t.div(`#page-images-status .statusbar`),
                t.div('#page-images .page-images', [
                    t.div(`.page-image-widgets`, [
                        t.div(`#${listId} .list`),
                    ])
                ])
            ]);

        $id(this.containerId).append(node);


        this.setupStatusBar('page-images-status');
        let widget = this;

        let serverExchange = this.serverExchange;

        serverExchange.subscribeToAllAnnotations(annots => {
            widget.setAnnotations(annots);
        });

        this.subscribeToAnnotationSelection();

    }


    setPageImageWidgets(pageImageWidgets) {
        let widget = this;

        widget.pageImageWidgets = pageImageWidgets;

        widget.serverExchange.selectionsRx.subscribe(selectedItems => {
            _.each(pageImageWidgets, pageImageWidget => {
                pageImageWidget.highlightSelections(selectedItems);
            });
        });
    }


    subscribeToAnnotationSelection() {
        let widget = this;
        let serverExchange = this.serverExchange;

        serverExchange.getSelectedAnnotationsRx().subscribe( selectedAnnots => {

            $id(widget.selectionStatusId).empty();
            $id('selection-controls').empty();

            $id(widget.selectionStatusId)
                .append(t.span(`Selected: ${selectedAnnots.length} del: `));

            if (selectedAnnots.length == 1) {
                let selection = selectedAnnots[0];
                let gridForSelection = reflowWidgetInit.getTextGridForSelectedZone(selection);
                let deleteBtn = t.button([icon.trash]);

                deleteBtn.on('click', function() {
                    serverExchange.deleteAnnotation(selection.annotId);
                });

                $id('selection-controls').append(deleteBtn);

                if (gridForSelection !== undefined) {
                    reflowWidgetInit.showGrid(gridForSelection, serverExchange);
                } else {
                    let gridShaperBtn = t.button([icon.fa('indent')]);
                    let pageWidget = widget.pageImageWidgets[selection.pageNum];
                    let glyphs = pageWidget.queryForGlyphs(selection);

                    gridShaperBtn.on('click', function() {
                        let textGrid = reflowWidgetInit.createTextGridFromSelectedZone(selection, glyphs);
                        reflowWidgetInit.showGrid(textGrid, serverExchange);
                    });
                    $id('selection-controls').append(gridShaperBtn);

                }
            }
            else if (selectedAnnots.length > 1) {
                // reflowWidget.unshowGrid();
            } else {
                // reflowWidget.unshowGrid();
                // $selectStatus.text(``);
            }
        });
    }

    setupStatusBar(statusBarId) {

        let statusItems =
            t.div('.statusitems', [
                t.div('.statusitem #selections', "Selections"),
                t.div('.statusitem #selection-controls'),
                t.div('.statusitem #mouse', 'Mouse')
            ]);

        $id(statusBarId).append(statusItems);

        this.selectionStatusId = 'selections';
        this.mouseStatusId = 'mouse';

        shared.rx.clientPt.subscribe(clientPt => {
            $('#mouse').text(`x:${clientPt.x} y:${clientPt.y}`);
        });

    }

    setAnnotations(annotationRecs) {
        schema.allValid('Annotation')(annotationRecs);

        let dataPts = _.flatMap(annotationRecs, rec => {
            let label = rec.label;
            let regions = rec.location.Zone.regions;

            return _.map(regions, (region, i) => {
                let data = coords.mk.fromArray(region.bbox);
                data.id = `ann${rec.id}_${i}`;
                data.selector = '#' + data.id;
                data.pageNum = region.page.pageNum;
                data.label = label;
                data.title = label;
                data.annotId = rec.id;
                return data;
            });
        });

        let regionsByPage = _.groupBy(dataPts, p => p.pageNum);

        _.each(regionsByPage, pageRegions => {
            let pageNum = pageRegions[0].pageNum;

            this.pageImageWidgets[pageNum]
                .setAnnotationRegionData(pageRegions);

            // let pageRtree = rtree();
            // shared.pageImageLabelRTrees[pageNum] = pageRtree;
            // pageRtree.load(pageGroup);
        });
    }
}

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

    let serverExchange = new ServerDataExchange();

    let imageList = new PageImageListWidget('page-image-list', serverExchange);

    let pcid = imageList.pageImageWidgetContainerId;
    let widgets = _.map(pageGeometries, (pageGeometry, pageNum) => {
        let widget = new PageImageWidget(pageNum, pageGeometry, pcid);
        let glyphData = rtrees.gridDataToGlyphData(gridData[pageNum]);
        widget.init();
        widget.setGlyphData(glyphData);
        widget.setServerExchange(serverExchange);
        return widget;
    });


    imageList.setPageImageWidgets(widgets);

    serverExchange.init();
    return imageList;

}
