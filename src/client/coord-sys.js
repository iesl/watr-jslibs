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
  *    event page/client/screen/offset explanations:
  *       https://stackoverflow.com/questions/6073505/what-is-the-difference-between-screenx-y-clientx-y-and-pagex-y
  **/


export let coordSys = {
    unknown: Symbol('unknown'),
    screen: Symbol('screen'),
    div: Symbol('div'),
    pdfMedia: Symbol('pdf-media')
};

class Point {
    constructor (x, y, sys) {
        this.x = x;
        this.y = y;
        this._system = sys? sys : coordSys.unknown;
    }
}

export let mkPoint = {
    fromXy: (x, y, sys) => {
        return new Point(x, y, sys);
    },
    fromD3Mouse: (d3Mouse) => {
        return new Point(d3Mouse[0], d3Mouse[1]);
    }
};

/**
   General purpose bounding box data that meets the interface requirements
   for the various libraries in use
   */
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

    get topLeft()  { return mkPoint.fromXy(this.left,  this.top, this.system); }

    set system(s)  { this._system = s; }
    get system()   { return this._system; }

    get intRep () {
        return [
            Math.trunc(this.left * 100.0),
            Math.trunc(this.bottom * 100.0),
            Math.trunc(this.width * 100.0),
            Math.trunc(this.height * 100.0)
        ];
    }
}


export let mk = {
    fromLtwh: (l, t, w, h) => {
        return new BBox(l, t, w, h);
    },

    fromArray: (lbwh) => {
        let left   = lbwh[0] / 100.0;
        let bottom = lbwh[1] / 100.0;
        let width  = lbwh[2] / 100.0;
        let height = lbwh[3] / 100.0;
        let top    = bottom - height;
        return new BBox(
            left, top, width, height,
            coordSys.pdf
        );
    },
    fromXy12: (xy12) => {
        return new BBox(
            xy12.x1,
            xy12.y1,
            xy12.x2 - xy12.x1,
            xy12.y2 - xy12.y1,
            coordSys.unknown
        );
    }
};
