
/**
  * Define and translate between the various coordinate systems used:
  *
  *
  *    PDF Media coords - (PDF-extracted page geometry and char bounding boxes)
  *    Single-Page Image coords - coords within the svg containing page image, scaled version of Media coords
  *    Screen event coords - e.g., where a user clicks on a page
  *    Client Pages View  - Absolute coords within the vertical scroll list of page svgs/images (regardless of scroll position)
  *    Client Text View  - coords within the vertical scroll list of page text blocks  (regardless of scroll position)
  *
  *
  **/

import * as $ from 'jquery';
import {globals} from './globals';

// track the mouse location
globals.currentMousePos = { x: -1, y: -1 };

$(document).mousemove(function(event) {
    globals.currentMousePos.x = event.pageX;
    globals.currentMousePos.y = event.pageY;
});


export let coordSys = {
    unknown: Symbol('unknown'),
    screen: Symbol('screen'),
    div: Symbol('div'),
    pdf: Symbol('pdf')
};

class BBox {
    constructor (l, t, w, h, sys) {
        this.left = l;
        this.top = t;
        this.width = w;
        this.height = h;
        this._system = sys? sys : coordSys.unknown;
    }

    get minX() { return this.left; }
    get minY() { return this.top; }
    get maxX() { return this.left + this.width; }
    get maxY() { return this.top + this.height; }

    get x1() { return this.left; }
    get x2() { return this.left + this.width; }
    get y1() { return this.top; }
    get y2() { return this.top + this.height; }

    get bottom() { return this.top + this.height; }
    get right()  { return this.left + this.width; }

    set system(s)  { this._system = s; }
    get system()   { return this._system; }
}


export let mk = {
    fromLtwh: (l, t, w, h) => {
        return new BBox(l, t, w, h);
    },
    fromArray: (ltwh) => {
        return new BBox(
            ltwh[0] / 100.0,
            ltwh[1] / 100.0,
            ltwh[2] / 100.0,
            ltwh[3] / 100.0
        );
    },
    fromXy12: (xy12) => {
        return new BBox(
            xy12.x1,
            xy12.y1,
            xy12.x2 - xy12.x1,
            xy12.y2 - xy12.y1,
        );
    }
};



