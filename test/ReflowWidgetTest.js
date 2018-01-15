/* global require beforeEach  fixture describe it watr */


describe('ReflowWidget', function() {


    beforeEach(function() {
        fixture.base = 'test';
        fixture.cleanup();
        let fixtures = fixture.load('ReflowWidget.Test.html');
        // let htmlSnippet = fixtures[0];
        // console.log('html', htmlSnippet);
    });

    it('should render', function() {
        let ReflowWidget = require('./../src/client/lib/ReflowWidget.js');

        let Shared = require('./../src/client/lib/shared-state.js');

        Shared.shared.DEV_MODE = true;

        Shared.initGlobalMouseTracking();
        let textGridConstruction = new watr.textgrid.TextGridConstructor();
        // let textGrid = textGridConstruction.getTestTextGridLarge();
        let textGrid = textGridConstruction.getTestTextGrid();
        let labelSchema = textGridConstruction.getTestLabelSchema();
        let reflowWidget = new ReflowWidget.ReflowWidget('page-textgrids', textGrid, labelSchema);


        reflowWidget.init();
    });
});
