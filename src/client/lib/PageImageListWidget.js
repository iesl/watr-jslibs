/**

*/

import * as $ from 'jquery';
import * as _ from 'lodash';

import {t, $id, icon} from './jstags.js';
import * as reflowWidgetInit from  './ReflowWidgetInit.js';
import {shared} from './shared-state';
import * as schema from './schemas';
import * as coords from './coord-sys.js';
import * as Rx from 'rxjs';

export class PageImageListWidget {

    /**
     * @param {ServerDataExchange}  serverDataExchange
     */
    constructor (containerId, serverDataExchange) {
        this.containerId = containerId;
        this.serverDataExchange = serverDataExchange;

        this.init();
    }

    init() {
        // Outer Div

        // containerId.append(
        let node =
            t.div([
                t.div('.page-image-viewer', [
                    t.div(`#page-images-status .status-top`),
                    t.div('#page-images .page-images')
                ])
            ]);

        $id(this.containerId).append(node);


        this.setupStatusBar('page-images-status');

        // let sdx = this.serverDataExchange;

        // _.each(this.pageImageWidgets, pageImageWidget => {
        //     sdx.subscribeToAllAnnotations(annots => {
        //         pageImageWidget.setAnnotations(annots);
        //     });
        // });

        // _.each(this.pageImageWidgets, (pageImageWidget, pageNum) => {
        //     sdx.subscribeToPageUpdates(pageNum, (update) => {
        //         pageImageWidget.updateAnnotationRegions(update);
        //     });
        // });

    }

    updateLabelSelections() {
        let widget = this;
        _.each(widget.pageImageWidgets, pageImageWidget => {
            pageImageWidget.highlightSelections(widget.currentSelections);
        });
    }

    setPageImageWidgets(pageImageWidgets) {
        let widget = this;
        this.pageImageWidgets = pageImageWidgets;

        _.each(pageImageWidgets, pageImageWidget => {
            pageImageWidget.clickedRegionRx.subscribe(clickedItems => {
                let nonintersectingItems = _.differenceBy(clickedItems,  widget.currentSelections, s => s.id);
                widget.currentSelections = nonintersectingItems;
                widget.updateLabelSelections();
            });
        });
    }


    subscribeToAnnotationUpdates() {
        let widget = this;
        let sdx = this.serverDataExchange;

        sdx.getSelectedAnnotationsRx().subscribe( selectedAnnots => {
            $(widget.selectionStatusId).empty();
            $(widget.selectionStatusId)
                .append(t.span(`Selected:${selectedAnnots.length} del: `));

            if (selectedAnnots.length == 1) {
                let selection = selectedAnnots[0];
                let gridForSelection = reflowWidgetInit.getTextGridForSelectedZone(selection);
                let deleteBtn = t.button([icon.trash]);
                deleteBtn.on('click', function() {
                    let zoneId = selection.zoneId;
                    sdx.deleteAnnotation(zoneId);
                });

                $id(widget.statusBarId).append(deleteBtn);

                if (gridForSelection !== undefined) {
                    reflowWidgetInit.showGrid(gridForSelection);
                } else {
                    let gridShaperBtn = t.button([icon.fa('indent')]);

                    gridShaperBtn.on('click', function() {
                        let textGrid = reflowWidgetInit.createTextGridFromSelectedZone(selection);
                        reflowWidgetInit.showGrid(textGrid);
                    });
                    $id(widget.statusBarId).append(gridShaperBtn);

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

        $id(statusBarId)
            .addClass('statusbar');

        let statusItems =
            t.div('.statusitems', [
                t.div('.statusitem #selections', "Selections"),
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
                let data = coords.mk.fromLtwhFloatReps(region.bbox);
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
            // console.log('pageRegions', pageRegions);
            let pageNum = pageRegions[0].pageNum;

            // console.log('pageRegions.pageNum', pageNum);
            // console.log('pageImageWidgets', this.pageImageWidgets);

            this.pageImageWidgets[pageNum]
                .setAnnotationRegionData(pageRegions);

            // let pageRtree = rtree();
            // shared.pageImageLabelRTrees[pageNum] = pageRtree;
            // pageRtree.load(pageGroup);
        });
    }
}
