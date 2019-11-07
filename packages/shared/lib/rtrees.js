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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ydHJlZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFFQTtBQUVBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8vIGltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcbi8vIGltcG9ydCB7IEJCb3gsIG1rLCBta1BvaW50LCBQb2ludCB9IGZyb20gJy4vY29vcmQtc3lzJztcbi8vIGltcG9ydCAqIGFzIHJidXNoIGZyb20gJ3JidXNoJztcbi8vIGltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlscyc7XG5cblxuLy8gLyoqIHJldHVybiBtaW4tYm91bmRpbmcgcmVjdCBmb3IgcnRyZWUgc2VhcmNoIGhpdHMgKi9cbi8vIGV4cG9ydCBmdW5jdGlvbiBxdWVyeUhpdHNNQlIoaGl0czogQkJveFtdKTogQkJveCB8IHVuZGVmaW5lZCB7XG4vLyAgIGlmIChoaXRzLmxlbmd0aCA9PT0gMCApIHtcbi8vICAgICByZXR1cm4gdW5kZWZpbmVkO1xuLy8gICB9XG4vLyAgIGNvbnN0IG1pblggPSBfLm1pbihfLm1hcChoaXRzLCAnbWluWCcpKTtcbi8vICAgY29uc3QgbWF4WCA9IF8ubWF4KF8ubWFwKGhpdHMsICdtYXhYJykpO1xuLy8gICBjb25zdCBtaW5ZID0gXy5taW4oXy5tYXAoaGl0cywgJ21pblknKSk7XG4vLyAgIGNvbnN0IG1heFkgPSBfLm1heChfLm1hcChoaXRzLCAnbWF4WScpKTtcbi8vICAgY29uc3Qgd2lkdGggPSBtYXhYISAtIG1pblghO1xuLy8gICBjb25zdCBoZWlnaHQgPSBtYXhZISAtIG1pblkhO1xuXG4vLyAgIHJldHVybiBtay5mcm9tTHR3aChtaW5YISwgbWluWSEsIHdpZHRoLCBoZWlnaHQpO1xuXG4vLyB9XG5cbi8vIGV4cG9ydCBmdW5jdGlvbiBpbml0UGFnZUxhYmVsUlRyZWVzKHpvbmVzOiBab25lW10pOiBbbnVtYmVyLCByYnVzaC5SQnVzaDxCQm94Pl1bXSB7XG5cbi8vICAgY29uc3QgZGF0YVB0cyA9IF8uZmxhdE1hcCh6b25lcywgem9uZSA9PiB7XG4vLyAgICAgcmV0dXJuIF8ubWFwKHpvbmUucmVnaW9ucywgcmVnaW9uID0+IHtcbi8vICAgICAgIGNvbnN0IGRhdGEgPSByZWdpb24uYmJveDtcbi8vICAgICAgIGNvbnN0IHNlbGVjdG9yID0gYCNhbm4ke3pvbmUuem9uZUlkfV8ke3JlZ2lvbi5yZWdpb25JZH1gO1xuLy8gICAgICAgZGF0YS5pZCA9IHJlZ2lvbi5yZWdpb25JZDtcbi8vICAgICAgIGRhdGEucGFnZU51bSA9IHJlZ2lvbi5wYWdlTnVtO1xuLy8gICAgICAgZGF0YS5sYWJlbCA9IHpvbmUubGFiZWw7XG4vLyAgICAgICBkYXRhLnRpdGxlID0gem9uZS5sYWJlbDtcbi8vICAgICAgIGRhdGEuc2VsZWN0b3IgPSBzZWxlY3Rvcjtcbi8vICAgICAgIGRhdGEuem9uZUlkID0gem9uZS56b25lSWQ7XG4vLyAgICAgICByZXR1cm4gZGF0YTtcbi8vICAgICB9KTtcbi8vICAgfSk7XG5cblxuLy8gICBjb25zdCBncm91cHMgPSBfLmdyb3VwQnkoZGF0YVB0cywgcCA9PiBwLnBhZ2VOdW0pO1xuLy8gICBjb25zdCBwYWdlczogW251bWJlciwgcmJ1c2guUkJ1c2g8QkJveD5dW10gPSBfLm1hcChncm91cHMsIHBhZ2VHcm91cCA9PiB7XG4vLyAgICAgY29uc3QgcGFnZU51bTogbnVtYmVyID0gcGFnZUdyb3VwWzBdLnBhZ2VOdW07XG4vLyAgICAgY29uc3QgcGFnZVJ0cmVlOiByYnVzaC5SQnVzaDxCQm94PiA9IHJidXNoKCk7XG4vLyAgICAgcGFnZVJ0cmVlLmxvYWQocGFnZUdyb3VwKTtcbi8vICAgICByZXR1cm4gW3BhZ2VOdW0sIHBhZ2VSdHJlZV07XG4vLyAgIH0pO1xuLy8gICByZXR1cm4gcGFnZXM7XG4vLyB9XG5cblxuIl19