
import { initGridData } from '../text-graph';
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

describe("initGridData function", () => {


  it("should produce both PDF and gridview data", () => {
    // console.log("resp", textGrid00);
    const textWidth = (s: String) => 22;
    const textHeight = 15;
    const origin = new Point(10, 10, coords.CoordSys.GraphUnits);
    const grids: GridTypes.Grid = GridTypes.Convert.toGrid(textGrid00);
    const pageNum = 0;
    const grid = grids.pages[0].textgrid;
    const gridData = initGridData(grid, pageNum, textWidth, origin, textHeight);
    const g03 = gridData.slice(0, 3);
    console.log("gridData", g03);

  });

});
