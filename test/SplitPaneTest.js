
/* global require beforeEach  fixture describe it $ */


describe('Split Pane functionality', function() {


    beforeEach(function() {
        fixture.base = 'test';
        fixture.cleanup();
        fixture.load('SplitPane.Test.html');

    });



    it('should work', function() {
        let spu = require('./../src/client/lib/splitpane-utils.js');
        let jst = require('./../src/client/lib/jstags.js');
        let splitPaneRootId = spu.createSplitPaneRoot("#main");
        const t = jst.t;
        const htm = jst.htm;

        let {topPaneId, bottomPaneId} =
            spu.splitHorizontal(jst.$id(splitPaneRootId), {fixedTop: 40});

        // let Shared = require('./../src/client/lib/shared-state.js');
        $('.split-pane-component').each(function () {
            console.log('this', $(this));

        });

        let buttons = {
            hsplit: htm.iconButton('minus-square-o'),
            vsplit: htm.iconButton('columns')
        };

        buttons.hsplit.on('click', function() {
            let mySplitPane = spu.splitPaneFor(this);

        });


        let {leftPaneId, rightPaneId} =
            spu.splitVertical(jst.$id(bottomPaneId), {fixedLeft: 200});

        jst.$id(leftPaneId).append(
            t.div('Some Text')
        );
        jst.$id(rightPaneId).append(
            t.div('Right panel text')
        );
        $('div.split-pane').splitPane();

    });

});


