/* global require beforeEach  fixture describe it watr */

let ReflowWidget = require('./../src/client/ReflowWidget.js');

describe('ReflowWidget', function() {


    beforeEach(function() {
        fixture.base = 'test';
        fixture.cleanup();
        let fixtures = fixture.load('graphpaper.test.html');
        // let htmlSnippet = fixtures[0];
        // console.log('html', htmlSnippet);
    });

    it('should render', function() {
        let textGridConstruction = new watr.textgrid.TextGridConstructor();
        let textGrid = textGridConstruction.getTestTextGrid();
        let labelSchema = textGridConstruction.getTestLabelSchema();
        let reflowWidget = new ReflowWidget.ReflowWidget('page-textgrids', textGrid, labelSchema);

        reflowWidget.init();

        // let rtreeApi = new rtreeapi.RTreeApi();
        // let TGLW = watr.textgrid.TextGridLabelWidget;
        // let GraphPaper = watr.utils.GraphPaper;
        // let ProxyGraphPaper = watr.utils.ProxyGraphPaper;
        // let drawingApi = new gp.DrawingApi('gp-canvas', 20);
        // let graphPaper = new ProxyGraphPaper(500, 500, drawingApi);
        // // textGridConstruction.drawTextGridToGraphPaper(textGrid, labelSchema, graphPaper);
        // textGridConstruction.writeTextGrid(textGrid, labelSchema, graphPaper, rtreeApi);
        // let rtree = rtreeApi.rtree;
        // rtree.all().forEach(d => {
        //     console.log('d', d.region, d.region.isHeading());
        // });
        // let queryBox = coords.mk.fromLtwh(clickPt.x, clickPt.y, 1, 1);
        // rtree.search()

    });
});
