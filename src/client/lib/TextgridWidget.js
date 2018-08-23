/**
 *
 **/

/* global require */

import * as _ from 'lodash';
import * as d3x from './d3-extras';
import {t, $id} from './jstags.js';
import * as coords from './coord-sys';
import * as mhs from './MouseHandlerSets';
import * as rtrees from  './rtrees';
import {getName} from  './index';

import * as rx from 'rxjs';
import * as rxop from 'rxjs/operators';

let rtree = require('rbush');

console.log(getName('krunal'));

export class TextgridListWidget {

    constructor (containerId, textGridDefs, serverExchange) {

        this.containerId = containerId;
        this.textGrids = textGridDefs;

        this.serverExchange = serverExchange;

    }

    getRootNode() {

        let listId = this.pageTextWidgetContainerId;

        let node =
            t.div(`.page-text-list-widget`, [
                t.div(`#page-texts-status .statusbar`),
                t.div('#page-texts .page-texts', [
                    t.div(`.page-text-widgets`, [
                        t.div(`#${listId} .list`),
                    ])
                ])
            ]);

    }

}
//

export class TextgridWidget {

    constructor (containerId, textgrid, gridNum) {
        this.containerId = containerId;
        this.gridNum = gridNum;
        this.textgrid = textgrid;

        this.frameId  = `textgrid-frame-${gridNum}`;
        this.canvasId = `textgrid-canvas-${gridNum}`;
        this.svgId    = `textgrid-svg-${gridNum}`;

        this.options = {
            TextGridLineHeight:  20,
            TextGridOriginPt: coords.mkPoint.fromXy(20, 20),
        };
    }

    // create an observable of hovered glyphs

    init() {
        let widget = this;

        let options = widget.options;

        let computeGridHeight = (grid) => {
            return (grid.rows.length * options.TextGridLineHeight) + options.TextGridOriginPt.y + 10;
        };

        let fixedTextgridWidth = 900;
        let textgrid = widget.textgrid;
        let gridNum = widget.gridNum;
        let gridHeight = computeGridHeight(textgrid);
        let gridNodes =
            t.div(`.textgrid #${widget.frameId}`, {
                style: `width: 900; height:${gridHeight}`}, [
                    t.canvas(`.textgrid #${widget.canvasId}`, {
                        page: gridNum,
                        width: fixedTextgridWidth,
                        height: gridHeight
                    })
                ]) ;

        $id(widget.containerId).append(gridNodes);

        // d3.select(frameIdSelector)
        d3x.d3$id(widget.frameId)
            .append('svg').classed('textgrid', true)
            .attr('id', widget.svgId)
            .attr('page', gridNum)
            .attr('width', fixedTextgridWidth)
            .attr('height', gridHeight)
        ;

        widget.textgridRTree = rtree();
        widget.initHoverReticles();

        widget.setMouseHandlers([
            defaultMouseHandlers
        ]);

        let context2d = $id(widget.canvasId)[0].getContext('2d');
        context2d.font = `normal normal normal ${options.TextGridLineHeight}px/normal Times New Roman`;
        let gridTextOrigin = coords.mkPoint.fromXy(20, 20);
        let gridData = rtrees.initGridData([textgrid], [context2d], gridTextOrigin);
        console.log('gridData', gridData);

        widget.textgridRTree.load(gridData[0]);

    }

    selectSvg() {
        return d3x.d3$id(this.svgId);
    }

    setMouseHandlers(handlers) {
        mhs.setMouseHandlers(this, this.frameId, handlers);
    }

    initHoverReticles() {
        let reticleGroup = this.selectSvg()
            .append('g')
            .classed('reticles', true);

        reticleGroup
            .append('rect')
            .classed('query-reticle', true)
            .call(d3x.initStroke, 'blue', 1, 0.6)
            .call(d3x.initFill, 'blue', 0.3)
        ;

        return reticleGroup;
    }

    showGlyphHoverReticles(queryBox, queryHits) {

        this.selectSvg().select('g.reticles')
            .select('rect.query-reticle')
            .call(d3x.initRect, () => queryBox) ;

        let d3$hitReticles =
            this.selectSvg().select('g.reticles')
            .selectAll('rect.hit-reticle')
            .data(queryHits, d => d.id)
        ;

        d3$hitReticles .enter()
            .append('rect')
            .classed('hit-reticle', true)
            .attr('id', d => d.id)
            .call(d3x.initRect, d => d)
            .call(d3x.initStroke, 'green', 1, 0.5)
            .call(d3x.initFill, 'yellow', 0.5)
        ;

        d3$hitReticles.exit()
            .remove() ;
    }

}


function defaultMouseHandlers(widget) {
    return {
        mousedown: function() {
        },

        mousemove: function(event) {
            let userPt = coords.mkPoint.offsetFromJqEvent(event);

            let textgridRTree = widget.textgridRTree;

            let queryWidth = 2;
            // let queryBoxHeight = widget.options.TextGridLineHeight * 2;
            let queryBoxHeight = 2;
            let queryLeft = userPt.x-queryWidth;
            let queryTop = userPt.y-queryBoxHeight;
            let queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

            let hits = textgridRTree.search(queryBox);

            let neighborHits = _.sortBy(
                _.filter(hits, hit => hit.glyphDataPt != undefined),
                hit => [hit.bottom, hit.left]
            );

            widget.showGlyphHoverReticles(queryBox, neighborHits);
        },

        mouseup: function() {
        }
    };
}
