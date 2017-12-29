
/* global require beforeEach afterEach fixture expect describe it watr */

let gp = require('./../src/client/graphpaper.js');

describe('GraphPaper', function() {


    beforeEach(function() {
        fixture.base = 'test';
        fixture.cleanup();
        let fixtures = fixture.load('graphpaper.test.html');
        // let htmlSnippet = fixtures[0];
        // console.log('html', htmlSnippet);
    });

    it('hello world', function() {
        let textGridConstruction = new watr.textgrid.TextGridConstruction();
        let TGLW = watr.textgrid.TextGridLabelWidget;
        let GraphPaper = watr.utils.GraphPaper;
        let ProxyGraphPaper = watr.utils.ProxyGraphPaper;
        let textGrid = textGridConstruction.getTestTextGrid();
        let labelSchema = textGridConstruction.getTestLabelSchema();

        let drawingApi = new gp.DrawingApi('gp-canvas');
        drawingApi.drawChar({x: 10, y: 10}, 'z');
        drawingApi.drawBox({x: 20, y: 20}, 'z');

        let graphPaper = new ProxyGraphPaper(100, 100, drawingApi);
        console.log('graphPaper', graphPaper);
        textGridConstruction.drawTextGridToGraphPaper(textGrid, labelSchema, graphPaper);

        // let labelTree = TGLW.textGridToLabelTree(textGrid);
        // let gridRegions = TGLW.labelTreeToGridRegions(labelTree, labelSchema, 2, 3);



    });
});
