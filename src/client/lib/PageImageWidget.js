/**
 *
 **/

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
import * as Rx from 'rxjs';
import * as knn from 'rbush-knn';
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
        this.pageBounds = coords.mk.fromArray(pageGeometry);
        this.svgId = `page-image-svg-${pageNum}`;
        this.svgSelector = `#${this.svgId}`;
        this.frameId = `page-image-div-${pageNum}`;
        this.frameSelector = `#${this.frameId}`;
        this.containerId = containerId;
        this.glyphRtree = rtree();

        this._tooltipHoversRx = new Rx.Subject();
        this._tooltips = new ToolTips(this.frameSelector, this._tooltipHoversRx);
        this.infoBar = new Infobar(this.containerId, 2, 3);
    }


    updateTooltipHovers(hits) {
        this._tooltipHoversRx.next(hits);
    }

    init() {
        let widget = this;

        let infobarElem = this.infoBar.getElem();

        let widgetNode =
            t.div(`.page-image-widget #page-image-widget-${widget.pageNum}`, [
                t.div(`.status-top`),
                infobarElem,
                t.div(`.left-gutter`),
                t.div(`.widgetcontent #page-image-content-${widget.pageNum}`),
                t.div(`.right-gutter`),
                t.div(`.status-bottom`)
            ]);

        $id(widget.containerId).append(widgetNode);

        d3.select(`#page-image-content-${widget.pageNum}`)
            .append('div').classed('page-image', true)
            .datum(widget.pageBounds)
            .attr('id', (d, i) => `page-image-div-${i}`)
            .attr('width', d => d.x + d.width)
            .attr('height', d => d.y + d.height )
            .append('svg').classed('page-image', true)
            .datum(widget.pageBounds)
            .attr('id', (d, i) => `page-image-svg-${i}`)
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
                    .attr("href"   , () =>  `/image/page/${widget.pageNum + 1}` )
                ;
                // .attr("href"   , d =>  '/api/v1/corpus/artifacts/entry/'+util.corpusEntry()+'/image/page/'+d.page )
            })
        ;

        widget.setMouseHandlers([pageImageHandlers]);

        widget._tooltips = [];
        widget.currentSelections = [];
        widget._selectionsRx = new Rx.Subject();
        widget.setupSelectionHighlighting();
    }

    get tooltips() { return this._tooltips; }
    set tooltips(t) { this._tooltips = t; }
    get selectionsRx() { return this._selectionsRx; }

    d3select() {
        return d3.select(this.svgSelector);
    }

    setSelections(sels) {

        this.currentSelections = sels;
        this.selectionsRx.next(sels);
    }

    setupSelectionHighlighting() {
        let widget = this;
        this.selectionsRx.subscribe(currSelects => {


            widget.d3select().selectAll('.annotation-rect')
                .classed('annotation-selected', false);

            _.each(currSelects , sel => {
                widget.d3select()
                    .select(sel.selector)
                    .classed('annotation-selected', true);
            });

        });
    }

    printToInfobar(slot, label, value) {
        this.infoBar.printToInfobar(slot, label, value);
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

        widget.printToInfobar(4, `glyphs`, `${hits.length}`);

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

        d3.select(this.svgSelector).append('rect')
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

    toggleLabelSelection(clickedItems) {
        let nonintersectingItems = _.differenceBy(clickedItems,  this.currentSelections, s => s.id);
        this.setSelections(nonintersectingItems);
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
                widget.toggleLabelSelection(hoveredLabels);
            } else {
                let nearestGlyph = widget.queryForNearestGlyph(clickPt);
                if (nearestGlyph !== undefined) {
                    // textview.syncScrollTextGridToImageClick(clickPt, nearestNeighbor.gridDataPt);
                    widget.emitGlyphPt(nearestGlyph);
                }
            }
        },


        mousedown: function() {
            //  - maybe begin selection handling
        },


        mousemove: function(event) {
            let userPt = coords.mkPoint.offsetFromJqEvent(event);
            let clientPt = coords.pointFloor(userPt);

            widget.printToInfobar(0, `x, y`, `${clientPt.x}x${clientPt.y}`);


            if (eventHasLeftClick(event)) {
                widget.setMouseHandlers([]);
                awaitUserSelection(d3.select(widget.svgSelector), userPt)
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
