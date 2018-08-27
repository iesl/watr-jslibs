/**
 *
 **/

import * as $ from 'jquery';
import * as _ from 'lodash';
import * as d3 from 'd3';
import * as d3x from './d3-extras';

import * as coords from './coord-sys';
import * as rtrees from  './rtrees.js';
import * as rtree from 'rbush';
import {t, $id} from './jstags.js';
import {eventHasLeftClick} from './commons.js';
import * as mhs from './MouseHandlerSets';
import {awaitUserSelection} from './dragselect';
import * as lbl from './labeling';
import * as Rx from 'rxjs';
import * as knn from 'rbush-knn';
import * as util from  './commons.js';
import ToolTips from './Tooltips';
import Infobar from './Infobar';


export class PageImageWidget {

    /**
     * @param {number} pageNum
     * @param {number[]} pageGeometry
     * @param {string} containerId
     */
    constructor (pageNum, pageGeometry, containerId) {
        this.pageNum = pageNum;
        this.pageBounds = pageGeometry;
        this.svgId = `page-image-svg-${pageNum}`;
        this.svgSelector = `#${this.svgId}`;
        this.frameId = `page-image-div-${pageNum}`;
        this.frameSelector = `#${this.frameId}`;
        this.containerId = containerId;
        this.glyphRtree = rtree();

        this._tooltipHoversRx = new Rx.Subject();
        this._tooltips = new ToolTips(this.frameSelector, this._tooltipHoversRx);
        this.selectedRegionRx = new Rx.Subject();
    }

    setDevMode(b) {
        let widget = this;
        this.DEV_MODE = b;
        if (b) {
            console.log('setDevMode');
            this.infoBar = new Infobar(this.frameId, 2, 3);

            $(`#page-image-widget-${widget.pageNum} > .infobar-pane `).append(
                 widget.infoBar.getElem()
            );
            $(`#page-image-widget-${widget.pageNum}`).removeClass('hideinfobar');
        }
    }

    setServerExchange(serverExchange) {
        this.serverExchange = serverExchange;
    }


    init() {
        let widget = this;

        let widgetNode =
            t.div(`.page-image-widget #page-image-widget-${widget.pageNum} .hideinfobar`, [
                t.div(`.status-top`),
                t.div(`.infobar-pane`),
                t.div(`.frame-content #page-image-content-${widget.pageNum}`),
            ]);

        $id(widget.containerId).append(widgetNode);

        let $statusTop = widget.selectWidgetElem('.status-top');

        $statusTop.append(
            t.span(`Page: ${widget.pageNum + 1}`)
        );

        // let width = ''+widget.pageBounds.width+'px';
        // let height = ''+widget.pageBounds.height+'px';
        // console.log('pageBounds', widget.pageBounds);

        d3.select(`#page-image-content-${widget.pageNum}`)
            .append('div').classed('page-image', true)
            .datum(widget.pageBounds)
            .attr('id', () => `page-image-div-${widget.pageNum}`)
            .attr('width', d => d.x + d.width)
            .attr('height', d => d.y + d.height )
            .append('svg').classed('page-image', true)
            .datum(widget.pageBounds)
            .attr('id', () => `page-image-svg-${widget.pageNum}`)
            .attr('width', d => d.x + d.width)
            .attr('height', d => d.y + d.height )
        ;

        d3.selectAll(widget.svgSelector)
            .each(function (){
                let self = d3.select(this);
                return self .append('image')
                    .attr("x"      , d =>  d.x )
                    .attr("y"      , d =>  d.y )
                    .attr("width"  , d =>  d.width )
                    .attr("height" , d =>  d.height )
                    .attr("href"   , () =>  `/api/v1/corpus/artifacts/entry/${util.corpusEntry()}/image/page/${widget.pageNum+1}`)
                ;
            })
        ;

        widget.setMouseHandlers([pageImageHandlers]);

        widget._tooltips = [];

        widget.labelRtree = rtree();
    }

    get tooltips() { return this._tooltips; }
    set tooltips(t) { this._tooltips = t; }

    updateTooltipHovers(hits) {
        this._tooltipHoversRx.next(hits);
    }

    widgetId() {
        return `page-image-widget-${this.pageNum}`;
    }

    selectWidgetElem(elemSelector) {
        return $(`#${this.widgetId()} ${elemSelector}`);
    }

    d3select() {
        return d3.select(this.svgSelector);
    }

    highlightSelections(selections) {
        let widget = this;

        widget.d3select().selectAll('.annotation-rect')
            .classed('annotation-selected', false);

        let filtered = _.filter(selections, s => s.pageNum == widget.pageNum);

        _.each(filtered , sel => {
            widget.d3select()
                .select(sel.selector)
                .classed('annotation-selected', true);
        });

    }

    printToInfobar(slot, label, value) {
        if (this.DEV_MODE) {
            this.infoBar.printToInfobar(slot, label, value);
        }
    }


