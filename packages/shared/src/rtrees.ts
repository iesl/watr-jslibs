
// import * as _ from 'lodash';
// import { BBox, mk, mkPoint, Point } from './coord-sys';
// import * as rbush from 'rbush';
// import * as util from './utils';


// /** return min-bounding rect for rtree search hits */
// export function queryHitsMBR(hits: BBox[]): BBox | undefined {
//   if (hits.length === 0 ) {
//     return undefined;
//   }
//   const minX = _.min(_.map(hits, 'minX'));
//   const maxX = _.max(_.map(hits, 'maxX'));
//   const minY = _.min(_.map(hits, 'minY'));
//   const maxY = _.max(_.map(hits, 'maxY'));
//   const width = maxX! - minX!;
//   const height = maxY! - minY!;

//   return mk.fromLtwh(minX!, minY!, width, height);

// }

// export function initPageLabelRTrees(zones: Zone[]): [number, rbush.RBush<BBox>][] {

//   const dataPts = _.flatMap(zones, zone => {
//     return _.map(zone.regions, region => {
//       const data = region.bbox;
//       const selector = `#ann${zone.zoneId}_${region.regionId}`;
//       data.id = region.regionId;
//       data.pageNum = region.pageNum;
//       data.label = zone.label;
//       data.title = zone.label;
//       data.selector = selector;
//       data.zoneId = zone.zoneId;
//       return data;
//     });
//   });


//   const groups = _.groupBy(dataPts, p => p.pageNum);

//   const pages: [number, rbush.RBush<BBox>][] = _.map(groups, pageGroup => {
//     const pageNum: number = pageGroup[0].pageNum;
//     const pageRtree: rbush.RBush<BBox> = rbush();
//     pageRtree.load(pageGroup);
//     return [pageNum, pageRtree];
//   });
//   return pages;
// }


// export function initGridData(textgrid: TextGrid, canvasContext: CanvasRenderingContext2D, gridTextOrigin: Point, gridTextHeight: number): BBox[] {

//   return _.map(textgrids, (textgrid, gridNum) => {
//     const idGen = util.newIdGenerator();

//     const context;
//     if (canvasContexts !== undefined) {
//       context = canvasContexts[gridNum];
//     } else {
//       context = {
//         measureText: () => 10,
//         fillText: () => {}
//       };
//     }

//     if (gridTextHeight === undefined) {
//       gridTextHeight = 20;
//     }
//     if (gridTextOrigin === undefined) {
//       gridTextOrigin = mkPoint.fromXy(0, 0);
//     }

//     const gridRowsDataPts = _.map(textgrid.rows, (gridRow, rowNum) => {

//       const y = gridTextOrigin.y + (rowNum * gridTextHeight);
//       const x = gridTextOrigin.x;
//       const text = gridRow.text;
//       const currLeft = x;
//       const gridDataPts = _.map(text.split(''), (ch, chi) => {
//         const chWidth = context.measureText(ch).width;
//         const charDef = gridRow.loci[chi];

//         const gridDataPt = mk.fromLtwh(
//           currLeft, y-gridTextHeight, chWidth, gridTextHeight
//         );

//         gridDataPt.id = idGen();
//         gridDataPt.gridRow = gridRow;
//         gridDataPt.row = rowNum;
//         gridDataPt.col = chi;
//         gridDataPt.char = ch;
//         gridDataPt.page = gridNum;
//         gridDataPt.locus = charDef;
//         charDef.gridDataPt = gridDataPt;

//         const isGlyphData = charDef.g !== undefined;
//         if (isGlyphData) {
//           const charBBox = charDef.g[0][2];
//           const glyphDataPt = mk.fromArray(charBBox);
//           glyphDataPt.id = gridDataPt.id;
//           glyphDataPt.gridDataPt = gridDataPt;
//           glyphDataPt.page = gridNum;
//           glyphDataPt.locus = charDef;
//           gridDataPt.glyphDataPt = glyphDataPt;
//         }

//         currLeft += chWidth;

//         return gridDataPt;
//       });

//       try {
//         context.fillText(text, x, y);
//       }
//       catch (error) {
//         console.log('error', error);
//       }

//       return gridDataPts;
//     });

//     return _.flatten(gridRowsDataPts);
//   });

// }
