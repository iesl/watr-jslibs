/**
 *
 **/

/* global require */

import * as coords from './coord-sys.js';

export class DrawingApi {
    constructor (canvasId, fontSize) {
        this.canvasId = canvasId;
        this.gridCanvas = document.getElementById(this.canvasId);
        this.fontSize = fontSize;
        this.initContext();
    }

    initContext() {
        let context = this.gridCanvas.getContext('2d');
        let font = `${this.fontSize}px mono`;
        context.font = font;
        context.textBaseline="bottom";
        this._cellWidth = context.measureText('A').width;
        this._cellHeight = this.fontSize+4;
        return context;
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
        let h = bb.height* this.cellHeight;
        return coords.mk.fromLtwh(x, y, w, h);
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
