
import {
  initGridData,
  gridDataToGlyphData
} from '../text-graph';
// import * as fs from 'file-system';
const fs = require('file-system');

import {
  coords,
  GridTypes,
  Point,
} from "sharedLib";

// import textGrid00 from '../../../../dev-data/textgrids/textgrid-00.json';
const textGrid00File = './dev-data/textgrids/textgrid-00.json';

const textGrid00: string = fs.readFileSync(textGrid00File, { encoding: 'utf8' });

function pp(a: any): string {
  return JSON.stringify(a, undefined, 2);
}
describe("initGridData function", () => {


  it("should produce both PDF and gridview data", () => {
    // console.log("resp", textGrid00);
    const textWidth = (s: String) => 10;
    const textHeight = 20;
    const origin = new Point(10, 10, coords.CoordSys.GraphUnits);
    const grids: GridTypes.Grid = GridTypes.Convert.toGrid(textGrid00);
    const pageNum = 0;
    const grid = grids.pages[0].textgrid;
    const gridData = initGridData(grid, pageNum, textWidth, origin, textHeight);
    const glyphData = gridDataToGlyphData(gridData);
    const g03 = gridData.slice(0, 2);
    const gl03 = glyphData.slice(0, 2);
    console.log("gridData", pp(g03));
    console.log("glyphData", pp(gl03));

  });

});
