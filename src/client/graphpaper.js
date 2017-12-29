/**
 *
 **/

/* global require */

export class DrawingApi {
    constructor (canvasId) {
        this.canvasId = canvasId;
        this.gridCanvas = document.getElementById(this.canvasId);
        this.context = this.gridCanvas.getContext('2d');
        this.context.font = this.textFont;
        this._textFont = '20px mono';
    }

    get textFont     () { return this._textFont; }
    get textHeight   () { return this._textHeight; }

    drawChar(cell, char) {
        console.log('cell', cell, char);
        this.context.fillStyle = 'black';
        this.context.fillText(char, cell.x, cell.y);

    }

    drawBox(box, border) {
        this.context.rect(box.x, box.y, 20, 20);
        this.context.stroke();
    }
}
// trait DrawingApi extends js.Object {
//     def drawChar(cell: GridCell, char: Char): Unit
//     def drawBox(box: Box, borderChars: BorderChars = BorderLineStyle.SingleWidth): Unit
//     def applyBgColor(x: Int, y: Int, color: Color): Unit
//     def applyColor(x: Int, y: Int, color: Color): Unit
//     def gradientHorizontal(box: Box): Unit
// }
