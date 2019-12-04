
import _ from 'lodash';
import { BBox, mk } from './coord-sys';


/** return min-bounding rect for rtree search hits */
export function queryHitsMBR(hits: BBox[]): BBox | undefined {
  if (hits.length === 0 ) {
    return undefined;
  }
  const minX = _.min(_.map(hits, 'minX'));
  const maxX = _.max(_.map(hits, 'maxX'));
  const minY = _.min(_.map(hits, 'minY'));
  const maxY = _.max(_.map(hits, 'maxY'));
  const width = maxX! - minX!;
  const height = maxY! - minY!;

  return mk.fromLtwh(minX!, minY!, width, height);

}

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


