/**
 *
 */


import _ from 'lodash';

import * as Rx from 'rxjs';
import * as server from './serverApi';

export class ServerDataExchange {

    constructor () {
        this.selectionsRx = new Rx.Subject();
        this.currentSelections = [];
        this.allAnnotationsRx = new Rx.Subject();

    }

    init() {
        this.refetchAnnotations();
    }


    createAnnotation(annotData) {
        let self = this;
        server.createNewZone(annotData)
            .then(() => self.refetchAnnotations())
            .catch(() => {}) ;
    }

    deleteAnnotation(annotId) {
        let self = this;
        server
            .deleteZone(annotId)
            .then(() => self.setSelections([]))
            .then(() => self.refetchAnnotations())
        ;
    }

    setAnnotationText(annotId, gridTextJson) {
        let self = this;
        let postData = {
            SetText: {
                gridJson: gridTextJson
            }
        };

        return server.apiPost(server.apiUri(`labeling/zones/${annotId}`), postData)
            .then(() => self.refetchAnnotations())
        ;

    }

    refetchAnnotations() {
        let self = this;
        return server.getDocumentAnnotations()
            .then(annots => self.triggerAnnotationRx(annots)) ;
    }

    getSelectedAnnotationsRx() {
        return this.selectionsRx;
    }


    subscribeToPageUpdates(pageNum, cb) {
        return this.pageRegionRx.subscribe(cb);
    }

    subscribeToAllAnnotations(cb) {
        this.allAnnotationsRx.subscribe(cb);
    }

    setSelections(sels) {
        this.currentSelections = sels;
        this.selectionsRx.next(sels);
    }

    labelsClicked(clickedItems) {
        let nonintersectingItems = _.differenceBy(clickedItems,  this.currentSelections, s => s.id);
        this.setSelections(nonintersectingItems);
    }

    triggerAnnotationRx(annots) {
        this.allAnnotationsRx.next(annots);

        // rtrees.initPageLabelRTrees(annots);
        // d3.selectAll('.annotation-rect') .remove();
        // d3.selectAll('.glyph-zone-highlight') .remove();

        // _.each(annots, annot => {
        //     if (annot.glyphDefs !== null) {
        //         let glyphsLoci = _.flatMap(annot.glyphDefs.rows, r => r.loci);

        //         let gridDataPts = self.mapGlyphLociToGridDataPts(glyphsLoci);
        //         let gridDataByPage = _.groupBy(gridDataPts, p => p.page);
        //         _.each(gridDataByPage, pageGridData => {
        //             let pageNum = pageGridData[0].page;
        //             let textgridSvg = d3x.d3select.pageTextgridSvg(pageNum);

        //             textgridSvg
        //                 .selectAll(`.span${annot.annotId}`)
        //                 .data(pageGridData)
        //                 .enter()
        //                 .append('rect')
        //                 .call(d3x.initRect, d => d)
        //                 .call(d3x.initFill, 'cyan', 0.2)
        //                 .classed(`span${annot.annotId}`, true)
        //                 .classed('glyph-annot-highlight', true) ;

        //         });
        //     }

        //     _.each(annot.regions, region => {
        //         let svgPageSelector = `svg#page-image-${region.pageNum}`;

        //         d3.select(svgPageSelector)
        //             .selectAll(`#ann${annot.annotId}_${region.regionId}`)
        //             .data([region])
        //             .enter()
        //             .append('rect')
        //             .call(d3x.initRect, r => r.bbox)
        //             .call(d3x.initStroke, 'blue', 1, 0.8)
        //             .call(d3x.initFill, 'purple', 0.2)
        //             .attr('id', `ann${annot.annotId}_${region.regionId}`)
        //             .classed('annotation-rect', true)
        //             .classed(`ann${annot.annotId}`, true)
        //         ;

        //     });


        // });
    }

     mapGlyphLociToGridDataPts(glyphsLoci) {
         let dataPts = glyphsLoci;

        // let dataPts = _.map(glyphsLoci, (charLocus) => {
        //     let charDef = charLocus.g ? charLocus.g[0] : charLocus.i;
        //     let pageNum = charDef[1];
        //     let charBBox = charDef[2];
        //     let pdfTextBox = charBBox? coords.mk.fromArray(charBBox) : undefined;

        //     let pageRTree = shared.pageImageRTrees[pageNum] ;
        //     let glyphDataPts = pageRTree.search(pdfTextBox);
        //     let gridDataPt = glyphDataPts[0].gridDataPt;
        //     return gridDataPt;
        // });

        return dataPts;
    }

}