    setMouseHandlers(handlers) {
        let widget = this;
        mhs.setMouseHandlers(widget, widget.frameId, handlers);
    }

    setGlyphData(glyphData) {
        this.glyphData = glyphData;
        this.glyphRtree.load(glyphData);
    }


    setAnnotationRegionData(regionDataPts) {
        this.annotationRegions = regionDataPts;
        this.labelRtree = rtree();
        this.labelRtree.load(regionDataPts);
        this.showAnnotations();
    }


    queryForGlyphs(queryBox) {
        return this.glyphRtree.search(queryBox);
    }

    queryForNearestGlyph(queryPt) {
        let hits = knn(this.glyphRtree, queryPt.x, queryPt.y, 1);
        return hits[0];
    }

    displayCharHoverReticles(userPt) {
        let widget = this;
        let queryBox = coords.boxCenteredAt(userPt, 10, 10);

        let hits = widget.glyphRtree.search(queryBox);

        widget.printToInfobar(1, `glyphs`, `${hits.length}`);

        let reticles = d3.selectAll(widget.svgSelector)
            .selectAll('.textloc')
            .data(hits, d => d.id);

        reticles.enter().append('rect')
            .classed('textloc', true)
            .call(d3x.initRect, d => d)
            .call(d3x.initStroke, 'blue', 1, 0.2)
            .call(d3x.initFill, 'blue', 0.5);

        reticles.exit().remove();


        widget.emitGlyphHoverPts(hits);
        // let textgridSvg = d3x.d3select.pageTextgridSvg(pageNum);
        // textview.showTexgridHoverReticles(textgridSvg, _.map(hits, h => h.gridDataPt));
    }

    displayLabelHovers(hoverPt) {
        let widget = this;
        let queryBox = coords.mk.fromLtwh(hoverPt.x, hoverPt.y, 1, 1);
        let hoveredLabels = widget.labelRtree.search(queryBox);
        widget.updateTooltipHovers(hoveredLabels);

    }


    showAnnotations() {
        let widget = this;

        widget.d3select()
            .selectAll('.annotation-rect')
            .remove();

        _.each(widget.annotationRegions, region => {
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

        d3.select(this.svgSelector).append('rect')
            .call(d3x.initRect, () => userSelection)
            .classed('label-selection-rect', true)
            .call(d3x.initStroke, 'blue', 1, 1.0)
            .call(d3x.initFill, 'yellow', 0.7)
            .transition().duration(200)
            .call(d3x.initRect, () => mbrSelection)
            .call(d3x.initFill, 'yellow', 0.3)
        ;

        let widget = this;
        return lbl.createHeaderLabelUI(mbrSelection, this.pageNum, this.containerId)
            .then(annotData => {
                d3.selectAll('.label-selection-rect').remove();
                return widget.serverExchange.createAnnotation(annotData);
            })
            .catch(() => {
                d3.selectAll('.label-selection-rect').remove();
            }) ;

    }


    emitGlyphPt(glyphPt) {
        // TODO make this subscribable so that text grid can sync on click

    }
    emitGlyphHoverPts(glyphPts) {
        // TODO make this subscribable so that text grid can sync on hover

    }
}


function pageImageHandlers(widget) {
    let handlers = {

        click: function(event) {

            let clickPt = coords.mkPoint.offsetFromJqEvent(event);
            let queryBox = coords.boxCenteredAt(clickPt, 2, 2);

            let hoveredLabels = widget.labelRtree.search(queryBox);
            if (hoveredLabels.length > 0) {
                widget.serverExchange.labelsClicked(hoveredLabels);
            } else {
                let nearestGlyph = widget.queryForNearestGlyph(clickPt);
                if (nearestGlyph !== undefined) {
                    // textview.syncScrollTextGridToImageClick(clickPt, nearestNeighbor.gridDataPt);
                    widget.emitGlyphPt(nearestGlyph);
                }
            }
        },


        mouseup: function() {
            widget.activeSelection = false;
        },

        mousedown: function(event) {
            if (eventHasLeftClick(event)) {
                widget.activeSelection = true;
            }
        },


        mousemove: function(event) {
            let userPt = coords.mkPoint.offsetFromJqEvent(event);
            let clientPt = coords.pointFloor(userPt);

            widget.printToInfobar(0, `x, y`, `${clientPt.x}x${clientPt.y}`);


            if (eventHasLeftClick(event) && widget.activeSelection) {
                widget.setMouseHandlers([]);
                awaitUserSelection(d3.select(widget.svgSelector), userPt)
                    .then(pointOrRect => {
                        widget.activeSelection = false;
                        widget.setMouseHandlers([pageImageHandlers]);

                        if (pointOrRect.rect) {
                            let r = pointOrRect.rect;
                            widget.selectedRegionRx.next(r);

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
