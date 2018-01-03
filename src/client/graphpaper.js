/**
 *
 **/

/* global require _ */

import * as coords from './coord-sys.js';

export class DrawingApi {
    constructor (canvasId, fontSize) {
        this.canvasId = canvasId;
        this.gridCanvas = document.getElementById(this.canvasId);
        this.fontSize = fontSize;
        this.fontProps = {
            style: 'normal',
            weight: 'normal',
            size: '20'
        };
        this.contextProps = {
            globalAlpha            : 1.0,
            strokeStyle            : 'blue',
            fillStyle              : 'blue',
            // lineWidth                :  ctx.lineWidth;
            // lineCap                  :  ctx.lineCap;
            // lineJoin                 :  ctx.lineJoin;
            // miterLimit               :  ctx.miterLimit;
            // lineDashOffset           :  ctx.lineDashOffset;
            // shadowOffsetX            :  ctx.shadowOffsetX;
            // shadowOffsetY            :  ctx.shadowOffsetY;
            // shadowBlur               :  ctx.shadowBlur;
            // shadowColor              :  ctx.shadowColor;
            // globalCompositeOperation :  ctx.globalCompositeOperation;
            textAlign                : 'bottom'
            // textBaseline             :  ctx.textBaseline;
            // direction                :  ctx.direction;
            // imageSmoothingEnabled    :  ctx.imageSmoothingEnabled;

        };
        this.makeFontFace({size: fontSize});
        let context = this.initContext();
        this._cellWidth = context.measureText('A').width;
        this._cellHeight = this.fontSize+4;
    }

    initContext() {
        let context = this.gridCanvas.getContext('2d');
        context.font = this.fontFace;
        Object.assign(context, this.contextProps);
        return context;
    }

    //  |------------+--------------+-------------+-----------+-------------+-------------|
    //  | font-style | font-variant | font-weight | font-size | line-height | font-family |
    //  |------------+--------------+-------------+-----------+-------------+-------------|
    //  |            | small-caps   | normal      | px        |             |             |
    //  | italic     |              | bold        |           |             |             |
    //  | normal     |              | lighter     |           |             |             |
    //  | oblique    |              | bolder      |           |             |             |
    //  |            |              | 100-900     |           |             |             |
    //  |------------+--------------+-------------+-----------+-------------+-------------|
    makeFontFace() {
        let p = this.fontProps;
        this.fontFace = `${p.style} normal ${p.weight} ${p.size}px Courier New`;
    }

    set contextProp(p) {
        Object.assign(this.contextProps, p);
    }

    set alpha(w) {
        this.contextProps.globalAlpha = w;
    }

    set fontWeight(w) {
        this.fontProps.weight = w;
        this.makeFontFace();
    }
    set fontStyle(w) {
        this.fontProps.style = w;
        this.makeFontFace();
    }

    get textFont     () { return this._textFont; }
    get textHeight   () { return this._textHeight; }
    get cellWidth    () { return this._cellWidth; }
    get cellHeight   () { return this._cellHeight; }

    get context2d    () {
        return this.initContext();
    }

    cellToBounds(cell) {
        let x = cell.x * this.cellWidth;
        let y = cell.y * this.cellHeight;
        let w = this.cellWidth;
        let h = this.cellHeight;
        return coords.mk.fromLtwh(x, y, w, h);
    }

    boxToBounds(box) {
        let bb = box.toLTBounds();
        let x = bb.left*this.cellWidth;
        let y = bb.top* this.cellHeight;
        let w = bb.width * this.cellWidth;
        let h = bb.height * this.cellHeight;
        return coords.mk.fromLtwh(x, y, w, h);
    }

    drawString(cell, str) {
        _.each(_.range(0, str.length), i => {
            let shifted = cell.shiftOrigin(i, 0);
            this.drawChar(shifted.origin, str.charAt(i));
        });
    }

    drawChar(cell, char) {
        let {left, top, width, height} = this.cellToBounds(cell);
        this.context2d.fillStyle = 'black';
        this.context2d.fillText(char, left, top+height);

    }

    drawBox(box, border) {
        let {left, top, width, height} = this.boxToBounds(box);
        this.context2d.rect(left, top, width, height);
        this.context2d.stroke();
    }

    fillBox(box, modCtx) {
        let currProps = this.contextProps;
        let ctx = this.context2d;
        // console.log('fillBox', ctx);
        if (modCtx !== undefined) {
            modCtx(this.context2d);
        }
        let {left, top, width, height} = this.boxToBounds(box);
        // console.log('fillBox(2)', ctx);
        ctx.fillRect(left, top, width, height);
        this.contextProps = currProps;
    }

    applyBgColor(x, y, color) {
        console.log('applyBgColor');
    }

    applyColor(x, y, color) {
        console.log('applyColor');

    }
    gradientHorizontal(box) {
        console.log('gradientHorizontal');
    }
}
