/**
 *
 **/


import * as $ from 'jquery';
import * as _ from 'lodash';
import * as d3 from 'd3';
import * as d3x from './d3-extras';

import * as coords from './coord-sys.js';
import * as rtrees from  './rtrees.js';
import * as rtree from 'rbush';
import {t, $id} from './jstags.js';
import {eventHasLeftClick} from './commons.js';
import * as mhs from './MouseHandlerSets';
import {awaitUserSelection} from './dragselect';
import * as lbl from './labeling';
import * as schema from './schemas';
import Tippy from 'tippy.js';
import { concat } from 'rxjs/operators';

export class PageImageWidget {

    /**
     * @param {number} pageNum
     * @param {number[]} pageGeometry
     * @param {string} containerId
     */
    constructor (pageNum, pageGeometry, containerId) {
        this.pageNum = pageNum;
        this.pageBounds = coords.mk.fromArray(pageGeometry);
        this.svgId = `svg#page-image-${pageNum}`;
        this.frameId = `div#page-image-${pageNum}`;
        this.containerId = containerId;
        this.glyphRtree = rtree();
    }

    init() {
        let widget = this;

        let infobarSlots = _.map(_.range(0, 6), i => {
            return t.div(`.infoslot #slot-${i}`, [
                t.span(`.infoslot-label #slot-label-${i}`, ''),
                t.span(`.infoslot-value #slot-value-${i}`, '')
            ]);
        });

        let widgetNode =
            t.div(`.page-image-widget #page-image-widget-${widget.pageNum}`, [
                t.div(`.status-top`),
                t.div(`.infobar`, infobarSlots),
                t.div(`.left-gutter`),
                t.div(`.widgetcontent #page-image-content-${widget.pageNum}`),
                t.div(`.right-gutter`),
                t.div(`.status-bottom`)
            ]);

        $id(widget.containerId).append(widgetNode);

        d3.select(`#page-image-content-${widget.pageNum}`)
            .append('div').classed('page-image', true)
            .datum(widget.pageBounds)
            .attr('id', (d, i) => `page-image-${i}`)
            .attr('width', d => d.x + d.width)
            .attr('height', d => d.y + d.height )
            .append('svg').classed('page-image', true)
            .datum(widget.pageBounds)
            .attr('id', (d, i) => `page-image-${i}`)
            .attr('width', d => d.x + d.width)
            .attr('height', d => d.y + d.height )
        ;
        d3.selectAll(widget.svgId)
            .each(function (){
                let self = d3.select(this);
                return self .append('image')
                    .attr("x"      , d =>  d.x )
                    .attr("y"      , d =>  d.y )
                    .attr("width"  , d =>  d.width )
                    .attr("height" , d =>  d.height )
                    .attr("href"   , () =>  `/image/page/${widget.pageNum + 1}` )
                ;
                // .attr("href"   , d =>  '/api/v1/corpus/artifacts/entry/'+util.corpusEntry()+'/image/page/'+d.page )
            })
        ;

        widget.setMouseHandlers([pageImageHandlers]);

        widget.tooltips = [];
    }

    printToInfobar(slot, label, value) {
        $(`#slot-label-${slot}`).text(label);
        $(`#slot-value-${slot}`).text(value.toString());
    }

    setMouseHandlers(handlers) {
        let widget = this;
        mhs.setMouseHandlers(widget, widget.frameId, handlers);
    }

    setGlyphData(glyphData) {
        this.glyphData = glyphData;
        this.glyphRtree.load(glyphData);
    }

    setAnnotations(annotationRecs) {
        schema.allValid('Annotation')(annotationRecs);

        let dataPts = _.flatMap(annotationRecs, rec => {
            let label = rec.label;
            let regions = rec.location.Zone.regions;
            return _.map(regions, (region, i) => {
                let data = coords.mk.fromLtwhFloatReps(region.bbox);
                data.id = `ann${rec.id}_${i}`;
                // data.id = region.regionId;
                data.selector = '#' + data.id;
                data.pageNum = region.page.pageNum;
                data.label = label;
                data.title = label;
                data.annotId = rec.id;
                return data;
            });
        });

        this.annotationRecs = annotationRecs;
        this.annotationRegions = dataPts;
        this.labelRtree = rtree();
        this.labelRtree.load(dataPts);

        this.showAnnotations();
    }

    displayCharHoverReticles(userPt) {
        let widget = this;
        let queryBox = coords.boxCenteredAt(userPt, 10, 10);

        let hits = widget.glyphRtree.search(queryBox);

        widget.printToInfobar(4, `glyphs`, `${hits.length}`);

        let reticles = d3.selectAll(widget.svgId)
            .selectAll('.textloc')
            .data(hits, d => d.id);

        reticles.enter().append('rect')
            .classed('textloc', true)
            .call(d3x.initRect, d => d)
            .call(d3x.initStroke, 'blue', 1, 0.2)
            .call(d3x.initFill, 'blue', 0.5);

        reticles.exit().remove();


        // let textgridSvg = d3x.d3select.pageTextgridSvg(pageNum);
        // textview.showTexgridHoverReticles(textgridSvg, _.map(hits, h => h.gridDataPt));
    }

    displayLabelHovers(hoverPt) {
        let widget = this;
        let queryBox = coords.mk.fromLtwh(hoverPt.x, hoverPt.y, 1, 1);

        let hoveredLabels = widget.labelRtree.search(queryBox);

        let hoveredTooltips = _.map(hoveredLabels, hit => {

            let $hit = $(hit.selector);
            $hit.attr('title', hit.label);

            let tooltip = _.remove(widget.tooltips, tt => tt.id == hit.id)[0];

            if (tooltip === undefined) {
                tooltip = $hit.prop('_tippy');
                if (tooltip === undefined) {
                    Tippy(hit.selector, {
                        updateDuration: 0,
                        popperOptions: {
                            modifiers: {
                                // preventOverflow: {
                                //     enabled: false
                                // },
                                computeStyle: {
                                    gpuAcceleration: false
                                }
                            }
                        }
                    });
                    tooltip = $hit.prop('_tippy');
                    tooltip.id = hit.id;
                }
            }
            tooltip.show();
            return tooltip;
        });

        _.each(widget.tooltips, tooltip => {
            tooltip.hide();
        });

        widget.tooltips = hoveredTooltips;
    }

    d3select() {
        return d3.select(this.svgId);
    }

    showAnnotations() {
        let widget = this;

        widget.d3select()
            .selectAll('.annotation-rect')
            .remove();

        _.each(widget.annotationRegions, (region, i) => {
            let label = region.label;

            widget.d3select()
                .append('rect')
                .datum(region)
                .call(d3x.initRect, r => r)
                .call(d3x.initStroke, 'blue', 1, 0.8)
                .call(d3x.initFill, 'purple', 0.2)
                .attr('id', region.id)
                .classed('annotation-rect', true)
            ;

        });
    }

    createImageLabelingPanel(userSelection, mbrSelection) {

        d3.select(this.svgId).append('rect')
            .call(d3x.initRect, () => userSelection)
            .classed('label-selection-rect', true)
            .call(d3x.initStroke, 'blue', 1, 1.0)
            .call(d3x.initFill, 'yellow', 0.7)
            .transition().duration(200)
            .call(d3x.initRect, () => mbrSelection)
            .call(d3x.initFill, 'yellow', 0.3)
        ;

        lbl.createHeaderLabelUI(mbrSelection, this.pageNum, this.containerId);
    }
}


function pageImageHandlers(widget) {
    let handlers = {

        click: function(event) {
            widget.printToInfobar(5, `action`, `click`);
            // one of:
            //  - toggle labeled region selection
            //  - sync textgrid to clicked pt
            //  - begin selection handling
            let clickPt = coords.mkPoint.offsetFromJqEvent(event);
            let queryBox = coords.boxCenteredAt(clickPt, 2, 2);

            // let hoveredLabels = rtrees.searchPageLabels(pageNum, queryBox);
            // if (hoveredLabels.length > 0) {
            //     toggleLabelSelection(pageNum, hoveredLabels);
            // } else {
            //     let neighbors = rtrees.knnQueryPage(pageNum, clickPt, 4);
            //     if (neighbors.length > 0) {
            //         let nearestNeighbor = neighbors[0];
            //         textview.syncScrollTextGridToImageClick(clickPt, nearestNeighbor.gridDataPt);
            //     }
            // }
        },


        mousedown: function() {
            widget.printToInfobar(5, `action`, `down`);
        },


        mousemove: function(event) {
            widget.printToInfobar(5, `action`, `move`);
            let userPt = coords.mkPoint.offsetFromJqEvent(event);
            let clientPt = coords.pointFloor(userPt);

            widget.printToInfobar(0, `x, y`, `${clientPt.x}x${clientPt.y}`);


            if (eventHasLeftClick(event)) {
                widget.setMouseHandlers([]);
                awaitUserSelection(d3.select(widget.svgId), userPt)
                    .then(pointOrRect => {
                        widget.setMouseHandlers([pageImageHandlers]);

                        if (pointOrRect.rect) {
                            let r = pointOrRect.rect;

                            let queryBox = coords.mk.fromLtwhObj(r);
                            let hits = widget.glyphRtree.search(queryBox);

                            if (hits.length > 0) {
                                let minBoundSelection = rtrees.queryHitsMBR(hits);
                                widget.createImageLabelingPanel(queryBox, minBoundSelection);
                            }

                        }
                    });
            } else {
                widget.displayCharHoverReticles(userPt);
                widget.displayLabelHovers(userPt);
            }
        }
    };

    return handlers;
}
